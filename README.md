# 🌳 VANTARA

**Verified Anomaly Navigation & Tracking for Adivasi Rights Administration**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

VANTARA is an operational intelligence platform designed for government officials to monitor, enforce, and clear bottlenecks in the implementation of the **Forest Rights Act (FRA), 2006**. 

Built with strict adherence to Indian Government (NIC) digital standards, VANTARA moves beyond simple dashboards to provide an **asymmetric, role-based resolution engine** tailored to the specific legal powers of different government tiers.

## ✨ Core Features: Asymmetric Role-Based Architecture

Rather than showing the same generic data to everyone, VANTARA provides specialized tools for each level of administration:

### 1. SDLC Field Officer (Administrative Resolution)
*Focus: Processing incomplete records and field verification.*
- **Batch Execution Engine**: Instantly filters thousands of claims missing basic fields (Survey Numbers, GPS Coordinates).
- **Automated Manifests**: Select multiple claims to auto-generate printable Patwari Survey Batches and Gram Sabha GPS Checklists.
- **High-Density Data**: Clean, tabular interface built for high-throughput batch processing without map distractions.

### 2. District Magistrate / DLC (Legal Enforcement)
*Focus: Enforcing statutory deadlines and resolving structural land conflicts.*
- **Geospatial Tracking**: Dedicated Leaflet map locked to the district, highlighting hotspots of statutory violations and land mismatches.
- **Priority Action Queue**: Identifies claims stuck beyond the 60-day statutory limit or facing severe land area discrepancies (e.g., Mining Lease overlaps).
- **One-Click Legal Directives**: Auto-generates official, printable **Rule 12(2) Compliance Mandates** and **Joint Cadastral Inspection Orders**.

### 3. State Tribal Secretary (Resource Allocation)
*Focus: Macro-strategy, capacity building, and identifying systemic failures.*
- **District Performance Matrix**: Ranks districts not just by pending claims, but by an AI-driven **Anomaly Score** identifying systemic vs. individual bottlenecks.
- **SDLC Clearance Calculator**: A dynamic tool where the Secretary sets a "Target Clearance" timeline (e.g., 6 months). The system mathematically outputs the required claims-processed-per-month rate and prescribes the exact number of Special SDLC Sittings needed to clear the backlog.

---

## 🔬 Realistic Synthetic Data Engine

VANTARA is powered by a highly sophisticated Python data generator that accurately models the grim realities of bureaucratic stagnation:
- **Bimodal Variance**: Simulates real-world delays where some claims pass in 40 days, while others in systemic failure districts (e.g., Khunti, Pakur) are stuck for 1,000+ days.
- **Root Cause Tagging**: Land mismatches aren't just flagged; they are dynamically assigned structural root causes (*"85% polygon overlap with active Mining Lease"* or *"Conflict with Reserved Forest Block"*) versus administrative errors (*"Missing Patwari validation"*).
- **Geospatial Correlation**: 12,000+ synthetic claims are intelligently mapped to 30 real districts across 6 states based on actual Ministry of Tribal Affairs (MoTA) tribal population demographics.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Leaflet (WebGIS)
- **Backend**: Python 3.13, FastAPI
- **Data**: Deterministic synthetic dataset (JSON/SQLite) simulating 12,000+ FRA claims.

## 🛠️ Local Setup & Development

### Prerequisites
- Node.js (v18+)
- Python (3.11+)

### 1. Start the Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Generate the realistic synthetic dataset (~12,000 claims)
python data_generator.py

# Run the server
python main.py
```
*The backend will run on `http://localhost:8000`*

### 2. Start the Frontend (React/Vite)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`*

---

## 🎨 Design Philosophy
VANTARA strictly adheres to NIC (National Informatics Centre) layout standards:
- **High-Contrast Light Theme**: Built for readability in brightly lit government offices (`bg-gray-50`, `bg-white` cards).
- **Official Muted Colors**: Navy headers (`#1e3a5f`), standard flat pill badges.
- **Zero Dead Code**: Every button, filter, and modal is fully wired end-to-end to the FastAPI backend.

---
*Built for the Adivasi Rights Administration Hackathon.*
