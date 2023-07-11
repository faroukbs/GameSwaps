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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  primaryColor,
  inputColor,
  buttonColor,
  buttonTextColor,
} from "../color";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const SignupScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [interests, setInterests] = useState([]);
  const [picture, setPicture] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const handleSignup = () => {
    // Perform signup logic here
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);
    console.log("Name:", name);
    console.log("Last Name:", lastName);
    console.log("Phone Number:", phoneNumber);
    console.log("Location:", location);
    console.log("Birthdate:", birthdate);
    console.log("Interests:", interests);
    console.log("Picture:", picture);
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

    if (!result.cancelled) {
      setPicture(result.uri);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/signup.jpg")}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.form,
            { opacity: 0.9, transform: [{ scale: scaleAnim }] },
          ]}
        >
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
              name="lock-closed-outline"
              size={24}
              color="#000"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry={!showPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              value={confirmPassword}
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
              {birthdate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              date={birthdate}
              onConfirm={(date) => {
                setBirthdate(date);
                setShowDatePicker(false);
              }}
              onCancel={() => setShowDatePicker(false)}
              {...(Platform.OS === "android" && { display: "spinner" })}
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
            <Text style={styles.pictureButtonText}>Select Picture</Text>
          </TouchableOpacity>
          {picture && (
            <Text style={styles.pictureText}>Selected Picture: {picture}</Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity>
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
    backgroundColor: primaryColor,
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
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
    color: "#fff",
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
  },
});

export default SignupScreen;
