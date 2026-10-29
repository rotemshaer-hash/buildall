// The site's assistant. Everything else on the site is plain files; this is the one
// piece that runs on a server, because an AI key must never sit in the browser.
//
// SWITCHING THE ENGINE — this is the one place to change it:
//   'cloudflare'  free, built into Cloudflare, Hebrew is passable but can read clumsily.
//   'anthropic'   Claude. Excellent Hebrew. Needs the secret ANTHROPIC_API_KEY on the
//                 Pages project, and costs a few agorot per conversation.
// Set ENGINE below, or override it per project with the ENGINE variable in Pages settings.
const DEFAULT_ENGINE = 'cloudflare';

const CF_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const CLAUDE_MODEL = 'claude-haiku-5-5';

// Guardrails. These are not suggestions to the model, they are the rules the business runs on.
const RULES = `אתה נציג השירות של "POETEXA", עסק שבונה אתרים, אפליקציות ומערכות ניהול לעסקים קטנים.

כללים שאסור לך לשבור:
1. לעולם אל תנקוב במחיר, בטווח מחירים, בהנחה או בעלות כלשהי — גם לא בערך ולא "בסביבות". אם שואלים על מחיר, ענה שהמחיר נקבע אחרי שיחת ייעוץ חינם כדי שיהיה מדויק, והצע לקבוע אותה.
2. אל תבטיח תאריכי מסירה, לוחות זמנים מדויקים או יכולות שלא כתובות במידע שקיבלת.
3. אל תמציא. אם התשובה לא נמצאת במידע שקיבלת, אמור בפשטות שאתה לא בטוח, והצע להשאיר פרטים כדי שנציג שירות יחזור אליו.
4. אל תמציא לקוחות, המלצות, מספרים או הישגים.
5. אל תדבר על מתחרים ואל תטען טענות לגביהם.

איך לענות:
- עברית טבעית וברורה, בלשון זכר, כמו בן אדם ולא כמו עלון פרסומי.
- קצר: שתיים עד ארבע שורות. בלי כותרות ובלי רשימות ארוכות.
- ענה לשאלה שנשאלה, ואל תשפוך את כל מה שאתה יודע.
- אם מתאים, סיים בשאלה קצרה אחת שתקדם את השיחה.
- אם מישהו מתאר בעיה בעסק שלו, הצע את הפתרון הרלוונטי והצע שיחת ייעוץ חינם.`;

const CORS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: CORS });

// A visitor gets a limited number of questions per minute, so one person cannot
// burn the whole daily allowance for everyone. This counter lives in the
// isolate's own memory, not a shared store (no KV/Durable Object is bound),
// so it throttles per-isolate, not a single global count across every edge
// location. Good enough to stop one browser tab hammering the endpoint;
// not a guarantee against a distributed abuser. A true shared quota needs a
// Cloudflare KV namespace or Durable Object bound to this Pages project.
const seen = new Map();
function tooMany(ip) {
  const now = Date.now();
  const hits = (seen.get(ip) || []).filter(t => now - t < 60000);
  hits.push(now);
  seen.set(ip, hits);
  if (seen.size > 500) for (const [k, v] of seen) if (!v.some(t => now - t < 60000)) seen.delete(k);
  return hits.length > 8;
}

// A second line of defense under rule 1: the model is told never to state a
// price, but instructions alone don't guarantee compliance, so the reply
// itself is checked before it reaches the visitor.
const PRICE_SAFE_REPLY = 'אני לא יכול לנקוב במחיר כאן — המחיר נקבע אחרי שיחת ייעוץ חינם כדי שיהיה מדויק לעסק שלך. רוצה לקבוע אחת?';
// A bare number range alone used to trigger this (a phone number like
// 050-1234567, or "5-10 עובדים"), so it now only counts as a price when a
// currency symbol/word is present too, or the range sits in the same text
// as a price-related word — and even then it's capped to 2-4 digit groups,
// shorter than a real phone number's second half, to keep a phone number
// from matching just because the message also happens to mention "עולה".
function mentionsPrice(text) {
  if (/(₪|ש"?ח|שקל|ש״ח)/.test(text)) return true;
  return /מחיר|עולה|עלות|תשלום|הנחה|תעריף/.test(text) && /\b\d{2,4}\s*-\s*\d{2,4}\b/.test(text);
}

async function askCloudflare(env, messages) {
  const r = await env.AI.run(CF_MODEL, {
    messages,
    max_tokens: 400,
    temperature: 0.3
  });
  return (r.response || '').trim();
}

async function askClaude(env, messages) {
  const sys = messages.find(m => m.role === 'system')?.content || '';
  const rest = messages.filter(m => m.role !== 'system');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 400, system: sys, messages: rest })
  });
  if (!r.ok) throw new Error('claude ' + r.status);
  const data = await r.json();
  return (data.content?.[0]?.text || '').trim();
}

