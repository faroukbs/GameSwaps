import React, { useState, useEffect , useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../firebaseConfig";

const Home = () => {
  const navigation = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const modalAnimation = new Animated.Value(0);
  const auth = getAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Perform the data fetching or refreshing tasks here
      const gamesCollectionRef = collection(firestore, "games");
      const gamesSnapshot = await getDocs(gamesCollectionRef);
      const gamesData = gamesSnapshot.docs.map((doc) => doc.data());
      setData(gamesData);
    } catch (error) {
      console.log("Error fetching games: ", error);
    }
    setRefreshing(false);
  }, []);

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const modalTranslateX = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get("window").width, 0],
  });

  const modalOpacity = modalAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.3, 1],
  });

  // Getting the current connected user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUsername(user.displayName);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // Retrieve data from Firestore "games" collection
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesCollectionRef = collection(firestore, "games");
        const gamesSnapshot = await getDocs(gamesCollectionRef);
        const gamesData = gamesSnapshot.docs.map((doc) => doc.data());
        setData(gamesData);
      } catch (error) {
        console.log("Error fetching games: ", error);
      }
    };

    fetchGames();
  }, []);

  const handleAuthentication = () => {
    if (isAuthenticated) {
      handleSignOut();
    } else {
      navigation.navigate("LoginScreen");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate("LoginScreen");
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };

  const renderListItem = ({ item }) => {
    const screenWidth = Dimensions.get("window").width;
    const containerWidth = (screenWidth - 40) / 2;

    return (
      <TouchableOpacity style={[styles.listItem, { width: containerWidth }]}>
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
        >
          <View style={styles.itemTitleContainer}>
            <Text style={styles.itemTitle}>{item.name}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A4D68" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {username ? `Hello, ${username}` : "Hello, please log in"}
        </Text>
        <TouchableOpacity onPress={openModal}>
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
      <SafeAreaView style={styles.safeAreaContainer}>
        <FlatList
          data={data}
          renderItem={renderListItem}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          style={styles.flatList}
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </SafeAreaView>
      {modalVisible && (
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalOpacity,
              transform: [{ translateX: modalTranslateX }],
            },
          ]}
        >
          <TouchableOpacity onPress={handleAuthentication}>
            <View style={styles.modalItem}>
              <Ionicons
                name={isAuthenticated ? "log-out-outline" : "log-in-outline"}
                size={20}
                color="#0A4D68"
                style={styles.modalIcon}
              />
              <Text style={styles.modalText}>
                {isAuthenticated ? "Sign Out" : "Log In"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeModal}>
            <View style={styles.modalItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#0A4D68"
                style={styles.modalIcon}
              />
              <Text style={styles.modalText}>Profile</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("GameAddingScreen")}
          >
            <View style={styles.modalItem}>
              <Ionicons
                name="add-outline"
                size={20}
                color="#0A4D68"
                style={styles.modalIcon}
              />
              <Text style={styles.modalText}>Adding Game</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
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
  modalContainer: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 4,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  modalIcon: {
    marginRight: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#0A4D68",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d3d3d3",
  },
});

export default Home;
