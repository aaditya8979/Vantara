/* ─── VANTARA — Claim Table (Light Theme / NIC Standard) ─── */

import { useEffect, useState } from "react";
import { fetchClaims } from "../api";
import type { ClaimListItem, ClaimsResponse } from "../types";

interface ClaimTableProps {
  statusFilter: string | null;
  districtFilter: string | null;
  stateFilter: string | null;
  anomalyFilter: string | null;
  onClaimSelect: (claimId: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  GRAM_SABHA_REVIEW: "Gram Sabha",
  SDLC_VERIFICATION: "SDLC Verification",
  DLC_APPROVAL: "DLC Approval",
  TITLE_ISSUED: "Title Issued",
  REJECTED: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "bg-gray-100 text-gray-700",
  GRAM_SABHA_REVIEW: "bg-blue-100 text-blue-800",
  SDLC_VERIFICATION: "bg-amber-100 text-amber-800",
  DLC_APPROVAL: "bg-purple-100 text-purple-800",
  TITLE_ISSUED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function ClaimTable({
  statusFilter,
  districtFilter,
  stateFilter,
  anomalyFilter,
  onClaimSelect,
}: ClaimTableProps) {
  const [data, setData] = useState<ClaimsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, districtFilter, stateFilter, anomalyFilter]);

  useEffect(() => {
    setLoading(true);
    fetchClaims({
      status: statusFilter || undefined,
      district: districtFilter || undefined,
      state: stateFilter || undefined,
      anomaly_type: anomalyFilter || undefined,
      page,
      page_size: 30,
    }).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [statusFilter, districtFilter, stateFilter, anomalyFilter, page]);

  const activeFilters = [
    statusFilter && `Status: ${STATUS_LABELS[statusFilter] || statusFilter}`,
    districtFilter && `District: ${districtFilter}`,
    stateFilter && `State: ${stateFilter}`,
    anomalyFilter && `Anomaly: ${anomalyFilter.replace("_", " ")}`,
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Filter Bar */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 flex-wrap bg-gray-50">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
          Claims
        </span>
        {data && (
          <span className="text-xs text-gray-400">
            ({data.total.toLocaleString()} results)
          </span>
        )}
        {activeFilters.map((f) => (
          <span
            key={f}
            className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 font-medium"
          >
            {f}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : !data || data.claims.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No claims match the current filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-semibold">Claim ID</th>
                <th className="text-left px-4 py-3 font-semibold">Applicant</th>
                <th className="text-left px-4 py-3 font-semibold">District</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Days</th>
                <th className="text-right px-4 py-3 font-semibold">Area (ha)</th>
                <th className="text-center px-4 py-3 font-semibold">Flags</th>
              </tr>
            </thead>
            <tbody>
              {data.claims.map((c: ClaimListItem, idx: number) => (
                <tr
                  key={c.claim_id}
                  onClick={() => onClaimSelect(c.claim_id)}
                  className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-blue-700 font-medium">
                      {c.claim_id}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{c.applicant_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-800">{c.district}</div>
                    <div className="text-xs text-gray-400">{c.state}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        STATUS_STYLES[c.current_status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_LABELS[c.current_status] || c.current_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-mono text-xs font-medium ${
                        c.days_in_current_stage > 180
                          ? "text-red-700"
                          : c.days_in_current_stage > 60
                          ? "text-amber-700"
                          : "text-gray-500"
                      }`}
                    >
                      {c.days_in_current_stage > 0
                        ? `${c.days_in_current_stage}d`
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-gray-600 text-xs">
                      {c.claimed_area_ha}
                    </span>
                    {c.area_mismatch_pct > 10 && (
                      <span className="text-red-700 text-xs font-medium ml-1">
                        ({c.area_mismatch_pct}% off)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {c.anomaly_count > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        {c.anomaly_types.includes("STATUTORY_VIOLATION") && (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600" title="Statutory Violation" />
                        )}
                        {c.anomaly_types.includes("LAND_MISMATCH") && (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" title="Land Mismatch" />
                        )}
                        {c.anomaly_types.includes("INCOMPLETE_RECORD") && (
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" title="Incomplete" />
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {data.page} of {data.total_pages}
          </span>
          <button
            disabled={page >= data.total_pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
