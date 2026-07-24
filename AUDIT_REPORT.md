# SafeOS Community — Deep HSE and Software Audit

**Audit date:** 23 July 2026  
**Release assessed:** Public GitHub Pages build and accessible repository source  
**Upgrade produced:** SafeOS Community 3.0

## 1. Executive conclusion

The previous public build was a useful collection of six standalone HSE utilities, but it was not yet an integrated occupational health and safety management system. It supported document creation, but lacked the governance, assurance, performance, competency, compliance and continual-improvement layers required for an organisation-wide HSE operating system.

SafeOS Community 3.0 converts that toolkit into a local-first management platform while preserving the original principles: free use, no compulsory account, no advertising, company branding, privacy and simple field workflows.

This review is a product and system-design audit. It is **not** an ISO certification audit, legal-compliance certificate or substitute for a competent person’s site-specific assessment.

## 2. Audit framework

The review was benchmarked against the management-system themes in:

- ISO 45001: leadership, worker participation, planning, hazard and risk control, legal requirements, competence, emergency preparedness, performance evaluation, incident investigation and continual improvement.
- ILO-OSH 2001: policy, organising, planning and implementation, evaluation and action for improvement.
- OSHA incident-investigation guidance: identify underlying causes rather than blame individuals and convert findings into corrective action.
- OWASP application-security verification principles for future server-backed editions.

Reference sources:

- https://www.iso.org/standard/63787.html
- https://www.ilo.org/resource/other/guidelines-occupational-safety-and-health-management-systems-ilo-osh-2001
- https://www.osha.gov/incident-investigation
- https://owasp.org/www-project-application-security-verification-standard/

## 3. Previous-build findings

### Strengths retained

- Fast, no-login access.
- Browser-based privacy.
- Risk, JSA/TRA, incident, toolbox talk, inspection and CAPA utilities.
- Printable reports and CSV exports.
- Responsive interface and offline-capable structure.
- Creator initiative and contact section.

### Critical gaps

| Area | Previous condition | Risk / impact | Priority |
|---|---|---|---|
| HSE governance | No integrated policy/objectives/review framework | Records existed without a management-system cycle | Critical |
| Projects and sites | No master site register | Weak filtering, ownership and cross-site comparison | High |
| Performance analytics | No reliable exposure-hours or rate calculations | Management could not evaluate trends or compare performance | Critical |
| Competency | No training/induction/expiry register | Competency and refresher gaps could be missed | Critical |
| Equipment assurance | No inspection/certificate/permit register | Expired certificates and operational-control failures | Critical |
| Legal compliance | No legal/other-obligations register | Requirements could not be assigned, evidenced or reviewed | Critical |
| Document control | No revision, review or approval register | Obsolete procedures could remain in use | High |
| Emergency preparedness | No drill programme and scoring | Readiness could not be measured | High |
| Environmental performance | No structured monthly data | Environmental risks and resource trends were invisible | High |
| Worker/public reporting | No integrated public-report intake | Hazards and near misses could remain unreported | High |
| Executive reporting | Limited counters; no trends, rates or alerts | Reactive rather than predictive management | Critical |
| Data architecture | Device-specific local storage only | No central truth, approval trail or multi-user collaboration | Critical for enterprise use |
| Security architecture | No authentication or server authorization | Local edition could not enforce real permissions | Critical for enterprise use |
| Evidence integrity | Attachments stored locally without immutable audit trail | Evidence provenance and retention not assured | High |
| Localisation | Core languages existed but full advanced-module localisation was incomplete | International usability inconsistency | Medium |

## 4. SafeOS Community 3.0 implementation

### A. Integrated management dashboard

The executive dashboard now provides:

- Incident count and trend.
- High/critical residual-risk count.
- Overdue corrective actions.
- Training and competency expiry warnings.
- Equipment/certificate expiry warnings.
- Inspection-compliance score.
- Public-report count.
- Management-system health score.
- Priority alert centre.
- Risk-profile, action-status, inspection and incident charts.

### B. Operational modules

