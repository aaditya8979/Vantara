/* ─── VANTARA — API Client ─────────────────────────────────── */

const API_BASE = "/api";

/**
 * Fetch the high-level dashboard summary.
 * 
 * @param district - Optional district name filter
 * @param state - Optional state name filter
 * @returns Dashboard metrics including pipeline breakdown and anomaly counts
 */
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

/**
 * Fetch a paginated list of claims with optional filters.
 * 
 * @param filters - Object containing optional status, district, state, anomaly_type, page, and page_size
 * @returns Paginated claims response
 */
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

/**
 * Fetch the full, detailed payload for a specific claim.
 * Includes stage history, anomaly flags, and officer actions.
 * 
 * @param claimId - The unique claim identifier
 * @returns Detailed claim payload
 */
export async function fetchClaimDetail(claimId: string) {
  const res = await fetch(`${API_BASE}/claims/${claimId}`);
  return res.json();
}

/**
 * Submit an official action or directive on a claim.
 * 
 * @param claimId - The target claim identifier
 * @param action - The action details including type, note, and resolution status
 * @returns The created officer action record
 */
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

/**
 * Fetch a GeoJSON FeatureCollection of all districts for map rendering.
 * 
 * @returns District GeoJSON data
 */
export async function fetchDistrictGeoJSON() {
  const res = await fetch(`${API_BASE}/geojson/districts`);
  return res.json();
}

/**
 * Fetch state-level aggregated data.
 * 
 * @returns Array of state summaries
 */
export async function fetchStates() {
  const res = await fetch(`${API_BASE}/states`);
  return res.json();
}

/**
 * Generate a deterministic AI summary explaining a claim's specific bottlenecks.
 * 
 * @param claimId - The unique claim identifier
 * @returns AI Summary text payload
 */
export async function fetchAIClaimSummary(claimId: string) {
  const res = await fetch(`${API_BASE}/ai/claim-summary/${claimId}`);
  return res.json();
}

/**
 * Generate a deterministic AI summary diagnosing systemic issues in a district.
 * 
 * @param districtName - The name of the target district
 * @returns AI Summary text payload
 */
export async function fetchAIDistrictSummary(districtName: string) {
  const res = await fetch(`${API_BASE}/ai/district-summary/${districtName}`);
  return res.json();
}

/**
 * Fetch a simplified view of a claim for public/applicant portal tracking.
 * 
 * @param claimId - The unique claim identifier
 * @returns Safe applicant view payload
 */
export async function fetchApplicantView(claimId: string) {
  const res = await fetch(`${API_BASE}/applicant/${claimId}`);
  return res.json();
}

/* ─── Role-Specific Endpoints ─────────────────────────────── */

/**
 * Fetch the SDLC (Sub-Divisional Level Committee) action queue.
 * Prioritizes incomplete records needing field verification.
 * 
 * @param filters - Filter options including type, district, and pagination
 * @returns Paginated SDLC claims response
 */
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

/**
 * Fetch the DLC (District Level Committee) violations queue.
 * Prioritizes claims violating statutory deadlines or massive land area mismatches.
 * 
 * @param filters - Filter options including district, violation type, and pagination
 * @returns Paginated DLC claims response
 */
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

/**
 * Fetch the State Matrix, providing a macro-level overview of district performance.
 * Used by the State Tribal Secretary for capacity planning.
 * 
 * @param state - Optional state name filter
 * @returns Array of district summaries for the State Matrix
 */
export async function fetchStateMatrix(state?: string) {
  const params = new URLSearchParams();
  if (state) params.set("state", state);
  const res = await fetch(`${API_BASE}/state/matrix?${params}`);
  return res.json();
}
