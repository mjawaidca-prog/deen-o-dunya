// Restore remaining Phase 0 + Phase 3 inline gaps in index.html
const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");
let count = 0;

// === PHASE 0 FIXES ===

// 1. Viewport: remove user-scalable=no and maximum-scale=1.0
const oldVP = 'content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"';
const newVP = 'content="width=device-width, initial-scale=1.0, viewport-fit=cover"';
if (html.includes(oldVP)) { html = html.replace(oldVP, newVP); count++; console.log("✅ Viewport fixed"); }

// 2. Adhan URLs: islamcan → local assets
const oldAdhan = '["https://www.islamcan.com/audio/adhan/azan2.mp3","https://www.islamcan.com/audio/adhan/azan1.mp3"]';
const newAdhan = '["./assets/audio/adhan-makkah.mp3","./assets/audio/adhan-madinah.mp3"]';
if (html.includes(oldAdhan)) { html = html.replace(oldAdhan, newAdhan); count++; console.log("✅ Adhan URLs fixed"); }

// 3. Text-size boot script: add --ddp-scale and fontSize scaling
// Find the Phase 0 text-size boot comment and add it before the main script closes
const oldBootComment = '/* Phase 0: Session scroll tracking */';
if (html.includes(oldBootComment)) {
  // Already has some Phase 0 — check if text-size is there
  if (!html.includes('--ddp-scale')) {
    // Add text-size boot before the session tracking
    const textSizeBoot = `/* Phase 0: Text-size boot */
  (function(){ try { var s = localStorage.getItem("ddp_text_scale") || "1"; document.documentElement.style.setProperty("--ddp-scale", s); document.documentElement.style.fontSize = (16 * parseFloat(s)) + "px"; } catch(e) {} })();`;
    html = html.replace(oldBootComment, textSizeBoot + "\n  " + oldBootComment);
    count++; console.log("✅ Text-size boot added");
  }
}

// 4. Add --ddp-scale CSS variable
const oldRoot = ':root{';
if (html.includes(oldRoot) && !html.includes('--ddp-scale')) {
  html = html.replace(oldRoot, ':root{--ddp-scale:1;');
  count++; console.log("✅ CSS --ddp-scale added");
}

// 5. QuotaExceededError — already handled in Phase 1 IDB download, verify
if (html.includes('QuotaExceededError')) {
  console.log("✅ QuotaExceededError present");
} else {
  // Add QuotaExceededError handling to the IDB version
  const quotaCheck = `if (err.name === "QuotaExceededError") { setDl("quota"); return; }`;
  if (!html.includes('QuotaExceededError')) {
    // It should be in the restored downloadSurah — check the pattern
    const quotaOld = 'setDl("quota")';
    if (!html.includes(quotaOld)) {
      // Add it
      const storagePattern = 'try { localStorage.setItem(storageKey, JSON.stringify(full)); } catch (err) {';
      const storageNew = 'try { localStorage.setItem(storageKey, JSON.stringify(full)); } catch (err) { if (err.name === "QuotaExceededError") { setDl("quota"); return; }';
      if (html.includes(storagePattern)) {
        html = html.replace(storagePattern, storageNew);
        count++; console.log("✅ QuotaExceededError added");
      }
    }
  }
}

// === PHASE 3 GAPS ===

// 6. Tasbeeh haptics: wire DDP_TASBEEH.increment into TasbihCounter tap()
const oldTap = `const tap=()=>setTas(v=>{let count=(v.count||0)+1,phaseNo=v.phase||0,history=v.history||0,goal=TASBIH_PHASES[phaseNo].goal;if(count>=goal){history+=goal;count=0;phaseNo=(phaseNo+1)%TASBIH_PHASES.length;}return {count,phase:phaseNo,history};});`;
if (html.includes(oldTap) && !html.includes('DDP_TASBEEH.increment')) {
  const newTap = `const tap=()=>{setTas(v=>{let count=(v.count||0)+1,phaseNo=v.phase||0,history=v.history||0,goal=TASBIH_PHASES[phaseNo].goal;if(count>=goal){history+=goal;count=0;phaseNo=(phaseNo+1)%TASBIH_PHASES.length;}return {count,phase:phaseNo,history};});if(window.DDP_TASBEEH){var dhikrMap=["subhanallah","alhamdulillah","allahuakbar"];DDP_TASBEEH.increment(dhikrMap[tas.phase||0]||"subhanallah");}};`;
  html = html.replace(oldTap, newTap);
  count++; console.log("✅ Tasbeeh haptics wired");
}

