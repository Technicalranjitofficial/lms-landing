"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Download, ExternalLink, Loader2, AlertCircle,
  BookOpen, Copy, CheckCheck, X, Printer, Share2,
  Shield, Star, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { certificatesApi, type CertificateRecord } from "@/lib/api";
import { useAuthContext } from "@/components/AuthProvider";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const ACCENT_PALETTES = [
  { from: "#7c6fff", to: "#22d3ee", mid: "#9d96ff" },
  { from: "#34d399", to: "#06b6d4", mid: "#67e8f9" },
  { from: "#f59e0b", to: "#fb7185", mid: "#fbbf24" },
  { from: "#a78bfa", to: "#7c6fff", mid: "#c4b5fd" },
  { from: "#fb7185", to: "#f43f5e", mid: "#fda4af" },
];

function palette(i: number) {
  return ACCENT_PALETTES[i % ACCENT_PALETTES.length];
}

// ─── Client-side PNG download ─────────────────────────────────────────────────
// We render the certificate SVG into an off-screen container, capture it with
// html-to-image, and trigger a browser download — no backend required.

function useDownloadCert() {
  const [downloading, setDownloading] = useState(false);

  const download = useCallback(async (
    certRef: React.RefObject<HTMLDivElement | null>,
    filename: string,
  ) => {
    if (!certRef.current || downloading) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(certRef.current, {
        quality: 1,
        pixelRatio: 3, // 3× for crisp high-res PNG
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } catch (err) {
      console.error("[cert-download]", err);
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  return { download, downloading };
}

// ─── Certificate SVG Design ───────────────────────────────────────────────────
// Renders as a pure HTML/SVG component — printable and screenshottable.

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  certNumber:  string;
  issuedAt:    string;
  index:       number;
}

function CertificateDocument({ studentName, courseTitle, certNumber, issuedAt, index }: CertificateProps) {
  const THEMES = [
    { sidebar: "#312E81", accent: "#4F46E5", light: "#EEF2FF", mid: "#818CF8" },
    { sidebar: "#164E63", accent: "#0891B2", light: "#ECFEFF", mid: "#67E8F9" },
    { sidebar: "#14532D", accent: "#16A34A", light: "#F0FDF4", mid: "#86EFAC" },
    { sidebar: "#4C1D95", accent: "#7C3AED", light: "#F5F3FF", mid: "#C4B5FD" },
    { sidebar: "#7F1D1D", accent: "#DC2626", light: "#FEF2F2", mid: "#FCA5A5" },
  ];
  const t  = THEMES[index % THEMES.length];
  const bg = `cg-bg-${index}`;
  const sg = `cg-sg-${index}`;
  const mg = `cg-mg-${index}`;
  const wm = `cg-wm-${index}`;
  void mg;

  return (
    <div className="cert-document relative w-full"
      style={{ aspectRatio: "1.414 / 1", maxWidth: "900px" }}>
      <svg viewBox="0 0 900 636" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id={bg} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"  stopColor="#FEFCF8" />
            <stop offset="100%" stopColor="#F5F2EC" />
          </linearGradient>
          <linearGradient id={sg} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor={t.sidebar} />
            <stop offset="100%" stopColor={t.accent} />
          </linearGradient>
          <clipPath id={wm}>
            <rect x="68" y="0" width="832" height="636" />
          </clipPath>
          <clipPath id={`cg-cl-${index}`}>
            <rect width="900" height="636" />
          </clipPath>
        </defs>
        <g clipPath={`url(#cg-cl-${index})`}>
          {/* Paper */}
          <rect width="900" height="636" fill={`url(#${bg})`} />
          {/* Dot texture */}
          <g clipPath={`url(#${wm})`}>
            {Array.from({ length: 28 }).map((_, i) =>
              Array.from({ length: 20 }).map((_, j) => (
                <circle key={`dt-${i}-${j}`} cx={78+i*30} cy={12+j*32}
                  r="0.9" fill="#B0A898" fillOpacity="0.18" />
              ))
            )}
          </g>
          {/* Watermark */}
          <g clipPath={`url(#${wm})`} opacity="0.04">
            <circle cx="450" cy="320" r="180" fill={t.accent} />
            <text x="450" y="300" textAnchor="middle"
              style={{ fontSize:"120px", fontWeight:"bold", fill:t.sidebar,
                fontFamily:"Georgia, serif", letterSpacing:"-4px" }}>CGS</text>
            <text x="450" y="355" textAnchor="middle"
              style={{ fontSize:"22px", fill:t.sidebar,
                fontFamily:"Georgia, serif", letterSpacing:"8px" }}>CERTIFIED</text>
          </g>
          {/* LEFT SIDEBAR */}
          <rect x="0" y="0" width="68" height="636" fill={`url(#${sg})`} />
          <line x1="62" y1="0" x2="62" y2="636" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
          <text x="-318" y="34" transform="rotate(-90)" textAnchor="middle"
            style={{ fontSize:"9px", letterSpacing:"0.28em", fill:"white",
              fontFamily:"Arial, sans-serif", fontWeight:"bold", fillOpacity:"0.8" }}>
            CG SCHOOL OF TECHNOLOGY
          </text>
          {[130,200,270,340,410].map((y,i) => (
            <polygon key={`sd-${i}`}
              points={`34,${y-5} 38,${y} 34,${y+5} 30,${y}`}
              fill="white" fillOpacity="0.25" />
          ))}
          <text x="-565" y="34" transform="rotate(-90)" textAnchor="middle"
            style={{ fontSize:"8px", letterSpacing:"0.18em", fill:"white",
              fontFamily:"Arial, sans-serif", fillOpacity:"0.55" }}>
            EST. 2024
          </text>
          {/* Frame */}
          <rect x="82" y="18" width="800" height="600"
            fill="none" stroke={t.accent} strokeWidth="0.6" strokeOpacity="0.3" />
          <rect x="86" y="22" width="792" height="592"
            fill="none" stroke="#D4CFC7" strokeWidth="0.5" />
          {/* Corner flourishes */}
          {([["M 836,26 L 872,26 L 872,62","M 844,34 L 864,34 L 864,54",872,26],
             ["M 836,610 L 872,610 L 872,574","M 844,602 L 864,602 L 864,582",872,610],
             ["M 124,26 L 88,26 L 88,62","M 116,34 L 96,34 L 96,54",88,26],
             ["M 124,610 L 88,610 L 88,574","M 116,602 L 96,602 L 96,582",88,610],
          ] as [string,string,number,number][]).map(([p1,p2,cx,cy],fi) => (
            <g key={`cf-${fi}`} fill="none" stroke={t.accent} strokeOpacity="0.35">
              <path d={p1} strokeWidth="1.5" />
              <path d={p2} strokeWidth="0.7" />
              <circle cx={cx} cy={cy} r="3" fill={t.accent} fillOpacity="0.4" stroke="none" />
            </g>
          ))}
          {/* Logo circle */}
          <circle cx="480" cy="68" r="26" fill={t.light} stroke={t.accent} strokeWidth="1.2" strokeOpacity="0.5" />
          <circle cx="480" cy="68" r="20" fill={t.accent} fillOpacity="0.12" stroke="none" />
          <text x="480" y="74" textAnchor="middle"
            style={{ fontSize:"16px", fontWeight:"bold", fill:t.sidebar,
              fontFamily:"Georgia, serif", letterSpacing:"0.04em" }}>CGS</text>
          <text x="480" y="108" textAnchor="middle"
            style={{ fontSize:"9px", letterSpacing:"0.32em", fill:"#666666",
              fontFamily:"Arial, sans-serif", fontWeight:"bold" }}>
            CG SCHOOL OF TECHNOLOGY
          </text>
          <line x1="200" y1="118" x2="420" y2="118" stroke="#CCCCCC" strokeWidth="0.8" />
          <polygon points="480,114 484,118 480,122 476,118" fill={t.accent} fillOpacity="0.6" />
          <line x1="540" y1="118" x2="760" y2="118" stroke="#CCCCCC" strokeWidth="0.8" />
          {/* Title */}
          <text x="480" y="155" textAnchor="middle"
            style={{ fontSize:"30px", letterSpacing:"0.08em", fill:"#1A1A1A",
              fontFamily:"Georgia, serif", fontWeight:"bold" }}>CERTIFICATE</text>
          <text x="480" y="176" textAnchor="middle"
            style={{ fontSize:"10.5px", letterSpacing:"0.4em", fill:"#666666",
              fontFamily:"Arial, sans-serif" }}>OF COMPLETION</text>
          <rect x="370" y="185" width="220" height="2.5" rx="1.25" fill={t.accent} />
          <rect x="430" y="188" width="100" height="1" rx="0.5" fill={t.accent} fillOpacity="0.4" />
          {/* Certify text */}
          <text x="480" y="216" textAnchor="middle"
            style={{ fontSize:"11px", fill:"#999999", fontStyle:"italic",
              fontFamily:"Georgia, serif", letterSpacing:"0.06em" }}>
            This is to proudly certify that
          </text>
          {/* Student name shadow + main */}
          <text x="481" y="259" textAnchor="middle"
            style={{ fontSize:"42px", fill:t.accent, fontFamily:"Georgia, serif",
              fontWeight:"bold", letterSpacing:"-0.01em", fillOpacity:"0.1" }}>
            {studentName}
          </text>
          <text x="480" y="258" textAnchor="middle"
            style={{ fontSize:"42px", fill:"#0F0F0F", fontFamily:"Georgia, serif",
              fontWeight:"bold", letterSpacing:"-0.01em" }}>
            {studentName}
          </text>
          {/* Name underline */}
          <line x1="130" y1="270" x2="420" y2="270" stroke={t.accent} strokeWidth="0.8" strokeOpacity="0.4" />
          <polygon points="480,266 485,270 480,274 475,270" fill={t.accent} />
          <line x1="540" y1="270" x2="830" y2="270" stroke={t.accent} strokeWidth="0.8" strokeOpacity="0.4" />
          <text x="480" y="294" textAnchor="middle"
            style={{ fontSize:"11.5px", fill:"#777777", fontStyle:"italic",
              fontFamily:"Georgia, serif" }}>
            has successfully completed the course with distinction
          </text>
          {/* Course title box */}
          <rect x="150" y="304" width="660" height="44" rx="2"
            fill={t.light} stroke={t.accent} strokeWidth="1" strokeOpacity="0.4" />
          <line x1="150" y1="304" x2="180" y2="304" stroke={t.accent} strokeWidth="2" strokeOpacity="0.8" />
          <line x1="150" y1="304" x2="150" y2="324" stroke={t.accent} strokeWidth="2" strokeOpacity="0.8" />
          <line x1="810" y1="348" x2="780" y2="348" stroke={t.accent} strokeWidth="2" strokeOpacity="0.8" />
          <line x1="810" y1="348" x2="810" y2="328" stroke={t.accent} strokeWidth="2" strokeOpacity="0.8" />
          <text x="480" y="332" textAnchor="middle"
            style={{ fontSize: courseTitle.length > 48 ? "15px" : "18px",
              fill:t.sidebar, fontWeight:"bold", fontFamily:"Georgia, serif",
              letterSpacing:"0.01em" }}>
            {courseTitle.length > 56 ? courseTitle.slice(0, 56) + "…" : courseTitle}
          </text>
          {/* Divider */}
          <line x1="88" y1="368" x2="872" y2="368" stroke="#E0DDD7" strokeWidth="0.8" />
          {/* Date */}
          <text x="210" y="393" textAnchor="middle"
            style={{ fontSize:"7.5px", letterSpacing:"0.22em", fill:"#999999",
              fontFamily:"Arial, sans-serif", fontWeight:"bold" }}>DATE OF ISSUE</text>
          <text x="210" y="413" textAnchor="middle"
            style={{ fontSize:"13px", fill:"#1A1A1A", fontFamily:"Georgia, serif", fontWeight:"bold" }}>
            {fmtDate(issuedAt)}
          </text>
          <line x1="130" y1="420" x2="290" y2="420" stroke={t.accent} strokeWidth="1" strokeOpacity="0.25" />
          {/* Seal rays */}
          {Array.from({ length: 16 }).map((_,i) => {
            const a = (i*22.5*Math.PI)/180;
            return <line key={`r${i}`}
              x1={480+Math.cos(a)*36} y1={408+Math.sin(a)*36}
              x2={480+Math.cos(a)*48} y2={408+Math.sin(a)*48}
              stroke={t.accent} strokeWidth={i%2===0?"1.5":"0.7"}
              strokeOpacity={i%2===0?"0.4":"0.2"} />;
          })}
          <circle cx="480" cy="408" r="34" fill="white" stroke={t.accent} strokeWidth="1.5" strokeOpacity="0.5" />
          <circle cx="480" cy="408" r="28" fill={t.light} stroke={t.accent} strokeWidth="0.8" strokeOpacity="0.4" />
          <polyline points="467,408 476,417 494,399"
            fill="none" stroke={t.accent} strokeWidth="3"
            strokeLinecap="round" strokeLinejoin="round" />
          <text x="480" y="430" textAnchor="middle"
            style={{ fontSize:"6.5px", letterSpacing:"0.25em", fill:t.accent,
              fontFamily:"Arial, sans-serif", fontWeight:"bold" }}>VERIFIED</text>
          <circle cx="480" cy="408" r="42" fill="none" stroke={t.accent}
            strokeWidth="0.6" strokeOpacity="0.25" strokeDasharray="2.5 3.5" />
          {/* Cert number */}
          <text x="750" y="393" textAnchor="middle"
            style={{ fontSize:"7.5px", letterSpacing:"0.22em", fill:"#999999",
              fontFamily:"Arial, sans-serif", fontWeight:"bold" }}>CERTIFICATE NO.</text>
          <text x="750" y="413" textAnchor="middle"
            style={{ fontSize:"13px", fill:"#1A1A1A",
              fontFamily:"monospace", fontWeight:"bold", letterSpacing:"0.06em" }}>
            {certNumber}
          </text>
          <line x1="670" y1="420" x2="830" y2="420" stroke={t.accent} strokeWidth="1" strokeOpacity="0.25" />
          {/* Divider */}
          <line x1="88" y1="452" x2="872" y2="452" stroke="#E0DDD7" strokeWidth="0.8" />
          {/* Skill tags */}
          {["Certified Professional","Course Completed","CGS Verified"].map((tag,ti) => {
            const tw = tag.length*6.5+20;
            const startX = 480-200+ti*200-tw/2;
            return (
              <g key={`tag-${ti}`}>
                <rect x={startX} y="462" width={tw} height="18" rx="9"
                  fill={t.light} stroke={t.accent} strokeWidth="0.8" strokeOpacity="0.5" />
                <text x={startX+tw/2} y="474" textAnchor="middle"
                  style={{ fontSize:"7px", letterSpacing:"0.1em", fill:t.sidebar,
                    fontFamily:"Arial, sans-serif", fontWeight:"bold" }}>{tag}</text>
              </g>
            );
          })}
          {/* Signatures */}
          <text x="220" y="516" textAnchor="middle"
            style={{ fontSize:"16px", fill:"#2A2A2A", fontFamily:"Georgia, serif", fontStyle:"italic" }}>
            Chandan Gupta
          </text>
          <line x1="130" y1="522" x2="310" y2="522" stroke={t.accent} strokeWidth="0.8" strokeOpacity="0.4" />
          <text x="220" y="535" textAnchor="middle"
            style={{ fontSize:"7.5px", letterSpacing:"0.2em", fill:"#888888",
              fontFamily:"Arial, sans-serif", fontWeight:"bold" }}>DIRECTOR, CGS</text>
          <line x1="480" y1="498" x2="480" y2="540" stroke="#E0DDD7" strokeWidth="0.8" />
          <text x="740" y="516" textAnchor="middle"
            style={{ fontSize:"16px", fill:"#2A2A2A", fontFamily:"Georgia, serif", fontStyle:"italic" }}>
            Academic Head
          </text>
          <line x1="650" y1="522" x2="830" y2="522" stroke={t.accent} strokeWidth="0.8" strokeOpacity="0.4" />
          <text x="740" y="535" textAnchor="middle"
            style={{ fontSize:"7.5px", letterSpacing:"0.2em", fill:"#888888",
              fontFamily:"Arial, sans-serif", fontWeight:"bold" }}>ACADEMIC HEAD</text>
          {/* Footer band */}
          <rect x="68" y="578" width="832" height="58" fill={t.sidebar} fillOpacity="0.06" />
          <line x1="88" y1="578" x2="872" y2="578" stroke={t.accent} strokeWidth="0.5" strokeOpacity="0.3" />
          <text x="370" y="601" textAnchor="middle"
            style={{ fontSize:"7.5px", fill:"#888888", letterSpacing:"0.07em",
              fontFamily:"Arial, sans-serif" }}>
            Issued by CG School of Technology
          </text>
          <text x="370" y="613" textAnchor="middle"
            style={{ fontSize:"7px", fill:"#AAAAAA", letterSpacing:"0.05em", fontFamily:"monospace" }}>
            Verify at cgschool.in/verify/{certNumber}
          </text>
          {/* QR code */}
          <g transform="translate(756, 570)">
            <rect width="52" height="52" rx="4" fill="white"
              stroke={t.accent} strokeWidth="0.8" strokeOpacity="0.4" />
            <rect x="4"  y="4"  width="14" height="14" rx="1" fill={t.accent} fillOpacity="0.7" />
            <rect x="6"  y="6"  width="10" height="10" rx="0.5" fill="white" />
            <rect x="8"  y="8"  width="6"  height="6"  rx="0.5" fill={t.accent} fillOpacity="0.8" />
            <rect x="34" y="4"  width="14" height="14" rx="1" fill={t.accent} fillOpacity="0.7" />
            <rect x="36" y="6"  width="10" height="10" rx="0.5" fill="white" />
            <rect x="38" y="8"  width="6"  height="6"  rx="0.5" fill={t.accent} fillOpacity="0.8" />
            <rect x="4"  y="34" width="14" height="14" rx="1" fill={t.accent} fillOpacity="0.7" />
            <rect x="6"  y="36" width="10" height="10" rx="0.5" fill="white" />
            <rect x="8"  y="38" width="6"  height="6"  rx="0.5" fill={t.accent} fillOpacity="0.8" />
            {[[22,4],[26,4],[30,4],[22,8],[28,8],[24,12],[30,12],
              [22,22],[26,22],[28,26],[22,30],[30,26],[24,30],[28,34],
              [22,38],[26,42],[30,38],[24,46],[28,46],
              [34,22],[38,26],[42,22],[46,26],[34,30],[42,34],[38,38],[46,34],
              [34,42],[42,46],[38,46],
            ].map(([qx,qy],qi) => (
              <rect key={`qc-${qi}`} x={qx} y={qy} width="3" height="3"
                fill={t.accent} fillOpacity="0.6" />
            ))}
            <text x="26" y="59" textAnchor="middle"
              style={{ fontSize:"5px", fill:"#AAAAAA", fontFamily:"Arial, sans-serif",
                letterSpacing:"0.05em" }}>SCAN TO VERIFY</text>
          </g>
          {/* Bottom accent bars */}
          <rect x="68" y="626" width="832" height="10" fill={t.accent} fillOpacity="0.85" />
          <rect x="0"  y="626" width="68"  height="10" fill={t.sidebar} />
        </g>
      </svg>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  cert:        CertificateRecord;
  studentName: string;
  index:       number;
  onClose:     () => void;
}

function CertModal({ cert, studentName, index, onClose }: ModalProps) {
  const p         = palette(index);
  const certRef   = useRef<HTMLDivElement>(null);
  const [copied,  setCopied]    = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareOpen, setShareOpen]   = useState(false);
  const { download, downloading } = useDownloadCert();

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${cert.certificateNumber}`
    : `/verify/${cert.certificateNumber}`;

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (shareOpen) { setShareOpen(false); return; }
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, shareOpen]);

  function copyNumber() {
    navigator.clipboard.writeText(cert.certificateNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(verifyUrl);
    setLinkCopied(true);
    setShareOpen(false);
    setTimeout(() => setLinkCopied(false), 2500);
  }

  async function shareNative() {
    if (!navigator.share) { copyLink(); return; }
    try {
      await navigator.share({
        title: `Certificate — ${cert.course.title}`,
        text:  `I just completed "${cert.course.title}" at CG School of Technology! 🎓\nVerify: ${verifyUrl}`,
        url:   verifyUrl,
      });
    } catch {
      // cancelled
    }
    setShareOpen(false);
  }

  function shareLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=520");
    setShareOpen(false);
  }

  function shareTwitter() {
    const text = `I just earned a certificate for "${cert.course.title}" from CG School of Technology! 🎓`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(verifyUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
    setShareOpen(false);
  }

  function handlePrint() {
    // Write the cert to a hidden print iframe so only the cert renders — no modal chrome
    const certEl = certRef.current;
    if (!certEl) { window.print(); return; }

    const html = `<!DOCTYPE html>
<html>
<head>
<title>Certificate — ${cert.course.title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: white; display: flex; align-items: center; justify-content: center;
    min-height: 100vh; }
  .cert-wrap { width: 100%; max-width: 900px; }
  @page { size: A4 landscape; margin: 8mm; }
  @media print {
    body { min-height: unset; }
    .cert-wrap { width: 100%; max-width: 100%; }
  }
</style>
</head>
<body>
<div class="cert-wrap">${certEl.innerHTML}</div>
</body>
</html>`;

    const win = window.open("", "_blank", "width=960,height=700");
    if (!win) { window.print(); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    // Give SVG time to render before triggering print
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-full max-w-[860px] flex flex-col gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}>
                <Award size={15} className="text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-[0.9rem] text-white leading-tight line-clamp-1">
                  {cert.course.title}
                </p>
                <p className="text-[0.68rem] text-white/50">{fmtDateShort(cert.issuedAt)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Certificate itself */}
          <div
            ref={certRef}
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${p.from}44` }}
          >
            <CertificateDocument
              studentName={studentName}
              courseTitle={cert.course.title}
              certNumber={cert.certificateNumber}
              issuedAt={cert.issuedAt}
              index={index}
            />
          </div>

          {/* Actions bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Cert number pill */}
            <button
              onClick={copyNumber}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[0.72rem] font-mono transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderColor: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {copied
                ? <CheckCheck size={12} className="text-green-400 shrink-0" />
                : <Copy size={12} className="shrink-0" />}
              {copied ? "Copied!" : cert.certificateNumber}
            </button>

            <div className="flex-1" />

            {/* ── Share dropdown ── */}
            <div className="relative">
              <button
                onClick={() => setShareOpen(o => !o)}
                className="btn btn-outline text-[0.78rem] py-2 px-4 text-white border-white/20 hover:bg-white/10 hover:border-white/30"
              >
                {linkCopied
                  ? <CheckCheck size={14} className="text-green-400" />
                  : <Share2 size={14} />}
                {linkCopied ? "Link copied!" : "Share"}
              </button>
              {shareOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-2 right-0 w-52 rounded-2xl overflow-hidden shadow-2xl border z-10"
                  style={{ background: "#1a1a2e", borderColor: "rgba(255,255,255,0.12)" }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-3 py-2.5 border-b border-white/10">
                    <p className="text-[0.7rem] font-semibold text-white/50 uppercase tracking-wider">Share certificate</p>
                  </div>
                  {[
                    { label: "Copy link",       icon: <Copy size={13} />,                action: copyLink,     desc: "Paste anywhere" },
                    { label: "Share on LinkedIn",icon: <ExternalLink size={13} />,        action: shareLinkedIn,desc: "Professional network" },
                    { label: "Share on X",       icon: <Share2 size={13} />,              action: shareTwitter, desc: "Twitter / X" },
                    ...(typeof navigator !== "undefined" && "share" in navigator
                      ? [{ label: "Native share", icon: <Share2 size={13} />, action: shareNative, desc: "Apps & messages" }]
                      : []),
                  ].map(({ label, icon, action, desc }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/8 transition-colors text-left"
                    >
                      <span className="text-white/50">{icon}</span>
                      <div>
                        <p className="text-[0.78rem] font-medium text-white leading-tight">{label}</p>
                        <p className="text-[0.64rem] text-white/40">{desc}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* ── Verify ── */}
            <Link
              href={`/verify/${cert.certificateNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline text-[0.78rem] py-2 px-4 text-white border-white/20 hover:bg-white/10 hover:border-white/30"
            >
              <Shield size={14} /> Verify
            </Link>

            {/* ── Print ── */}
            <button
              onClick={handlePrint}
              className="btn btn-outline text-[0.78rem] py-2 px-4 text-white border-white/20 hover:bg-white/10 hover:border-white/30"
            >
              <Printer size={14} /> Print
            </button>

            {/* ── Download PNG ── */}
            <button
              onClick={() => download(certRef, `${cert.certificateNumber}.png`)}
              disabled={downloading}
              className="btn btn-brand text-[0.78rem] py-2 px-4 min-w-[148px]"
            >
              {downloading
                ? <Loader2 size={14} className="animate-spin" />
                : <Download size={14} />}
              {downloading ? "Exporting…" : "Download PNG"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Certificate Card ─────────────────────────────────────────────────────────

interface CertCardProps {
  cert:        CertificateRecord;
  studentName: string;
  index:       number;
  onOpen:      () => void;
}

function CertCard({ cert, studentName, index, onOpen }: CertCardProps) {
  const p = palette(index);
  const hiddenRef = useRef<HTMLDivElement>(null);
  const { download, downloading } = useDownloadCert();

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation(); // don't open modal
    download(hiddenRef, `${cert.certificateNumber}.png`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative cursor-pointer"
      onClick={onOpen}
    >
      {/* Glow on hover */}
      <div
        className="absolute -inset-px rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
        style={{ background: `linear-gradient(135deg, ${p.from}55, ${p.to}55)` }}
      />

      <div className="relative rounded-[20px] overflow-hidden border border-[var(--color-border)] group-hover:border-transparent transition-colors bg-[var(--color-surface)]"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.35)" }}>

        {/* Certificate preview — mini version */}
        <div className="relative overflow-hidden" style={{ height: "160px" }}>
          {/* Background gradient */}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${p.from}22, ${p.to}18)` }}
          />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, ${p.from} 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />
          {/* Decorative rings */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-2 opacity-20"
            style={{ borderColor: p.from }} />
          <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full border opacity-15"
            style={{ borderColor: p.to }} />

          {/* Inner border frame */}
          <div className="absolute inset-3 rounded-xl border opacity-20"
            style={{ borderColor: p.from }} />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
            {/* Seal */}
            <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg mb-1"
              style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}>
              <Star size={18} className="text-white" fill="white" />
            </div>
            <p className="text-[0.58rem] font-bold tracking-[0.22em] uppercase opacity-70"
              style={{ color: p.from }}>
              Certificate of Completion
            </p>
            <p className="font-bold text-[0.8rem] text-[var(--color-fg)] line-clamp-2 leading-tight max-w-[200px]">
              {cert.course.title}
            </p>
            <p className="text-[0.62rem] italic opacity-60 text-[var(--color-fg-muted)]">{studentName}</p>
          </div>

          {/* "View" overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[0.78rem] font-semibold"
              style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}>
              <ExternalLink size={13} /> View Certificate
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-[0.88rem] text-[var(--color-fg)] leading-snug line-clamp-2">
              {cert.course.title}
            </h3>
            <p className="text-[0.72rem] text-[var(--color-fg-muted)] mt-0.5">
              Issued {fmtDateShort(cert.issuedAt)}
            </p>
          </div>

          {/* Cert number */}
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <Shield size={10} className="shrink-0" style={{ color: p.from }} />
            <span className="flex-1 font-mono text-[0.64rem] text-[var(--color-fg-muted)] truncate">
              {cert.certificateNumber}
            </span>
          </div>

          {/* Bottom row */}
          <div className="flex items-center gap-2 pt-0.5">
            <div
              className="h-0.5 flex-1 rounded-full opacity-30"
              style={{ background: `linear-gradient(90deg, ${p.from}, ${p.to})` }}
            />
            <span className="text-[0.62rem] font-bold uppercase tracking-wider"
              style={{ color: p.from }}>
              CGS Certified
            </span>
            <div
              className="h-0.5 flex-1 rounded-full opacity-30"
              style={{ background: `linear-gradient(90deg, ${p.to}, ${p.from})` }}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpen}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[0.72rem] font-semibold border border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-border-brand)] hover:text-[var(--color-brand-light)] transition-colors"
            >
              <ExternalLink size={11} /> View
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[0.72rem] font-semibold transition-all text-white"
              style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
            >
              {downloading
                ? <Loader2 size={11} className="animate-spin" />
                : <Download size={11} />}
              {downloading ? "…" : "Download"}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden off-screen cert for PNG capture */}
      <div
        ref={hiddenRef}
        className="fixed -left-[9999px] -top-[9999px]"
        style={{ width: "900px" }}
        aria-hidden="true"
      >
        <CertificateDocument
          studentName={studentName}
          courseTitle={cert.course.title}
          certNumber={cert.certificateNumber}
          issuedAt={cert.issuedAt}
          index={index}
        />
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
      {/* Decorative cert outline */}
      <div className="relative w-28 h-20 rounded-2xl border-2 border-dashed border-[var(--color-border-brand)] flex items-center justify-center">
        <Award size={32} className="text-[var(--color-brand)]" />
        <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[var(--color-brand-dim)] border border-[var(--color-border-brand)] flex items-center justify-center">
          <Star size={12} className="text-[var(--color-brand)]" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-display font-bold text-xl text-[var(--color-fg)]">No certificates yet</h3>
        <p className="text-[0.84rem] text-[var(--color-fg-muted)] max-w-sm leading-relaxed">
          Complete a course to earn your official certificate. Keep learning — you're closer than you think!
        </p>
      </div>
      <Link href="/dashboard/courses" className="btn btn-brand">
        <BookOpen size={15} /> Continue Learning
      </Link>
    </div>
  );
}

