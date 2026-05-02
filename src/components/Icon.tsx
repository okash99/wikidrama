type IconName =
  | 'barChart'
  | 'check'
  | 'clipboard'
  | 'handshake'
  | 'phone'
  | 'pointerUp'
  | 'refresh'
  | 'scale'
  | 'skull'
  | 'trophy'
  | 'twitter'
  | 'whatsapp'
  | 'x'

interface Props {
  name: IconName
  className?: string
}

export default function Icon({ name, className = 'h-4 w-4' }: Props) {
  const common = {
    'aria-hidden': true,
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2.3,
    viewBox: '0 0 24 24',
  }

  if (name === 'barChart') {
    return (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-5" />
        <path d="M12 16V8" />
        <path d="M16 16v-8" />
      </svg>
    )
  }

  if (name === 'check') {
    return (
      <svg {...common}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  }

  if (name === 'clipboard') {
    return (
      <svg {...common}>
        <path d="M9 4h6l1 2h3v15H5V6h3z" />
        <path d="M9 4h6v4H9z" />
      </svg>
    )
  }

  if (name === 'handshake') {
    return (
      <svg {...common}>
        <path d="m8 12 3-3 3 3" />
        <path d="m2 12 4-4 5 5" />
        <path d="m22 12-4-4-5 5" />
        <path d="m7 13 3 3a2 2 0 0 0 3 0l4-4" />
      </svg>
    )
  }

  if (name === 'phone') {
    return (
      <svg {...common}>
        <rect x="7" y="2.8" width="10" height="18.4" rx="2.3" />
        <path d="M11 18h2" />
      </svg>
    )
  }

  if (name === 'pointerUp') {
    return (
      <svg {...common}>
        <path d="M12 3v11" />
        <path d="m8 7 4-4 4 4" />
        <path d="M6 14v2a5 5 0 0 0 5 5h2a5 5 0 0 0 5-5v-2" />
      </svg>
    )
  }

  if (name === 'refresh') {
    return (
      <svg {...common}>
        <path d="M20 12a8 8 0 0 1-13.7 5.6" />
        <path d="M4 12A8 8 0 0 1 17.7 6.4" />
        <path d="M17 2v5h5" />
        <path d="M7 22v-5H2" />
      </svg>
    )
  }

  if (name === 'scale') {
    return (
      <svg {...common}>
        <path d="M12 3v18" />
        <path d="M5 7h14" />
        <path d="m6 7-3 6h6z" />
        <path d="m18 7-3 6h6z" />
      </svg>
    )
  }

  if (name === 'skull') {
    return (
      <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none">
        <path
          d="M8.1 14.9 3.7 19.3M20.3 14.9l-4.4 4.4M7.2 16l-2.6 2.6M19.4 16l-2.6 2.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        <path
          d="M7.2 18.6 4.6 16M19.4 18.6 16.8 16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        <path
          d="M12 3.2c-4.45 0-7.7 3.45-7.7 7.9 0 2.54 1.12 4.67 3.05 6.03V19a1.9 1.9 0 0 0 1.9 1.9h5.5a1.9 1.9 0 0 0 1.9-1.9v-1.87c1.93-1.36 3.05-3.5 3.05-6.03 0-4.45-3.25-7.9-7.7-7.9Z"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.45 10.55c0-1.18.8-2 1.9-2 1.08 0 1.8.78 1.8 1.95 0 1.3-.75 2.05-1.8 2.05-1.1 0-1.9-.82-1.9-2ZM15.55 10.55c0-1.18-.8-2-1.9-2-1.08 0-1.8.78-1.8 1.95 0 1.3.75 2.05 1.8 2.05 1.1 0 1.9-.82 1.9-2Z"
          fill="currentColor"
        />
        <path
          d="M12 12.55 10.85 14.2h2.3L12 12.55Z"
          fill="currentColor"
          opacity="0.96"
        />
        <path
          d="M8.85 16.35c.9-.72 2.02-1.05 3.15-1.05s2.25.33 3.15 1.05"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M9.3 18.05v1.8M12 17.75v2.15M14.7 18.05v1.8"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (name === 'trophy') {
    return (
      <svg {...common}>
        <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
        <path d="M8 6H5a3 3 0 0 0 3 5" />
        <path d="M16 6h3a3 3 0 0 1-3 5" />
        <path d="M12 13v4" />
        <path d="M9 21h6" />
        <path d="M10 17h4" />
      </svg>
    )
  }

  if (name === 'twitter') {
    return (
      <svg aria-hidden className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 3.2h3.2l-7 8 8.2 10.8h-6.4l-5-6.5L6.2 22H3l7.5-8.6L2.7 3.2h6.6l4.5 5.9zM17.8 20.1h1.8L8.3 5H6.4z" />
      </svg>
    )
  }

  if (name === 'whatsapp') {
    return (
      <svg aria-hidden className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.8A9.1 9.1 0 0 0 4.1 16.4L3 21l4.7-1.2A9.1 9.1 0 1 0 12 2.8Zm0 1.8a7.3 7.3 0 0 1 6.2 11.2 7.3 7.3 0 0 1-9.8 2.3l-.3-.2-2.8.7.7-2.7-.2-.3A7.3 7.3 0 0 1 12 4.6Zm-3 3.8c-.2 0-.5 0-.7.3-.2.2-.8.8-.8 2s.9 2.3 1 2.5c.1.2 1.8 2.8 4.4 3.9 2.2.9 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.6.1a6 6 0 0 1-3-2.6c-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.2-.5s0-.3-.1-.5l-.8-1.8c-.2-.4-.4-.4-.6-.4z" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
