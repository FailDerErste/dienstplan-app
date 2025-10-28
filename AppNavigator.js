// AppNavigator.js
import React from 'react';
import { StatusBar, I18nManager } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from './screens/MainScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useTheme } from './ThemeContext';

// Optional: einfache Sprachlogik
const translations = {
  de: {
    mainTitle: 'Dienstplan',
    settingsTitle: 'Einstellungen',
  },
  en: {
    mainTitle: 'Schedule',
    settingsTitle: 'Settings',
  },
};

// Fallback: Deutsch
const getLanguage = () => {
  const locale = I18nManager.isRTL ? 'en' : 'de'; // du kannst das später dynamisch machen
  return translations[locale] || translations.de;
};

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { colors, mode } = useTheme();
  const t = getLanguage();

  // Grundlage: hell oder dunkel
  const baseTheme = mode === 'light' ? DefaultTheme : DarkTheme;

  // Farben übernehmen
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
      notification: colors.primary,
    },
  };

  return (
    <>
      <StatusBar
        barStyle={mode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.card}
      />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ title: t.mainTitle }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: t.settingsTitle }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}