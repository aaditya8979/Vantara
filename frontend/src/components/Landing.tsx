/* ─── VANTARA — Government Portal Landing Page ──────────────────────
   NIC-style portal modelled on tribal.nic.in/FRA.aspx
   ──────────────────────────────────────────────────────────────── */

import { useState } from "react";

export type UserRole = "sdlc_officer" | "dlc_magistrate" | "state_secretary" | null;

interface LandingProps {
  onRoleSelect: (role: UserRole, state: string, district: string) => void;
}

const NAV_ITEMS = [
  { label: "Home", href: "#" },
  { label: "About FRA", href: "#about" },
  { label: "Dashboard", href: "#login", highlight: true },
  { label: "Knowledge Hub", href: "#knowledge" },
  { label: "Key Provisions", href: "#provisions" },
  { label: "Progress Report", href: "https://tribal.nic.in/FRA.aspx", external: true },
  { label: "Review Meeting", href: "https://tribal.nic.in/FRA.aspx", external: true },
  { label: "Contact Us", href: "#" },
];

const FRA_STATS = [
  { label: "Total Claims Filed", value: "25.7 Lakh", sub: "As of March 2023" },
  { label: "Titles Distributed", value: "22.2 Lakh", sub: "Across 24 States" },
  { label: "Area Recognised", value: "1.87 Cr. Ha", sub: "Total Forest Land" },
  { label: "Pending Claims", value: "3.5 Lakh", sub: "Under Examination" },
];

const KEY_PROVISIONS = [
  {
    title: "Individual Forest Rights",
    desc: "Rights of forest dwelling STs and OTFDs to hold and live in forest land under individual or common occupation before 13 Dec 2005.",
    icon: "🏠",
    rule: "Section 3(1)(a)",
  },
  {
    title: "Community Forest Rights",
    desc: "Rights of communities, including rights of community tenures of habitat & habitation for PTGs, pre-agricultural communities.",
    icon: "🌳",
    rule: "Section 3(1)(e)",
  },
  {
    title: "SDLC Verification",
    desc: "Sub-Divisional Level Committee must verify and forward claims to DLC within 60 days. Gram Sabha recommendation is mandatory.",
    icon: "📋",
    rule: "Rule 12(2)",
  },
  {
    title: "DLC Approval",
    desc: "District Level Committee is the final authority to approve or reject. Rejection must be in writing with reasons and allow appeal.",
    icon: "⚖️",
    rule: "Rule 13",
  },
  {
    title: "State Level Monitoring",
    desc: "The State Level Monitoring Committee oversees implementation, resolves disputes between DLC, and can remand to SDLC.",
    icon: "🏛️",
    rule: "Section 6(6)",
  },
  {
    title: "Right to Appeal",
    desc: "Any person aggrieved by rejection can appeal before the SDLC or the Gram Sabha within 60 days of communication of rejection.",
    icon: "📜",
    rule: "Section 8",
  },
];

// Real document links from tribal.nic.in/FRA.aspx
const KEY_DOCS = [
  {
    title: "The FRA Act & Rules Book",
    type: "Act",
    link: "https://tribal.nic.in/downloads/FRA/FRAActnRulesBook.pdf",
    icon: "📘",
  },
  {
    title: "FAQ — FRA (English)",
    type: "FAQ",
    link: "https://tribal.nic.in/downloads/FRA/FAQ/FAQ ENGLISH_Approved_compressed.pdf",
    icon: "❓",
  },
  {
    title: "FAQ — FRA (Hindi)",
    type: "अक्सर पूछे जाने वाले प्रश्न",
    link: "https://tribal.nic.in/downloads/FRA/FAQ/FAQ Booklet Hindi_Approved.pdf",
    icon: "❓",
  },
  {
    title: "GED-1: CFR Guidelines",
    type: "Directive",
    link: "https://tribal.nic.in/downloads/FRA/General executive direction/GED- 1 Guidelines for Conservation, Management and Sustainable use of Community Forest Resources(CFR).pdf",
    icon: "📋",
  },
  {
    title: "GED-15: Rejection Reasons",
    type: "Directive",
    link: "https://tribal.nic.in/downloads/FRA/General executive direction/GED-15 Reason of Rejection dated 15.07.2010.pdf",
    icon: "📋",
  },
  {
    title: "GED-16: SLMC Monitoring",
    type: "Directive",
    link: "https://tribal.nic.in/downloads/FRA/General executive direction/GED-16 Monitoring with SLMC  - letter dated 20.07.2010.pdf",
    icon: "📋",
  },
  {
    title: "GED-25: Implementation Guidelines",
    type: "Directive",
    link: "https://tribal.nic.in/downloads/FRA/General executive direction/GED-25 FRA implementation Guidelines dated 12.07.2012.pdf",
    icon: "📋",
  },
  {
    title: "GED-28: Geo-Referencing & Mapping",
    type: "Directive",
    link: "https://tribal.nic.in/downloads/FRA/General executive direction/GED-28 Guidelines for geo-referencing and Potentiality mapping_27.07.2015.pdf",
    icon: "🗺️",
  },
  {
    title: "Draft SLMC Report",
    type: "Report",
    link: "https://tribal.nic.in/downloads/FRA/Draft_Report06012021.pdf",
    icon: "📊",
  },
];

