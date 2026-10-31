# POETEXA — WORK AUDIT / HANDOFF — 2026-10-31

## Safety
- Working branch: `work/poetexa-audit-20261031`; production main untouched.
- No merge, deploy, Instagram publication, paid generation, or automation modification is authorized by this document.

## Verified from connected GitHub
- Repository: `rotemshaer-hash/buildall`, default branch `main`, write permissions confirmed.
- Design branches `design/poetexa-final-20261021` and `design/poetexa-premium-preview` are 78 and 81 commits behind main respectively, with zero commits ahead.
- `.github/workflows/deploy.yml` triggers Cloudflare Pages deploy on eligible pushes to main. The earlier manual-only deployment handoff is outdated.
- Build pipeline: `node build.mjs`, `node scripts/dist.mjs`, audit `scripts/audit.mjs`. The deployment workflow also runs social download and search identity checks.
- Canonical BASE in `src/layout.mjs` is `https://poetexa.pages.dev/`. Old handoff lists `https://buildall.pages.dev/`; domain response and Cloudflare account were not verified.
- Original Work It video remains referenced in `src/home.html` as `media/workit.mp4`; the hero background video is a separate asset.
- Existing audit checks links, anchors, 404, media, navigation, forbidden copy, and structured data.
- Web3Forms access key is embedded in client-side site source. This is a client-side form service access key, not necessarily a secret token; validate anti-spam/domain restrictions and abuse controls before any changes.

## Verified from connected Metricool
- Brand `poetexa`, ID `7696609`, timezone `Asia/Jerusalem`.
- Scheduled/pending and draft entries include stories marked `autoPublish: true`; this is not proof of publication. Current publication policy permits only previously approved morning carousels to publish automatically; do not alter posts without separate approval.

## Verified from HeyGen
- Connected; one demo brand kit available.
- Video library returned zero videos on initial read. Hebrew voice quality and credit availability not tested.

## Blockers
- No complete repository checkout in local execution environment (network DNS unavailable); build and visual browser tests could not be executed.
- Neither Cloudflare administrative access nor production domain response was confirmed.
- No MP4 generated: content/credits approval and Hebrew QA pending.

## QA acceptance before production
1. Run `node build.mjs && node scripts/dist.mjs` from a clean checkout.
2. Inspect all pages on 360, 390, 768, 1024 and 1440 px viewports; check horizontal overflow, hidden headings, nav, tap targets, RTL and focus.
3. Check every image/video, 404, contact form and WhatsApp route.
4. Confirm canonical URL and production redirects on Cloudflare.
5. Produce isolated preview, record screenshots and tests.
6. Obtain explicit approval for merge and deployment.

## First reel — approved concept required before paid production
- Subject: outdated website vs clear, mobile-friendly business site.
- 9:16, 20–25 s, Hebrew narration, subtitles, original or properly licensed music.
- Scene 1 (0–3 s): A customer abandons a cluttered, unreadable mobile page. VO: 'לקוח נכנס לאתר שלך — ומיד יוצא?'
- Scene 2 (3–9 s): Split-screen before/after; clear menu, fast loading, contact button. VO: 'לפעמים לא חסרים לקוחות. פשוט קשה להם להבין מה אתה מציע.'
- Scene 3 (9–17 s): Business owner sees a clear inquiry arrive. VO: 'ב־POETEXA בונים חוויה פשוטה, מקצועית ומדויקת לעסק.'
- Scene 4 (17–23 s): POETEXA wordmark and CTA. VO: 'רוצה לראות מה אפשר לשפר? בוא נדבר בחינם.'
- No fabricated performance metrics, customer testimonials or guaranteed results.
- Final approval before production and again before publication.

## Next actions
1. Obtain executable repository checkout and run build/audit + responsive screenshots.
2. Verify Cloudflare project and Metricool scheduling semantics without changes.
3. Approve reel concept/credits, generate draft, QA Hebrew captions and audio.

## Session status
Read-only checks completed; this file added only to working branch. Production unchanged.
