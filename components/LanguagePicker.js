import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { LanguageContext } from '../translate/LanguageContext';
import {
  inputColor,
} from "../color";
import combinedTranslations from "../translate/combinedTranslations";

// Define a mapping of language codes to corresponding flag icons and full names
const languageOptions = [
  { code: 'ru', flag: '🇷🇺', name: 'русский' },
  { code: 'zh', flag: '🇨🇳', name: '中国人' },
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
];

const LanguagePicker = () => {
  const { t, i18n } = useTranslation('home', { translations: combinedTranslations });
  const { changeLanguage } = useContext(LanguageContext);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLanguageChange = (selectedLanguage) => {
    console.log('Selected Language:', selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
    setModalVisible(false);
    changeLanguage(selectedLanguage);
  };

  return (
    <View style={styles.modalItem}>
      <TouchableOpacity
        style={styles.iconTextContainer}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome name="globe" size={20} color={inputColor} style={styles.modalIcon} />
        <Text style={styles.modalText}>{t("chooseLanguage")}</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.languageOptions}>
            {languageOptions.map(({ code, flag, name }) => (
              <TouchableOpacity
                key={code}
                style={styles.languageOption}
                onPress={() => handleLanguageChange(code)}
              >
                <Text style={styles.menuItem}>
                  {flag} {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: 'absolute',
    top: 30,
    right: 10,
    zIndex: 999,
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  languageOptions: {
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  languageOption: {
    padding: 8,
  },
  menuItem: {
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalIcon: {
    marginRight: 10,
  },
  modalText: {
    fontSize: 16,
    color: inputColor,
  },
});

export default LanguagePicker;
