# בונים הכל – האתר

האתר נבנה מ־`src/` בפקודה אחת:

```
node build.mjs
```

הפקודה כותבת את `index.html`, דף לכל תחום (`restaurants/`, `beauty/` וכו'), מדריכים (`guides/`), סיפורי פרויקטים (`work/`), `accessibility/`, `privacy/`, `sitemap.xml` ו־`robots.txt`.
**את הקבצים האלה לא עורכים ישירות.** עורכים את המקור ובונים מחדש.

| מה משנים | איפה |
|---|---|
| כתובת האתר (כשקונים את `buildall.co.il`) | `BASE` ב־`src/layout.mjs` |
| טלפון, שם העסק, הדר, פוטר, טופס, אייקונים, לוגו | `src/layout.mjs` |
| תוכן דף הבית | `src/home.html` |
| דפי התחומים: הוספה, עריכה | `src/industries.mjs` |
| ביקורות מגוגל (רק אמיתיות) | `src/reviews.mjs` |
| מספר הוואטסאפ | `WA_NUMBER` ב־`site.js` |
| מדריכים | `src/guides.mjs` |
| סיפורי פרויקטים | `src/cases.mjs` |
| הצהרת נגישות ומדיניות פרטיות | `src/legal.mjs` (ותאריך העדכון `UPDATED`) |
| Google Analytics ו־Search Console | `GA_ID` ו־`GSC_VERIFY` ב־`src/layout.mjs` |
| תמונת השיתוף (`og.jpg`) | `node tools/og.mjs` (צריך Playwright) |
| אייקוני ההתקנה (`icons/`) | `node tools/icons.mjs` (צריך Playwright) |
| המניפסט (התקנה לטלפון) | נבנה ב־`build.mjs`; המטמון ב־`sw.js` |
| עיצוב | `style.css` |
