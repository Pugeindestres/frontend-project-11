import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import * as yup from 'yup';
import resources from './locales/index.js';

const i18n = i18next.createInstance();

export default async () => {
  await i18n.use(LanguageDetector).init({
    resources,
    fallbackLng: 'ru',
    detection: {
      order: ['localStorage', 'navigator']
    }
  });

  yup.setLocale({
    mixed: {
      required: () => ({ key: 'notEmpty' }),
      notOneOf: () => ({ key: 'alreadyExists' })
    },
    string: {
      url: () => ({ key: 'invalidUrl' })
    }
  });

  return i18n;
};