const ROLES = [
  {
    id: "sdlc_officer" as const,
    title: "SDLC Field Officer",
    icon: "📋",
    description: "Process incomplete records, generate Patwari survey batches and GPS verification checklists for field resolution.",
    badge: "Sub-Divisional Level Committee",
    badgeColor: "bg-purple-700",
    defaultDistrict: (state: string) => {
      const map: Record<string, string> = {
        "Jharkhand": "Khunti", "Chhattisgarh": "Bastar", "Odisha": "Mayurbhanj",
        "Madhya Pradesh": "Mandla", "Maharashtra": "Gadchiroli", "West Bengal": "Purulia"
      };
      return map[state] || "Khunti";
    },
  },
  {
    id: "dlc_magistrate" as const,
    title: "District Magistrate",
    icon: "⚖️",
    description: "Monitor statutory deadlines, resolve land conflicts, issue Rule 12(2) directives and Joint Cadastral Inspection orders.",
    badge: "District Level Committee",
    badgeColor: "bg-red-700",
    defaultDistrict: (state: string) => {
      const map: Record<string, string> = {
        "Jharkhand": "Khunti", "Chhattisgarh": "Bastar", "Odisha": "Koraput",
        "Madhya Pradesh": "Mandla", "Maharashtra": "Gadchiroli", "West Bengal": "Purulia"
      };
      return map[state] || "Bastar";
    },
  },
  {
    id: "state_secretary" as const,
    title: "State Tribal Secretary",
    icon: "🏛️",
    description: "Review state-wide clearance rates, mandate special SDLC sittings, and identify systemic suppression in affected districts.",
    badge: "State Level Monitoring Committee",
    badgeColor: "bg-[#1e3a5f]",
    defaultDistrict: (_state: string) => "",
  },
];

const STATES = [
  "Chhattisgarh",
  "Jharkhand",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "West Bengal",
];

type LoginStep = "role" | "state";

