import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import * as yup from 'yup';
import resources from './locales/index.js';

export default async () => {
  await i18next.use(LanguageDetector).init({
    resources,
    fallbackLng: 'ru',
    detection: {
      order: ['localStorage', 'navigator'],
    },
  });

  yup.setLocale({
    mixed: {
      required: () => 'notEmpty',
      notOneOf: () => 'alreadyExists',
    },
    string: {
      url: () => 'invalidUrl',
    },
  });

  return i18next;
};
