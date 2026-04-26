import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <main className="flex flex-col flex-1 items-center justify-center gap-6 px-6 text-center">
      <span className="text-6xl">\uD83D\uDD25</span>
      <div className="flex flex-col gap-1">
        <p className="text-white font-extrabold text-2xl">404</p>
        <p className="text-white font-bold text-base">Page introuvable</p>
        <p className="text-slate-400 text-sm mt-1">
          Cette page n'existe pas ou le lien est invalide.
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className="py-3 px-8 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all font-bold text-base"
      >
        \u2694\uFE0F Retour au duel
      </button>
    </main>
  )
}
