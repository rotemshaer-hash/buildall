# בונים הכל – האתר

האתר נבנה מ־`src/` בפקודה אחת:

```
node build.mjs
```

הפקודה כותבת את `index.html`, דף לכל תחום (`restaurants/`, `beauty/` וכו'), מדריכים (`guides/`), סיפורי פרויקטים (`work/`), `accessibility/`, `privacy/`, `sitemap.xml` ו־`robots.txt`.
**את הקבצים האלה לא עורכים ישירות.** עורכים את המקור ובונים מחדש.

**הפריסה ידנית.** דחיפה ל־`main` לא מעלה את האתר: מריצים `node build.mjs`,
אחר כך `node scripts/dist.mjs` (שמריץ גם את הביקורת ונכשל אם היא נכשלת), יוצרים זיפ
מתוך `dist/` ומעלים אותו ב־Cloudflare Pages ← Deployments ← Create deployment.
`.github/workflows/deploy.yml` יעשה את זה לבד ברגע ששני המפתחות
`CLOUDFLARE_API_TOKEN` ו־`CLOUDFLARE_ACCOUNT_ID` יוגדרו ב־Settings ← Secrets ← Actions.
הפעולה מריצה `node build.mjs`, ואז `node scripts/dist.mjs` שאוסף ל־`dist/` רק את מה
שצריך להתפרסם. **קובץ חדש שאמור להתפרסם — להוסיף אותו לרשימה ב־`scripts/dist.mjs`.**

| מה משנים | איפה |
|---|---|
| כתובת האתר (כשקונים את `buildall.co.il`) | `BASE` ב־`src/layout.mjs` |
| טלפון, שם העסק, הדר, פוטר, טופס, אייקונים, לוגו | `src/layout.mjs` |
| תוכן דף הבית | `src/home.html` |
| דפי התחומים: הוספה, עריכה | `src/industries.mjs` |
| ביקורות מגוגל (רק אמיתיות) | `src/reviews.mjs` |
| מספר הוואטסאפ | `WA_NUMBER` ב־`site.js` |
| שליחת הטופס במייל | `FORM_KEY` ב־`src/layout.mjs` (מפתח מ־web3forms.com) |
| כתובת המייל שמוצגת באתר | `EMAIL` ב־`src/layout.mjs` |
| מדריכים | `src/guides.mjs` |
| סיפורי פרויקטים | `src/cases.mjs` |
| הצהרת נגישות ומדיניות פרטיות | `src/legal.mjs` (ותאריך העדכון `UPDATED`) |
| Google Analytics ו־Search Console | `GA_ID` ו־`GSC_VERIFY` ב־`src/layout.mjs` |
| תמונת השיתוף (`og.jpg`) | `node tools/og.mjs` (צריך Playwright) |
| אייקוני ההתקנה (`icons/`) | `node tools/icons.mjs` (צריך Playwright) |
| סרטון ההדגמה (28 שניות, זה שבאתר) | התוכן ב־`tools/promo3.html`, מריצים `node tools/promo3.mjs` (צריך Playwright + ffmpeg מלא). הפלט מועתק ל־`media/workit.mp4` |
| המניפסט (התקנה לטלפון) | נבנה ב־`build.mjs`; המטמון ב־`sw.js` |
| עיצוב | `style.css` |
