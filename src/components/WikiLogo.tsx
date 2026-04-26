export default function WikiLogo({ size = 72 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width={size}
      height={size}
      aria-label="Wikipedia"
    >
      {/* Puzzle globe — simplified negative version in white */}
      <circle cx="25" cy="25" r="24" fill="none" stroke="white" strokeWidth="1.2" opacity="0.15" />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="28"
        fontFamily="Linux Libertine, Georgia, serif"
        fontWeight="bold"
        fill="white"
      >W</text>
    </svg>
  )
}
