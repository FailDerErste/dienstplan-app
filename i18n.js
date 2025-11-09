// i18n.js konfiguriert die Einstellungen für Übersetzungen
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import de from './locales/de.json';
import en from './locales/en.json';

//Unterstützte Sprachen
const supportedLanguages = ['de', 'en'];

// Hilfsfunktion: Sprache ermitteln
const detectLanguage = async () => {
  try {
    const stored = await AsyncStorage.getItem('appLanguage');
    if (stored && supportedLanguages.includes(stored)) return stored;

    const locales = Localization.getLocales();
    const sysLang = locales[0]?.languageCode ?? 'en';
    return supportedLanguages.includes(sysLang) ? sysLang : 'en';
  } catch (error) {
    console.warn('Language detection failed:', error);
    return 'en';
  }
};

// Initialisierung — aber *nicht* mit await auf Top-Level
export const initI18n = async () => {
  const lng = await detectLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      lng,
      fallbackLng: 'en',
      resources: {
        en: { translation: en },
        de: { translation: de },
      },
      interpolation: { escapeValue: false },
    });

  return i18n;
};

export default i18n;
