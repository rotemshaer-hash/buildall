# בונים הכל – האתר

האתר נבנה מ־`src/` בפקודה אחת:

```
node build.mjs
```

הפקודה כותבת את `index.html`, דף לכל תחום (`restaurants/`, `beauty/` וכו'), `sitemap.xml` ו־`robots.txt`.
**את הקבצים האלה לא עורכים ישירות.** עורכים את המקור ובונים מחדש.

| מה משנים | איפה |
|---|---|
| כתובת האתר (כשקונים את `buildall.co.il`) | `BASE` ב־`src/layout.mjs` |
| טלפון, שם העסק, הדר, פוטר, טופס, אייקונים, לוגו | `src/layout.mjs` |
| תוכן דף הבית | `src/home.html` |
| דפי התחומים: הוספה, עריכה | `src/industries.mjs` |
| ביקורות מגוגל (רק אמיתיות) | `src/reviews.mjs` |
| מספר הוואטסאפ | `WA_NUMBER` ב־`site.js` |
| עיצוב | `style.css` |
