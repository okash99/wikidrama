import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { E } from '../utils/emojis'

const MODES = [
  {
    id: 'random',
    label: () => `${E.chaos} Duel Random`,
    desc: () => `Deux articles Wikipedia tires au hasard. Devine lequel a genere le plus de controverses, de reversions et de guerres d'edition.`,
    className: 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20',
    path: '/duel?mode=random',
    special: false,
  },
  {
    id: 'thematic',
    label: () => `${E.thematic} ${E.duelThematic}`,
    desc: () => `Choisis une thematique (Politique, Sport, Science...) et affronte deux articles du meme univers. Plus facile de comparer, plus difficile de se tromper.`,
    className: 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-700',
    path: '/duel?mode=thematic',
    special: false,
  },
  {
    id: 'wikiwars',
    label: () => `${E.pvIcon} WikiWars`,
    desc: () => `Oublie le drama. Qui a ete le plus LU ? Devine quel article a cumule le plus de vues Wikipedia sur les 12 derniers mois.`,
    className: 'bg-gradient-to-r from-purple-950 to-zinc-900 hover:from-purple-900 hover:to-zinc-800 border border-purple-800 shadow-lg shadow-purple-500/10',
    path: '/wikiwars',
    special: true,
  },
]

// Logo Wikipedia puzzle globe SVG inline (negatif blanc)
function WikiGlobe({ size = 80 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width={size} height={size} aria-hidden="true">
      <path fill="white" d="M512 42.667C253.493 42.667 42.667 253.493 42.667 512S253.493 981.333 512 981.333 981.333 770.507 981.333 512 770.507 42.667 512 42.667zm0 85.333c82.24 0 158.4 24.747 222.293 67.2l-28.16 48.747a362.453 362.453 0 0 0-194.133-55.893c-200.533 0-362.667 162.133-362.667 362.667 0 200.533 162.133 362.666 362.667 362.666 200.533 0 362.666-162.133 362.666-362.666a361.6 361.6 0 0 0-55.893-194.133l48.747-28.16A444.16 444.16 0 0 1 938.667 512c0 235.307-190.827 426.667-426.667 426.667C276.693 938.667 85.333 747.307 85.333 512 85.333 276.693 276.693 85.333 512 85.333zM512 256a256 256 0 1 0 0 512 256 256 0 0 0 0-512zm0 85.333a170.667 170.667 0 1 1 0 341.334 170.667 170.667 0 0 1 0-341.334z"/>
    </svg>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <main className="flex flex-col items-center justify-between flex-1 px-6 py-12" style={{ background: '#000' }}>
      <div />

      <div className="flex flex-col items-center gap-8 w-full">
        <div className="text-center fade-in">
          {/* Logo Wikipedia puzzle globe */}
          <div className="mb-4 flex justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2-en.svg/200px-Wikipedia-logo-v2-en.svg.png"
              alt="Wikipedia"
              width={72}
              height={72}
              className="invert opacity-90"
            />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight">
            Wiki<span className="text-red-500">Drama</span>
          </h1>
          <p className="mt-3 text-zinc-400 text-base leading-relaxed max-w-xs mx-auto">
            {E.homeTagline}
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 fade-in">
          {MODES.map((mode) => (
            <div key={mode.id} className="relative">
              {mode.special && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                  <span className="bg-purple-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide uppercase">
                    {E.wwStar} {E.wwSpecial}
                  </span>
                </div>
              )}

              <button
                onClick={() => navigate(mode.path)}
                onMouseEnter={() => setHovered(mode.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(mode.id)}
                onBlur={() => setHovered(null)}
                onTouchStart={() => setHovered(prev => prev === mode.id ? null : mode.id)}
                className={`relative w-full py-5 rounded-2xl active:scale-95 transition-all font-bold text-xl overflow-hidden ${mode.className}`}
              >
                <span className={`block transition-all duration-200 ${
                  hovered === mode.id ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
                }`}>
                  {mode.label()}
                </span>

                <span className={`absolute inset-0 flex items-center justify-center px-5 transition-all duration-200 ${
                  hovered === mode.id
                    ? 'opacity-100 translate-y-0 bg-black/50 backdrop-blur-sm'
                    : 'opacity-0 translate-y-2 pointer-events-none'
                }`}>
                  <span className="text-white/90 text-xs font-normal leading-relaxed text-center">
                    {mode.desc()}
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="w-full fade-in bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 flex flex-col gap-1.5">
          <p className="text-xs text-zinc-400 leading-relaxed text-center">
            {E.dramaScoreCaption}
          </p>
          <p className="text-xs text-zinc-600 text-center font-mono">
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
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-xs"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <span className="text-zinc-700">·</span>
          <a href="#" className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-xs">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.18 23.76c.3.18.66.18.96 0l12.54-7.24-2.88-2.88-10.62 10.12zm-1.14-20.4C1.8 3.6 1.5 3.9 1.5 4.26v15.48c0 .36.3.66.54.9l.12.12L11.04 12v-.24L2.16 3.24l-.12.12zM20.34 10.5l-2.58-1.5-3.24 3.24 3.24 3.24 2.58-1.5c.72-.42.72-1.14 0-1.5zM4.14.24L16.68 7.48l-2.88 2.88-12.54-7.24c.3-.18.66-.18.96 0z"/>
            </svg>
            Play Store
          </a>
        </div>
        <p className="text-zinc-700 text-xs text-center">{E.footerCaption}</p>
      </div>
    </main>
  )
}
