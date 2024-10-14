import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { firestore, auth } from '../firebase';
import { Button } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const MessagesScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const currentUserId = auth.currentUser?.uid;

  // Memoize the usersMap for better performance
  const usersMap = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.id] = user.username;
      return acc;
    }, {});
  }, [users]);

  const fetchUsers = async () => {
    try {
      const usersCollection = await firestore.collection('users').get();
      const usersList = usersCollection.docs
        .filter(doc => doc.id !== currentUserId)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchChats = async () => {
    try {
      // Fetch chats and sort based on the last message's timestamp
      const snapshot = await firestore
        .collection('chats')
        .where('participants', 'array-contains', currentUserId)
        .get();

      const chatsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        otherParticipantId: doc.data().participants.find(id => id !== currentUserId),
      }));

      // Fetch all last messages and chat metadata in a single read
      const lastMessagesPromises = chatsList.map(chat =>
        firestore.collection('chats').doc(chat.id).collection('messages')
          .orderBy('createdAt', 'desc').limit(1).get()
      );

      const chatDataPromises = chatsList.map(chat =>
        firestore.collection('users').doc(currentUserId)
          .collection('chatData').doc(chat.id).get()
      );

      const lastMessages = await Promise.all(lastMessagesPromises);
      const chatData = await Promise.all(chatDataPromises);

      const enrichedChats = chatsList.map((chat, index) => {
        const lastMessage = lastMessages[index].docs[0]?.data();
        const lastMessageTime = lastMessage?.createdAt?.toDate();
        const userChatData = chatData[index].data();
        const lastOpenedTime = userChatData?.lastOpened?.toDate();

        const hasNewMessages = lastMessageTime && (!lastOpenedTime || lastMessageTime > lastOpenedTime);
        return {
          ...chat,
          otherParticipantUsername: usersMap[chat.otherParticipantId] || 'Unknown User',
          lastMessageTime,
          hasNewMessages,
        };
      });

      // Sort chats by last message time
      setChats(enrichedChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime));
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await fetchUsers();
        await fetchChats();
      };

      fetchData();
    }, [currentUserId, usersMap])
  );

  useEffect(() => {
    if (searchText === '') {
      setFilteredUsers([]);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().startsWith(searchText.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchText, users]);

  const handleMessage = async (selectedUserId) => {
    try {
      const chatQuery = await firestore
        .collection('chats')
        .where('participants', 'array-contains', currentUserId)
        .get();

      let chatId;
      chatQuery.forEach((doc) => {
        const participants = doc.data().participants;
        if (participants.includes(selectedUserId)) {
          chatId = doc.id;
        }
      });

      if (!chatId) {
        const newChatRef = await firestore.collection('chats').add({
          participants: [currentUserId, selectedUserId],
          createdAt: new Date(),
        });
        chatId = newChatRef.id;
      }

      await firestore.collection('users').doc(currentUserId)
        .collection('chatData').doc(chatId)
        .set({ lastOpened: new Date() }, { merge: true });

      navigation.navigate('Chat', { chatId, selectedUserId });
    } catch (error) {
      console.error('Error creating or navigating to chat:', error);
    }
  };

  const handleViewProfile = (selectedUserId) => {
    navigation.navigate('ViewProfile', { userId: selectedUserId });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a user"
        value={searchText}
        onChangeText={setSearchText}
      />

      {searchText.length > 0 && (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.userContainer}>
              <Text style={styles.username}>{item.username}</Text>
              <View style={styles.buttonContainer}>
                <Button
                  title="Message"
                  onPress={() => handleMessage(item.id)}
                  buttonStyle={styles.messageButton}
                />
                <Button
                  title="View Profile"
                  onPress={() => handleViewProfile(item.id)}
                  buttonStyle={styles.profileButton}
                />
              </View>
            </View>
          )}
        />
      )}

      {searchText.length === 0 && (
        <View style={styles.chatsContainer}>
          <Text style={styles.label}>Your Chats</Text>
          {chats.length > 0 ? (
            <FlatList
              data={chats}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleMessage(item.otherParticipantId)}
                  style={styles.chatItem}
                >
                  <View style={styles.chatRow}>
                    <Text style={styles.chatTitle}>{item.otherParticipantUsername}</Text>
                    {item.hasNewMessages && (
                      <Icon name="envelope" size={20} color="red" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text>No ongoing chats yet.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  messageButton: {
    backgroundColor: '#0288D1',
    marginRight: 10,
  },
  profileButton: {
    backgroundColor: '#4CAF50',
  },
  chatsContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chatItem: {
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  chatTitle: {
    fontSize: 16,
    color: '#333',
  },
  chatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default MessagesScreen;
