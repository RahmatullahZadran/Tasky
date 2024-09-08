// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './compoents/AuthScreen';
import HomeScreen from './compoents/HomeScreen';
import TaskScreen from './compoents/TaskScreen';
import firebase from './compoents/firebase';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Task" component={TaskScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
