import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Input, Button, Text, CheckBox } from 'react-native-elements';
import { auth } from '../compoents/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from 'firebase/compat/app'; // For persistence setting

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load stored credentials and check if "Remember Me" is active on page load
  useEffect(() => {
    const checkRememberedUser = async () => {
      try {
        const storedRememberMe = await AsyncStorage.getItem('rememberMe');
        const storedEmail = await AsyncStorage.getItem('email');
        const storedPassword = await AsyncStorage.getItem('password');

        if (storedRememberMe === 'true' && storedEmail && storedPassword) {
          // Automatically log the user in and navigate to Home
          setLoading(true);
          await auth.signInWithEmailAndPassword(storedEmail, storedPassword);
          navigation.replace('Home');
        }
      } catch (error) {
        console.error("Error checking stored credentials", error);
      } finally {
        setLoading(false);  // Stop loading indicator
      }
    };

    checkRememberedUser();  // Check stored credentials when component mounts
  }, [navigation]);

  // Handle the sign-in process and optionally remember credentials
  const handleSignIn = async () => {
    setLoading(true);  // Show loading while signing in

    try {
      await auth.signInWithEmailAndPassword(email, password);
      
      // Store credentials if "Remember Me" is checked
      if (rememberMe) {
        await rememberUserCredentials();
      } else {
        await forgetUserCredentials();
      }

      navigation.replace('Home');  // Navigate to home screen after successful login
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);  // Hide loading after sign-in attempt
    }
  };

  // Store email and password if "Remember Me" is checked
  const rememberUserCredentials = async () => {
    try {
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('password', password); // Store password securely
      await AsyncStorage.setItem('rememberMe', 'true');
    } catch (error) {
      console.log("Error storing credentials", error);
    }
  };

  // Clear stored credentials if "Remember Me" is unchecked
  const forgetUserCredentials = async () => {
    try {
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('password');
      await AsyncStorage.setItem('rememberMe', 'false');
    } catch (error) {
      console.log("Error clearing credentials", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0288D1" />
      </View>
    );
  }

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

      <CheckBox
        title="Remember Me"
        checked={rememberMe}
        onPress={() => setRememberMe(!rememberMe)}
        containerStyle={styles.checkbox}
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
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginTop: -10,
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
