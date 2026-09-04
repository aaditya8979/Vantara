/* ─── VANTARA — Government Portal Landing Page ──────────────────────
   Modelled on tribal.nic.in NIC design language:
   • Dual topbars (utility + main header)
   • Blue navigation bar
   • Full-width hero banner with real photograph + gradient shade
   • FRA knowledge section with act content
   • Role-based login modal
   ──────────────────────────────────────────────────────────────── */

import { useState } from "react";

export type UserRole = "sdlc_officer" | "dlc_magistrate" | "state_secretary" | null;

interface LandingProps {
  onRoleSelect: (role: UserRole) => void;
}

const NAV_ITEMS = [
  { label: "Home", href: "#" },
  { label: "About FRA", href: "#about" },
  { label: "Dashboard", href: "#login" },
  { label: "Knowledge Hub", href: "#knowledge" },
  { label: "Key Provisions", href: "#provisions" },
  { label: "JJGU", href: "#" },
  { label: "Review Meeting", href: "#" },
  { label: "Contact Us", href: "#" },
];

const FRA_STATS = [
  { label: "Total Claims Filed", value: "25.7 Lakh", sub: "As of March 2023" },
  { label: "Titles Distributed", value: "22.2 Lakh", sub: "Across 24 States" },
  { label: "Area Recognized", value: "1.87 Cr. Ha", sub: "Total Forest Land" },
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

const KEY_DOCS = [
  { title: "The Forest Rights Act, 2006", type: "Act", link: "https://tribal.nic.in/FRA/data/FRARulesBook.pdf" },
  { title: "FRA Amendment Rules, 2012", type: "Rules", link: "https://tribal.nic.in/FRA.aspx" },
  { title: "MoTA Monthly Progress Report", type: "Report", link: "https://tribal.nic.in/FRA.aspx" },
  { title: "Gram Sabha Resolution Format", type: "Format", link: "https://tribal.nic.in/FRA.aspx" },
  { title: "Claimant Application Form", type: "Form", link: "https://tribal.nic.in/FRA.aspx" },
  { title: "SLMC Review Guidelines", type: "Guidelines", link: "https://tribal.nic.in/FRA.aspx" },
];

const ROLES = [
  {
    id: "sdlc_officer" as const,
    title: "SDLC Field Officer",
    subtitle: "Khunti Sub-Division, Jharkhand",
    icon: "📋",
    description:
      "Access the field verification queue. Process incomplete records, generate Patwari survey batches and GPS verification checklists.",
    badge: "Sub-Divisional Level Committee",
    badgeColor: "bg-purple-700",
  },
  {
    id: "dlc_magistrate" as const,
    title: "District Magistrate",
    subtitle: "DLC Chairperson — Bastar, Chhattisgarh",
    icon: "⚖️",
    description:
      "Monitor statutory deadlines, resolve land conflicts, and issue Rule 12(2) directives and Joint Cadastral Inspection orders.",
    badge: "District Level Committee",
    badgeColor: "bg-red-700",
  },
  {
    id: "state_secretary" as const,
    title: "State Tribal Secretary",
    subtitle: "Government of Jharkhand",
    icon: "🏛️",
    description:
      "Review state-wide clearance rates, mandate special SDLC sittings, and identify systemic suppression in affected districts.",
    badge: "State Level Monitoring Committee",
    badgeColor: "bg-[#1e3a5f]",
  },
];

export default function Landing({ onRoleSelect }: LandingProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Row 1: Utility Topbar (NIC-style) ── */}
      <div className="bg-[#f5f5f5] border-b border-gray-300 text-xs text-gray-700 py-1">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between">
          <span className="font-medium">GOVERNMENT OF INDIA | MINISTRY OF TRIBAL AFFAIRS</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Skip to Main</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:underline">Screen Reader Access</a>
            <span className="text-gray-400">|</span>
            <button className="font-bold border border-gray-400 px-1.5 py-0.5 rounded text-[11px]">A-</button>
            <button className="font-bold border border-gray-400 px-1.5 py-0.5 rounded text-[11px]">A</button>
            <button className="font-bold border border-gray-400 px-1.5 py-0.5 rounded text-[11px]">A+</button>
            <span className="text-gray-400">|</span>
            <a href="https://tribal.nic.in/FRA.aspx" target="_blank" rel="noopener" className="font-semibold text-[#b22222] hover:underline">
              हिन्दी
            </a>
          </div>
        </div>
      </div>

      {/* ── Row 2: Main Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + Name Block */}
          <div className="flex items-center gap-4">
            {/* Ashoka Emblem Placeholder */}
            <div className="w-[70px] h-[70px] flex-shrink-0 flex items-center justify-center rounded-full bg-[#e8edf5] border-2 border-[#1e3a5f]">
              <span className="text-3xl">🇮🇳</span>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 font-medium tracking-wide uppercase">जनजातीय कार्य मंत्रालय</div>
              <div className="text-[19px] font-bold text-[#1e3a5f] leading-tight tracking-wide">
                MINISTRY OF TRIBAL AFFAIRS
              </div>
              <div className="text-[13px] text-gray-600 font-medium">GOVERNMENT OF INDIA</div>
            </div>
          </div>

          {/* VANTARA System Identity */}
          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-lg shadow">
                V
              </div>
              <div>
                <div className="text-base font-bold text-[#1e3a5f] tracking-wider">VANTARA</div>
                <div className="text-[10px] text-gray-500 tracking-wider">AUTHORIZED MONITORING SYSTEM</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] text-green-700 font-medium">System Online — FRA Monitoring Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Row 3: Navigation Bar ── */}
      <nav className="bg-[#1e5fa4] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4">
          <ul className="flex items-stretch">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={item.label === "Dashboard" ? (e) => { e.preventDefault(); setShowLoginModal(true); } : undefined}
                  className={`flex items-center px-4 py-3 text-[13px] font-medium whitespace-nowrap border-r border-blue-400/30 hover:bg-[#2c7ad6] transition-colors ${
                    item.label === "Dashboard" ? "bg-[#b22222] hover:bg-[#9b1c1c]" : ""
                  } ${i === 0 ? "border-l border-blue-400/30" : ""}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Hero Banner with Real Photo ── */}
      <div className="relative h-[420px] overflow-hidden">
        <img
          src="/hero.jpg"
          alt="Tribal communities in forest — Forest Rights Act"
          className="w-full h-full object-cover object-center"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col justify-center px-10 max-w-[1200px] mx-auto left-0 right-0">
          <div className="max-w-xl">
            <div className="inline-block bg-[#b22222] text-white text-xs font-bold px-3 py-1 rounded mb-3 tracking-wider uppercase">
              AI-Powered Decision Support System
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-3 drop-shadow-lg">
              Forest Rights Act<br />
              <span className="text-yellow-300">Monitoring & Enforcement</span>
            </h1>
            <p className="text-gray-200 text-sm leading-relaxed mb-5 max-w-md">
              Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006 — Real-time anomaly detection and multi-tier resolution platform.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-[#b22222] hover:bg-[#9b1c1c] text-white text-sm font-semibold px-6 py-2.5 rounded shadow-md transition-colors"
              >
                Officer Login →
              </button>
              <a
                href="#about"
                className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-5 py-2.5 rounded border border-white/30 transition-colors backdrop-blur-sm"
              >
                Know About FRA
              </a>
            </div>
          </div>
        </div>
        {/* Bottom breadcrumb bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1e3a5f]/80 backdrop-blur-sm px-6 py-2">
          <div className="max-w-[1200px] mx-auto flex items-center gap-2 text-xs text-blue-200">
            <span>Home</span>
            <span>/</span>
            <span className="text-white font-medium">Forest Rights Act — VANTARA Monitoring System</span>
          </div>
        </div>
      </div>

      {/* ── Live Statistics Bar ── */}
      <div className="bg-[#1e3a5f] text-white">
        <div className="max-w-[1200px] mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-blue-400/30">
          {FRA_STATS.map((stat) => (
            <div key={stat.label} className="px-6 text-center">
              <div className="text-2xl font-bold text-yellow-300">{stat.value}</div>
              <div className="text-sm font-semibold text-white mt-0.5">{stat.label}</div>
              <div className="text-[11px] text-blue-300">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── About FRA ── */}
      <section id="about" className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="flex gap-2 items-center mb-1">
          <div className="w-1 h-6 bg-[#b22222] rounded" />
          <h2 className="text-xl font-bold text-[#1e3a5f]">Forest Rights Act</h2>
        </div>
        <div className="text-xs text-gray-400 mb-5 ml-3">Home / Forest Rights Act</div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <h3 className="font-bold text-base text-gray-900">
              Scheduled Tribes And Other Traditional Forest Dwellers (Recognition Of Forest Rights) Act, 2006
            </h3>
            <p>
              The Forest Rights Act (FRA), 2006 recognizes the rights of the forest dwelling tribal communities
              and other traditional forest dwellers to forest resources, on which these communities were dependent
              for a variety of needs, including livelihood, habitation and other socio-cultural needs. The forest
              management policies, including the Acts, Rules and Forest Policies of Participatory Forest Management
              policies in both colonial and post-colonial India, did not, till the enactment of this Act, recognize
              the symbiotic relationship of the STs with the forests, reflected in their dependence on the forest
              as well as in their traditional wisdom regarding conservation of the forests.
            </p>
            <p>
              The Act encompasses Rights of Self-cultivation and Habitation which are usually regarded as Individual
              rights; and Community Rights as Grazing, Fishing and access to Water bodies in forests, Habitat Rights
              for PTGs, Traditional Seasonal Resource access, Rights of settlement and conversion of forest villages,
              access to biodiversity, community right to intellectual property and traditional knowledge, recognition
              of traditional customary rights and right to protect, regenerate or conserve or manage any community
              forest resource.
            </p>
          </div>
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <h3 className="font-bold text-base text-gray-900">Implementation Mechanism</h3>
            <p>
              The claims under the Act are processed through a three-tier process:
            </p>
            <ol className="list-decimal pl-4 space-y-2">
              <li>
                <strong>Gram Sabha</strong> — The process is initiated at the Gram Sabha level, which prepares and
                maintains records and passes resolutions recommending the claims it finds eligible.
              </li>
              <li>
                <strong>Sub-Divisional Level Committee (SDLC)</strong> — Examines the claims and resolutions forwarded
                by Gram Sabhas, hears objections, and is required to dispose of claims within 60 days.
              </li>
              <li>
                <strong>District Level Committee (DLC)</strong> — The final authority for approval or rejection. Chaired
                by the District Collector, it includes the Divisional Forest Officer and the District Tribal Welfare Officer.
              </li>
            </ol>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">VANTARA System Role</div>
              <p className="text-xs text-amber-900">
                VANTARA monitors this pipeline using AI-powered anomaly detection — flagging claims stuck beyond statutory
                limits (Rule 12), identifying land record conflicts, and providing role-specific enforcement tools
                to each tier of the committee structure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Provisions Grid ── */}
      <section id="provisions" className="bg-gray-50 border-t border-b border-gray-200 py-10">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex gap-2 items-center mb-6">
            <div className="w-1 h-6 bg-[#1e5fa4] rounded" />
            <h2 className="text-xl font-bold text-[#1e3a5f]">Key Provisions & VANTARA Enforcement Points</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {KEY_PROVISIONS.map((p) => (
              <div key={p.title} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{p.title}</h3>
                    <span className="text-[10px] text-[#b22222] font-mono font-bold bg-red-50 px-1.5 py-0.5 rounded">{p.rule}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Knowledge Hub ── */}
      <section id="knowledge" className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex gap-2 items-center mb-6">
          <div className="w-1 h-6 bg-[#b22222] rounded" />
          <h2 className="text-xl font-bold text-[#1e3a5f]">Knowledge Hub — Key Documents</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {KEY_DOCS.map((doc) => (
            <a
              key={doc.title}
              href={doc.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md rounded-lg p-4 text-center transition-all group"
            >
              <div className="w-10 h-12 bg-gray-100 rounded border border-gray-300 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <span className="text-xl">📄</span>
              </div>
              <div className="text-xs font-semibold text-gray-700 leading-tight group-hover:text-blue-700 transition-colors">{doc.title}</div>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{doc.type}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── Officer Login CTA ── */}
      <section id="login" className="bg-[#1e3a5f] text-white py-10">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-2">Authorized Officer Access</h2>
          <p className="text-blue-200 text-sm mb-6 max-w-lg mx-auto">
            Access your role-specific operational dashboard. Each role provides specialized enforcement tools
            aligned to your jurisdiction and powers under the Forest Rights Act, 2006.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-[#b22222] hover:bg-[#9b1c1c] text-white font-bold px-8 py-3 rounded-lg shadow-md transition-colors text-sm"
          >
            Proceed to Officer Login →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-6">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>© Ministry of Tribal Affairs, Government of India. All Rights Reserved.</p>
          <p className="text-gray-500">
            Content provided by: <span className="text-gray-300">National Informatics Centre (NIC)</span> |
            Last Updated: September 2024
          </p>
        </div>
      </footer>

      {/* ── Role Selection Modal ── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1e3a5f] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">VANTARA — Authorized Personnel Login</h3>
                <p className="text-xs text-blue-200 mt-0.5">Select your role to access the operational dashboard</p>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-blue-300 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Role Cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => { onRoleSelect(role.id); setShowLoginModal(false); }}
                  className="border-2 border-gray-200 hover:border-blue-500 rounded-xl p-5 text-left transition-all duration-200 cursor-pointer hover:shadow-lg group"
                >
                  <div className="text-3xl mb-3">{role.icon}</div>
                  <div className={`inline-block text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2 ${role.badgeColor}`}>
                    {role.badge}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors leading-tight">
                    {role.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{role.subtitle}</p>
                  <p className="text-xs text-gray-400 mt-2.5 leading-relaxed">{role.description}</p>
                  <div className="mt-3 text-xs font-bold text-blue-600 group-hover:text-blue-700">
                    Access Dashboard →
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-center text-xs text-gray-400">
              🔒 This system is for authorized Government of India officials only. All access is logged.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
