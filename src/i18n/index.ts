import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en.json';
import deTranslation from './locales/de.json';

// Die verfügbaren Sprachen
export const languages = {
  en: 'English',
  de: 'Deutsch'
};

i18n
  // Erkennt die Browsersprache
  .use(LanguageDetector)
  // Integriert i18next mit React
  .use(initReactI18next)
  // Initialisierung
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      de: {
        translation: deTranslation
      }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React escaped bereits
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    }
  });

export default i18n; 