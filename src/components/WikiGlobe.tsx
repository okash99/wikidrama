// Logo Wikipedia puzzle globe — SVG inline, negatif blanc
export default function WikiGlobe({ size = 72 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width={size}
      height={size}
      aria-label="Wikipedia"
    >
      {/* Cercle exterieur */}
      <circle cx="25" cy="25" r="23" fill="none" stroke="white" strokeWidth="1.5"/>

      {/* Lignes de puzzle horizontales */}
      <path d="M4 18 Q8 15 12 18 Q16 21 20 18 Q24 15 28 18 Q32 21 36 18 Q40 15 44 18" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
      <path d="M3 25 Q7 22 11 25 Q15 28 19 25 Q23 22 27 25 Q31 28 35 25 Q39 22 43 25" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
      <path d="M4 32 Q8 29 12 32 Q16 35 20 32 Q24 29 28 32 Q32 35 36 32 Q40 29 44 32" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>

      {/* Lignes de puzzle verticales */}
      <path d="M18 4 Q15 8 18 12 Q21 16 18 20 Q15 24 18 28 Q21 32 18 36 Q15 40 18 44" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
      <path d="M25 3 Q22 7 25 11 Q28 15 25 19 Q22 23 25 27 Q28 31 25 35 Q22 39 25 43" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
      <path d="M32 4 Q29 8 32 12 Q35 16 32 20 Q29 24 32 28 Q35 32 32 36 Q29 40 32 44" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>

      {/* W central */}
      <text
        x="50%"
        y="53%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="18"
        fontFamily="Linux Libertine, Georgia, Times New Roman, serif"
        fontWeight="bold"
        fill="white"
      >W</text>
    </svg>
  )
}
