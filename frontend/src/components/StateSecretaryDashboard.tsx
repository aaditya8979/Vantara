/* ─── VANTARA — State Tribal Secretary Dashboard ─────────── */
/* Enhanced: Capacity & Conflict Engine • All-state Coverage   */

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
  activeState?: string;
}

// State-specific metadata for the Secretary portal
const SEC_META: Record<string, { title: string; abbr: string; accentColor: string }> = {
  Jharkhand:        { title: "Government of Jharkhand",     abbr: "JH", accentColor: "#065f46" },
  Chhattisgarh:     { title: "Government of Chhattisgarh", abbr: "CG", accentColor: "#1e3a5f" },
  "Madhya Pradesh": { title: "Government of Madhya Pradesh", abbr: "MP", accentColor: "#4c1d95" },
  Maharashtra:      { title: "Government of Maharashtra",   abbr: "MH", accentColor: "#7c2d12" },
  Odisha:           { title: "Government of Odisha",        abbr: "OD", accentColor: "#164e63" },
  "West Bengal":    { title: "Government of West Bengal",   abbr: "WB", accentColor: "#312e81" },
};

export default function StateSecretaryDashboard({ onLogout, activeState = "Jharkhand" }: StateSecretaryProps) {
  const meta = SEC_META[activeState] ?? SEC_META["Jharkhand"];

  const [data, setData] = useState<MatrixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [targetMonths, setTargetMonths] = useState(6);
  const [stateFilter, setStateFilter] = useState<string | undefined>(activeState);
  const [sortBy, setSortBy] = useState<"anomaly" | "pending" | "settlement" | "violations">("anomaly");

  useEffect(() => {
    setLoading(true);
    fetchStateMatrix(stateFilter).then((d) => {
      setData(d);
      setLoading(false);
      if (d.districts.length > 0 && !selectedDistrict) {
        const worst = d.districts.find((dd: MatrixDistrict) => dd.anomaly_class === "SYSTEMIC");
        if (worst) setSelectedDistrict(worst.district);
      }
    });
  }, [stateFilter]);

  const selectedData = data?.districts.find((d) => d.district === selectedDistrict);

  const calcRequired = (pending: number, months: number) => {
    const rate = Math.ceil(pending / months);
    const claimsPerSitting = 15;
    const requiredSittings = Math.ceil(rate / claimsPerSitting);
    const additionalSittings = Math.max(0, requiredSittings - (selectedData?.capacity.current_sittings_per_month ?? 2));
    return { rate, requiredSittings, additionalSittings };
  };

  const states = data ? [...new Set(data.districts.map((d) => d.state))] : [];

  const sortedDistricts = data ? [...data.districts].sort((a, b) => {
    switch (sortBy) {
      case "pending": return b.pending - a.pending;
      case "settlement": return a.settlement_pct - b.settlement_pct;
      case "violations": return b.statutory_violations - a.statutory_violations;
      default: return b.anomaly_score - a.anomaly_score;
    }
  }) : [];

  if (loading || !data) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #e5e7eb", borderTop: "3px solid #1e3a5f", animation: "spin 1s linear infinite" }} />
          <div style={{ fontSize: 13, color: "#6b7280" }}>Loading State Capacity Matrix...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const systemicCount = data.districts.filter(d => d.anomaly_class === "SYSTEMIC").length;
  const criticalViolations = data.totals.statutory_violations;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Premium Forest-Green Header ── */}
      <header style={{ background: `linear-gradient(135deg, ${meta.accentColor} 0%, #1e3a5f 100%)`, flexShrink: 0, boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>
        <div style={{ padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/vantara-logo.png" alt="V" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "contain", background: "white", padding: 3, border: "2px solid rgba(255,255,255,0.3)" }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>
                  State Tribal Secretary — {meta.title}
                </h1>
                <span style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", color: "white", padding: "2px 8px", borderRadius: 20, fontWeight: 600, border: "1px solid rgba(255,255,255,0.3)" }}>{meta.abbr}</span>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>Capacity & Conflict Engine • Resource Allocation • All Districts</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {systemicCount > 0 && (
              <div style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.5)", borderRadius: 8, padding: "4px 12px", fontSize: 11, color: "#fca5a5", fontWeight: 600 }}>
                🔴 {systemicCount} SYSTEMIC districts
              </div>
            )}
            <button id="tour-switch-role" onClick={onLogout} style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>
              ← Switch Role
            </button>
          </div>
        </div>

        {/* State-wide summary KPIs */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", padding: "10px 20px", display: "flex", gap: 0 }}>
          {[
            { label: "Total Claims", value: data.totals.total_claims.toLocaleString(), color: "white" },
            { label: "Pending", value: data.totals.total_pending.toLocaleString(), color: "#fde68a" },
            { label: "Settlement", value: `${data.totals.settlement_pct}%`, color: data.totals.settlement_pct < 50 ? "#fca5a5" : "#86efac" },
            { label: "Violations", value: criticalViolations.toLocaleString(), color: "#fca5a5" },
            { label: "Districts", value: data.totals.district_count.toString(), color: "rgba(255,255,255,0.8)" },
            { label: "Systemic", value: data.totals.systemic_districts.toString(), color: "#fca5a5" },
          ].map((kpi, i) => (
            <div key={kpi.label} style={{ flex: 1, textAlign: "center", padding: "0 12px", borderRight: i < 5 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>{kpi.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "8px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <select value={stateFilter || ""} onChange={(e) => { setStateFilter(e.target.value || undefined); setSelectedDistrict(null); }}
          style={{ fontSize: 12, border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 12px", color: "#374151", background: "white", cursor: "pointer" }}>
          <option value="">All States ({data.totals.district_count} districts)</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ height: 20, width: 1, background: "#e5e7eb" }} />
        <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>Sort by:</span>
        {[
          { id: "anomaly" as const, label: "Anomaly Score" },
          { id: "pending" as const, label: "Pending" },
          { id: "settlement" as const, label: "Settlement %" },
          { id: "violations" as const, label: "Violations" },
        ].map(s => (
          <button key={s.id} onClick={() => setSortBy(s.id)}
            style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, border: "1px solid", cursor: "pointer", background: sortBy === s.id ? "#1e3a5f" : "white", color: sortBy === s.id ? "white" : "#374151", borderColor: sortBy === s.id ? "#1e3a5f" : "#d1d5db", transition: "all 0.15s" }}>
            {s.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: "#9ca3af" }}>Click a district row to see clearance calculator →</div>
      </div>

      {/* ── Main Split ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* LEFT: District Performance Matrix */}
        <div style={{ width: "55%", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>District Performance Matrix</span>
            <div style={{ display: "flex", gap: 8, fontSize: 11 }}>
              <span style={{ background: "#fef2f2", color: "#b91c1c", padding: "2px 8px", borderRadius: 20, fontWeight: 600, border: "1px solid #fca5a5" }}>● SYSTEMIC</span>
              <span style={{ background: "#fffbeb", color: "#b45309", padding: "2px 8px", borderRadius: 20, fontWeight: 600, border: "1px solid #fcd34d" }}>● INDIVIDUAL</span>
              <span style={{ background: "#f0fdf4", color: "#15803d", padding: "2px 8px", borderRadius: 20, fontWeight: 600, border: "1px solid #86efac" }}>● NORMAL</span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            <table id="tour-sec-matrix" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr style={{ background: "#1e3a5f", color: "white" }}>
                  {["District / State", "Class", "Pending", "Settled", "Avg Days", "Violations", "Months"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: h === "Pending" || h === "Settled" || h === "Avg Days" || h === "Violations" || h === "Months" ? "right" : "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedDistricts.map((d, idx) => {
                  const isSystemic = d.anomaly_class === "SYSTEMIC";
                  const isSelected = selectedDistrict === d.district;
                  return (
                    <tr key={d.district} onClick={() => setSelectedDistrict(d.district)}
                      id={isSystemic ? "tour-sec-worst" : undefined}
                      style={{
                        background: isSelected ? "#eff6ff" : isSystemic ? "#fff8f8" : idx % 2 === 0 ? "white" : "#f9fafb",
                        borderBottom: "1px solid #e5e7eb",
                        borderLeft: isSelected ? "4px solid #1e5fa4" : isSystemic ? "4px solid #dc2626" : "4px solid transparent",
                        cursor: "pointer", transition: "background 0.1s"
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#f0f7ff"; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = isSystemic ? "#fff8f8" : idx % 2 === 0 ? "white" : "#f9fafb"; }}
                    >
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{d.district}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{d.state}</div>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 700, border: "1px solid", background: isSystemic ? "#fef2f2" : d.anomaly_class === "INDIVIDUAL" ? "#fffbeb" : "#f0fdf4", color: isSystemic ? "#dc2626" : d.anomaly_class === "INDIVIDUAL" ? "#d97706" : "#15803d", borderColor: isSystemic ? "#fca5a5" : d.anomaly_class === "INDIVIDUAL" ? "#fcd34d" : "#86efac" }}>
                          {d.anomaly_class}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#374151" }}>{d.pending.toLocaleString()}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <span style={{ fontWeight: 700, color: d.settlement_pct < 40 ? "#dc2626" : d.settlement_pct < 70 ? "#d97706" : "#15803d" }}>
                          {d.settlement_pct}%
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: d.avg_stage2_days > 300 ? "#dc2626" : d.avg_stage2_days > 60 ? "#d97706" : "#6b7280", fontWeight: 600 }}>
                          {d.avg_stage2_days}d
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", color: "#dc2626", fontWeight: 700 }}>{d.statutory_violations}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, color: d.capacity.months_to_clear_at_current_rate > 24 ? "#dc2626" : "#374151" }}>
                          {d.capacity.months_to_clear_at_current_rate > 100 ? "99+" : d.capacity.months_to_clear_at_current_rate}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: SDLC Clearance Calculator + District Detail */}
        <div style={{ flex: 1, overflow: "auto", background: "white" }}>
          {selectedData ? (
            <div style={{ padding: 20 }}>
              {/* District header card */}
              <div style={{ background: "linear-gradient(135deg, #1e3a5f, #1e5fa4)", borderRadius: 12, padding: "16px 20px", marginBottom: 16, color: "white" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "white" }}>{selectedData.district}</h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "3px 0 0" }}>{selectedData.state} • Bottleneck: {selectedData.bottleneck_stage} stage</p>
                  </div>
                  <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)", background: selectedData.anomaly_class === "SYSTEMIC" ? "#fef2f2" : selectedData.anomaly_class === "INDIVIDUAL" ? "#fffbeb" : "#f0fdf4", color: selectedData.anomaly_class === "SYSTEMIC" ? "#dc2626" : selectedData.anomaly_class === "INDIVIDUAL" ? "#d97706" : "#15803d" }}>
                    {selectedData.anomaly_class}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { label: "Total", value: selectedData.total_claims, color: "white" },
                    { label: "Pending", value: selectedData.pending, color: "#fde68a" },
                    { label: "Approved", value: selectedData.approved, color: "#86efac" },
                    { label: "Settlement", value: `${selectedData.settlement_pct}%`, color: selectedData.settlement_pct < 40 ? "#fca5a5" : "#86efac" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", textAlign: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>{s.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pipeline breakdown */}
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Pipeline Breakdown</div>
                {[
                  { label: "Gram Sabha (Stage 1)", value: selectedData.at_stage1, color: "#3b82f6" },
                  { label: "SDLC Verification (Stage 2)", value: selectedData.at_stage2, color: "#f59e0b" },
                  { label: "DLC Approval (Stage 3)", value: selectedData.at_stage3, color: "#8b5cf6" },
                ].map(stage => {
                  const pct = selectedData.pending > 0 ? (stage.value / selectedData.pending) * 100 : 0;
                  return (
                    <div key={stage.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 160, fontSize: 12, color: "#374151", flexShrink: 0 }}>{stage.label}</div>
                      <div style={{ flex: 1, height: 10, background: "#e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: stage.color, borderRadius: 8, transition: "width 0.5s ease" }} />
                      </div>
                      <div style={{ width: 70, textAlign: "right", fontSize: 12, fontWeight: 700, color: "#374151" }}>{stage.value} ({pct.toFixed(0)}%)</div>
                    </div>
                  );
                })}
              </div>

              {/* Anomaly detail */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[
                  { label: "Statutory Violations", value: selectedData.statutory_violations, color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", icon: "⚖️" },
                  { label: "Land Mismatches", value: selectedData.land_mismatches, color: "#d97706", bg: "#fffbeb", border: "#fcd34d", icon: "📐" },
                  { label: "Avg SDLC Days", value: `${selectedData.avg_stage2_days}d`, color: selectedData.avg_stage2_days > 300 ? "#dc2626" : "#374151", bg: "#f9fafb", border: "#e5e7eb", icon: "⏱️" },
                  { label: "Anomaly Score", value: selectedData.anomaly_score.toFixed(1), color: selectedData.anomaly_score > 7 ? "#dc2626" : "#374151", bg: "#f9fafb", border: "#e5e7eb", icon: "🧠" },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{item.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clearance Calculator */}
              <div id="tour-sec-mandate" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>
                  📋 Mandate Special SDLC Sittings — {selectedData.district}
                </h4>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>Target Clearance Timeline</label>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#1e3a5f" }}>{targetMonths} months</span>
                  </div>
                  <input type="range" min={3} max={24} value={targetMonths} onChange={(e) => setTargetMonths(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#1e5fa4" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                    <span>3 months (aggressive)</span>
                    <span>24 months (conservative)</span>
                  </div>
                </div>

                {(() => {
                  const calc = calcRequired(selectedData.pending, targetMonths);
                  return (
                    <>
                      {/* Big metric */}
                      <div style={{ background: "white", borderRadius: 10, padding: 16, textAlign: "center", border: "1px solid #bfdbfe", marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Required Processing Rate</div>
                        <div style={{ fontSize: 40, fontWeight: 900, color: "#1e3a5f", lineHeight: 1 }}>
                          {calc.rate} <span style={{ fontSize: 16, color: "#9ca3af", fontWeight: 400 }}>claims/month</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                          Current: <b style={{ color: "#374151" }}>{selectedData.capacity.avg_monthly_clearance}/month</b> •
                          Increase needed: <b style={{ color: calc.rate > selectedData.capacity.avg_monthly_clearance * 1.5 ? "#dc2626" : "#d97706" }}>
                            {Math.max(0, Math.round((calc.rate / Math.max(1, selectedData.capacity.avg_monthly_clearance) * 100) - 100))}%
                          </b>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                        {[
                          { label: "Required Sittings/month", value: calc.requiredSittings, color: "#1e3a5f" },
                          { label: "Additional Sittings Needed", value: calc.additionalSittings, color: calc.additionalSittings > 0 ? "#dc2626" : "#15803d" },
                        ].map(item => (
                          <div key={item.label} style={{ background: "white", borderRadius: 8, padding: "12px", textAlign: "center", border: "1px solid #bfdbfe" }}>
                            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>{item.label}</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: item.color }}>{item.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Action recommendation */}
                      <div style={{ background: calc.additionalSittings > 0 ? "#fef2f2" : "#f0fdf4", border: `1px solid ${calc.additionalSittings > 0 ? "#fca5a5" : "#86efac"}`, borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>Secretary Directive</div>
                        {calc.additionalSittings > 0 ? (
                          <>
                            <p style={{ fontSize: 13, color: "#7f1d1d", fontWeight: 700, margin: "0 0 6px" }}>
                              Mandate {calc.additionalSittings} additional SDLC sittings per month in {selectedData.district}
                            </p>
                            <p style={{ fontSize: 12, color: "#991b1b", margin: 0, lineHeight: 1.6 }}>
                              At {selectedData.pending.toLocaleString()} pending claims and a {targetMonths}-month target, the SDLC must process {calc.rate} claims/month.
                              Current capacity: {selectedData.capacity.current_sittings_per_month} sittings/month.
                              At current rate: <b>{selectedData.capacity.months_to_clear_at_current_rate > 100 ? "99+" : selectedData.capacity.months_to_clear_at_current_rate} months</b> to clear backlog.
                            </p>
                          </>
                        ) : (
                          <p style={{ fontSize: 13, color: "#14532d", fontWeight: 700, margin: 0 }}>
                            ✅ Current capacity is sufficient. No additional sittings required for this timeline.
                          </p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Select a district from the matrix</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>The clearance calculator and enforcement tools will appear here</div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
