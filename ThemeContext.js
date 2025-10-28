import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// 🎨 Gemeinsame Zusatzfarben
const baseColors = {
  success: '#27AE60',
  warning: '#F1C40F',
  danger: '#E74C3C',
  info: '#3498DB',
};

// 🌞 Helles Theme
const lightTheme = {
  mode: 'light',
  colors: {
    ...baseColors,
    background: '#FFFFFF',
    card: '#F8F8F8',
    text: '#000000',
    primary: '#2E86C1',
    border: '#aaa',
    overlay: 'rgba(0,0,0,0.3)',
  },
};

// 🌚 Dunkles Theme
const darkTheme = {
  mode: 'dark',
  colors: {
    ...baseColors,
    background: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    primary: '#4DA3FF',
    border: '#555',
    overlay: 'rgba(255,255,255,0.15)',
  },
};

// 🌫️ Dunkelgraues Theme
const darkGrayTheme = {
  mode: 'darkgray',
  colors: {
    ...baseColors,
    background: '#2B2B2B',
    card: '#3A3A3A',
    text: '#F5F5F5',
    primary: '#4DA3FF',
    border: '#666',
    overlay: 'rgba(255,255,255,0.1)',
  },
};

// 📦 Alle verfügbaren Themes
const themes = { light: lightTheme, dark: darkTheme, darkgray: darkGrayTheme };

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('system');
  const [theme, setTheme] = useState(lightTheme);

  // 🔹 Theme beim Start laden
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('themeMode');
        if (stored) {
          setThemeMode(stored);
          applyTheme(stored);
        } else {
          applyTheme('system');
        }
      } catch (e) {
        console.error('Fehler beim Laden des Themes:', e);
      }
    })();
  }, []);

  // 🔹 Theme anwenden
  const applyTheme = (mode) => {
    if (mode === 'system') {
      const colorScheme = Appearance.getColorScheme();
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    } else if (mode === 'darkgray') {
      setTheme(darkGrayTheme);
    } else {
      setTheme(themes[mode]);
    }
  };

  // 🔹 Reagiere auf Systemänderungen
  useEffect(() => {
    if (themeMode === 'system') {
      const listener = Appearance.addChangeListener(({ colorScheme }) => {
        applyTheme(colorScheme === 'dark' ? 'dark' : 'light');
      });
      return () => listener.remove();
    }
  }, [themeMode]);

  // 🔹 Theme speichern & anwenden
  const updateThemeMode = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('themeMode', mode);
    applyTheme(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        colors: theme.colors,
        mode: theme.mode,
        themeMode,
        setTheme: updateThemeMode, // für SettingsScreen
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
