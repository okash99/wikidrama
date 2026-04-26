import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="flex flex-col items-center justify-between flex-1 px-6 py-12">
      <div />

      {/* Hero */}
      <div className="flex flex-col items-center gap-8 w-full">
        <div className="text-center fade-in">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-5xl font-extrabold tracking-tight">
            Wiki<span className="text-red-500">Drama</span>
          </h1>
          <p className="mt-3 text-slate-400 text-base leading-relaxed max-w-xs mx-auto">
            Deux articles Wikipedia. Un seul peut être le plus controversé.
          </p>
        </div>

        {/* Mode buttons */}
        <div className="w-full flex flex-col gap-3 fade-in">
          <button
            onClick={() => navigate('/duel?mode=random')}
            className="w-full py-5 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-xl shadow-lg shadow-red-500/20"
          >
            ⚡ Duel Random
          </button>
          <button
            onClick={() => navigate('/duel?mode=thematic')}
            className="w-full py-5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all font-bold text-xl border border-slate-700"
          >
            🗂️ Duel Thématique
          </button>

          {/* WikiWars — Special Mode */}
          <div className="relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-purple-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide uppercase">
                ✨ Special Mode
              </span>
            </div>
            <button
              onClick={() => navigate('/wikiwars')}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-900 to-slate-800 hover:from-purple-800 hover:to-slate-700 active:scale-95 transition-all font-bold text-xl border border-purple-700 shadow-lg shadow-purple-500/10"
            >
              📊 WikiWars
            </button>
          </div>
        </div>

        {/* Drama Score mention */}
        <div className="w-full fade-in bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex flex-col gap-1.5">
          <p className="text-xs text-slate-400 leading-relaxed text-center">
            Score calculé sur <span className="text-white font-semibold">6 métriques Wikipedia</span> :
            {' '}edits, réversions, éditeurs uniques, taux anon, watchers, taux mineur.
          </p>
          <p className="text-xs text-slate-600 text-center font-mono">
            score = f(edits, rev, editors, anon, watch, minor)
          </p>
        </div>
      </div>

      {/* Footer links */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/okash99/wikidrama"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-xs"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="#"
            className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-xs"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.18 23.76c.3.18.66.18.96 0l12.54-7.24-2.88-2.88-10.62 10.12zm-1.14-20.4C1.8 3.6 1.5 3.9 1.5 4.26v15.48c0 .36.3.66.54.9l.12.12L11.04 12v-.24L2.16 3.24l-.12.12zM20.34 10.5l-2.58-1.5-3.24 3.24 3.24 3.24 2.58-1.5c.72-.42.72-1.14 0-1.5zM4.14.24L16.68 7.48l-2.88 2.88-12.54-7.24c.3-.18.66-.18.96 0z"/>
            </svg>
            Play Store
          </a>
        </div>
        <p className="text-slate-700 text-xs text-center">
          Propulsé par l'API Wikipedia · Aucun compte requis
        </p>
      </div>
    </main>
  )
}
