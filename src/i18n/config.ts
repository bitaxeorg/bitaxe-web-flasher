import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import sk from './locales/tr.json';
import sk from './locales/sk.json';
import it from './locales/it.json';
import tlh from './locales/tlh.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      it: { translation: it },
      tlh: { translation: tlh },
      pt: { translation: pt },
      ru: { translation: ru },
      tr: { translation: tr },
      sk: { translation: sk }
    },
    fallbackLng: 'en',
    lng: 'en', // Set default language to English
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    }
  });

export default i18n;
