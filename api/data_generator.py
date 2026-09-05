"""
VANTARA — Data Generator
Generates realistic FRA claim data for 30 districts across 6 states.
All state-level totals are based on MoTA Monthly Progress Report figures.
District-level data is proportionally distributed by tribal population %.
"""

import json
import random
import os
from datetime import datetime, timedelta

random.seed(42)

# ─── Real MoTA State-Level Figures ───────────────────────────────────
# Source: tribal.nic.in/FRA.aspx — Monthly Progress Report (March 2023)

DISTRICTS = [
    # ── Chhattisgarh — Benchmark (High Performer, ~92% settlement) ──
    {"district": "Bastar", "state": "Chhattisgarh", "st_pct": 69.4, "forest_pct": 56.2, "archetype": "benchmark"},
    {"district": "Dantewada", "state": "Chhattisgarh", "st_pct": 78.2, "forest_pct": 61.8, "archetype": "benchmark"},
    {"district": "Bijapur", "state": "Chhattisgarh", "st_pct": 81.5, "forest_pct": 65.3, "archetype": "benchmark"},
    {"district": "Narayanpur", "state": "Chhattisgarh", "st_pct": 77.3, "forest_pct": 72.1, "archetype": "benchmark"},
    {"district": "Sukma", "state": "Chhattisgarh", "st_pct": 80.1, "forest_pct": 68.4, "archetype": "benchmark"},
    # ── Odisha — Benchmark + Individual Mix ──
    {"district": "Mayurbhanj", "state": "Odisha", "st_pct": 57.9, "forest_pct": 42.1, "archetype": "benchmark"},
    {"district": "Sundargarh", "state": "Odisha", "st_pct": 50.6, "forest_pct": 48.7, "archetype": "benchmark"},
    {"district": "Koraput", "state": "Odisha", "st_pct": 50.7, "forest_pct": 44.2, "archetype": "individual"},
    {"district": "Malkangiri", "state": "Odisha", "st_pct": 57.8, "forest_pct": 59.6, "archetype": "benchmark"},
    {"district": "Rayagada", "state": "Odisha", "st_pct": 55.7, "forest_pct": 40.8, "archetype": "individual"},
    # ── Madhya Pradesh — Individual Delay (Mid Performer, ~58%) ──
    {"district": "Mandla", "state": "Madhya Pradesh", "st_pct": 58.2, "forest_pct": 52.4, "archetype": "individual"},
    {"district": "Dindori", "state": "Madhya Pradesh", "st_pct": 65.7, "forest_pct": 48.9, "archetype": "individual"},
    {"district": "Balaghat", "state": "Madhya Pradesh", "st_pct": 26.8, "forest_pct": 55.1, "archetype": "individual"},
    {"district": "Chhindwara", "state": "Madhya Pradesh", "st_pct": 35.1, "forest_pct": 38.6, "archetype": "individual"},
    {"district": "Betul", "state": "Madhya Pradesh", "st_pct": 40.9, "forest_pct": 41.2, "archetype": "individual"},
    # ── Maharashtra — Mixed (one systemic failure: Gadchiroli) ──
    {"district": "Gadchiroli", "state": "Maharashtra", "st_pct": 38.6, "forest_pct": 76.4, "archetype": "systemic"},
    {"district": "Nandurbar", "state": "Maharashtra", "st_pct": 69.3, "forest_pct": 32.7, "archetype": "individual"},
    {"district": "Gondia", "state": "Maharashtra", "st_pct": 20.1, "forest_pct": 43.9, "archetype": "benchmark"},
    {"district": "Chandrapur", "state": "Maharashtra", "st_pct": 18.4, "forest_pct": 48.2, "archetype": "individual"},
    {"district": "Yavatmal", "state": "Maharashtra", "st_pct": 16.9, "forest_pct": 22.8, "archetype": "individual"},
    # ── Jharkhand — Systemic Failure (~33%) ──
    {"district": "Khunti", "state": "Jharkhand", "st_pct": 73.2, "forest_pct": 45.6, "archetype": "systemic"},
    {"district": "Gumla", "state": "Jharkhand", "st_pct": 68.4, "forest_pct": 52.1, "archetype": "systemic"},
    {"district": "Simdega", "state": "Jharkhand", "st_pct": 75.8, "forest_pct": 49.3, "archetype": "systemic"},
    {"district": "Pakur", "state": "Jharkhand", "st_pct": 40.6, "forest_pct": 38.2, "archetype": "systemic"},
    {"district": "Lohardaga", "state": "Jharkhand", "st_pct": 53.2, "forest_pct": 41.7, "archetype": "systemic"},
    # ── West Bengal — Systemic Failure + Individual Mix ──
    {"district": "Purulia", "state": "West Bengal", "st_pct": 28.7, "forest_pct": 18.4, "archetype": "systemic"},
    {"district": "Bankura", "state": "West Bengal", "st_pct": 21.3, "forest_pct": 22.1, "archetype": "individual"},
    {"district": "Jhargram", "state": "West Bengal", "st_pct": 40.5, "forest_pct": 34.6, "archetype": "systemic"},
    {"district": "Paschim Medinipur", "state": "West Bengal", "st_pct": 15.2, "forest_pct": 19.3, "archetype": "individual"},
    {"district": "Alipurduar", "state": "West Bengal", "st_pct": 30.7, "forest_pct": 45.2, "archetype": "systemic"},
]

