export function ChristianPattern() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="christianPattern"
          x="0"
          y="0"
          width="260"
          height="260"
          patternUnits="userSpaceOnUse"
        >
          <g
            opacity="0.28"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* CRUZ */}
            <g transform="translate(34 28)">
              <path d="M18 0v52" strokeWidth="2.6" />
              <path d="M0 18h36" strokeWidth="2.6" />
              <path d="M18 52v10" strokeWidth="1.8" opacity="0.55" />
            </g>

            {/* BÍBLIA ABERTA */}
            <g transform="translate(104 24)">
              <path
                d="M8 16c10-7 22-10 35-10 12 0 23 3 32 8v48c-9-5-20-8-32-8-13 0-25 3-35 10Z"
                strokeWidth="2.2"
              />
              <path
                d="M75 16c-10-7-22-10-35-10-12 0-23 3-32 8v48c9-5 20-8 32-8 13 0 25 3 35 10Z"
                strokeWidth="2.2"
              />
              <path d="M43 8v50" strokeWidth="1.8" opacity="0.75" />
              <path d="M16 22c9-4 18-6 27-6" strokeWidth="1.4" opacity="0.5" />
              <path d="M70 22c-9-4-18-6-27-6" strokeWidth="1.4" opacity="0.5" />
            </g>

            {/* PEIXE CRISTÃO */}
            <g transform="translate(196 48)">
              <path
                d="M0 18c12-12 27-18 44-18 17 0 32 6 44 18-12 12-27 18-44 18C27 36 12 30 0 18Z"
                strokeWidth="2.4"
              />
              <path d="M20 18 44 2" strokeWidth="2" opacity="0.85" />
            </g>

            {/* POMBA */}
            <g transform="translate(26 126)">
              <path
                d="M8 30c10-15 24-24 42-26 9-1 18 0 27 3-8 2-14 6-18 12 11 0 22 4 30 10-12 2-21 8-28 16-8 10-19 17-33 19-14 2-25-2-34-10 2-8 7-17 14-24Z"
                strokeWidth="2.2"
              />
              <path d="M60 17c8-8 18-12 31-13" strokeWidth="1.7" opacity="0.7" />
              <path d="M30 52c10 2 19 1 28-3" strokeWidth="1.6" opacity="0.6" />
            </g>

            {/* CHAMA */}
            <g transform="translate(122 132)">
              <path
                d="M28 0c12 13 20 24 23 37 4 18-7 36-28 42-21 6-42-7-47-29-4-19 5-34 22-48 0 14 5 22 14 28 2-13 7-22 16-30Z"
                strokeWidth="2.2"
              />
              <path
                d="M26 24c7 8 11 15 12 23 2 11-5 22-17 25-12 3-24-4-27-16-3-11 2-20 12-28 0 8 3 13 8 17 1-8 5-15 12-21Z"
                strokeWidth="1.7"
                opacity="0.75"
              />
            </g>

            {/* COROA */}
            <g transform="translate(202 150)">
              <path
                d="M2 34 12 10l17 15 17-20 17 20 17-15 10 24Z"
                strokeWidth="2.2"
              />
              <path d="M6 34h74" strokeWidth="2.2" />
              <circle cx="12" cy="10" r="2.4" strokeWidth="1.4" />
              <circle cx="29" cy="25" r="2.2" strokeWidth="1.4" />
              <circle cx="46" cy="5" r="2.6" strokeWidth="1.4" />
              <circle cx="63" cy="25" r="2.2" strokeWidth="1.4" />
              <circle cx="80" cy="10" r="2.4" strokeWidth="1.4" />
            </g>

            {/* ESTRELAS / DETALHES */}
            <g opacity="0.65">
              <path d="M92 118v10M87 123h10" strokeWidth="1.6" />
              <path d="M178 116v8M174 120h8" strokeWidth="1.4" />
              <path d="M228 108v10M223 113h10" strokeWidth="1.6" />
              <path d="M104 214v8M100 218h8" strokeWidth="1.4" />
            </g>

            {/* PONTOS SUAVES */}
            <g fill="currentColor" stroke="none" opacity="0.38">
              <circle cx="78" cy="92" r="2.4" />
              <circle cx="152" cy="104" r="2.1" />
              <circle cx="236" cy="90" r="2.3" />
              <circle cx="62" cy="226" r="2.2" />
              <circle cx="170" cy="228" r="2.4" />
            </g>
          </g>
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#christianPattern)" />
    </svg>
  );
}