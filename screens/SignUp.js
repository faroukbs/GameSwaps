import React, { useState, useRef, useEffect, useContext } from "react";
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
  Modal,
  Image,
  FlatList,
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
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firestore } from "../firebaseConfig";
import CountryPickerModal from "react-native-country-picker-modal";
import { useTranslation } from "react-i18next";
import combinedTranslations from "../translate/combinedTranslations";
import { LanguageContext } from "../translate/LanguageContext";
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
  const [birthdate, setBirthdate] = useState(null);
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [picture, setPicture] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation("signup", { translations: combinedTranslations });
  const { changeLanguage } = useContext(LanguageContext);


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
        const selectedAsset = assets[0]; // only pick one image
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
          countryCode: country?.cca2 || "",
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
    if (date) {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } else {
      return t('choosedate');
    }
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
            <Text style={styles.title}>{t("createAccount")}</Text>
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
                placeholder={t("usernamePlaceholder")}
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
                placeholder={t("emailPlaceholder")}
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
                placeholder={t("passwordPlaceholder")}
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
                  size={20}
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
                placeholder={t("firstNamePlaceholder")}
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
                placeholder={t("lastNamePlaceholder")}
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
                placeholder={t("PhoneNumberPlaceholder")}
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
                style={[styles.input, styles.countryPicker]} // Merge the countryPicker styles with input styles
                onPress={() => setShowCountryPicker(true)}
              >
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
                  placeholder={t("selectCountryPlaceholder")}
                />
                {!country && (
                  <Text style={styles.countryPlaceholder}></Text>
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
              <Text
                style={[
                  styles.datePickerText,
                  formatDateString === t("choosedate") && styles.placeholderDateText,
                ]}
              >
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
              <Ionicons name="heart-outline" size={24} color="#000" />
              <View style={styles.interestsPickerContainer}>
                <TouchableOpacity
                  style={styles.interestsPickerIcon}
                  onPress={() => setShowInterestsModal(true)}
                >
                  <Text style={styles.interestsPickerIconText}>
                    {selectedInterests && selectedInterests.length === 0
                      ? t("selectInterestsPlaceholder")
                      : `${selectedInterests.length}`}
                  </Text>
                </TouchableOpacity>
                {selectedInterests && selectedInterests.length > 0 && (
                  <TouchableOpacity onPress={() => setShowInterestsModal(true)}>
                    <Text style={styles.countryName}>
                      {selectedInterests.join(", ")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Modal to show the interests dropdown */}
            <Modal
              visible={showInterestsModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowInterestsModal(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={interests}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.modalItem,
                          selectedInterests.includes(item) &&
                          styles.modalItemSelected,
                        ]}
                        onPress={() => {
                          if (selectedInterests.includes(item)) {
                            setSelectedInterests(
                              selectedInterests.filter(
                                (interest) => interest !== item
                              )
                            );
                          } else {
                            setSelectedInterests([...selectedInterests, item]);
                          }
                        }}
                      >
                        <Text style={styles.modalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => setShowInterestsModal(false)}
                >
                  <Text style={styles.modalDoneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </Modal>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup} // Use handleSignup function here
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{t('signUp')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t("alreadyHaveAccountLabel")}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
            <Text style={[styles.footerText, styles.footerLink]}>{t("loginLabel")}</Text>
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
    marginLeft: -40,
    paddingHorizontal: 10,
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
  interestsPickerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 10,
    paddingHorizontal: 10,
    backgroundColor: inputColor,
    borderRadius: 5,
  },
  interestsPickerIcon: {
    flex: 1,
    paddingVertical: 10,
  },
  interestsPickerIconText: {
    fontSize: 16,
    color: "#808080",
    maxHeight: 40,
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    maxHeight: "80%",
    width: "80%",
    overflow: "hidden",
  },
  modalItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalItemSelected: {
    backgroundColor: "#6ef077",
    textShadowColor: "#000",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  modalDoneButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  modalDoneButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  placeholderDateText: {
    color: "#808080", // Placeholder color
  },
});

export default SignupScreen;
