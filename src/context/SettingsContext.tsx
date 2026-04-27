import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import i18n from '../i18n'

type Theme = 'dark' | 'light'
type Lang = 'fr' | 'en' | 'es' | 'de'

interface SettingsContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    (localStorage.getItem('wikidrama_lang') as Lang) || 'fr'
  )
  const [theme, setThemeState] = useState<Theme>(
    (localStorage.getItem('wikidrama_theme') as Theme) || 'dark'
  )

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('wikidrama_lang', l)
    i18n.changeLanguage(l)
  }

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('wikidrama_theme', t)
  }

  useEffect(() => {
    i18n.changeLanguage(lang)
  }, [])

  return (
    <SettingsContext.Provider value={{ lang, setLang, theme, setTheme }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
