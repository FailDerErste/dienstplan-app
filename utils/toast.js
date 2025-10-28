import { Platform, ToastAndroid, Alert } from 'react-native';

/**
 * Zeigt eine einheitliche Toast-Nachricht in der ganzen App.
 * @param {string} message - Der Text der Nachricht.
 * @param {'info' | 'success' | 'error'} [type='info'] - Typ für mögliche Farb-/Emoji-Differenzierung.
 */
export function showToast(message, type = 'info') {
  const prefix =
    type === 'success' ? '✅ ' :
    type === 'error' ? '⚠️ ' :
    'ℹ️ ';

  if (Platform.OS === 'android') {
    ToastAndroid.show(`${prefix}${message}`, ToastAndroid.SHORT);
  } else {
    Alert.alert('Hinweis', `${prefix}${message}`);
  }
}
