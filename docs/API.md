# VANTARA API Documentation

The VANTARA backend is powered by FastAPI and exposes several RESTful endpoints to power the role-based dashboards.

> **Note**: In a production environment, you can view the interactive Swagger documentation by visiting `/docs` or ReDoc at `/redoc` on the API base URL.

## Endpoints

### 📊 Dashboard & Metrics

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/dashboard/summary` | `GET` | Get aggregate counts across all claims. | `?district=String`, `?state=String` |
| `/api/state/matrix` | `GET` | Get a comprehensive overview of all districts in a state. | `?state=String` |

### 📂 Claims Management

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/claims` | `GET` | Fetch a paginated list of claims with optional filters. | `?status`, `?district`, `?state`, `?anomaly_type`, `?page`, `?page_size` |
| `/api/claims/{claim_id}` | `GET` | Get the full detail payload for a specific claim. | Path: `claim_id` |
| `/api/claims/{claim_id}/actions` | `POST` | Append an officer action/note to a claim's audit trail. | Body: `OfficerActionRequest` |

### 🗺️ Geospatial & Reference Data

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/geojson/districts` | `GET` | Fetch GeoJSON feature collection for map rendering. | None |
| `/api/states` | `GET` | Get a list of all available states. | None |
| `/api/districts` | `GET` | Get all districts across all states. | None |
| `/api/districts/{district_name}` | `GET` | Get specific district summary data. | Path: `district_name` |

### 🛂 Role-Specific Action Queues

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/sdlc/queue` | `GET` | SDLC view: Fetch claims needing field verification. | `?type`, `?district`, `?page`, `?page_size` |
| `/api/dlc/violations` | `GET` | DLC view: Fetch claims violating statutory deadlines. | `?district`, `?violation_type`, `?page`, `?page_size` |

### 🤖 AI Summaries (Placeholder)

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/ai/claim-summary/{claim_id}` | `GET` | Generate an AI summary explaining claim bottlenecks. | Path: `claim_id` |
| `/api/ai/district-summary/{district_name}` | `GET` | Generate an AI analysis of systemic district issues. | Path: `district_name` |
