/* ─── VANTARA — API Client ─────────────────────────────────── */

const API_BASE = "/api";

export async function fetchDashboardSummary(
  district?: string,
  state?: string
) {
  const params = new URLSearchParams();
  if (district) params.set("district", district);
  if (state) params.set("state", state);
  const res = await fetch(`${API_BASE}/dashboard/summary?${params}`);
  return res.json();
}

export async function fetchClaims(filters: {
  status?: string;
  district?: string;
  state?: string;
  anomaly_type?: string;
  page?: number;
  page_size?: number;
}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.district) params.set("district", filters.district);
  if (filters.state) params.set("state", filters.state);
  if (filters.anomaly_type) params.set("anomaly_type", filters.anomaly_type);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  const res = await fetch(`${API_BASE}/claims?${params}`);
  return res.json();
}

export async function fetchClaimDetail(claimId: string) {
  const res = await fetch(`${API_BASE}/claims/${claimId}`);
  return res.json();
}

export async function postOfficerAction(
  claimId: string,
  action: { action_type: string; note: string; resolution_status: string }
) {
  const res = await fetch(`${API_BASE}/claims/${claimId}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  return res.json();
}

export async function fetchDistrictGeoJSON() {
  const res = await fetch(`${API_BASE}/geojson/districts`);
  return res.json();
}

export async function fetchStates() {
  const res = await fetch(`${API_BASE}/states`);
  return res.json();
}

export async function fetchAIClaimSummary(claimId: string) {
  const res = await fetch(`${API_BASE}/ai/claim-summary/${claimId}`);
  return res.json();
}

export async function fetchAIDistrictSummary(districtName: string) {
  const res = await fetch(`${API_BASE}/ai/district-summary/${districtName}`);
  return res.json();
}

export async function fetchApplicantView(claimId: string) {
  const res = await fetch(`${API_BASE}/applicant/${claimId}`);
  return res.json();
}

/* ─── Role-Specific Endpoints ─────────────────────────────── */

export async function fetchSDLCQueue(filters: {
  type?: string;
  district?: string;
  page?: number;
  page_size?: number;
}) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.district) params.set("district", filters.district);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  const res = await fetch(`${API_BASE}/sdlc/queue?${params}`);
  return res.json();
}

export async function fetchDLCViolations(filters: {
  district?: string;
  violation_type?: string;
  page?: number;
  page_size?: number;
}) {
  const params = new URLSearchParams();
  if (filters.district) params.set("district", filters.district);
  if (filters.violation_type) params.set("violation_type", filters.violation_type);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  const res = await fetch(`${API_BASE}/dlc/violations?${params}`);
  return res.json();
}

export async function fetchStateMatrix(state?: string) {
  const params = new URLSearchParams();
  if (state) params.set("state", state);
  const res = await fetch(`${API_BASE}/state/matrix?${params}`);
  return res.json();
}
