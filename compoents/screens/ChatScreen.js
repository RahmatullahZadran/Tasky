import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, KeyboardAvoidingView } from 'react-native';
import { firestore, auth } from '../firebase'; // Ensure correct Firebase imports

const ChatScreen = ({ route }) => {
  const { chatId, selectedUserId } = route.params; // Retrieve chatId and selectedUserId from params
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = auth.currentUser?.uid;

  // Fetch chat messages in real-time from Firestore
  useEffect(() => {
    const unsubscribe = firestore
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot((snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(fetchedMessages);
      });

    return unsubscribe; // Clean up the listener on unmount
  }, [chatId]);

  // Function to handle sending a new message
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') {
      // Avoid sending empty messages
      return;
    }

    try {
      // Add the message to Firestore under the chat's messages collection
      await firestore.collection('chats').doc(chatId).collection('messages').add({
        senderId: currentUserId,
        text: newMessage,
        createdAt: new Date(), // Add a timestamp
      });

      // Clear the message input after sending
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {/* Display chat messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={item.senderId === currentUserId ? styles.myMessage : styles.otherMessage}>
            <Text>{item.text}</Text>
          </View>
        )}
      />

      {/* Input and Send Button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
    padding: 10,
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
  },
});

export default ChatScreen;
