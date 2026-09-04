/* ─── VANTARA — Types ──────────────────────────────────────── */

export interface PipelineSummary {
  submitted: number;
  gram_sabha_review: number;
  sdlc_verification: number;
  dlc_approval: number;
  title_issued: number;
  rejected: number;
  pending: number;
}

export interface AnomalySummary {
  total_flagged: number;
  statutory_violations: number;
  land_mismatches: number;
  incomplete_records: number;
}

export interface DashboardSummary {
  total_claims: number;
  pipeline: PipelineSummary;
  settlement_pct: number;
  anomalies: AnomalySummary;
  filter: {
    district: string | null;
    state: string | null;
  };
}

export interface ClaimListItem {
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
  anomaly_count: number;
  anomaly_types: string[];
}

export interface ClaimsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  claims: ClaimListItem[];
}

export interface StageHistoryEntry {
  stage: string;
  entered_at: string;
  completed_at: string | null;
  days_in_stage: number;
  delay_flag: boolean;
}

export interface AnomalyFlag {
  type: string;
  severity: string;
  description: string;
  [key: string]: unknown;
}

export interface OfficerAction {
  action_id: number;
  claim_id: string;
  action_type: string;
  note: string;
  resolution_status: string;
  timestamp: string;
}

export interface ClaimDetail {
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
  missing_survey_number: boolean;
  missing_gps: boolean;
  stage_history: StageHistoryEntry[];
  anomaly_flags: AnomalyFlag[];
  officer_actions: OfficerAction[];
}

export interface DistrictAnomaly {
  anomaly_score: number;
  anomaly_class: "SYSTEMIC" | "INDIVIDUAL" | "HEALTHY";
  deviation_std: number;
  peer_mean_pct: number;
  peer_count: number;
  peer_districts: string[];
  bottleneck_stage: string;
  is_systemic: boolean;
}

export interface DistrictProperties {
  district: string;
  state: string;
  st_pct: number;
  forest_pct: number;
  total_claims: number;
  approved: number;
  rejected: number;
  pending: number;
  at_stage1: number;
  at_stage2: number;
  at_stage3: number;
  settlement_pct: number;
  avg_stage2_days: number;
  stage2_concentration_pct: number;
  land_mismatches: number;
  land_mismatch_pct: number;
  statutory_violations: number;
  missing_survey: number;
  missing_gps: number;
  anomaly: DistrictAnomaly;
}

export interface DistrictFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: DistrictProperties;
}

export interface DistrictGeoJSON {
  type: "FeatureCollection";
  features: DistrictFeature[];
}

export interface AISummary {
  claim_id?: string;
  district?: string;
  summary: string;
  severity?: string;
  anomaly_class?: string;
  anomaly_score?: number;
  source: string;
}

export interface StateSummary {
  state: string;
  districts: number;
  total_claims: number;
  approved: number;
  rejected: number;
  pending: number;
  statutory_violations: number;
  land_mismatches: number;
  settlement_pct: number;
}

export interface ApplicantView {
  claim_id: string;
  applicant_name: string;
  district: string;
  state: string;
  current_status: string;
  filed_date: string;
  claimed_area_ha: number;
  timeline: {
    stage: string;
    stage_label: string;
    entered_at: string;
    completed_at: string | null;
    status: string;
    description: string;
  }[];
}
