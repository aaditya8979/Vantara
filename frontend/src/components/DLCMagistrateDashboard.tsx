/* ─── VANTARA — DLC Magistrate Dashboard ─────────────────── */
/* Role 2: Legal Enforcement Engine for Violations            */

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
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

export default function DLCMagistrateDashboard({ onLogout, activeDistrict = "Bastar", activeState = "Chhattisgarh" }: DLCMagistrateProps) {
  const [data, setData] = useState<ViolationResponse | null>(null);
  const [geojson, setGeojson] = useState<DistrictGeoJSON | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [showDirective, setShowDirective] = useState(false);
  const [directiveType, setDirectiveType] = useState<"rule12" | "cadastral">("rule12");
  const [directiveClaims, setDirectiveClaims] = useState<ViolationClaim[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDistrictGeoJSON().then(setGeojson);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDLCViolations({
      district: "Bastar",
      violation_type: filterType,
      page,
      page_size: 30,
    }).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [page, filterType]);

  const openDirective = (type: "rule12" | "cadastral", claims: ViolationClaim[]) => {
    setDirectiveType(type);
    setDirectiveClaims(claims);
    setShowDirective(true);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>VANTARA — Statutory Directive</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; padding: 32px; color: #111; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 18px; text-align: center; margin-bottom: 4px; text-transform: uppercase; }
        h2 { font-size: 14px; text-align: center; color: #444; margin-bottom: 20px; }
        .ref { font-size: 11px; color: #666; margin-bottom: 16px; }
        .body-text { font-size: 13px; line-height: 1.8; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin: 16px 0; }
        th { background: #f3f4f6; text-align: left; padding: 8px; border: 1px solid #ccc; font-weight: 600; }
        td { padding: 8px; border: 1px solid #ccc; }
        tr:nth-child(even) { background: #f9fafb; }
        .sig { margin-top: 40px; font-size: 12px; }
        .notice { background: #fef2f2; border: 1px solid #fca5a5; padding: 12px; border-radius: 4px; margin: 16px 0; font-size: 12px; color: #991b1b; }
      </style></head><body>
      ${printRef.current.innerHTML}
      <script>window.print();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  // Get statutory violations for bulk directive
  const statutoryClaims = data?.claims.filter((c) =>
    c.anomaly_types.includes("STATUTORY_VIOLATION")
  ) || [];
  const landClaims = data?.claims.filter((c) =>
    c.anomaly_types.includes("LAND_MISMATCH")
  ) || [];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-14 bg-[#1e3a5f] flex items-center justify-between px-5 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1e3a5f] font-bold text-sm">V</div>
          <div>
            <h1 className="text-sm font-bold text-white">District Magistrate — DLC Chairperson, Bastar</h1>
            <p className="text-[10px] text-blue-200">Legal Enforcement Engine • Statutory Violations & Land Conflicts</p>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs text-blue-200 hover:text-white border border-blue-300/30 px-3 py-1.5 rounded transition-colors">
          ← Switch Role
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Map */}
        <div className="w-[45%] border-r border-gray-200 relative">
          <MapContainer
            center={[19.1, 81.95]}
            zoom={8}
            className="h-full w-full"
            style={{ background: "#f3f4f6" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {geojson?.features
              .filter((f) => f.properties.state === "Chhattisgarh")
              .map((feature) => {
                const p = feature.properties;
                const coords = feature.geometry.coordinates;
                const isBastar = p.district === "Bastar";
                return (
                  <CircleMarker
                    key={p.district}
                    center={[coords[1], coords[0]]}
                    radius={isBastar ? 18 : 10}
                    pathOptions={{
                      color: isBastar ? "#1e3a5f" : "#9ca3af",
                      fillColor: isBastar
                        ? p.statutory_violations > 0 ? "#b91c1c" : "#15803d"
                        : "#d1d5db",
                      fillOpacity: isBastar ? 0.8 : 0.4,
                      weight: isBastar ? 3 : 1,
                    }}
                  >
                    <Tooltip>
                      <div className="text-xs">
                        <div className="font-semibold text-gray-900">{p.district}</div>
                        <div className="text-gray-500">{p.state}</div>
                        <div className="mt-1">
                          Violations: <span className="text-red-700 font-semibold">{p.statutory_violations}</span>
                          {" • "}Settlement: {p.settlement_pct}%
                        </div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                );
              })}
          </MapContainer>

          {/* Map overlay stats */}
          {data && (
            <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg p-4 border border-gray-200 shadow-md">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Bastar District</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-400">Statutory Violations</div>
                  <div className="text-xl font-bold text-red-700">{data.stats.statutory_violations}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Land Mismatches</div>
                  <div className="text-xl font-bold text-amber-700">{data.stats.land_mismatches}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Priority Action Queue */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Action Buttons */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex gap-1">
              <button
                onClick={() => { setFilterType(undefined); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  !filterType ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({data ? data.total : "..."})
              </button>
              <button
                onClick={() => { setFilterType("STATUTORY_VIOLATION"); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === "STATUTORY_VIOLATION" ? "bg-red-700 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                ⚖️ Statutory
              </button>
              <button
                onClick={() => { setFilterType("LAND_MISMATCH"); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === "LAND_MISMATCH" ? "bg-amber-700 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                📐 Land Mismatch
              </button>
            </div>
            <div className="flex-1" />
            <button
              onClick={() => openDirective("rule12", statutoryClaims)}
              disabled={statutoryClaims.length === 0}
              className="text-xs font-medium bg-red-700 hover:bg-red-800 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
            >
              📜 Generate Rule 12(2) Directive
            </button>
            <button
              onClick={() => openDirective("cadastral", landClaims)}
              disabled={landClaims.length === 0}
              className="text-xs font-medium bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
            >
              📐 Trigger Joint Cadastral Inspection
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-semibold">Claim ID</th>
                    <th className="text-left px-4 py-3 font-semibold">Applicant</th>
                    <th className="text-left px-4 py-3 font-semibold">Stage</th>
                    <th className="text-right px-4 py-3 font-semibold">Days Over</th>
                    <th className="text-right px-4 py-3 font-semibold">Area Gap</th>
                    <th className="text-left px-4 py-3 font-semibold">Root Cause</th>
                    <th className="text-center px-4 py-3 font-semibold">Severity</th>
                    <th className="text-center px-4 py-3 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.claims.map((c, idx) => (
                    <tr key={c.claim_id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>
                      <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{c.claim_id}</td>
                      <td className="px-4 py-3 text-gray-800">{c.applicant_name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                          {c.current_stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.days_in_current_stage > 60 ? (
                          <span className="font-mono text-xs text-red-700 font-bold">
                            +{c.days_in_current_stage - 60}d
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.area_mismatch_pct > 10 ? (
                          <span className="text-xs text-amber-700 font-bold">{c.area_mismatch_pct}%</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.land_mismatch_root_cause ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border block truncate max-w-[180px] ${
                            c.land_mismatch_root_cause.includes("Mining") || c.land_mismatch_root_cause.includes("Eco-Sensitive") || c.land_mismatch_root_cause.includes("Protected") || c.land_mismatch_root_cause.includes("Wildlife") || c.land_mismatch_root_cause.includes("Reserved Forest")
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`} title={c.land_mismatch_root_cause}>
                            {c.land_mismatch_root_cause.includes("Mining") || c.land_mismatch_root_cause.includes("Eco-Sensitive") || c.land_mismatch_root_cause.includes("Protected") || c.land_mismatch_root_cause.includes("Wildlife") || c.land_mismatch_root_cause.includes("Reserved Forest")
                              ? "🔴 Structural"
                              : "🟡 Administrative"}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                          c.severity === "CRITICAL"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : c.severity === "HIGH"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          {c.anomaly_types.includes("STATUTORY_VIOLATION") && (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-600" title="Statutory" />
                          )}
                          {c.anomaly_types.includes("LAND_MISMATCH") && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" title="Land" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 shadow-sm">← Previous</button>
              <span className="text-xs text-gray-500">Page {data.page} of {data.total_pages}</span>
              <button disabled={page >= data.total_pages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 shadow-sm">Next →</button>
            </div>
          )}
        </div>
      </div>

      {/* Directive Modal */}
      {showDirective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl w-[850px] max-h-[90vh] flex flex-col border border-gray-200">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {directiveType === "rule12"
                    ? "📜 Statutory Directive — FRA Rule 12(2)"
                    : "📐 Joint Cadastral Inspection Order"
                  }
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {directiveClaims.length} claims • District: Bastar
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
                  🖨️ Print / Save PDF
                </button>
                <button onClick={() => setShowDirective(false)} className="text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg">
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6" ref={printRef}>
              {directiveType === "rule12" ? (
                <div>
                  <h1 style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center", marginBottom: "4px", textTransform: "uppercase" }}>
                    Office of the District Magistrate & DLC Chairperson
                  </h1>
                  <h2 style={{ fontSize: "14px", textAlign: "center", color: "#444", marginBottom: "20px" }}>
                    District Bastar, Chhattisgarh — Statutory Directive Under FRA Rules 2008
                  </h2>

                  <div className="ref" style={{ fontSize: "11px", color: "#666", marginBottom: "12px" }}>
                    <p>Ref. No.: VANTARA/DLC/BASTAR/{new Date().getFullYear()}/SD-{String(Math.floor(Math.random() * 900) + 100)}</p>
                    <p>Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>

                  <div className="body-text" style={{ fontSize: "13px", lineHeight: "1.8", marginBottom: "16px" }}>
                    <p><b>To:</b> The Sub-Divisional Level Committee (SDLC), Bastar Sub-Division</p>
                    <p style={{ marginTop: "8px" }}>
                      <b>Subject:</b> Direction under Rule 12(2) of the Scheduled Tribes and Other Traditional Forest Dwellers
                      (Recognition of Forest Rights) Rules, 2008 — regarding {directiveClaims.length} claims pending beyond the
                      statutory 60-day processing limit at the SDLC stage.
                    </p>
                    <p style={{ marginTop: "12px" }}>
                      Whereas the District Level Committee (DLC), Bastar has examined the processing records of forest rights claims
                      under Section 6 of the Forest Rights Act, 2006 and has found that the following {directiveClaims.length} claims
                      have been pending at the SDLC stage beyond the mandatory 60-day limit prescribed under Rule 12(2):
                    </p>
                  </div>

                  <div className="notice" style={{ background: "#fef2f2", border: "1px solid #fca5a5", padding: "12px", borderRadius: "4px", margin: "16px 0", fontSize: "12px", color: "#991b1b" }}>
                    <b>COMPLIANCE MANDATE:</b> The SDLC is hereby directed to complete verification and forward its recommendations
                    on ALL listed claims to the DLC within <b>15 calendar days</b> of receipt of this directive, failing which the matter
                    will be escalated to the State Level Monitoring Committee under Rule 12(4).
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", margin: "16px 0" }}>
                    <thead>
                      <tr style={{ background: "#f3f4f6" }}>
                        <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>S.No.</th>
                        <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>Claim ID</th>
                        <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>Applicant</th>
                        <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>Days at SDLC</th>
                        <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>Days Over Limit</th>
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
                  {directiveClaims.length > 25 && (
                    <p style={{ fontSize: "11px", color: "#666", fontStyle: "italic" }}>
                      ... and {directiveClaims.length - 25} additional claims (see full annexure)
                    </p>
                  )}

                  <div className="sig" style={{ marginTop: "40px", fontSize: "12px" }}>
                    <p><b>Sd/-</b></p>
                    <p>District Magistrate & DLC Chairperson</p>
                    <p>District Bastar, Chhattisgarh</p>
                    <p style={{ marginTop: "16px" }}>Copy to: (1) State Tribal Welfare Department (2) District Tribal Affairs Officer (3) SDLC Member Secretary</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center", marginBottom: "4px", textTransform: "uppercase" }}>
                    Joint Cadastral Inspection Order
                  </h1>
                  <h2 style={{ fontSize: "14px", textAlign: "center", color: "#444", marginBottom: "20px" }}>
                    Revenue & Forest Department — District Bastar
                  </h2>

                  <div className="body-text" style={{ fontSize: "13px", lineHeight: "1.8", marginBottom: "16px" }}>
                    <p>
                      The following {directiveClaims.length} FRA claims show a land area discrepancy exceeding 10% between
                      the applicant's claimed area and the Revenue/Forest department's recorded area. A joint inspection by
                      the Patwari (Revenue) and Range Officer (Forest) is hereby ordered under FRA Rules 2008.
                    </p>
                  </div>

                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", margin: "16px 0" }}>
                    <thead>
                      <tr style={{ background: "#f3f4f6" }}>
                        <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>S.No.</th>
                        <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>Claim ID</th>
                        <th style={{ textAlign: "left", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>Applicant</th>
                        <th style={{ textAlign: "right", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>Claimed (ha)</th>
                        <th style={{ textAlign: "right", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>Recorded (ha)</th>
                        <th style={{ textAlign: "right", padding: "8px", border: "1px solid #ccc", fontWeight: 600 }}>Discrepancy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {directiveClaims.slice(0, 25).map((c, i) => (
                        <tr key={c.claim_id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{i + 1}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc", fontFamily: "monospace" }}>{c.claim_id}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc" }}>{c.applicant_name}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "right" }}>{c.claimed_area_ha}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "right" }}>{c.recorded_area_ha}</td>
                          <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "right", color: "#b45309", fontWeight: "bold" }}>{c.area_mismatch_pct}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="sig" style={{ marginTop: "40px", fontSize: "12px" }}>
                    <p><b>Sd/-</b></p>
                    <p>District Magistrate & DLC Chairperson, Bastar</p>
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
