import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity, Dimensions } from 'react-native';
import { firestore, auth } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = ({ route, navigation }) => {
  const { chatId, selectedUserId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageLimit, setMessageLimit] = useState(10); // Start with 10 messages
  const [isLoadingMore, setIsLoadingMore] = useState(false); // State to manage loading more messages
  const flatListRef = useRef(null);
  const currentUserId = auth.currentUser?.uid;
  const screenWidth = Dimensions.get('window').width;

  // Fetch the username of the person being chatted with
  useEffect(() => {
    const fetchSelectedUser = async () => {
      try {
        const userDoc = await firestore.collection('users').doc(selectedUserId).get();
        if (userDoc.exists) {
          setSelectedUser(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching selected user data:', error);
      }
    };
    fetchSelectedUser();
  }, [selectedUserId]);

  // Fetch chat messages in real-time from Firestore with a message limit
  useEffect(() => {
    const unsubscribe = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc') // Fetch in descending order
      .limit(messageLimit) // Limit messages based on messageLimit state
      .onSnapshot((snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(fetchedMessages); // Reverse to display in ascending order
      });

    return unsubscribe;
  }, [chatId, messageLimit]);

  // Load more messages when the user scrolls up
  const handleLoadMoreMessages = () => {
    if (!isLoadingMore) {
      setIsLoadingMore(true);
      setMessageLimit(prevLimit => prevLimit + 10);
      setIsLoadingMore(false);
    }
  };

  // Scroll to bottom after sending a message
  
  // Function to handle sending a new message
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') {
      return;
    }
  
    try {
      // Send the new message
      await firestore.collection('chats').doc(chatId).collection('messages').add({
        senderId: currentUserId,
        text: newMessage,
        createdAt: new Date(),
      });
  
      // Update the chat's lastOpened time for the current user after sending a message
      await firestore.collection('users').doc(currentUserId)
        .collection('chatData')
        .doc(chatId)
        .set({ lastOpened: new Date() }, { merge: true });
  
      setNewMessage('');
      // scrollToBottom(); // Scroll to bottom after sending a message
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };
  

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {/* Chat header with back button and user info */}
      <View style={[styles.header, { width: screenWidth }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {selectedUser ? selectedUser.username : 'Loading...'}
        </Text>
      </View>

      {/* Display chat messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMoreMessages} // Load more when the user scrolls up
        onEndReachedThreshold={0.1}
        inverted={true} // To have the latest messages at the bottom
        renderItem={({ item }) => (
          <View style={item.senderId === currentUserId ? styles.myMessage : styles.otherMessage}>
            <Text>{item.text}</Text>
          </View>
        )}
        // onContentSizeChange={() => scrollToBottom()} // Scroll to the bottom on load
      />

      {/* Input and Send Icon */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <Ionicons name="send" size={28} color="#0288D1" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 30,
    backgroundColor: '#f8f8f8',
    height: 50,
    marginBottom: 10,
    marginTop: 20,
    width: '100%',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    flex: 1,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 20,
    
    borderRadius: 10,
    marginVertical: 5,
    
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
    padding: 20,
    borderRadius: 10,
    marginVertical: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
});

export default ChatScreen;
