import React, { useEffect, useState,useContext } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore, auth } from "../firebaseConfig"; 
import { useTranslation } from "react-i18next";
import combinedTranslations from "../translate/combinedTranslations";
import { LanguageContext } from "../translate/LanguageContext";

const UserPostedGamesScreen = () => {
  const [postedGames, setPostedGames] = useState([]);
  const { t } = useTranslation("ViewList", { translations: combinedTranslations });
  const { changeLanguage } = useContext(LanguageContext);

  useEffect(() => {
    // Get the authenticated user's ID
    const userId = auth.currentUser.uid;

    // Query the "games" collection with the user's ID
    const gamesRef = collection(firestore, "games");
    const gamesQuery = query(gamesRef, where("userId", "==", userId));

    // Subscribe to the query and update the state with the posted games
    const unsubscribe = onSnapshot(gamesQuery, (snapshot) => {
      const games = [];
      snapshot.forEach((doc) => {
        const { name, imageUrl, description, genre } = doc.data();
        games.push({ id: doc.id, name, imageUrl, description });
      });
      setPostedGames(games);
    }, (error) => {
      console.error("Error fetching posted games:", error);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => {
    return (
      <View style={styles.gameContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.gameImage} />
        <View style={styles.gameInfo}>
          <Text style={styles.gameName}>{item.name}</Text>
          <Text style={styles.gameGenre}>{item.genre}</Text>
          <Text style={styles.gameDescription}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t("viewGameList")}</Text>
      <FlatList
        data={postedGames}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  gameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  gameImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 16,
  },
  gameName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  gameGenre: {
    fontSize: 14,
    color: "gray",
  },
  gameDescription: {
    fontSize: 14,
  },
});

export default UserPostedGamesScreen;
