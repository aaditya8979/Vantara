# Contributing to VANTARA

Thank you for your interest in contributing to VANTARA! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.11+
- **Git**

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/aaditya8979/Vantara.git
   cd Vantara
   ```

2. **Start the Backend (FastAPI)**
   ```bash
   cd api
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python _data_generator.py  # Generate synthetic dataset
   uvicorn index:app --reload --port 8000
   ```

3. **Start the Frontend (React/Vite)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

## 📝 How to Contribute

### Reporting Bugs

- Use GitHub Issues with the **Bug Report** template.
- Include: steps to reproduce, expected vs. actual behavior, browser/OS info.

### Suggesting Features

- Open a GitHub Issue with the **Feature Request** template.
- Describe the use case and how it relates to FRA enforcement.

### Submitting Code

1. **Fork** the repository.
2. Create a **feature branch**: `git checkout -b feat/your-feature`
3. Make your changes with clear commit messages.
4. Ensure all linting passes:
   ```bash
   cd frontend && npm run lint
   ```
5. Submit a **Pull Request** against `main`.

## 🏗️ Project Structure

```
├── api/                  # FastAPI serverless backend (Vercel)
│   ├── index.py          # Main API entry point
│   ├── _anomaly_engine.py # Deterministic anomaly detection
│   ├── _data_generator.py # Synthetic data generation
│   └── data/             # Generated JSON datasets
├── frontend/             # React + Vite + TypeScript
│   └── src/
│       ├── components/   # React components
│       ├── api.ts        # API client
│       └── types.ts      # TypeScript interfaces
├── docs/                 # Architecture & API documentation
└── vercel.json           # Deployment configuration
```

## 🎨 Code Style

### Python (Backend)
- Follow PEP 8 conventions.
- Add docstrings to all public functions.
- Use type hints for all function signatures.

### TypeScript (Frontend)
- Use strict TypeScript — no `any` types.
- Add JSDoc comments to exported functions.
- Use the shared interfaces from `types.ts`.

## 📜 Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New features
- `fix:` — Bug fixes
- `docs:` — Documentation changes
- `refactor:` — Code refactoring
- `build:` — Build system / dependency changes
- `ci:` — CI/CD configuration

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
