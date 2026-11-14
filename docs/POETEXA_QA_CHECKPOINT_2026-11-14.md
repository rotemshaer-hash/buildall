# POETEXA — Mobile-first QA and app development checkpoint (2026-11-14)

## Scope and safety
- Source branch: `work/poetexa-audit-20261031`.
- This is an isolated working branch; do not merge to `main` or publish without explicit approval.
- User works from a phone only. Prefer browser/cloud-based development and previews.
- No paid tools, video credits, or publication without explicit approval.

## Verified from repository source (not browser-tested)
- `src/home.html` contains a hero background video, visual device illustration, service cards, Work It demo video, and links to `social-content/`.
- `style.css` contains responsive styling and mock-device components.
- `build.mjs` generates pages from `src/`.
- `scripts/dist.mjs` collects publishable assets and runs `scripts/audit.mjs`.
- `.github/workflows/deploy.yml` deploys pushes to `main` to Cloudflare Pages.
- The historical report of 2,919 passing checks has **not** been re-run during this checkpoint.

## Potential issue to verify, not yet a confirmed defect
- Home links to `social-content/` but the explicit `FILES` list inspected in `scripts/dist.mjs` does not visibly include that directory. Confirm whether it is generated and copied by another mechanism before changing anything.

## Next implementation gates
1. Run `node build.mjs && node scripts/dist.mjs` in an isolated cloud workspace and capture exit codes.
2. Verify that `dist/social-content/index.html` exists and links/video assets resolve.
3. Use browser screenshots at 360, 390, 768 and 1440 CSS px; inspect Hebrew RTL, text clipping, CTA, menu, videos, contrast and horizontal overflow.
4. Fix only reproduced defects, commit to this branch, and repeat the audit and screenshots.
5. Build a separate appointment-booking prototype with synchronized customer and business views and a persistence test. Do not represent a visual-only mock as a working booking system.

## Current status
Source review completed; isolated branch created. No browser QA, build, tests, deployment, or production change has been performed in this checkpoint.