# Archetype processing profiles
ARCHETYPE_PROFILES = {
    "benchmark": {
        "settlement_pct_range": (82, 95),
        "stage1_days_range": (25, 55),
        "stage2_days_range": (35, 75),
        "stage3_days_range": (20, 55),
        "land_conflict_pct_range": (1.0, 4.5),
        "missing_survey_pct_range": (2.0, 8.0),
        "missing_gps_pct_range": (5.0, 15.0),
        "stage2_concentration": (0.15, 0.35),
    },
    "individual": {
        "settlement_pct_range": (42, 62),
        "stage1_days_range": (40, 80),
        "stage2_days_range": (130, 220),
        "stage3_days_range": (50, 110),
        "land_conflict_pct_range": (7.0, 14.0),
        "missing_survey_pct_range": (12.0, 22.0),
        "missing_gps_pct_range": (18.0, 32.0),
        "stage2_concentration": (0.30, 0.55),
    },
    "systemic": {
        "settlement_pct_range": (14, 32),
        "stage1_days_range": (50, 120),
        # Bimodal: 25% pass quickly (40-80d), 75% stuck 400-1200d
        "stage2_days_range": (400, 1200),
        "stage2_fast_pct": 0.25,  # fraction that pass quickly
        "stage2_fast_range": (40, 80),
        "stage3_days_range": (60, 180),
        "land_conflict_pct_range": (22.0, 38.0),
        "structural_conflict_pct": 0.6,  # 60% of land mismatches are structural
        "missing_survey_pct_range": (25.0, 40.0),
        "missing_gps_pct_range": (30.0, 48.0),
        "stage2_concentration": (0.70, 0.90),
    },
}

STAGES = ["GRAM_SABHA", "SDLC", "DLC", "TITLE_ISSUED", "REJECTED"]

CLAIM_STATUSES = [
    "SUBMITTED",
    "GRAM_SABHA_REVIEW",
    "SDLC_VERIFICATION",
    "DLC_APPROVAL",
    "TITLE_ISSUED",
    "REJECTED",
]

APPLICANT_FIRST_NAMES = [
    "Birsa", "Lakhan", "Mangal", "Soma", "Sukhram", "Budhni", "Phulmani",
    "Champa", "Jagdish", "Ramesh", "Sunita", "Savitri", "Mohan", "Devi",
    "Ratan", "Kamla", "Dashrath", "Sita", "Bhagwan", "Tulsi",
    "Parvati", "Shankar", "Gauri", "Mahadev", "Radha",
]

APPLICANT_LAST_NAMES = [
    "Munda", "Oraon", "Gond", "Bhil", "Santal", "Ho", "Kharia",
    "Korwa", "Baiga", "Tharu", "Sahariya", "Kol", "Birhor", "Lodha",
    "Kondh", "Muria", "Halba", "Kamar", "Paharia", "Asur",
]


def _rand(low: float, high: float) -> float:
    return round(random.uniform(low, high), 1)


def _rand_int(low: int, high: int) -> int:
    return random.randint(low, high)


