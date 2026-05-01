import { useTranslation } from 'react-i18next'
import { useSettings } from '../context/SettingsContext'
import { useFocusTrap } from '../hooks/useFocusTrap'

type LanguageCode = 'fr' | 'en' | 'es' | 'de'

const LANGUAGES = [
  { code: 'fr', label: 'Fran\u00E7ais' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espa\u00F1ol' },
  { code: 'de', label: 'Deutsch' },
]

interface SettingsModalProps {
  onClose: () => void
}

function FlagIcon({ code }: { code: LanguageCode }) {
  return (
    <span className="flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] border border-white/25 shadow-sm">
      <svg aria-hidden="true" viewBox="0 0 24 16" className="h-full w-full">
        {code === 'fr' && (
          <>
            <rect width="8" height="16" fill="#1d4ed8" />
            <rect x="8" width="8" height="16" fill="#ffffff" />
            <rect x="16" width="8" height="16" fill="#ef4444" />
          </>
        )}
        {code === 'en' && (
          <>
            <rect width="24" height="16" fill="#1e3a8a" />
            <path d="M0 0 24 16M24 0 0 16" stroke="#ffffff" strokeWidth="3.2" />
            <path d="M0 0 24 16M24 0 0 16" stroke="#dc2626" strokeWidth="1.6" />
            <path d="M12 0v16M0 8h24" stroke="#ffffff" strokeWidth="5" />
            <path d="M12 0v16M0 8h24" stroke="#dc2626" strokeWidth="2.6" />
          </>
        )}
        {code === 'es' && (
          <>
            <rect width="24" height="16" fill="#dc2626" />
            <rect y="4" width="24" height="8" fill="#facc15" />
          </>
        )}
        {code === 'de' && (
          <>
            <rect width="24" height="5.33" fill="#18181b" />
            <rect y="5.33" width="24" height="5.34" fill="#dc2626" />
            <rect y="10.67" width="24" height="5.33" fill="#facc15" />
          </>
        )}
      </svg>
    </span>
  )
}

function GearIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.02 7.02 0 0 0-1.62-.94l-.36-2.54A.484.484 0 0 0 14 2h-4a.484.484 0 0 0-.48.41l-.36 2.54a7.02 7.02 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.64 8.47a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.05.24.27.41.48.41h4c.22 0 .43-.17.47-.41l.36-2.54a7.02 7.02 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
    </svg>
  )
}

function ThemeIcon({ variant }: { variant: 'dark' | 'light' }) {
  if (variant === 'dark') {
    return (
      <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M18.5 15.5A7.5 7.5 0 0 1 8.5 5.5a8 8 0 1 0 10 10z" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-yellow-300">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-400/25 bg-red-500/10 text-red-300 transition-colors group-hover:border-red-300/40 group-hover:bg-red-500/15 group-hover:text-red-200">
      <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </span>
  )
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
          <h2 id="settings-title" className="flex items-center gap-2 text-white font-bold text-base">
            <GearIcon />
            {t('settings')}
          </h2>
          <button
            onClick={onClose}
            className="group flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label={t('close')}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{t('language')}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as LanguageCode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium ${
                  lang === l.code
                    ? 'bg-red-500 border-red-500 text-white font-bold'
                    : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
                }`}
              >
                <FlagIcon code={l.code as LanguageCode} />
                {l.label}
              </button>
            ))}
          </div>
          <p className="flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] font-medium leading-snug text-red-200/80">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-red-300/30 text-[9px] font-bold leading-none text-red-100/80"
            >
              !
            </span>
            <span>{t('languageSourceNotice')}</span>
          </p>
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
              <ThemeIcon variant="dark" /> {t('themeDark')}
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2 py-1.5 rounded-lg transition-all text-sm font-medium ${
                theme === 'light' ? 'bg-zinc-800 text-white shadow-sm font-bold border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ThemeIcon variant="light" /> {t('themeLight')}
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
