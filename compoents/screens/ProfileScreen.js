import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { auth, firestore } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-elements';

const preAddedPictures = [
  { id: 1, uri: 'https://firebasestorage.googleapis.com/v0/b/tasky-68f96.appspot.com/o/profile.png?alt=media&token=668a8cad-4ab3-4da3-815d-e923f46fb75f' },
  { id: 2, uri: 'https://example.com/profile2.jpg' },
  { id: 3, uri: 'https://example.com/profile3.jpg' },
  { id: 4, uri: 'https://example.com/profile4.jpg' },
];

const ProfileScreen = ({ navigation }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState('');
  const [quote, setQuote] = useState('');
  const [editingQuote, setEditingQuote] = useState(false); // State to handle editing the quote
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPictureOptions, setShowPictureOptions] = useState(false); // State to show or hide picture options

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchProfileData = async () => {
      const user = auth.currentUser;
      if (user) {
        console.log("Current user UID:", user.uid);
        try {
          const userRef = firestore.collection('users').doc(user.uid);
          const userDoc = await userRef.get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            setUsername(userData.username);
            setQuote(userData.quote || '');
            setProfilePic(userData.profilePic || null);

            const postsSnapshot = await userRef.collection('posts').get();
            const userPosts = postsSnapshot.docs.map(doc => doc.data());
            setPosts(userPosts);
          } else {
            console.error('User document does not exist!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.error('No authenticated user found');
      }
      setLoading(false);
    };

    fetchProfileData();
  }, []);

  // Function to update profile picture in Firestore when a pre-added picture is selected
  const updateUserProfilePicture = async (uri) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = firestore.collection('users').doc(user.uid);
        await userRef.update({ profilePic: uri });
        setProfilePic(uri); // Update the state to reflect the selected picture
        setShowPictureOptions(false); // Hide the picture options after selection
        Alert.alert('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  // Function to handle quote update in Firestore
  const updateQuote = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = firestore.collection('users').doc(user.uid);
        await userRef.update({ quote });
        setEditingQuote(false); // Stop editing after saving the new quote
        Alert.alert('Quote updated successfully!');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  // Handle log out
  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('uid');
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('password');
      await AsyncStorage.removeItem('rememberMe');

      await auth.signOut();
      navigation.replace('Auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Picture Section */}
      <View style={styles.profileSection}>
        <Image
          source={profilePic
            ? { uri: profilePic }  // If profilePic is set, use it
            : { uri: 'https://firebasestorage.googleapis.com/v0/b/tasky-68f96.appspot.com/o/profile.png?alt=media&token=668a8cad-4ab3-4da3-815d-e923f46fb75f' }  // Fallback image from Firebase
          }
          style={styles.profilePic}
        />
        <Button
          title={showPictureOptions ? "Cancel" : "Change Profile Picture"}
          onPress={() => setShowPictureOptions(!showPictureOptions)}  // Toggle picture options
        />

        {/* Show pre-added picture options only if the button is pressed */}
        {showPictureOptions && (
          <View style={styles.pictureOptions}>
            {preAddedPictures.map(picture => (
              <TouchableOpacity key={picture.id} onPress={() => updateUserProfilePicture(picture.uri)}>
                <Image source={{ uri: picture.uri }} style={styles.smallPic} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Editable Quote Section */}
      <View style={styles.quoteSection}>
        {editingQuote ? (
          <TextInput
            style={styles.quoteInput}
            value={quote}
            onChangeText={setQuote}
            onBlur={updateQuote} // Save quote when the user clicks away
            autoFocus={true} // Automatically focus the input field
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingQuote(true)}>
            <Text style={styles.quote}>{quote || 'Tap to add a quote'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Username and Log Out Row */}
      <View style={styles.infoRow}>
        <Text style={styles.username}>{username}</Text>
        <Button title="Log Out" onPress={handleSignOut} buttonStyle={styles.logoutButton} />
      </View>

      {/* User Posts */}
      <Text style={styles.label}>Your Posts</Text>
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <View key={index} style={styles.postItem}>
            <Text>{post.content}</Text>
          </View>
        ))
      ) : (
        <Text>No posts yet.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 10,  // Decreased margin
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  pictureOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  smallPic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  quoteSection: {
    marginVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
  },
  quoteInput: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    width: '100%',
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  postItem: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginTop: 10,
  },
});

export default ProfileScreen;