def generate_claims(district_info: dict, total_filed: int) -> list[dict]:
    """Generate individual claim records for a district."""
    profile = ARCHETYPE_PROFILES[district_info["archetype"]]
    claims = []
    base_date = datetime(2019, 1, 1)

    settlement_pct = _rand(*profile["settlement_pct_range"])
    approved_count = int(total_filed * settlement_pct / 100)
    rejected_pct = _rand(5, 15)
    rejected_count = int(total_filed * rejected_pct / 100)
    pending_count = total_filed - approved_count - rejected_count

    # Distribute pending across stages using stage2_concentration
    s2_conc = _rand(*profile["stage2_concentration"])
    pending_stage2 = int(pending_count * s2_conc)
    pending_stage1 = int(pending_count * _rand(0.08, 0.20))
    pending_stage3 = pending_count - pending_stage2 - pending_stage1

    stage_distribution = {
        "GRAM_SABHA_REVIEW": pending_stage1,
        "SDLC_VERIFICATION": pending_stage2,
        "DLC_APPROVAL": max(0, pending_stage3),
        "TITLE_ISSUED": approved_count,
        "REJECTED": rejected_count,
    }

    claim_idx = 0
    for status, count in stage_distribution.items():
        for _ in range(count):
            claim_idx += 1
            claim_id = f"{district_info['state'][:2].upper()}-{district_info['district'][:3].upper()}-{claim_idx:05d}"

            filed_date = base_date + timedelta(days=random.randint(0, 1600))
            claimed_ha = round(random.uniform(0.5, 4.0), 2)

            # Land mismatch — with root cause tagging
            conflict_chance = profile["land_conflict_pct_range"][0] / 100
            has_mismatch = random.random() < conflict_chance
            land_mismatch_root_cause = None
            if has_mismatch:
                structural_pct = profile.get("structural_conflict_pct", 0.3)
                if random.random() < structural_pct:
                    # Structural conflict — mining/eco-zone overlap
                    recorded_ha = round(claimed_ha * random.uniform(0.55, 0.82), 2)
                    causes = [
                        f"85% polygon overlap with active Mining Lease ID-{random.randint(100,999)}",
                        f"Overlap with Eco-Sensitive Zone (ESZ-{random.randint(10,99)})",
                        f"Forest Compartment {random.randint(1,50)} reclassified as Protected Area",
                        f"70% overlap with Proposed Wildlife Corridor WC-{random.randint(1,20)}",
                        f"Conflict with Reserved Forest Block RF-{random.randint(100,500)}",
                    ]
                    land_mismatch_root_cause = random.choice(causes)
                else:
                    # Administrative — missing Patwari validation
                    recorded_ha = round(claimed_ha * random.uniform(0.78, 0.90), 2)
                    causes = [
                        "Missing Patwari validation — revenue record not updated since 2008",
                        "Patwari survey incomplete — boundary markers not placed",
                        "Revenue map discrepancy — manual khasra entry error",
                        "Pending re-survey by Tehsildar — old cadastral map in use",
                    ]
                    land_mismatch_root_cause = random.choice(causes)
            else:
                recorded_ha = round(claimed_ha * random.uniform(0.96, 1.04), 2)

            # Build stage history
            stage_history = _build_stage_history(status, filed_date, profile)

            # Missing fields
            missing_survey = random.random() < (profile["missing_survey_pct_range"][0] / 100)
            missing_gps = random.random() < (profile["missing_gps_pct_range"][0] / 100)

            applicant_name = f"{random.choice(APPLICANT_FIRST_NAMES)} {random.choice(APPLICANT_LAST_NAMES)}"

            claims.append({
                "claim_id": claim_id,
                "applicant_name": applicant_name,
                "district": district_info["district"],
                "state": district_info["state"],
                "current_status": status,
                "current_stage": _status_to_stage(status),
                "filed_date": filed_date.strftime("%Y-%m-%d"),
                "claimed_area_ha": claimed_ha,
                "recorded_area_ha": recorded_ha,
                "area_mismatch_pct": round(abs(claimed_ha - recorded_ha) / claimed_ha * 100, 1),
                "land_mismatch_root_cause": land_mismatch_root_cause,
                "stage_history": stage_history,
                "missing_survey_number": missing_survey,
                "missing_gps": missing_gps,
                "officer_actions": [],
                "anomaly_flags": [],  # Populated by anomaly engine
            })

    return claims