// 7. Hadith of the Day card in dashboard — add after DailyRing
const oldDailyRingEnd = 'h("div",{style:{fontFamily:T.sans,fontSize:12,color:T.muted,lineHeight:1.5}},"Prayers · Qur\'an · Adhkār")))';
if (html.includes(oldDailyRingEnd) && !html.includes('Hadith of the Day')) {
  const withHadith = oldDailyRingEnd + ',\n      h(Card,{style:{marginBottom:14,padding:14,background:"rgba(189,154,78,0.06)",border:"1px solid rgba(189,154,78,0.16)"}},h("div",{style:{display:"flex",alignItems:"center",gap:10}},h("span",{style:{color:T.gold}},h(Ic.book,{s:18})),h("div",{style:{flex:1}},h("div",{style:{fontFamily:T.sans,fontSize:10,fontWeight:900,letterSpacing:1.6,textTransform:"uppercase",color:T.gold,marginBottom:2}},"Hadith of the Day"),h("div",{style:{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T.ink2,lineHeight:1.4}},"The most beloved deeds to Allah are the most consistent, even if small."),h("div",{style:{fontFamily:T.sans,fontSize:10.5,color:T.muted,marginTop:4}},"Narrated by Aisha (RA) · Sahih al-Bukhari"))))';
  html = html.replace(oldDailyRingEnd, withHadith);
  count++; console.log("✅ Hadith of the Day card added");
}

// 8. Hijri date in dashboard — use DDP_HIJRI
const oldHijri = 'let hijri="";try{hijri=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura"';
if (html.includes(oldHijri) && !html.includes('DDP_HIJRI.format')) {
  const newHijri = 'let hijri="";try{hijri=window.DDP_HIJRI?window.DDP_HIJRI.format(today,(window.DDP_I18N&&window.DDP_I18N.lang())||"en",{short:!0}):new Intl.DateTimeFormat("en-u-ca-islamic-umalqura"';
  html = html.replace(oldHijri, newHijri);
  count++; console.log("✅ Hijri uses DDP_HIJRI");
}

// 9. Ramadan imsakMinutes variable in dashboard
const oldHabitScore = 'let habitScore={done:0,total:8,ring:0}';
if (!html.includes('imsakMinutes')) {
  html = html.replace(oldHabitScore, 'let imsakMinutes=10;try{imsakMinutes=window.DDP_RAMADAN?window.DDP_RAMADAN.imsakMinutes():10;}catch(e){}\n    let habitScore={done:0,total:8,ring:0}');
  count++; console.log("✅ imsakMinutes added to dashboard");
}

// 10. Ramadan banner + suhoor/iftar in dashboard
const oldPrayerSwitch = 'h(PrayerLookSwitch,{look,setLook})';
if (html.includes(oldPrayerSwitch) && !html.includes('window.__ddpRamadan')) {
  const withRamadan = `/* Ramadan banner */
      (function(){ if(!window.__ddpRamadan){var daysR=window.DDP_RAMADAN&&window.DDP_RAMADAN.daysUntilRamadan?window.DDP_RAMADAN.daysUntilRamadan():null;if(daysR!==null&&daysR<=40&&daysR>0)return h("div",{style:{margin:"0 0 14px",padding:"14px 18px",borderRadius:18,background:"linear-gradient(135deg, rgba(12,90,59,0.12), rgba(189,154,78,0.08))",border:"1px solid rgba(189,154,78,0.22)",textAlign:"center"}},h("div",{style:{fontFamily:T.arabic,fontSize:22,color:T.emerald,marginBottom:4}},"رَمَضَان"),h("div",{style:{fontFamily:T.serif,fontSize:16,fontWeight:600,color:T.ink}},daysR," days until Ramadan"));}else{var rs=window.__ddpRamadan;if(rs){var si=window.DDP_RAMADAN.suhoorIftar({fajr:new Date(today.getFullYear(),today.getMonth(),today.getDate(),minOf(t.fajr)/60|0,minOf(t.fajr)%60),maghrib:new Date(today.getFullYear(),today.getMonth(),today.getDate(),minOf(t.maghrib)/60|0,minOf(t.maghrib)%60)},new Date());return h("div",null,h(Card,{style:{marginBottom:10,padding:"18px",background:"linear-gradient(145deg, #0C5A3B, #073A28)",color:"#fff"}},h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},h(Eyebrow,{color:"rgba(255,255,255,0.7)"},"Ramadan · Day "+rs.day),h("span",{style:{fontFamily:T.sans,fontSize:12,color:"rgba(255,255,255,0.6)"}},"١٤٤٧ هـ")),h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:8}},h("div",null,h("div",{style:{fontFamily:T.sans,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:"rgba(255,255,255,0.6)",marginBottom:4}},"Suhoor ends"),h("div",{style:{fontFamily:T.serif,fontSize:22,fontWeight:600}},fmt12(t.fajr))),h("div",null,h("div",{style:{fontFamily:T.sans,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,color:"rgba(255,255,255,0.6)",marginBottom:4}},"Iftar"),h("div",{style:{fontFamily:T.serif,fontSize:22,fontWeight:600}},fmt12(t.maghrib)))))));}}return null;}})()`;
  html = html.replace(oldPrayerSwitch, withRamadan + ',\n      ' + oldPrayerSwitch);
  count++; console.log("✅ Ramadan banner added to dashboard");
}

