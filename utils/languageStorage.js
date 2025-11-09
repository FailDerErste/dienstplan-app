// utils/languageStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export const setAppLanguage = async (lang) => {
  try {
    await AsyncStorage.setItem('appLanguage', lang);
    await i18n.changeLanguage(lang);
  } catch (error) {
    console.error(i18n.t('errSetLanguage'), error);
  }
};

export const getAppLanguage = async () => {
  try {
    return await AsyncStorage.getItem('appLanguage');
  } catch {
    return null;
  }
};
