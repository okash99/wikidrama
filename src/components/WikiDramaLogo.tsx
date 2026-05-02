import { useEffect, useRef, useState } from 'react'
import eyeLogoRaw from '../assets/eye-logo.svg?raw'

interface WikiDramaLogoProps {
  label: string
}

export default function WikiDramaLogo({ label }: WikiDramaLogoProps) {
  const [isDramatizing, setIsDramatizing] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  function triggerDrama() {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
    setIsDramatizing(false)

    window.requestAnimationFrame(() => {
      setIsDramatizing(true)
      timeoutRef.current = window.setTimeout(() => {
        setIsDramatizing(false)
        timeoutRef.current = null
      }, 1100)
    })
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={triggerDrama}
      className={`wikidrama-logo ${isDramatizing ? 'is-dramatizing' : ''}`}
    >
      <span className="wikidrama-logo__halo" />
      {/* SVG inline — allows CSS to target .wikidrama-logo__keyhole directly */}
      <span
        aria-hidden="true"
        className="wikidrama-logo__svg"
        dangerouslySetInnerHTML={{ __html: eyeLogoRaw }}
      />
    </button>
  )
}
