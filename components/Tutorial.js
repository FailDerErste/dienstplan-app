import React from 'react';
import { Image, Dimensions, View, StyleSheet } from 'react-native';
const { width, height } = Dimensions.get('window');
import Onboarding from 'react-native-onboarding-swiper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setTutorialSeen } from '../utils/tutorialStorage';
import { useTranslation } from 'react-i18next';

export default function Tutorial({ onFinish }) {
  const { t } = useTranslation();
  //const insets = useSafeAreaInsets(); // 👈 Dynamische Safe-Area-Abstände
  const { bottom } = useSafeAreaInsets();
  const bottomBarHeight = bottom > 0 ? 80 + bottom : 100;

  const handleFinish = () => {
    setTutorialSeen();
    onFinish(); // App.js zeigt danach den normalen Navigator
  };

  return (
    <View style={styles.outerContainer}>
      <Onboarding
        // 🔹 Kein Schatten oben/unten
        bottomBarHighlight={0}
        bottomBarHeight={ bottomBarHeight }

        // 🔹 Der Container hat unten dynamisch Platz
        containerStyles={{ paddingBottom: bottom + 10 }}

        // 🔹 Verhalten bei Fertigstellen / Überspringen
        onSkip={handleFinish}
        onDone={handleFinish}

        // 🔹 Deine Seiten
        pages={[
          {
            backgroundColor: '#A1D0FF',
            image: (
              <Image
                source={require('../assets/tutorial1.png')}
                style={{ width: width * 0.5, height: height * 0.25, resizeMode: 'contain' }}
              />
            ),
            title: t('tutStep1Title'),
            subtitle: t('tutStep1Text'),
          },
          {
            backgroundColor: '#FFE07A',
            image: (
              <Image
                source={require('../assets/tutorial2.png')}
                style={{ width: width * 0.7, height: height * 0.4, resizeMode: 'contain' }}
              />
            ),
            title: t('tutStep2Title'),
            subtitle: t('tutStep2Text'),
          },
          {
            backgroundColor: '#FFC1E3',
            image: (
              <Image
                source={require('../assets/tutorial3.png')}
                style={{ width: width * 0.7, height: height * 0.4, resizeMode: 'contain' }}
              />
            ),
            title: t('tutStep3Title'),
            subtitle: t('tutStep3Text'),
          },
          {
            backgroundColor: '#C7F9E6',
            image: (
              <Image
                source={require('../assets/tutorial4.png')}
                style={{ width: width * 0.7, height: height * 0.4, resizeMode: 'contain' }}
              />
            ),
            title: t('tutStep4Title'),
            subtitle: t('tutStep4Text'),
          },
          {
            backgroundColor: '#D8E8FF',
            image: (
              <Image
                source={require('../assets/tutorial5.png')}
                style={{ width: width * 0.7, height: height * 0.4, resizeMode: 'contain' }}
              />
            ),
            title: t('tutStep5Title'),
            subtitle: t('tutStep5Text'),
          },
          {
            backgroundColor: '#E5D5FF',
            image: (
              <Image
                source={require('../assets/tutorial6.png')}
                style={{ width: width * 0.7, height: height * 0.4, resizeMode: 'contain' }}
              />
            ),
            title: t('tutStep6Title'),
            subtitle: t('tutStep6Text'),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#A1D0FF', // Basisfarbe für das erste Tutorial-Slide
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  bottomBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // gleiche Farbe wie das aktuelle Onboarding-Slide (wird automatisch vom Swiper gefüllt)
    backgroundColor: 'transparent',
  },
});
