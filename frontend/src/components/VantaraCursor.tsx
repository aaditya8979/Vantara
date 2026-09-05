/* ─── VantaraCursor — Smart Cursor Companion ──────────────────────────
   A cursor-following arrow that detects hovered UI elements and types
   out contextual explanations in real time. Zero API calls.
   ──────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState, useCallback } from "react";

// ── Hint map: data-hint attribute values → full explanation text ────────
// These are applied via data-hint="KEY" attributes on elements in Landing.tsx
// The companion detects mouseover, looks up the key, and types it out.
export const HINTS: Record<string, { title: string; text: string; color: string }> = {
  "hero": {
    title: "VANTARA System",
    text: "This is not a passive dashboard. VANTARA is an active enforcement engine — it detects anomalies in FRA claims, flags statutory violations, and generates legally binding directives for each tier of the FRA committee hierarchy.",
    color: "#1e3a5f",
  },
  "nav-home": {
    title: "Portal Home",
    text: "Returns to the main landing page of the VANTARA FRA Monitoring System, hosted under the Ministry of Tribal Affairs.",
    color: "#1e5fa4",
  },
  "nav-dashboard": {
    title: "Officer Dashboard Login",
    text: "Click here to open the role-based officer login. Three distinct portals — SDLC Field Officer, DLC Magistrate, and State Tribal Secretary — each with a different enforcement scope.",
    color: "#b91c1c",
  },
  "nav-progress": {
    title: "State-wise Progress Report",
    text: "Live MoTA data: 25.7 Lakh claims filed, only 22.2 Lakh resolved. Gujarat leads at 95.7%. Jharkhand is critical at 34.7%. VANTARA uses this to auto-flag underperforming districts.",
    color: "#1e5fa4",
  },
  "nav-meeting": {
    title: "Review Meeting Minutes",
    text: "Access SLMC and MoTA review meeting records — including directives issued at national and regional levels that district officers must comply with.",
    color: "#1e5fa4",
  },
  "nav-contact": {
    title: "Ministry Contact",
    text: "Direct lines to the FRA Cell: Toll-free 1800-11-2001 and the NIC VANTARA technical helpdesk at 011-24013698.",
    color: "#15803d",
  },
  "nav-knowledge": {
    title: "Knowledge Hub",
    text: "Direct access to official FRA PDFs — the Act, Rules, FAQ in Hindi & English, and General Executive Directions from MoTA. Loaded from tribal.nic.in.",
    color: "#1e5fa4",
  },
  "nav-provisions": {
    title: "Key Provisions",
    text: "Core FRA provisions that VANTARA enforces: Section 3(1)(a) individual rights, Rule 12(2) 60-day SDLC deadline, Rule 13 DLC approval authority, Section 8 right to appeal.",
    color: "#1e5fa4",
  },
  "stats-bar": {
    title: "Real MoTA Statistics",
    text: "Live national data from MoTA's March 2023 report. 3.5 Lakh claims are still pending — VANTARA's AI layer identifies exactly which districts are causing these delays and why.",
    color: "#1e3a5f",
  },
  "role-sdlc": {
    title: "SDLC Field Officer Portal",
    text: "The Sub-Divisional Level Committee officer sees a strict work queue — not a map. They get a batch of incomplete records missing survey numbers, and VANTARA generates a printable Patwari Reconciliation Manifest with GPS checklists.",
    color: "#7e22ce",
  },
  "role-dlc": {
    title: "DLC Magistrate Portal",
    text: "The District Magistrate's view shows AI-flagged violations of Rule 12(2) — claims stuck beyond 60 days. They can issue a legally formatted Rule 12(2) directive or order a Joint Cadastral Inspection, both printable.",
    color: "#b91c1c",
  },
  "role-secretary": {
    title: "State Secretary Portal",
    text: "The State Tribal Secretary sees a state-wide clearance matrix. VANTARA identifies systemic suppression (structural delays) vs administrative failures, and lets the Secretary mandate a special SDLC sitting in underperforming districts.",
    color: "#1e3a5f",
  },
  "about-fra": {
    title: "About the Forest Rights Act",
    text: "The FRA 2006 recognizes rights of tribal communities to forest land they occupied before 13 December 2005. VANTARA monitors the 3-tier process: Gram Sabha → SDLC (60-day limit) → DLC (final authority).",
    color: "#1e3a5f",
  },
  "progress-table": {
    title: "State-wise FRA Data",
    text: "Gujarat leads with 95.7% settlement. Maharashtra (38.1%) and Jharkhand (34.7%) are critically underperforming. The progress bars use real MoTA March 2023 data — not mock figures.",
    color: "#1e5fa4",
  },
  "knowledge-hub": {
    title: "FRA Document Repository",
    text: "These are real PDFs hosted on tribal.nic.in. The General Executive Directions (GEDs) are legal instruments — GED-15 on rejection reasons and GED-16 on SLMC monitoring are critical for VANTARA enforcement logic.",
    color: "#b91c1c",
  },
  "login-cta": {
    title: "Start the Demo",
    text: "Click here to open the 3-step officer login. Select SDLC Field Officer → Jharkhand → use credentials SDLC-2024-001 / Fra@1234 to see the field enforcement tools.",
    color: "#1e3a5f",
  },
  "contact-section": {
    title: "Official MoTA Contacts",
    text: "Real phone numbers from tribal.nic.in/ContactUs.aspx. The toll-free line 1800-11-2001 and NIC helpdesk 011-24013698 are operational Mon–Fri, 9 AM–6 PM.",
    color: "#15803d",
  },
};

interface CursorPos { x: number; y: number; }

interface HintState {
  key: string;
  title: string;
  text: string;
  color: string;
}

export default function VantaraCursor() {
  const [pos, setPos] = useState<CursorPos>({ x: -200, y: -200 });
  const [hint, setHint] = useState<HintState | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);
  const currentHintKey = useRef<string | null>(null);

  // ── Track mouse position ──────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ── Typewriter engine ─────────────────────────────────────────────────
  const startTyping = useCallback((text: string) => {
    if (typingRef.current) clearTimeout(typingRef.current);
    charIndexRef.current = 0;
    setDisplayedText("");

    const typeNext = () => {
      charIndexRef.current += 1;
      setDisplayedText(text.slice(0, charIndexRef.current));
      if (charIndexRef.current < text.length) {
        // Vary speed: faster for spaces, slower at punctuation
        const ch = text[charIndexRef.current];
        const delay = ch === " " ? 12 : ch === "," || ch === "." ? 60 : 18;
        typingRef.current = setTimeout(typeNext, delay);
      }
    };
    typingRef.current = setTimeout(typeNext, 80); // initial delay
  }, []);

  const clearHint = useCallback(() => {
    if (typingRef.current) clearTimeout(typingRef.current);
    setIsFading(true);
    collapseRef.current = setTimeout(() => {
      setIsExpanded(false);
      setHint(null);
      setDisplayedText("");
      setIsFading(false);
      currentHintKey.current = null;
    }, 220);
  }, []);

  // ── Element detection via mouseover/mouseout ──────────────────────────
  useEffect(() => {
    const findHintKey = (target: EventTarget | null): string | null => {
      let el = target as HTMLElement | null;
      while (el && el !== document.body) {
        const key = el.getAttribute("data-hint");
        if (key) return key;
        el = el.parentElement;
      }
      return null;
    };

    const onOver = (e: MouseEvent) => {
      const key = findHintKey(e.target);
      if (!key || key === currentHintKey.current) return;
      const hintData = HINTS[key];
      if (!hintData) return;

      if (collapseRef.current) clearTimeout(collapseRef.current);
      currentHintKey.current = key;
      setIsFading(false);
      setHint({ key, ...hintData });
      setIsExpanded(true);
      startTyping(hintData.text);
    };

    const onOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (related?.closest("[data-hint]")) return; // still inside a hinted element
      clearHint();
    };

    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [startTyping, clearHint]);

  // Determine if bubble should flip above cursor (near bottom of screen)
  const flipUp = pos.y > window.innerHeight * 0.65;
  // Determine if bubble should flip left (near right edge)
  const flipLeft = pos.x > window.innerWidth * 0.6;

  const ARROW_OFFSET_X = 14;
  const ARROW_OFFSET_Y = 20;

  return (
    <>
      {/* ── Custom cursor arrow ── */}
      <div
        id="vantara-cursor"
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          zIndex: 10000,
          pointerEvents: "none",
          userSelect: "none",
          transform: "translate(0, 0)",
          transition: "left 0.04s linear, top 0.04s linear",
        }}
      >
        {/* Arrow SVG — positioned offset below-right of cursor */}
        <div style={{
          position: "absolute",
          left: ARROW_OFFSET_X,
          top: ARROW_OFFSET_Y,
          transform: isExpanded ? "scale(1.15)" : "scale(1)",
          transition: "transform 0.2s ease",
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            {/* Shadow */}
            <ellipse cx="14" cy="26" rx="7" ry="2" fill="rgba(0,0,0,0.12)" />
            {/* Arrow body */}
            <path
              d="M6 2 L22 14 L15 14 L15 24 L10 24 L10 14 L3 14 Z"
              fill={isExpanded ? (hint?.color ?? "#1e3a5f") : "#1e3a5f"}
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
              style={{ transition: "fill 0.3s ease" }}
            />
            {/* Pulse ring when hint active */}
            {isExpanded && (
              <circle cx="14" cy="12" r="11" stroke={hint?.color ?? "#1e3a5f"} strokeWidth="1.5" fill="none" opacity="0.3">
                <animate attributeName="r" from="11" to="16" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
        </div>

        {/* ── Expanding hint bubble ── */}
        {hint && (
          <div
            style={{
              position: "absolute",
              left: flipLeft ? undefined : ARROW_OFFSET_X + 32,
              right: flipLeft ? `calc(100vw - ${pos.x}px + 20px)` : undefined,
              top: flipUp ? undefined : ARROW_OFFSET_Y - 8,
              bottom: flipUp ? `calc(100vh - ${pos.y}px + 20px)` : undefined,
              width: 300,
              background: "white",
              border: `2px solid ${hint.color}`,
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
              padding: "12px 14px",
              opacity: isFading ? 0 : isExpanded ? 1 : 0,
              transform: isFading ? "scale(0.95) translateY(4px)" : isExpanded ? "scale(1) translateY(0)" : "scale(0.92) translateY(6px)",
              transition: "opacity 0.22s ease, transform 0.22s ease",
              transformOrigin: "top left",
              pointerEvents: "none",
            }}
          >
            {/* Header bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
              paddingBottom: 8, borderBottom: `1px solid ${hint.color}22`,
            }}>
              <img
                src="/vantara-logo.png"
                alt="VANTARA"
                style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", border: `1px solid ${hint.color}33` }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, color: hint.color, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {hint.title}
              </span>
            </div>

            {/* Typewriter text */}
            <p style={{
              fontSize: 12,
              color: "#374151",
              lineHeight: 1.7,
              margin: 0,
              minHeight: 36,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              {displayedText}
              {/* Blinking cursor */}
              <span style={{
                display: "inline-block",
                width: 2,
                height: 12,
                background: hint.color,
                marginLeft: 2,
                verticalAlign: "middle",
                animation: "vantara-blink 0.8s step-end infinite",
              }} />
            </p>

            {/* VANTARA watermark */}
            <div style={{ marginTop: 8, fontSize: 10, color: "#9ca3af", textAlign: "right" }}>
              VANTARA Guide
            </div>
          </div>
        )}
      </div>

      {/* Blink keyframe */}
      <style>{`
        @keyframes vantara-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        /* Hide default cursor on hinted elements */
        [data-hint] { cursor: none !important; }
      `}</style>
    </>
  );
}
