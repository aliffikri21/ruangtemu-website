"use client";

import { useEffect, useRef, useState } from "react";

export default function MaintenanceView() {
  const [isTrying, setIsTrying] = useState(false);
  const [toastText, setToastText] = useState("");
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Optional countdown target ISO string (set null if not specified)
  const [untilDate] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<{ d: number; h: string; m: string; s: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const triggerToast = (msg: string) => {
    setToastText(msg);
    setShowToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 2200);
  };

  const handleTryConnect = () => {
    if (isTrying) return;
    setIsTrying(true);

    setTimeout(() => {
      triggerToast("Belum tersambung. Tim kami masih bekerja.");
    }, 650);

    setTimeout(() => {
      setIsTrying(false);
    }, 1900);
  };

  const handleCopyEmail = () => {
    const email = "halo@ruangtemu.id";
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(email)
        .then(() => triggerToast("Email disalin: " + email))
        .catch(() => triggerToast("Email: " + email));
    } else {
      triggerToast("Email: " + email);
    }
  };

  // Optional countdown logic
  useEffect(() => {
    if (!untilDate) return;
    const end = new Date(untilDate).getTime();
    if (isNaN(end)) return;

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    const tick = () => {
      const ms = end - Date.now();
      if (ms <= 0) {
        setIsCompleted(true);
        return;
      }
      const s = Math.floor(ms / 1000);
      setCountdown({
        d: Math.floor(s / 86400),
        h: pad(Math.floor((s % 86400) / 3600)),
        m: pad(Math.floor((s % 3600) / 60)),
        s: pad(s % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [untilDate]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <style dangerouslySetInnerHTML={{
        __html: `
:root{
  --paper:#f8fafc; --paper-2:#eef2f6; --ink:#0c1017; --ink-2:#3b4758; --mut:#738194;
  --mag:#2563eb; --pink:#38bdf8; --blush:#dbeafe; --line:#e2e8f0;
  --f-display:'Bricolage Grotesque','Segoe UI',system-ui,sans-serif;
  --f-body:'Instrument Sans','Segoe UI',system-ui,sans-serif;
  --f-mono:'DM Mono',ui-monospace,Menlo,Consolas,monospace;
}
.maint-body *{box-sizing:border-box}
.maint-body{
  min-height:100vh;
  margin:0;
  background:var(--paper);
  color:var(--ink);
  font:400 16px/1.55 var(--f-body);
  -webkit-font-smoothing:antialiased;
  overflow-x:clip;
  display:flex;
  flex-direction:column;
}
.maint-body h1,.maint-body p{margin:0}
.maint-body a{color:inherit}
.maint-body :focus-visible{outline:2px solid var(--mag);outline-offset:3px}

.page{min-height:100vh;display:flex;flex-direction:column}
.pad{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}

/* ---------- header ---------- */
.top{display:flex;justify-content:center;padding-block:26px 0}
.logo{display:inline-flex;align-items:center;gap:10px;font:800 18px/1 var(--f-display);letter-spacing:-.02em;text-decoration:none}
.logo svg,.logo img{width:30px;height:30px;border-radius:50%;object-fit:cover;box-shadow:0 2px 6px rgba(12,16,23,.15)}
.logo small{font:500 11px/1 var(--f-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-left:-2px}

/* ---------- isi ---------- */
.maint-main{flex:1;display:flex;flex-direction:column;justify-content:center;gap:clamp(16px,2.6vw,30px);padding-block:clamp(20px,3vw,40px)}
.copy{text-align:center;display:grid;gap:16px;justify-items:center;margin:0 auto;max-width:720px}
.pill{display:inline-flex;align-items:center;gap:10px;font:500 12px/1 var(--f-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--mag);background:rgba(37,99,235,.08);border:1px solid rgba(37,99,235,.18);padding:9px 14px;border-radius:999px}
.dot{width:8px;height:8px;border-radius:50%;background:var(--mag);animation:ping 2s infinite}
@keyframes ping{0%{box-shadow:0 0 0 0 rgba(37,99,235,.5)}70%{box-shadow:0 0 0 9px rgba(37,99,235,0)}100%{box-shadow:0 0 0 0 rgba(37,99,235,0)}}
.maint-body h1{font:800 clamp(38px,5.6vw,68px)/1 var(--f-display);letter-spacing:-.045em;text-wrap:balance}
.maint-body h1 em{font-style:normal;color:var(--mag)}
.lead{color:var(--ink-2);font-size:clamp(16px,1.6vw,19px);max-width:54ch;text-wrap:pretty}
.rise{animation:rise .8s cubic-bezier(.2,.7,.2,1) backwards}
.rise:nth-child(2){animation-delay:.08s}.rise:nth-child(3){animation-delay:.16s}.rise:nth-child(4){animation-delay:.24s}.rise:nth-child(5){animation-delay:.32s}
@keyframes rise{from{opacity:0;translate:0 24px}}

/* progres tak terbatas */
.bar{width:min(260px,70%);height:6px;border-radius:99px;background:var(--line);overflow:hidden}
.bar i{display:block;width:38%;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--pink),var(--mag));animation:slide 1.7s cubic-bezier(.6,0,.4,1) infinite}
@keyframes slide{from{translate:-110% 0}to{translate:290% 0}}

/* hitung mundur (muncul bila UNTIL diisi) */
.eta{display:grid;gap:10px;justify-items:center}
.eta>span{font:500 11.5px/1 var(--f-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--mut)}
.eta-t{display:flex;gap:8px}
.eta-t div{min-width:68px;padding:10px 8px 8px;border-radius:16px;background:#fff;border:1px solid var(--line);text-align:center;box-shadow:0 8px 24px rgba(37,99,235,.08)}
.eta-t b{display:block;font:800 28px/1 var(--f-display);letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.eta-t small{font:500 10px/1 var(--f-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--mag)}

/* ---------- ilustrasi ---------- */
.scene{display:flex;justify-content:center;overflow:hidden;padding-block:6px 0}
.scene svg{flex:none;width:max(620px,min(100%,820px));height:auto;overflow:visible;display:block}
.cable{fill:none;stroke-width:18;stroke-linecap:butt;stroke-linejoin:round}
.pl,.pr{transition:transform .55s cubic-bezier(.3,1.5,.5,1)}
.try .pl{transform:translateX(60px)}
.try .pr{transform:translateX(-60px)}
.spark{transform-box:fill-box;transform-origin:center;animation:spark 1.6s ease-in-out infinite}
@keyframes spark{0%,100%{opacity:.12;scale:.7}50%{opacity:1;scale:1.12}}
.try .spark{animation:none;opacity:1;scale:1.7;transition:scale .3s,opacity .3s}
.float{animation:float 4.6s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(-5px) rotate(-4deg)}50%{transform:translateY(7px) rotate(-1.5deg)}}
.fl{opacity:0;animation:flash 5.4s infinite}
.fl.b{animation-delay:1.8s}.fl.c{animation-delay:3.6s}
@keyframes flash{0%{opacity:0}4%{opacity:.95}16%{opacity:0}100%{opacity:0}}

.cta{display:flex;justify-content:center}
.btn{display:inline-flex;align-items:center;gap:14px;font:600 15px/1 var(--f-body);border-radius:999px;padding:8px 8px 8px 24px;min-height:54px;cursor:pointer;border:1.5px solid rgba(14,10,12,.16);background:rgba(255,255,255,.7);color:var(--ink);transition:transform .2s,background .2s}
.btn:hover{transform:translateY(-2px);background:#fff}
.btn:disabled{opacity:.7;cursor:progress;transform:none}
.btn-ic{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--mag);color:#fff;flex:none}
.btn-ic svg{width:18px;height:18px}

/* ---------- footer ---------- */
.foot{border-top:1px solid var(--line);background:rgba(255,255,255,.55)}
.foot-in{display:flex;justify-content:center;align-items:center;gap:10px 22px;flex-wrap:wrap;padding-block:18px;font-size:14px}
.foot-in>span{color:var(--mut)}
.chip{display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:var(--ink);padding:9px 14px;border-radius:999px;border:1px solid var(--line);background:#fff;font-weight:500;transition:border-color .2s,color .2s;cursor:pointer;font-family:inherit;font-size:inherit}
.chip:hover{border-color:var(--mag);color:var(--mag)}
.chip small{font:500 10.5px/1 var(--f-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--mag)}
.chip b{font-weight:500;overflow-wrap:anywhere}

.toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translate(-50%,20px);background:var(--ink);color:#fff;padding:12px 18px;border-radius:999px;font-size:14px;opacity:0;pointer-events:none;transition:.25s;z-index:40;max-width:calc(100% - 32px);text-align:center}
.toast.on{opacity:1;transform:translate(-50%,0)}

@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition-duration:.01ms!important}.fl{opacity:0}.spark{opacity:.7}}
`}} />

      <div className="maint-body">
        <div className="page">
          <header className="top pad">
            <a className="logo" href="/" aria-label="RUANGTEMU Digital">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-ruangtemu.jpg"
                alt="RUANGTEMU"
                width={30}
                height={30}
              />
              RUANGTEMU <small>Digital</small>
            </a>
          </header>

          <main className="maint-main">
            <section className="copy pad" aria-labelledby="judul">
              <span className="pill rise">
                <span className="dot"></span>Pemeliharaan sistem
              </span>
              <h1 id="judul" className="rise">
                Booth sedang <em>dalam perawatan</em>
              </h1>
              <p className="lead rise">
                Mohon maaf atas ketidaknyamanannya. Kami hampir selesai. Ada acara dalam waktu dekat? Hubungi kami lewat WhatsApp.
              </p>
              <div className="bar rise" role="progressbar" aria-label="Pemeliharaan sedang berlangsung">
                <i></i>
              </div>

              {untilDate && (
                <div className="eta rise" id="eta">
                  <span id="eta-label">{isCompleted ? "Segera kembali" : "Perkiraan selesai"}</span>
                  {!isCompleted && countdown && (
                    <div className="eta-t" id="eta-t">
                      <div>
                        <b id="d">{countdown.d}</b>
                        <small>hari</small>
                      </div>
                      <div>
                        <b id="h">{countdown.h}</b>
                        <small>jam</small>
                      </div>
                      <div>
                        <b id="m">{countdown.m}</b>
                        <small>menit</small>
                      </div>
                      <div>
                        <b id="s">{countdown.s}</b>
                        <small>detik</small>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="scene" id="art-wrap">
              <svg
                id="art"
                className={isTrying ? "try" : ""}
                viewBox="0 0 960 276"
                role="img"
                aria-label="Kabel photobooth yang sedang terputus, dengan photostrip melayang di antaranya"
              >
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#93c5fd" />
                    <stop offset="1" stopColor="#2563eb" />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#38bdf8" />
                    <stop offset="1" stopColor="#0284c7" />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#c7d2fe" />
                    <stop offset="1" stopColor="#4318ff" />
                  </linearGradient>
                  <filter id="sh" x="-40%" y="-30%" width="180%" height="170%">
                    <feDropShadow dx="0" dy="12" stdDeviation="11" floodColor="#1e3a8a" floodOpacity=".22" />
                  </filter>
                  <clipPath id="cpl">
                    <rect x="300" y="186" width="84" height="68" rx="14" />
                  </clipPath>
                  <clipPath id="cpr">
                    <rect x="588" y="186" width="84" height="68" rx="14" />
                  </clipPath>
                </defs>

                {/* sisi kiri: kabel dan colokan */}
                <g className="pl">
                  <path className="cable" stroke="#bfdbfe" d="M -3000 168 H 196 Q 222 168 222 194 Q 222 220 248 220 H 306" />
                  <g clipPath="url(#cpl)">
                    <rect x="300" y="186" width="42" height="34" fill="#1d4ed8" />
                    <rect x="342" y="186" width="42" height="34" fill="#2563eb" />
                    <rect x="300" y="220" width="42" height="34" fill="#1e40af" />
                    <rect x="342" y="220" width="42" height="34" fill="#3b82f6" />
                  </g>
                  <rect x="384" y="198" width="14" height="44" rx="3" fill="#dbeafe" />
                  <rect x="398" y="203" width="36" height="10" rx="3" fill="#0c1017" />
                  <rect x="398" y="227" width="36" height="10" rx="3" fill="#38bdf8" />
                </g>

                {/* sisi kanan: soket dan kabel */}
                <g className="pr">
                  <path className="cable" stroke="#0f172a" d="M 672 220 H 736 Q 762 220 762 194 Q 762 168 788 168 H 4000" />
                  <g clipPath="url(#cpr)">
                    <rect x="588" y="186" width="42" height="34" fill="#0c1017" />
                    <rect x="630" y="186" width="42" height="34" fill="#172554" />
                    <rect x="588" y="220" width="42" height="34" fill="#0f172a" />
                    <rect x="630" y="220" width="42" height="34" fill="#1e293b" />
                  </g>
                  <rect x="574" y="198" width="14" height="44" rx="3" fill="#38bdf8" />
                  <rect x="588" y="203" width="26" height="10" rx="2" fill="#1e3a8a" />
                  <rect x="588" y="227" width="26" height="10" rx="2" fill="#1e3a8a" />
                </g>

                {/* kilatan blitz di celah */}
                <g className="spark" id="spark">
                  <g stroke="#38bdf8" strokeWidth="4" strokeLinecap="round">
                    <line x1="493" y1="190" x2="493" y2="176" />
                    <line x1="493" y1="250" x2="493" y2="264" />
                    <line x1="463" y1="220" x2="449" y2="220" />
                    <line x1="523" y1="220" x2="537" y2="220" />
                    <line x1="472" y1="199" x2="462" y2="189" />
                    <line x1="514" y1="199" x2="524" y2="189" />
                    <line x1="472" y1="241" x2="462" y2="251" />
                    <line x1="514" y1="241" x2="524" y2="251" />
                  </g>
                  <circle cx="493" cy="220" r="6" fill="#2563eb" />
                </g>

                {/* photostrip melayang */}
                <g transform="translate(493 100)">
                  <g className="float" filter="url(#sh)">
                    <rect x="-36" y="-96" width="72" height="192" rx="7" fill="#fff" />
                    <rect x="-28" y="-88" width="56" height="50" rx="3" fill="url(#g1)" />
                    <rect x="-28" y="-34" width="56" height="50" rx="3" fill="url(#g2)" />
                    <rect x="-28" y="20" width="56" height="50" rx="3" fill="url(#g3)" />
                    <g fill="#fff" fillOpacity=".66">
                      <circle cx="0" cy="-70" r="8" />
                      <path d="M-17 -38 Q-17 -58 0 -58 Q17 -58 17 -38 Z" />
                      <circle cx="-9" cy="-16" r="7" />
                      <path d="M-24 16 Q-24 -2 -9 -2 Q6 -2 6 16 Z" />
                      <circle cx="14" cy="-13" r="6" />
                      <path d="M2 16 Q2 0 14 0 Q26 0 26 16 Z" />
                      <circle cx="0" cy="38" r="8" />
                      <path d="M-17 70 Q-17 50 0 50 Q17 50 17 70 Z" />
                    </g>
                    <rect className="fl a" x="-28" y="-88" width="56" height="50" rx="3" fill="#fff" />
                    <rect className="fl b" x="-28" y="-34" width="56" height="50" rx="3" fill="#fff" />
                    <rect className="fl c" x="-28" y="20" width="56" height="50" rx="3" fill="#fff" />
                    <text
                      x="0"
                      y="87"
                      textAnchor="middle"
                      fontFamily="DM Mono, monospace"
                      fontSize="7"
                      fontWeight="500"
                      letterSpacing="1.4"
                      fill="#2563eb"
                    >
                      RUANGTEMU
                    </text>
                  </g>
                </g>
              </svg>
            </div>

            <div className="cta pad">
              <button
                className="btn"
                id="try"
                type="button"
                onClick={handleTryConnect}
                disabled={isTrying}
              >
                Coba sambungkan kabelnya{" "}
                <span className="btn-ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 3L5 14h6l-1 7 8-11h-6z" />
                  </svg>
                </span>
              </button>
            </div>
          </main>

          <footer className="foot">
            <div className="foot-in pad">
              <span>Butuh bantuan?</span>
              <a
                className="chip"
                href="https://wa.me/6282244866088?text=Halo%20RUANGTEMU%2C%20saya%20mau%20tanya%20soal%20acara%20saya."
                target="_blank"
                rel="noopener noreferrer"
              >
                <small>WhatsApp</small>
                <b>+62 822-4486-6088</b>
              </a>
              <a
                className="chip"
                href="https://www.instagram.com/ruangtemuphotobooth/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <small>Instagram</small>
                <b>@ruangtemuphotobooth</b>
              </a>
              <button
                className="chip"
                type="button"
                id="mail"
                onClick={handleCopyEmail}
                data-copy="halo@ruangtemu.id"
                aria-label="Salin alamat email halo@ruangtemu.id"
              >
                <small>Email</small>
                <b>halo@ruangtemu.id</b>
              </button>
            </div>
          </footer>
        </div>

        <div
          className={`toast ${showToast ? "on" : ""}`}
          id="toast"
          role="status"
          aria-live="polite"
        >
          {toastText}
        </div>
      </div>
    </>
  );
}
