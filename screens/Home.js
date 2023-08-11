import React, { useState, useEffect, useCallback, useContext } from "react";
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
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import {
  inputColor,
  textColor,
  buttonColor,
  primaryColor,
  buttonTextColor,
} from "../color";
import placeholderImage from "../assets/profileimg.jpg";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "../translate/LanguageContext";
import combinedTranslations from "../translate/combinedTranslations";
import LanguagePicker from "../components/LanguagePicker";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const { t, i18n } = useTranslation(["home", "combinedTranslations"]);
  const { changeLanguage } = useContext(LanguageContext);

  const handleLanguageChange = (selectedLanguage) => {
    changeLanguage(selectedLanguage);
    closeModal();
  };

  const navigateToDetail = (item) => {
    navigation.navigate("GameDetailScreen", { item });
  };

  const handleNavigateToUserProfile = () => {
    navigation.navigate("UserProfileScreen", { userId: "userid" });
  };

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

  useEffect(() => {
    const filterGames = () => {
      const filteredGames = data.filter((game) => {
        // Check if the game name contains the search query
        const gameNameMatches = game.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // Check if the game description contains the search query
        const gameDescriptionMatches = game.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        // Combine all the criteria
        return gameNameMatches || gameDescriptionMatches;
      });

      setFilteredData(filteredGames);
    };

    filterGames();
  }, [data, searchQuery]);

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

        // Check if user.displayName exists and is a non-empty string before setting it
        if (user.displayName && user.displayName.trim()) {
          setUsername(user.displayName.trim());
        } else {
          setUsername(null);
        }

        // Fetch the user's profile data and profile image URL
        const userProfileRef = doc(firestore, "users", user.uid);
        getDoc(userProfileRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const profileImageUrl = snapshot.data().picture;
              setProfileImageUrl(profileImageUrl);
            } else {
              console.log("User profile does not exist");
            }
          })
          .catch((error) => {
            console.log("Error fetching user profile data: ", error);
          });

        // Set the language based on the user's preferred language
        if (user.language) {
          i18n.changeLanguage(user.language);
        }
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, i18n]);

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
      <TouchableOpacity
        style={[styles.listItem, { width: containerWidth }]}
        onPress={() => navigateToDetail(item)} 
      >
        <View style={styles.itemContainer}>
          <ImageBackground
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
          >
            <View style={styles.itemTitleContainer}>
              <Text style={styles.itemTitle}>{item.name}</Text>
            </View>
          </ImageBackground>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={inputColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/bghome.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <TouchableOpacity onPress={closeModal}>
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {isAuthenticated
                ? `${t("home:greeting", { username })}`
                : t("home:greetingNotLoggedIn")}
            </Text>
            {isAuthenticated ? (
              <TouchableOpacity onPress={openModal}>
                <ImageBackground
                  source={
                    profileImageUrl
                      ? { uri: profileImageUrl }
                      : require("../assets/profileimg.jpg")
                  }
                  style={styles.profileImage}
                  imageStyle={styles.profileImageBorder}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={openModal}>
                <ImageBackground
                  source={placeholderImage}
                  style={styles.profileImage}
                  imageStyle={styles.profileImageBorder}
                />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={inputColor} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("home:searchPlaceholder")}
            placeholderTextColor={inputColor}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>
        <SafeAreaView style={styles.safeAreaContainer}>
          <FlatList
            data={filteredData}
            renderItem={renderListItem}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            style={styles.flatList}
            numColumns={2}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
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
                  color={inputColor}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalText}>
                  {isAuthenticated
                    ? t("home:signOut")
                    : t("home:logIn")}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNavigateToUserProfile}>
              <View style={styles.modalItem}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={inputColor}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalText}>{t("home:profile")}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("GameAddingScreen")}
            >
              <View style={styles.modalItem}>
                <Ionicons
                  name="add-outline"
                  size={20}
                  color={inputColor}
                  style={styles.modalIcon}
                />
                <Text style={styles.modalText}>{t("home:addingGame")}</Text>
              </View>
            </TouchableOpacity>
            
            <LanguagePicker/>
            
          </Animated.View>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  itemContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  backgroundImage: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20, // Changed from 30 to 20
  },
  greeting: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 9,
    color: textColor,
  },
  profileImage: {
    width: 35, // Changed from 50 to 35
    height: 35, // Changed from 50 to 35
  },
  profileImageBorder: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: inputColor,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    marginRight: 39,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: inputColor,
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
    color: inputColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
});

export default Home;
