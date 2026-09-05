# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | ✅ Yes             |

## Reporting a Vulnerability

If you discover a security vulnerability within VANTARA, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub Issue for security vulnerabilities.
2. Email **vantara.security@example.com** with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Resolution**: Dependent on severity

### Scope

This security policy covers:

- **API endpoints** (`api/index.py`) — injection, unauthorized access
- **Data integrity** — synthetic data generation accuracy
- **Frontend** — XSS, CSRF, client-side vulnerabilities
- **Dependencies** — known CVEs in npm/pip packages

### Important Notes

- VANTARA uses **synthetic data only** — no real personal data is stored or processed.
- The API is stateless and does not persist user sessions or credentials.
- All data is regenerated deterministically from the data generator on each cold start.

## Security Best Practices

When contributing, please ensure:

- No hardcoded secrets, API keys, or credentials in source code
- Dependencies are kept up-to-date (`npm audit`, `pip audit`)
- Input validation is applied to all API query parameters
- CORS is properly configured for production deployments