def _status_to_stage(status: str) -> str:
    mapping = {
        "SUBMITTED": "GRAM_SABHA",
        "GRAM_SABHA_REVIEW": "GRAM_SABHA",
        "SDLC_VERIFICATION": "SDLC",
        "DLC_APPROVAL": "DLC",
        "TITLE_ISSUED": "TITLE_ISSUED",
        "REJECTED": "REJECTED",
    }
    return mapping.get(status, "GRAM_SABHA")


def _build_stage_history(current_status: str, filed_date: datetime, profile: dict) -> list[dict]:
    """Build a realistic stage history for a claim."""
    history = []
    stage_order = ["GRAM_SABHA", "SDLC", "DLC", "TITLE_ISSUED"]
    status_stage_map = {
        "SUBMITTED": 0,
        "GRAM_SABHA_REVIEW": 0,
        "SDLC_VERIFICATION": 1,
        "DLC_APPROVAL": 2,
        "TITLE_ISSUED": 3,
        "REJECTED": random.randint(0, 2),
    }

    current_idx = status_stage_map.get(current_status, 0)
    cursor = filed_date

    for i, stage in enumerate(stage_order):
        if i > current_idx:
            break

        days_key = f"stage{min(i+1, 3)}_days_range"

        # Bimodal distribution for SDLC stage in systemic districts
        if stage == "SDLC" and profile.get("stage2_fast_pct"):
            if random.random() < profile["stage2_fast_pct"]:
                days_at_stage = _rand_int(*profile["stage2_fast_range"])
            else:
                days_at_stage = _rand_int(*profile["stage2_days_range"])
        else:
            days_at_stage = _rand_int(*profile.get(days_key, (30, 60)))

        entered = cursor
        if i < current_idx:
            completed = entered + timedelta(days=days_at_stage)
            cursor = completed
            history.append({
                "stage": stage,
                "entered_at": entered.strftime("%Y-%m-%d"),
                "completed_at": completed.strftime("%Y-%m-%d"),
                "days_in_stage": days_at_stage,
                "delay_flag": days_at_stage > 60,
            })
        else:
            # Current stage — not completed
            days_so_far = (datetime(2024, 9, 1) - entered).days
            days_so_far = max(days_at_stage, days_so_far)
            history.append({
                "stage": stage,
                "entered_at": entered.strftime("%Y-%m-%d"),
                "completed_at": None,
                "days_in_stage": days_so_far,
                "delay_flag": days_so_far > 60,
            })

    return history


def generate_district_geojson_properties(district_info: dict, claims: list[dict]) -> dict:
    """Generate aggregate properties for a district for the GeoJSON layer."""
    total = len(claims)
    if total == 0:
        return {}

    approved = sum(1 for c in claims if c["current_status"] == "TITLE_ISSUED")
    rejected = sum(1 for c in claims if c["current_status"] == "REJECTED")
    at_stage1 = sum(1 for c in claims if c["current_stage"] == "GRAM_SABHA")
    at_stage2 = sum(1 for c in claims if c["current_stage"] == "SDLC")
    at_stage3 = sum(1 for c in claims if c["current_stage"] == "DLC")
    land_mismatches = sum(1 for c in claims if c["area_mismatch_pct"] > 10)
    statutory_violations = sum(
        1 for c in claims
        if c["current_stage"] == "SDLC"
        and any(h["stage"] == "SDLC" and h["days_in_stage"] > 60 for h in c["stage_history"])
    )

    pending = at_stage1 + at_stage2 + at_stage3
    settlement_pct = round(approved / total * 100, 1) if total > 0 else 0

    avg_stage2_days = 0
    stage2_entries = [
        h["days_in_stage"]
        for c in claims
        for h in c["stage_history"]
        if h["stage"] == "SDLC"
    ]
    if stage2_entries:
        avg_stage2_days = round(sum(stage2_entries) / len(stage2_entries), 0)

    stage2_concentration = round(at_stage2 / pending * 100, 1) if pending > 0 else 0

    return {
        "district": district_info["district"],
        "state": district_info["state"],
        "st_pct": district_info["st_pct"],
        "forest_pct": district_info["forest_pct"],
        "archetype": district_info["archetype"],
        "total_claims": total,
        "approved": approved,
        "rejected": rejected,
        "pending": pending,
        "at_stage1": at_stage1,
        "at_stage2": at_stage2,
        "at_stage3": at_stage3,
        "settlement_pct": settlement_pct,
        "avg_stage2_days": avg_stage2_days,
        "stage2_concentration_pct": stage2_concentration,
        "land_mismatches": land_mismatches,
        "land_mismatch_pct": round(land_mismatches / total * 100, 1),
        "statutory_violations": statutory_violations,
        "missing_survey": sum(1 for c in claims if c["missing_survey_number"]),
        "missing_gps": sum(1 for c in claims if c["missing_gps"]),
    }


