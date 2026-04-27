import { useTranslation } from 'react-i18next'
import { useSettings } from '../context/SettingsContext'

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { lang, setLang } = useSettings()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full mx-4 max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-4 p-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-base">⚙️ {t('settings')}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-xs"
          >
            {t('close')} ✕
          </button>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-2">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest">{t('language')}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as 'fr' | 'en' | 'es' | 'de')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm ${
                  lang === l.code
                    ? 'bg-red-500 border-red-500 text-white font-semibold'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <span>{l.flag}</span>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Light mode — coming soon */}
        <div className="flex flex-col gap-2">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest">{t('theme')}</p>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-800/40 opacity-50 cursor-not-allowed">
            <span className="text-zinc-300 text-sm">☀️ {t('lightMode')}</span>
            <span className="text-zinc-500 text-xs">{t('comingSoon')}</span>
          </div>
        </div>

        {/* Report Bug */}
        <a
          href="https://github.com/okash99/wikidrama/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all text-sm"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          {t('reportBug')}
        </a>
      </div>
    </div>
  )
}
