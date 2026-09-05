/* ─── VANTARA — SDLC Field Officer Dashboard ─────────────── */
/* Enhanced UI: Batch Execution Engine for Incomplete Records  */

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ChevronDown, Download, FileText, Globe, Search, ClipboardList, BarChart, MapPin, CheckCircle, TriangleAlert, Printer } from "lucide-react";
import { fetchSDLCQueue } from "../api";

interface QueueClaim {
  claim_id: string;
  applicant_name: string;
  district: string;
  state: string;
  current_status: string;
  current_stage: string;
  filed_date: string;
  claimed_area_ha: number;
  recorded_area_ha: number;
  area_mismatch_pct: number;
  days_in_current_stage: number;
  missing_fields: string[];
  anomaly_types: string[];
}

interface QueueResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: { missing_survey: number; missing_gps: number };
  claims: QueueClaim[];
}

interface SDLCOfficerProps {
  onLogout: () => void;
  activeDistrict?: string;
  activeState?: string;
}

// State → default district / sub-division mapping
const STATE_META: Record<string, { district: string; subdivision: string }> = {
  Jharkhand: { district: "Khunti", subdivision: "Khunti Sub-Division" },
  Chhattisgarh: { district: "Bastar", subdivision: "Jagdalpur Sub-Division" },
  "Madhya Pradesh": { district: "Mandla", subdivision: "Mandla Sub-Division" },
  Maharashtra: { district: "Gadchiroli", subdivision: "Gadchiroli Sub-Division" },
  Odisha: { district: "Koraput", subdivision: "Koraput Sub-Division" },
  "West Bengal": { district: "Purulia", subdivision: "Manbazar Sub-Division" },
};

