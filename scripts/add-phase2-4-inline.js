const fs = require("fs");
const path = require("path");
const indexPath = path.join(__dirname, "..", "index.html");
let h = fs.readFileSync(indexPath, "utf8");
if (h.charCodeAt(0) === 0xFEFF) h = h.substring(1);

let changes = 0;

// 1. Ads guard + kids guard in go() function
const oldGo = ',go=e=>{e==="azkar"&&k(null);e==="quran"&&hSurah(null);r(e)},';
const newGo = ',go=e=>{e==="azkar"&&k(null);e==="quran"&&hSurah(null);r(e);window.__ddpCurrentScreen=e;var kids=window.DDP_KIDS&&window.DDP_KIDS.isActive();if(kids&&["tasks","settings","quranLog","goodDeeds","salahLog","prayerSettings","qibla","hadith","tafsir"].indexOf(e)!==-1){e="dashboard";}if(kids){if(window.DDP_ADS)DDP_ADS.hideBanner();}else{window.DDP_ADS&&DDP_ADS.onScreenChange(e);}},';
if (h.includes(oldGo)) { h = h.replace(oldGo, newGo); changes++; }

// 2. Hijri date in dashboard - replace Intl with DDP_HIJRI
const oldHijri = 'let hijri="";try{hijri=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura"';
const newHijri = 'let hijri="";try{hijri=window.DDP_HIJRI?window.DDP_HIJRI.format(today,(window.DDP_I18N&&window.DDP_I18N.lang())||"en",{short:!0}):new Intl.DateTimeFormat("en-u-ca-islamic-umalqura"';
if (h.includes(oldHijri)) { h = h.replace(oldHijri, newHijri); changes++; }

// 3. Language row in Settings - make functional
const oldLang = 'title:"Language",detail:"English",onClick:()=>{}';
const newLang = 'title:"Language",detail:function(){try{var ln=window.DDP_I18N?window.DDP_I18N.lang():"en";return ln==="ur"?"اردو":ln==="ar"?"العربية":"English";}catch(e){return"English";}}(),onClick:function(){var langs=["en","ur","ar"],cur=window.DDP_I18N?window.DDP_I18N.lang():"en",idx=(langs.indexOf(cur)+1)%3;window.DDP_I18N&&window.DDP_I18N.setLang(langs[idx]);window.location.reload();}';
if (h.includes(oldLang)) { h = h.replace(oldLang, newLang); changes++; }

// 4. Support the App group before General group
const oldGeneral = 'React.createElement(Group,{header:"General"}';
if (h.includes(oldGeneral) && !h.includes("Support the App")) {
  const supportGroup = 'React.createElement(Group,{header:"Support the App"},React.createElement(Row,{iconBg:"rgba(176,60,52,0.10)",iconFg:"#B03C34",icon:React.createElement(Ic.close,{s:18}),title:"Remove Ads",sub:"One-time purchase",onClick:function(){if(window.DDP_PURCHASE){DDP_PURCHASE.buy().then(function(r4){if(r4&&r4.success)alert("Ads removed!");}).catch(function(){alert("Purchase unavailable.");})}}}),React.createElement(Row,{iconBg:"rgba(12,90,59,0.10)",iconFg:T.emerald,icon:React.createElement(Ic.sparkle,{s:16}),title:"Support the App (Sadaqah)",sub:"JazakAllahu khayran",onClick:function(){window.open("https://deenodunya.com/support","_blank");},isLast:!0})),';
  h = h.replace(oldGeneral, supportGroup + oldGeneral);
  changes++;
}

// 5. Attribution text
const oldAttr = 'Built for Muslims who want one calm place for both Deen and Dunya.)';
const newAttr = 'Arabic text: tanzil.net (CC BY ND 3.0). English: Saheeh International. Urdu: Fateh Muhammad Jalandhry.)';
if (h.includes(oldAttr)) { h = h.replace(oldAttr, newAttr); changes++; }

// 6. Tasbeeh haptics - wire DDP_TASBEEH into tap function
const oldTap = 'const tap=()=>setTas(v=>{let count=(v.count||0)+1,phaseNo=v.phase||0,history=v.history||0,goal=TASBIH_PHASES[phaseNo].goal;if(count>=goal){history+=goal;count=0;phaseNo=(phaseNo+1)%TASBIH_PHASES.length;}return {count,phase:phaseNo,history};});';
const newTap = 'const tap=()=>{setTas(v=>{let count=(v.count||0)+1,phaseNo=v.phase||0,history=v.history||0,goal=TASBIH_PHASES[phaseNo].goal;if(count>=goal){history+=goal;count=0;phaseNo=(phaseNo+1)%TASBIH_PHASES.length;}return {count,phase:phaseNo,history};});if(window.DDP_TASBEEH){var dm=["subhanallah","alhamdulillah","allahuakbar"];DDP_TASBEEH.increment(dm[tas.phase||0]||"subhanallah");}};';
if (h.includes(oldTap)) { h = h.replace(oldTap, newTap); changes++; }

