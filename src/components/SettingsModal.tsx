import { useTranslation } from 'react-i18next'
import { useSettings } from '../context/SettingsContext'
import { useFocusTrap } from '../hooks/useFocusTrap'

const LANGUAGES = [
  { code: 'fr', label: 'Fran\u00E7ais', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
  { code: 'en', label: 'English', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { code: 'es', label: 'Espa\u00F1ol', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
  { code: 'de', label: 'Deutsch', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
]

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { lang, setLang, theme, setTheme } = useSettings()
  const modalRef = useFocusTrap(true, onClose)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative w-full mx-4 max-w-sm rounded-2xl bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800 flex flex-col gap-4 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="settings-title" className="text-white font-bold text-base">{'\u2699\uFE0F'} {t('settings')}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-xs font-semibold"
          >
            {t('close')} {'\u2715'}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{t('language')}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as 'fr' | 'en' | 'es' | 'de')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium ${
                  lang === l.code
                    ? 'bg-red-500 border-red-500 text-white font-bold'
                    : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
                }`}
              >
                <span>{l.flag}</span>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{t('theme')}</p>
          <div className="grid grid-cols-2 gap-1.5 bg-black/40 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2 py-1.5 rounded-lg transition-all text-sm font-medium ${
                theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm font-bold border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>{'\uD83C\uDF19'}</span> {t('themeDark')}
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2 py-1.5 rounded-lg transition-all text-sm font-medium ${
                theme === 'light' ? 'bg-zinc-800 text-white shadow-sm font-bold border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>{'\u2600\uFE0F'}</span> {t('themeLight')}
            </button>
          </div>
        </div>

        <a
          href="https://github.com/okash99/wikidrama/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all text-sm font-medium"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          {t('reportBug')}
        </a>
      </div>
    </div>
  )
}
