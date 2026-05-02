import { useTranslation } from 'react-i18next'
import Icon from './Icon'

interface Props {
  onReturnHome: () => void
}

export default function SuddenDeathOverlay({ onReturnHome }: Props) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 px-6 text-center backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col items-center gap-5">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-red-500/50 bg-red-500/15 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.25)]">
          <Icon name="x" className="h-11 w-11" />
        </span>
        <p className="text-balance text-xl font-extrabold leading-tight text-white">
          {t('suddenDeathExpiredMessage')}
        </p>
        <button
          onClick={onReturnHome}
          className="inline-flex items-center justify-center rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-red-600 active:scale-95"
        >
          {t('suddenDeathReturn')}
        </button>
      </div>
    </div>
  )
}
