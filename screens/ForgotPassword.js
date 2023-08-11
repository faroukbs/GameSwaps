import React, { useState,useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../translate/LanguageContext"; 
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { t } = useTranslation(['forgotPassword']);

   // Access the changeLanguage function from the context
   const { changeLanguage } = useContext(LanguageContext);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        t("forgotPassword:errorTitle"),
        t("forgotPassword:emptyEmailError"),
      );
      return;
    }

    try {
      const authInstance = getAuth();
      await sendPasswordResetEmail(authInstance, email);
      // Show success message to the user
      Alert.alert(
        t("forgotPassword:title"),
        t("forgotPassword:successMessage"),
        [
          {
            text: "OK",
            onPress: () => {
              console.log("Password reset email sent successfully!");
              setEmail(""); // Clear the email input field
            },
          },
        ]
      );
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        Alert.alert(
          t("forgotPassword:errorTitle"),
          t("forgotPassword:userNotFoundError"),
        );
      } else {
        console.log("Error sending password reset email:", error);
        Alert.alert(
          t("forgotPassword:errorTitle"),
          t("forgotPassword:genericError"),
        );
      }
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('forgotPassword:title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('forgotPassword:emailPlaceholder')}
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleForgotPassword}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>{t('forgotPassword:resetPasswordButton')}</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    width: "80%",
    height: 40,
    backgroundColor: "#3B5998",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ForgotPassword;
