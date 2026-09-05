/* ─── VANTARA — Main Application (Role-Based Routing) ─────── */

import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Landing from "./components/Landing";
import type { UserRole } from "./components/Landing";
import Map from "./components/Map";
import Dashboard from "./components/Dashboard";
import ClaimTable from "./components/ClaimTable";
import ClaimTimeline from "./components/ClaimTimeline";
import ApplicantPortal from "./components/ApplicantPortal";
import SDLCOfficerDashboard from "./components/SDLCOfficerDashboard";
import DLCMagistrateDashboard from "./components/DLCMagistrateDashboard";
import StateSecretaryDashboard from "./components/StateSecretaryDashboard";

/* ─── Generic Command Center (original dashboard) ─────────── */

function CommandCenter({ onLogout }: { onLogout: () => void }) {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [anomalyFilter, setAnomalyFilter] = useState<string | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<"dashboard" | "claims" | "claim-detail">("dashboard");

  const handleDistrictSelect = (district: string, state: string) => {
    setSelectedDistrict(district);
    setSelectedState(state);
    setStatusFilter(null);
    setAnomalyFilter(null);
    setSelectedClaimId(null);
    setRightPanel("dashboard");
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setAnomalyFilter(null);
    setSelectedClaimId(null);
    setRightPanel("claims");
  };

  const handleAnomalyFilter = (type: string) => {
    setAnomalyFilter(type);
    setStatusFilter(null);
    setSelectedClaimId(null);
    setRightPanel("claims");
  };

  const handleClaimSelect = (claimId: string) => {
    setSelectedClaimId(claimId);
    setRightPanel("claim-detail");
  };

  const handleClearFilters = () => {
    setSelectedDistrict(null);
    setSelectedState(null);
    setStatusFilter(null);
    setAnomalyFilter(null);
    setSelectedClaimId(null);
    setRightPanel("dashboard");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0 bg-[#1e3a5f] shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1e3a5f] font-bold text-sm shadow-sm">V</div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">VANTARA</h1>
            <p className="text-[10px] text-blue-200 -mt-0.5 tracking-wider">FOREST RIGHTS MONITORING SYSTEM</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {(selectedDistrict || statusFilter || anomalyFilter) && (
            <button onClick={handleClearFilters} className="text-xs text-blue-200 hover:text-white transition-colors flex items-center gap-1">
              <span>✕</span> Clear Filters
            </button>
          )}
          <nav className="flex gap-1">
            <button onClick={() => setRightPanel("dashboard")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${rightPanel === "dashboard" ? "bg-white/20 text-white" : "text-blue-200 hover:text-white"}`}>
              Overview
            </button>
            <button onClick={() => setRightPanel("claims")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${rightPanel === "claims" ? "bg-white/20 text-white" : "text-blue-200 hover:text-white"}`}>
              Claims
            </button>
          </nav>
          <button onClick={onLogout} className="text-xs text-blue-200 hover:text-white border border-blue-300/30 px-3 py-1.5 rounded transition-colors">
            ← Switch Role
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative border-r border-gray-200">
          <Map onDistrictSelect={handleDistrictSelect} selectedDistrict={selectedDistrict} />
        </div>
        <div className="w-[420px] bg-gray-50 flex flex-col overflow-hidden">
          {rightPanel === "dashboard" && (
            <Dashboard selectedDistrict={selectedDistrict} selectedState={selectedState}
              onStatusFilter={handleStatusFilter} onAnomalyFilter={handleAnomalyFilter} />
          )}
          {rightPanel === "claims" && (
            <ClaimTable statusFilter={statusFilter} districtFilter={selectedDistrict}
              stateFilter={selectedState} anomalyFilter={anomalyFilter} onClaimSelect={handleClaimSelect} />
          )}
          {rightPanel === "claim-detail" && selectedClaimId && (
            <ClaimTimeline claimId={selectedClaimId} onClose={() => setRightPanel("claims")} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Role-Based Router ─────────────────────────────────────── */

function RoleDashboard() {
  const [role, setRole] = useState<UserRole>(null);
  const [activeState, setActiveState] = useState<string>("Jharkhand");
  const [activeDistrict, setActiveDistrict] = useState<string>("Khunti");
  const navigate = useNavigate();

  const handleRoleSelect = (r: UserRole, state: string, district: string) => {
    setRole(r);
    setActiveState(state);
    setActiveDistrict(district);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setRole(null);
    navigate("/");
  };

  const location = useLocation();

  // Applicant Portal — independent route
  if (location.pathname === "/applicant") {
    return (
      <div>
        <Link to="/"
          className="fixed top-4 left-4 z-50 text-xs text-gray-600 hover:text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-300 transition-colors shadow-sm font-medium">
          ← Back to Portal
        </Link>
        <ApplicantPortal />
      </div>
    );
  }

  // No role selected — show Landing
  if (!role || location.pathname === "/") {
    if (role && location.pathname === "/") {
      setRole(null);
    }
    return <Landing onRoleSelect={handleRoleSelect} />;
  }

  // Role-specific dashboards
  switch (role) {
    case "sdlc_officer":
      return <SDLCOfficerDashboard onLogout={handleLogout} activeDistrict={activeDistrict} activeState={activeState} />;
    case "dlc_magistrate":
      return <DLCMagistrateDashboard onLogout={handleLogout} activeDistrict={activeDistrict} activeState={activeState} />;
    case "state_secretary":
      return <StateSecretaryDashboard onLogout={handleLogout} activeState={activeState} />;
    default:
      return <CommandCenter onLogout={handleLogout} />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<RoleDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
