"""
VANTARA — Anomaly Engine
Deterministic anomaly detection for FRA claims.
Flags statutory violations and land record mismatches.
Computes peer-corrected anomaly scores per district.
"""

from datetime import datetime

# FRA Rules 2008, Rule 12 — Statutory limits
SDLC_STATUTORY_LIMIT_DAYS = 60
DLC_STATUTORY_LIMIT_DAYS = 60
TOTAL_PIPELINE_LIMIT_DAYS = 120
LAND_MISMATCH_THRESHOLD_PCT = 10.0


def flag_claim_anomalies(claim: dict) -> list[dict]:
    """Run deterministic anomaly checks on a single claim. Returns list of flags."""
    flags = []

    # ── Flag 1: SDLC Statutory Violation ──
    if claim["current_stage"] == "SDLC":
        for h in claim["stage_history"]:
            if h["stage"] == "SDLC" and h["completed_at"] is None:
                if h["days_in_stage"] > SDLC_STATUTORY_LIMIT_DAYS:
                    flags.append({
                        "type": "STATUTORY_VIOLATION",
                        "severity": "CRITICAL" if h["days_in_stage"] > 180 else "HIGH",
                        "stage": "SDLC",
                        "days_in_stage": h["days_in_stage"],
                        "statutory_limit": SDLC_STATUTORY_LIMIT_DAYS,
                        "days_over": h["days_in_stage"] - SDLC_STATUTORY_LIMIT_DAYS,
                        "description": f"Claim has been at SDLC stage for {h['days_in_stage']} days — exceeds the 60-day statutory limit by {h['days_in_stage'] - SDLC_STATUTORY_LIMIT_DAYS} days (FRA Rules 2008, Rule 12(2)).",
                    })

    # ── Flag 2: DLC Statutory Violation ──
    if claim["current_stage"] == "DLC":
        for h in claim["stage_history"]:
            if h["stage"] == "DLC" and h["completed_at"] is None:
                if h["days_in_stage"] > DLC_STATUTORY_LIMIT_DAYS:
                    flags.append({
                        "type": "STATUTORY_VIOLATION",
                        "severity": "CRITICAL" if h["days_in_stage"] > 180 else "HIGH",
                        "stage": "DLC",
                        "days_in_stage": h["days_in_stage"],
                        "statutory_limit": DLC_STATUTORY_LIMIT_DAYS,
                        "days_over": h["days_in_stage"] - DLC_STATUTORY_LIMIT_DAYS,
                        "description": f"Claim has been at DLC stage for {h['days_in_stage']} days — exceeds the 60-day statutory limit by {h['days_in_stage'] - DLC_STATUTORY_LIMIT_DAYS} days (FRA Rules 2008, Rule 12(3)).",
                    })

    # ── Flag 3: Land Area Mismatch ──
    if claim["area_mismatch_pct"] > LAND_MISMATCH_THRESHOLD_PCT:
        flags.append({
            "type": "LAND_MISMATCH",
            "severity": "HIGH" if claim["area_mismatch_pct"] > 20 else "MEDIUM",
            "claimed_area": claim["claimed_area_ha"],
            "recorded_area": claim["recorded_area_ha"],
            "mismatch_pct": claim["area_mismatch_pct"],
            "description": f"Claimed area ({claim['claimed_area_ha']} ha) differs from recorded area ({claim['recorded_area_ha']} ha) by {claim['area_mismatch_pct']}% — exceeds the 10% threshold, suggesting a Revenue/Forest department record conflict.",
        })

    # ── Flag 4: Incomplete Record ──
    missing = []
    if claim.get("missing_survey_number"):
        missing.append("survey/khasra number")
    if claim.get("missing_gps"):
        missing.append("GPS coordinates")
    if missing:
        flags.append({
            "type": "INCOMPLETE_RECORD",
            "severity": "MEDIUM",
            "missing_fields": missing,
            "description": f"Claim is missing: {', '.join(missing)}. Cannot be fully verified without these records.",
        })

    return flags


