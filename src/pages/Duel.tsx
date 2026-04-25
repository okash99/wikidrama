import { useSearchParams, useNavigate } from 'react-router-dom'

export default function Duel() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const mode = searchParams.get('mode') || 'random'

  return (
    <main className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-6">
      <h2 className="text-2xl font-bold">
        {mode === 'random' ? '⚡ Duel Random' : '🗂️ Duel Thématique'}
      </h2>

      {/* Placeholder — Sprint 2 */}
      <div className="w-full rounded-2xl bg-slate-800 border border-slate-700 p-6 text-center">
        <p className="text-slate-400 text-sm">Chargement du duel...</p>
        <p className="text-slate-600 text-xs mt-2">Couche API Wikipedia — Sprint 2</p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="text-slate-500 text-sm underline"
      >
        ← Retour
      </button>
    </main>
  )
}
