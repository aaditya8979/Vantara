/* ─── VANTARA — Applicant Portal (Light Theme / NIC Standard) */

import { useState, ReactNode } from "react";
import { ArrowRight, Search, Home, ClipboardList, Landmark, ScrollText, Check, X, Hourglass, FileText, Leaf } from "lucide-react";
import type { ApplicantView } from "../types";

const STAGE_ICONS: Record<string, ReactNode> = {
  GRAM_SABHA: <Home size={16} />,
  SDLC: <ClipboardList size={16} />,
  DLC: <Landmark size={16} />,
  TITLE_ISSUED: <ScrollText size={16} />,
};

export default function ApplicantPortal() {
  const [claimId, setClaimId] = useState("");
  const [data, setData] = useState<ApplicantView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimId.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `http://localhost:8000/api/applicant/${claimId.trim()}`
      );
      if (!res.ok) {
        setError("Claim not found. Please check the Claim ID and try again.");
        return;
      }
      const d = await res.json();
      setData(d);
    } catch {
      setError("Unable to connect. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Official Header */}
      <header className="bg-[#1e3a5f] text-white px-6 py-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1e3a5f] font-bold text-xl shadow-sm">
            V
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">
              Department of Tribal Affairs
            </h1>
            <p className="text-sm text-blue-200">
              Forest Rights Act (FRA) — Claim Status Portal
            </p>
          </div>
        </div>
      </header>

      {/* Sub-header */}
      <div className="bg-[#2c5282] text-white px-6 py-2">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-blue-200 tracking-wide">
            VANTARA — Verified Anomaly Navigation & Tracking for Adivasi Rights Administration
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          {/* Search Card */}
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-md mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Track Your Forest Rights Claim
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your Claim ID to view the current status and processing
              timeline of your Forest Rights Act application.
            </p>
            <form onSubmit={handleLookup} className="flex gap-3">
              <input
                type="text"
                value={claimId}
                onChange={(e) => setClaimId(e.target.value)}
                placeholder="Enter Claim ID (e.g. CH-BAS-00001)"
                className="flex-1 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm transition-all"
              />
              <button
                type="submit"
                disabled={loading || !claimId.trim()}
                className="bg-[#1e3a5f] hover:bg-[#2c5282] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors shadow-sm"
              >
                {loading ? "Searching..." : "Track Claim"}
              </button>
            </form>
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Results */}
          {data && (
            <div className="space-y-6">
              {/* Claim Info */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {data.applicant_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {data.district}, {data.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-200">
                      {data.claim_id}
                    </span>
                    <p className="text-xs text-gray-400 mt-2">
                      Filed: {data.filed_date}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                      data.current_status.includes("Title")
                        ? "bg-green-600"
                        : data.current_status.includes("Rejected")
                        ? "bg-red-600"
                        : "bg-amber-500"
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center">
                      {data.current_status.includes("Title")
                        ? <Check size={24} className="text-white" /> 
                        : data.current_status.includes("Rejected")
                        ? <X size={24} className="text-white" /> 
                        : <Hourglass size={24} className="text-white" />}
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900">
                      Current Status: {data.current_status}
                    </div>
                    <div className="text-sm text-gray-500">
                      Claimed area: {data.claimed_area_ha} hectares
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-5">
                  Processing Timeline
                </h3>

                <div className="relative">
                  <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gray-200" />

                  <div className="space-y-6">
                    {data.timeline.map((step, i) => {
                      const isActive = step.status === "In Progress";
                      const isComplete = step.status === "Completed";

                      return (
                        <div key={i} className="flex gap-4 relative">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0 text-white ${
                              isComplete
                                ? "bg-green-600"
                                : isActive
                                ? "bg-amber-500"
                                : "bg-gray-300"
                            }`}
                          >
                            <span className="text-xl">
                              {STAGE_ICONS[step.stage] || <FileText size={16} />}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {step.stage_label}
                              </span>
                              {isActive && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium border border-amber-200">
                                  In Progress
                                </span>
                              )}
                              {isComplete && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium border border-green-200">
                                  Complete
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                              {step.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Started: {step.entered_at}
                              {step.completed_at &&
                                ` • Completed: ${step.completed_at}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Helpline */}
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200 text-center">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Need help with your claim?
                </p>
                <p className="text-xs text-gray-600">
                  Contact your District Tribal Affairs Officer or call the national
                  helpline: <span className="text-gray-900 font-mono font-semibold">1800-XXX-XXXX</span>
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!data && !loading && !error && (
            <div className="text-center py-16">
              <div className="mb-4 flex justify-center text-green-700"><Leaf size={60} /></div>
              <h3 className="text-lg text-gray-600 font-medium mb-2">
                Enter your Claim ID above
              </h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Your Claim ID was provided to you at the time of filing. It starts
                with a state code (e.g., CH-, JH-, OD-).
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          © Ministry of Tribal Affairs, Government of India • Forest Rights Act, 2006
        </p>
      </footer>
    </div>
  );
}
