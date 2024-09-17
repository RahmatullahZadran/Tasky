import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { auth } from '../compoents/firebase';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        navigation.navigate('Home');
      })
      .catch(error => alert(error.message));
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Sign Up</Text>
      
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
        title="Create Account"
        onPress={handleSignUp}
        buttonStyle={styles.button}
      />

      <Button
        title="Already have an account? Sign In"
        type="clear"
        onPress={() => navigation.navigate('Auth')}
        titleStyle={styles.signInButton}
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
  signInButton: {
    color: '#0288D1',
    marginTop: 20,
  },
});

export default SignUpScreen;
