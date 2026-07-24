# SafeOS Architecture Roadmap

## Phase 1 — Community 3.0 (included)

- Static Progressive Web App
- Local browser database model
- Offline capability
- HSE registers, reports, charts and exports
- Company logo and profile
- QR public-report preparation
- Complete local backup and restore

## Phase 2 — Community hardening

- Full translation of every advanced module
- IndexedDB migration for larger evidence files
- WCAG 2.2 accessibility review
- Automated unit, browser and print-layout tests
- Configurable risk matrices and company templates
- Import validation and encrypted local backups
- Contribution guide, licence and release process

## Phase 3 — Organisation Edition

Recommended architecture:

- Front end: TypeScript with a maintained component framework
- API: versioned REST or GraphQL service
- Database: PostgreSQL with tenant isolation and row-level security
- Object storage: encrypted evidence/attachment storage
- Authentication: OIDC/SAML-ready identity service and MFA
- Jobs: background queue for alerts, exports and scheduled reports
- Audit: append-only change/event log
- Reporting: server-generated PDF and controlled templates
- Notifications: email, push and optional SMS

Core organisation functions:

- Real users, roles and permissions
- Company/site hierarchy
- Review and approval workflows
- Central hazard-report inbox
- Mobile evidence upload
- Corrective-action escalation
- Dashboards across sites
- Controlled master data and retention

## Phase 4 — Enterprise and governed AI

- SSO and directory synchronization
- HR, ERP, telematics, LMS and BI integrations
- Data-residency controls and regional hosting
- Disaster recovery, monitoring and service-level objectives
- Configurable legal registers and authority workflows
- AI incident-summary and investigation assistant with human approval
- AI hazard suggestions grounded in approved company procedures
- Duplicate-event detection and leading-risk signals
- Multilingual speech-to-report with consent and privacy controls

## Security gates before enterprise release

- Threat model and privacy impact assessment
- Secure software-development lifecycle
- OWASP ASVS-based verification
- Dependency and secret scanning
- Independent penetration test
- Backup/restore and disaster-recovery tests
- Audit-log integrity testing
- Role/tenant-isolation tests
- Incident-response plan

## Product principle

Keep common HSE tools free and frictionless. Charge organisations only for the infrastructure-heavy functions—central storage, users, approvals, integrations, notifications, governed AI, support and enterprise assurance.
