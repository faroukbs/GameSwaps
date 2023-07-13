import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const navigation = useNavigation();
  const [data, setData] = useState([
    { id: 1, title: "Item 1", image: require("../assets/login.jpg") },
    { id: 2, title: "Item 2", image: require("../assets/login.jpg") },
    { id: 3, title: "Item 3", image: require("../assets/login.jpg") },
    { id: 4, title: "Item 4", image: require("../assets/login.jpg") },
    { id: 5, title: "Item 5", image: require("../assets/login.jpg") },
    { id: 6, title: "Item 6", image: require("../assets/login.jpg") },
    { id: 7, title: "Item 7", image: require("../assets/login.jpg") },
    { id: 8, title: "Item 8", image: require("../assets/login.jpg") },
    { id: 9, title: "Item 9", image: require("../assets/login.jpg") },
    { id: 10, title: "Item 10", image: require("../assets/login.jpg") },
    { id: 11, title: "Item 11", image: require("../assets/login.jpg") },
    { id: 12, title: "Item 12", image: require("../assets/login.jpg") },

  ]);

  const renderListItem = ({ item }) => {
    const screenWidth = Dimensions.get("window").width;
    const containerWidth = (screenWidth - 40) / 2; 

    return (
      <TouchableOpacity style={[styles.listItem, { width: containerWidth }]} >
        <ImageBackground source={item.image} style={styles.itemImage} resizeMode="cover">
          <View style={styles.itemTitleContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Username</Text>
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
        <ImageBackground
          source={require("../assets/profileimg.jpg")}
          style={styles.profileImage}
          imageStyle={styles.profileImageBorder}
        />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#0A4D68" />
        <TextInput style={styles.searchInput} placeholder="Search" />
      </View>
     
      <FlatList
        data={data}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.flatList}
        numColumns={2}
      />
    </View>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d3d3d3",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 9,
    color: "#0A4D68",
  },
  profileImage: {
    width: 35,
    height: 35,
  },
  profileImageBorder: {
    borderRadius: 25,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    marginRight: 39,
    borderWidth: 1,
    borderColor: "#0A4D68",
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#0A4D68",
    paddingLeft: 10,
  },
  flatList: {
    paddingHorizontal: 20,
  },
  listItem: {
    alignItems: "center",
    marginBottom: 20,
  },
  itemImage: {
    width: "100%",
    aspectRatio: 1, // Maintain the aspect ratio of the image
    justifyContent: "flex-end",
    padding: 10,
  },
  itemTitleContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 5,
    justifyContent: "center",
    borderRadius: 5,
    width: "85%",
  },
  itemTitle: {
    fontSize: 16,
    color: "#fff",
  },
});

export default Home;
