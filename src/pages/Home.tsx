import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Wiki<span className="text-red-500">Drama</span>
        </h1>
        <p className="mt-3 text-slate-400 text-base">
          Les guerres d'édition Wikipedia en duels épiques
        </p>
      </div>

      {/* Mode buttons */}
      <div className="w-full flex flex-col gap-4">
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

      {/* Footer tagline */}
      <p className="text-slate-600 text-xs text-center">
        Propulsé par l'API Wikipedia · Aucun compte requis
      </p>
    </main>
  )
}
