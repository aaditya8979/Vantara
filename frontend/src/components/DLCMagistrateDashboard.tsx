/* ─── VANTARA — DLC Magistrate Dashboard ─────────────────── */
/* Enhanced: Legal Enforcement Engine • All-state Leaflet Map  */

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ChevronDown, Download, FileText, Globe, Search, Scale, Ruler, ScrollText, Printer, CircleAlert } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchDLCViolations, fetchDistrictGeoJSON } from "../api";
import type { DistrictGeoJSON } from "../types";

interface ViolationClaim {
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
  severity: string;
  land_mismatch_root_cause: string | null;
  anomaly_flags: { type: string; severity: string; description: string }[];
  anomaly_types: string[];
}

interface ViolationResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: { statutory_violations: number; land_mismatches: number };
  claims: ViolationClaim[];
}

interface DLCMagistrateProps {
  onLogout: () => void;
  activeDistrict?: string;
  activeState?: string;
}

// State metadata: map center, default district, IAS officer title
const STATE_META: Record<string, { center: [number, number]; zoom: number; district: string; stateCode: string }> = {
  Jharkhand:        { center: [23.6, 85.3],  zoom: 7,  district: "Khunti",      stateCode: "JH" },
  Chhattisgarh:     { center: [20.5, 81.7],  zoom: 7,  district: "Bastar",      stateCode: "CG" },
  "Madhya Pradesh": { center: [22.9, 78.7],  zoom: 7,  district: "Mandla",      stateCode: "MP" },
  Maharashtra:      { center: [19.7, 79.3],  zoom: 7,  district: "Gadchiroli",  stateCode: "MH" },
  Odisha:           { center: [19.8, 83.0],  zoom: 7,  district: "Koraput",     stateCode: "OD" },
  "West Bengal":    { center: [23.0, 86.4],  zoom: 7,  district: "Purulia",     stateCode: "WB" },
};

