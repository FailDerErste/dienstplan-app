import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './ThemeContext';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar'; // ✅ Für iOS & Android Statusbar
import { DialogProvider } from './components/AppDialog';
import { ServicesProvider } from './servicesContext';
import AppNavigator from './AppNavigator';
import Tutorial from './components/Tutorial';
import { hasSeenTutorial } from './utils/tutorialStorage';
import onboardingController from './utils/onboardingController';
import { initI18n } from './i18n';

// 🔹 Hilfs-Komponente für dynamische Anpassung von StatusBar + NavigationBar
function SystemBarsSync() {
  const { colors, mode } = useTheme();

  useEffect(() => {
    // ✅ StatusBar (iOS + Android)
    // Farbe des Textes in der Statusbar je nach Theme
    // "light" = helle Schrift (für dunkles Theme), "dark" = dunkle Schrift (für helles Theme)
    const statusBarStyle = mode.dark || mode.darkgrey ? 'light' : 'dark';

    // Falls Plattform Android → Navigationsleiste anpassen
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setBackgroundColorAsync(colors.card);
        NavigationBar.setButtonStyleAsync(statusBarStyle);
      } catch (e) {
        console.warn('NavigationBar Anpassung nicht unterstützt:', e);
      }
    }

    // Bei iOS reicht das StatusBar-Element im JSX (siehe unten)
  }, [colors, mode]);

  return <StatusBar style={mode.dark || mode.darkgrey ? 'light' : 'dark'} />;
}

// 🔹 Hauptkomponente
export default function App() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initI18n(); // 🌐 Sprache initialisieren
      const seen = await hasSeenTutorial();
      setShowTutorial(!seen);
      setIsReady(true);
    };

    setup();

    // Reaktion auf „Tutorial neu starten“
    const unsubscribe = onboardingController.subscribe(() => {
      setShowTutorial(true);
    });

    return unsubscribe;
  }, []);

  // ⏳ Ladeanzeige, bis i18n + Tutorialstatus bereit sind
  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🌈 App-Rendering mit dynamischer Systemleistensteuerung
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SystemBarsSync />
        <ServicesProvider>
          <DialogProvider>
            {showTutorial ? (
              <Tutorial onFinish={() => setShowTutorial(false)} />
            ) : (
              <AppNavigator />
            )}
          </DialogProvider>
        </ServicesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
