import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Animated, ImageBackground } from 'react-native';
import { primaryColor, inputColor, buttonColor, buttonTextColor } from '../color';
import { Ionicons } from '@expo/vector-icons';


const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = () => {
    // Perform login logic here
    console.log('Email:', email);
    console.log('Password:', password);
  };

  const handleCreateAccount = () => {
    // Handle create account logic here
    console.log('Create Account');
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic here
    console.log('Forgot Password');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ImageBackground source={require('../assets/login.jpg')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={text => setEmail(text)}
            value={email}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              onChangeText={text => setPassword(text)}
              value={password}
            />
            <TouchableOpacity style={styles.showPasswordButton} onPress={toggleShowPassword}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={handleCreateAccount}>
            <Text style={styles.bottomText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.bottomText}>Forgot Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: primaryColor,
    opacity: 0.8,
  },
  form: {
    width: '80%',
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: inputColor,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: '#fff',
  },
  passwordContainer: {
    position: 'relative',
  },
  showPasswordButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: buttonColor,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: buttonTextColor,
    fontSize: 16,
  },
  bottomContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
  },
  bottomText: {
    color: '#fff',
    fontSize: 14,
    marginVertical: 5,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