// ─── Print styles (injected as a style tag) ───────────────────────────────────

function PrintStyles() {
  return (
    <style>{`
      @media print {
        body > *:not(#cert-print-root) { display: none !important; }
        #cert-print-root { display: block !important; position: fixed; inset: 0; z-index: 9999; }
        .cert-document { width: 100% !important; max-width: 100% !important; }
        header, nav, aside, footer, [data-sidebar], .no-print { display: none !important; }
      }
    `}</style>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CertificatesPage() {
  const { user }  = useAuthContext();
  const studentName = user?.name ?? "Student";

  const [certs,   setCerts]   = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [active,  setActive]  = useState<{ cert: CertificateRecord; index: number } | null>(null);

  useEffect(() => {
    certificatesApi
      .getMine()
      .then(setCerts)
      .catch((e) => setError(e.message ?? "Failed to load certificates"))
      .finally(() => setLoading(false));
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  return (
    <>
      <PrintStyles />

      <div className="space-y-6 max-w-[1100px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display font-black text-2xl text-[var(--color-fg)]">Certificates</h1>
          <p className="text-[0.82rem] text-[var(--color-fg-muted)] mt-0.5">
            {certs.length > 0
              ? `You've earned ${certs.length} certificate${certs.length !== 1 ? "s" : ""}. Click any to view or print.`
              : "Your earned certificates will appear here once you complete a course."}
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-dim)] flex items-center justify-center">
                <Award size={24} className="text-[var(--color-brand)]" />
              </div>
              <Loader2 size={40} className="animate-spin text-[var(--color-brand)] absolute -inset-3" />
            </div>
            <p className="text-[0.82rem] text-[var(--color-fg-muted)]">Loading certificates…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <AlertCircle size={32} className="text-[var(--color-rose)]" />
            <p className="text-[var(--color-fg)] font-semibold">Something went wrong</p>
            <p className="text-[0.82rem] text-[var(--color-fg-muted)]">{error}</p>
          </div>
        ) : certs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Count banner */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="card p-4 flex items-center gap-4 overflow-hidden relative"
            >
              <div className="absolute inset-0 opacity-5"
                style={{ background: "linear-gradient(135deg, #7c6fff, #22d3ee)" }} />
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #7c6fff, #22d3ee)" }}>
                <Award size={22} className="text-white" />
              </div>
              <div className="relative">
                <p className="font-display font-black text-2xl text-[var(--color-fg)] leading-none">{certs.length}</p>
                <p className="text-[0.72rem] text-[var(--color-fg-muted)] mt-0.5">
                  Certificate{certs.length !== 1 ? "s" : ""} earned
                </p>
              </div>
              <div className="relative ml-auto text-right hidden sm:block">
                <p className="text-[0.7rem] text-[var(--color-fg-muted)]">Most recent</p>
                <p className="text-[0.86rem] font-semibold text-[var(--color-fg)]">
                  {fmtDateShort(certs[0].issuedAt)}
                </p>
              </div>
              <Link
                href="/dashboard/courses"
                className="relative hidden sm:flex items-center gap-1.5 text-[0.76rem] font-semibold text-[var(--color-brand-light)] hover:text-[var(--color-brand)] transition-colors ml-4"
              >
                View courses <ChevronRight size={13} />
              </Link>
            </motion.div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {certs.map((cert, i) => (
                <CertCard
                  key={cert.id}
                  cert={cert}
                  studentName={studentName}
                  index={i}
                  onOpen={() => setActive({ cert, index: i })}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {active && (
        <CertModal
          cert={active.cert}
          studentName={studentName}
          index={active.index}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
