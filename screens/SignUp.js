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
import {
  primaryColor,
  inputColor,
  buttonColor,
  buttonTextColor,
} from "../color";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation } from "@react-navigation/native";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, collection,getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore } from "../firebaseConfig";
import CountryPickerModal from "react-native-country-picker-modal";
import MultiSelect from "react-native-multiple-select";

const storage = getStorage();

const SignupScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [country, setCountry] = useState(null);
  const [birthdate, setBirthdate] = useState(new Date());
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [picture, setPicture] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
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


  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        const { assets } = result;
        const selectedAsset = assets[0]; // Assuming we only pick one image
        const { uri } = selectedAsset;
        setPicture(uri); // Set the profile picture URI to the 'picture' state
        await uploadImage(uri); // Upload the image to Firebase Storage
      }
    } catch (error) {
      console.log("Error uploading image: ", error);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const imageName = generateFileName();
      const storageRef = ref(storage, `userProfileImage/${imageName}`);
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

  const handleSignup = async () => {
    try {
      const authInstance = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        authInstance,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: username,
        photoURL: imageUrl,
        phoneNumber: phoneNumber,
      });
      console.log("Registration successful!", user.uid);

      await sendVerificationEmail(user);

      // Save user data to Firestore
      const usersCollectionRef = collection(firestore, "users");
      const userDocRef = doc(usersCollectionRef, user.uid);
      await setDoc(userDocRef, {
        username,
        email,
        name,
        lastName,
        phoneNumber,
        location: {
          country: country?.name || "",
        },
        birthdate,
        interests: selectedInterests,
        picture: imageUrl, // Save the download URL of the image in Firestore
      });

      console.log("User data saved to Firestore successfully!");

      Alert.alert(
        "Success",
        "Registration successful! Please check your email to verify your account.",
        [
          {
            text: "OK",
            onPress: () => console.log("object"),
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
      //alert("Email verification sent successfully!");
    } catch (error) {
      console.log("Failed to send email verification:", error);
      // Handle the error, display an error message, etc.
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const gameTypesCollectionRef = collection(firestore, "type");
      const gameTypesSnapshot = await getDocs(gameTypesCollectionRef);
      const doc = gameTypesSnapshot.docs[0];
      const names = doc.data().name;
      setInterests(names);
    } catch (error) {
      console.log("Error fetching game types: ", error);
    }
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
            <View style={styles.profilePictureContainer}>
              {picture ? (
                <TouchableOpacity
                  onPress={handleImageUpload}
                  activeOpacity={0.7}
                  style={styles.profilePictureTouchable}
                >
                  <Image
                    source={{ uri: picture }}
                    style={styles.profilePicture}
                  />
                  <View style={styles.selectIconContainer}>
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color="#fff"
                      style={styles.selectIcon}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleImageUpload}
                  activeOpacity={0.7}
                  style={styles.profilePictureTouchable}
                >
                  <Ionicons
                    name="image-outline"
                    size={100}
                    color="#000"
                    style={styles.selectIcon}
                  />
                </TouchableOpacity>
              )}
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
              <TouchableOpacity
                style={[styles.input, styles.countryPicker]}
                onPress={() => setShowCountryPicker(true)}
              >
                {country && (
                  <View style={styles.countryContainer}>
                    <Text style={styles.countryName}>{country.name}</Text>
                  </View>
                )}
                {!country && (
                  <Text style={styles.countryPlaceholder}>Select Country</Text>
                )}
              </TouchableOpacity>
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
            <View style={styles.pickerContainer}>
              <Ionicons
                name="heart-outline"
                size={24}
                color="#000"
                style={styles.icon}
              />
          <MultiSelect
            items={interests.map((name, index) => ({
              id: index.toString(),
              name,
            }))}
            uniqueKey="id"
            onSelectedItemsChange={(items) => setSelectedInterests(items)}
            selectedItems={selectedInterests}
            selectText="Select Interests Types"
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
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup} // Use handleSignup function here
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

      <CountryPickerModal
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={(country) => {
          setCountry(country);
          setCountryCode(country.cca2);
          setShowCountryPicker(false);
        }}
        withFilter
        withCountryNameButton
        withCallingCodeButton
        withAlphaFilter
        withCallingCode
        countryCode={countryCode}
      />
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
  profilePictureContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#fff",
    backgroundColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 30,
    marginBottom: 20,
  },
  profilePictureTouchable: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  selectIconContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 70,
  },
  selectIcon: {
    zIndex: 1,
  },
  profilePicture: {
    width: "100%",
    height: "100%",
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
  countryPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  countryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryName: {
    fontSize: 16,
    color: "#fff",
  },
  countryPlaceholder: {
    fontSize: 16,
    color: "#808080",
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
});

export default SignupScreen;
