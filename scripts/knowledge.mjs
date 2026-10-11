// Builds kb.json: everything the site says, in one file, for the assistant to answer from.
// It is generated from the same sources the pages are built from, so the assistant can
// never fall behind the site. Run by build.mjs.
import { readFileSync } from 'node:fs';
import { industries } from '../src/industries.mjs';
import { guides } from '../src/guides.mjs';
import { cases } from '../src/cases.mjs';
import { problems } from '../src/problems.mjs';
import { PHONE, EMAIL } from '../src/layout.mjs';

const strip = h => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export function buildKnowledge() {
  const home = readFileSync('src/home.html', 'utf8');

  // the service cards, with the group each one sits under
  const services = [];
  let group = '';
  for (const m of home.matchAll(/<h3 class="group-title"[^>]*>([^<]+)<\/h3>|<a class="card"[^>]*data-msg="([^"]+)"[^>]*>.*?<h3>([^<]+)<\/h3><p>(.*?)<\/p>/gs)) {
    if (m[1]) { group = m[1]; continue; }
    if (m[3]) services.push({ group, name: m[3], what: strip(m[4]) });
  }

  // the questions already answered on the home page
  const faq = [...home.matchAll(/<details><summary>(.*?)<\/summary><p>(.*?)<\/p><\/details>/gs)]
    .map(m => ({ q: strip(m[1]), a: strip(m[2]) }));

  return {
    business: {
      name: 'בונים הכל',
      what: 'בונים לעסקים קטנים כל פתרון דיגיטלי: אתרים, דפי נחיתה, אפליקציות, מערכות ניהול, כלים קטנים ושילוב AI.',
      audience: 'עסקים קטנים שלא רוצים להשקיע הון גדול אבל רוצים להתקדם טכנולוגית.',
      slogan: 'הטכנולוגיה שעסקים גדולים משלמים עליה הון, במחיר של עסק קטן.',
      area: 'עובדים עם עסקים מכל הארץ. כל התהליך יכול להתנהל בוואטסאפ ובטלפון.',
      phone: PHONE.display,
      email: EMAIL || null,
      differentiators: [
        'הכול אצל אחד: מי שמדבר איתך הוא מי שבונה, מההתחלה עד הסוף.',
        'בגודל הנכון: מתחילים בכלי קטן ומרחיבים רק כשצריך.',
        'שיחת ייעוץ חינם, בלי התחייבות.',
        'מחיר סגור מראש, והתחייבות למחיר המשתלם: קיבלת הצעה זולה יותר על אותה עבודה, נשווה אותה.',
        'בכלים לניהול צוות העובד לא מתקין אפליקציה ולא זוכר סיסמה, הוא לוחץ על קישור.',
        'אפשר לשלב AI בכל מה שנבנה, לפי בקשה, וגם לשדרג אתר או מערכת קיימים.'
      ],
      consultation: 'שיחת הייעוץ בחינם ובלי התחייבות, ויוצאים ממנה שלושה דברים: מבינים מה מעכב את העסק, בוחרים מה כדאי לבנות ראשון, ומסכמים את היקף העבודה שעליו תינתן הצעת מחיר.',
      afterDelivery: [
        'האתר, הקוד והדומיין שייכים ללקוח. הדומיין נרשם על שמו.',
        'אפשר להגדיר אזורים שהלקוח מעדכן בעצמו, ומסבירים לו איך.',
        'תחזוקה כוללת עדכונים, תיקונים ושינויי תוכן, והיקפה נסגר מראש בכתב.',
        'אם יש עלויות חיצוניות (דומיין, אחסון, סליקה) אומרים עליהן מראש.'
      ]
    },
    services,
    industries: industries.map(i => ({
      name: i.short, page: `/${i.slug}/`,
      pains: i.pains.map(p => p.t),
      solutions: i.solutions.map(s => `${s.t}: ${s.d}`),
      example: i.example
    })),
    problems: problems.map(p => ({ problem: p.t, why: p.why, answer: p.fix })),
    works: cases.map(c => ({
      name: c.short, kind: c.size, page: `/work/${c.slug}/`,
      challenge: c.problem, built: c.solution,
      worker: c.sides?.worker, manager: c.sides?.mgr
    })),
    demoSite: {
      name: 'לחם ושקד', page: '/demo/cafe/',
      note: 'אתר הדגמה לבית קפה שאינו קיים, שנבנה כדי להראות איך נראה אתר לעסק קטן.'
    },
    guides: guides.map(g => ({ title: g.short, page: `/guides/${g.slug}/`, about: g.lead })),
    faq
  };
}
