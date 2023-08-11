import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { I18nextProvider } from "react-i18next";
import i18n from "./translate/i18n";
import { LanguageProvider } from "./translate/LanguageContext"
import Home from "./screens/Home";
import LogIn from "./screens/LogIn";
import SignUp from "./screens/SignUp";
import ForgotPassword from "./screens/ForgotPassword";
import GameAddingScreen from "./screens/GameAddingScreen";
import GameDetailScreen from "./screens/GameDetailScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import UserPostedGamesScreen from "./screens/UserPostedGamesScreen";
import LanguagePicker from "./components/LanguagePicker";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerRight: () => <LanguagePicker /> }}>
            <Stack.Screen
              name="LoginScreen"
              component={LogIn}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={Home}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignupScreen"
              component={SignUp}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GameDetailScreen"
              component={GameDetailScreen}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPassword}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GameAddingScreen"
              component={GameAddingScreen}
            />
            <Stack.Screen
              name="UserProfileScreen"
              component={UserProfileScreen}
            />
            <Stack.Screen
              name="UserPostedGamesScreen"
              component={UserPostedGamesScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </I18nextProvider>
  );
}
