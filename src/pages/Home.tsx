import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="flex flex-col items-center justify-between flex-1 px-6 py-12">
      {/* Top spacer */}
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
        </div>

        {/* Mini explication */}
        <div className="w-full grid grid-cols-3 gap-3 fade-in">
          {[
            { icon: '🔥', label: 'Drama Score' },
            { icon: '✏️', label: 'Vrai éditions' },
            { icon: '📤', label: 'Partage facile' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 bg-slate-900 rounded-xl py-3 px-2 border border-slate-800">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs text-slate-400 text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="text-slate-600 text-xs text-center">
        Propulsé par l'API Wikipedia · Aucun compte requis
      </p>
    </main>
  )
}
