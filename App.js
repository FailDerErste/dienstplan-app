import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { DialogProvider } from './components/AppDialog';
import { ServicesProvider } from './servicesContext';
import AppNavigator from './AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <ServicesProvider>
        <DialogProvider>
          <AppNavigator />
        </DialogProvider>
      </ServicesProvider>
    </ThemeProvider>
  );
}
