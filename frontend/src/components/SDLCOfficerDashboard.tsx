/* ─── VANTARA — SDLC Field Officer Dashboard ─────────────── */
/* Role 1: Batch Execution Engine for Incomplete Records     */

import { useEffect, useState, useRef } from "react";
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

export default function SDLCOfficerDashboard({ onLogout, activeDistrict = "Khunti", activeState = "Jharkhand" }: SDLCOfficerProps) {
  const [data, setData] = useState<QueueResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showManifest, setShowManifest] = useState(false);
  const [manifestType, setManifestType] = useState<"survey" | "gps">("survey");
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-14 bg-[#1e3a5f] flex items-center justify-between px-5 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1e3a5f] font-bold text-sm">V</div>
          <div>
            <h1 className="text-sm font-bold text-white">SDLC Field Officer — Khunti Sub-Division</h1>
            <p className="text-[10px] text-blue-200">Batch Execution Engine • Incomplete Records</p>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs text-blue-200 hover:text-white border border-blue-300/30 px-3 py-1.5 rounded transition-colors">
          ← Switch Role
        </button>
      </header>

      {/* Stats Bar */}
      {data && (
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Queue Total</span>
            <span className="text-lg font-bold text-gray-900">{data.total.toLocaleString()}</span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-600">Missing Survey: <b className="text-gray-900">{data.stats.missing_survey.toLocaleString()}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-xs text-gray-600">Missing GPS: <b className="text-gray-900">{data.stats.missing_gps.toLocaleString()}</b></span>
          </div>
          <div className="flex-1" />
          <span className="text-xs text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-200">
            {selected.size} selected
          </span>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-2.5 flex items-center gap-3">
        <button
          onClick={() => openManifest("survey")}
          disabled={selected.size === 0}
          className="text-xs font-medium bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
        >
          📋 Generate Patwari Survey Batch ({selected.size})
        </button>
        <button
          onClick={() => openManifest("gps")}
          disabled={selected.size === 0}
          className="text-xs font-medium bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
        >
          📍 Generate Gram Sabha GPS Checklist ({selected.size})
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : !data || data.claims.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No incomplete records found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === data.claims.length && data.claims.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left px-4 py-3 font-semibold">Claim ID</th>
                <th className="text-left px-4 py-3 font-semibold">Applicant</th>
                <th className="text-left px-4 py-3 font-semibold">District</th>
                <th className="text-left px-4 py-3 font-semibold">Stage</th>
                <th className="text-left px-4 py-3 font-semibold">Missing Fields</th>
                <th className="text-right px-4 py-3 font-semibold">Days</th>
              </tr>
            </thead>
            <tbody>
              {data.claims.map((c, idx) => (
                <tr
                  key={c.claim_id}
                  className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                  } ${selected.has(c.claim_id) ? "!bg-blue-50 border-l-4 border-l-blue-500" : ""}`}
                  onClick={() => toggleSelect(c.claim_id)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(c.claim_id)}
                      onChange={() => toggleSelect(c.claim_id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-medium">{c.claim_id}</td>
                  <td className="px-4 py-3 text-gray-800">{c.applicant_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-800">{c.district}</div>
                    <div className="text-xs text-gray-400">{c.state}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                      {c.current_stage.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {c.missing_fields.map((f) => (
                        <span
                          key={f}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                            f.includes("Survey")
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-gray-500">
                    {c.days_in_current_stage > 0 ? `${c.days_in_current_stage}d` : "—"}
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
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-500">Page {data.page} of {data.total_pages}</span>
          <button
            disabled={page >= data.total_pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          >
            Next →
          </button>
        </div>
      )}

      {/* Manifest Modal */}
      {showManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl w-[800px] max-h-[85vh] flex flex-col border border-gray-200">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {manifestType === "survey" ? "📋 Patwari Survey Batch Manifest" : "📍 Gram Sabha GPS Verification Checklist"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedClaims.length} claims selected • Generated {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm"
                >
                  🖨️ Print / Save PDF
                </button>
                <button
                  onClick={() => setShowManifest(false)}
                  className="text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-5" ref={printRef}>
              <div className="header">
                <h1 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "4px" }}>
                  VANTARA — {manifestType === "survey"
                    ? "Revenue Department: Patwari Survey Batch Order"
                    : "Gram Sabha: GPS Coordinates Verification Checklist"
                  }
                </h1>
                <h2 style={{ fontSize: "13px", color: "#666", fontWeight: "normal" }}>
                  Generated: {new Date().toLocaleDateString("en-IN")} • {selectedClaims.length} Claims •
                  Under Forest Rights Act 2006, Rule {manifestType === "survey" ? "12(1)(c)" : "12(1)(d)"}
                </h2>
              </div>

              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-3 py-2 border border-gray-300 font-semibold">S.No.</th>
                    <th className="text-left px-3 py-2 border border-gray-300 font-semibold">Claim ID</th>
                    <th className="text-left px-3 py-2 border border-gray-300 font-semibold">Applicant Name</th>
                    <th className="text-left px-3 py-2 border border-gray-300 font-semibold">District</th>
                    <th className="text-left px-3 py-2 border border-gray-300 font-semibold">Area (ha)</th>
                    <th className="text-left px-3 py-2 border border-gray-300 font-semibold">Missing Field</th>
                    <th className="text-left px-3 py-2 border border-gray-300 font-semibold">
                      {manifestType === "survey" ? "Patwari Action" : "GPS Status"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClaims.map((c, i) => (
                    <tr key={c.claim_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 border border-gray-300">{i + 1}</td>
                      <td className="px-3 py-2 border border-gray-300 font-mono">{c.claim_id}</td>
                      <td className="px-3 py-2 border border-gray-300">{c.applicant_name}</td>
                      <td className="px-3 py-2 border border-gray-300">{c.district}, {c.state}</td>
                      <td className="px-3 py-2 border border-gray-300">{c.claimed_area_ha}</td>
                      <td className="px-3 py-2 border border-gray-300">{c.missing_fields.join(", ")}</td>
                      <td className="px-3 py-2 border border-gray-300 text-gray-400 italic">
                        {manifestType === "survey" ? "□ Verified  □ Pending" : "□ Captured  □ Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="meta" style={{ fontSize: "11px", color: "#666", marginTop: "16px" }}>
                <p>Authorized Signatory: _______________________ (SDLC Member Secretary)</p>
                <p style={{ marginTop: "8px" }}>Date: _______________________ Seal: _______________________</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
