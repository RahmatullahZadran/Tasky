import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { firestore } from '../firebase';
import { Button } from 'react-native-elements';

const preAddedPictures = [
  { id: 1, uri: 'https://firebasestorage.googleapis.com/v0/b/tasky-68f96.appspot.com/o/profile.png?alt=media&token=668a8cad-4ab3-4da3-815d-e923f46fb75f' },
  { id: 2, uri: 'https://example.com/profile2.jpg' },
  { id: 3, uri: 'https://example.com/profile3.jpg' },
  { id: 4, uri: 'https://example.com/profile4.jpg' },
];

const ViewProfileScreen = ({ navigation, route }) => {
  const { userId } = route.params;
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState('');
  const [quote, setQuote] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPictureOptions, setShowPictureOptions] = useState(false);

  // Fetch the viewed user's profile data from Firestore
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userRef = firestore.collection('users').doc(userId);
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
      setLoading(false);
    };

    fetchProfileData();
  }, [userId]);

  // Function to navigate to the chat screen to message the user
  const handleMessage = async () => {
    try {
      navigation.navigate('Chat', { selectedUserId: userId });
    } catch (error) {
      console.error('Error navigating to chat:', error);
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
            ? { uri: profilePic }
            : { uri: 'https://firebasestorage.googleapis.com/v0/b/tasky-68f96.appspot.com/o/profile.png?alt=media&token=668a8cad-4ab3-4da3-815d-e923f46fb75f' }  // Fallback image
          }
          style={styles.profilePic}
        />

        {showPictureOptions && (
          <View style={styles.pictureOptions}>
            {preAddedPictures.map(picture => (
              <TouchableOpacity key={picture.id} onPress={() => setProfilePic(picture.uri)}>
                <Image source={{ uri: picture.uri }} style={styles.smallPic} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

 
      <View style={styles.quoteSection}>
        <Text style={styles.quote}>{quote || 'No quote available'}</Text>
      </View>

      {/* Username and Message Button in the same row */}
      <View style={styles.infoRow}>
        <Text style={styles.username}>{username}</Text> 
        <Button title="Message" onPress={handleMessage} buttonStyle={styles.messageButton} /> 
      </View>

      <Text style={styles.label}>Posts</Text>
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
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messageButton: {
    backgroundColor: '#0288D1',
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

export default ViewProfileScreen;
