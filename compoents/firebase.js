import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';  // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-i8NIf4G3ON5GGchmjaCU2yEeggJVZX0",
  authDomain: "tasky-68f96.firebaseapp.com",
  projectId: "tasky-68f96",
  storageBucket: "tasky-68f96.appspot.com",
  messagingSenderId: "209311057479",
  appId: "1:209311057479:web:5b7f053158b67c8a1a1362",
  measurementId: "G-R2C6JWN8SK"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

// Export Firebase services for use in other parts of your app
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();  // Export storage for uploading files
export const googleProvider = new firebase.auth.GoogleAuthProvider();

// Helper function to fetch the current user's profile data
export const fetchUserProfile = async (uid) => {
  try {
    const userRef = firestore.collection('users').doc(uid);
    const doc = await userRef.get();
    if (doc.exists) {
      return doc.data();
    } else {
      console.error("No such user document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Helper function to update user profile data in Firestore
export const updateUserProfile = async (uid, profileData) => {
  try {
    const userRef = firestore.collection('users').doc(uid);
    await userRef.update(profileData);
    console.log("User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Helper function to upload a profile picture to Firebase Storage
export const uploadProfilePicture = async (uid, uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = storage.ref().child(`profilePictures/${uid}`);
    const snapshot = await storageRef.put(blob);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