// 7. Hadith card in dashboard - after daily ring section
const oldHadithAnchor = 'h("div",{style:{fontFamily:T.sans,fontSize:12,color:T.muted,lineHeight:1.5}},"Prayers';
if (h.includes(oldHadithAnchor) && !h.includes("Hadith of the Day")) {
  const hadithCard = ',h(Card,{style:{marginBottom:14,padding:14,background:"rgba(189,154,78,0.06)",border:"1px solid rgba(189,154,78,0.16)"}},h("div",{style:{display:"flex",alignItems:"center",gap:10}},h("span",{style:{color:T.gold}},h(Ic.book,{s:18})),h("div",{style:{flex:1}},h("div",{style:{fontFamily:T.sans,fontSize:10,fontWeight:900,letterSpacing:1.6,textTransform:"uppercase",color:T.gold,marginBottom:2}},"Hadith of the Day"),h("div",{style:{fontFamily:T.serif,fontSize:14,fontStyle:"italic",color:T.ink2,lineHeight:1.4}},"The most beloved deeds to Allah are the most consistent, even if small."),h("div",{style:{fontFamily:T.sans,fontSize:10.5,color:T.muted,marginTop:4}},"Narrated by Aisha (RA) · Sahih al-Bukhari"))))';
  // Find the end of the DailyRing section and insert
  const anchorEnd = 'h("div",{style:{fontFamily:T.sans,fontSize:12,color:T.muted,lineHeight:1.5}},"Prayers · Qur\'an · Adhkār"))),';
  if (h.includes(anchorEnd)) {
    h = h.replace(anchorEnd, anchorEnd + hadithCard);
    changes++;
  }
}

// 8. Ramadan activation in boot
const oldBootEnd = 'if (window.DDP_HABITS) DDP_HABITS.recalcStreak();';
const newBootEnd = 'if (window.DDP_HABITS) DDP_HABITS.recalcStreak();if(window.DDP_RAMADAN&&window.DDP_HIJRI){var rs=DDP_RAMADAN.ramadanStatus();window.__ddpRamadan=rs.inRamadan?rs:null;}';
if (h.includes(oldBootEnd)) { h = h.replace(oldBootEnd, newBootEnd); changes++; }

// 9. Perf + Ads init in boot
const oldBootEnd2 = 'if (window.DDP_RAMADAN';
if (!h.includes('DDP_PERF.profile') && h.includes(oldBootEnd2)) {
  const perfInit = 'if(window.DDP_PERF){window.__ddpPerf=DDP_PERF.profile();DDP_PERF.preloadFonts();}if(window.DDP_ADS){DDP_ADS.init();DDP_ADS.bindAudioGuard(function(){return window.__ddpCurrentScreen||"dashboard";});}';
  h = h.replace(oldBootEnd2, perfInit + oldBootEnd2);
  changes++;
}

// 10. Background audio in boot
if (!h.includes('DDP_BGAUDIO.bindToPlayer')) {
  const bgaInit = 'if(window.DDP_BGAUDIO&&window.DDP_AUDIO&&window.DDP_AUDIO.element){window.DDP_BGAUDIO.bindToPlayer({onNext:function(){if(window.__ddpNextAyah)window.__ddpNextAyah();},onPrev:function(){if(window.__ddpPrevAyah)window.__ddpPrevAyah();}});}';
  h = h.replace('if(window.DDP_ADS){DDP_ADS.init();', bgaInit + 'if(window.DDP_ADS){DDP_ADS.init();');
  changes++;
}

fs.writeFileSync(indexPath, h, "utf8");
console.log("✅", changes, "inline changes applied. Size:", h.length);

// Verify syntax
const vm = require("vm");
const html = fs.readFileSync(indexPath, "utf8");
var start = html.indexOf('<script>\n/**');
if (start === -1) start = html.indexOf('<script>\r\n/**');
start += 8;
var end = html.indexOf("ReactDOM.createRoot");
end = html.indexOf("</script>", end);
var js = html.substring(start, end);
try {
  new vm.Script(js);
  console.log("✅ JS syntax OK!");
} catch(e) {
  console.log("❌ SYNTAX ERROR:", e.message.substring(0, 200));
  var m = e.stack.match(/<anonymous>:(\d+)/);
  if (m) console.log("JS line:", m[1]);
}
