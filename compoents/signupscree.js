import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { auth, firestore } from '../compoents/firebase';  // Ensure firestore is imported

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');  // New username field
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');  // New confirm password field
  const [loading, setLoading] = useState(false);  // To show loading indicator
  const [errorMessage, setErrorMessage] = useState('');  // Error message state

  // Function to check if the username is already taken
  const checkIfUsernameExists = async (username) => {
    const usernameQuery = await firestore.collection('users').where('username', '==', username).get();
    return !usernameQuery.empty;  // Returns true if username exists
  };

  // Handle the sign-up process
  const handleSignUp = async () => {
    setErrorMessage('');  // Reset error message

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (username.trim() === '') {
      setErrorMessage('Username cannot be empty');
      return;
    }

    setLoading(true);  // Show loading indicator

    // Check if the username already exists
    const usernameExists = await checkIfUsernameExists(username);
    if (usernameExists) {
      setErrorMessage('Username is already taken');
      setLoading(false);
      return;
    }

    // If username is unique, continue with Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        const { user } = userCredential;

        // Save the username and email in Firestore
        await firestore.collection('users').doc(user.uid).set({
          username: username,
          email: email,
        });

        navigation.navigate('Home');
      })
      .catch(error => {
        setLoading(false);  // Hide loading indicator
        if (error.code === 'auth/email-already-in-use') {
          setErrorMessage('The email address is already in use.');
        } else {
          setErrorMessage(error.message);
        }
      });
  };

  return (
    <View style={styles.container}>
      {/* Updated the title style to be bold */}
      <Text style={styles.title}>Sign Up</Text> 
      
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={styles.input}
      />

      <Input
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        containerStyle={styles.input}
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.input}
      />

      <Input
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        containerStyle={styles.input}
      />

      {/* Display error message if it exists */}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      <Button
        title="Create Account"
        onPress={handleSignUp}
        loading={loading}  // Show loading when signing up
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
    fontSize: 24,  // Set the font size
    fontWeight: 'bold',  // Make the title bold
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
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default SignUpScreen;
