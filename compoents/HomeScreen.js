import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AddPostScreen from '../compoents/screens/AddPostScreen';
import MessagesScreen from '../compoents/screens/MessagesScreen';
import ProfileScreen from '../compoents/screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Simple Home Page Content inside the HomeScreen itself
const HomeContent = () => {
  return (
    <View style={styles.container}>
      <Text>Welcome to the Home Page!</Text>
    </View>
  );
};

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Add Post') {
            iconName = 'add-circle';
          } else if (route.name === 'Messages') {
            iconName = 'chatbubbles';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0288D1',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeContent} />
      <Tab.Screen name="Add Post" component={AddPostScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
