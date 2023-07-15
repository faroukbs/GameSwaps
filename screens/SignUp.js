import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
  ScrollView,
  Alert,
  Linking,
  Image,
} from "react-native";
import { primaryColor, inputColor, buttonColor, buttonTextColor } from "../color";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation } from "@react-navigation/native";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, collection } from "firebase/firestore";
import { firestore } from "../firebaseConfig";

const SignupScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [interests, setInterests] = useState([]);
  const [picture, setPicture] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleSignup = async () => {
    try {
      const authInstance = getAuth();
      const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
      const user = userCredential.user;
      console.log("Registration successful!", user.uid);

      await sendVerificationEmail(user);

      // Save user data to Firestore
      const usersCollectionRef = collection(firestore, "users"); // Reference to the "users" collection
      const userDocRef = doc(usersCollectionRef, username); // Reference to the document for the user
      await setDoc(userDocRef, {
        username,
        email,
        name,
        lastName,
        phoneNumber,
        location,
        birthdate,
        interests,
        picture,
      });

      console.log("User data saved to Firestore successfully!");

      Alert.alert(
        "Success",
        "Registration successful! Please check your email to verify your account.",
        [
          {
            text: "OK",
            onPress: () => console.log('object'),
          },
        ]
      );
    } catch (error) {
      console.log("Registration failed!", error);
      // Handle the error, display an error message, etc.
    }
  };

  const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user);
      console.log("Email verification sent successfully!");
      alert("Email verification sent successfully!");
    } catch (error) {
      console.log("Failed to send email verification:", error);
      // Handle the error, display an error message, etc.
    }
  };
  const openEmailApp = () => {
    Linking.openURL("mailto:" + email);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const selectPicture = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      setPicture(result.uri);
    }
  };

  const formatDateString = (date) => {
    if (!date) {
      return "DD/MM/YYYY"; // Placeholder value
    }
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  };

  return (
    <ImageBackground
      source={require("../assets/signup.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.form,
            { opacity: 0.9, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View>
            <Text style={styles.title}>Create Account</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                onChangeText={(text) => setUsername(text)}
                value={username}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={(text) => setEmail(text)}
                value={email}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry={!showPassword}
                onChangeText={(text) => setPassword(text)}
                value={password}
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={toggleShowPassword}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                onChangeText={(text) => setName(text)}
                value={name}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                onChangeText={(text) => setLastName(text)}
                value={lastName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                onChangeText={(text) => setPhoneNumber(text)}
                value={phoneNumber}
                keyboardType="phone-pad"
              />
            </View>
             <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                onChangeText={(text) => setLocation(text)}
                value={location}
              />
            </View> 
             
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <Text style={styles.datePickerText}>
                {formatDateString(birthdate)} 
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                date={birthdate || new Date()}
                onConfirm={(date) => {
                  setBirthdate(date);
                  setShowDatePicker(false);
                }}
                onCancel={() => setShowDatePicker(false)}
              />
            )}
            <View style={styles.inputContainer}>
              <Ionicons
                name="heart-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Interests"
                onChangeText={(text) => setInterests(text.split(","))}
                value={interests.join(", ")}
              />
            </View>
            <TouchableOpacity
              style={styles.pictureButton}
              onPress={selectPicture}
              activeOpacity={0.7}
            >
              <Ionicons
                name="image-outline"
                size={24}
                color="#000"
                style={styles.pictureIcon}
              />
              <Text style={[styles.pictureButtonText]}>Select Picture</Text>
            </TouchableOpacity>
            {picture && (
              <Text style={styles.pictureText}>
                Selected Picture: {picture}
              </Text>
            )} 
            <TouchableOpacity
              style={styles.button}
              onPress={()=>handleSignup()}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
            <Text style={[styles.footerText, styles.footerLink]}>Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    opacity: 0.8,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "80%",
    borderRadius: 10,
    backgroundColor: "#E8E8E8",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: primaryColor,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: inputColor,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: "#fff",
  },
  showPasswordButton: {
    marginLeft: -30,
  },
  pictureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  pictureIcon: {
    marginRight: 10,
  },
  pictureButtonText: {
    color: "#000",
    fontSize: 16,
  },
  pictureText: {
    marginTop: 10,
    color: "#fff",
  },
  button: {
    width: "100%",
    height: 40,
    backgroundColor: buttonColor,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: buttonTextColor,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
  },
  footerLink: {
    fontWeight: "bold",
  },
  datePickerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginTop: 10,
    borderRadius: 5,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePicker: {
    flex: 1,
  },
  datePickerButton: {
    backgroundColor: buttonColor,
    borderRadius: 5,
    padding: 5,
    marginLeft: 10,
  },
  datePickerButtonText: {
    color: buttonTextColor,
    fontSize: 14,
    fontWeight: "bold",
  },
  datePickerText: {
    flex: 1,
    height: 40,
    backgroundColor: inputColor,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default SignupScreen;
