"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "scanning" | "miss";

/* Pola QR 9x9 (hanya dekorasi, bukan kode yang bisa dipindai). Sudut = kotak penanda. */
const QR = [
  "111010111",
  "101101101",
  "111010111",
  "011001011",
  "100110100",
  "010011011",
  "111010010",
  "101110011",
  "111001011",
];
const MOD = 9;

const isFinder = (r: number, c: number) =>
  (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);

export default function NotFoundArt() {
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  function rescan() {
    if (phase === "scanning") return;
    setPhase("scanning");
    timers.current.push(window.setTimeout(() => setPhase("miss"), 1800));
  }

  const message =
    phase === "scanning"
      ? "Memindai kode…"
      : phase === "miss"
        ? "Kode ini tidak terdaftar di sistem."
        : "";

  return (
    <div className="nf-art" data-phase={phase}>
      <svg viewBox="0 0 360 230" role="img" aria-label="Kode QR yang dipindai tetapi tidak mengarah ke photostrip mana pun">
        <defs>
          <filter id="nf-sh" x="-40%" y="-30%" width="180%" height="170%">
            <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#1e3a8a" floodOpacity="0.18" />
          </filter>
          <linearGradient id="nf-sl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#38bdf8" stopOpacity="1" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <clipPath id="nf-qrclip">
            <rect x="0" y="0" width={MOD * 9} height={MOD * 9} rx="4" />
          </clipPath>
        </defs>

        {/* kartu QR */}
        <g transform="translate(26 62) rotate(-6 56 66)">
          <g filter="url(#nf-sh)">
            <rect width="112" height="132" rx="14" fill="#fff" />
          </g>
          <g transform="translate(15 15)">
            <g clipPath="url(#nf-qrclip)">
              {QR.flatMap((row, r) =>
                row.split("").map((ch, c) =>
                  ch === "1" ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c * MOD}
                      y={r * MOD}
                      width={MOD - 1}
                      height={MOD - 1}
                      rx="1.5"
                      fill={isFinder(r, c) ? "#4318ff" : "#0b132b"}
                    />
                  ) : null,
                ),
              )}
              <rect className="nf-scanline" x="-4" y="-4" width={MOD * 9 + 8} height="8" fill="url(#nf-sl)" />
            </g>
          </g>
          <text
            x="56"
            y="116"
            textAnchor="middle"
            fontFamily="var(--font-nf-mono), ui-monospace, monospace"
            fontSize="8.5"
            letterSpacing="1.6"
            fill="#64748b"
          >
            QR ACARA
          </text>
          <g transform="translate(100 4)">
            <circle r="15" fill="#4318ff" />
            <text
              y="4"
              textAnchor="middle"
              fontFamily="var(--font-nf-display), system-ui, sans-serif"
              fontWeight="800"
              fontSize="12"
              fill="#fff"
            >
              404
            </text>
          </g>
        </g>

        {/* jalur putus-putus dengan tanda silang */}
        <path d="M152 118 C 164 110, 176 126, 188 120" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" />
        <g className="nf-cross" stroke="#4318ff" strokeWidth="4" strokeLinecap="round">
          <line x1="196" y1="113" x2="208" y2="125" />
          <line x1="208" y1="113" x2="196" y2="125" />
        </g>
        <path d="M218 119 L 226 119" fill="none" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" />

        {/* photostrip kosong */}
        <g transform="translate(290 112)">
          <g className="nf-strip" filter="url(#nf-sh)">
            <rect x="-38" y="-88" width="76" height="176" rx="8" fill="#fff" />
            {[-80, -30, 20].map((y, i) => (
              <g key={y}>
                <rect x="-30" y={y} width="60" height="46" rx="4" fill="#eff4fe" stroke="#4318ff" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 4" />
                <text
                  className="nf-q"
                  x="0"
                  y={y + 31}
                  textAnchor="middle"
                  fontFamily="var(--font-nf-display), system-ui, sans-serif"
                  fontWeight="800"
                  fontSize="26"
                  fill="#4318ff"
                  data-i={i}
                >
                  ?
                </text>
              </g>
            ))}
            <text
              x="0"
              y="77"
              textAnchor="middle"
              fontFamily="var(--font-nf-mono), ui-monospace, monospace"
              fontSize="7"
              letterSpacing="1.4"
              fill="#4318ff"
            >
              RUANGTEMU
            </text>
          </g>
        </g>
      </svg>

      <button type="button" className="nf-scanbtn" onClick={rescan} disabled={phase === "scanning"}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2M4 12h16" />
        </svg>
        Coba pindai ulang
      </button>
      <p className="nf-scanmsg" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}

