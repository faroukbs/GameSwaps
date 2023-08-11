import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import {
  primaryColor,
  inputColor,
  buttonColor,
  buttonTextColor,
} from "../color";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import combinedTranslations from "../translate/combinedTranslations";
import { LanguageContext } from "../translate/LanguageContext";

const LoginScreen = () => {
  const { t } = useTranslation("login", { translations: combinedTranslations });
  const { changeLanguage } = useContext(LanguageContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const errorMessageAnim = useRef(new Animated.Value(0)).current;

  const handleNavigateToHome = () => {
    navigation.navigate("Home");
  };

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

  const handleLogin = () => {
    // Input validation
    if (!isValidEmail(email)) {
      setErrorMessage(t("invalidEmail"));
      animateErrorMessage();
      return;
    }

    if (!isValidPassword(password)) {
      setErrorMessage(t("invalidPassword"));
      animateErrorMessage();
      return;
    }

    const authInstance = getAuth();
    signInWithEmailAndPassword(authInstance, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.emailVerified) {
          console.log(user);
          navigation.navigate("Home");
        } else {
          // User's email is not verified
          setErrorMessage(t("verifyEmail"));
          animateErrorMessage();
        }
      })
      .catch((error) => {
        console.log(error);
        // Handle login error and display appropriate error message
        if (error.code === "auth/wrong-password") {
          setErrorMessage(t("incorrectPassword"));
          animateErrorMessage();
        } else if (
          error.code === "auth/invalid-email" ||
          error.code === "auth/user-not-found"
        ) {
          setErrorMessage(t("invalidCredentials"));
          animateErrorMessage();
        } else {
          setErrorMessage(t("loginError"));
          animateErrorMessage();
        }
      });
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  const animateErrorMessage = () => {
    Animated.timing(errorMessageAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(errorMessageAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2000);
    });
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ImageBackground
      source={require("../assets/login.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.form,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder={t("emailPlaceholder")}
            onChangeText={(text) => setEmail(text)}
            value={email}
          />
          <View style={styles.passwordContainer}>
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
              <Icon
                name={showPassword ? "eye-slash" : "eye"}
                size={24}
                color="#000"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{t("loginButton")}</Text>
          </TouchableOpacity>
          <View style={styles.authIconsContainer}>
            <TouchableOpacity style={styles.authIcon}>
              <Icon name="google" size={24} color="#DB4437" solid />
            </TouchableOpacity>
            <TouchableOpacity style={styles.authIcon}>
              <Icon name="facebook-f" size={24} color="#3B5998" solid />
            </TouchableOpacity>
          </View>
        </Animated.View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
            <Text style={styles.bottomText}>{t("createAccount")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.bottomText}>{t("forgotPassword")}</Text>
          </TouchableOpacity>
        </View>
        <Animated.View
          style={[
            styles.errorMessageContainer,
            {
              opacity: errorMessageAnim,
              transform: [
                {
                  translateY: errorMessageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.errorMessageText}>{errorMessage}</Text>
        </Animated.View>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleNavigateToHome}
        >
          <Ionicons name="home-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
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
    opacity: 0.9,
  },
  form: {
    width: "80%",
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 20,
  },
  input: {
    width: "100%",
    height: 40,
    backgroundColor: inputColor,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: "#fff",
  },
  passwordContainer: {
    position: "relative",
  },
  showPasswordButton: {
    position: "absolute",
    top: 10,
    right: 10,
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
  authIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  authIcon: {
    marginHorizontal: 10,
  },
  bottomContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
  },
  bottomText: {
    color: "#fff",
    fontSize: 14,
    marginVertical: 5,
    textDecorationLine: "underline",
  },
  errorMessageContainer: {
    position: "absolute",
    bottom: 70,
    backgroundColor: "#f00",
    padding: 10,
    borderRadius: 5,
    alignSelf: "center",
  },
  errorMessageText: {
    color: "#fff",
    textAlign: "center",
  },
  homeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
  },
});

export default LoginScreen;
