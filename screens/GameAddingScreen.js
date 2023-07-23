import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { firestore } from "../firebaseConfig";
import MultiSelect from "react-native-multiple-select";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useNavigation } from "@react-navigation/native";

const storage = getStorage();

const GameAddingScreen = () => {
  const [gameName, setGameName] = useState("");
  const [selectedGameTypes, setSelectedGameTypes] = useState([]);
  const [gameDescription, setGameDescription] = useState("");
  const [gameTypes, setGameTypes] = useState([]);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const showLoginPrompt = () => {
    Alert.alert(
      "Login Required",
      "You must be logged in to add a game.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Login",
          onPress: handleLoginPrompt,
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    // Check if the user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        showLoginPrompt();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchGameTypes();
  }, []);

  const handleLoginPrompt = () => {
    navigation.navigate("LoginScreen");
  };

  const fetchGameTypes = async () => {
    try {
      const gameTypesCollectionRef = collection(firestore, "type");
      const gameTypesSnapshot = await getDocs(gameTypesCollectionRef);
      const doc = gameTypesSnapshot.docs[0];
      const names = doc.data().name;
      setGameTypes(names);
    } catch (error) {
      console.log("Error fetching game types: ", error);
    }
  };

  const handleAddGame = async () => {
    try {
      if (!user) {
        showLoginPrompt();
        return;
      }

      const gameData = {
        name: gameName,
        types: selectedGameTypes,
        description: gameDescription,
        imageUrl: imageUrl,
        userId: user.uid, 
      };
      const docRef = await addDoc(collection(firestore, "games"), gameData);

      setGameName("");
      setSelectedGameTypes([]);
      setGameDescription("");
      setImage(null);
      setImageUrl(null);

      console.log("Game added successfully!");

      // Request push notification permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { granted } = await Notifications.requestPermissionsAsync();
        if (!granted) {
          console.log("Push notification permission not granted.");
          return;
        }
      }

      // Get the user's Expo push token
      let expoPushToken;
      if (Platform.OS === "android") {
        expoPushToken = (await Notifications.getDevicePushTokenAsync()).data;
      } else {
        expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
      }

      // Send the push notification using Expo's push token
      const notificationTitle = "New Game Added!";
      const notificationBody = `${gameName} has been added to the games collection.`;
      await sendPushNotification(
        expoPushToken,
        notificationTitle,
        notificationBody
      );
    } catch (error) {
      console.log("Error adding game: ", error);
    }
  };

  const sendPushNotification = async (expoPushToken, title, body) => {
    try {
      // Send the push notification using Expo's push token
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
        },
        trigger: null, // Send the notification immediately.
        to: expoPushToken,
      });

      console.log("Push notification tab3thet");
    } catch (error) {
      console.log("Error sending push notification: ", error);
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.cancelled) {
        const { uri } = result;
        setImage(uri);
        await uploadImage(uri);
      }
    } catch (error) {
      console.log("Error uploading image: ", error);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const imageName = generateFileName();
      const storageRef = ref(storage, `games/${imageName}`);
      const response = await fetch(uri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);

      const downloadUrl = await getDownloadURL(storageRef);
      setImageUrl(downloadUrl);
      console.log("Image uploaded successfully!");

      console.log("Download URL: ", downloadUrl);
    } catch (error) {
      console.log("Error uploading image: ", error);
    }
  };

  const generateFileName = () => {
    const timestamp = new Date().getTime();
    return `image_${timestamp}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Add Game</Text>

        <TextInput
          style={styles.input}
          placeholder="Game Name"
          onChangeText={(text) => setGameName(text)}
          value={gameName}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Game Types</Text>
          <MultiSelect
            items={gameTypes.map((name, index) => ({
              id: index.toString(),
              name,
            }))}
            uniqueKey="id"
            onSelectedItemsChange={(items) => setSelectedGameTypes(items)}
            selectedItems={selectedGameTypes}
            selectText="Select Game Types"
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#333"
            selectedItemTextColor="#333"
            selectedItemIconColor="#007bff"
            itemTextColor="#000"
            displayKey="name"
            searchInputStyle={styles.searchInput}
            submitButtonColor="#007bff"
            submitButtonText="Submit"
            styleMainWrapper={styles.picker}
            styleDropdownMenuSubsection={styles.pickerDropdownMenuSubsection}
            styleTextDropdownSelected={styles.pickerTextDropdownSelected}
            styleDropdownMenu={styles.pickerDropdownMenu}
          />
        </View>

        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Game Description"
          onChangeText={(text) => setGameDescription(text)}
          value={gameDescription}
          multiline
        />

        <View style={styles.imageContainer}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={handleImageUpload}
          >
            <Text style={styles.imageUploadButtonText}>Upload Image</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddGame}>
          <Text style={styles.addButtonLabel}>Add Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  imageUploadButton: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  imageUploadButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    color: "#333",
  },
  pickerContainer: {
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  pickerDropdownMenuSubsection: {
    backgroundColor: "#fff",
  },
  pickerTextDropdownSelected: {
    color: "#333",
  },
  pickerDropdownMenu: {
    marginTop: 1,
  },
  searchInput: {
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default GameAddingScreen;
