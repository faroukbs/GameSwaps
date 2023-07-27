import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      const authInstance = getAuth();
      await sendPasswordResetEmail(authInstance, email);
      // Show success message to the user
      Alert.alert(
        "Success",
        "A password reset link has been sent to your email. Please check your inbox.",
        [
          {
            text: "OK",
            onPress: () =>
              console.log("Password reset email sent successfully!"),
          },
        ]
      );
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // Email not found in Firebase Authentication database
        Alert.alert(
          "Email Not Found",
          "The provided email address is not associated with any account. Please check the email and try again."
        );
      } else {
        // Other errors
        console.log("Error sending password reset email:", error);
        Alert.alert(
          "Error",
          "An error occurred while sending the password reset email. Please try again later."
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleForgotPassword}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Reset Password</Text>
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
