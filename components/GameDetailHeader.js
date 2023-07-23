import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const GameDetailHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" style={{ marginLeft: 16 }} />
      </TouchableOpacity>
    </View>
  );
};

export default GameDetailHeader;
