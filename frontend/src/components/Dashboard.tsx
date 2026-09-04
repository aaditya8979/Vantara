/* ─── VANTARA — Dashboard (Light Theme / NIC Standard) ────── */

import { useEffect, useState } from "react";
import { fetchDashboardSummary, fetchStates } from "../api";
import type { DashboardSummary, StateSummary } from "../types";

interface DashboardProps {
  selectedDistrict: string | null;
  selectedState: string | null;
  onStatusFilter: (status: string) => void;
  onAnomalyFilter: (type: string) => void;
}

function StatCard({
  label,
  value,
  color = "text-gray-900",
  sub,
  onClick,
}: {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-lg p-4 text-left transition-all duration-200 cursor-pointer shadow-sm"
    >
      <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </button>
  );
}

export default function Dashboard({
  selectedDistrict,
  selectedState,
  onStatusFilter,
  onAnomalyFilter,
}: DashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [states, setStates] = useState<StateSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboardSummary(
        selectedDistrict || undefined,
        selectedState || undefined
      ),
      fetchStates(),
    ]).then(([s, st]) => {
      setSummary(s);
      setStates(st);
      setLoading(false);
    });
  }, [selectedDistrict, selectedState]);

  if (loading || !summary) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const filterLabel = selectedDistrict
    ? selectedDistrict
    : selectedState
    ? selectedState
    : "All 30 Districts";

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full custom-scrollbar">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          Command Center
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Monitoring: <span className="text-blue-700 font-medium">{filterLabel}</span>
        </p>
      </div>

      {/* Pipeline Cards */}
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Claim Pipeline
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label="Total Filed"
            value={summary.total_claims}
            color="text-gray-900"
          />
          <StatCard
            label="Settlement Rate"
            value={`${summary.settlement_pct}%`}
            color={
              summary.settlement_pct < 40
                ? "text-red-700"
                : summary.settlement_pct < 70
                ? "text-amber-700"
                : "text-green-700"
            }
          />
          <StatCard
            label="Gram Sabha"
            value={summary.pipeline.gram_sabha_review}
            color="text-blue-700"
            sub="Stage 1"
            onClick={() => onStatusFilter("GRAM_SABHA_REVIEW")}
          />
          <StatCard
            label="SDLC Verification"
            value={summary.pipeline.sdlc_verification}
            color="text-amber-700"
            sub="Stage 2 — 60 day limit"
            onClick={() => onStatusFilter("SDLC_VERIFICATION")}
          />
          <StatCard
            label="DLC Approval"
            value={summary.pipeline.dlc_approval}
            color="text-purple-700"
            sub="Stage 3 — Final"
            onClick={() => onStatusFilter("DLC_APPROVAL")}
          />
          <StatCard
            label="Title Issued"
            value={summary.pipeline.title_issued}
            color="text-green-700"
            sub="Completed ✓"
            onClick={() => onStatusFilter("TITLE_ISSUED")}
          />
        </div>
      </div>

      {/* Anomaly Cards */}
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Anomaly Flags
        </div>
        <div className="grid grid-cols-1 gap-2.5">
          <button
            onClick={() => onAnomalyFilter("STATUTORY_VIOLATION")}
            className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-4 text-left transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-red-700 uppercase tracking-wider font-semibold">
                  Statutory Violations
                </div>
                <div className="text-2xl font-bold text-red-700 mt-1">
                  {summary.anomalies.statutory_violations.toLocaleString()}
                </div>
              </div>
              <span className="text-2xl">⚖️</span>
            </div>
            <div className="text-xs text-red-600 mt-1">
              Claims exceeding FRA Rule 12 — 60 day limit
            </div>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onAnomalyFilter("LAND_MISMATCH")}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg p-3 text-left transition-all cursor-pointer"
            >
              <div className="text-xs text-amber-700 uppercase tracking-wider font-semibold">
                Land Mismatches
              </div>
              <div className="text-xl font-bold text-amber-700 mt-1">
                {summary.anomalies.land_mismatches.toLocaleString()}
              </div>
              <div className="text-xs text-amber-600 mt-0.5">
                &gt;10% area discrepancy
              </div>
            </button>
            <button
              onClick={() => onAnomalyFilter("INCOMPLETE_RECORD")}
              className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-3 text-left transition-all cursor-pointer"
            >
              <div className="text-xs text-purple-700 uppercase tracking-wider font-semibold">
                Incomplete Records
              </div>
              <div className="text-xl font-bold text-purple-700 mt-1">
                {summary.anomalies.incomplete_records.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600 mt-0.5">
                Missing fields
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* State Leaderboard */}
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
          State Leaderboard
        </div>
        <div className="space-y-1.5">
          {states.map((s, i) => (
            <div
              key={s.state}
              className="flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-200 rounded-lg px-3 py-2.5 transition-colors cursor-default shadow-sm"
            >
              <span className="text-xs text-gray-400 w-4 font-mono font-semibold">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 font-medium truncate">{s.state}</div>
                <div className="text-xs text-gray-400">
                  {s.total_claims.toLocaleString()} claims • {s.districts}{" "}
                  districts
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`text-sm font-bold ${
                    s.settlement_pct < 40
                      ? "text-red-700"
                      : s.settlement_pct < 70
                      ? "text-amber-700"
                      : "text-green-700"
                  }`}
                >
                  {s.settlement_pct}%
                </span>
                {s.statutory_violations > 0 && (
                  <span className="text-xs text-red-600">
                    {s.statutory_violations} violations
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
