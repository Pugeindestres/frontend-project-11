import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import * as yup from 'yup';
import resources from './locales/index.js';

const i18n = i18next.createInstance();

export default async () => {
  console.log('=== i18n INITIALIZATION START ===');
  
  await i18n.use(LanguageDetector).init({
    resources,
    fallbackLng: 'ru',
    detection: {
      order: ['localStorage', 'navigator']
    }
  });

  console.log('i18n initialized successfully');
  console.log('Languages:', i18n.languages);
  console.log('Test translation "invalidUrl":', i18n.t('invalidUrl'));
  console.log('Test translation "successLoad":', i18n.t('successLoad'));
  console.log('Test translation "notEmpty":', i18n.t('notEmpty'));

  // ========== ЭТОТ КОД УЖЕ ЕСТЬ ==========
  yup.setLocale({
    mixed: {
      required: () => ({ key: 'notEmpty' }),
      notOneOf: () => ({ key: 'alreadyExists' })
    },
    string: {
      url: () => ({ key: 'invalidUrl' })
    }
  });
  // =======================================

  console.log('yup locale configured');
  console.log('=== i18n INITIALIZATION COMPLETE ===');
  
  return i18n;
};

