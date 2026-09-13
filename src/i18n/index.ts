import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ru from './locales/ru.json'
import kk from './locales/kk.json'
import en from './locales/en.json'

// RU is the default language for every new visitor. The browser-language
// detector is intentionally limited to localStorage + a cached cookie (not
// navigator language), so someone visiting from a KK or EN device still
// sees RU until they actively choose otherwise, per the brief.
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      kk: { translation: kk },
      en: { translation: en },
    },
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'kk', 'en'],
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'ochag_lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  })

// Guarantee a starting value of 'ru' for genuinely first-time visitors.
if (!localStorage.getItem('ochag_lang')) {
  i18n.changeLanguage('ru')
}

export default i18n
