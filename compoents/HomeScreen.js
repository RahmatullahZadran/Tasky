// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { firestore, auth } from '../compoents/firebase';

const HomeScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const unsubscribe = firestore
        .collection('tasks')
        .where('userId', '==', user.uid)
        .onSnapshot(querySnapshot => {
          const tasks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTasks(tasks);
        });
      return unsubscribe;
    }
  }, [user]);

  const handleTaskPress = async (id) => {
    try {
      await firestore.collection('tasks').doc(id).update({ status: 'done' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignOut = () => {
    auth.signOut().then(() => {
      navigation.navigate('Auth');
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.task, { backgroundColor: item.status === 'done' ? 'green' : 'red' }]}
            onPress={() => handleTaskPress(item.id)}
          >
            <Text style={styles.taskText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Add Task" onPress={() => navigation.navigate('Task')} />
      <Button title="Sign Out" onPress={handleSignOut} />
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
  task: {
    padding: 15,
    marginVertical: 10,
    width: '90%',
    borderRadius: 5,
  },
  taskText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HomeScreen;
