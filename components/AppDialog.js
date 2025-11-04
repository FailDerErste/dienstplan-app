import { createContext, useContext, useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../ThemeContext';

const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
  const { colors } = useTheme();

  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState([]);
  const [content, setContent] = useState(null);

  // Animationen
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const dialogOpacity = useRef(new Animated.Value(0)).current;
  const dialogScale = useRef(new Animated.Value(0.9)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(dialogScale, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(dialogOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (callback) => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(dialogOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(dialogScale, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => callback && callback());
  };

  // Dialog öffnen
  const showDialog = (title, message, buttons = [{ text: 'OK' }], content = null) => {
    setTitle(title);
    setMessage(message);
    setButtons(buttons);
    setContent(content);
    // Reset animations
    overlayAnim.setValue(0);
    dialogOpacity.setValue(0);
    dialogScale.setValue(0.9);
    setVisible(true);
  };

  // Dialog schließen
  const closeDialog = () => {
    animateOut(() => setVisible(false));
  };

  const handlePress = (btn) => {
    closeDialog();
    if (btn.onPress) btn.onPress();
  };

  useEffect(() => {
    if (visible) animateIn();
  }, [visible, title, message, buttons, content]);

  return (
    <DialogContext.Provider value={{ showDialog, closeDialog }}>
      {children}

      <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
        <Animated.View
          style={[
            styles.overlay,
            { backgroundColor: colors.overlay, opacity: overlayAnim },
          ]}
        >
          {/* Overlay klickbar */}
          <TouchableWithoutFeedback onPress={closeDialog}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          {/* Der eigentliche Dialog – NICHT klickbar zum Schließen */}
          <Animated.View
            style={[
              styles.dialog,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.text,
                opacity: dialogOpacity,
                transform: [{ scale: dialogScale }],
              },
            ]}
          >
            {/* Titel */}
            {title ? (
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            ) : null}

            {/* Nachricht mit Scroll */}
            {message ? (
              <ScrollView
                style={styles.messageScroll}
                contentContainerStyle={{ paddingBottom: 10 }}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={[styles.message, { color: colors.text }]} selectable>
                  {message}
                </Text>
              </ScrollView>
            ) : null}

            {/* Custom Content */}
            {content && <View style={styles.content}>{content}</View>}

            {/* Buttons */}
            <View style={styles.buttonRow}>
              {buttons.map((btn, i) => {
                let bgColor = btn.bgColor ?? colors.primary;
                if (btn.bgColor == null) {
                  if (btn.style === 'destructive') bgColor = colors.danger;
                  else if (btn.style === 'cancel') bgColor = colors.border;
                }

                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.button, { backgroundColor: bgColor }]}
                    onPress={() => handlePress(btn)}
                  >
                    <Text style={[styles.buttonText, { color: '#fff' }]}>{btn.text}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </DialogContext.Provider>
  );
};

export const useDialog = () => useContext(DialogContext);

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialog: {
    width: '90%',
    maxWidth: 400,
    maxHeight: Dimensions.get('window').height * 0.8,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    elevation: 6,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  messageScroll: {
    flexGrow: 0,
    maxHeight: Dimensions.get('window').height * 0.45,
  },
  message: {
    fontSize: 15,
    textAlign: 'left',
    lineHeight: 21,
  },
  content: {
    marginTop: 10,
    paddingBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
