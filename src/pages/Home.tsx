import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { E } from '../utils/emojis'
import SettingsModal from '../components/SettingsModal'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [flipped, setFlipped] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const MODES = [
    {
      id: 'random',
      label: () => `${E.chaos} ${t('duelRandom')}`,
      desc: () => t('duelRandomDesc'),
      className: 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 text-white',
      path: '/duel?mode=random',
      special: false,
    },
    {
      id: 'thematic',
      label: () => `${E.thematic} ${t('duelThematic')}`,
      desc: () => t('duelThematicDesc'),
      className: 'bg-card hover:bg-panel border border-border-strong text-text',
      path: '/duel?mode=thematic',
      special: false,
    },
    {
      id: 'wikiwars',
      label: () => `${E.pvIcon} ${t('wikiWars')}`,
      desc: () => t('wikiWarsDesc'),
      className: 'bg-gradient-to-r from-purple-950 to-purple-900 hover:from-purple-900 hover:to-purple-800 border border-purple-800 shadow-lg shadow-purple-500/10 text-white',
      path: '/wikiwars',
      special: true,
    },
  ]

  return (
    <>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <main className="relative flex flex-col items-center justify-between flex-1 px-6 py-8">
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 text-muted hover:text-text transition-colors p-1"
          aria-label={t('settings')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.02 7.02 0 0 0-1.62-.94l-.36-2.54A.484.484 0 0 0 14 2h-4a.484.484 0 0 0-.48.41l-.36 2.54a7.02 7.02 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.64 8.47a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.47.47 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.05.24.27.41.48.41h4c.22 0 .43-.17.47-.41l.36-2.54a7.02 7.02 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
          </svg>
        </button>

        <div />

        <div className="flex flex-col items-center gap-8 w-full">
          <div className="text-center fade-in">
            <div className="mb-4 flex justify-center">
              <h1 className="text-6xl" aria-hidden="true">{'\u{1F30D}'}</h1>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight">
              Wiki<span className="text-red-500">Drama</span>
            </h1>
            <p className="mt-3 text-muted text-base leading-relaxed max-w-xs mx-auto">
              {t('tagline')}
            </p>
          </div>

          <div className="w-full flex flex-col gap-4 fade-in">
            {MODES.map((mode) => (
              <div key={mode.id} className="relative [perspective:1000px]">
                {mode.special && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <span className="bg-purple-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide uppercase">
                      <span aria-hidden="true">{E.wwStar}</span> {t('specialMode')}
                    </span>
                  </div>
                )}

                <div 
                  className={`w-full grid transition-all duration-500 [transform-style:preserve-3d] ${
                    flipped === mode.id ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* FACE AVANT */}
                  <div className={`[grid-area:1/1] relative w-full rounded-2xl flex items-center justify-center [backface-visibility:hidden] ${mode.className}`}>
                    <button
                      onClick={() => navigate(mode.path)}
                      className="w-full py-3 sm:py-3.5 font-bold text-lg sm:text-xl active:scale-95 transition-transform rounded-2xl flex items-center justify-center"
                    >
                      {mode.label()}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setFlipped(mode.id)
                      }}
                      className="absolute top-1/2 -translate-y-1/2 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-colors"
                      aria-label={t('info')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </button>
                  </div>

                  {/* FACE ARRIÈRE */}
                  <div 
                    className={`[grid-area:1/1] relative w-full rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)] p-3 flex flex-col items-center justify-center text-center ${mode.className.replace(/hover:[^\s]+/g, '')}`}
                    style={{ backgroundBlendMode: 'multiply' }}
                  >
                    <div className="absolute inset-0 bg-black/40 rounded-2xl pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center h-full w-full gap-2">
                      <p className="text-white/95 text-[11px] sm:text-xs font-medium leading-snug">
                        {mode.desc()}
                      </p>
                      
                      <div className="flex gap-2 w-full justify-center mt-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setFlipped(null); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors text-[11px] sm:text-xs font-semibold"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                          </svg>
                          Retour
                        </button>
                        <button
                          onClick={() => navigate(mode.path)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black hover:bg-gray-100 transition-colors text-[11px] sm:text-xs font-bold shadow-lg"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5 3l14 9-14 9V3z"/>
                          </svg>
                          Jouer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full fade-in bg-card/60 backdrop-blur-md border border-border rounded-2xl px-4 py-2.5 flex flex-col gap-1">
            <p className="text-xs text-muted leading-relaxed text-center">
              {t('dramaScoreCaption')}
            </p>
            <p className="text-xs text-faint text-center font-mono">
              score = f(edits, rev, editors, anon, watch, minor)
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/okash99/wikidrama"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted hover:text-text transition-colors text-xs"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {t('github')}
            </a>
            <span className="text-faint">{'\u00B7'}</span>
            <span className="flex items-center gap-1.5 text-faint text-xs cursor-not-allowed opacity-50" title={t('comingSoon')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.76c.3.18.66.18.96 0l12.54-7.24-2.88-2.88-10.62 10.12zm-1.14-20.4C1.8 3.6 1.5 3.9 1.5 4.26v15.48c0 .36.3.66.54.9l.12.12L11.04 12v-.24L2.16 3.24l-.12.12zM20.34 10.5l-2.58-1.5-3.24 3.24 3.24 3.24 2.58-1.5c.72-.42.72-1.14 0-1.5zM4.14.24L16.68 7.48l-2.88 2.88-12.54-7.24c.3-.18.66-.18.96 0z" />
              </svg>
              {t('playStore')}
            </span>
          </div>
          <p className="text-faint text-xs text-center">{t('footerCaption')}</p>
        </div>
      </main>
    </>
  )
}
