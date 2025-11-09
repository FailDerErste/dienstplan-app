import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const STORAGE_KEY = 'tutorialSeen';

// speichern, dass Tutorial gesehen wurde
export const setTutorialSeen = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
  } catch (e) {
    console.warn(i18n.t('errSaveTutState'), e);
  }
};

// prüfen, ob Tutorial schon gesehen wurde
export const hasSeenTutorial = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value === 'true';
  } catch (e) {
    console.warn(i18n.t('errLoadTutState'), e);
    return false;
  }
};

// optional: Tutorial zurücksetzen (z. B. über Einstellungen)
export const resetTutorial = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
