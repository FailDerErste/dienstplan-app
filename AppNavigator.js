// AppNavigator.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from './screens/MainScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useTheme } from './ThemeContext';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { t } = useTranslation();
  const { colors, mode } = useTheme();

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
            options={{ title: t('msTitle') }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: t('settingsTitle') }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}