async function downloadPost(request, pathname, env) {
  const match = pathname.match(/^\/downloads\/2026-10-29\/post-([1-5])\.jpg$/);
  if (!match) return new Response('Not found', { status: 404 });
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  const number = Number(match[1]);
  try {
    const assetUrl = new URL('/media/instagram-posts/2026-10-29/' + number + '.jpg', request.url);
    const upstream = await env.ASSETS.fetch(new Request(assetUrl, { method: request.method }));
    if (!upstream.ok) return new Response('Download unavailable', { status: 502 });
    return new Response(request.method === 'HEAD' ? null : upstream.body, { headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'attachment; filename="POETEXA-29-10-' + number + '.jpg"',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    } });
  } catch { return new Response('Download unavailable', { status: 502 }); }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/downloads/')) return downloadPost(request, url.pathname, env);

    if (url.pathname === '/api/chat') {
      if (request.method !== 'POST') return json({ error: 'method' }, 405);

      const ip = request.headers.get('cf-connecting-ip') || 'anon';
      if (tooMany(ip)) return json({ fallback: true, reason: 'rate' });

      // A huge body costs CPU/memory to parse before any of the checks below
      // ever run, so it's rejected by its declared size first.
      const len = Number(request.headers.get('content-length') || 0);
      if (len > 20000) return json({ error: 'body' }, 413);

      let body;
      try { body = await request.json(); } catch { return json({ error: 'body' }, 400); }
      // request.json() happily returns null/a string/a number for valid JSON
      // that isn't an object — body.messages below would throw on null and
      // crash the whole request instead of answering with a clean 400.
      if (typeof body !== 'object' || body === null) return json({ error: 'body' }, 400);

      const history = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
      if (!history.length) return json({ error: 'empty' }, 400);
      for (const m of history) {
        if (typeof m?.content !== 'string' || m.content.length > 1000) return json({ error: 'body' }, 400);
        if (m.role !== 'user' && m.role !== 'assistant') return json({ error: 'body' }, 400);
        // The client supplies its own chat history, including the "assistant"
        // turns — those aren't actually verified statements the business
        // made; a visitor can send any content under role:"assistant", e.g. a
        // forged "המחיר הוא 500 שקל" turn, hoping the model treats its own
        // supposed earlier reply as an established fact to defer to. Rule 1
        // is re-applied to every such turn, not just the live reply.
        if (m.role === 'assistant' && mentionsPrice(m.content)) m.content = PRICE_SAFE_REPLY;
      }

      // The assistant answers from the site's own content, fetched from the site itself,
      // so it is always the published version and never a stale copy.
      // Parsed and re-stringified, not just fetched as text, so a build that
      // ever ships a truncated or malformed kb.json fails safe (falls back
      // to the page's own answers) instead of handing the model broken JSON
      // as its only source of truth about the business.
      let kb;
      try {
        const text = await (await env.ASSETS.fetch(new URL('/kb.json', url))).text();
        kb = JSON.stringify(JSON.parse(text));
      } catch {
        return json({ fallback: true, reason: 'kb' });
      }

      const messages = [
        { role: 'system', content: `${RULES}\n\nהמידע על העסק, וזה כל מה שמותר לך לענות ממנו:\n${kb}` },
        ...history
      ];

      const engine = env.ENGINE || DEFAULT_ENGINE;
      try {
        let reply;
        if (engine === 'anthropic' && env.ANTHROPIC_API_KEY) reply = await askClaude(env, messages);
        else if (env.AI) reply = await askCloudflare(env, messages);
        else return json({ fallback: true, reason: 'not-configured' });

        if (!reply) return json({ fallback: true, reason: 'empty' });
        if (mentionsPrice(reply)) reply = PRICE_SAFE_REPLY;
        return json({ reply });
      } catch (e) {
        // Out of free allowance, or the model is down: the page falls back to its own answers.
        return json({ fallback: true, reason: String(e).slice(0, 80) });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
