// Clean restore: Remove broken Phase 2-4 inline code, keep Phase 1 + boot only
const fs = require("fs");
const path = require("path");
const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

// Remove the broken Phase 2-4 block (from "/* Phase 2-4 + 0b boot */" to just before "App=function EnhancedApp()")
const bootStart = html.indexOf("/* Phase 2-4 + 0b boot */");
const appStart = html.indexOf("App=function EnhancedApp()");

if (bootStart > 0 && appStart > bootStart) {
  // Replace everything between boot start and App with just the boot function
  const before = html.substring(0, bootStart);
  const after = html.substring(appStart);

  // Minimal boot function
  const minimalBoot = `
  /* Phase 0b-4 boot */
  async function ddpBoot(st,st2,os){try{
    if(window.DDP_I18N)DDP_I18N.apply();
    if(window.DDP_HABITS)DDP_HABITS.recalcStreak();
    if(window.DDP_PERF){var pf=DDP_PERF.profile();window.__ddpPerf=pf;}
    if(window.DDP_ADS){DDP_ADS.init();DDP_ADS.bindAudioGuard(function(){return window.__ddpCurrentScreen||"dashboard";});}
    if(window.DDP_BGAUDIO&&window.DDP_AUDIO&&window.DDP_AUDIO.element){window.DDP_BGAUDIO.bindToPlayer({onNext:function(){if(window.__ddpNextAyah)window.__ddpNextAyah();},onPrev:function(){if(window.__ddpPrevAyah)window.__ddpPrevAyah();}});}
    if(window.DDP_RAMADAN&&window.DDP_HIJRI){var rs=DDP_RAMADAN.ramadanStatus();window.__ddpRamadan=rs.inRamadan?rs:null;}
    var od=localStorage.getItem("ddp_onboard_v1");if(!od){st("onboarding");return;}
    if(window.DDP_STATE){var sv=window.DDP_STATE.get();if(sv.tab)st2(sv.tab);if(sv.surah&&os)os(sv.surah,sv.ayah||1);}
    if(window.DDP_NOTIFY&&window.DDP_NOTIFY.needsRefresh()){window.DDP_NOTIFY.requestPermission().then(function(g2){if(g2)scheduleNotifications();});}
  }catch(e){console.warn("[ddp]",e);}}
  async function ddpPostOnboard(st){localStorage.setItem("ddp_onboard_v1","1");st("dashboard");}
  async function scheduleNotifications(){if(!window.DDP_NOTIFY)return;var l=window.DDP_LOC&&window.DDP_LOC.saved()?window.DDP_LOC.saved():{lat:24.8607,lon:67.0011};var m={};var td=new Date();for(var i=0;i<7;i++){var d=new Date(td);d.setDate(d.getDate()+i);var k=d.toISOString().slice(0,10);var cf=window.__ddpCalculatePrayerTimes;if(cf){var t=cf(d,l.lat||24.8607,l.lon||67.0011,"karachi");var dm={fajr:new Date(d),dhuhr:new Date(d),asr:new Date(d),maghrib:new Date(d),isha:new Date(d)};if(t&&t.fajr){["fajr","dhuhr","asr","maghrib","isha"].forEach(function(p){var ps=(t[p]||"00:00").split(":");dm[p].setHours(+ps[0],+ps[1]||0,0,0);});m[k]=dm;}}}await DDP_NOTIFY.scheduleAll(m);}
  function Onboarding(_a){var onDone=_a.onDone;var LANGS=[{key:"en",label:"English",native:"English"},{key:"ur",label:"Urdu",native:"اردو"},{key:"ar",label:"Arabic",native:"العربية"}];var _b=React.useState(0),step=_b[0],setStep=_b[1];var _c=React.useState(function(){try{return localStorage.getItem("ddp_lang")||"en";}catch(e){return"en";}}),lang=_c[0];var _d=React.useState(""),s=_d[0],ss=_d[1];var _e=React.useState(null),pk=_e[0],sp=_e[1];var cities=(window.DDP_CITIES&&window.DDP_CITIES.all)?window.DDP_CITIES.all():[{label:"Karachi, Pakistan",lat:24.8607,lon:67.0011}];if(s.trim())cities=cities.filter(function(c){return c.label.toLowerCase().indexOf(s.toLowerCase())!==-1;});return h("div",{style:{minHeight:"100%",background:"radial-gradient(120% 55% at 80% -5%, #FBF6EA, #F4EEE0, #EFE7D6)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"30px 24px"}},step===0?h("div",{style:{textAlign:"center",maxWidth:340}},h("div",{style:{fontFamily:T.serif,fontSize:34,fontWeight:600,color:T.emerald}},"Deen o Dunya"),h("div",{style:{fontFamily:T.arabic,fontSize:30,color:T.gold,marginBottom:24}},"دین و دنیا"),h(Eyebrow,{style:{marginBottom:18}},"Choose language"),LANGS.map(function(l){return h("button",{key:l.key,onClick:function(){if(window.DDP_I18N)DDP_I18N.setLang(l.key);setStep(1);},style:{display:"block",width:"100%",border:"none",borderRadius:18,padding:"18px 20px",marginBottom:12,background:lang===l.key?T.emerald:"rgba(33,48,42,0.06)",color:lang===l.key?"#fff":T.ink,fontFamily:T.sans,fontSize:17,fontWeight:700,cursor:"pointer"}},l.native+" · "+l.label);})):step===1?h("div",{style:{width:"100%",maxWidth:380}},h("button",{onClick:function(){setStep(0);},style:{border:"none",background:"transparent",display:"inline-flex",alignItems:"center",gap:5,marginBottom:16,color:T.ink2,cursor:"pointer",fontFamily:T.sans,fontSize:14,fontWeight:700}},h(Ic.arrowL,{s:19})," Back"),h("input",{value:s,onChange:function(e){ss(e.target.value);},placeholder:"Search city…",style:{width:"100%",border:"1px solid rgba(33,48,42,0.10)",borderRadius:16,padding:"14px 16px",fontFamily:T.sans,fontSize:15,color:T.ink,outline:"none",marginBottom:14,background:T.card}}),h("div",{style:{maxHeight:380,overflow:"auto"}},h("button",{onClick:function(){if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(p){var c2={label:"GPS Location",lat:p.coords.latitude,lon:p.coords.longitude};DDP_LOC.save(c2);sp(c2);setStep(2);},function(){alert("Could not get location.");});}},style:{width:"100%",border:"1px dashed rgba(33,48,42,0.14)",borderRadius:14,padding:"13px 16px",marginBottom:10,background:"rgba(33,48,42,0.03)",color:T.emerald,fontFamily:T.sans,fontSize:14,fontWeight:700,cursor:"pointer"}},h(Ic.pin,{s:15})," Use GPS instead"),cities.slice(0,40).map(function(c,i){return h("button",{key:i,onClick:function(){DDP_LOC.save(c);sp(c);setStep(2);},style:{display:"block",width:"100%",border:"none",borderRadius:12,padding:"13px 16px",marginBottom:4,background:"rgba(33,48,42,0.04)",color:T.ink,textAlign:"left",fontFamily:T.sans,fontSize:14,fontWeight:600,cursor:"pointer"}},c.label);}))):h("div",{style:{textAlign:"center",maxWidth:340}},h("div",{style:{width:72,height:72,borderRadius:36,background:"rgba(12,90,59,0.10)",color:T.emerald,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}},h(Ic.check,{s:34})),h("div",{style:{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T.ink,marginBottom:8}},"You're all set!"),pk?h("div",{style:{fontFamily:T.sans,fontSize:13,color:T.ink2,marginBottom:20}},h("strong",null,pk.label)):null,h("button",{onClick:function(){onDone();},style:{border:"none",borderRadius:999,padding:"16px 40px",background:T.emerald,color:"#fff",fontFamily:T.sans,fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 24px rgba(12,90,59,0.28)",marginBottom:16}},"Start using the app"));}

  html = before + minimalBoot + "\n" + after;

  // Now fix the App routing: add onboarding case, fix go(), add boot useEffect
  // Fix 1: Add onboarding to active tab list
  html = html.replace(
    'n==="tasks"||n==="settings"||n==="more"||n==="quranLog"||n==="goodDeeds"||n==="salahLog"||n==="prayerSettings"?"more":n',
    'n==="tasks"||n==="settings"||n==="more"||n==="quranLog"||n==="goodDeeds"||n==="salahLog"||n==="prayerSettings"||n==="onboarding"?"more":n'
  );

  // Fix 2: Add boot useEffect
  html = html.replace(
    'React.useEffect(()=>{const e=new Date,t=String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0");var p=P?c:(window.__ddpPrayerTimes||c);',
    'React.useEffect(function(){ddpBoot(r,function(){},hSurah);},[]);React.useEffect(()=>{const e=new Date,t=String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0");var p2=P?c:(window.__ddpPrayerTimes||c);'
  );

  // Fix 3: Add onboarding to switch BEFORE "case:more"
  html = html.replace(
    'case"azkar":return h(Azkar,{openCatId:v,setOpenCatId:k});case"more":return h(More,{go,deenPct:m,dunyaPct:f});',
    'case"azkar":return h(Azkar,{openCatId:v,setOpenCatId:k});case"onboarding":return h(Onboarding,{onDone:function(){ddpPostOnboard(r);}});case"more":return h(More,{go,deenPct:m,dunyaPct:f});'
  );

  // Fix 4: Update go() with kids + ads guard
  html = html.replace(
    ',go=e=>{e==="azkar"&&k(null);e==="quran"&&hSurah(null);r(e)},openDaily=',
    ',go=e=>{e==="azkar"&&k(null);e==="quran"&&hSurah(null);r(e);window.__ddpCurrentScreen=e;if(window.DDP_KIDS&&window.DDP_KIDS.isActive()){if(window.DDP_ADS)DDP_ADS.hideBanner();}else{window.DDP_ADS&&DDP_ADS.onScreenChange(e);}},openDaily='
  );

  fs.writeFileSync(indexPath, html, "utf8");
  console.log("✅ Clean restore complete. Phase 1 + minimal boot + onboarding only.");
} else {
  console.log("ERROR: Could not find boot block or App function.");
  console.log("bootStart:", bootStart, "appStart:", appStart);
}
