# Publish SafeOS Community 3.0 on GitHub Pages

Target repository: `abasit0315-cell/hse-quicktools`

## Replace the current deployment

1. Download and extract `SafeOS_Community_v3_Advanced.zip`.
2. Open the GitHub repository.
3. Select **Add file → Upload files**.
4. Upload the files from the extracted deployment folder directly to the repository root.
5. Confirm that `index.html`, `app.js`, `safeos.js`, `styles.css`, `qrcode-bundle.js`, `manifest.json`, `sw.js` and `icon.svg` are visible at root level.
6. Commit with: `Upgrade to SafeOS Community 3.0`.
7. Open **Settings → Pages** and verify **Deploy from a branch → main → / (root)**.

The existing live address will remain:

`https://abasit0315-cell.github.io/hse-quicktools/`

## Clear the previous cached application

SafeOS uses a service worker. After deployment:

- Desktop: open the live site and press `Ctrl + Shift + R`.
- Android: close the site tab, reopen it and refresh. When necessary, clear the site’s cached data in browser settings.
- The release cache name is `safeos-community-v3.0.0`.

## Recommended repository settings

- Keep the repository public for a free community project.
- Add an open-source licence only after selecting the legal terms you want.
- Enable Dependabot/security alerts when dependencies are later introduced.
- Protect the `main` branch before accepting outside contributors.
- Use pull requests for future production changes.

## Custom domain

A custom domain can later point to the GitHub Pages site. Enforce HTTPS after DNS verification. Keep the `github.io` address available until the custom domain is working.

## Deployment boundary

GitHub Pages is static hosting. It cannot securely receive and centralize reports, enforce user permissions, run scheduled notifications or provide a secure database. Those functions require the server-backed SafeOS Organisation Edition described in `ARCHITECTURE_ROADMAP.md`.
