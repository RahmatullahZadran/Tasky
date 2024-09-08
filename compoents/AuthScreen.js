// screens/AuthScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { auth } from '../compoents/firebase';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        navigation.navigate('Home');
      })
      .catch(error => alert(error.message));
  };

  const handleSignIn = () => {
    auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        navigation.navigate('Home');
      })
      .catch(error => alert(error.message));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Sign In" onPress={handleSignIn} />
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

export default AuthScreen;
