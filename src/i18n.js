// src/i18n.js
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

  // Настройка yup для использования i18next
  yup.setLocale({
    mixed: {
      required: () => ({ key: 'urlRequired' }),
      notOneOf: () => ({ key: 'alreadyExists' })
    },
    string: {
      url: () => ({ key: 'urlMustBeValid' })
    }
  });

  return i18n;
};

// Экспортируем функцию для получения текста в других модулях
export const t = (key) => i18n.t(key);