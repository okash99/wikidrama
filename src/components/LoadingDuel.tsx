export default function LoadingDuel() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {[0, 1].map((i) => (
        <div key={i} className="w-full rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden animate-pulse">
          <div className="w-full h-32 bg-slate-800" />
          <div className="p-4 flex flex-col gap-3">
            <div className="h-5 bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
