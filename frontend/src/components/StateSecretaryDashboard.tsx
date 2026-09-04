/* ─── VANTARA — State Tribal Secretary Dashboard ─────────── */
/* Role 3: Capacity & Conflict Engine                         */

import { useEffect, useState } from "react";
import { fetchStateMatrix } from "../api";

interface DistrictCapacity {
  avg_monthly_clearance: number;
  months_to_clear_at_current_rate: number;
  required_rate_6mo: number;
  required_rate_12mo: number;
  current_sittings_per_month: number;
  required_sittings_6mo: number;
}

interface MatrixDistrict {
  district: string;
  state: string;
  total_claims: number;
  pending: number;
  approved: number;
  rejected: number;
  settlement_pct: number;
  at_stage1: number;
  at_stage2: number;
  at_stage3: number;
  avg_stage2_days: number;
  statutory_violations: number;
  land_mismatches: number;
  land_mismatch_pct: number;
  anomaly_class: string;
  anomaly_score: number;
  bottleneck_stage: string;
  capacity: DistrictCapacity;
}

interface MatrixResponse {
  districts: MatrixDistrict[];
  totals: {
    total_claims: number;
    total_pending: number;
    total_approved: number;
    settlement_pct: number;
    statutory_violations: number;
    systemic_districts: number;
    district_count: number;
  };
}

interface StateSecretaryProps {
  onLogout: () => void;
}

