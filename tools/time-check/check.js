'use strict';
const TOPICS = [
 {id:'copy',title:'אני מקליד את אותו מידע בכמה מקומות',description:'למשל: הודעה מלקוח שמועתקת לאקסל ואחר כך שוב למערכת.',action:'הקלדה חוזרת של מידע',next:'בחר פרט אחד שמועתק פעמיים. תעד מאיפה הוא מגיע, לאן הוא עובר ומי בודק שהועתק נכון. רק אחר כך בודקים אם אפשר לחבר בין הכלים.',demo:'/work/smart-inbox/#demo'},
 {id:'questions',title:'אני עונה שוב ושוב על אותן שאלות',description:'שעות פעילות, מה כולל השירות או מה צריך להכין לפני פגישה.',action:'שאלות חוזרות של לקוחות',next:'אסוף חמש שאלות שחוזרות אצלך וכתוב תשובה מאושרת לכל אחת. זה בסיס לעמוד שאלות או לעוזר באתר, עם אפשרות לעבור לאדם.',demo:'/ai/'},
 {id:'followup',title:'אני רודף אחרי עדכונים ואישורי ביצוע',description:'מי טיפל, מה עוד פתוח ומה השלב הבא במשימה.',action:'מעקב אחרי ביצוע',next:'בחר סוג משימה אחד והגדר מה צריך לבצע, מי אחראי ואיזה אישור מסיים אותה. הדגמה עם משימה אחת תראה אם חסר מידע בדרך.',demo:'/work/work-it/#demo'},
 {id:'photos',title:'תמונות ומסמכים מגיעים בלי הקשר ברור',description:'צריך לשאול מאיזה סניף, לאיזה לקוח או לאיזו משימה זה שייך.',action:'שיוך תמונות ומסמכים',next:'הגדר אילו פרטים חייבים ללוות כל צילום או מסמך. נסה טופס קצר שמרכז אותם יחד לפני שמחפשים אוטומציה נוספת.',demo:'/work/field-photos/'},
 {id:'reports',title:'אני מרכיב ידנית את אותו דוח בכל שבוע',description:'איסוף מספרים, העתקת שורות וסידור הקובץ מחדש.',action:'הפקת דוח חוזר',next:'בחר דוח אחד והגדר אילו מקורות ושדות נדרשים בו. בדוק קודם שמידע המקור אמין ושאותם כללים חוזרים בכל הפקה.',demo:'/automations/'}
];
const $ = id => document.getElementById(id);
const form=$('check');let summary='';
$('questions').innerHTML=TOPICS.map((t,i)=>`<section class="question"><label class="pick"><input type="checkbox" name="topic" value="${t.id}" aria-controls="time-${t.id}" aria-expanded="false"><span><span class="number">0${i+1} / 05</span><span class="qtitle">${t.title}</span><span class="desc">${t.description}</span></span></label><div class="timing" id="time-${t.id}" hidden><p class="small">אומדן אישי, לא חובה. הזמן לאדם אחד ובשבוע עבודה אחד.</p><div class="fields"><label for="freq-${t.id}">כמה פעמים בשבוע?<input id="freq-${t.id}" type="number" disabled min="1" max="1000" step="1" inputmode="numeric" placeholder="לפי השבוע שלך"></label><label for="duration-${t.id}">כמה דקות בכל פעם?<input id="duration-${t.id}" type="number" disabled min="0.1" max="1440" step="0.1" inputmode="decimal" placeholder="לפי המדידה שלך"></label></div></div></section>`).join('');
for(const cb of form.querySelectorAll('[name="topic"]'))cb.addEventListener('change',()=>{const box=$('time-'+cb.value);box.hidden=!cb.checked;for(const input of box.querySelectorAll('input'))input.disabled=!cb.checked;cb.setAttribute('aria-expanded',String(cb.checked));$('results').hidden=true;});
function showError(message,el){$('error').textContent=message;$('error').hidden=false;el?.focus();}
form.addEventListener('submit',e=>{
 e.preventDefault();$('error').hidden=true;
 const selected=TOPICS.filter(t=>form.querySelector(`[value="${t.id}"]`).checked);const measured=[];
 for(const t of selected){const f=$('freq-'+t.id),d=$('duration-'+t.id);const fv=f.value.trim(),dv=d.value.trim();if(!fv&&!dv)continue;if(!fv||!dv){showError('כדי לחשב זמן, מלא גם תדירות וגם דקות, או השאר את שניהם ריקים.',!fv?f:d);return;}const freq=Number(fv),duration=Number(dv);if(!f.checkValidity()||!d.checkValidity()||!Number.isFinite(freq)||!Number.isFinite(duration)){showError('יש להזין מספרים חיוביים בטווח המופיע בשדה.',!f.checkValidity()?f:d);return;}measured.push({topic:t,minutes:freq*duration});}
 const minutes=measured.reduce((sum,x)=>sum+x.minutes,0);if(minutes>10080){showError('הזמן שחושב גדול משבוע שלם לאדם אחד. בדוק את המספרים ושהזמן לא נספר פעמיים.');return;}
 const priority=measured.length?[...measured].sort((a,b)=>b.minutes-a.minutes)[0].topic:selected[0];
 $('result-title').textContent=priority?'תהליך ראשון לבדיקה: '+priority.action:'כדאי להתחיל משבוע של תיעוד';
 $('count').textContent=selected.length?`סימנת ${selected.length} מתוך 5 מצבים לבדיקה.`:'לא סימנת כרגע אחד מהמצבים האלה. זה לא אומר שאין מה לשפר — רשום אילו פעולות חוזרות אצלך במהלך השבוע.';
 $('minutes').textContent=measured.length?`${new Intl.NumberFormat('he-IL',{maximumFractionDigits:1}).format(minutes)} דקות עבודה בשבוע לפי האומדן שלך`:'';
 $('estimate-note').textContent=measured.length?`החישוב כולל ${measured.length} מתוך ${selected.length} המצבים שסימנת. נבחר התהליך עם הזמן הגבוה ביותר מבין אלה שמילאת; זו נקודת פתיחה לבדיקה, לא קביעה מה כדאי להפוך לאוטומטי.`:selected.length?'לא הזנת נתוני זמן. מוצע להתחיל מהסעיף הראשון שסימנת, ואז למדוד אותו במשך שבוע.':'';
 const rec=$('recommendation');rec.replaceChildren();const para=document.createElement('p');para.textContent=priority?priority.next:'בחר פעולה אחת שחוזרת, תעד מי מבצע אותה וכמה זמן היא לוקחת. אפשר להיעזר בדף העבודה למטה.';rec.append(para);if(priority){const a=document.createElement('a');a.href=priority.demo;a.textContent='לצפייה בדוגמה באתר ←';rec.append(a);}
 summary='הבדיקה שלי ב־POETEXA\n'+selected.map(t=>'• '+t.action).join('\n')+(measured.length?'\nאומדן עבודה שבועי: '+minutes.toFixed(1)+' דקות (לא חיסכון מובטח).':'\nלא הזנתי אומדן זמן.')+(priority?'\nתהליך ראשון לבדיקה: '+priority.action:'')+'\nhttps://poetexa.pages.dev/tools/time-check/';
 $('consult').href='https://wa.me/972542020812?text='+encodeURIComponent('שלום, מילאתי את הבדיקה ואשמח לדבר על התהליך.\n'+summary);
 $('results').hidden=false;$('results').focus();
});
form.addEventListener('reset',()=>{for(const t of TOPICS){$('time-'+t.id).hidden=true;for(const input of $('time-'+t.id).querySelectorAll('input'))input.disabled=true;}for(const cb of form.querySelectorAll('[name="topic"]'))cb.setAttribute('aria-expanded','false');$('error').hidden=true;$('results').hidden=true;summary='';$('consult').href='https://wa.me/972542020812';});
const notify=text=>{$('status').textContent=text;};
$('copy-result').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(summary);notify('הסיכום הועתק.');}catch{notify('ההעתקה לא זמינה בדפדפן הזה. אפשר לבחור את התוצאה בלחיצה ארוכה ולהעתיק.');}});
$('print').addEventListener('click',()=>window.print());
$('share').addEventListener('click',async()=>{const url='https://poetexa.pages.dev/tools/time-check/';try{if(navigator.share)await navigator.share({title:'איפה העבודה חוזרת על עצמה בעסק שלך?',text:'בדיקה חינמית וקצרה של POETEXA, בלי הרשמה.',url});else{await navigator.clipboard.writeText(url);notify('הקישור הועתק לשיתוף.');}}catch{notify('אפשר להעתיק את כתובת העמוד ולשתף אותה.');}});