export default function DLCMagistrateDashboard({ onLogout, activeDistrict, activeState = "Chhattisgarh" }: DLCMagistrateProps) {
  const meta = STATE_META[activeState] ?? STATE_META["Chhattisgarh"];
  const district = activeDistrict ?? meta.district;

  const [data, setData] = useState<ViolationResponse | null>(null);
  const [geojson, setGeojson] = useState<DistrictGeoJSON | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [showDirective, setShowDirective] = useState(false);
  const [directiveType, setDirectiveType] = useState<"rule12" | "cadastral">("rule12");
  const [directiveClaims, setDirectiveClaims] = useState<ViolationClaim[]>([]);
  const [mapView, setMapView] = useState<"state" | "all">("state");
  const printRef = useRef<HTMLDivElement>(null);
  const refNo = useRef(`VANTARA/DLC/${meta.stateCode}/${new Date().getFullYear()}/SD-${String(Math.floor(Math.random() * 900) + 100)}`);

  useEffect(() => { fetchDistrictGeoJSON().then(setGeojson); }, []);

  useEffect(() => {
    setLoading(true);
    fetchDLCViolations({ district: district, violation_type: filterType, page, page_size: 30 })
      .then((d) => { setData(d); setLoading(false); });
  }, [page, filterType, district]);

  const openDirective = (type: "rule12" | "cadastral", claims: ViolationClaim[]) => {
    setDirectiveType(type); setDirectiveClaims(claims); setShowDirective(true);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write(`<html><head><title>VANTARA — Statutory Directive</title>
      <style>body{font-family:'Inter',Arial,sans-serif;padding:32px;color:#111;max-width:800px;margin:0 auto}
      h1{font-size:18px;text-align:center;margin-bottom:4px;text-transform:uppercase}
      h2{font-size:14px;text-align:center;color:#444;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;font-size:11px;margin:16px 0}
      th{background:#f3f4f6;text-align:left;padding:8px;border:1px solid #ccc;font-weight:600}
      td{padding:8px;border:1px solid #ccc}tr:nth-child(even){background:#f9fafb}
      .notice{background:#fef2f2;border:1px solid #fca5a5;padding:12px;border-radius:4px;margin:16px 0;font-size:12px;color:#991b1b}
      </style></head><body>${printRef.current.innerHTML}<script>window.print();</script></body></html>`);
    w.document.close();
  };

  const statutoryClaims = data?.claims.filter(c => c.anomaly_types.includes("STATUTORY_VIOLATION")) || [];
  const landClaims = data?.claims.filter(c => c.anomaly_types.includes("LAND_MISMATCH")) || [];

  // Determine which features to show on map
  const mapFeatures = geojson?.features.filter(f =>
    mapView === "all" ? true : f.properties.state === activeState
  ) ?? [];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Premium Header ── */}
      <header style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 60%, #dc2626 100%)", flexShrink: 0, boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/vantara-logo.png" alt="V" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "contain", background: "white", padding: 3, border: "2px solid rgba(255,255,255,0.3)" }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>
                  District Magistrate — DLC Chairperson, {district}
                </h1>
                <span style={{ fontSize: 10, background: "#fbbf24", color: "#7c2d12", padding: "2px 8px", borderRadius: 20, fontWeight: 700, letterSpacing: "0.05em" }}>ENFORCEMENT</span>
              </div>
              <p style={{ fontSize: 11, color: "#fca5a5", margin: 0 }}>Legal Enforcement Engine • Statutory Violations & Land Conflicts • {activeState}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {data && data.stats.statutory_violations > 0 && (
              <div style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "4px 12px", fontSize: 11, color: "white", fontWeight: 600 }}>
                <Scale size={16} className="inline mr-1" /> {data.stats.statutory_violations} Rule 12(2) Breaches
              </div>
            )}
            <button id="tour-switch-role" onClick={onLogout} style={{ fontSize: 12, color: "#fca5a5", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>
              ← Switch Role
            </button>
          </div>
        </div>

        {/* KPI strip inside header */}
        {data && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", padding: "8px 20px", display: "flex", gap: 24 }}>
            {[
              { label: "Total Flagged", value: data.total, color: "white" },
              { label: "Statutory Violations", value: data.stats.statutory_violations, color: "#fde68a" },
              { label: "Land Mismatches", value: data.stats.land_mismatches, color: "#fed7aa" },
              { label: "Rule 12(2) Breaches (60+ days)", value: data.claims.filter(c => c.days_in_current_stage > 60).length, color: "#fca5a5" },
            ].map(kpi => (
              <div key={kpi.label} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: kpi.color }}>{kpi.value}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{kpi.label}</span>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* ── Main Split Layout ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT: Leaflet Map ── */}
        <div style={{ width: "44%", position: "relative", borderRight: "1px solid #e5e7eb" }}>
          {/* Map controls */}
          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { id: "state" as const, label: `${activeState} Only` },
              { id: "all" as const, label: "All States" },
            ].map(v => (
              <button key={v.id} onClick={() => setMapView(v.id)}
                style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6, border: "1px solid #d1d5db", cursor: "pointer", background: mapView === v.id ? "#1e3a5f" : "white", color: mapView === v.id ? "white" : "#374151", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                {v.label}
              </button>
            ))}
          </div>

          <MapContainer
            key={`${activeState}-${mapView}`}
            center={mapView === "all" ? [22.5, 82.0] : meta.center}
            zoom={mapView === "all" ? 5 : meta.zoom}
            style={{ height: "100%", width: "100%", background: "#f0f4f8" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {mapFeatures.map((feature) => {
              const p = feature.properties;
              const coords = feature.geometry.coordinates;
              const isActive = p.district === district;
              const hasViolations = (p.statutory_violations ?? 0) > 0;
              const settlementPct = p.settlement_pct ?? 50;

              // Color coding: red = violations, amber = low settlement, green = healthy
              const fillColor = hasViolations
                ? "#dc2626"
                : settlementPct < 40
                ? "#d97706"
                : "#16a34a";

              return (
                <CircleMarker
                  key={`${p.state}-${p.district}`}
                  center={[coords[1], coords[0]]}
                  radius={isActive ? 16 : 8}
                  pathOptions={{
                    color: isActive ? "#1e3a5f" : "white",
                    fillColor,
                    fillOpacity: isActive ? 0.9 : 0.75,
                    weight: isActive ? 3 : 1.5,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <div style={{ fontSize: 12, minWidth: 140 }}>
                      <div style={{ fontWeight: 700, color: "#111", marginBottom: 4 }}>{p.district}</div>
                      <div style={{ color: "#6b7280", fontSize: 11 }}>{p.state}</div>
                      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                        <div>Violations: <span style={{ color: "#dc2626", fontWeight: 700 }}>{p.statutory_violations ?? 0}</span></div>
                        <div>Settlement: <span style={{ color: settlementPct > 60 ? "#15803d" : "#d97706", fontWeight: 700 }}>{settlementPct}%</span></div>
                        <div>Land Mismatches: <span style={{ fontWeight: 600 }}>{p.land_mismatches ?? 0}</span></div>
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Map legend */}
          <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 1000, background: "white", borderRadius: 8, padding: "10px 14px", border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: 11 }}>
            <div style={{ fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>District Status</div>
            {[
              { color: "#dc2626", label: "Statutory Violations" },
              { color: "#d97706", label: "Low Settlement (<40%)" },
              { color: "#16a34a", label: "Healthy (>40%)" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
                <span style={{ color: "#6b7280" }}>{item.label}</span>
              </div>
            ))}
            {data && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #e5e7eb" }}>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>{district}</div>
                <div style={{ color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center" }}><Scale size={16} className="mr-1" /> {data.stats.statutory_violations} violations</div>
                <div style={{ color: "#d97706", fontWeight: 600, display: "flex", alignItems: "center" }}><Ruler size={16} className="mr-1" /> {data.stats.land_mismatches} land mismatches</div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Priority Action Queue ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Action toolbar */}
          <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: undefined, label: `All (${data?.total ?? "..."})`, activeColor: "#1e3a5f" },
              { id: "STATUTORY_VIOLATION", label: <span className="flex items-center"><Scale size={14} className="mr-1" /> Statutory</span>, activeColor: "#b91c1c" },
              { id: "LAND_MISMATCH", label: <span className="flex items-center"><Ruler size={14} className="mr-1" /> Land Mismatch</span>, activeColor: "#b45309" },
            ].map(f => (
              <button key={String(f.id)} onClick={() => { setFilterType(f.id); setPage(1); }}
                id={f.id === "STATUTORY_VIOLATION" ? "tour-dlc-filter-stat" : undefined}
                style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: filterType === f.id ? f.activeColor : "#f3f4f6", color: filterType === f.id ? "white" : "#374151", transition: "all 0.15s" }}>
                {f.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={() => openDirective("rule12", statutoryClaims)} disabled={statutoryClaims.length === 0}
              id="tour-btn-rule12"
              style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, border: "none", cursor: statutoryClaims.length > 0 ? "pointer" : "not-allowed", background: statutoryClaims.length > 0 ? "linear-gradient(135deg, #b91c1c, #7f1d1d)" : "#e5e7eb", color: statutoryClaims.length > 0 ? "white" : "#9ca3af", boxShadow: statutoryClaims.length > 0 ? "0 2px 8px rgba(185,28,28,0.35)" : "none", transition: "all 0.2s" }}>
              <ScrollText size={16} className="inline mr-2" /> Issue Rule 12(2) Directive ({statutoryClaims.length})
            </button>
            <button onClick={() => openDirective("cadastral", landClaims)} disabled={landClaims.length === 0}
              style={{ fontSize: 12, fontWeight: 600, padding: "7px 14px", borderRadius: 8, border: "none", cursor: landClaims.length > 0 ? "pointer" : "not-allowed", background: landClaims.length > 0 ? "linear-gradient(135deg, #d97706, #b45309)" : "#e5e7eb", color: landClaims.length > 0 ? "white" : "#9ca3af", transition: "all 0.2s" }}>
              <Ruler size={16} className="inline mr-2" /> Cadastral Inspection ({landClaims.length})
            </button>
          </div>

          {/* Table */}
          <div id="tour-dlc-summary" style={{ flex: 1, overflow: "auto" }}>
            {loading ? (
              <div style={{ padding: 16 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ height: 48, background: "#f3f4f6", borderRadius: 6, marginBottom: 6 }} />
                ))}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr style={{ background: "#1e3a5f", color: "white" }}>
                    {["Claim ID", "Applicant", "Stage", "Days Over", "Area Gap", "Root Cause", "Severity", "Type"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: h === "Days Over" || h === "Area Gap" ? "right" : "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.claims.map((c, idx) => {
                    const isCritical = c.severity === "CRITICAL";
                    const isHigh = c.severity === "HIGH";
                    return (
                      <tr key={c.claim_id} style={{ background: idx % 2 === 0 ? "white" : "#f9fafb", borderBottom: "1px solid #e5e7eb", borderLeft: `4px solid ${isCritical ? "#dc2626" : isHigh ? "#d97706" : "#e5e7eb"}`, transition: "background 0.1s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#fef2f2"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? "white" : "#f9fafb"}>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 12, color: "#1e5fa4", fontWeight: 600 }}>{c.claim_id}</td>
                        <td style={{ padding: "10px 12px", color: "#111827", fontWeight: 500, fontSize: 13 }}>{c.applicant_name}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", padding: "3px 8px", borderRadius: 20, fontWeight: 500 }}>
                            {c.current_stage}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>
                          {c.days_in_current_stage > 60 ? (
                            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#dc2626", fontWeight: 700 }}>+{c.days_in_current_stage - 60}d</span>
                          ) : <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>
                          {c.area_mismatch_pct > 10 ? (
                            <span style={{ fontSize: 12, color: "#d97706", fontWeight: 700 }}>{c.area_mismatch_pct}%</span>
                          ) : <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 12px", maxWidth: 160 }}>
                          {c.land_mismatch_root_cause ? (
                            <span style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500, display: "block",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              background: /Mining|Eco-Sensitive|Protected|Wildlife|Reserved Forest/i.test(c.land_mismatch_root_cause) ? "#fef2f2" : "#fffbeb",
                              color: /Mining|Eco-Sensitive|Protected|Wildlife|Reserved Forest/i.test(c.land_mismatch_root_cause) ? "#b91c1c" : "#b45309",
                              border: `1px solid ${/Mining|Eco-Sensitive|Protected|Wildlife|Reserved Forest/i.test(c.land_mismatch_root_cause) ? "#fca5a5" : "#fcd34d"}`,
                            }} title={c.land_mismatch_root_cause}>
                              {/Mining|Eco-Sensitive|Protected|Wildlife|Reserved Forest/i.test(c.land_mismatch_root_cause) ? <span className="flex items-center"><CircleAlert size={14} className="mr-1 text-red-600" /> Structural</span> : <span className="flex items-center"><CircleAlert size={14} className="mr-1 text-yellow-500" /> Administrative</span>}
                            </span>
                          ) : <span style={{ color: "#d1d5db" }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "left" }}>
                          <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 600, border: "1px solid", background: isCritical ? "#fef2f2" : isHigh ? "#fffbeb" : "#f3f4f6", color: isCritical ? "#dc2626" : isHigh ? "#d97706" : "#6b7280", borderColor: isCritical ? "#fca5a5" : isHigh ? "#fcd34d" : "#e5e7eb" }}>
                            {c.severity}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {c.anomaly_types.includes("STATUTORY_VIOLATION") && (
                              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#dc2626", display: "inline-block" }} title="Statutory Violation" />
                            )}
                            {c.anomaly_types.includes("LAND_MISMATCH") && (
                              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#d97706", display: "inline-block" }} title="Land Mismatch" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div style={{ padding: "10px 16px", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", background: "white" }}>
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, border: "1px solid #d1d5db", background: "white", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.4 : 1 }}>
                ← Previous
              </button>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Page {data.page} of {data.total_pages}</span>
              <button disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)}
                style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, border: "1px solid #d1d5db", background: "white", cursor: page >= data.total_pages ? "not-allowed" : "pointer", opacity: page >= data.total_pages ? 0.4 : 1 }}>
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Directive Modal ── */}
      {showDirective && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}>
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", width: 860, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fef2f2", borderRadius: "14px 14px 0 0" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#7f1d1d" }}>
                  {directiveType === "rule12" ? <span className="flex items-center text-lg"><ScrollText size={20} className="mr-2" /> Statutory Directive — FRA Rule 12(2)</span> : <span className="flex items-center text-lg"><Ruler size={20} className="mr-2" /> Joint Cadastral Inspection Order</span>}
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
                  {directiveClaims.length} claims • {district}, {activeState} • Ref: {refNo.current}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handlePrint} style={{ fontSize: 12, background: "#b91c1c", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}>
                  <Printer size={16} className="inline mr-2" /> Print / Save PDF
                </button>
                <button onClick={() => setShowDirective(false)} style={{ fontSize: 12, background: "white", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "#374151" }}>
                  Close
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 28 }} ref={printRef}>
              {directiveType === "rule12" ? (
                <div>
                  <h1 style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center", marginBottom: "4px", textTransform: "uppercase" }}>
                    Office of the District Magistrate & DLC Chairperson
                  </h1>
                  <h2 style={{ fontSize: "14px", textAlign: "center", color: "#444", marginBottom: "20px" }}>
                    District {district}, {activeState} — Statutory Directive Under FRA Rules 2008
                  </h2>
                  <div style={{ fontSize: "11px", color: "#666", marginBottom: "12px" }}>
                    <p>Ref. No.: {refNo.current}</p>
                    <p>Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div style={{ fontSize: "13px", lineHeight: "1.8", marginBottom: "16px" }}>
                    <p><b>To:</b> The Sub-Divisional Level Committee (SDLC), {district} Sub-Division</p>
                    <p style={{ marginTop: "8px" }}><b>Subject:</b> Direction under Rule 12(2) of the Forest Rights Rules, 2008 — regarding {directiveClaims.length} claims pending beyond the statutory 60-day processing limit at the SDLC stage.</p>
                    <p style={{ marginTop: "12px" }}>Whereas the District Level Committee (DLC), {district} has examined the processing records of forest rights claims under Section 6 of the Forest Rights Act, 2006 and has found that the following {directiveClaims.length} claims have been pending at the SDLC stage beyond the mandatory 60-day limit:</p>
                  </div>
                  <div className="notice" style={{ background: "#fef2f2", border: "1px solid #fca5a5", padding: "12px", borderRadius: "4px", margin: "16px 0", fontSize: "12px", color: "#991b1b" }}>
                    <b>COMPLIANCE MANDATE:</b> The SDLC is hereby directed to complete verification and forward its recommendations on ALL listed claims to the DLC within <b>15 calendar days</b> of receipt of this directive, failing which the matter will be escalated to the SLMC under Rule 12(4).
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", margin: "16px 0" }}>
                    <thead>
                      <tr style={{ background: "#f3f4f6" }}>
                        {["S.No.", "Claim ID", "Applicant", "Days at SDLC", "Days Over Limit"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {directiveClaims.slice(0, 25).map((c, i) => (
                        <tr key={c.claim_id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{i + 1}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc", fontFamily: "monospace" }}>{c.claim_id}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{c.applicant_name}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{c.days_in_current_stage}d</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc", color: "#991b1b", fontWeight: "bold" }}>+{Math.max(0, c.days_in_current_stage - 60)}d</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {directiveClaims.length > 25 && <p style={{ fontSize: "11px", color: "#666", fontStyle: "italic" }}>... and {directiveClaims.length - 25} additional claims (see full annexure)</p>}
                  <div style={{ marginTop: "40px", fontSize: "12px" }}>
                    <p><b>Sd/-</b></p>
                    <p>District Magistrate & DLC Chairperson</p>
                    <p>District {district}, {activeState}</p>
                    <p style={{ marginTop: "16px" }}>Copy to: (1) State Tribal Welfare Department (2) District Tribal Affairs Officer (3) SDLC Member Secretary</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center", marginBottom: "4px", textTransform: "uppercase" }}>Joint Cadastral Inspection Order</h1>
                  <h2 style={{ fontSize: "14px", textAlign: "center", color: "#444", marginBottom: "20px" }}>Revenue & Forest Department — District {district}, {activeState}</h2>
                  <div style={{ fontSize: "13px", lineHeight: "1.8", marginBottom: "16px" }}>
                    <p>The following {directiveClaims.length} FRA claims show a land area discrepancy exceeding 10% between the applicant's claimed area and the Revenue/Forest department's recorded area. A joint inspection by the Patwari (Revenue) and Range Officer (Forest) is hereby ordered under FRA Rules 2008.</p>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", margin: "16px 0" }}>
                    <thead>
                      <tr style={{ background: "#f3f4f6" }}>
                        {["S.No.", "Claim ID", "Applicant", "Claimed (ha)", "Recorded (ha)", "Discrepancy"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {directiveClaims.slice(0, 25).map((c, i) => (
                        <tr key={c.claim_id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{i + 1}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc", fontFamily: "monospace" }}>{c.claim_id}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{c.applicant_name}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{c.claimed_area_ha}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{c.recorded_area_ha}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc", color: "#b45309", fontWeight: "bold" }}>{c.area_mismatch_pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: "40px", fontSize: "12px" }}>
                    <p><b>Sd/-</b></p>
                    <p>District Magistrate & DLC Chairperson, {district}</p>
                    <p style={{ marginTop: "16px" }}>Copy to: (1) District Revenue Officer (2) Divisional Forest Officer (3) SDLC Member Secretary</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
