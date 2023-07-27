import React from "react";
import { View, Text } from "react-native";

const EditGameScreen = ({ route }) => {
  const { gameId } = route.params;


  return (
    <View>
      <Text>Edit Game Screen</Text>
    </View>
  );
};

export default EditGameScreen;