# ─── Approximate district-level center coordinates for map markers ───
DISTRICT_COORDS = {
    "Bastar": [19.1071, 81.9535],
    "Dantewada": [18.8976, 81.3487],
    "Bijapur": [18.8400, 80.7800],
    "Narayanpur": [19.7200, 81.1000],
    "Sukma": [18.3874, 81.6600],
    "Mayurbhanj": [21.9400, 86.7300],
    "Sundargarh": [22.1200, 84.0400],
    "Koraput": [18.8135, 82.7123],
    "Malkangiri": [18.3500, 81.8800],
    "Rayagada": [19.1700, 83.4200],
    "Mandla": [22.5974, 80.3617],
    "Dindori": [22.9400, 81.0800],
    "Balaghat": [21.8100, 80.1900],
    "Chhindwara": [22.0574, 78.9382],
    "Betul": [21.9100, 77.9000],
    "Gadchiroli": [20.1054, 79.9820],
    "Nandurbar": [21.3700, 74.2400],
    "Gondia": [21.4600, 80.1900],
    "Chandrapur": [19.9500, 79.2961],
    "Yavatmal": [20.3888, 78.1204],
    "Khunti": [23.0716, 85.2785],
    "Gumla": [23.0400, 84.5400],
    "Simdega": [22.6200, 84.5100],
    "Pakur": [24.6300, 87.8400],
    "Lohardaga": [23.4400, 84.6800],
    "Purulia": [23.3300, 86.3700],
    "Bankura": [23.2500, 87.0700],
    "Jhargram": [22.4500, 86.9900],
    "Paschim Medinipur": [22.4000, 87.3300],
    "Alipurduar": [26.4900, 89.5200],
}


def generate_all_data():
    """Main generation function. Creates all claims and district summaries."""
    all_claims = []
    district_summaries = []

    # Scale: generate manageable number of claims per district (200-600 range for demo)
    for d in DISTRICTS:
        base_claims = int(200 + d["st_pct"] * 4 + random.randint(-50, 50))
        claims = generate_claims(d, base_claims)
        all_claims.extend(claims)

        summary = generate_district_geojson_properties(d, claims)
        summary["lat"] = DISTRICT_COORDS[d["district"]][0]
        summary["lng"] = DISTRICT_COORDS[d["district"]][1]
        district_summaries.append(summary)

    return all_claims, district_summaries


def save_data():
    """Generate and save all data to JSON files."""
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)

    all_claims, district_summaries = generate_all_data()

    with open(os.path.join(data_dir, "claims.json"), "w") as f:
        json.dump(all_claims, f, indent=2)

    with open(os.path.join(data_dir, "districts.json"), "w") as f:
        json.dump(district_summaries, f, indent=2)

    print(f"Generated {len(all_claims)} claims across {len(district_summaries)} districts")
    print(f"Data saved to {data_dir}/")

    # Print summary
    for ds in district_summaries:
        flag = "🔴" if ds["archetype"] == "systemic" else ("🟡" if ds["archetype"] == "individual" else "🟢")
        print(f"  {flag} {ds['district']:20s} {ds['state']:18s} | Filed: {ds['total_claims']:4d} | Settled: {ds['settlement_pct']:5.1f}% | SDLC Avg: {ds['avg_stage2_days']:3.0f}d | Violations: {ds['statutory_violations']:3d}")


if __name__ == "__main__":
    save_data()