export default function StateSecretaryDashboard({ onLogout }: StateSecretaryProps) {
  const [data, setData] = useState<MatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [targetMonths, setTargetMonths] = useState(6);
  const [stateFilter, setStateFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    fetchStateMatrix(stateFilter).then((d) => {
      setData(d);
      setLoading(false);
      if (d.districts.length > 0 && !selectedDistrict) {
        // Auto-select worst district
        const worst = d.districts.find((dd: MatrixDistrict) => dd.anomaly_class === "SYSTEMIC");
        if (worst) setSelectedDistrict(worst.district);
      }
    });
  }, [stateFilter]);

  const selectedData = data?.districts.find((d) => d.district === selectedDistrict);

  // Clearance calculator
  const calcRequired = (pending: number, months: number) => {
    const rate = Math.ceil(pending / months);
    const baseSittings = 2;
    const claimsPerSitting = 15; // Estimated
    const requiredSittings = Math.ceil(rate / claimsPerSitting);
    const additionalSittings = Math.max(0, requiredSittings - baseSittings);
    return { rate, requiredSittings, additionalSittings };
  };

  const states = data ? [...new Set(data.districts.map((d) => d.state))] : [];

  if (loading || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading state matrix...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="h-14 bg-[#1e3a5f] flex items-center justify-between px-5 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1e3a5f] font-bold text-sm">V</div>
          <div>
            <h1 className="text-sm font-bold text-white">State Tribal Secretary — Government of Jharkhand</h1>
            <p className="text-[10px] text-blue-200">Capacity & Conflict Engine • Resource Allocation</p>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs text-blue-200 hover:text-white border border-blue-300/30 px-3 py-1.5 rounded transition-colors">
          ← Switch Role
        </button>
      </header>

      {/* Summary Bar */}
      <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-6">
        <div>
          <span className="text-xs text-gray-400 uppercase font-semibold">Total Claims</span>
          <div className="text-lg font-bold text-gray-900">{data.totals.total_claims.toLocaleString()}</div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <span className="text-xs text-gray-400 uppercase font-semibold">Pending</span>
          <div className="text-lg font-bold text-amber-700">{data.totals.total_pending.toLocaleString()}</div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <span className="text-xs text-gray-400 uppercase font-semibold">Settlement</span>
          <div className={`text-lg font-bold ${data.totals.settlement_pct < 50 ? "text-red-700" : "text-green-700"}`}>
            {data.totals.settlement_pct}%
          </div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <span className="text-xs text-gray-400 uppercase font-semibold">Violations</span>
          <div className="text-lg font-bold text-red-700">{data.totals.statutory_violations.toLocaleString()}</div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <span className="text-xs text-gray-400 uppercase font-semibold">Systemic</span>
          <div className="text-lg font-bold text-red-700">{data.totals.systemic_districts} districts</div>
        </div>
        <div className="flex-1" />
        <select
          value={stateFilter || ""}
          onChange={(e) => { setStateFilter(e.target.value || undefined); setSelectedDistrict(null); }}
          className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="">All States ({data.totals.district_count} districts)</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: District Leaderboard */}
        <div className="w-[55%] border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
              District Performance Matrix — Ranked by Anomaly Score
            </span>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-3 py-2.5 font-semibold">District</th>
                  <th className="text-center px-3 py-2.5 font-semibold">Class</th>
                  <th className="text-right px-3 py-2.5 font-semibold">Pending</th>
                  <th className="text-right px-3 py-2.5 font-semibold">Settled</th>
                  <th className="text-right px-3 py-2.5 font-semibold">SDLC Avg</th>
                  <th className="text-right px-3 py-2.5 font-semibold">Violations</th>
                  <th className="text-right px-3 py-2.5 font-semibold">Months to Clear</th>
                </tr>
              </thead>
              <tbody>
                {data.districts.map((d, idx) => (
                  <tr
                    key={d.district}
                    onClick={() => setSelectedDistrict(d.district)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                    } ${selectedDistrict === d.district ? "!bg-blue-50 border-l-4 border-l-blue-500" : "hover:bg-blue-50/50"}`}
                  >
                    <td className="px-3 py-2.5">
                      <div className="text-gray-900 font-medium">{d.district}</div>
                      <div className="text-xs text-gray-400">{d.state}</div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                        d.anomaly_class === "SYSTEMIC"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : d.anomaly_class === "INDIVIDUAL"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }`}>
                        {d.anomaly_class}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-800">{d.pending}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`font-bold ${
                        d.settlement_pct < 40 ? "text-red-700" : d.settlement_pct < 70 ? "text-amber-700" : "text-green-700"
                      }`}>
                        {d.settlement_pct}%
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`font-mono text-xs font-medium ${d.avg_stage2_days > 300 ? "text-red-700" : d.avg_stage2_days > 60 ? "text-amber-700" : "text-gray-500"}`}>
                        {d.avg_stage2_days}d
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-red-700 font-semibold">{d.statutory_violations}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`font-mono text-xs font-bold ${d.capacity.months_to_clear_at_current_rate > 24 ? "text-red-700" : "text-gray-600"}`}>
                        {d.capacity.months_to_clear_at_current_rate > 100 ? "99+" : d.capacity.months_to_clear_at_current_rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: SDLC Clearance Calculator */}
        <div className="flex-1 flex flex-col overflow-auto custom-scrollbar bg-white">
          {selectedData ? (
            <div className="p-5 space-y-5">
              {/* District Header */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900">{selectedData.district}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    selectedData.anomaly_class === "SYSTEMIC"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : selectedData.anomaly_class === "INDIVIDUAL"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-green-100 text-green-800 border-green-200"
                  }`}>
                    {selectedData.anomaly_class}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{selectedData.state}</p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="text-xs text-gray-400">Total</div>
                    <div className="text-base font-bold text-gray-900">{selectedData.total_claims}</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="text-xs text-gray-400">Pending</div>
                    <div className="text-base font-bold text-amber-700">{selectedData.pending}</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="text-xs text-gray-400">Settlement</div>
                    <div className={`text-base font-bold ${selectedData.settlement_pct < 40 ? "text-red-700" : "text-green-700"}`}>
                      {selectedData.settlement_pct}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Pipeline Breakdown */}
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Pipeline Breakdown</div>
                <div className="space-y-2">
                  {[
                    { label: "Gram Sabha (Stage 1)", value: selectedData.at_stage1, color: "bg-blue-500" },
                    { label: "SDLC Verification (Stage 2)", value: selectedData.at_stage2, color: "bg-amber-500" },
                    { label: "DLC Approval (Stage 3)", value: selectedData.at_stage3, color: "bg-purple-500" },
                  ].map((stage) => {
                    const pct = selectedData.pending > 0 ? (stage.value / selectedData.pending) * 100 : 0;
                    return (
                      <div key={stage.label} className="flex items-center gap-3">
                        <div className="w-36 text-xs text-gray-600">{stage.label}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div className={`h-full ${stage.color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="w-16 text-right text-xs font-semibold text-gray-800">{stage.value} ({pct.toFixed(0)}%)</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clearance Calculator */}
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <h4 className="text-sm font-bold text-[#1e3a5f] mb-3 uppercase tracking-wider">
                  Mandate Special SDLC Sittings
                </h4>

                <div className="mb-4">
                  <label className="block text-xs text-gray-600 font-medium mb-1.5">
                    Target Backlog Clearance (Months)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={3}
                      max={24}
                      value={targetMonths}
                      onChange={(e) => setTargetMonths(Number(e.target.value))}
                      className="flex-1 accent-blue-600"
                    />
                    <span className="text-lg font-bold text-[#1e3a5f] w-20 text-center bg-white border border-blue-200 rounded-lg py-1">
                      {targetMonths} mo
                    </span>
                  </div>
                </div>

                {(() => {
                  const calc = calcRequired(selectedData.pending, targetMonths);
                  return (
                    <div className="space-y-4">
                      {/* Big Metric */}
                      <div className="bg-white rounded-lg p-5 border border-blue-200 text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Required Processing Rate</div>
                        <div className="text-4xl font-bold text-[#1e3a5f]">
                          {calc.rate} <span className="text-lg text-gray-500 font-normal">Claims/Month</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                          <div className="text-xs text-gray-500">Current Rate</div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedData.capacity.avg_monthly_clearance}/mo
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                          <div className="text-xs text-gray-500">Current Sittings</div>
                          <div className="text-lg font-bold text-gray-900">
                            {selectedData.capacity.current_sittings_per_month}/mo
                          </div>
                        </div>
                      </div>

                      {/* Action Mandate */}
                      <div className={`rounded-lg p-4 border ${
                        calc.additionalSittings > 0
                          ? "bg-red-50 border-red-200"
                          : "bg-green-50 border-green-200"
                      }`}>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-600">
                          Recommended Action
                        </div>
                        {calc.additionalSittings > 0 ? (
                          <div>
                            <p className="text-sm text-red-800 font-bold">
                              Mandate {calc.additionalSittings} additional SDLC sittings per month
                            </p>
                            <p className="text-xs text-red-700 mt-1">
                              Total required: {calc.requiredSittings} sittings/month (currently {selectedData.capacity.current_sittings_per_month}).
                              At {selectedData.pending} pending claims and {targetMonths}-month target,
                              the SDLC must process {calc.rate} claims/month — a {Math.round(calc.rate / Math.max(1, selectedData.capacity.avg_monthly_clearance) * 100 - 100)}% increase over current throughput.
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-green-800 font-bold">
                            Current capacity is sufficient. No additional sittings needed.
                          </p>
                        )}
                      </div>

                      {/* At-a-glance */}
                      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p><b>At current rate:</b> {selectedData.capacity.months_to_clear_at_current_rate > 100 ? "99+" : selectedData.capacity.months_to_clear_at_current_rate} months to clear backlog</p>
                        <p><b>Bottleneck:</b> {selectedData.bottleneck_stage} stage • Avg SDLC processing: {selectedData.avg_stage2_days} days</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a district from the leaderboard
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
