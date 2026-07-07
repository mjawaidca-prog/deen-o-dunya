const fs = require("fs");
const h = fs.readFileSync("../index.html", "utf8");
let html = h.charCodeAt(0) === 0xFEFF ? h.substring(1) : h;

// 1. Add language selector buttons to dashboard - before the dua banner
var langSelector = `
      h("div",{style:{display:"flex",gap:8,justifyContent:"center",margin:"0 0 14px"}},
        [{k:"en",n:"English"},{k:"ur",n:"اردو"},{k:"ar",n:"العربية"}].map(function(l2){
          var cur=window.DDP_I18N?window.DDP_I18N.lang():"en";
          return h("button",{key:l2.k,onClick:function(){window.DDP_I18N&&window.DDP_I18N.setLang(l2.k);window.location.reload();},style:{border:"none",borderRadius:14,padding:"8px 16px",background:cur===l2.k?"#0C5A3B":"rgba(33,48,42,0.06)",color:cur===l2.k?"#fff":"#8A8576",fontFamily:T.sans,fontSize:12,fontWeight:700,cursor:"pointer"}},l2.n);
        })
      ),`;

var anchor = 'h("div",{style:{margin:"0 0 18px",padding:"16px 18px",borderRadius:22';
html = html.replace(anchor, langSelector + anchor);
console.log("✅ Language buttons added to dashboard");

// 2. Translate Salah Log card
var s1 = 'h(Eyebrow,null,"Salah Log · Today")';
var r1 = 'h(Eyebrow,null,__t("salah_log","Salah Log · Today"))';
if (html.includes(s1)) { html = html.replace(s1, r1); console.log("  Salah Log ✓"); }

// 3. Translate Quran Log card
var s2 = "h(Eyebrow,null,\"Qur'an Log · Today\")";
var r2 = 'h(Eyebrow,null,__t("quran_log","Qur\'an Log · Today"))';
if (html.includes(s2)) { html = html.replace(s2, r2); console.log("  Quran Log ✓"); }

// 4. Zikr card
var s3 = 'h(Eyebrow,null,"Zikr · Today")';
var r3 = 'h(Eyebrow,null,__t("zikr_today","Zikr · Today"))';
if (html.includes(s3)) { html = html.replace(s3, r3); console.log("  Zikr ✓"); }

// 5. Good Deeds card
var s4 = 'h(Eyebrow,null,"Good Deeds · Today")';
var r4 = 'h(Eyebrow,null,__t("good_deeds","Good Deeds · Today"))';
if (html.includes(s4)) { html = html.replace(s4, r4); console.log("  Good Deeds ✓"); }

// 6. Today's Balance
var s5 = "h(Eyebrow,{style:{fontSize:13,letterSpacing:2.4,marginBottom:12}},\"Today's Balance\")";
var r5 = 'h(Eyebrow,{style:{fontSize:13,letterSpacing:2.4,marginBottom:12}},__t("todays_balance","Today\'s Balance"))';
if (html.includes(s5)) { html = html.replace(s5, r5); console.log("  Balance ✓"); }

// 7. Hadith card heading
var s6 = '"Hadith of the Day"';
var r6 = '__t("hadith_day","Hadith of the Day")';
if (html.includes(s6)) { html = html.replace(s6, r6); console.log("  Hadith ✓"); }

// 8. Tasbih
html = html.replace('"Tasbih Counter"', '__t("tasbih_counter","Tasbih Counter")');
html = html.replace('"Reset"', '__t("reset","Reset")');
html = html.replace('"Tap to Count"', '__t("tap_count","Tap to Count")');
console.log("  Tasbih ✓");

// 9. Sunrise/Sunset labels
html = html.replace(/"Sunrise "/g, '__t("sunrise_label","Sunrise")+" "');
html = html.replace(/"Sunset "/g, '__t("sunset_label","Sunset")+" "');
console.log("  Sunrise/Sunset ✓");

// 10. Salah Times heading
var s7 = 'h(Eyebrow,{style:{fontSize:11,letterSpacing:1.6,marginBottom:4}},"Salah Times")';
var r7 = 'h(Eyebrow,{style:{fontSize:11,letterSpacing:1.6,marginBottom:4}},__t("salah_times","Salah Times"))';
if (html.includes(s7)) { html = html.replace(s7, r7); console.log("  Salah Times ✓"); }

// 11. Add __t global if missing
if (!html.includes("var __t=window")) {
  html = html.replace(
    '<script>\n/**',
    '<script>var __t=window.DDP_I18N?function(k,d){var r=DDP_I18N.t(k);return r!==k&&r?r:(d||k);}:function(k,d){return d||k;};</script>\n<script>\n/**'
  );
  console.log("✅ Global __t added");
}

// 12. Add hijri to use DDP_HIJRI
var oldH = 'let hijri="";try{hijri=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura"';
var newH = 'let hijri="";try{hijri=window.DDP_HIJRI?window.DDP_HIJRI.format(today,(window.DDP_I18N&&window.DDP_I18N.lang())||"en",{short:!0}):new Intl.DateTimeFormat("en-u-ca-islamic-umalqura"';
if (html.includes(oldH)) { html = html.replace(oldH, newH); console.log("✅ Hijri from DDP_HIJRI"); }

fs.writeFileSync("../index.html", html, "utf8");
console.log("\nDone. Size:", html.length);
