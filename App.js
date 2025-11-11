import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native'; // 🆕 für Ladeanzeige
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './ThemeContext';
import * as NavigationBar from 'expo-navigation-bar';
import { DialogProvider } from './components/AppDialog';
import { ServicesProvider } from './servicesContext';
import AppNavigator from './AppNavigator';
import Tutorial from './components/Tutorial';
import { hasSeenTutorial } from './utils/tutorialStorage';
import onboardingController from './utils/onboardingController';

// 🆕 Import i18n-Initialisierung
import { initI18n } from './i18n';

function NavigationBarSync() {
  const { colors, mode } = useTheme();

  useEffect(() => {
    // Farbe & Stil der Android-Navigationsleiste dynamisch anpassen
    NavigationBar.setBackgroundColorAsync(colors.card);
    NavigationBar.setButtonStyleAsync(mode.dark || mode.darkgrey ? 'light' : 'dark');
  }, [colors, mode]); // <- reagiert bei jedem Theme-Wechsel

  return null; // keine sichtbare Ausgabe
}

export default function App() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      // 🆕 Sprache initialisieren
      await initI18n();

      // Tutorial-Status prüfen
      const seen = await hasSeenTutorial();
      setShowTutorial(!seen);
      setIsReady(true);
    };

    setup();

    // Subscribe to onboarding restart events
    const unsubscribe = onboardingController.subscribe(() => {
      setShowTutorial(true);
    });

    return unsubscribe;
  }, []);

  // 🆕 Ladeanzeige, bis i18n und Tutorialstatus bereit sind
  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationBarSync />
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
