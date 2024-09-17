import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './compoents/AuthScreen';
import HomeScreen from './compoents/HomeScreen';
import TaskScreen from './compoents/TaskScreen';
import SignUpScreen from './compoents/signupscree';
import firebase from './compoents/firebase';
import ChatScreen from './compoents/screens/ChatScreen';
import ViewProfileScreen from './compoents/screens/ViewProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
     <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} /> 
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Task" component={TaskScreen} />
        <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