export default function Landing({ onRoleSelect }: LandingProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>("role");
  const [selectedRole, setSelectedRole] = useState<(typeof ROLES)[0] | null>(null);
  const [selectedState, setSelectedState] = useState("");

  const handleRoleClick = (role: (typeof ROLES)[0]) => {
    setSelectedRole(role);
    setSelectedState("");
    setLoginStep("state");
  };

  const handleProceed = () => {
    if (!selectedRole || !selectedState) return;
    const district = selectedRole.defaultDistrict(selectedState);
    onRoleSelect(selectedRole.id, selectedState, district);
    setShowLoginModal(false);
  };

  const resetModal = () => {
    setShowLoginModal(false);
    setLoginStep("role");
    setSelectedRole(null);
    setSelectedState("");
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Row 1: Utility Topbar ── */}
      <div style={{ background: "#f5f5f5", borderBottom: "1px solid #d1d5db" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "5px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>
            GOVERNMENT OF INDIA | MINISTRY OF TRIBAL AFFAIRS
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#4b5563" }}>
            <a href="#" style={{ color: "#4b5563", textDecoration: "none" }}>Skip to Main</a>
            <span style={{ color: "#d1d5db" }}>|</span>
            <a href="#" style={{ color: "#4b5563", textDecoration: "none" }}>Screen Reader Access</a>
            <span style={{ color: "#d1d5db" }}>|</span>
            {["A-", "A", "A+"].map((s) => (
              <button key={s} style={{ border: "1px solid #9ca3af", borderRadius: 3, padding: "1px 6px", fontSize: 11, background: "white", cursor: "pointer", color: "#374151" }}>{s}</button>
            ))}
            <span style={{ color: "#d1d5db" }}>|</span>
            <a href="https://tribal.nic.in/FRA.aspx" target="_blank" rel="noopener" style={{ color: "#b91c1c", fontWeight: 700, textDecoration: "none" }}>हिन्दी</a>
          </div>
        </div>
      </div>

      {/* ── Row 2: Main Header ── */}
      <header style={{ background: "white", borderBottom: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e8edf5", border: "2px solid #1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
              🇮🇳
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>जनजातीय कार्य मंत्रालय</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1e3a5f", letterSpacing: "0.04em", lineHeight: 1.1 }}>MINISTRY OF TRIBAL AFFAIRS</div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, marginTop: 1 }}>GOVERNMENT OF INDIA</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 18 }}>V</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", letterSpacing: "0.1em" }}>VANTARA</div>
                <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.08em" }}>AUTHORIZED MONITORING SYSTEM</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", display: "inline-block", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 11, color: "#15803d", fontWeight: 500 }}>System Online — FRA Monitoring Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Row 3: Nav Bar ── */}
      <nav style={{ background: "#1e5fa4", position: "sticky", top: 0, zIndex: 40, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <ul style={{ display: "flex", listStyle: "none", margin: 0, padding: 0 }}>
            {NAV_ITEMS.map((item, i) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={item.label === "Dashboard" ? (e) => { e.preventDefault(); setLoginStep("role"); setShowLoginModal(true); } : undefined}
                  style={{
                    display: "flex", alignItems: "center", padding: "12px 16px",
                    fontSize: 13, fontWeight: 500, color: "white", textDecoration: "none",
                    borderRight: "1px solid rgba(255,255,255,0.15)",
                    borderLeft: i === 0 ? "1px solid rgba(255,255,255,0.15)" : undefined,
                    background: item.highlight ? "#b91c1c" : "transparent",
                    whiteSpace: "nowrap", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!item.highlight) (e.target as HTMLElement).style.background = "#2c7ad6"; }}
                  onMouseLeave={(e) => { if (!item.highlight) (e.target as HTMLElement).style.background = "transparent"; }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <div style={{ position: "relative", height: 420, overflow: "hidden" }}>
        <img src="/hero.jpg" alt="Tribal communities — Forest Rights Act" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.18) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "flex", flexDirection: "column", justifyContent: "center", left: 0, right: 0 }}>
          <div style={{ maxWidth: 520 }}>
            <div style={{ display: "inline-block", background: "#b91c1c", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 3, marginBottom: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              AI-Powered Decision Support System
            </div>
            <h1 style={{ fontSize: 38, fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: 12, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              Forest Rights Act<br />
              <span style={{ color: "#fde68a" }}>Monitoring & Enforcement</span>
            </h1>
            <p style={{ color: "#e5e7eb", fontSize: 14, lineHeight: 1.7, marginBottom: 20, maxWidth: 440 }}>
              Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006 — Real-time anomaly detection and multi-tier resolution platform.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setLoginStep("role"); setShowLoginModal(true); }}
                style={{ background: "#b91c1c", color: "white", border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                Officer Login →
              </button>
              <a href="#about"
                style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, padding: "10px 20px", fontSize: 14, fontWeight: 500, textDecoration: "none", backdropFilter: "blur(4px)" }}>
                Know About FRA
              </a>
            </div>
          </div>
        </div>
        {/* Breadcrumb */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(30,58,95,0.82)", backdropFilter: "blur(4px)", padding: "7px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#93c5fd" }}>
            <span>Home</span>
            <span style={{ color: "#60a5fa" }}>/</span>
            <span style={{ color: "white", fontWeight: 500 }}>Forest Rights Act — VANTARA Monitoring System</span>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ background: "#1e3a5f" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderLeft: "1px solid rgba(148,163,184,0.2)" }}>
          {FRA_STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: "center", padding: "0 24px", borderRight: "1px solid rgba(148,163,184,0.2)" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#fde68a" }}>{stat.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginTop: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: "#93c5fd", marginTop: 1 }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── About FRA ── */}
      <section id="about" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 4, height: 24, background: "#b91c1c", borderRadius: 2 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>Forest Rights Act</h2>
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 28, marginLeft: 12 }}>
          Home &nbsp;/&nbsp; Forest Rights Act
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div style={{ color: "#374151", fontSize: 14, lineHeight: 1.8 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 16, lineHeight: 1.4 }}>
              Scheduled Tribes And Other Traditional Forest Dwellers (Recognition Of Forest Rights) Act, 2006
            </h3>
            <p style={{ marginBottom: 14 }}>
              The Forest Rights Act (FRA), 2006 recognizes the rights of the forest dwelling tribal communities and other traditional forest dwellers to forest resources, on which these communities were dependent for a variety of needs, including livelihood, habitation and other socio-cultural needs. The forest management policies, including the Acts, Rules and Forest Policies of Participatory Forest Management policies in both colonial and post-colonial India, did not, till the enactment of this Act, recognize the symbiotic relationship of the STs with the forests, reflected in their dependence on the forest as well as in their traditional wisdom regarding conservation of the forests.
            </p>
            <p>
              The Act encompasses Rights of Self-cultivation and Habitation which are usually regarded as Individual rights; and Community Rights as Grazing, Fishing and access to Water bodies in forests, Habitat Rights for PTGs, Traditional Seasonal Resource access, Rights of settlement and conversion of forest villages, access to biodiversity, community right to intellectual property and traditional knowledge, recognition of traditional customary rights and right to protect, regenerate or conserve or manage any community forest resource.
            </p>
          </div>
          <div style={{ color: "#374151", fontSize: 14, lineHeight: 1.8 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 16 }}>Implementation Mechanism</h3>
            <p style={{ marginBottom: 12 }}>The claims under the Act are processed through a three-tier process:</p>
            <ol style={{ paddingLeft: 20, marginBottom: 20 }}>
              {[
                ["Gram Sabha", "The process is initiated at the Gram Sabha level, which prepares and maintains records and passes resolutions recommending the claims it finds eligible."],
                ["Sub-Divisional Level Committee (SDLC)", "Examines the claims and resolutions forwarded by Gram Sabhas, hears objections, and is required to dispose of claims within 60 days."],
                ["District Level Committee (DLC)", "The final authority for approval or rejection. Chaired by the District Collector, it includes the Divisional Forest Officer and the District Tribal Welfare Officer."],
              ].map(([title, desc]) => (
                <li key={title} style={{ marginBottom: 10 }}>
                  <strong>{title}</strong> — {desc}
                </li>
              ))}
            </ol>
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>VANTARA System Role</div>
              <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.6, margin: 0 }}>
                VANTARA monitors this pipeline using AI-powered anomaly detection — flagging claims stuck beyond statutory limits (Rule 12), identifying land record conflicts, and providing role-specific enforcement tools to each tier of the committee structure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Provisions ── */}
      <section id="provisions" style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "40px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 4, height: 24, background: "#1e5fa4", borderRadius: 2 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>Key Provisions & VANTARA Enforcement Points</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {KEY_PROVISIONS.map((p) => (
              <div key={p.title} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, transition: "box-shadow 0.2s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{p.title}</div>
                    <span style={{ fontSize: 10, color: "#b91c1c", fontFamily: "monospace", fontWeight: 700, background: "#fef2f2", padding: "2px 6px", borderRadius: 3 }}>{p.rule}</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Knowledge Hub ── */}
      <section id="knowledge" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 4, height: 24, background: "#b91c1c", borderRadius: 2 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>Knowledge Hub — Key Documents</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {KEY_DOCS.map((doc) => (
            <a key={doc.title} href={doc.link} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "flex-start", gap: 12, border: "1px solid #e5e7eb", background: "white", borderRadius: 8, padding: "14px 16px", textDecoration: "none", transition: "all 0.2s", color: "inherit" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(59,130,246,0.12)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <div style={{ width: 36, height: 42, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {doc.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af", lineHeight: 1.4, marginBottom: 3 }}>{doc.title}</div>
                <span style={{ fontSize: 10, background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>{doc.type}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Officer Login CTA ── */}
      <section id="login" style={{ background: "#1e3a5f", color: "white", padding: "44px 0", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Authorized Officer Access</h2>
          <p style={{ color: "#93c5fd", fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
            Access your role-specific operational dashboard. Each role provides specialized enforcement tools aligned to your jurisdiction and powers under the Forest Rights Act, 2006.
          </p>
          <button onClick={() => { setLoginStep("role"); setShowLoginModal(true); }}
            style={{ background: "#b91c1c", color: "white", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
            Proceed to Officer Login →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#111827", color: "#9ca3af", padding: "20px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 4, alignItems: "center", textAlign: "center", fontSize: 12 }}>
          <p style={{ margin: 0 }}>© Ministry of Tribal Affairs, Government of India. All Rights Reserved.</p>
          <p style={{ margin: 0, color: "#6b7280" }}>Content provided by: <span style={{ color: "#9ca3af" }}>National Informatics Centre (NIC)</span> | Last Updated: September 2024</p>
        </div>
      </footer>

      {/* ── Login Modal ── */}
      {showLoginModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", width: "100%", maxWidth: loginStep === "role" ? 780 : 480, margin: "0 16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>

            {/* Modal Header */}
            <div style={{ background: "#1e3a5f", color: "white", padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>VANTARA — Authorized Personnel Login</div>
                <div style={{ fontSize: 12, color: "#93c5fd", marginTop: 2 }}>
                  {loginStep === "role" ? "Step 1 of 2 — Select your committee role" : `Step 2 of 2 — Select your state (${selectedRole?.title})`}
                </div>
              </div>
              <button onClick={resetModal}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ×
              </button>
            </div>

            {/* Step 1: Role Selection */}
            {loginStep === "role" && (
              <div style={{ padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {ROLES.map((role) => (
                    <button key={role.id} onClick={() => handleRoleClick(role)}
                      style={{ border: "2px solid #e5e7eb", borderRadius: 12, padding: 20, textAlign: "left", cursor: "pointer", background: "white", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(59,130,246,0.15)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 12 }}>{role.icon}</div>
                      <div style={{ display: "inline-block", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, marginBottom: 8, background: role.badgeColor.replace("bg-", "").replace("[", "").replace("]", "") === "purple-700" ? "#7e22ce" : role.badgeColor.includes("red") ? "#b91c1c" : "#1e3a5f" }}>
                        {role.badge}
                      </div>
                      <div style={{ fontWeight: 700, color: "#111827", fontSize: 14, marginTop: 4 }}>{role.title}</div>
                      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>{role.description}</p>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", marginTop: 12 }}>Select State →</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: State Selection */}
            {loginStep === "state" && selectedRole && (
              <div style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 16px", background: "#f0f7ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                  <span style={{ fontSize: 28 }}>{selectedRole.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e3a5f", fontSize: 15 }}>{selectedRole.title}</div>
                    <div style={{ fontSize: 12, color: "#4b5563" }}>{selectedRole.badge}</div>
                  </div>
                </div>

                <label style={{ display: "block", fontWeight: 600, color: "#374151", fontSize: 13, marginBottom: 8 }}>
                  Select your State / UT
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {STATES.map((state) => (
                    <button key={state} onClick={() => setSelectedState(state)}
                      style={{
                        border: selectedState === state ? "2px solid #1e5fa4" : "2px solid #e5e7eb",
                        borderRadius: 8, padding: "10px 16px", textAlign: "left", cursor: "pointer",
                        background: selectedState === state ? "#eff6ff" : "white",
                        color: selectedState === state ? "#1e3a5f" : "#374151",
                        fontWeight: selectedState === state ? 700 : 500,
                        fontSize: 13, transition: "all 0.15s",
                        display: "flex", alignItems: "center", gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 16 }}>
                        {state === "Jharkhand" ? "🌿" : state === "Chhattisgarh" ? "🌳" : state === "Odisha" ? "🏔️" : state === "Madhya Pradesh" ? "🌾" : state === "Maharashtra" ? "🏞️" : "🌄"}
                      </span>
                      {state}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setLoginStep("role")}
                    style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "white", color: "#374151" }}>
                    ← Back
                  </button>
                  <button onClick={handleProceed} disabled={!selectedState}
                    style={{ flex: 2, border: "none", borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 700, cursor: selectedState ? "pointer" : "not-allowed", background: selectedState ? "#1e3a5f" : "#d1d5db", color: "white", transition: "background 0.15s" }}>
                    Access {selectedRole.title} Dashboard →
                  </button>
                </div>
              </div>
            )}

            <div style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb", padding: "10px 24px", textAlign: "center", fontSize: 11, color: "#9ca3af" }}>
              🔒 This system is for authorized Government of India officials only. All access is logged and audited.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
