# SafeOS Community 4 — Development Branch

> This branch is a staging build. It must not replace the production `main` branch until multilingual, PDF, QR, mobile and security verification is complete.

# SafeOS Community 3.0

SafeOS Community is a free, no-login, no-ads, local-first HSE management web application. It combines practical field tools with management dashboards, compliance registers and performance analytics.

## Included modules

- Executive HSE dashboard and priority alerts
- Projects and sites
- Risk register
- JSA / TRA builder
- Incident investigation
- Inspections and audits
- Corrective and preventive action centre
- Toolbox talks and attendance
- Training, induction and competency
- Equipment, certification and permit-to-work registers
- Emergency drills and environmental performance
- Controlled documents and legal/other obligations
- HSE performance analytics and incident rates
- Public hazard/safety reporting with QR poster
- Company branding, PDF/print output, CSV export and JSON backup

## Privacy and data model

Community Edition stores records, logos and images in the user’s browser. It has no backend, account, analytics service or advertising. Records do not automatically synchronize across devices. Export regular JSON backups from **Settings & Data**.

## Creator attribution

The home page contains the free initiative attribution and contact details for Abdul Basit. These details are excluded from all user reports and PDF/print output. Reports contain only the organisation profile and logo entered by the user.

## Run locally

Open `index.html` in a modern browser. Most features work directly. Progressive Web App installation and offline caching require HTTPS or localhost.

## Publish

Upload the deployment files to the root of a GitHub repository and enable GitHub Pages from the `main` branch and `/ (root)` folder. See `DEPLOYMENT.md`.

## Important boundaries

SafeOS supports HSE work but does not certify legal compliance, replace competent professional judgement or determine regulator-reporting obligations. True multi-user access, secure permissions, centralized public submissions, approvals and notifications require a server-backed edition.

## Documentation

- `AUDIT_REPORT.md` — professional HSE/software audit and gap analysis
- `DEPLOYMENT.md` — GitHub Pages publishing instructions
- `ARCHITECTURE_ROADMAP.md` — recommended path to organisation and enterprise editions
- `THIRD_PARTY_NOTICES.md` — bundled library notice
