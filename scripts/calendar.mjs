// Refresh the public Israeli holiday snapshot and the editorial cue calendar.
// node scripts/calendar.mjs [--from-cache] — no credentials or personal calendar writes.
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';

const folder = 'social-content/calendar';
mkdirSync(folder, { recursive: true });
export const sourceUrl = 'https://www.hebcal.com/hebcal?v=1&cfg=json&start=2026-01-01&end=2027-12-31&i=on&maj=on&min=on&mod=on&nx=on&mf=on&lg=he-x-NoNikud&hdp=1';
const rawPath = `${folder}/hebcal-2026-2027.json`;
let raw;
if (process.argv.includes('--from-cache')) raw = JSON.parse(readFileSync(rawPath, 'utf8'));
else {
  const res = await fetch(sourceUrl, { signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`Hebcal HTTP ${res.status}; previous snapshot preserved`);
  raw = await res.json();
}
if (!Array.isArray(raw.items) || raw.items.length < 50 || !raw.title?.includes('Israel')) throw new Error('Unexpected or non-Israel calendar response');
const plain = s => String(s).normalize('NFD').replace(/[\u0591-\u05C7]/g, '');
const minusDays = (s, n) => {
  const d = new Date(`${s}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10);
};
const solemn = /Yom HaShoah|Yom HaZikaron|Yom Kippur|Tish.a B.Av|Tzom|Fast|Ta.anit|Asara B.Tevet/;
const events = raw.items.filter(e => ['holiday', 'roshchodesh'].includes(e.category)).map(e => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) throw new Error('All-day event has invalid date');
  const title = plain(e.title); const original = e.title_orig || e.title;
  const isSolemn = solemn.test(original) || /יום השואה|יום הזיכרון|יום כיפור|יום הכיפורים|תשעה באב|צום|תענית|עשרה בטבת/.test(title);
  const isEve = /^Erev /.test(original) || title.startsWith('ערב ');
  return { date: e.date, title, original, hebrew_date: e.heDateParts || e.hdate, category: e.category, subcategory: e.subcat || null,
    yom_tov: !!e.yomtov, is_eve: isEve, begins_previous_evening: isEve ? false : e.yomtov ? true : null,
    source: e.link, commercial_content: !isSolemn, tone: isSolemn ? 'respectful_no_sales' : 'contextual_not_mandatory',
    planning_dates: isEve ? [] : [14, 7, 2].map(days => ({ days_before: days, date: minusDays(e.date, days) })) };
}).sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, 'he'));
const ids = new Set();
for (const e of events) {
  const id = `${e.date}|${e.original}`; if (ids.has(id)) throw new Error('Duplicate event'); ids.add(id);
  if (/^Shavuot II$|^Pesach VIII$|^Sukkot II$/.test(e.original)) throw new Error('Diaspora holiday in Israel calendar');
}
const snapshot = { source: 'Hebcal', source_url: sourceUrl, license: 'CC BY 4.0', license_url: 'https://creativecommons.org/licenses/by/4.0/',
  country: 'IL', israel_schedule: true, timezone: 'Asia/Jerusalem', range: { start: '2026-01-01', end: '2027-12-31' },
  fetched_at: raw.date, note: 'All-day observed dates. No exact sunset times, school vacations, personal events or automatic campaign publication. Recheck current official notices for observance changes.', events };
const esc = s => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
// RFC5545 folds by UTF-8 octets, never splitting a Hebrew character.
const fold = s => { let lines = [], line = ''; for (const c of s) { if (Buffer.byteLength(line + c) > 73) { lines.push(line); line = ' '; } line += c; } lines.push(line); return lines.join('\r\n'); };
const stamp = String(raw.date).replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//POETEXA//Israel Content Calendar//HE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
  'X-WR-CALNAME:POETEXA — חגים ומועדים בישראל', 'X-WR-TIMEZONE:Asia/Jerusalem',
  ...events.flatMap(e => ['BEGIN:VEVENT', `UID:${createHash('sha256').update(`${e.date}|${e.original}`).digest('hex').slice(0, 24)}@poetexa.pages.dev`,
    `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${e.date.replaceAll('-', '')}`, `DTEND;VALUE=DATE:${minusDays(e.date, -1).replaceAll('-', '')}`,
    `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc('מועד בישראל. חגים עשויים להתחיל בערב הקודם; אין כאן זמני שקיעה. מקור: Hebcal, CC BY 4.0. ' + (e.commercial_content ? 'התאמת התוכן למועד נבדקת בנפרד.' : 'יום בעל אופי רגיש: ללא תוכן מכירתי.'))}`,
    `URL:${e.source || 'https://www.hebcal.com/'}`, 'TRANSP:TRANSPARENT', 'END:VEVENT']), 'END:VCALENDAR'].map(fold).join('\r\n') + '\r\n';
const write = (path, body) => { writeFileSync(path + '.tmp', body); renameSync(path + '.tmp', path); };
write(rawPath, JSON.stringify(raw, null, 2));
write(`${folder}/holidays.json`, JSON.stringify(snapshot, null, 2));
write(`${folder}/poetexa-israel-2026-2027.ics`, ics);
console.log(`Israel calendar: ${events.length} events; JSON + ICS + editorial lead dates saved`);
