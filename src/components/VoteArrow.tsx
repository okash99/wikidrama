import { E } from '../utils/emojis'

interface Props {
  className?: string
}

export default function VoteArrow({ className = '' }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center leading-none translate-y-[-0.02em] ${className}`.trim()}
    >
      {E.vote}
    </span>
  )
}
