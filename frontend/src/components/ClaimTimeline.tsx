/* ─── VANTARA — Claim Timeline (Light Theme / NIC Standard) ─ */

import { useEffect, useState } from "react";
import { fetchClaimDetail, fetchAIClaimSummary } from "../api";
import type { ClaimDetail, AISummary } from "../types";
import OfficerAction from "./OfficerAction";

interface ClaimTimelineProps {
  claimId: string;
  onClose: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  GRAM_SABHA: "Gram Sabha Review",
  SDLC: "SDLC Verification",
  DLC: "DLC Approval",
  TITLE_ISSUED: "Title Issued",
};

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-50 border-red-200 text-red-800",
  HIGH: "bg-amber-50 border-amber-200 text-amber-800",
  MEDIUM: "bg-purple-50 border-purple-200 text-purple-800",
};

export default function ClaimTimeline({ claimId, onClose }: ClaimTimelineProps) {
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setAiSummary(null);
    Promise.all([
      fetchClaimDetail(claimId),
      fetchAIClaimSummary(claimId),
    ]).then(([c, ai]) => {
      setClaim(c);
      setAiSummary(ai);
      setLoading(false);
    });
  }, [claimId]);

  const refreshClaim = async () => {
    const c = await fetchClaimDetail(claimId);
    setClaim(c);
  };

  if (loading || !claim) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-60" />
        <div className="h-48 bg-gray-100 rounded-lg" />
        <div className="h-32 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-full custom-scrollbar bg-white">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">
              Claim Investigation
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors text-sm ml-2"
            >
              ✕
            </button>
          </div>
          <p className="text-sm font-mono text-blue-700 mt-0.5">{claim.claim_id}</p>
        </div>
      </div>

      {/* Claim Meta */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400 text-xs font-medium">Applicant</span>
            <p className="text-gray-900 font-medium">{claim.applicant_name}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs font-medium">Filed Date</span>
            <p className="text-gray-900">{claim.filed_date}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs font-medium">Location</span>
            <p className="text-gray-900">
              {claim.district}, {claim.state}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-xs font-medium">Current Stage</span>
            <p className="text-amber-700 font-semibold">
              {STAGE_LABELS[claim.current_stage] || claim.current_stage}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-xs font-medium">Claimed Area</span>
            <p className="text-gray-900">{claim.claimed_area_ha} ha</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs font-medium">Recorded Area</span>
            <p
              className={
                claim.area_mismatch_pct > 10
                  ? "text-red-700 font-semibold"
                  : "text-gray-900"
              }
            >
              {claim.recorded_area_ha} ha
              {claim.area_mismatch_pct > 10 && (
                <span className="text-xs ml-1">
                  ({claim.area_mismatch_pct}% mismatch)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Missing fields */}
        {(claim.missing_survey_number || claim.missing_gps) && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
            {claim.missing_survey_number && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200 font-medium">
                Missing: Survey Number
              </span>
            )}
            {claim.missing_gps && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full border border-purple-200 font-medium">
                Missing: GPS Coordinates
              </span>
            )}
          </div>
        )}
      </div>

      {/* AI Analysis */}
      {aiSummary && aiSummary.severity !== "NONE" && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-blue-700 uppercase tracking-wider font-semibold">
              AI Analysis
            </span>
            <span className="text-xs text-gray-400">
              ({aiSummary.source})
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {aiSummary.summary}
          </p>
        </div>
      )}

      {/* Anomaly Flags */}
      {claim.anomaly_flags.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
            Anomaly Flags ({claim.anomaly_flags.length})
          </div>
          <div className="space-y-2">
            {claim.anomaly_flags.map((flag, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 border text-sm ${
                  SEVERITY_STYLES[flag.severity] || SEVERITY_STYLES.MEDIUM
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs uppercase">
                    {flag.type.replace("_", " ")}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      flag.severity === "CRITICAL"
                        ? "bg-red-200 text-red-800"
                        : flag.severity === "HIGH"
                        ? "bg-amber-200 text-amber-800"
                        : "bg-purple-200 text-purple-800"
                    }`}
                  >
                    {flag.severity}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {flag.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage Timeline */}
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
          Processing Timeline
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {claim.stage_history.map((h, i) => {
              const isActive = h.completed_at === null;
              const isDelayed = h.delay_flag;

              return (
                <div key={i} className="flex gap-4 relative">
                  {/* Dot */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                      isActive
                        ? isDelayed
                          ? "bg-red-600"
                          : "bg-amber-500"
                        : "bg-green-600"
                    }`}
                  >
                    {!isActive && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 rounded-lg p-3 border ${
                      isActive
                        ? isDelayed
                          ? "bg-red-50 border-red-200"
                          : "bg-amber-50 border-amber-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {STAGE_LABELS[h.stage] || h.stage}
                        </span>
                        {isActive && (
                          <span className="text-xs ml-2 px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-mono font-medium ${
                          isDelayed ? "text-red-700" : "text-gray-500"
                        }`}
                      >
                        {h.days_in_stage} days
                        {isDelayed && h.stage === "SDLC" && (
                          <span className="text-red-500 ml-1">
                            (limit: 60d)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Entered: {h.entered_at}
                      {h.completed_at && ` → Completed: ${h.completed_at}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Officer Action Module */}
      <OfficerAction
        claimId={claim.claim_id}
        existingActions={claim.officer_actions}
        onActionSubmitted={refreshClaim}
      />
    </div>
  );
}
