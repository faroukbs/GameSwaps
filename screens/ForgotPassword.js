import React,{useState} from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
  
    const handleForgotPassword = () => {
      // Perform forgot password logic here
      console.log("Email:", email);
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