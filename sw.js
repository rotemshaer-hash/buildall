// The minimum a browser needs before it will offer to install the site.
// It serves the page from the network, and falls back to the last copy when offline.
const CACHE = 'poetexa-v1';
// A cache entry evicted only by count, oldest first — otherwise it grows
// forever since every GET gets written and nothing ever ages out.
const MAX_ENTRIES = 60;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  // Bumping CACHE above leaves the old-named cache orphaned forever unless
  // something deletes it — do that here so a future version bump is safe.
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_ENTRIES; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Only a real success overwrites what's cached — a transient 404/500
        // must never replace a previously-good cached copy.
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(async c => { await c.put(e.request, copy); await trim(c); }).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(hit => {
          if (hit) return hit;
          // The offline fallback is a full HTML page — only worth serving
          // for a navigation itself. Falling back to it for a failed image,
          // script or API call would hand that request a page of HTML
          // instead of failing normally.
          if (e.request.mode === 'navigate') return caches.match('./');
          return Response.error();
        })
      )
  );
});
