import { readFileSync } from 'node:fs';
const examples = JSON.parse(readFileSync(new URL('./social-examples.json', import.meta.url), 'utf8'));

export function socialShowcase() {
  return `<section class="social-showcase" id="examples">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">לראות את הכיוון</span><h2 class="h2">שלושה סיפורים. שלוש דרכים להציג את העסק.</h2>
    <p class="lead">דוגמאות התוכן של POETEXA: סיפור חזותי, הסבר תהליך וסרטון שמזמין את הקהל להשתתף. הפעלה בלחיצה, עם מוזיקה וללא קריינות.</p></div>
    <div class="social-video-grid">
${examples.map((e, i) => `      <article class="social-video-card">
        <h3 id="social-example-${i}">${e.title}</h3>
        <video controls playsinline preload="none" width="720" height="1280" poster="${e.poster}" aria-labelledby="social-example-${i}">
          <source src="${e.video}" type="video/mp4">
          <a href="${e.video}">פתיחת הסרטון</a>
        </video>
        <p class="social-example-note">24 שניות · סצנות AI ונתוני המחשה</p>
        <details><summary>תקציר הסרטון</summary><p>${e.summary}</p></details>
        <a href="${e.video}" target="_blank" rel="noopener">לפתיחת הסרטון בנפרד</a>
      </article>`).join('\n')}
    </div>
    <p class="social-disclosure">אלה דוגמאות של הסטודיו, לא תיעוד של לקוחות ולא הוכחה לתוצאות עסקיות. הממשקים הם המחשות; סצנות הרקע נוצרו בבינה מלאכותית.</p>
  </div>
</section>
<section class="social-process">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">איך עובדים</span><h2 class="h2">לוח תוכן שמחזיק את הרצף</h2></div>
    <ol class="social-steps">
      <li><b>מגדירים כיוון</b><p>למי מדברים, מה מציעים ואיזו פעולה רוצים לעודד.</p></li>
      <li><b>מתכננים ומפיקים</b><p>רעיונות, שוטים, עיצוב, מוזיקה וכיתובים בשפה של העסק.</p></li>
      <li><b>מאשרים ומתזמנים</b><p>תוכן מאושר מראש או ניהול שוטף בגבולות שסוכמו.</p></li>
      <li><b>בודקים ומשפרים</b><p>לומדים מחשיפה, שמירות, שיתופים ופניות כשיש נתונים.</p></li>
    </ol>
    <div class="social-calendar-note"><h3>גם החגים נכנסים לתוכנית</h3><p>מתכננים לפי לוח עברי־ישראלי, תאריכים עסקיים ועונות. מבחינים בין ערב חג ליום החג ומתאימים את התוכן לימי זיכרון.</p><a href="calendar/poetexa-israel-2026-2027.ics" download>הורדת לוח המועדים ל־2026–2027</a><p class="small">נתוני מועדים: <a href="https://www.hebcal.com/" target="_blank" rel="noopener">Hebcal</a>, ברישיון <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. קובץ ההורדה הוא תמונת מצב, לא מנוי שמתעדכן אוטומטית.</p></div>
    <a class="btn btn-brand" href="#contact" data-subject="תוכן ופרסום לרשתות">בואו נבנה תוכנית לעסק שלי <span aria-hidden="true">←</span></a>
  </div>
</section>`;
}
