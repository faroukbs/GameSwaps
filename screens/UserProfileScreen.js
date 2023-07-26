import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, updateProfile } from "firebase/auth";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { firestore } from "../firebaseConfig";

const UserProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [picture, setPicture] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const storage = getStorage();

  useEffect(() => {
    // Fetch user data from Firestore when the component mounts
    fetchUserData();
  }, []);
  const fetchUserData = async () => {
    try {
      const authInstance = getAuth();
      const currentUser = authInstance.currentUser;

      if (currentUser) {
        // Get the user data from Firestore based on the UID
        const userCollectionRef = collection(firestore, "users");
        const userDocRef = doc(userCollectionRef, currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUser(userData);
          setImageUrl(userData.picture); // Set the user's profile picture URL
        } else {
          console.log("User data not found.");
        }
      }
    } catch (error) {
      console.log("Error fetching user data: ", error);
    } finally {
      // Stop the refreshing indicator after the data is fetched
      setRefreshing(false);
    }
  };

  const generateFileName = () => {
    const timestamp = new Date().getTime();
    return `image_${timestamp}`;
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        const { assets } = result;
        const selectedAsset = assets[0]; // only pick one image
        const { uri } = selectedAsset;
        setPicture(uri); // Set the profile picture URI to the 'picture' state
      }
    } catch (error) {
      console.log("Error uploading image: ", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (picture) {
        // Show the loading indicator when the update starts
        setUploading(true);
        const imageName = generateFileName();
        const storageRef = ref(storage, `userProfileImage/${imageName}`);
        const response = await fetch(picture);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob);

        const downloadUrl = await getDownloadURL(storageRef);
        setImageUrl(downloadUrl); // Update the imageUrl state with the new download URL
        setPicture(null); // Clear the 'picture' state since the image has been uploaded

        // Delete the old profile picture if it exists
        if (user && user.photoUrl) {
          const oldPictureRef = ref(
            storage,
            `userProfileImage/${user.picture}`
          ); // Remove the URL part
          await deleteObject(oldPictureRef);
        }

        // Update Firestore field "picture" with the new profile picture URL
        const authInstance = getAuth();
        const currentUser = authInstance.currentUser;
        if (currentUser) {
          // Update the user data in Firestore with the new picture URL
          const userCollectionRef = collection(firestore, "users");
          const userDocRef = doc(userCollectionRef, currentUser.uid);
          await updateDoc(userDocRef, {
            picture: downloadUrl, // Update Firestore field "picture"
          });

          console.log("Profile updated successfully!");
          // Optionally, you can show a success message using a modal or Toast here
        }
      }

      // ... (previous code for updating profile data)
    } catch (error) {
      console.log("Error updating profile: ", error);
    } finally {
      // Hide the loading indicator after the update process is complete
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const authInstance = getAuth();
      await authInstance.signOut();
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <TouchableOpacity
        onPress={handleImageUpload}
        activeOpacity={0.7}
        style={styles.profilePictureTouchable}
      >
        {picture ? (
          <Image source={{ uri: picture }} style={styles.profilePicture} />
        ) : (
          <Image source={{ uri: imageUrl }} style={styles.profilePicture} />
        )}
      </TouchableOpacity>
      <Text style={styles.username}>{user.username}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoLabel}>Name:</Text>
        <Text style={styles.userInfo}>{user.name}</Text>
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoLabel}>Last Name:</Text>
        <Text style={styles.userInfo}>{user.lastName}</Text>
      </View>
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoLabel}>Phone Number:</Text>
        <Text style={styles.userInfo}>{user.phoneNumber}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profilePictureTouchable: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#fff",
    backgroundColor: "#E8E8E8",
    marginBottom: 20,
    alignSelf: "center",
  },
  profilePicture: {
    width: "100%",
    height: "100%",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
  },
  email: {
    fontSize: 16,
    color: "#808080",
    marginBottom: 20,
    alignSelf: "center",
  },
  button: {
    width: 200,
    height: 40,
    backgroundColor: "#007bff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  userInfo: {
    fontSize: 16,
    color: "#808080",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007bff",
  },
});

export default UserProfileScreen;
