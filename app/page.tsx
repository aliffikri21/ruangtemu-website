"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { CurvedLoop } from "@/components/reactbits/CurvedLoop";
import CircularText from "@/components/reactbits/CircularText";
import { BookingModal } from "@/components/booking-modal";
import "./landing.css";
import { span } from "motion/react-m";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [curvedFontSize, setCurvedFontSize] = useState(42);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedLandingCategory, setSelectedLandingCategory] = useState<"virtual_photobooth" | "photobooth">("virtual_photobooth");
  const [physicalPrintSize, setPhysicalPrintSize] = useState<"2R" | "4R">("2R");
  const [bookingPackageId, setBookingPackageId] = useState<string | undefined>(undefined);
  const [bookingInitialCategory, setBookingInitialCategory] = useState<"photobooth" | "virtual_photobooth" | undefined>(undefined);

  const [activeBoothCard, setActiveBoothCard] = useState<"virtual" | "fisik">("virtual");
  const [isBoothHovered, setIsBoothHovered] = useState(false);

  useEffect(() => {
    if (isBoothHovered) return;
    const timer = setInterval(() => {
      setActiveBoothCard((prev) => (prev === "virtual" ? "fisik" : "virtual"));
    }, 4500);
    return () => clearInterval(timer);
  }, [isBoothHovered]);

  const handleOpenBooking = (packageId?: string, category?: "photobooth" | "virtual_photobooth") => {
    setBookingPackageId(packageId);
    setBookingInitialCategory(category);
    setIsBookingOpen(true);
  };

  useEffect(() => {
    const updateFontSize = () => {
      if (window.innerWidth < 640) {
        setCurvedFontSize(64);
      } else if (window.innerWidth < 1024) {
        setCurvedFontSize(50);
      } else {
        setCurvedFontSize(40);
      }
    };
    updateFontSize();
    window.addEventListener("resize", updateFontSize);
    return () => window.removeEventListener("resize", updateFontSize);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $ = (s: string, r?: Element | Document) => (r || document).querySelector(s);
    const $$ = (s: string, r?: Element | Document) => Array.prototype.slice.call((r || document).querySelectorAll(s));

    /* ---------- toast + salin ---------- */
    const toastEl = $("#toast");
    let toastT: ReturnType<typeof setTimeout>;
    function toast(msg: string) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add("on");
      clearTimeout(toastT);
      toastT = setTimeout(() => {
        toastEl.classList.remove("on");
      }, 1700);
    }

    const copyButtons = $$(".cp");
    const copyCleanups: Array<() => void> = [];
    copyButtons.forEach((b: HTMLElement) => {
      const handler = () => {
        const txt = b.getAttribute("data-copy") || "";
        const ok = () => {
          toast("Disalin: " + txt);
        };
        const fallback = () => {
          const parent = b.parentNode as HTMLElement;
          const span = parent ? parent.querySelector("span") : null;
          if (span) {
            const r = document.createRange();
            r.selectNodeContents(span);
            const s = getSelection();
            if (s) {
              s.removeAllRanges();
              s.addRange(r);
            }
          }
          toast("Teks terpilih, tekan salin");
        };
        try {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(txt).then(ok, fallback);
          } else {
            fallback();
          }
        } catch {
          fallback();
        }
      };
      b.addEventListener("click", handler);
      copyCleanups.push(() => b.removeEventListener("click", handler));
    });

    /* ---------- nav ---------- */
    const burger = $("#burger") as HTMLButtonElement | null;
    const menu = $("#menu") as HTMLElement | null;
    let burgerHandler: (() => void) | undefined;
    if (burger && menu) {
      burgerHandler = () => {
        const open = menu.hidden;
        menu.hidden = !open;
        burger.setAttribute("aria-expanded", String(open));
      };
      burger.addEventListener("click", burgerHandler);
    }

    const clickOutsideHandler = (e: MouseEvent) => {
      if (menu && !menu.hidden && !menu.contains(e.target as Node) && !burger?.contains(e.target as Node)) {
        menu.hidden = true;
        burger?.setAttribute("aria-expanded", "false");
      }
    };
    document.addEventListener("click", clickOutsideHandler);

    const anchorLinks = $$('a[href^="#"]');
    const anchorCleanups: Array<() => void> = [];
    anchorLinks.forEach((a: HTMLAnchorElement) => {
      const handler = (e: MouseEvent) => {
        const href = a.getAttribute("href") || "";
        const id = href.slice(1);
        const t = id === "top" ? document.body : document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        if (menu && burger) {
          menu.hidden = true;
          burger.setAttribute("aria-expanded", "false");
        }
        if (id === "top") {
          window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        } else {
          t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        }
      };
      a.addEventListener("click", handler);
      anchorCleanups.push(() => a.removeEventListener("click", handler));
    });

    /* ---------- muncul saat masuk layar ---------- */
    let io: IntersectionObserver | null = null;
    if (!reduce && "IntersectionObserver" in window && typeof Element.prototype.animate === "function") {
      io = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            io?.unobserve(e.target);
            const i = +(e.target.getAttribute("data-i") || 0);
            e.target.animate(
              [
                { opacity: 0, translate: "0 28px" },
                { opacity: 1, translate: "0 0" },
              ],
              {
                duration: 760,
                delay: i * 80,
                easing: "cubic-bezier(.2,.7,.2,1)",
                fill: "backwards",
              }
            );
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
      );

      $$("[data-rv]").forEach((el: HTMLElement) => {
        const parent = el.parentElement;
        const sibs = parent ? $$("[data-rv]", parent).filter((x: HTMLElement) => x.parentElement === parent) : [];
        el.setAttribute("data-i", String(Math.min(sibs.indexOf(el), 4)));
        io?.observe(el);
      });
    }

    /* ---------- tilt 3D kartu (mouse saja) ---------- */
    const tiltElements = $$(".tilt");
    const tiltCleanups: Array<() => void> = [];
    tiltElements.forEach((el: HTMLElement) => {
      const moveHandler = (e: PointerEvent) => {
        if (e.pointerType !== "mouse" || reduce) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--ry", ((px - 0.5) * 9).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - py) * 9).toFixed(2) + "deg");
        el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      };
      const leaveHandler = () => {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      };
      el.addEventListener("pointermove", moveHandler as EventListener);
      el.addEventListener("pointerleave", leaveHandler);
      tiltCleanups.push(() => {
        el.removeEventListener("pointermove", moveHandler as EventListener);
        el.removeEventListener("pointerleave", leaveHandler);
      });
    });

    /* ---------- carousel frame ---------- */
    const rail = $("#rail") as HTMLElement | null;
    const prevBtn = $("#prev");
    const nextBtn = $("#next");
    function stepW() {
      const c = rail ? $(".fcard", rail) : null;
      return c ? c.getBoundingClientRect().width + 18 : 320;
    }
    const prevHandler = () => {
      rail?.scrollBy({ left: -stepW(), behavior: reduce ? "auto" : "smooth" });
    };
    const nextHandler = () => {
      rail?.scrollBy({ left: stepW(), behavior: reduce ? "auto" : "smooth" });
    };
    prevBtn?.addEventListener("click", prevHandler);
    nextBtn?.addEventListener("click", nextHandler);

    const railKeyHandler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextHandler();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevHandler();
      }
    };
    rail?.addEventListener("keydown", railKeyHandler);

    let drag: { x: number; s: number; moved: boolean } | null = null;
    const railDownHandler = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !rail) return;
      drag = { x: e.clientX, s: rail.scrollLeft, moved: false };
    };
    const winMoveHandler = (e: PointerEvent) => {
      if (!drag || !rail) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) {
        drag.moved = true;
        rail.classList.add("drag");
      }
      if (drag.moved) rail.scrollLeft = drag.s - dx;
    };
    const winUpHandler = () => {
      if (!drag || !rail) return;
      drag = null;
      rail.classList.remove("drag");
    };
    rail?.addEventListener("pointerdown", railDownHandler as EventListener);
    window.addEventListener("pointermove", winMoveHandler as EventListener);
    window.addEventListener("pointerup", winUpHandler);

    const swatches = $$(".sw");
    const swatchCleanups: Array<() => void> = [];
    swatches.forEach((b: HTMLElement) => {
      const handler = () => {
        swatches.forEach((x: HTMLElement) => {
          x.setAttribute("aria-pressed", String(x === b));
        });
        if (rail) {
          rail.style.setProperty("--fbg", b.getAttribute("data-bg") || "#ffffff");
          rail.style.setProperty("--ffg", b.getAttribute("data-fg") || "#2563eb");
        }
      };
      b.addEventListener("click", handler);
      swatchCleanups.push(() => b.removeEventListener("click", handler));
    });

    /* =====================================================================
       SCENE 3D: satu objek kontur yang mengikuti section aktif
    ===================================================================== */
    const canvas = canvasRef.current || ($("#gl") as HTMLCanvasElement | null);
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      document.documentElement.classList.add("no-gl");
      return;
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.z = 6;
    let halfH = Math.tan(THREE.MathUtils.degToRad(20)) * 6;
    let halfW = halfH;

    const anchor = new THREE.Object3D();

    const strips = new THREE.Group();
    scene.add(strips);

    const texLoader = new THREE.TextureLoader();
    const defs = [
      {
        w: 1.35,
        h: 2.025,
        url: "/frames/frame1-composite.webp",
        pos: [0.75, 0.3, 0.3],
        rot: [0.05, -0.2, -0.14],
      },
      {
        w: 0.92,
        h: 2.774,
        url: "/frames/frame2-composite.webp",
        pos: [-0.15, -0.05, 0.55],
        rot: [-0.04, 0.18, 0.1],
      },
      {
        w: 1.25,
        h: 1.875,
        url: "/frames/frame3-composite.webp",
        pos: [-0.9, -0.8, 0.9],
        rot: [0.04, 0.25, 0.12],
      },
    ];

    const stripMats: THREE.MeshBasicMaterial[] = [];

    defs.forEach((d) => {
      const tex = texLoader.load(d.url, () => {
        renderer.render(scene, camera);
      });
      tex.anisotropy = 8;
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 1,
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(d.w, d.h), mat);
      m.position.set(d.pos[0], d.pos[1], d.pos[2]);
      m.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
      m.userData = { base: d.pos.slice(), rot: d.rot.slice(), ph: Math.random() * 6.28 };
      strips.add(m);
      stripMats.push(mat);
    });

    interface SectionData {
      el: HTMLElement;
      d: { x: number; y: number; s: number; tone: number; strips: number; a: number };
      m: { x: number; y: number; s: number; tone: number; strips: number; a: number };
      top: number;
      h: number;
    }

    const secs: SectionData[] = $$("[data-obj]").map((el: HTMLElement) => {
      const parse = (s: string) => {
        const a = s.split(",").map(Number);
        return { x: a[0], y: a[1], s: a[2], tone: a[3], strips: a[4], a: a[5] };
      };
      return {
        el,
        d: parse(el.getAttribute("data-obj") || "0,0,1,0,1,1"),
        m: parse(el.getAttribute("data-objm") || el.getAttribute("data-obj") || "0,0,1,0,1,1"),
        top: 0,
        h: 0,
      };
    });

    function measure() {
      const sy = window.pageYOffset;
      secs.forEach((s) => {
        const r = s.el.getBoundingClientRect();
        s.top = r.top + sy;
        s.h = r.height;
      });
    }

    const S = { x: 0.42, y: 0.02, s: 1, tone: 0, strips: 1, a: 1 };
    const T = { x: 0.42, y: 0.02, s: 1, tone: 0, strips: 1, a: 1 };
    const ease = (t: number) => t * t * (3 - 2 * t);

    function target() {
      const narrow = window.innerWidth < 820;
      const vc = window.pageYOffset + window.innerHeight * 0.5;
      let i = 0;
      const n = secs.length;
      while (i < n && secs[i].top + secs[i].h * 0.5 < vc) i++;
      const a = secs[Math.max(0, i - 1)];
      const b = secs[Math.min(n - 1, i)];
      let t = 0;
      if (a !== b) {
        const ca = a.top + a.h * 0.5;
        const cb = b.top + b.h * 0.5;
        t = ease(Math.min(1, Math.max(0, (vc - ca) / (cb - ca))));
      }
      const A = narrow ? a.m : a.d;
      const B = narrow ? b.m : b.d;
      (["x", "y", "s", "tone", "strips", "a"] as const).forEach((k) => {
        T[k] = A[k] + (B[k] - A[k]) * t;
      });
    }

    const mouse = { x: 0, y: 0, sx: 0, sy: 0, on: false };
    const mouseMoveHandler = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
      mouse.on = true;
    };
    const mouseLeaveHandler = () => {
      mouse.on = false;
    };

    window.addEventListener("pointermove", mouseMoveHandler, { passive: true });
    document.documentElement.addEventListener("mouseleave", mouseLeaveHandler);

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      halfW = halfH * camera.aspect;
      measure();
    }

    window.addEventListener("resize", resize);
    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(document.body);
    }
    resize();

    const clock = new THREE.Clock();
    let time = 0;
    let animId: number;

    function frame() {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!reduce) time += dt;
      target();
      const k = reduce ? 1 : 1 - Math.pow(0.0015, dt);
      (["x", "y", "s", "tone", "strips", "a"] as const).forEach((key) => {
        S[key] += (T[key] - S[key]) * k;
      });
      mouse.sx += (mouse.x - mouse.sx) * (reduce ? 0 : Math.min(1, dt * 4));
      mouse.sy += (mouse.y - mouse.sy) * (reduce ? 0 : Math.min(1, dt * 4));

      const w = window.innerWidth;
      const isMobile = w < 860;
      if (isMobile) {
        strips.visible = false;
        animId = requestAnimationFrame(frame);
        return;
      }

      const isTablet = w >= 860 && w < 1024;
      const scale = S.s * halfH * (isTablet ? 0.38 : 0.54);
      anchor.position.set(S.x * halfW, S.y * halfH, 0);

      strips.visible = S.strips > 0.02;
      if (strips.visible) {
        strips.position.copy(anchor.position);
        strips.scale.setScalar(scale);
        strips.rotation.y = mouse.sx * 0.22;
        strips.rotation.x = -mouse.sy * 0.14;
        strips.children.forEach((child, i) => {
          const m = child as THREE.Mesh;
          const u = m.userData;
          const bob = reduce ? 0 : Math.sin(time * 0.7 + u.ph) * 0.08;
          m.position.set(u.base[0] + mouse.sx * 0.04 * (i + 1), u.base[1] + bob, u.base[2]);
          m.rotation.set(u.rot[0] + (reduce ? 0 : Math.sin(time * 0.5 + u.ph) * 0.05), u.rot[1], u.rot[2]);
          if (stripMats[i]) {
            stripMats[i].opacity = Math.min(1, S.strips) * S.a;
          }
        });
      }
      renderer.render(scene, camera);
      animId = requestAnimationFrame(frame);
    }

    frame();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(toastT);
      copyCleanups.forEach((c) => c());
      anchorCleanups.forEach((c) => c());
      tiltCleanups.forEach((c) => c());
      swatchCleanups.forEach((c) => c());
      if (burger && burgerHandler) burger.removeEventListener("click", burgerHandler);
      document.removeEventListener("click", clickOutsideHandler);
      prevBtn?.removeEventListener("click", prevHandler);
      nextBtn?.removeEventListener("click", nextHandler);
      rail?.removeEventListener("keydown", railKeyHandler);
      rail?.removeEventListener("pointerdown", railDownHandler as EventListener);
      window.removeEventListener("pointermove", winMoveHandler as EventListener);
      window.removeEventListener("pointerup", winUpHandler);
      window.removeEventListener("pointermove", mouseMoveHandler);
      document.documentElement.removeEventListener("mouseleave", mouseLeaveHandler);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      io?.disconnect();
      renderer?.dispose();
    };
  }, []);

  return (
    <div className="landing-root">
      <canvas id="gl" ref={canvasRef} aria-hidden="true" className="hidden md:block"></canvas>

      <header className="nav" id="top">
        <div className="nav-in">
          <a className="logo" href="#top" aria-label="RUANGTEMU, ke atas">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-ruangtemu.jpg"
              alt="RUANGTEMU"
              className="w-7 h-7 rounded-full object-cover shadow-sm shrink-0"
              style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
            />
            RUANGTEMU
          </a>
          <nav className="links" aria-label="Menu utama">
            <a href="#layanan">Layanan</a>
            <a href="#frame">Frame</a>
            <a href="#paket">Paket</a>
            <a href="#cara">Cara Order</a>
            <a href="#ulasan">Ulasan</a>
          </nav>
          <button
            type="button"
            onClick={() => handleOpenBooking()}
            className="btn btn-ink btn-sm cursor-pointer"
          >
            Reservasi{" "}
            <span className="btn-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </span>
          </button>
          <button className="burger" id="burger" aria-expanded="false" aria-controls="menu">
            Menu
          </button>
        </div>
        <div className="menu" id="menu" hidden>
          <a href="#layanan">Layanan</a>
          <a href="#frame">Frame</a>
          <a href="#paket">Paket</a>
          <a href="#cara">Cara Order</a>
          <a href="#ulasan">Ulasan</a>
          <button
            type="button"
            onClick={() => handleOpenBooking()}
            className="btn btn-ink btn-sm mt-3 w-full justify-center text-center cursor-pointer"
          >
            Reservasi Online
          </button>
        </div>
      </header>

      <main>
        {/* ===================== HERO ===================== */}
        <section className="sec hero" data-obj="0.42,0.06,0.58,0,1,1" data-objm="0.6,-0.16,0.38,0,1,0.85">
          <div className="wrap">
            <div className="hero-top">
              <p className="eyebrow" data-rv="">
                Photobooth modern · Palopo &amp; Luwu Raya
              </p>
              <h1 data-rv="">
                Abadikan momen <em>paling berkesan</em>
              </h1>
              <p className="lead" data-rv="">
                Cetak instan dan Virtual Web Photobooth yang dibuka langsung dari browser tamu. Tanpa instal aplikasi, tanpa antre lama.
              </p>
              <div className="cta-row" data-rv="">
                <button
                  type="button"
                  onClick={() => handleOpenBooking()}
                  className="btn btn-ink cursor-pointer"
                >
                  Reservasi Jadwal Acara{" "}
                  <span className="btn-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M8 7h9v9" />
                    </svg>
                  </span>
                </button>
                <a className="btn btn-ghost" href="#frame">
                  Coba pilih frame{" "}
                  <span className="btn-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M6 13l6 6 6-6" />
                    </svg>
                  </span>
                </a>
              </div>
              <p className="hint">Gerakkan kursor: foto 3D ikut bereaksi</p>
            </div>
            <div className="hero-foot">
              <div
                className="booth-stack tilt"
                data-rv=""
                onMouseEnter={() => setIsBoothHovered(true)}
                onMouseLeave={() => setIsBoothHovered(false)}
                onClick={() => setActiveBoothCard((prev) => (prev === "virtual" ? "fisik" : "virtual"))}
                role="region"
                aria-label="Pilihan Photobooth"
                title="Klik untuk berganti tampilan booth"
              >
                <div className={`booth-card booth-card--virtual glass ${activeBoothCard === "virtual" ? "is-front" : "is-back"}`}>
                  <div className="booth-top">
                    <span className="dot"></span>Virtual Booth · tanpa aplikasi
                  </div>
                  <ol className="booth-steps">
                    <li>
                      <b>Scan</b>QR di meja
                    </li>
                    <li>
                      <b>Pilih</b>frame event
                    </li>
                    <li>
                      <b>Foto</b>unduh HD
                    </li>
                  </ol>
                </div>
                <div className={`booth-card booth-card--fisik glass ${activeBoothCard === "fisik" ? "is-front" : "is-back"}`}>
                  <div className="booth-top">
                    <span className="dot dot--amber"></span>Photobooth Fisik · cetak di tempat
                  </div>
                  <ol className="booth-steps">
                    <li>
                      <b>Datang</b>ke booth
                    </li>
                    <li>
                      <b>Pose</b>depan kamera
                    </li>
                    <li>
                      <b>Cetak</b>bawa pulang
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== LAYANAN ===================== */}
        <section
          className="sec dark"
          id="layanan"
          data-obj="-0.82,0.62,0.5,1,0,0.95"
          data-objm="0.8,0.74,0.4,1,0,0.7"
        >
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow" data-rv="">
                Layanan
              </p>
              <h2 data-rv="">
                Layanan utama <em>RUANGTEMU</em>
              </h2>
              <p className="lead" data-rv="">
                Dari kartu cetak di tangan tamu sampai galeri realtime di layar acara. Semuanya terhubung lewat satu QR Code.
              </p>
            </div>
            <div className="svc-grid">
              <article className="svc tilt" data-rv="">
                <div className="svc-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 9V4h10v5M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2" />
                    <rect x="7" y="14" width="10" height="6" rx="1" />
                  </svg>
                </div>
                <span className="tag">Cetak</span>
                <h3>Cetak Sublimasi Cepat</h3>
                <p>Printer mencetak satu lembar dalam 12 detik, di atas kertas tahan air dan anti pudar.</p>
              </article>
              <article className="svc tilt" data-rv="">
                <div className="svc-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h3v3M21 14v.01M14 21h.01M17 21h4v-4" />
                  </svg>
                </div>
                <span className="tag">Digital</span>
                <h3>Virtual Photobooth</h3>
                <p>Tamu memindai QR Code di meja, lalu berfoto dengan template frame event langsung dari browser.</p>
              </article>
              <article className="svc tilt relative" style={{ overflow: "visible" }} data-rv="">
                <div className="svc-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <path d="M10 8.5v3.2l3-1.6zM8 20h8M12 16v4" />
                  </svg>
                </div>
                <span className="tag">Layar</span>
                <h3>Live Videotron</h3>
                <p>Slideshow otomatis untuk proyektor atau videotron. Foto dan doa dari tamu tampil bergantian.</p>

                <div className="hidden md:block absolute -top-8 sm:-right-12 lg:-top-10 lg:-right-24 pointer-events-auto z-10 select-none scale-90 sm:scale-100 origin-center">
                  <CircularText
                    text="RUANGTEMU PHOTOBOOTH • "
                    spinDuration={20}
                    onHover="speedUp"
                    size={160}
                    fontSize={14}
                    fontWeight={700}
                    fontFamily="var(--f-mono)"
                    className="text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                  </CircularText>
                </div>
              </article>
              <article className="svc tilt" data-rv="">
                <div className="svc-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0014 0M12 18v3" />
                  </svg>
                </div>
                <span className="tag">Suara</span>
                <h3>Voice Note Guestbook</h3>
                <p>Tamu merekam pesan suara untuk pengantin atau penyelenggara, tersimpan rapi sebagai kenangan.</p>
              </article>
              <article className="svc tilt" data-rv="">
                <div className="svc-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <rect x="7.5" y="6.5" width="9" height="7" rx="1" />
                    <path d="M8 17.5h8" />
                  </svg>
                </div>
                <span className="tag">Desain</span>
                <h3>Frame Kustom</h3>
                <p>Strip 3-Foto, 4-Grid, dan Polaroid, dengan font, warna, dan logo yang disesuaikan acara.</p>
              </article>
              <article className="svc tilt" data-rv="">
                <div className="svc-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <circle cx="8.5" cy="9" r="1.5" />
                    <path d="M21 13l-4-4-6 6M12 19v3m0 0l-2-2m2 2l2-2" />
                  </svg>
                </div>
                <span className="tag">Arsip</span>
                <h3>Live Gallery &amp; Unduhan HD</h3>
                <p>Galeri realtime selama acara, dan foto beresolusi penuh siap diunduh oleh tamu dan penyelenggara.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ===================== FRAME ===================== */}
        <section
          className="sec"
          id="frame"
          data-obj="0.86,-0.5,0.55,0,0,0.9"
          data-objm="0.9,-0.72,0.4,0,0,0.55"
        >
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow" data-rv="">
                Frame
              </p>
              <h2 data-rv="">
                Satu acara, <em>satu frame</em> yang khas
              </h2>
              <p className="lead" data-rv="">
                Tim desainer menyiapkan bingkai sesuai tema acara. Coba ganti warna frame di bawah untuk melihat pilihan format yang tersedia.
              </p>
            </div>
            <div className="frame-bar" data-rv="">
              <div className="swatches" role="group" aria-label="Warna frame">
                <span>Warna frame</span>
                <button className="sw" style={{ ["--c" as string]: "#ffffff" }} data-bg="#ffffff" data-fg="#2563eb" aria-pressed="true" aria-label="Putih"></button>
                <button className="sw" style={{ ["--c" as string]: "#15101a" }} data-bg="#15101a" data-fg="#38bdf8" aria-pressed="false" aria-label="Hitam"></button>
                <button className="sw" style={{ ["--c" as string]: "#38bdf8" }} data-bg="#0c1938" data-fg="#38bdf8" aria-pressed="false" aria-label="Biru elektrik"></button>
                <button className="sw" style={{ ["--c" as string]: "#cfe3d3" }} data-bg="#cfe3d3" data-fg="#24503a" aria-pressed="false" aria-label="Hijau sage"></button>
                <button className="sw" style={{ ["--c" as string]: "#dbeafe" }} data-bg="#dbeafe" data-fg="#1d4ed8" aria-pressed="false" aria-label="Biru muda"></button>
              </div>
            </div>
          </div>
          <div className="rail" id="rail" tabIndex={0} aria-label="Contoh format frame">
            <article className="fcard">
              <div className="fstage">
                <div className="fm strip">
                  <div className="ph p1"></div>
                  <div className="ph p2"></div>
                  <div className="ph p3"></div>
                  <div className="cap">RUANGTEMU</div>
                </div>
              </div>
              <div className="meta">
                <span>3 foto</span>
                <span>Vertikal</span>
              </div>
              <h3>Strip 3-Foto</h3>
              <p>Tiga pose dalam satu strip. Klasik, cepat dicetak, mudah dibagikan.</p>
            </article>
            <article className="fcard">
              <div className="fstage">
                <div className="fm grid4">
                  <div className="ph p4"></div>
                  <div className="ph p1"></div>
                  <div className="ph p3"></div>
                  <div className="ph p2"></div>
                  <div className="cap">RUANGTEMU · PALOPO</div>
                </div>
              </div>
              <div className="meta">
                <span>4 foto</span>
                <span>Persegi</span>
              </div>
              <h3>4-Grid</h3>
              <p>Empat foto dalam satu kartu. Cocok untuk rombongan dan pose bebas.</p>
            </article>
            <article className="fcard">
              <div className="fstage">
                <div className="fm pola">
                  <div className="ph p1"></div>
                  <div className="cap">RUANGTEMU · 2026</div>
                </div>
              </div>
              <div className="meta">
                <span>1 foto</span>
                <span>Polaroid</span>
              </div>
              <h3>Polaroid</h3>
              <p>Satu foto besar dengan ruang di bawah untuk nama dan tanggal acara.</p>
            </article>
          </div>
        </section>

        {/* ===================== PAKET ===================== */}
        <section
          className="sec dark"
          id="paket"
          data-obj="-0.86,-0.2,0.6,1,0,0.9"
          data-objm="-0.9,0.7,0.4,1,0,0.6"
        >
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow" data-rv="">
                Paket
              </p>
              <h2 data-rv="">
                Pilih paket yang <em>pas</em> untuk acara Anda
              </h2>
              <p className="lead" data-rv="">
                Harga per event. Tersedia paket booth cetak fisik di lokasi dan virtual photobooth via smartphone.
              </p>
            </div>

            {/* Category Selector Tabs */}
            <div className="flex items-center justify-center mb-8 px-2" data-rv="">
              <div className="w-full max-w-md grid grid-cols-2 p-1 sm:p-1.5 rounded-2xl sm:rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setSelectedLandingCategory("virtual_photobooth")}
                  className={`min-h-[44px] px-3 sm:px-6 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedLandingCategory === "virtual_photobooth"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>Virtual Booth</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLandingCategory("photobooth")}
                  className={`min-h-[44px] px-3 sm:px-6 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedLandingCategory === "photobooth"
                      ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>Booth Fisik</span>
                </button>
              </div>
            </div>

            {selectedLandingCategory === "virtual_photobooth" ? (
              <div className="pk-grid pk-grid-3">
                <article className="pk tilt" data-rv="">
                  <div className="pk-top">
                    <span>Akses 7 hari</span>
                  </div>
                  <h3>Bronze</h3>
                  <div className="price">
                    Rp 250.000<small>per event</small>
                  </div>
                  <ul>
                    <li>Virtual Web Photobooth (Photo Only)</li>
                    <li>1 pilihan desain frame kustom</li>
                    <li>Cetak 100 kartu QR eksklusif</li>
                    <li>Scan QR dan unduhan tanpa batas</li>
                    <li>Akses galeri digital 7 hari</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking("pkg-bronze", "virtual_photobooth")}
                    className="btn btn-light cursor-pointer w-full justify-center text-center"
                  >
                    Pilih Bronze{" "}
                    <span className="btn-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M8 7h9v9" />
                      </svg>
                    </span>
                  </button>
                </article>
                <article className="pk hot tilt" data-rv="">
                  <div className="pk-top">
                    <span>Akses 10 hari</span>
                    <span className="badge">Rekomendasi</span>
                  </div>
                  <h3>Silver</h3>
                  <div className="price">
                    Rp 350.000<small>per event</small>
                  </div>
                  <ul>
                    <li>Foto dan voice message ucapan</li>
                    <li>2 pilihan desain frame kustom</li>
                    <li>Cetak 200 kartu QR eksklusif</li>
                    <li>Scan QR dan unduhan tanpa batas</li>
                    <li>Live gallery slideshow untuk proyektor</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking("pkg-silver", "virtual_photobooth")}
                    className="btn btn-pink cursor-pointer w-full justify-center text-center"
                  >
                    Pilih Silver{" "}
                    <span className="btn-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M8 7h9v9" />
                      </svg>
                    </span>
                  </button>
                </article>
                <article className="pk tilt" data-rv="">
                  <div className="pk-top">
                    <span>Akses 14 hari</span>
                  </div>
                  <h3>Gold</h3>
                  <div className="price">
                    Rp 450.000<small>per event</small>
                  </div>
                  <ul>
                    <li>Foto dan voice message ucapan</li>
                    <li>3 pilihan desain frame kustom</li>
                    <li>Cetak 300 kartu QR eksklusif</li>
                    <li>Scan QR dan unduhan tanpa batas</li>
                    <li>Live gallery real-time &amp; prioritas support</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking("pkg-gold", "virtual_photobooth")}
                    className="btn btn-light cursor-pointer w-full justify-center text-center"
                  >
                    Pilih Gold{" "}
                    <span className="btn-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M8 7h9v9" />
                      </svg>
                    </span>
                  </button>
                </article>
              </div>
            ) : (
              <div>
                {/* Print Size Selector (2R vs 4R) */}
                <div className="flex flex-col items-center justify-center gap-2 mb-8 px-2" data-rv="">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Pilih Format Ukuran Cetak:
                  </span>
                  <div className="inline-flex p-1.5 rounded-2xl sm:rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setPhysicalPrintSize("2R")}
                      className={`min-h-[44px] px-5 py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        physicalPrintSize === "2R"
                          ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>Ukuran 2R (Strip)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhysicalPrintSize("4R")}
                      className={`min-h-[44px] px-5 py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        physicalPrintSize === "4R"
                          ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>Ukuran 4R (Postcard)</span>
                    </button>
                  </div>
                </div>

                <div className="pk-grid pk-grid-4">
                  {/* 1. Paket 2 Jam */}
                  <article className="pk tilt" data-rv="">
                    <div className="pk-top">
                      <span>Durasi 2 Jam</span>
                      <span className="badge bg-amber-500 text-slate-950 font-bold">Booth Fisik</span>
                    </div>
                    <h3>Paket 2 Jam</h3>
                    <div className="price">
                      {physicalPrintSize === "4R" ? "Rp 2.500.000" : "Rp 2.000.000"}
                      <small>Cetak {physicalPrintSize} • per 2 jam acara</small>
                    </div>
                    <ul>
                      <li>Unlimited print foto {physicalPrintSize === "2R" ? "2R (Strip)" : "4R (Postcard)"}</li>
                      <li>Kamera profesional &amp; lighting studio</li>
                      <li>Aneka properti foto seru &amp; fun props</li>
                      <li>2 kru operator ramah standby</li>
                      <li>Link Google Drive soft copy seluruh foto</li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleOpenBooking("pkg-fisik-2h", "photobooth")}
                      className="btn btn-light cursor-pointer w-full justify-center text-center"
                    >
                      Pilih Paket 2 Jam{" "}
                      <span className="btn-ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17L17 7M8 7h9v9" />
                        </svg>
                      </span>
                    </button>
                  </article>

                  {/* 2. Paket 3 Jam (Recommended) */}
                  <article className="pk hot tilt" data-rv="">
                    <div className="pk-top">
                      <span>Durasi 3 Jam</span>
                      <span className="badge bg-amber-500 text-slate-950 font-bold">Rekomendasi Acara</span>
                    </div>
                    <h3>Paket 3 Jam</h3>
                    <div className="price">
                      {physicalPrintSize === "4R" ? "Rp 3.000.000" : "Rp 2.500.000"}
                      <small>Cetak {physicalPrintSize} • per 3 jam acara</small>
                    </div>
                    <ul>
                      <li>Unlimited print foto {physicalPrintSize === "2R" ? "2R (Strip)" : "4R (Postcard)"}</li>
                      <li>Kustom frame template eksklusif sesuai tema</li>
                      <li>Lighting studio, backdrop, &amp; properti tematik</li>
                      <li>2 kru profesional RUANGTEMU standby</li>
                      <li>Link Google Drive soft copy seluruh foto</li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleOpenBooking("pkg-fisik-3h", "photobooth")}
                      className="btn btn-pink cursor-pointer w-full justify-center text-center"
                    >
                      Pilih Paket 3 Jam{" "}
                      <span className="btn-ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17L17 7M8 7h9v9" />
                        </svg>
                      </span>
                    </button>
                  </article>

                  {/* 3. Paket 4 Jam */}
                  <article className="pk tilt" data-rv="">
                    <div className="pk-top">
                      <span>Durasi 4 Jam</span>
                      <span className="badge bg-amber-500 text-slate-950 font-bold">Event Besar</span>
                    </div>
                    <h3>Paket 4 Jam</h3>
                    <div className="price">
                      {physicalPrintSize === "4R" ? "Rp 3.500.000" : "Rp 3.000.000"}
                      <small>Cetak {physicalPrintSize} • per 4 jam acara</small>
                    </div>
                    <ul>
                      <li>4 jam penuh layanan mesin &amp; kru di lokasi</li>
                      <li>Unlimited print foto {physicalPrintSize === "2R" ? "2R (Strip)" : "4R (Postcard)"}</li>
                      <li>Kustom frame template eksklusif sesuai tema</li>
                      <li>Lighting studio &amp; properti tematik lengkap</li>
                      <li>2 kru profesional RUANGTEMU standby</li>
                      <li>Link Google Drive soft copy seluruh foto</li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleOpenBooking("pkg-fisik-4h", "photobooth")}
                      className="btn btn-light cursor-pointer w-full justify-center text-center"
                    >
                      Pilih Paket 4 Jam{" "}
                      <span className="btn-ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17L17 7M8 7h9v9" />
                        </svg>
                      </span>
                    </button>
                  </article>

                  {/* 4. Paket 5 Jam */}
                  <article className="pk tilt" data-rv="">
                    <div className="pk-top">
                      <span>Durasi 5 Jam</span>
                      <span className="badge bg-amber-500 text-slate-950 font-bold">Seharian Penuh</span>
                    </div>
                    <h3>Paket 5 Jam</h3>
                    <div className="price">
                      {physicalPrintSize === "4R" ? "Rp 4.000.000" : "Rp 3.500.000"}
                      <small>Cetak {physicalPrintSize} • per 5 jam acara</small>
                    </div>
                    <ul>
                      <li>5 jam penuh layanan mesin &amp; kru di lokasi</li>
                      <li>Unlimited print foto {physicalPrintSize === "2R" ? "2R (Strip)" : "4R (Postcard)"}</li>
                      <li>Kustom frame template eksklusif sesuai tema</li>
                      <li>Lighting studio &amp; properti tematik lengkap</li>
                      <li>2 kru profesional RUANGTEMU standby</li>
                      <li>Link Google Drive soft copy seluruh foto</li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleOpenBooking("pkg-fisik-5h", "photobooth")}
                      className="btn btn-light cursor-pointer w-full justify-center text-center"
                    >
                      Pilih Paket 5 Jam{" "}
                      <span className="btn-ic">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17L17 7M8 7h9v9" />
                        </svg>
                      </span>
                    </button>
                  </article>
                </div>
              </div>
            )}
            <p className="note" data-rv="">
              Acara di luar Kota Palopo (Luwu, Luwu Utara, Luwu Timur, Toraja)? Tersedia paket perjalanan khusus lewat konsultasi WhatsApp.
            </p>
          </div>
        </section>

        {/* ===================== CARA ORDER ===================== */}
        <section
          className="sec"
          id="cara"
          data-obj="0.86,0.35,0.5,0,0,0.9"
          data-objm="0.9,0.75,0.38,0,0,0.5"
        >
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow" data-rv="">
                Cara order
              </p>
              <h2 data-rv="">
                Dari reservasi sampai <em>arsip digital</em>
              </h2>
            </div>
            <ol className="steps">
              <li className="st" data-rv="">
                <h3>Pilih paket dan tanggal</h3>
                <p>Isi formulir reservasi online atau hubungi admin lewat WhatsApp.</p>
              </li>
              <li className="st" data-rv="">
                <h3>Frame disiapkan</h3>
                <p>Tim desainer membuat bingkai sesuai tema acara Anda.</p>
              </li>
              <li className="st" data-rv="">
                <h3>Hari H</h3>
                <p>Kru mendampingi booth. Tamu membuka Virtual Booth lewat QR di tiap meja.</p>
              </li>
              <li className="st" data-rv="">
                <h3>Bawa pulang</h3>
                <p>Tamu membawa cetakan fisik, penyelenggara menerima arsip digital.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* ===================== ULASAN ===================== */}
        <section
          className="sec rv-sec"
          id="ulasan"
          data-obj="0,-0.12,1.05,0,0,1"
          data-objm="0,-0.05,0.95,0,0,1"
        >
          {/* React Bits Curved Loop Animation - Desktop Only */}
          <div className="hidden md:block w-full overflow-hidden -mt-6 sm:-mt-10 mb-8 sm:mb-14" data-rv="">
            <CurvedLoop
              marqueeText="RUANGTEMU Photobooth ✦ Virtual Photobooth"
              speed={2}
              curveAmount={70}
              direction="left"
              interactive={true}
              color="#2563eb"
              separator="✦"
              separatorColor="#38bdf8"
              fontSize={curvedFontSize}
              fontWeight={800}
              shape="arc"
              containerClassName="w-full flex items-center justify-center overflow-visible py-2"
            />
          </div>

          <div className="wrap">
            <div className="sec-head rv-head">
              <p className="eyebrow" data-rv="">
                Ulasan klien
              </p>
              <h2 data-rv="">
                Kata klien <em>tentang kami</em>
              </h2>
            </div>
            <div className="rv-grid">
              <article className="rv" data-rv="">
                <svg
                  className="rv-quote-icon"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 14"
                >
                  <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
                </svg>
                <p>Memuji kualitas cetak dan keramahan kru yang mendampingi sepanjang acara.</p>
                <footer>
                  <b>Ilva &amp; Ricky</b>
                  <span>Gedung Opu Daeng Risadju, Palopo</span>
                  <i>PERNIKAHAN</i>
                </footer>
              </article>
              <article className="rv" data-rv="">
                <svg
                  className="rv-quote-icon"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 14"
                >
                  <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
                </svg>
                <p>Menyukai fitur Voice Note Guestbook yang membuat pesan tamu terasa lebih personal.</p>
                <footer>
                  <b>Jaya &amp; Rika</b>
                  <span>D&apos;Twins Cafe, Palopo</span>
                  <i>PERNIKAHAN</i>
                </footer>
              </article>
              <article className="rv" data-rv="">
                <svg
                  className="rv-quote-icon"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 14"
                >
                  <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
                </svg>
                <p>Menilai layanan rapi, tepat waktu, dan interaktif berkat live projection di lokasi.</p>
                <footer>
                  <b>Nurul &amp; Iqra</b>
                  <span>Gedung Merdeka Convention Centre, Palopo</span>
                  <i>PERNIKAHAN</i>
                </footer>
              </article>
            </div>
          </div>
        </section>

        {/* ===================== CTA + FOOTER ===================== */}
        <section
          className="sec dark cta-sec"
          id="kontak"
          data-obj="0.55,0,0.9,1,0,0.9"
          data-objm="0,-0.45,0.7,1,0,0.75"
        >
          <div className="wrap">
            <div className="cta-grid">
              <div className="sec-head" style={{ marginBottom: 0 }}>
                <p className="eyebrow" data-rv="">
                  Reservasi
                </p>
                <h2 data-rv="">
                  Amankan <em>tanggal acara</em> Anda
                </h2>
                <p className="lead" data-rv="">
                  Ceritakan acaranya, kami bantu pilih paket dan siapkan frame-nya.
                </p>
                <div className="cta-row" data-rv="" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleOpenBooking()}
                    className="btn btn-pink cursor-pointer"
                  >
                    Formulir Reservasi{" "}
                    <span className="btn-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M8 7h9v9" />
                      </svg>
                    </span>
                  </button>
                  <a
                    className="btn btn-ghost"
                    href="https://wa.me/6282244866088?text=Halo%20RUANGTEMU%2C%20saya%20mau%20reservasi%20jadwal%20acara."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chat via WhatsApp{" "}
                    <span className="btn-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M8 7h9v9" />
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
              <div className="contacts" data-rv="">
                <div className="ct">
                  <div>
                    <small>WhatsApp</small>
                    <a
                      href="https://wa.me/6282244866088"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline transition-all"
                    >
                      +62 822-4486-6088
                    </a>
                  </div>
                  <button className="cp" data-copy="+62 822-4486-6088">
                    Salin
                  </button>
                </div>
                <div className="ct">
                  <div>
                    <small>Instagram</small>
                    <a
                      href="https://instagram.com/ruangtemuphotobooth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline transition-all"
                    >
                      @ruangtemuphotobooth
                    </a>
                  </div>
                  <button className="cp" data-copy="@ruangtemuphotobooth">
                    Salin
                  </button>
                </div>
                <div className="ct">
                  <div>
                    <small>Email</small>
                    <span>halo@ruangtemu.id</span>
                  </div>
                  <button className="cp" data-copy="halo@ruangtemu.id">
                    Salin
                  </button>
                </div>
                <div className="ct">
                  <div>
                    <small>Lokasi</small>
                    <span>Kota Palopo, Sulawesi Selatan</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="foot">
              <div className="foot-left">
                <span>© 2026 RUANGTEMU Digital</span>
                <span className="foot-sep">•</span>
                <span>Photobooth modern untuk Palopo &amp; Luwu Raya</span>
              </div>
              <Link href="/admin" className="admin-login-btn" title="Dashboard Admin">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Login Admin</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <div className="toast" id="toast" role="status" aria-live="polite"></div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialPackageId={bookingPackageId}
        initialCategory={bookingInitialCategory}
        initialPrintSize={physicalPrintSize}
      />
    </div>
  );
}
