import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { firestore, auth } from '../firebase';
import { Button } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

const MessagesScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const currentUserId = auth.currentUser?.uid;
  const [usersMap, setUsersMap] = useState({});
  const [limit, setLimit] = useState(20); // Add limit to avoid fetching too many users/chats

  // Enable Firestore offline persistence
  useEffect(() => {
    firestore.enablePersistence().catch(err => {
      console.error('Failed to enable Firestore persistence:', err);
    });
  }, []);

  // Fetch all users with a limit
  const fetchUsers = async () => {
    try {
      const usersCollection = await firestore.collection('users').limit(limit).get();
      const usersList = usersCollection.docs
        .filter(doc => doc.id !== currentUserId) // Filter out the current user from the list
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      const userMap = usersList.reduce((acc, user) => {
        acc[user.id] = user.username; // Map userId to username
        return acc;
      }, {});
      setUsers(usersList);
      setUsersMap(userMap); // Save the map for faster username lookup
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch ongoing chats for the current user with a limit
  const fetchChats = async () => {
    try {
      const snapshot = await firestore
        .collection('chats')
        .where('participants', 'array-contains', currentUserId)
        .limit(limit)
        .get();

      const chatsList = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const chatData = doc.data();
          const otherParticipantId = chatData.participants.find(id => id !== currentUserId); // Get the other participant
          const otherParticipantUsername = usersMap[otherParticipantId] || 'Unknown User'; // Use the userMap for fast lookup

          // Get the last message timestamp
          const lastMessageSnapshot = await firestore.collection('chats').doc(doc.id)
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

          const lastMessage = lastMessageSnapshot.docs[0]?.data();
          const lastMessageTime = lastMessage?.createdAt?.toDate();

          // Check if the user has opened the chat and seen the last message
          const userChatData = await firestore.collection('users').doc(currentUserId)
            .collection('chatData')
            .doc(doc.id)
            .get();

          const lastOpenedTime = userChatData.exists ? userChatData.data().lastOpened?.toDate() : null;

          // Determine if there are new messages
          const hasNewMessages = lastMessageTime && (!lastOpenedTime || lastMessageTime > lastOpenedTime);

          return {
            id: doc.id,
            ...chatData,
            otherParticipantUsername, // Include the other participant's username
            hasNewMessages, // Add flag for new messages
            lastMessageTime, // Include last message time for sorting
          };
        })
      );

      // Sort chats by latest message time, newest at the top
      const sortedChats = chatsList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      setChats(sortedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  // UseFocusEffect to refresh the chats and users when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await fetchUsers();
        await fetchChats();
      };
      
      fetchData();
    }, [currentUserId, usersMap])
  );

  // Filter users based on search input
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

  // Navigate to or create a chat when clicking the "Message" button
  const handleMessage = async (selectedUserId) => {
    try {
      // Check if a chat already exists with exactly these two participants
      const chatQuery = await firestore
        .collection('chats')
        .where('participants', 'array-contains', currentUserId) // Find chats where currentUserId is a participant
        .get();

      let chatId;
      let chatFound = false;

      // Check if the chat also contains the selected user
      chatQuery.forEach((doc) => {
        const participants = doc.data().participants;
        if (participants.includes(selectedUserId) && participants.includes(currentUserId)) {
          chatId = doc.id;
          chatFound = true;
        }
      });

      // If no chat is found, create a new one
      if (!chatFound) {
        const newChatRef = await firestore.collection('chats').add({
          participants: [currentUserId, selectedUserId],
          createdAt: new Date(),
        });
        chatId = newChatRef.id;
      }

      // Update the chat's lastOpened time for the current user
      await firestore.collection('users').doc(currentUserId)
        .collection('chatData')
        .doc(chatId)
        .set({ lastOpened: new Date() }, { merge: true });

      // Navigate to the chat screen
      navigation.navigate('Chat', { chatId, selectedUserId });

    } catch (error) {
      console.error('Error creating or navigating to chat:', error);
    }
  };

  // Navigate to user's profile
  const handleViewProfile = (selectedUserId) => {
    navigation.navigate('ViewProfile', { userId: selectedUserId });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a user"
        value={searchText}
        onChangeText={setSearchText}
      />

      {/* User List (only show when there is search input) */}
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

      {/* Ongoing Chats Section (hidden when searching) */}
      {searchText.length === 0 && (
        <View style={styles.chatsContainer}>
          <Text style={styles.label}>Your Chats</Text>
          {chats.length > 0 ? (
            <FlatList
              data={chats}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleMessage(item.participants.find(id => id !== currentUserId))} // Navigate to chat with selected user
                  style={styles.chatItem}
                >
                  <View style={styles.chatRow}>
                    <Text style={styles.chatTitle}>{item.otherParticipantUsername}</Text>
                    {item.hasNewMessages && <View style={styles.redDot} />}  
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
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
});

export default MessagesScreen;