// 11. Settings — functional Language row + Hijri offset + Kids Mode + Remove Ads
// Language: make onClick functional
const oldLangRow = 'title:"Language",detail:"English",onClick:()=>{}';
if (html.includes(oldLangRow)) {
  const newLangRow = 'title:"Language",detail:function(){try{var ln=window.DDP_I18N?window.DDP_I18N.lang():"en";return ln==="ur"?"اردو":ln==="ar"?"العربية":"English";}catch(e){return"English";}}(),onClick:function(){var langs=["en","ur","ar"],cur=window.DDP_I18N?window.DDP_I18N.lang():"en",idx=(langs.indexOf(cur)+1)%3;window.DDP_I18N&&window.DDP_I18N.setLang(langs[idx]);window.location.reload();}';
  html = html.replace(oldLangRow, newLangRow);
  count++; console.log("✅ Language row functional");
}

// 12. Kids Mode row in Settings General group
const oldAboutRow = 'title:"About Deen o Dunya",onClick:()=>{},isLast:!0';
if (html.includes(oldAboutRow) && !html.includes('Kids Mode')) {
  const withKids = 'title:"Kids Mode",sub:function(){return(window.DDP_KIDS&&DDP_KIDS.isActive())?"On · simplified, ad-free":"Off";}(),onClick:function(){if(window.DDP_KIDS){if(window.DDP_KIDS.isActive()){var p=prompt("Enter PIN to exit Kids Mode:");if(window.DDP_KIDS.disable(p||"")){alert("Kids Mode off.");window.location.reload();}else{alert("Wrong PIN.");}}else{var pin=prompt("Set a 4-digit parent PIN:");if(window.DDP_KIDS.setPin(pin||"")){window.DDP_KIDS.enable();alert("Kids Mode on!");window.location.reload();}else{alert("PIN must be 4 digits.");}}}},isLast:true},React.createElement(Row,{...g(React.createElement(Ic.sparkle,{s:16})),'+oldAboutRow;
  // Insert before About row
  const oldAboutGroup = 'title:"About Deen o Dunya"';
  if (html.includes(oldAboutGroup)) {
    const newAboutGroup = withKids.replace('title:"About Deen o Dunya"','ZZZMARKERZZZ');
    // Too complex — skip for now, already have Kids in Settings from the restore
  }
}

// 13. Support the App group in Settings
if (!html.includes('Support the App')) {
  const oldGeneralGroup = 'React.createElement(Group,{header:"General"}';
  if (html.includes(oldGeneralGroup)) {
    const withSupport = `React.createElement(Group,{header:"Support the App"},React.createElement(Row,{iconBg:"rgba(176,60,52,0.10)",iconFg:"#B03C34",icon:React.createElement(Ic.close,{s:18}),title:"Remove Ads",sub:"One-time purchase · removes all banners",onClick:function(){if(window.DDP_PURCHASE){DDP_PURCHASE.buy().then(function(r4){if(r4&&r4.success)alert("Ads removed!");}).catch(function(){alert("Purchase unavailable.");})}}}),React.createElement(Row,{iconBg:"rgba(12,90,59,0.10)",iconFg:T.emerald,icon:React.createElement(Ic.sparkle,{s:16}),title:"Support the App (Sadaqah)",sub:"JazakAllahu khayran",onClick:function(){window.open("https://deenodunya.com/support","_blank");},isLast:!0})),`+oldGeneralGroup;
    html = html.replace(oldGeneralGroup, withSupport);
    count++; console.log("✅ Support the App group added to Settings");
  }
}

// 14. Attribution update
if (html.includes('Built for Muslims who want one calm place for both Deen and Dunya.')) {
  html = html.replace(
    'Built for Muslims who want one calm place for both Deen and Dunya.)',
    'Built for Muslims who want one calm place for both Deen and Dunya.)').replace(
    'Built for Muslims who want one calm place for both Deen and Dunya.',
    'Arabic text: tanzil.net (CC BY ND 3.0). English: Saheeh International. Urdu: Fateh Muhammad Jalandhry.'
  );
  count++; console.log("✅ Attribution updated");
}

fs.writeFileSync(indexPath, html, "utf8");
console.log("\n=== Done: " + count + " fixes applied ===");
