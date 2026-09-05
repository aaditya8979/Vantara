"""
VANTARA — FastAPI Backend
All endpoints for dashboard, claims, geojson, and officer actions.
Data is loaded lazily on first request for Vercel serverless compatibility.
"""

import json
import os
import sys
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add api directory to Python path for underscore-prefixed module imports
sys.path.insert(0, os.path.dirname(__file__))

from _anomaly_engine import run_anomaly_engine

# ─── Initialize ──────────────────────────────────────────────────────

tags_metadata = [
    {"name": "System", "description": "System health and status checks."},
    {"name": "Dashboard", "description": "Aggregate metrics for high-level monitoring."},
    {"name": "Claims", "description": "Core CRUD operations for FRA land claims."},
    {"name": "Reference", "description": "Geospatial and administrative boundary data."},
    {"name": "Officer Actions", "description": "Role-specific queues and legal directives."},
    {"name": "AI Summaries", "description": "AI-generated narratives for complex claims."},
]

app = FastAPI(
    title="VANTARA API",
    description="Operational intelligence engine for the Forest Rights Act (FRA), 2006.",
    version="1.0.0",
    openapi_tags=tags_metadata
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# Global data stores (loaded lazily on first request)
CLAIMS: list[dict] = []
DISTRICTS: list[dict] = []
CLAIMS_INDEX: dict[str, dict] = {}  # claim_id -> claim
_DATA_LOADED = False


def load_or_generate_data():
    """Load data from JSON files, or generate in-memory if not found."""
    global CLAIMS, DISTRICTS, CLAIMS_INDEX, _DATA_LOADED

    if _DATA_LOADED:
        return

    claims_path = os.path.join(DATA_DIR, "claims.json")
    districts_path = os.path.join(DATA_DIR, "districts.json")

    try:
        if os.path.exists(claims_path) and os.path.exists(districts_path):
            with open(claims_path, "r") as f:
                CLAIMS = json.load(f)
            with open(districts_path, "r") as f:
                DISTRICTS = json.load(f)
            print(f"Loaded data from files: {len(CLAIMS)} claims")
        else:
            print("Data files not found. Generating in-memory...")
            from _data_generator import generate_all_data
            CLAIMS, DISTRICTS = generate_all_data()
            print(f"Generated in-memory: {len(CLAIMS)} claims")
    except Exception as e:
        print(f"Error loading from files: {e}. Generating in-memory...")
        from _data_generator import generate_all_data
        CLAIMS, DISTRICTS = generate_all_data()
        print(f"Generated in-memory: {len(CLAIMS)} claims")

    # Run anomaly engine
    CLAIMS, DISTRICTS = run_anomaly_engine(CLAIMS, DISTRICTS)

    # Build index
    CLAIMS_INDEX = {c["claim_id"]: c for c in CLAIMS}
    _DATA_LOADED = True

    print(f"Ready: {len(CLAIMS)} claims, {len(DISTRICTS)} districts")


# Use middleware for lazy loading instead of @app.on_event("startup")
# because Vercel serverless doesn't reliably fire ASGI lifecycle events
@app.middleware("http")
async def ensure_data_loaded(request: Request, call_next):
    if not _DATA_LOADED:
        load_or_generate_data()
    response = await call_next(request)
    return response


# ─── System Endpoints ────────────────────────────────────────────────

@app.get("/api/health", tags=["System"])
def health_check():
    """Returns the operational status of the API and data engine."""
    return {
        "status": "healthy",
        "data_loaded": _DATA_LOADED,
        "claims_indexed": len(CLAIMS_INDEX)
    }

# ─── Pydantic Models ─────────────────────────────────────────────────

class OfficerActionRequest(BaseModel):
    action_type: str
    note: str
    resolution_status: str


class OfficerActionResponse(BaseModel):
    action_id: int
    claim_id: str
    action_type: str
    note: str
    resolution_status: str
    timestamp: str


# ─── Dashboard Endpoints ─────────────────────────────────────────────

@app.get("/api/dashboard/summary", tags=["Dashboard"])
def dashboard_summary(district: Optional[str] = None, state: Optional[str] = None):
    """Aggregate counts across all claims or filtered by district/state."""
    filtered = CLAIMS
    if district:
        filtered = [c for c in filtered if c["district"] == district]
    if state:
        filtered = [c for c in filtered if c["state"] == state]

    total = len(filtered)
    submitted = sum(1 for c in filtered if c["current_status"] == "SUBMITTED")
    gram_sabha = sum(1 for c in filtered if c["current_status"] == "GRAM_SABHA_REVIEW")
    sdlc = sum(1 for c in filtered if c["current_status"] == "SDLC_VERIFICATION")
    dlc = sum(1 for c in filtered if c["current_status"] == "DLC_APPROVAL")
    approved = sum(1 for c in filtered if c["current_status"] == "TITLE_ISSUED")
    rejected = sum(1 for c in filtered if c["current_status"] == "REJECTED")
    pending = submitted + gram_sabha + sdlc + dlc

    # Anomaly counts
    statutory_violations = sum(
        1 for c in filtered
        if any(f["type"] == "STATUTORY_VIOLATION" for f in c.get("anomaly_flags", []))
    )
    land_mismatches = sum(
        1 for c in filtered
        if any(f["type"] == "LAND_MISMATCH" for f in c.get("anomaly_flags", []))
    )
    incomplete_records = sum(
        1 for c in filtered
        if any(f["type"] == "INCOMPLETE_RECORD" for f in c.get("anomaly_flags", []))
    )
    total_anomalies = sum(
        1 for c in filtered if len(c.get("anomaly_flags", [])) > 0
    )

    settlement_pct = round(approved / total * 100, 1) if total > 0 else 0

    return {
        "total_claims": total,
        "pipeline": {
            "submitted": submitted,
            "gram_sabha_review": gram_sabha,
            "sdlc_verification": sdlc,
            "dlc_approval": dlc,
            "title_issued": approved,
            "rejected": rejected,
            "pending": pending,
        },
        "settlement_pct": settlement_pct,
        "anomalies": {
            "total_flagged": total_anomalies,
            "statutory_violations": statutory_violations,
            "land_mismatches": land_mismatches,
            "incomplete_records": incomplete_records,
        },
        "filter": {
            "district": district,
            "state": state,
        },
    }


# ─── Claims Endpoints ────────────────────────────────────────────────

@app.get("/api/claims", tags=["Claims"])
def get_claims(
    status: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    anomaly_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    """Return filtered, paginated claims."""
    filtered = CLAIMS

    if status:
        filtered = [c for c in filtered if c["current_status"] == status]
    if district:
        filtered = [c for c in filtered if c["district"] == district]
    if state:
        filtered = [c for c in filtered if c["state"] == state]
    if anomaly_type:
        filtered = [
            c for c in filtered
            if any(f["type"] == anomaly_type for f in c.get("anomaly_flags", []))
        ]

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    page_claims = filtered[start:end]

    # Return lightweight version for table view (no full stage_history)
    results = []
    for c in page_claims:
        current_days = 0
        for h in c.get("stage_history", []):
            if h.get("completed_at") is None:
                current_days = h.get("days_in_stage", 0)
                break

        results.append({
            "claim_id": c["claim_id"],
            "applicant_name": c["applicant_name"],
            "district": c["district"],
            "state": c["state"],
            "current_status": c["current_status"],
            "current_stage": c["current_stage"],
            "filed_date": c["filed_date"],
            "claimed_area_ha": c["claimed_area_ha"],
            "recorded_area_ha": c["recorded_area_ha"],
            "area_mismatch_pct": c["area_mismatch_pct"],
            "days_in_current_stage": current_days,
            "anomaly_count": len(c.get("anomaly_flags", [])),
            "anomaly_types": list(set(f["type"] for f in c.get("anomaly_flags", []))),
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "claims": results,
    }


@app.get("/api/claims/{claim_id}", tags=["Claims"])
def get_claim_detail(claim_id: str):
    """Return full claim payload including stage history and anomaly flags."""
    claim = CLAIMS_INDEX.get(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")
    return claim


# ─── Officer Actions ─────────────────────────────────────────────────

@app.post("/api/claims/{claim_id}/actions", tags=["Claims"])
def add_officer_action(claim_id: str, action: OfficerActionRequest):
    """Append an officer action to a claim's audit trail."""
    claim = CLAIMS_INDEX.get(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    from datetime import datetime

    action_entry = {
        "action_id": len(claim.get("officer_actions", [])) + 1,
        "claim_id": claim_id,
        "action_type": action.action_type,
        "note": action.note,
        "resolution_status": action.resolution_status,
        "timestamp": datetime.now().isoformat(),
    }

    if "officer_actions" not in claim:
        claim["officer_actions"] = []
    claim["officer_actions"].append(action_entry)

    return action_entry


# ─── GeoJSON Endpoint ────────────────────────────────────────────────

@app.get("/api/geojson/districts", tags=["Reference"])
def get_district_geojson():
    """
    Return district data as GeoJSON FeatureCollection.
    Each feature is a point at the district center with aggregate metrics as properties.
    """
    features = []
    for ds in DISTRICTS:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [ds["lng"], ds["lat"]],
            },
            "properties": {
                "district": ds["district"],
                "state": ds["state"],
                "st_pct": ds["st_pct"],
                "forest_pct": ds["forest_pct"],
                "total_claims": ds["total_claims"],
                "approved": ds["approved"],
                "rejected": ds["rejected"],
                "pending": ds["pending"],
                "at_stage1": ds["at_stage1"],
                "at_stage2": ds["at_stage2"],
                "at_stage3": ds["at_stage3"],
                "settlement_pct": ds["settlement_pct"],
                "avg_stage2_days": ds["avg_stage2_days"],
                "stage2_concentration_pct": ds["stage2_concentration_pct"],
                "land_mismatches": ds["land_mismatches"],
                "land_mismatch_pct": ds["land_mismatch_pct"],
                "statutory_violations": ds["statutory_violations"],
                "missing_survey": ds["missing_survey"],
                "missing_gps": ds["missing_gps"],
                "anomaly": ds.get("anomaly", {}),
            },
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features,
    }


# ─── District Detail ─────────────────────────────────────────────────

@app.get("/api/districts", tags=["Reference"])
def get_all_districts():
    """Return all district summaries with anomaly scores."""
    return DISTRICTS


@app.get("/api/districts/{district_name}", tags=["Reference"])
def get_district_detail(district_name: str):
    """Return a single district's full summary."""
    for ds in DISTRICTS:
        if ds["district"] == district_name:
            return ds
    raise HTTPException(status_code=404, detail=f"District {district_name} not found")


# ─── State Aggregation ───────────────────────────────────────────────

@app.get("/api/states", tags=["Reference"])
def get_states():
    """Return state-level aggregated data."""
    state_map: dict[str, dict] = {}
    for ds in DISTRICTS:
        state = ds["state"]
        if state not in state_map:
            state_map[state] = {
                "state": state,
                "districts": 0,
                "total_claims": 0,
                "approved": 0,
                "rejected": 0,
                "pending": 0,
                "statutory_violations": 0,
                "land_mismatches": 0,
            }
        s = state_map[state]
        s["districts"] += 1
        s["total_claims"] += ds["total_claims"]
        s["approved"] += ds["approved"]
        s["rejected"] += ds["rejected"]
        s["pending"] += ds["pending"]
        s["statutory_violations"] += ds["statutory_violations"]
        s["land_mismatches"] += ds["land_mismatches"]

    results = []
    for s in state_map.values():
        s["settlement_pct"] = round(s["approved"] / s["total_claims"] * 100, 1) if s["total_claims"] > 0 else 0
        results.append(s)

    results.sort(key=lambda x: x["settlement_pct"], reverse=True)
    return results


# ─── Applicant Portal ────────────────────────────────────────────────

@app.get("/api/applicant/{claim_id}", tags=["Claims"])
def get_applicant_view(claim_id: str):
    """
    Public-safe view for applicants.
    Returns status timeline WITHOUT officer notes, anomaly flags, or internal scores.
    """
    claim = CLAIMS_INDEX.get(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    # Friendly stage descriptions
    stage_descriptions = {
        "GRAM_SABHA": "Your claim is being reviewed by the Gram Sabha (village council). They verify your occupancy and prepare the recommendation.",
        "SDLC": "Your claim has been forwarded to the Sub-Divisional Level Committee for verification. A field visit may be conducted.",
        "DLC": "Your claim is at the District Level Committee for final approval. This is the last stage before title issuance.",
        "TITLE_ISSUED": "Congratulations! Your forest rights title has been approved and issued.",
        "REJECTED": "Your claim was not approved. You have the right to appeal through your Gram Sabha.",
    }

    safe_history = []
    for h in claim.get("stage_history", []):
        safe_history.append({
            "stage": h["stage"],
            "stage_label": h["stage"].replace("_", " ").title(),
            "entered_at": h["entered_at"],
            "completed_at": h["completed_at"],
            "status": "Completed" if h["completed_at"] else "In Progress",
            "description": stage_descriptions.get(h["stage"], "Processing..."),
        })

    return {
        "claim_id": claim["claim_id"],
        "applicant_name": claim["applicant_name"],
        "district": claim["district"],
        "state": claim["state"],
        "current_status": claim["current_status"].replace("_", " ").title(),
        "filed_date": claim["filed_date"],
        "claimed_area_ha": claim["claimed_area_ha"],
        "timeline": safe_history,
    }


# ─── AI Summary Endpoint ─────────────────────────────────────────────

@app.get("/api/ai/claim-summary/{claim_id}", tags=["AI Summaries"])
def get_ai_claim_summary(claim_id: str):
    """
    Generate a deterministic plain-English summary of a claim's anomalies.
    Uses structured data to build the explanation — no LLM hallucination.
    Falls back to mock if Gemini is unavailable.
    """
    claim = CLAIMS_INDEX.get(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    flags = claim.get("anomaly_flags", [])
    if not flags:
        return {
            "claim_id": claim_id,
            "summary": "No anomalies detected for this claim. All records appear consistent and within statutory timelines.",
            "severity": "NONE",
            "source": "deterministic",
        }

    # Build deterministic summary from flags
    parts = []
    max_severity = "MEDIUM"

    for flag in flags:
        parts.append(flag["description"])
        if flag["severity"] == "CRITICAL":
            max_severity = "CRITICAL"
        elif flag["severity"] == "HIGH" and max_severity != "CRITICAL":
            max_severity = "HIGH"

    summary = " ".join(parts)

    # Add peer context from district
    district_data = next((d for d in DISTRICTS if d["district"] == claim["district"]), None)
    if district_data and district_data.get("anomaly"):
        anomaly = district_data["anomaly"]
        if anomaly["anomaly_class"] == "SYSTEMIC":
            summary += f" Note: This claim is in {claim['district']} district, which shows systemic failure — settlement rate {district_data['settlement_pct']}% vs peer average {anomaly['peer_mean_pct']}% (deviation: {anomaly['deviation_std']} std). The bottleneck is at the {anomaly['bottleneck_stage']} stage."

    return {
        "claim_id": claim_id,
        "summary": summary,
        "severity": max_severity,
        "flags_count": len(flags),
        "flag_types": [f["type"] for f in flags],
        "source": "deterministic",
    }


@app.get("/api/ai/district-summary/{district_name}", tags=["AI Summaries"])
def get_ai_district_summary(district_name: str):
    """Generate a deterministic plain-English summary of a district's FRA status."""
    district = next((d for d in DISTRICTS if d["district"] == district_name), None)
    if not district:
        raise HTTPException(status_code=404, detail=f"District {district_name} not found")

    anomaly = district.get("anomaly", {})
    parts = []

    parts.append(f"{district['district']}, {district['state']} has {district['total_claims']} FRA claims filed.")
    parts.append(f"Settlement rate: {district['settlement_pct']}%.")

    if anomaly.get("anomaly_class") == "SYSTEMIC":
        parts.append(
            f"SYSTEMIC FAILURE DETECTED: {district['stage2_concentration_pct']}% of pending claims "
            f"are stuck at the SDLC stage with an average processing time of {district['avg_stage2_days']:.0f} days "
            f"(statutory limit: 60 days). This settlement rate is {abs(anomaly['deviation_std']):.1f} standard deviations "
            f"below the peer cohort average of {anomaly['peer_mean_pct']}%. "
            f"Peer districts ({', '.join(anomaly['peer_districts'][:3])}) average significantly higher settlement rates. "
            f"This pattern is statistically consistent with an institutional bottleneck at the Sub-Divisional Committee level."
        )
    elif anomaly.get("anomaly_class") == "INDIVIDUAL":
        parts.append(
            f"Individual delays detected. Settlement rate is below the peer average of {anomaly['peer_mean_pct']}% "
            f"by {abs(anomaly['deviation_std']):.1f} standard deviations. Delays are distributed across multiple stages "
            f"without a single systemic bottleneck. {district['land_mismatches']} claims show land record mismatches."
        )
    else:
        parts.append(
            f"This district is performing well. Settlement rate is near or above the peer average "
            f"of {anomaly.get('peer_mean_pct', 'N/A')}%. No systemic anomalies detected."
        )

    if district["statutory_violations"] > 0:
        parts.append(
            f"{district['statutory_violations']} claims currently exceed the FRA statutory processing deadline."
        )

    if district["land_mismatch_pct"] > 10:
        parts.append(
            f"Land record conflict rate is {district['land_mismatch_pct']}%, significantly above the acceptable threshold."
        )

    return {
        "district": district_name,
        "summary": " ".join(parts),
        "anomaly_class": anomaly.get("anomaly_class", "UNKNOWN"),
        "anomaly_score": anomaly.get("anomaly_score", 0),
        "source": "deterministic",
    }


# ─── Role-Specific Endpoints ─────────────────────────────────────────

@app.get("/api/sdlc/queue", tags=["Officer Actions"])
def get_sdlc_queue(
    type: str = Query("incomplete"),
    district: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    """SDLC Field Officer queue — incomplete records needing field action."""
    if type == "incomplete":
        filtered = [
            c for c in CLAIMS
            if any(f["type"] == "INCOMPLETE_RECORD" for f in c.get("anomaly_flags", []))
        ]
    elif type == "statutory":
        filtered = [
            c for c in CLAIMS
            if any(f["type"] == "STATUTORY_VIOLATION" for f in c.get("anomaly_flags", []))
        ]
    else:
        filtered = CLAIMS

    if district:
        filtered = [c for c in filtered if c["district"] == district]

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    page_claims = filtered[start:end]

    results = []
    for c in page_claims:
        missing_fields = []
        if c.get("missing_survey_number"):
            missing_fields.append("Survey/Khasra Number")
        if c.get("missing_gps"):
            missing_fields.append("GPS Coordinates")

        current_days = 0
        current_stage_name = c["current_stage"]
        for h in c.get("stage_history", []):
            if h.get("completed_at") is None:
                current_days = h.get("days_in_stage", 0)
                break

        results.append({
            "claim_id": c["claim_id"],
            "applicant_name": c["applicant_name"],
            "district": c["district"],
            "state": c["state"],
            "current_status": c["current_status"],
            "current_stage": current_stage_name,
            "filed_date": c["filed_date"],
            "claimed_area_ha": c["claimed_area_ha"],
            "recorded_area_ha": c["recorded_area_ha"],
            "area_mismatch_pct": c["area_mismatch_pct"],
            "days_in_current_stage": current_days,
            "missing_fields": missing_fields,
            "anomaly_types": [f["type"] for f in c.get("anomaly_flags", [])],
        })

    # Breakdown stats
    missing_survey_count = sum(1 for c in filtered if c.get("missing_survey_number"))
    missing_gps_count = sum(1 for c in filtered if c.get("missing_gps"))

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "stats": {
            "missing_survey": missing_survey_count,
            "missing_gps": missing_gps_count,
        },
        "claims": results,
    }


@app.get("/api/dlc/violations", tags=["Officer Actions"])
def get_dlc_violations(
    district: Optional[str] = None,
    violation_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    """DLC Magistrate view — statutory violations and land mismatches."""
    filtered = []
    for c in CLAIMS:
        flags = c.get("anomaly_flags", [])
        has_statutory = any(f["type"] == "STATUTORY_VIOLATION" for f in flags)
        has_land = any(f["type"] == "LAND_MISMATCH" for f in flags)

        if violation_type == "STATUTORY_VIOLATION" and not has_statutory:
            continue
        elif violation_type == "LAND_MISMATCH" and not has_land:
            continue
        elif not violation_type and not (has_statutory or has_land):
            continue

        filtered.append(c)

    if district:
        filtered = [c for c in filtered if c["district"] == district]

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    page_claims = filtered[start:end]

    results = []
    for c in page_claims:
        current_days = 0
        for h in c.get("stage_history", []):
            if h.get("completed_at") is None:
                current_days = h.get("days_in_stage", 0)
                break

        flags = c.get("anomaly_flags", [])
        max_severity = "MEDIUM"
        for f in flags:
            if f["severity"] == "CRITICAL":
                max_severity = "CRITICAL"
            elif f["severity"] == "HIGH" and max_severity != "CRITICAL":
                max_severity = "HIGH"

        results.append({
            "claim_id": c["claim_id"],
            "applicant_name": c["applicant_name"],
            "district": c["district"],
            "state": c["state"],
            "current_status": c["current_status"],
            "current_stage": c["current_stage"],
            "filed_date": c["filed_date"],
            "claimed_area_ha": c["claimed_area_ha"],
            "recorded_area_ha": c["recorded_area_ha"],
            "area_mismatch_pct": c["area_mismatch_pct"],
            "days_in_current_stage": current_days,
            "severity": max_severity,
            "land_mismatch_root_cause": c.get("land_mismatch_root_cause"),
            "anomaly_flags": flags,
            "anomaly_types": [f["type"] for f in flags],
        })

    # Aggregate counts
    stat_count = sum(
        1 for c in filtered
        if any(f["type"] == "STATUTORY_VIOLATION" for f in c.get("anomaly_flags", []))
    )
    land_count = sum(
        1 for c in filtered
        if any(f["type"] == "LAND_MISMATCH" for f in c.get("anomaly_flags", []))
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "stats": {
            "statutory_violations": stat_count,
            "land_mismatches": land_count,
        },
        "claims": results,
    }


@app.get("/api/state/matrix", tags=["Dashboard"])
def get_state_matrix(state: Optional[str] = None):
    """State Tribal Secretary — district matrix with capacity data."""
    target_districts = DISTRICTS
    if state:
        target_districts = [d for d in DISTRICTS if d["state"] == state]

    matrix = []
    for ds in target_districts:
        pending = ds["pending"]
        avg_monthly_clearance = max(1, int(ds["total_claims"] * 0.02))  # Estimated
        if ds.get("anomaly", {}).get("anomaly_class") == "SYSTEMIC":
            avg_monthly_clearance = max(1, int(avg_monthly_clearance * 0.4))

        months_to_clear = round(pending / avg_monthly_clearance, 1) if avg_monthly_clearance > 0 else 999
        required_rate_6mo = round(pending / 6, 0) if pending > 0 else 0
        required_rate_12mo = round(pending / 12, 0) if pending > 0 else 0
        current_sittings_per_month = 2 if ds.get("anomaly", {}).get("anomaly_class") != "SYSTEMIC" else 1
        required_sittings_6mo = max(current_sittings_per_month, int(required_rate_6mo / max(1, avg_monthly_clearance) * current_sittings_per_month))

        matrix.append({
            "district": ds["district"],
            "state": ds["state"],
            "total_claims": ds["total_claims"],
            "pending": pending,
            "approved": ds["approved"],
            "rejected": ds["rejected"],
            "settlement_pct": ds["settlement_pct"],
            "at_stage1": ds["at_stage1"],
            "at_stage2": ds["at_stage2"],
            "at_stage3": ds["at_stage3"],
            "avg_stage2_days": ds["avg_stage2_days"],
            "statutory_violations": ds["statutory_violations"],
            "land_mismatches": ds["land_mismatches"],
            "land_mismatch_pct": ds["land_mismatch_pct"],
            "anomaly_class": ds.get("anomaly", {}).get("anomaly_class", "UNKNOWN"),
            "anomaly_score": ds.get("anomaly", {}).get("anomaly_score", 0),
            "bottleneck_stage": ds.get("anomaly", {}).get("bottleneck_stage", "UNKNOWN"),
            "capacity": {
                "avg_monthly_clearance": avg_monthly_clearance,
                "months_to_clear_at_current_rate": months_to_clear,
                "required_rate_6mo": required_rate_6mo,
                "required_rate_12mo": required_rate_12mo,
                "current_sittings_per_month": current_sittings_per_month,
                "required_sittings_6mo": required_sittings_6mo,
            },
        })

    matrix.sort(key=lambda x: x["anomaly_score"], reverse=True)

    # State-level totals
    total_claims = sum(d["total_claims"] for d in matrix)
    total_pending = sum(d["pending"] for d in matrix)
    total_approved = sum(d["approved"] for d in matrix)
    total_violations = sum(d["statutory_violations"] for d in matrix)
    systemic_count = sum(1 for d in matrix if d["anomaly_class"] == "SYSTEMIC")

    return {
        "districts": matrix,
        "totals": {
            "total_claims": total_claims,
            "total_pending": total_pending,
            "total_approved": total_approved,
            "settlement_pct": round(total_approved / total_claims * 100, 1) if total_claims > 0 else 0,
            "statutory_violations": total_violations,
            "systemic_districts": systemic_count,
            "district_count": len(matrix),
        },
    }


# ─── Run ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