export default function SDLCOfficerDashboard({ onLogout, activeDistrict, activeState = "Jharkhand" }: SDLCOfficerProps) {
  const meta = STATE_META[activeState] ?? STATE_META["Jharkhand"];
  const district = activeDistrict ?? meta.district;
  const subdivision = meta.subdivision;

  const [data, setData] = useState<QueueResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showManifest, setShowManifest] = useState(false);
  const [manifestType, setManifestType] = useState<"survey" | "gps">("survey");
  const [activeTab, setActiveTab] = useState<"queue" | "analytics">("queue");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetchSDLCQueue({ type: "incomplete", page, page_size: 40 }).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [page]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!data) return;
    if (selected.size === data.claims.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.claims.map((c) => c.claim_id)));
    }
  };

  const selectedClaims = data?.claims.filter((c) => selected.has(c.claim_id)) || [];

  const openManifest = (type: "survey" | "gps") => {
    if (selected.size === 0) return;
    setManifestType(type);
    setShowManifest(true);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>VANTARA — Field Manifest</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 16px; margin-bottom: 4px; }
        h2 { font-size: 13px; color: #666; font-weight: normal; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f3f4f6; text-align: left; padding: 8px 10px; border: 1px solid #d1d5db; font-weight: 600; }
        td { padding: 8px 10px; border: 1px solid #d1d5db; }
        tr:nth-child(even) { background: #f9fafb; }
        .header { border-bottom: 2px solid #1e3a5f; padding-bottom: 12px; margin-bottom: 16px; }
        .meta { font-size: 11px; color: #666; margin-top: 16px; }
      </style></head><body>
      ${printRef.current.innerHTML}
      <script>window.print();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const urgentCount = data?.claims.filter(c => c.days_in_current_stage > 45).length ?? 0;
  const criticalCount = data?.claims.filter(c => c.days_in_current_stage > 60).length ?? 0;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Premium Header ── */}
      <header style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e5fa4 100%)", flexShrink: 0, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/vantara-logo.png" alt="V" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "contain", background: "white", padding: 3, border: "2px solid rgba(255,255,255,0.3)" }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>
                  SDLC Field Officer — {subdivision}
                </h1>
                <span style={{ fontSize: 10, background: "#22c55e", color: "white", padding: "2px 8px", borderRadius: 20, fontWeight: 600, letterSpacing: "0.05em" }}>ACTIVE</span>
              </div>
              <p style={{ fontSize: 11, color: "#93c5fd", margin: 0 }}>Batch Execution Engine • {activeState} • {district} District</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {criticalCount > 0 && (
              <div style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "4px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "vantara-blink 1s infinite" }} />
                <span style={{ fontSize: 11, color: "#fca5a5", fontWeight: 600 }}>{criticalCount} Critical (60+ days)</span>
              </div>
            )}
            <button onClick={onLogout} style={{ fontSize: 12, color: "#93c5fd", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>
              ← Switch Role
            </button>
          </div>
        </div>

        {/* Sub-nav tabs */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", padding: "0 20px" }}>
          {[
            { id: "queue", label: <span className="flex items-center"><ClipboardList size={14} className="mr-1" /> Incomplete Records Queue</span> },
            { id: "analytics", label: <span className="flex items-center"><BarChart size={14} className="mr-1" /> Batch Analytics</span> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              style={{ padding: "8px 16px", fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", background: "transparent", color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.6)", borderBottom: activeTab === tab.id ? "2px solid white" : "2px solid transparent", transition: "all 0.15s" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── KPI Strip ── */}
      {data && (
        <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "10px 20px", display: "flex", alignItems: "center", gap: 0 }}>
          {[
            { label: "Total Queue", value: data.total.toLocaleString(), color: "#1e3a5f", bg: "#eff6ff", border: "#bfdbfe" },
            { label: "Missing Survey No.", value: data.stats.missing_survey.toLocaleString(), color: "#b45309", bg: "#fffbeb", border: "#fcd34d" },
            { label: "Missing GPS Coords", value: data.stats.missing_gps.toLocaleString(), color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
            { label: "Urgent (45+ days)", value: urgentCount.toString(), color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
            { label: "Selected", value: selected.size.toString(), color: "#15803d", bg: "#f0fdf4", border: "#86efac" },
          ].map((kpi, i) => (
            <div key={kpi.label} style={{ display: "flex", alignItems: "center", flex: 1, borderRight: i < 4 ? "1px solid #e5e7eb" : "none" }}>
              <div style={{ padding: "0 20px", textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{kpi.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Action Bar ── */}
      <div style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => openManifest("survey")} disabled={selected.size === 0}
          style={{ fontSize: 12, fontWeight: 600, background: selected.size > 0 ? "linear-gradient(135deg, #d97706, #b45309)" : "#e5e7eb", color: selected.size > 0 ? "white" : "#9ca3af", border: "none", borderRadius: 8, padding: "8px 18px", cursor: selected.size > 0 ? "pointer" : "not-allowed", boxShadow: selected.size > 0 ? "0 2px 8px rgba(180,83,9,0.3)" : "none", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
          <ClipboardList size={16} className="inline mr-2" /> Generate Patwari Survey Batch
          {selected.size > 0 && <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "1px 8px", fontSize: 11 }}>{selected.size}</span>}
        </button>
        <button onClick={() => openManifest("gps")} disabled={selected.size === 0}
          style={{ fontSize: 12, fontWeight: 600, background: selected.size > 0 ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "#e5e7eb", color: selected.size > 0 ? "white" : "#9ca3af", border: "none", borderRadius: 8, padding: "8px 18px", cursor: selected.size > 0 ? "pointer" : "not-allowed", boxShadow: selected.size > 0 ? "0 2px 8px rgba(109,40,217,0.3)" : "none", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={16} className="inline mr-2" /> Gram Sabha GPS Checklist
          {selected.size > 0 && <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "1px 8px", fontSize: 11 }}>{selected.size}</span>}
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: "#6b7280" }}>Rule 12(1)(c) — SDLC must dispose within 60 days</div>
      </div>

      {/* ── Main Content ── */}
      {activeTab === "queue" ? (
        <div style={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <div style={{ padding: 16 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ height: 48, background: "#f3f4f6", borderRadius: 6, marginBottom: 6, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : !data || data.claims.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}><CheckCircle size={32} className="text-green-500" /></div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No incomplete records found</div>
              <div style={{ fontSize: 12 }}>All claims in {district} are up to date</div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr style={{ background: "#1e3a5f", color: "white" }}>
                  <th style={{ width: 44, padding: "10px 16px", textAlign: "center" }}>
                    <input type="checkbox" checked={selected.size === data.claims.length && data.claims.length > 0} onChange={toggleAll}
                      id="tour-sdlc-select-all" style={{ width: 14, height: 14, cursor: "pointer" }} />
                  </th>
                  {["Claim ID", "Applicant", "District", "Stage", "Missing Fields", "Days"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: h === "Days" ? "right" : "left", fontWeight: 600, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.claims.map((c, idx) => {
                  const isCritical = c.days_in_current_stage > 60;
                  const isUrgent = c.days_in_current_stage > 45 && !isCritical;
                  return (
                    <tr key={c.claim_id} onClick={() => toggleSelect(c.claim_id)}
                      style={{
                        background: selected.has(c.claim_id) ? "#eff6ff" : idx % 2 === 0 ? "white" : "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                        borderLeft: selected.has(c.claim_id) ? "4px solid #1e5fa4" : "4px solid transparent",
                        cursor: "pointer", transition: "background 0.1s"
                      }}>
                      <td style={{ padding: "10px 16px", textAlign: "center" }}>
                        <input type="checkbox" checked={selected.has(c.claim_id)} onChange={() => toggleSelect(c.claim_id)}
                          onClick={e => e.stopPropagation()} style={{ width: 14, height: 14 }} />
                      </td>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "#1e5fa4", fontWeight: 600 }}>{c.claim_id}</td>
                      <td style={{ padding: "10px 14px", color: "#111827", fontWeight: 500 }}>{c.applicant_name}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ color: "#111827", fontSize: 13 }}>{c.district}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.state}</div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", padding: "3px 8px", borderRadius: 20, fontWeight: 500 }}>
                          {c.current_stage.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {c.missing_fields.map(f => (
                            <span key={f} style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500,
                              background: f.includes("Survey") ? "#fffbeb" : "#f5f3ff",
                              color: f.includes("Survey") ? "#b45309" : "#7c3aed",
                              border: `1px solid ${f.includes("Survey") ? "#fcd34d" : "#c4b5fd"}`,
                            }}>{f}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        {c.days_in_current_stage > 0 ? (
                          <span style={{
                            fontFamily: "monospace", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                            background: isCritical ? "#fef2f2" : isUrgent ? "#fffbeb" : "#f9fafb",
                            color: isCritical ? "#dc2626" : isUrgent ? "#d97706" : "#6b7280",
                            border: `1px solid ${isCritical ? "#fca5a5" : isUrgent ? "#fcd34d" : "#e5e7eb"}`
                          }}>
                            {isCritical && <TriangleAlert size={14} className="inline text-yellow-500 mr-1" />}{c.days_in_current_stage}d
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* ── Analytics Tab ── */
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Missing field breakdown */}
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Missing Field Breakdown</div>
              {data && [
                { label: "Survey Number", value: data.stats.missing_survey, total: data.total, color: "#d97706", bg: "#fffbeb" },
                { label: "GPS Coordinates", value: data.stats.missing_gps, total: data.total, color: "#7c3aed", bg: "#f5f3ff" },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#374151" }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value} ({Math.round(item.value / item.total * 100)}%)</span>
                  </div>
                  <div style={{ height: 10, background: "#f3f4f6", borderRadius: 8, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${item.value / item.total * 100}%`, background: item.color, borderRadius: 8 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Urgency matrix */}
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Time-Based Urgency</div>
              {data && [
                { label: "Critical (60+ days)", count: criticalCount, color: "#dc2626", bg: "#fef2f2" },
                { label: "Urgent (45–60 days)", count: urgentCount, color: "#d97706", bg: "#fffbeb" },
                { label: "Normal (<45 days)", count: (data.total - urgentCount - criticalCount), color: "#15803d", bg: "#f0fdf4" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: item.bg, borderRadius: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>{item.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.count}</span>
                </div>
              ))}
            </div>

            {/* Compliance reference */}
            <div style={{ gridColumn: "1 / -1", background: "linear-gradient(135deg, #1e3a5f, #1e5fa4)", borderRadius: 12, padding: 20, color: "white" }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#93c5fd", marginBottom: 12 }}>FRA Rule 12 Compliance Reference — {district} Sub-Division, {activeState}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { rule: "Rule 12(1)(c)", text: "Survey/GPS data must be attached within 60 days", urgency: "SDLC Mandate" },
                  { rule: "Rule 12(2)", text: "SDLC must forward to DLC within 60 days of claim receipt", urgency: "Legal Limit" },
                  { rule: "Rule 13", text: "DLC may reject if SDLC fails to forward within time limit", urgency: "Risk" },
                ].map(r => (
                  <div key={r.rule} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: "#fde68a", marginBottom: 4, fontWeight: 700 }}>{r.rule}</div>
                    <div style={{ fontSize: 12, color: "#e5e7eb", lineHeight: 1.5 }}>{r.text}</div>
                    <div style={{ fontSize: 10, color: "#93c5fd", marginTop: 6, fontWeight: 600 }}>{r.urgency}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && activeTab === "queue" && (
        <div style={{ padding: "10px 20px", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", background: "white" }}>
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, border: "1px solid #d1d5db", background: "white", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.4 : 1 }}>
            ← Previous
          </button>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Page {data.page} of {data.total_pages} • {data.total.toLocaleString()} total records</span>
          <button disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)}
            style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, border: "1px solid #d1d5db", background: "white", cursor: page >= data.total_pages ? "not-allowed" : "pointer", opacity: page >= data.total_pages ? 0.4 : 1 }}>
            Next →
          </button>
        </div>
      )}

      {/* ── Manifest Modal ── */}
      {showManifest && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}>
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", width: 820, maxHeight: "88vh", display: "flex", flexDirection: "column", border: "1px solid #e5e7eb" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb", borderRadius: "14px 14px 0 0" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>
                  {manifestType === "survey" ? <span className="flex items-center text-lg"><ClipboardList size={20} className="mr-2" /> Patwari Survey Batch Manifest</span> : <span className="flex items-center text-lg"><MapPin size={20} className="mr-2" /> Gram Sabha GPS Verification Checklist</span>}
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
                  {selectedClaims.length} claims selected • {district}, {activeState} • Generated {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handlePrint} id="tour-btn-survey"
                  style={{ fontSize: 12, background: "#1e5fa4", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}>
                  <Printer size={16} className="inline mr-2" /> Print / Save PDF
                </button>
                <button onClick={() => setShowManifest(false)}
                  style={{ fontSize: 12, background: "white", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "#374151" }}>
                  Close
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 24 }} ref={printRef}>
              <div className="header">
                <h1 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
                  VANTARA — {manifestType === "survey" ? "Revenue Department: Patwari Survey Batch Order" : "Gram Sabha: GPS Coordinates Verification Checklist"}
                </h1>
                <h2 style={{ fontSize: "13px", color: "#666", fontWeight: "normal" }}>
                  Generated: {new Date().toLocaleDateString("en-IN")} • {selectedClaims.length} Claims •
                  Jurisdiction: {district}, {activeState} • Under FRA 2006, Rule {manifestType === "survey" ? "12(1)(c)" : "12(1)(d)"}
                </h2>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    {["S.No.", "Claim ID", "Applicant Name", "District", "Area (ha)", "Missing Field", manifestType === "survey" ? "Patwari Action" : "GPS Status"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", border: "1px solid #d1d5db", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedClaims.map((c, i) => (
                    <tr key={c.claim_id} style={{ background: i % 2 === 0 ? "white" : "#f9fafb" }}>
                      <td style={{ padding: "8px 10px", border: "1px solid #d1d5db" }}>{i + 1}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #d1d5db", fontFamily: "monospace" }}>{c.claim_id}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #d1d5db" }}>{c.applicant_name}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #d1d5db" }}>{c.district}, {c.state}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #d1d5db" }}>{c.claimed_area_ha}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #d1d5db" }}>{c.missing_fields.join(", ")}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #d1d5db", color: "#9ca3af", fontStyle: "italic" }}>
                        {manifestType === "survey" ? "□ Verified  □ Pending" : "□ Captured  □ Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="meta" style={{ fontSize: "11px", color: "#666", marginTop: "16px" }}>
                <p>Authorized Signatory: _______________________ (SDLC Member Secretary, {district})</p>
                <p style={{ marginTop: "8px" }}>Date: _______________________ Seal: _______________________</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
