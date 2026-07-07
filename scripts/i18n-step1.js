const fs = require("fs");
const h = fs.readFileSync("../index.html", "utf8");
let html = h.charCodeAt(0) === 0xFEFF ? h.substring(1) : h;

// ===== 1. Bottom nav labels =====
html = html.replace('label:"Today"', 'label:__t("Today","Today")');
html = html.replace("label:\"Qur'an\"", 'label:__t("Quran","Qur\'an")');
html = html.replace('label:"Tafsir"', 'label:__t("Tafsir","Tafsir")');
html = html.replace('label:"Hadith"', 'label:__t("Hadith","Hadith")');
html = html.replace('label:"Qibla"', 'label:__t("Qibla","Qibla")');
html = html.replace('label:"Azkar"', 'label:__t("Azkar","Azkar")');
html = html.replace('label:"More"', 'label:__t("More","More")');
console.log("1. Bottom nav ✓");

// ===== 2. Language selector on dashboard =====
var langBtns = `
      h("div",{style:{display:"flex",gap:8,justifyContent:"center",margin:"0 0 14px"}},
        [{k:"en",n:"English"},{k:"ur",n:"اردو"},{k:"ar",n:"العربية"}].map(function(l2){
          var cur=window.DDP_I18N?window.DDP_I18N.lang():"en";
          return h("button",{key:l2.k,onClick:function(){window.DDP_I18N&&window.DDP_I18N.setLang(l2.k);window.location.reload();},style:{border:"none",borderRadius:14,padding:"8px 16px",background:cur===l2.k?"#0C5A3B":"rgba(33,48,42,0.06)",color:cur===l2.k?"#fff":"#8A8576",fontFamily:T.sans,fontSize:12,fontWeight:700,cursor:"pointer"}},l2.n);
        })
      ),`;

var anchor = 'h("div",{style:{margin:"0 0 18px",padding:"16px 18px",borderRadius:22';
html = html.replace(anchor, langBtns + anchor);
console.log("2. Language selector ✓");

// ===== 3. Dashboard card headings =====
html = html.replace(
  'h(Eyebrow,null,"Salah Log · Today")',
  'h(Eyebrow,null,__t("Salah Log","Salah Log · Today"))'
);
html = html.replace(
  "h(Eyebrow,null,\"Qur'an Log · Today\")",
  'h(Eyebrow,null,__t("Quran Log","Qur\'an Log · Today"))'
);
html = html.replace(
  'h(Eyebrow,null,"Zikr · Today")',
  'h(Eyebrow,null,__t("Zikr","Zikr · Today"))'
);
html = html.replace(
  'h(Eyebrow,null,"Good Deeds · Today")',
  'h(Eyebrow,null,__t("Good Deeds","Good Deeds · Today"))'
);
console.log("3. Card headings ✓");

// ===== 4. Hijri date via DDP_HIJRI =====
var oldH = 'let hijri="";try{hijri=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura"';
var newH = 'let hijri="";try{hijri=window.DDP_HIJRI?window.DDP_HIJRI.format(today,(window.DDP_I18N&&window.DDP_I18N.lang())||"en",{short:!0}):new Intl.DateTimeFormat("en-u-ca-islamic-umalqura"';
html = html.replace(oldH, newH);
console.log("4. Hijri ✓");

fs.writeFileSync("../index.html", html, "utf8");
console.log("\nDone. Size:", html.length);