def compute_district_anomaly(district_summary: dict, all_summaries: list[dict]) -> dict:
    """Compute peer-corrected anomaly score for a district."""
    # Build peer cohort: districts within ±15% forest coverage and ±20% tribal population
    peers = []
    for other in all_summaries:
        if other["district"] == district_summary["district"]:
            continue
        forest_close = abs(other["forest_pct"] - district_summary["forest_pct"]) < 15
        tribal_close = abs(other["st_pct"] - district_summary["st_pct"]) < 20
        if forest_close and tribal_close:
            peers.append(other)

    if len(peers) < 2:
        # Fallback: use all districts in different states as peers
        peers = [d for d in all_summaries if d["state"] != district_summary["state"]]

    peer_rates = [p["settlement_pct"] for p in peers]
    peer_mean = sum(peer_rates) / len(peer_rates) if peer_rates else 50.0
    peer_std = (sum((r - peer_mean) ** 2 for r in peer_rates) / len(peer_rates)) ** 0.5 if peer_rates else 15.0
    peer_std = max(peer_std, 5.0)  # Floor to avoid division issues

    deviation = (district_summary["settlement_pct"] - peer_mean) / peer_std

    # Stage 2 concentration check
    pending = district_summary["pending"]
    stage2_pct = district_summary["stage2_concentration_pct"]
    is_systemic = stage2_pct > 70 and deviation < -2.0

    # Absolute threshold fallback: if settlement is critically low AND stage2 is the bottleneck,
    # flag as systemic even if peers are also failing (because peers failing together IS the signal)
    absolute_crisis = (
        district_summary["settlement_pct"] < 35
        and stage2_pct > 60
        and district_summary["avg_stage2_days"] > 300
    )
    if absolute_crisis:
        is_systemic = True

    anomaly_score = min(10.0, max(0.0, abs(deviation) * 2.0 + (3.0 if is_systemic else 0.0)))
    if deviation >= 0 and not absolute_crisis:
        anomaly_score = 0.0  # Above peer average = no anomaly

    # Absolute floor: if SDLC avg > 300 days and settlement < 40%, score at least 6
    if district_summary["avg_stage2_days"] > 300 and district_summary["settlement_pct"] < 40:
        anomaly_score = max(anomaly_score, 7.5)

    if anomaly_score >= 7.0:
        anomaly_class = "SYSTEMIC"
    elif anomaly_score >= 3.5:
        anomaly_class = "INDIVIDUAL"
    else:
        anomaly_class = "HEALTHY"

    # Identify bottleneck
    bottleneck = "SDLC" if district_summary["at_stage2"] >= district_summary["at_stage1"] and district_summary["at_stage2"] >= district_summary["at_stage3"] else (
        "DLC" if district_summary["at_stage3"] >= district_summary["at_stage1"] else "GRAM_SABHA"
    )

    return {
        "anomaly_score": round(anomaly_score, 1),
        "anomaly_class": anomaly_class,
        "deviation_std": round(deviation, 2),
        "peer_mean_pct": round(peer_mean, 1),
        "peer_count": len(peers),
        "peer_districts": [p["district"] for p in peers[:5]],
        "bottleneck_stage": bottleneck,
        "is_systemic": is_systemic,
    }


def run_anomaly_engine(claims: list[dict], district_summaries: list[dict]) -> tuple[list[dict], list[dict]]:
    """Run full anomaly detection across all claims and districts."""
    # Flag individual claims
    total_flags = 0
    for claim in claims:
        flags = flag_claim_anomalies(claim)
        claim["anomaly_flags"] = flags
        total_flags += len(flags)

    # Score districts
    for ds in district_summaries:
        ds["anomaly"] = compute_district_anomaly(ds, district_summaries)

    print(f"Anomaly engine: {total_flags} flags across {len(claims)} claims")
    return claims, district_summaries
