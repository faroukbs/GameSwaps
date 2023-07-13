import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./screens/Home";
import LogIn from "./screens/LogIn";
import SignUp from "./screens/SignUp";
import ForgotPassword from "./screens/ForgotPassword";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
         <Stack.Screen name="Home" component={Home} options={{headerShown:false}} /> 
         {/* <Stack.Screen name="LoginScreen" component={LogIn} options={{ headerShown: false }} />  
        <Stack.Screen name="SignupScreen" component={SignUp}  options={{ headerShown: false }}/>
        <Stack.Screen name="ForgotPassword" component={ForgotPassword}  /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const screenOptions = {
  headerStyle: {
    backgroundColor: "#0A4D68", 
    opacity: 0.5, 
  },
  headerTintColor: 'white', 
  headerTitleStyle: {
    fontWeight: 'bold', 
  },
};
