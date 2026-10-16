export default function DivingMatcherAnimation() {
  return (
    <div
      role="img"
      aria-label="귀여운 블루피스 다이버가 물속에서 강사를 찾는 애니메이션"
      className="relative h-44 w-64 overflow-hidden rounded-[2rem] border border-cyan-300/30 bg-gradient-to-b from-cyan-500/30 via-sky-700/40 to-slate-950/80 shadow-2xl shadow-cyan-950/40"
    >
      <div className="absolute inset-x-0 top-4 h-px bg-cyan-100/40" />
      <div className="absolute inset-x-8 top-8 h-px bg-cyan-100/20" />
      <span className="matching-bubble matching-bubble-one" />
      <span className="matching-bubble matching-bubble-two" />
      <span className="matching-bubble matching-bubble-three" />

      <svg className="matching-diver absolute left-12 top-7 h-28 w-40 drop-shadow-xl" viewBox="0 0 180 120" aria-hidden="true">
        <g transform="rotate(-12 90 60)">
          <path d="M46 73 C24 72 22 54 10 52" fill="none" stroke="#a5f3fc" strokeWidth="9" strokeLinecap="round" />
          <path d="M120 72 C140 84 151 80 164 92" fill="none" stroke="#0f172a" strokeWidth="13" strokeLinecap="round" />
          <path d="M122 62 C145 58 154 45 168 47" fill="none" stroke="#0f172a" strokeWidth="13" strokeLinecap="round" />
          <path d="M158 91 L176 103 L169 84 Z" fill="#facc15" />
          <path d="M163 47 L179 39 L173 56 Z" fill="#facc15" />
          <path d="M56 54 C72 39 112 42 128 63 L119 83 C96 91 65 84 49 69 Z" fill="#06b6d4" stroke="#cffafe" strokeWidth="3" />
          <circle cx="50" cy="55" r="23" fill="#fed7aa" stroke="#cffafe" strokeWidth="3" />
          <path d="M31 48 C34 29 60 25 69 43 C61 38 43 39 31 48 Z" fill="#172554" />
          <rect x="29" y="44" width="39" height="17" rx="8" fill="#0e7490" stroke="#a5f3fc" strokeWidth="3" />
          <circle cx="40" cy="52" r="4" fill="#e0f2fe" />
          <circle cx="57" cy="52" r="4" fill="#e0f2fe" />
          <path d="M43 66 Q50 72 57 66" fill="none" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M76 55 C67 77 52 88 38 90" fill="none" stroke="#06b6d4" strokeWidth="11" strokeLinecap="round" />
          <path d="M103 55 C112 36 127 28 142 29" fill="none" stroke="#06b6d4" strokeWidth="11" strokeLinecap="round" />
          <circle cx="145" cy="29" r="6" fill="#fed7aa" />
          <circle cx="36" cy="91" r="6" fill="#fed7aa" />
          <path d="M77 80 Q91 91 108 81" fill="none" stroke="#facc15" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-slate-950/90 to-transparent" />
      <span className="absolute -bottom-2 left-5 h-10 w-2 rotate-[-12deg] rounded-full bg-emerald-400/50" />
      <span className="absolute -bottom-3 right-8 h-12 w-2 rotate-[15deg] rounded-full bg-emerald-400/40" />
    </div>
  );
}
