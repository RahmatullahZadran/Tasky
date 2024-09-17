import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { auth } from '../compoents/firebase';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        navigation.navigate('Home');
      })
      .catch(error => alert(error.message));
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Sign In</Text>
      
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={styles.input}
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.input}
      />

      <Button
        title="Sign In"
        onPress={handleSignIn}
        buttonStyle={styles.button}
      />

      <Button
        title="Don't have an account? Sign Up"
        type="clear"
        onPress={() => navigation.navigate('SignUp')}
        titleStyle={styles.signUpButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0288D1',
    marginTop: 10,
  },
  signUpButton: {
    color: '#0288D1',
    marginTop: 20,
  },
});

export default AuthScreen;