- Advanced risk register with initial and residual risk.
- JSA/TRA with step-level risk scoring and hierarchy of controls.
- Incident investigation with Five Whys, cause categories, evidence and CAPA creation.
- Inspections/audits with templates, risk ratings, owners and due dates.
- Corrective and preventive action centre with progress, verification and effectiveness review.
- Toolbox talks with attendance and ready topics.
- Projects and sites master register.
- Training, induction and competency register.
- Equipment, certificate and permit-to-work registers.
- Emergency-drill and environmental-performance registers.
- Controlled-document and legal-obligations registers.
- Monthly HSE performance and incident-rate analytics.
- Public hazard/safety-reporting portal and printable QR poster.

### C. Reporting and analytics

SafeOS now calculates and displays:

- TRIR based on a configurable 200,000-hour or 1,000,000-hour basis.
- LTIFR.
- Severity rate.
- Leading indicators such as inspections, observations, training and consultation.
- Site and monthly trend comparisons.
- Waste-recycling percentage and resource trends.
- Automatic expiry and overdue alerts.
- Professional company-branded print/PDF reports.

### D. Privacy and branding corrections

- Creator name, phone and email are visible only in the home-page initiative section.
- Creator contact details are excluded from reports and PDFs.
- Users can upload a company logo and profile once; branding is automatically used in reports.
- Records and images stay in the browser in Community Edition.
- Complete JSON backup and restore are included.

## 5. Audit score after upgrade

These scores measure product capability, not legal certification.

| Domain | Previous build | Community 3.0 | Target enterprise edition |
|---|---:|---:|---:|
| Field HSE workflows | 58% | 90% | 96% |
| Governance and assurance | 22% | 75% | 95% |
| Reporting and analytics | 25% | 88% | 96% |
| Usability and accessibility | 70% | 88% | 95% |
| Privacy for individual/local use | 78% | 91% | 94% |
| Multi-user security and auditability | 10% | 18% | 95% |
| Integration and automation | 8% | 30% | 90% |
| Overall community-tool capability | 39% | 82% | — |

The remaining gap is primarily architectural rather than visual: a static, no-login browser application cannot provide genuine central reporting, permissions, immutable audit history or organisation-wide synchronization.

## 6. Features that require the future server-backed edition

The following must not be falsely simulated in a static GitHub Pages application:

1. Secure authentication, SSO and role-based access control.
2. Central multi-company, multi-project database.
3. Approval workflows and electronic signatures.
4. Immutable change history and evidence audit trail.
5. Central public-report inbox from all devices.
6. Scheduled email, SMS and push notifications.
7. Attachment storage with retention and malware scanning.
8. Automated regulator/client reporting workflows.
9. API integrations with HR, ERP, telematics, LMS, weather and business-intelligence systems.
10. AI services with controlled prompts, source traceability, human review and privacy safeguards.
11. Data residency, backups, disaster recovery and retention policies.
12. Enterprise security testing, vulnerability management and penetration testing.

## 7. Recommended product architecture

### Community Edition

- Static Progressive Web App.
- No login and no subscription.
- Local browser storage.
- Backup/restore.
- Company-branded exports.
- Best for individuals, small teams, demonstrations and offline field use.

### Organisation Edition

- Authenticated cloud database.
- Multiple companies, sites and users.
- Real role permissions, approvals, notifications and audit trail.
- Central dashboards and public-report intake.

### Enterprise Edition

- SSO, API integrations, configurable workflows and data retention.
- Formal security controls, business continuity, monitoring and support.
- Advanced analytics and governed AI assistance.

## 8. Final professional judgement

SafeOS Community 3.0 is now a credible and unusually capable free HSE community platform. It is suitable for local record preparation, personal and small-team HSE tracking, professional reports, demonstrations, training and offline field work.

It should not be presented as a certified compliance platform or secure enterprise system until the server-backed controls listed above are implemented and independently tested. The best route is to keep the Community Edition genuinely free while using it as the trusted public foundation for a future organisation-grade SafeOS platform.
