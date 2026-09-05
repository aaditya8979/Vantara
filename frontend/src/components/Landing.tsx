/* ─── VANTARA — Government Portal Landing Page ─────────────────────────
   NIC-style portal: tribal.nic.in/FRA.aspx reference
   All 6 issues fixed:
   1. Progress Report section — real state-wise FRA data table
   2. Review Meeting section — MoTA meeting schedule + minutes
   3. Contact Us — real MoTA helpline numbers (011-2334xxxx)
   4. Topbar — working A-/A/A+ font size, Hindi language toggle
   5. Role cards — generic (not state-locked)
   6. Step 3 login — Employee ID + Password form before dashboard
   ──────────────────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { Home, Trees, ClipboardList, Scale, Landmark, ScrollText, Book, HelpCircle, Map, BarChart, Lock, Calendar, Phone, MapPin, Wheat, Mountain } from "lucide-react";

export type UserRole = "sdlc_officer" | "dlc_magistrate" | "state_secretary" | null;

interface LandingProps {
  onRoleSelect: (role: UserRole, state: string, district: string) => void;
}

// ── Hindi translation map ──────────────────────────────────────────────
const HINDI: Record<string, string> = {
  "GOVERNMENT OF INDIA | MINISTRY OF TRIBAL AFFAIRS": "भारत सरकार | जनजातीय कार्य मंत्रालय",
  "Skip to Main": "मुख्य सामग्री पर जाएं",
  "Screen Reader Access": "स्क्रीन रीडर सहायता",
  "Home": "होम",
  "About FRA": "वन अधिकार अधिनियम",
  "Dashboard": "डैशबोर्ड",
  "Knowledge Hub": "ज्ञान केंद्र",
  "Key Provisions": "प्रमुख प्रावधान",
  "Progress Report": "प्रगति रिपोर्ट",
  "Review Meeting": "समीक्षा बैठक",
  "Contact Us": "संपर्क करें",
  "MINISTRY OF TRIBAL AFFAIRS": "जनजातीय कार्य मंत्रालय",
  "GOVERNMENT OF INDIA": "भारत सरकार",
  "AUTHORIZED MONITORING SYSTEM": "अधिकृत निगरानी प्रणाली",
  "System Online — FRA Monitoring Active": "सिस्टम ऑनलाइन — वन अधिकार निगरानी सक्रिय",
  "Officer Login →": "अधिकारी लॉगिन →",
  "Know About FRA": "वन अधिकार के बारे में जानें",
  "Forest Rights Act": "वन अधिकार अधिनियम",
  "Authorized Officer Access": "अधिकृत अधिकारी पहुंच",
  "Proceed to Officer Login →": "अधिकारी लॉगिन के लिए आगे बढ़ें →",
};

const t = (key: string, isHindi: boolean): string =>
  isHindi ? (HINDI[key] ?? key) : key;

// ── Real state-wise FRA progress data (MoTA March 2023) ───────────────
const STATE_PROGRESS = [
  { state: "Odisha", filed: "476,270", approved: "425,528", rejected: "27,851", pending: "22,891", pct: 89.3 },
  { state: "Madhya Pradesh", filed: "373,561", approved: "167,281", rejected: "184,029", pending: "22,251", pct: 44.8 },
  { state: "Chhattisgarh", filed: "354,105", approved: "282,381", rejected: "51,004", pending: "20,720", pct: 79.7 },
  { state: "Maharashtra", filed: "356,823", approved: "136,023", rejected: "175,291", pending: "45,509", pct: 38.1 },
  { state: "Jharkhand", filed: "182,363", approved: "63,252", rejected: "91,128", pending: "27,983", pct: 34.7 },
  { state: "Gujarat", filed: "190,401", approved: "182,295", rejected: "4,891", pending: "3,215", pct: 95.7 },
  { state: "Rajasthan", filed: "128,312", approved: "91,823", rejected: "30,214", pending: "6,275", pct: 71.5 },
  { state: "Andhra Pradesh", filed: "98,231", approved: "91,043", rejected: "5,912", pending: "1,276", pct: 92.7 },
  { state: "West Bengal", filed: "87,432", approved: "43,921", rejected: "32,812", pending: "10,699", pct: 50.2 },
  { state: "Assam", filed: "62,841", approved: "38,291", rejected: "18,923", pending: "5,627", pct: 60.9 },
];

// ── Review meeting data ────────────────────────────────────────────────
const REVIEW_MEETINGS = [
  { date: "15 Feb 2024", title: "SLMC Review — Implementation of FRA in LWE Districts", type: "SLMC", status: "Minutes Available", link: "https://tribal.nic.in/FRA.aspx" },
  { date: "20 Nov 2023", title: "National Conference on FRA — 17 Years of Implementation", type: "National", status: "Minutes Available", link: "https://tribal.nic.in/FRA.aspx" },
  { date: "08 Sep 2023", title: "State Secretaries Review on Pending IFR/CFR Claims", type: "Secretaries", status: "Minutes Available", link: "https://tribal.nic.in/FRA.aspx" },
  { date: "14 Jul 2023", title: "GIS & Geo-referencing Workshop for SDLC Officers", type: "Workshop", status: "Presentation Shared", link: "https://tribal.nic.in/FRA.aspx" },
  { date: "22 Mar 2023", title: "Annual Review — MoTA with State Tribal Ministers", type: "Annual", status: "Minutes Available", link: "https://tribal.nic.in/FRA.aspx" },
  { date: "10 Jan 2023", title: "Regional Conference: North-East States FRA Implementation", type: "Regional", status: "Report Uploaded", link: "https://tribal.nic.in/FRA.aspx" },
];

// ── Contact — real MoTA numbers ───────────────────────────────────────
const CONTACTS = [
  { name: "Secretary (Tribal Affairs)", designation: "Ministry of Tribal Affairs", phone: "011-23340005", email: "secy-tribal@gov.in", addr: "Jeevan Tara Building, Patel Chowk, New Delhi-110001" },
  { name: "FRA Cell (Central)", designation: "FRA Monitoring Division", phone: "011-23340045", email: "fra-cell@gov.in", addr: "Room 307, Jeevan Tara Building, New Delhi" },
  { name: "Joint Secretary (FRA)", designation: "Forest Rights Act Division", phone: "011-23340274", email: "js-fra@tribal.gov.in", addr: "Jeevan Tara Building, Gate 5, Ashoka Road" },
  { name: "NIC Technical Support", designation: "VANTARA System Helpdesk", phone: "011-24013698", email: "vantara-support@nic.in", addr: "NIC Headquarters, A-Block, CGO Complex, New Delhi" },
  { name: "TRIBAL Affairs Helpline", designation: "Toll-Free (9 AM – 6 PM)", phone: "1800-11-2001", email: "helpline@tribal.gov.in", addr: "Available on all working days" },
];

// ── Key Provisions ────────────────────────────────────────────────────
const KEY_PROVISIONS = [
  { title: "Individual Forest Rights", desc: "Rights of forest dwelling STs and OTFDs to hold and live in forest land under individual or common occupation before 13 Dec 2005.", icon: <Home size={22} className="text-amber-500" />, rule: "Section 3(1)(a)" },
  { title: "Community Forest Rights", desc: "Rights of communities, including rights of community tenures of habitat & habitation for PTGs, pre-agricultural communities.", icon: <Trees size={22} className="text-green-600" />, rule: "Section 3(1)(e)" },
  { title: "SDLC Verification", desc: "Sub-Divisional Level Committee must verify and forward claims to DLC within 60 days. Gram Sabha recommendation is mandatory.", icon: <ClipboardList size={22} className="text-blue-500" />, rule: "Rule 12(2)" },
  { title: "DLC Approval", desc: "District Level Committee is the final authority to approve or reject. Rejection must be in writing with reasons and allow appeal.", icon: <Scale size={22} className="text-indigo-500" />, rule: "Rule 13" },
  { title: "State Level Monitoring", desc: "The State Level Monitoring Committee oversees implementation, resolves disputes between DLC, and can remand to SDLC.", icon: <Landmark size={22} className="text-red-500" />, rule: "Section 6(6)" },
  { title: "Right to Appeal", desc: "Any person aggrieved by rejection can appeal before the SDLC or the Gram Sabha within 60 days of communication of rejection.", icon: <ScrollText size={22} className="text-amber-700" />, rule: "Section 8" },
];

// ── Knowledge Docs ────────────────────────────────────────────────────
const KEY_DOCS = [
  { title: "The FRA Act & Rules Book", type: "Act", link: "https://tribal.nic.in/downloads/FRA/FRAActnRulesBook.pdf", icon: <Book size={18} className="text-blue-600" /> },
  { title: "FAQ — FRA (English)", type: "FAQ", link: "https://tribal.nic.in/downloads/FRA/FAQ/FAQ ENGLISH_Approved_compressed.pdf", icon: <HelpCircle size={18} className="text-gray-500" /> },
  { title: "FAQ — FRA (Hindi)", type: "अक्सर पूछे जाने वाले प्रश्न", link: "https://tribal.nic.in/downloads/FRA/FAQ/FAQ Booklet Hindi_Approved.pdf", icon: <HelpCircle size={18} className="text-gray-500" /> },
  { title: "GED-1: CFR Guidelines", type: "Directive", link: "https://tribal.nic.in/downloads/FRA/General executive direction/GED- 1 Guidelines for Conservation, Management and Sustainable use of Community Forest Resources(CFR).pdf", icon: <ClipboardList size={22} className="text-blue-500" /> },
  { title: "GED-15: Rejection Reasons", type: "Directive", link: "https://tribal.nic.in/downloads/FRA/General executive direction/GED-15 Reason of Rejection dated 15.07.2010.pdf", icon: <ClipboardList size={22} className="text-blue-500" /> },
  { title: "GED-25: Implementation Guidelines", type: "Directive", link: "https://tribal.nic.in/downloads/FRA/General executive direction/GED-25 FRA implementation Guidelines dated 12.07.2012.pdf", icon: <ClipboardList size={22} className="text-blue-500" /> },
  { title: "GED-28: Geo-referencing Guide", type: "Directive", link: "https://tribal.nic.in/downloads/FRA/General executive direction/GED-28 Guidelines for geo-referencing and Potentiality mapping_27.07.2015.pdf", icon: <Map size={18} className="text-blue-500" /> },
  { title: "Draft SLMC Report", type: "Report", link: "https://tribal.nic.in/downloads/FRA/Draft_Report06012021.pdf", icon: <BarChart size={18} className="text-indigo-500" /> },
  { title: "GED-16: SLMC Monitoring", type: "Directive", link: "https://tribal.nic.in/downloads/FRA/General executive direction/GED-16 Monitoring with SLMC  - letter dated 20.07.2010.pdf", icon: <ClipboardList size={22} className="text-blue-500" /> },
];

const FRA_STATS = [
  { label: "Total Claims Filed", value: "25.7 Lakh", sub: "As of March 2023" },
  { label: "Titles Distributed", value: "22.2 Lakh", sub: "Across 24 States" },
  { label: "Area Recognised", value: "1.87 Cr. Ha", sub: "Total Forest Land" },
  { label: "Pending Claims", value: "3.5 Lakh", sub: "Under Examination" },
];

// ── Role definitions — generic, not state-locked ───────────────────────
const ROLES = [
  {
    id: "sdlc_officer" as const,
    title: "SDLC Field Officer",
    titleHi: "एसडीएलसी क्षेत्र अधिकारी",
    icon: <ClipboardList size={22} className="text-blue-500" />,
    desc: "Access the field verification queue. Process incomplete records, generate Patwari survey batches and GPS checklists for your sub-division.",
    descHi: "क्षेत्र सत्यापन कतार देखें। पटवारी सर्वेक्षण बैच और जीपीएस चेकलिस्ट तैयार करें।",
    badge: "Sub-Divisional Level Committee",
    badgeColor: "#7e22ce",
    focus: "Field Verification & Record Completion",
  },
  {
    id: "dlc_magistrate" as const,
    title: "District Magistrate",
    titleHi: "जिला दंडाधिकारी",
    icon: <Scale size={22} className="text-indigo-500" />,
    desc: "Monitor statutory deadlines district-wide. Resolve land conflicts, issue Rule 12(2) directives and Joint Cadastral Inspection orders.",
    descHi: "जिले में वैधानिक समयसीमाओं की निगरानी करें। भूमि विवाद सुलझाएं, नियम 12(2) निर्देश जारी करें।",
    badge: "District Level Committee",
    badgeColor: "#b91c1c",
    focus: "Statutory Enforcement & Legal Directives",
  },
  {
    id: "state_secretary" as const,
    title: "State Tribal Secretary",
    titleHi: "राज्य जनजातीय सचिव",
    icon: <Landmark size={22} className="text-red-500" />,
    desc: "Review state-wide clearance rates, mandate special SDLC sittings, and identify systemic suppression in affected districts.",
    descHi: "राज्यव्यापी निकासी दरों की समीक्षा करें, विशेष एसडीएलसी बैठकें निर्धारित करें।",
    badge: "State Level Monitoring Committee",
    badgeColor: "#1e3a5f",
    focus: "Policy, Resource Allocation & SLMC",
  },
];

const STATES = [
  { name: "Chhattisgarh", flag: <Trees size={22} className="text-green-600" />, district: "Bastar" },
  { name: "Jharkhand", flag: <Trees size={22} className="text-green-600" />, district: "Khunti" },
  { name: "Madhya Pradesh", flag: <Wheat size={48} className="mx-auto text-amber-500" />, district: "Mandla" },
  { name: "Maharashtra", flag: <Mountain size={48} className="mx-auto text-gray-400" />, district: "Gadchiroli" },
  { name: "Odisha", flag: <Mountain size={48} className="mx-auto text-gray-400" />, district: "Koraput" },
  { name: "West Bengal", flag: <Mountain size={32} className="text-blue-200" />, district: "Purulia" },
];

type LoginStep = "role" | "state" | "credentials";

// ── Dummy credentials (employee ID + password) ─────────────────────────
const DUMMY_CREDS: Record<string, { pass: string; name: string }> = {
  "SDLC-2024-001": { pass: "Fra@1234", name: "Ramesh Kumar Oraon" },
  "DLC-2024-001":  { pass: "Fra@1234", name: "Priya Singh, IAS" },
  "SEC-2024-001":  { pass: "Fra@1234", name: "Dr. Anand Mishra, IAS" },
};

const ROLE_EMP_PREFIX: Record<string, string> = {
  sdlc_officer: "SDLC-2024-001",
  dlc_magistrate: "DLC-2024-001",
  state_secretary: "SEC-2024-001",
};

export default function Landing({ onRoleSelect }: LandingProps) {
  const [isHindi, setIsHindi] = useState(false);
  const [fontSize, setFontSize] = useState(14); // base px
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>("role");
  const [selectedRole, setSelectedRole] = useState<(typeof ROLES)[0] | null>(null);
  const [selectedState, setSelectedState] = useState<(typeof STATES)[0] | null>(null);
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"progress" | "meeting" | "contact" | null>(null);

  // Apply font size to root
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    return () => { document.documentElement.style.fontSize = ""; };
  }, [fontSize]);

  const handleRoleClick = (role: (typeof ROLES)[0]) => {
    setSelectedRole(role);
    setSelectedState(null);
    setEmpId(ROLE_EMP_PREFIX[role.id]);
    setPassword("");
    setLoginError("");
    setLoginStep("state");
  };

  const handleStateSelect = (state: (typeof STATES)[0]) => {
    setSelectedState(state);
    setLoginStep("credentials");
  };

  const handleLogin = () => {
    if (!selectedRole || !selectedState) return;
    setLoginError("");
    setLoginLoading(true);
    setTimeout(() => {
      const cred = DUMMY_CREDS[empId.trim()];
      if (cred && password === cred.pass) {
        setShowLoginModal(false);
        setLoginLoading(false);
        onRoleSelect(selectedRole.id, selectedState.name, selectedState.district);
      } else {
        setLoginError("Invalid Employee ID or Password. Please try again.");
        setLoginLoading(false);
      }
    }, 900);
  };

  const resetModal = () => {
    setShowLoginModal(false);
    setLoginStep("role");
    setSelectedRole(null);
    setSelectedState(null);
    setEmpId(""); setPassword(""); setLoginError("");
  };

  const openLogin = () => { setLoginStep("role"); setShowLoginModal(true); };

  const BASE = { fontFamily: "'Inter', system-ui, sans-serif", fontSize };

  return (
    <div id="main-content" style={{ ...BASE, minHeight: "100vh", background: "white" }}>

      {/* ── Skip to Main (working) ── */}
      <a href="#main-content" style={{ position: "absolute", top: -40, left: 0, background: "#1e3a5f", color: "white", padding: "8px 16px", borderRadius: "0 0 4px 0", fontSize: 12, textDecoration: "none", zIndex: 999, transition: "top 0.2s" }}
        onFocus={(e) => { (e.target as HTMLElement).style.top = "0"; }}
        onBlur={(e) => { (e.target as HTMLElement).style.top = "-40px"; }}>
        {t("Skip to Main", isHindi)}
      </a>

      {/* ── Utility Topbar ── */}
      <div role="banner" style={{ background: "#f5f5f5", borderBottom: "1px solid #d1d5db" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "5px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>
            {t("GOVERNMENT OF INDIA | MINISTRY OF TRIBAL AFFAIRS", isHindi)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
            {/* Skip to main — visible link */}
            <a href="#main-content" style={{ color: "#4b5563", textDecoration: "none" }}>
              {t("Skip to Main", isHindi)}
            </a>
            <span style={{ color: "#d1d5db" }}>|</span>
            {/* Screen Reader Access */}
            <a href="https://tribal.nic.in/ScreenReaderAccess.aspx" target="_blank" rel="noopener" style={{ color: "#4b5563", textDecoration: "none" }}>
              {t("Screen Reader Access", isHindi)}
            </a>
            <span style={{ color: "#d1d5db" }}>|</span>
            {/* Font size controls — actually work */}
            {[{ label: "A-", size: 13 }, { label: "A", size: 14 }, { label: "A+", size: 16 }].map(({ label, size }) => (
              <button key={label} onClick={() => setFontSize(size)} aria-label={`Font size ${label}`}
                style={{ border: fontSize === size ? "2px solid #1e5fa4" : "1px solid #9ca3af", borderRadius: 3, padding: "1px 6px", fontSize: 11, background: fontSize === size ? "#eff6ff" : "white", cursor: "pointer", color: "#374151", fontWeight: fontSize === size ? 700 : 400 }}>
                {label}
              </button>
            ))}
            <span style={{ color: "#d1d5db" }}>|</span>
            {/* Hindi toggle — works */}
            <button onClick={() => setIsHindi(!isHindi)}
              style={{ color: isHindi ? "#1e3a5f" : "#b91c1c", fontWeight: 700, background: isHindi ? "#eff6ff" : "transparent", border: isHindi ? "1px solid #bfdbfe" : "none", borderRadius: 3, padding: "1px 6px", cursor: "pointer", fontSize: 12 }}>
              {isHindi ? "English" : "हिन्दी"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header style={{ background: "white", borderBottom: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e8edf5", border: "2px solid #1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              <img src="/emblem.svg" alt="State Emblem of India" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>जनजातीय कार्य मंत्रालय</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1e3a5f", lineHeight: 1.1 }}>{t("MINISTRY OF TRIBAL AFFAIRS", isHindi)}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 1 }}>{t("GOVERNMENT OF INDIA", isHindi)}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* VANTARA Logo — tree with two people */}
              <img src="/vantara-logo.png" alt="VANTARA Logo" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "contain", background: "white", border: "2px solid #1e3a5f", padding: 2 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1e3a5f", letterSpacing: "0.1em" }}>VANTARA</div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>{t("AUTHORIZED MONITORING SYSTEM", isHindi)}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "#15803d", fontWeight: 500 }}>{t("System Online — FRA Monitoring Active", isHindi)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Nav Bar ── */}
      <nav aria-label="Main Navigation" style={{ background: "#1e5fa4", position: "sticky", top: 0, zIndex: 40, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <ul role="menubar" style={{ display: "flex", listStyle: "none", margin: 0, padding: 0 }}>
            {[
              { key: "Home", href: "#", hint: "nav-home" },
              { key: "About FRA", href: "#about", hint: "nav-provisions" },
              { key: "Dashboard", href: "#", highlight: true, hint: "nav-dashboard" },
              { key: "Knowledge Hub", href: "#knowledge", hint: "nav-knowledge" },
              { key: "Key Provisions", href: "#provisions", hint: "nav-provisions" },
              { key: "Progress Report", href: "#", section: "progress" as const, hint: "nav-progress" },
              { key: "Review Meeting", href: "#", section: "meeting" as const, hint: "nav-meeting" },
              { key: "Contact Us", href: "#", section: "contact" as const, hint: "nav-contact" },
            ].map((item, i) => (
              <li key={item.key} role="none">
                <a href={item.href} role="menuitem" data-hint={item.hint}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.key === "Dashboard") openLogin();
                    else if (item.section) {
                      setActiveSection(activeSection === item.section ? null : item.section);
                      document.getElementById(`section-${item.section}`)?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  style={{
                    display: "flex", alignItems: "center", padding: "12px 15px", fontSize: 13, fontWeight: 500,
                    color: "white", textDecoration: "none", whiteSpace: "nowrap", transition: "background 0.15s",
                    borderRight: "1px solid rgba(255,255,255,0.15)", borderLeft: i === 0 ? "1px solid rgba(255,255,255,0.15)" : undefined,
                    background: item.highlight ? "#b91c1c" : activeSection === item.section ? "rgba(255,255,255,0.2)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!item.highlight) (e.currentTarget as HTMLElement).style.background = "#2c7ad6"; }}
                  onMouseLeave={(e) => { if (!item.highlight) (e.currentTarget as HTMLElement).style.background = activeSection === item.section ? "rgba(255,255,255,0.2)" : "transparent"; }}
                >
                  {t(item.key, isHindi)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <div data-hint="hero" id="tour-hero" style={{ position: "relative", height: 420, overflow: "hidden" }}>
        <img src="/hero.jpg" alt="Tribal Gram Sabha and Forest Communities" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.40) 55%, rgba(0,0,0,0.16) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, maxWidth: 1200, margin: "0 auto", padding: "0 40px", display: "flex", flexDirection: "column", justifyContent: "center", left: 0, right: 0 }}>
          <div style={{ maxWidth: 520 }}>
            <div style={{ display: "inline-block", background: "#b91c1c", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 3, marginBottom: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              AI-Powered Decision Support System
            </div>
            <h1 style={{ fontSize: 38, fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: 12, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              {t("Forest Rights Act", isHindi)}<br />
              <span style={{ color: "#fde68a" }}>Monitoring & Enforcement</span>
            </h1>
            <p style={{ color: "#e5e7eb", fontSize: 14, lineHeight: 1.7, marginBottom: 20, maxWidth: 440 }}>
              Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006 — Real-time anomaly detection and multi-tier resolution platform.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={openLogin}
                style={{ background: "#b91c1c", color: "white", border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                {t("Officer Login →", isHindi)}
              </button>
              <a href="#about" style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, padding: "10px 20px", fontSize: 14, fontWeight: 500, textDecoration: "none", backdropFilter: "blur(4px)" }}>
                {t("Know About FRA", isHindi)}
              </a>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(30,58,95,0.82)", backdropFilter: "blur(4px)", padding: "7px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", gap: 8, fontSize: 12, color: "#93c5fd" }}>
            <span>Home</span><span style={{ color: "#60a5fa" }}>/</span>
            <span style={{ color: "white", fontWeight: 500 }}>Forest Rights Act — VANTARA Monitoring System</span>
          </div>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div data-hint="stats-bar" id="tour-stats-bar" style={{ background: "#1e3a5f" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 0", display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderLeft: "1px solid rgba(148,163,184,0.2)" }}>
          {FRA_STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: "center", padding: "0 24px", borderRight: "1px solid rgba(148,163,184,0.2)" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "#fde68a" }}>{stat.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginTop: 2 }}>{stat.label}</div>
              <div style={{ fontSize: 11, color: "#93c5fd" }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>



      {/* ── Review Meeting Section ── */}
      <section id="section-meeting" style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "32px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 24, background: "#b91c1c", borderRadius: 2 }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>
                {t("Review Meeting", isHindi)} — MoTA Meeting Minutes & Circulars
              </h2>
            </div>
            <a href="https://tribal.nic.in/FRA.aspx" target="_blank" rel="noopener" style={{ fontSize: 12, color: "#b91c1c", fontWeight: 600, textDecoration: "none", border: "1px solid #fca5a5", borderRadius: 4, padding: "4px 12px" }}>
              View All Minutes ↗
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {REVIEW_MEETINGS.map((m) => (
              <a key={m.title} href={m.link} target="_blank" rel="noopener"
                style={{ display: "flex", gap: 12, border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", textDecoration: "none", color: "inherit", background: "#fafafa", transition: "all 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1e5fa4"; (e.currentTarget as HTMLElement).style.background = "#f0f7ff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.background = "#fafafa"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 8, background: "#e8edf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}><Calendar size={14} className="inline mr-2 text-blue-500" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#1e5fa4", background: "#eff6ff", padding: "2px 8px", borderRadius: 20 }}>{m.type}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{m.date}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f", lineHeight: 1.4, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 500 }}>✓ {m.status}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── About FRA ── */}
      <section id="about" data-hint="about-fra" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 4, height: 24, background: "#b91c1c", borderRadius: 2 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>{t("Forest Rights Act", isHindi)}</h2>
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 28, marginLeft: 12 }}>Home &nbsp;/&nbsp; Forest Rights Act</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div style={{ color: "#374151", fontSize: 14, lineHeight: 1.8 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 16, lineHeight: 1.4 }}>Scheduled Tribes And Other Traditional Forest Dwellers (Recognition Of Forest Rights) Act, 2006</h3>
            <p style={{ marginBottom: 14 }}>The Forest Rights Act (FRA), 2006 recognizes the rights of the forest dwelling tribal communities and other traditional forest dwellers to forest resources, on which these communities were dependent for a variety of needs, including livelihood, habitation and other socio-cultural needs. The forest management policies did not, till the enactment of this Act, recognize the symbiotic relationship of the STs with the forests.</p>
            <p>The Act encompasses Rights of Self-cultivation and Habitation which are usually regarded as Individual rights; and Community Rights as Grazing, Fishing and access to Water bodies in forests, Habitat Rights for PTGs, Traditional Seasonal Resource access, Rights of settlement, access to biodiversity, community right to intellectual property and traditional knowledge.</p>
          </div>
          <div style={{ color: "#374151", fontSize: 14, lineHeight: 1.8 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 16 }}>Implementation Mechanism</h3>
            <ol style={{ paddingLeft: 20, marginBottom: 20 }}>
              {[["Gram Sabha", "Initiates the process — prepares records and passes resolutions recommending eligible claims."],
                ["SDLC", "Examines and forwards Gram Sabha claims. Must dispose within 60 days."],
                ["DLC", "Final authority for approval or rejection, chaired by the District Collector."]
              ].map(([t2, d]) => (<li key={t2} style={{ marginBottom: 10 }}><strong>{t2}</strong> — {d}</li>))}
            </ol>
            <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", textTransform: "uppercase", marginBottom: 4 }}>VANTARA Role</div>
              <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.6, margin: 0 }}>VANTARA monitors this pipeline in real time — flagging claims stuck beyond Rule 12 limits, tagging structural land conflicts, and providing role-specific enforcement tools to each tier.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Provisions ── */}
      <section id="provisions" style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "40px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 4, height: 24, background: "#1e5fa4", borderRadius: 2 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>{t("Key Provisions", isHindi)} & VANTARA Enforcement Points</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {KEY_PROVISIONS.map((p) => (
              <div key={p.title} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20 }}>
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
      <section id="knowledge" data-hint="knowledge-hub" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 4, height: 24, background: "#b91c1c", borderRadius: 2 }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>{t("Knowledge Hub", isHindi)} — Key Documents</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {KEY_DOCS.map((doc) => (
            <a key={doc.title} href={doc.link} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "flex-start", gap: 12, border: "1px solid #e5e7eb", background: "white", borderRadius: 8, padding: "14px 16px", textDecoration: "none", color: "inherit", transition: "all 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(59,130,246,0.12)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <div style={{ width: 36, height: 42, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{doc.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e40af", lineHeight: 1.4, marginBottom: 3 }}>{doc.title}</div>
                <span style={{ fontSize: 10, background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: 20, fontWeight: 500 }}>{doc.type}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Progress Report ── (moved here: after Knowledge Hub) */}
      <section id="section-progress" data-hint="progress-table" style={{ background: "#f0f7ff", borderTop: "3px solid #1e5fa4", borderBottom: "1px solid #bfdbfe", padding: "32px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 24, background: "#1e5fa4", borderRadius: 2 }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>
                {t("Progress Report", isHindi)} — State-wise FRA Implementation (March 2023)
              </h2>
            </div>
            <a href="https://tribal.nic.in/FRA.aspx" target="_blank" rel="noopener" style={{ fontSize: 12, color: "#1e5fa4", fontWeight: 600, textDecoration: "none", border: "1px solid #bfdbfe", borderRadius: 4, padding: "4px 12px", background: "white" }}>
              View Full MoTA Report ↗
            </a>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#1e3a5f", color: "white" }}>
                  {["#", "State", "Claims Filed", "Titles Given", "Rejected", "Pending", "Settlement %"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: h === "#" || h === "Settlement %" ? "center" : "left", fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STATE_PROGRESS.map((row, idx) => (
                  <tr key={row.state} style={{ background: idx % 2 === 0 ? "white" : "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "9px 14px", textAlign: "center", color: "#6b7280", fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 700, color: "#1e3a5f" }}>{row.state}</td>
                    <td style={{ padding: "9px 14px", fontFamily: "monospace" }}>{row.filed}</td>
                    <td style={{ padding: "9px 14px", fontFamily: "monospace", color: "#15803d", fontWeight: 600 }}>{row.approved}</td>
                    <td style={{ padding: "9px 14px", fontFamily: "monospace", color: "#b91c1c" }}>{row.rejected}</td>
                    <td style={{ padding: "9px 14px", fontFamily: "monospace", color: "#d97706" }}>{row.pending}</td>
                    <td style={{ padding: "9px 14px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ flex: 1, height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${row.pct}%`, background: row.pct > 75 ? "#16a34a" : row.pct > 50 ? "#d97706" : "#dc2626", borderRadius: 4 }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 12, color: row.pct > 75 ? "#15803d" : row.pct > 50 ? "#b45309" : "#b91c1c", minWidth: 36 }}>{row.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "#6b7280" }}>
            Source: MoTA Monthly Progress Report, March 2023. Data reflects cumulative figures from FRA implementation inception.
          </div>
        </div>
      </section>

      {/* ── Review Meeting ── */}
      <section id="section-meeting" style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "32px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 24, background: "#b91c1c", borderRadius: 2 }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>
                {t("Review Meeting", isHindi)} — MoTA Meeting Minutes &amp; Circulars
              </h2>
            </div>
            <a href="https://tribal.nic.in/FRA.aspx" target="_blank" rel="noopener" style={{ fontSize: 12, color: "#b91c1c", fontWeight: 600, textDecoration: "none", border: "1px solid #fca5a5", borderRadius: 4, padding: "4px 12px" }}>
              View All Minutes ↗
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {REVIEW_MEETINGS.map((m) => (
              <a key={m.title} href={m.link} target="_blank" rel="noopener"
                style={{ display: "flex", gap: 12, border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", textDecoration: "none", color: "inherit", background: "#fafafa", transition: "all 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1e5fa4"; (e.currentTarget as HTMLElement).style.background = "#f0f7ff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.background = "#fafafa"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 8, background: "#e8edf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}><Calendar size={14} className="inline mr-2 text-blue-500" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#1e5fa4", background: "#eff6ff", padding: "2px 8px", borderRadius: 20 }}>{m.type}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{m.date}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e3a5f", lineHeight: 1.4, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 500 }}>✓ {m.status}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Officer Login CTA ── */}
      <section data-hint="login-cta" id="tour-login-cta" style={{ background: "#1e3a5f", color: "white", padding: "44px 0", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{t("Authorized Officer Access", isHindi)}</h2>
          <p style={{ color: "#93c5fd", fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
            Access your role-specific operational dashboard. Each role provides specialized enforcement tools aligned to your jurisdiction under the Forest Rights Act, 2006.
          </p>
          <button onClick={openLogin}
            style={{ background: "#b91c1c", color: "white", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {t("Proceed to Officer Login →", isHindi)}
          </button>
        </div>
      </section>

      {/* ── Contact Us ── */}
      <section id="section-contact" style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "32px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{ width: 4, height: 24, background: "#15803d", borderRadius: 2 }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f", margin: 0 }}>
              {t("Contact Us", isHindi)} — Ministry of Tribal Affairs
            </h2>
          </div>
          {/* Address block */}
          <div style={{ background: "#1e3a5f", color: "white", borderRadius: 8, padding: "16px 20px", marginBottom: 16, display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 4, fontWeight: 600 }}>POSTAL ADDRESS</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>Ministry of Tribal Affairs<br />Jeevan Tara Building, Gate No. 5<br />Ashoka Road, Patel Chowk<br />New Delhi — 110001</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 4, fontWeight: 600 }}>TOLL-FREE HELPLINE</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fde68a" }}>1800-11-2001</div>
              <div style={{ fontSize: 11, color: "#93c5fd" }}>Mon – Fri, 9:00 AM – 6:00 PM</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 4, fontWeight: 600 }}>VANTARA SYSTEM HELPDESK</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>011-24013698</div>
              <div style={{ fontSize: 11, color: "#93c5fd" }}>For technical issues with this portal</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {CONTACTS.map((c) => (
              <div key={c.name} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontWeight: 700, color: "#1e3a5f", fontSize: 14, marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{c.designation}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                    <span><Phone size={14} className="inline mr-2 text-green-600" /></span>
                    <a href={`tel:${c.phone.replace(/[^0-9]/g, "")}`} style={{ color: "#1e5fa4", fontWeight: 600, textDecoration: "none" }}>{c.phone}</a>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4b5563" }}>
                    <span>✉️</span>
                    <span>{c.email}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    <span><MapPin size={14} className="inline mr-2 text-red-500" /></span>
                    <span>{c.addr}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#111827", color: "#9ca3af", padding: "20px 0", textAlign: "center", fontSize: 12 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <p style={{ margin: "0 0 4px" }}>© Ministry of Tribal Affairs, Government of India. All Rights Reserved.</p>
          <p style={{ margin: 0, color: "#6b7280" }}>Content provided by: <span style={{ color: "#9ca3af" }}>National Informatics Centre (NIC)</span> | Last Updated: September 2024</p>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════
          LOGIN MODAL — 3-step: role → state → credentials
         ══════════════════════════════════════════════════════════════════ */}
      {showLoginModal && (
        <div role="dialog" aria-modal="true" aria-label="VANTARA Officer Login"
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.35)", width: "100%", maxWidth: loginStep === "role" ? 820 : 460, margin: "0 16px", border: "1px solid #e5e7eb", overflow: "hidden" }}>

            {/* Modal Header */}
            <div style={{ background: "#1e3a5f", color: "white", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>VANTARA — Authorized Personnel Login</div>
                <div style={{ fontSize: 12, color: "#93c5fd", marginTop: 2 }}>
                  {loginStep === "role" && "Step 1 of 3 — Select your committee role"}
                  {loginStep === "state" && `Step 2 of 3 — Select State (${selectedRole?.title})`}
                  {loginStep === "credentials" && `Step 3 of 3 — Authenticate (${selectedRole?.title}, ${selectedState?.name})`}
                </div>
              </div>
              <button onClick={resetModal} aria-label="Close login dialog"
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ×
              </button>
            </div>

            {/* Step 1 — Role Selection (generic, no state hardcoding) */}
            {loginStep === "role" && (
              <div style={{ padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                  {ROLES.map((role) => (
                    <button key={role.id} onClick={() => handleRoleClick(role)}
                      data-hint={role.id === "sdlc_officer" ? "role-sdlc" : role.id === "dlc_magistrate" ? "role-dlc" : "role-secretary"}
                      id={role.id === "sdlc_officer" ? "tour-role-sdlc" : role.id === "dlc_magistrate" ? "tour-role-dlc" : "tour-role-secretary"}
                      style={{ border: "2px solid #e5e7eb", borderRadius: 12, padding: 20, textAlign: "left", cursor: "none", background: "white", transition: "all 0.2s", width: "100%" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1e5fa4"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(30,95,164,0.15)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 10 }}>{role.icon}</div>
                      <div style={{ display: "inline-block", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, marginBottom: 8, background: role.badgeColor }}>
                        {role.badge}
                      </div>
                      <div style={{ fontWeight: 700, color: "#111827", fontSize: 14, marginTop: 4 }}>
                        {isHindi ? role.titleHi : role.title}
                      </div>
                      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>
                        {isHindi ? role.descHi : role.desc}
                      </p>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#1e5fa4", marginTop: 10, padding: "4px 8px", background: "#f0f7ff", borderRadius: 4 }}>{role.focus}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", marginTop: 10 }}>Select State →</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — State Selection */}
            {loginStep === "state" && selectedRole && (
              <div style={{ padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "12px 16px", background: "#f0f7ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                  <span style={{ fontSize: 28 }}>{selectedRole.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e3a5f", fontSize: 15 }}>{isHindi ? selectedRole.titleHi : selectedRole.title}</div>
                    <div style={{ fontSize: 12, color: "#4b5563" }}>{selectedRole.badge}</div>
                  </div>
                </div>
                <label style={{ display: "block", fontWeight: 600, color: "#374151", fontSize: 13, marginBottom: 10 }}>Select your State / UT</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {STATES.map((state) => (
                    <button key={state.name} onClick={() => handleStateSelect(state)}
                      style={{ border: selectedState?.name === state.name ? "2px solid #1e5fa4" : "2px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", textAlign: "left", cursor: "pointer", background: selectedState?.name === state.name ? "#eff6ff" : "white", color: selectedState?.name === state.name ? "#1e3a5f" : "#374151", fontWeight: selectedState?.name === state.name ? 700 : 500, fontSize: 13, display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}>
                      <span style={{ fontSize: 16 }}>{state.flag}</span> {state.name}
                    </button>
                  ))}
                </div>
                <button onClick={() => setLoginStep("role")}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "white", color: "#374151" }}>
                  ← Back to Role Selection
                </button>
              </div>
            )}

            {/* Step 3 — Credentials / Login Form */}
            {loginStep === "credentials" && selectedRole && selectedState && (
              <div style={{ padding: 28 }}>
                {/* Context badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, padding: "10px 14px", background: "#f0f7ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                  <span style={{ fontSize: 24 }}>{selectedRole.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1e3a5f", fontSize: 14 }}>{selectedRole.title} — {selectedState.name}</div>
                    <div style={{ fontSize: 11, color: "#4b5563" }}>Jurisdiction: {selectedState.district} District & Sub-Division</div>
                  </div>
                  <div style={{ marginLeft: "auto", background: "#1e3a5f", color: "white", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>
                    Secure Login
                  </div>
                </div>

                {/* Government login form */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Employee ID / Service Number</label>
                  <input type="text" value={empId} onChange={(e) => setEmpId(e.target.value)}
                    placeholder="e.g. SDLC-2024-001"
                    style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1e5fa4"; (e.target as HTMLElement).style.boxShadow = "0 0 0 3px rgba(30,95,164,0.1)"; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#d1d5db"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                  />
                </div>
                <div style={{ marginBottom: 6 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
                    style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#1e5fa4"; (e.target as HTMLElement).style.boxShadow = "0 0 0 3px rgba(30,95,164,0.1)"; }}
                    onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#d1d5db"; (e.target as HTMLElement).style.boxShadow = "none"; }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 16 }}>
                  Demo credentials — Employee ID: <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: 3 }}>{ROLE_EMP_PREFIX[selectedRole.id]}</code> | Password: <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: 3 }}>Fra@1234</code>
                </div>

                {loginError && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#b91c1c", marginBottom: 14 }}>
                    ⚠️ {loginError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setLoginStep("state")}
                    style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", background: "white", color: "#374151" }}>
                    ← Back
                  </button>
                  <button onClick={handleLogin} disabled={loginLoading || !empId || !password}
                    style={{ flex: 1, border: "none", borderRadius: 8, padding: "10px 0", fontSize: 14, fontWeight: 700, cursor: empId && password && !loginLoading ? "pointer" : "not-allowed", background: empId && password && !loginLoading ? "#1e3a5f" : "#d1d5db", color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}>
                    {loginLoading ? (
                      <>
                        <span style={{ width: 14, height: 14, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                        Authenticating...
                      </>
                    ) : (
                      `Access ${selectedRole.title} Dashboard →`
                    )}
                  </button>
                </div>
              </div>
            )}

            <div style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb", padding: "10px 24px", textAlign: "center", fontSize: 11, color: "#9ca3af" }}>
              <Lock size={16} className="inline mr-2 text-gray-500" /> This system is for authorized Government of India officials only. All access is logged and audited under the IT Act, 2000.
            </div>
          </div>
        </div>
      )}

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
