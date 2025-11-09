import React from 'react';
import { Image, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
import Onboarding from 'react-native-onboarding-swiper';
import { setTutorialSeen } from '../utils/tutorialStorage';
import { useTranslation } from 'react-i18next';

export default function Tutorial({ onFinish }) {
  const { t } = useTranslation();

  const handleFinish = () => {
    setTutorialSeen();
    onFinish(); // App.js zeigt danach den normalen Navigator
  };

  return (
    <Onboarding
      onSkip={handleFinish}
      onDone={handleFinish}
      bottomBarHeight={80}
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
  );
}
