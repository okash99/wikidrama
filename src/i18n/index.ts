import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr'
import en from './en'
import es from './es'
import de from './de'

const savedLang = localStorage.getItem('wikidrama_lang')
const browserLang = navigator.language.slice(0, 2)
const supportedLangs = ['fr', 'en', 'es', 'de']
const defaultLang = savedLang || (supportedLangs.includes(browserLang) ? browserLang : 'fr')

i18n
  .use(initReactI18next)
  .init({
    resources: { fr, en, es, de },
    lng: defaultLang,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  })

export default i18n
