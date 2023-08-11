import React, { useState, useEffect,useContext } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next"; 
import combinedTranslations from "../translate/combinedTranslations"; 
import { LanguageContext } from "../translate/LanguageContext";

const GameDetailScreen = ({ route }) => {
  const { t } = useTranslation("gameDetail", { translations: combinedTranslations });
  const { changeLanguage } = useContext(LanguageContext);
  const { item } = route.params;
  const [fullDescription, setFullDescription] = useState(item.description);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchFullDescription = async () => {
      try {
        const gameDocRef = doc(firestore, "games", item.id);
        const gameDocSnapshot = await getDoc(gameDocRef);
        if (gameDocSnapshot.exists()) {
          console.log(item.id);
          const data = gameDocSnapshot.data();
          setFullDescription(data.description);
        }
      } catch (error) {
        console.log("Error fetching full description: ", error);
      }
    };

    if (isExpanded) {
      fetchFullDescription();
    }
  }, [isExpanded, item.id]);

  const handleEmailPress = async () => {
    if (!item.userId) {
      return;
    }

    try {
      const userDocRef = doc(firestore, "users", item.userId);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const userEmail = userData.email; // Assuming the user's email is stored in the 'email' field of the user document
        setUserEmail(userEmail);

        const email = userEmail || "user@example.com"; // Use the fetched email or fallback to 'user@example.com'

        // Customize the subject and body of the email
        const subject = t("interestedSubject", { gameName: t(`gameDetail.gameName`) });
        const body = t("interestedBody", { gameName: t(`gameDetail.gameName`) });

        // Construct the mailto URL with subject and body
        const mailtoURL = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Open the email client with the customized email
        Linking.openURL(mailtoURL);
      } else {
        console.log("User document does not exist.");
      }
    } catch (error) {
      console.log("Error fetching user email: ", error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{t(item.name)}</Text>
          <Text style={styles.description}>
            {isExpanded ? t(fullDescription) : t(item.description)}
          </Text>
          {fullDescription.length > item.description.length && (
            <TouchableOpacity style={styles.showMoreButton} onPress={toggleExpand}>
              <Text style={styles.showMoreText}>
                {isExpanded ? t("showLess") : t("showMore")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.emailButton} onPress={handleEmailPress}>
          <Ionicons name="mail-outline" size={24} color="#fff" />
          <Text style={styles.emailButtonText}>{t("contactSwapper")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 400,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A4D68",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#001315",
    marginBottom: 16,
  },
  showMoreButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#088395",
    paddingVertical: 10,
    borderRadius: 5,
  },
  showMoreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emailButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#05BFDB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
  },
  emailButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default GameDetailScreen;
