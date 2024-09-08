// screens/TaskScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { firestore, auth } from '../compoents/firebase';

const TaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const user = auth.currentUser;

  const handleAddTask = async () => {
    try {
      await firestore.collection('tasks').add({
        title,
        status: 'pending',
        userId: user.uid,
      });
      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
      />
      <Button title="Add Task" onPress={handleAddTask} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    borderRadius: 5,
  },
});

export default TaskScreen;
