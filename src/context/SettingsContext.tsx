import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import i18n from '../i18n'

type Theme = 'dark' | 'light'
type Lang = 'fr' | 'en' | 'es' | 'de'

interface SettingsContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  suddenDeathEnabled: boolean
  setSuddenDeathEnabled: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    (localStorage.getItem('wikidrama_lang') as Lang) || 'fr'
  )
  const [theme, setThemeState] = useState<Theme>(
    (localStorage.getItem('wikidrama_theme') as Theme) || 'dark'
  )
  const [suddenDeathEnabled, setSuddenDeathEnabledState] = useState(
    localStorage.getItem('wikidrama_sudden_death') === 'true'
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

  const setSuddenDeathEnabled = (enabled: boolean) => {
    setSuddenDeathEnabledState(enabled)
    localStorage.setItem('wikidrama_sudden_death', String(enabled))
  }

  useEffect(() => {
    i18n.changeLanguage(lang)
  }, [])

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [theme])

  return (
    <SettingsContext.Provider value={{ lang, setLang, theme, setTheme, suddenDeathEnabled, setSuddenDeathEnabled }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
