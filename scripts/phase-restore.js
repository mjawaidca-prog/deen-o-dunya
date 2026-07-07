// Restore Phase 2-4 + 0b inline code to index.html
const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

// 1. Fix adhan URLs (islamcan → local)
html = html.replace(
  '["https://www.islamcan.com/audio/adhan/azan2.mp3","https://www.islamcan.com/audio/adhan/azan1.mp3"]',
  '["./assets/audio/adhan-makkah.mp3","./assets/audio/adhan-madinah.mp3"]'
);

// 2. Replace App function with enhanced version (before the closing of Phase 1 IIFE)
const oldApp = `App=function EnhancedApp(){const[n,r]=React.useState("dashboard")`;
const newPreCode = `/* Phase 2-4 + 0b boot */
async function ddpBoot(st,st2,os){try{if(window.DDP_DB){var mv=await DDP_DB.migrateLegacy();var bl=await DDP_DB.get("kv","bundle_loaded");if(!bl)await loadQuranBundle();}if(window.QURAN_CONTENT){Object.values(window.QURAN_CONTENT).forEach(function(s){if(s&&s.ayahs)s.ayahs.forEach(function(a){if(a.tafsir){delete a.tafsir.ghamidi;delete a.tafsir.maududi;delete a.tafsir.islahi;}});});}if(window.DDP_I18N)DDP_I18N.apply();if(window.DDP_HABITS)DDP_HABITS.recalcStreak();if(window.DDP_PERF){var pf=DDP_PERF.profile();window.__ddpPerf=pf;if(!pf.animations)document.documentElement.style.setProperty("--ddp-animations","none");if(!pf.shadowEffects)document.documentElement.style.setProperty("--ddp-shadows","none");DDP_PERF.preloadFonts();}if(window.DDP_ADS){DDP_ADS.init();DDP_ADS.bindAudioGuard(function(){return window.__ddpCurrentScreen||"dashboard";});}if(window.DDP_BGAUDIO&&window.DDP_AUDIO&&window.DDP_AUDIO.element){window.DDP_BGAUDIO.bindToPlayer({onNext:function(){if(window.__ddpNextAyah)window.__ddpNextAyah();},onPrev:function(){if(window.__ddpPrevAyah)window.__ddpPrevAyah();}});if(window.DDP_AUDIO.element){window.DDP_AUDIO.element.addEventListener("play",function(){if(window.__ddpNowPlaying)window.DDP_BGAUDIO.updateNowPlaying(window.__ddpNowPlaying.surah||"",window.__ddpNowPlaying.ayah||"",window.__ddpNowPlaying.reciter||"");});}}if(window.DDP_RAMADAN&&window.DDP_HIJRI){var rs=window.DDP_RAMADAN.ramadanStatus();window.__ddpRamadan=rs.inRamadan?rs:null;}var od=localStorage.getItem("ddp_onboard_v1");if(!od){st("onboarding");return;}if(window.DDP_STATE){var sv=window.DDP_STATE.get();if(sv.tab)st2(sv.tab);if(sv.surah&&os)os(sv.surah,sv.ayah||1);}if(window.DDP_NOTIFY&&window.DDP_NOTIFY.needsRefresh()){var g2=await window.DDP_NOTIFY.requestPermission();if(g2&&typeof schedulePrayerNotifications==="function")schedulePrayerNotifications();}}catch(e){console.warn("[ddp] Boot error:",e);}}
async function ddpPostOnboard(st){localStorage.setItem("ddp_onboard_v1","1");if(typeof schedulePrayerNotifications==="function")await schedulePrayerNotifications();st("dashboard");}
var _bs=null,_bp=0;
async function loadQuranBundle(){_bs="loading";_bp=0;try{var r2=await fetch("./quran-bundle.json.gz");if(!r2.ok)throw new Error("HTTP "+r2.status);var data=await r2.json();var keys=Object.keys(data.surahs);for(var i=0;i<keys.length;i++){await DDP_DB.set("quran",parseInt(keys[i]),data.surahs[keys[i]]);if(i%10===9)_bp=Math.round(((i+1)/114)*100);}await DDP_DB.set("kv","bundle_loaded",{at:Date.now(),version:data.version});_bs="done";_bp=100;}catch(e){_bs="error";}}
async function schedulePrayerNotifications(){if(!window.DDP_NOTIFY)return;var loc2=(window.DDP_LOC&&window.DDP_LOC.saved())?window.DDP_LOC.saved():{lat:24.8607,lon:67.0011};var lf=loc2&&loc2.lat?loc2:{lat:24.8607,lon:67.0011};var ptm={};var td2=new Date();for(var i=0;i<7;i++){var d2=new Date(td2);d2.setDate(d2.getDate()+i);var key=d2.toISOString().slice(0,10);var cf=window.__ddpCalculatePrayerTimes;if(cf){var times=cf(d2,lf.lat,lf.lon,"karachi");var dm={fajr:new Date(d2),dhuhr:new Date(d2),asr:new Date(d2),maghrib:new Date(d2),isha:new Date(d2)};if(times&&times.fajr){["fajr","dhuhr","asr","maghrib","isha"].forEach(function(p2){var parts=(times[p2]||"00:00").split(":");dm[p2].setHours(+parts[0],+parts[1]||0,0,0);});ptm[key]=dm;}}}await DDP_NOTIFY.scheduleAll(ptm);if(window.DDP_HABITS){var stre=window.DDP_HABITS.getStreak();DDP_NOTIFY.scheduleJumahSummary(stre,75);}}
function DailyRing(_a){var done=_a.done||0,total=_a.total||8,streak=_a.streak||0,R=52,CX=64,CY=64,GAP=4,segDeg=(360/total)-GAP;var segs=[];for(var i=0;i<total;i++){var sa=(i*(360/total))-90,ea=sa+segDeg,filled=i<done;var toR=function(a){return a*Math.PI/180;};var x1=CX+R*Math.cos(toR(sa)),y1=CY+R*Math.sin(toR(sa)),x2=CX+R*Math.cos(toR(ea)),y2=CY+R*Math.sin(toR(ea));segs.push(h("path",{key:i,d:"M "+x1+" "+y1+" A "+R+" "+R+" 0 "+(segDeg>180?1:0)+" 1 "+x2+" "+y2,stroke:filled?T.emerald:"rgba(33,48,42,0.08)",strokeWidth:10,fill:"none",strokeLinecap:"round"}));}return h("svg",{width:128,height:128,viewBox:"0 0 128 128"},segs,h("text",{x:CX,y:CY+5,textAnchor:"middle",fontSize:18,fill:T.emerald,fontFamily:"Newsreader,serif"},done+"/"+total),streak>0?h("text",{x:CX,y:CY+22,textAnchor:"middle",fontSize:10,fill:T.muted,fontFamily:T.sans},streak+" day streak"):null);}
function Onboarding(_a){var onDone=_a.onDone;var LANGUAGES=[{key:"en",label:"English",native:"English"},{key:"ur",label:"Urdu",native:"اردو"},{key:"ar",label:"Arabic",native:"العربية"}];var _b=React.useState(0),step=_b[0],setStep=_b[1];var _c=React.useState(function(){try{return localStorage.getItem("ddp_lang")||"en";}catch(e){return"en";}}),lang=_c[0];var _d=React.useState(""),srch=_d[0],setSrch=_d[1];var _e=React.useState(function(){return(window.DDP_LOC&&DDP_LOC.saved())?DDP_LOC.saved():null;}),picked=_e[0],setPicked=_e[1];var cities=(window.DDP_CITIES&&window.DDP_CITIES.all)?window.DDP_CITIES.all():[{label:"Karachi, Pakistan",lat:24.8607,lon:67.0011}];if(srch.trim())cities=cities.filter(function(c){return c.label.toLowerCase().indexOf(srch.toLowerCase())!==-1;});var pickCity=function(city){DDP_LOC.save(city);setPicked(city);setStep(2);};return h("div",{style:{minHeight:"100%",background:"radial-gradient(120% 55% at 80% -5%, #FBF6EA, #F4EEE0, #EFE7D6)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"30px 24px"}},step===0?h("div",{style:{textAlign:"center",maxWidth:340}},h("div",{style:{fontFamily:T.serif,fontSize:34,fontWeight:600,color:T.emerald,marginBottom:6}},"Deen o Dunya"),h("div",{style:{fontFamily:T.arabic,fontSize:30,color:T.gold,marginBottom:24}},"دین و دنیا"),h(Eyebrow,{style:{marginBottom:18}},"Choose language"),LANGUAGES.map(function(l2){return h("button",{key:l2.key,onClick:function(){if(window.DDP_I18N)DDP_I18N.setLang(l2.key);setStep(1);},style:{display:"block",width:"100%",border:"none",borderRadius:18,padding:"18px 20px",marginBottom:12,background:lang===l2.key?T.emerald:"rgba(33,48,42,0.06)",color:lang===l2.key?"#fff":T.ink,fontFamily:T.sans,fontSize:17,fontWeight:700,cursor:"pointer"}},l2.native+" · "+l2.label);})):step===1?h("div",{style:{width:"100%",maxWidth:380}},h("button",{onClick:function(){setStep(0);},style:{border:"none",background:"transparent",display:"inline-flex",alignItems:"center",gap:5,marginBottom:16,color:T.ink2,cursor:"pointer",fontFamily:T.sans,fontSize:14,fontWeight:700}},h(Ic.arrowL,{s:19})," Back"),h(Eyebrow,{style:{marginBottom:8}},"Select your city"),h("input",{value:srch,onChange:function(e){setSrch(e.target.value);},placeholder:"Search city…",style:{width:"100%",border:"1px solid rgba(33,48,42,0.10)",borderRadius:16,padding:"14px 16px",fontFamily:T.sans,fontSize:15,color:T.ink,outline:"none",marginBottom:14,background:T.card}}),h("div",{style:{maxHeight:380,overflow:"auto"}},h("button",{onClick:function(){if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(pos){var c2={label:"GPS Location",lat:pos.coords.latitude,lon:pos.coords.longitude};DDP_LOC.save(c2);setPicked(c2);setStep(2);},function(){alert("Could not get location.");});}},style:{width:"100%",border:"1px dashed rgba(33,48,42,0.14)",borderRadius:14,padding:"13px 16px",marginBottom:10,background:"rgba(33,48,42,0.03)",color:T.emerald,fontFamily:T.sans,fontSize:14,fontWeight:700,cursor:"pointer"}},h(Ic.pin,{s:15})," Use GPS instead"),cities.slice(0,40).map(function(c3,i){return h("button",{key:i,onClick:function(){pickCity(c3);},style:{display:"block",width:"100%",border:"none",borderRadius:12,padding:"13px 16px",marginBottom:4,background:"rgba(33,48,42,0.04)",color:T.ink,textAlign:"left",fontFamily:T.sans,fontSize:14,fontWeight:600,cursor:"pointer"}},c3.label);}))):step===2?h("div",{style:{textAlign:"center",maxWidth:340}},h("div",{style:{width:72,height:72,borderRadius:36,background:"rgba(12,90,59,0.10)",color:T.emerald,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}},h(Ic.check,{s:34})),h("div",{style:{fontFamily:T.serif,fontSize:28,fontWeight:600,color:T.ink,marginBottom:8}},"You're all set!"),h("div",{style:{fontFamily:T.sans,fontSize:14,color:T.muted,marginBottom:6}},"Your prayer times are ready."),picked?h("div",{style:{fontFamily:T.sans,fontSize:13,color:T.ink2,marginBottom:20}},h("strong",null,picked.label)):null,h("button",{onClick:function(){onDone();},style:{border:"none",borderRadius:999,padding:"16px 40px",background:T.emerald,color:"#fff",fontFamily:T.sans,fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 24px rgba(12,90,59,0.28)",marginBottom:16}},"Start using the app"),h("br"),h("button",{onClick:function(){onDone();},style:{border:"none",background:"transparent",color:T.muted,fontFamily:T.sans,fontSize:13,cursor:"pointer"}},"No thanks, maybe later")):null);}
function SearchScreen(_a){var back2=_a.back,go2=_a.go;var _b2=React.useState(""),query=_b2[0],setQuery=_b2[1];var _c2=React.useState(null),results=_c2[0],setResults=_c2[1];var _d2=React.useState("all"),langF=_d2[0],setLangF=_d2[1];var _e2=React.useState(false),idxing=_e2[0],setIdxing=_e2[1];var doSearch=function(q){if(!q.trim())return;if(!window.DDP_SEARCH)return;setIdxing(true);window.DDP_SEARCH.search(q,{lang:langF,limit:50}).then(function(r3){setResults(r3);setIdxing(false);}).catch(function(){setIdxing(false);});};return h("div",null,h(ScreenHeader,{back:back2,eyebrow:"Search the Qur'an",title:"Search"}),h("div",{style:{padding:"0 18px 18px"}},h("div",{style:{display:"flex",gap:8,marginBottom:12}},h("input",{value:query,onChange:function(e){setQuery(e.target.value);},onKeyDown:function(e){if(e.key==="Enter")doSearch(query);},placeholder:"Search Arabic, English, Urdu…",style:{flex:1,border:"1px solid rgba(33,48,42,0.12)",borderRadius:14,padding:"12px 14px",fontFamily:T.sans,fontSize:14.5,color:T.ink,outline:"none",background:T.card}}),h("button",{onClick:function(){doSearch(query);},style:{border:"none",borderRadius:14,padding:"12px 18px",background:T.emerald,color:"#fff",fontFamily:T.sans,fontSize:13,fontWeight:700,cursor:"pointer"}},"Search")),h("div",{style:{display:"flex",gap:6,marginBottom:14}},[["all","All"],["ar","العربية"],["en","English"],["ur","اردو"]].map(function(c4){return h("button",{key:c4[0],onClick:function(){setLangF(c4[0]);if(query.trim())doSearch(query);},style:{border:"none",borderRadius:999,padding:"8px 14px",background:langF===c4[0]?T.emerald:"rgba(33,48,42,0.06)",color:langF===c4[0]?"#fff":T.muted,fontFamily:T.sans,fontSize:11.5,fontWeight:700,cursor:"pointer"}},c4[1]);})),idxing?h("div",{style:{textAlign:"center",padding:30,color:T.muted,fontFamily:T.sans}},"Searching…"):results===null?h("div",{style:{textAlign:"center",padding:40,color:T.faint,fontFamily:T.sans}},"Type and press Enter to search the Qur'an offline."):results.length===0?h("div",{style:{textAlign:"center",padding:40,color:T.faint,fontFamily:T.sans}},"No results found."):h("div",null,results.map(function(r3,i){return h(Card,{key:i,style:{marginBottom:8,padding:14},onClick:function(){go2&&go2("quran");setTimeout(function(){if(window.__openSurahAndAyah)window.__openSurahAndAyah(r3.surah,r3.ayah);},100);}},h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},h(Eyebrow,null,"Surah "+r3.surahName+" · Ayah "+r3.ayah),h("span",{style:{fontFamily:T.arabic,fontSize:18,color:T.gold}},r3.ar?r3.ar.substring(0,50)+(r3.ar.length>50?"…":""):"")),h("div",{style:{fontFamily:T.serif,fontSize:13,color:T.ink2,lineHeight:1.5}},r3.en?r3.en.substring(0,120)+(r3.en.length>120?"…":""):""),r3.ur?h("div",{style:{fontFamily:T.urdu,fontSize:14,color:T.muted,textAlign:"right",direction:"rtl",marginTop:4}},r3.ur.substring(0,100)+(r3.ur.length>100?"…":"")):null);})))));}
function RamadanLog(_a){var hijriYear=_a.hijriYear,back3=_a.back;var _b3=React.useState([]),days=_b3[0],setDays=_b3[1];React.useEffect(function(){setDays(Array.from({length:30},function(_,i){return{day:i+1};}));},[]);var markDay=function(day,status,reason){if(window.DDP_RAMADAN){DDP_RAMADAN.markFast(hijriYear,day,status,reason).then(function(){setDays(function(prev){var n2=prev.slice();n2[day-1]={day:day,fasted:status==="fasted",exempt:status==="exempt"?reason:null};return n2;});});}};return h("div",null,h(ScreenHeader,{back:back3,eyebrow:"Ramadan "+hijriYear+" AH",title:"Fasting Log"}),h("div",{style:{padding:"0 18px 18px"}},h("div",{style:{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}},Array.from({length:30},function(_,i){var d2=i+1,day=days[i]||{day:d2};var bg2="rgba(33,48,42,0.06)",color2=T.muted;if(day.fasted===true){bg2="rgba(12,90,59,0.14)";color2=T.emerald;}else if(day.fasted===false&&!day.exempt){bg2="rgba(176,60,52,0.10)";color2="#B03C34";}else if(day.exempt){bg2="rgba(74,110,140,0.12)";color2="#3E6A8C";}return h("button",{key:d2,onClick:function(){var cur=day.fasted===true?"fasted":day.exempt?"exempt":"none";var next=cur==="none"?"fasted":cur==="fasted"?"missed":cur==="missed"?"exempt":"none";markDay(d2,next==="exempt"?"exempt":next,next==="exempt"?"other":null);},style:{border:"none",borderRadius:14,padding:"12px 6px",background:bg2,color:color2,fontFamily:T.sans,fontSize:13,fontWeight:700,cursor:"pointer"}},d2,"\\n",day.fasted===true?"✓":day.exempt?"~":"");})))));}
App=function EnhancedApp(){`;

if (html.includes(oldApp)) {
  html = html.replace(oldApp, newPreCode + oldApp.slice(oldApp.indexOf("const[n,r]=")));
  console.log("Boot functions + components inserted.");
} else {
  console.log("WARNING: Could not find App function anchor.");
}

// 3. Add onboarding + search + ramadanLog to routing
// Replace the go function to include kids guard + ads onScreenChange
const oldGo = `,go=e=>{e==="azkar"&&k(null);e==="quran"&&hSurah(null);r(e)},openDaily=`;
const newGo = `,go=e=>{e==="azkar"&&k(null);e==="quran"&&hSurah(null);var kids=window.DDP_KIDS&&window.DDP_KIDS.isActive();if(kids&&["tasks","settings","quranLog","goodDeeds","salahLog","prayerSettings","qibla","hadith","tafsir"].indexOf(e)!==-1){e="dashboard";}r(e);window.__ddpCurrentScreen=e;if(kids){if(window.DDP_ADS)DDP_ADS.hideBanner();}else{window.DDP_ADS&&DDP_ADS.onScreenChange(e);}},openDaily=`;
if (html.includes(oldGo)) {
  html = html.replace(oldGo, newGo);
  console.log("go() function updated.");
}

// 4. Add onboarding + search + ramadanLog to switch statement
const oldSwitch = `case"more":return h(More,{go,deenPct:m,dunyaPct:f});case"tasks"`;
const newSwitch = `case"onboarding":return h(Onboarding,{onDone:function(){ddpPostOnboard(r);}});case"dashboard":return h(Dashboard,{go,openDaily,adhan:a,setAdhan:s,deenPct:m,dunyaPct:f,versesDone:N,times:c,adhanTimes:c,useOwnTimes:P,adhanPlaying:w,onPreviewAdhan:V});case"quran":return h(Quran,{surah:R,setSurah:hSurah,qari:d,setQari:M});case"salahLog":return h(SalahLogScreen,{times:c,back:()=>r("dashboard")});case"quranLog":return h(QuranLogScreen,{times:c,back:()=>r("dashboard")});case"goodDeeds":return h(GoodDeedsScreen,{times:c,back:()=>r("dashboard")});case"prayerSettings":return h(PrayerSettingsScreen,{times:c,back:()=>r("more")});case"search":return h(SearchScreen,{back:()=>r("quran"),go});case"ramadanLog":return h(RamadanLog,{hijriYear:window.__ddpRamadan?window.__ddpRamadan.hijriYear:1447,back:()=>r("dashboard")});case"tafsir":return window.TafsirTab?h(window.TafsirTab,null):null;case"hadith":return window.HadithTab?h(window.HadithTab,null):null;case"qibla":return h(Qibla,null);case"azkar":return h(Azkar,{openCatId:v,setOpenCatId:k});case"more":return h(More,{go,deenPct:m,dunyaPct:f});case"tasks"`;
if (html.includes(oldSwitch)) {
  html = html.replace(oldSwitch, newSwitch);
  console.log("Switch statement updated.");
}

// 5. Add boot useEffect
const oldEffect = `React.useEffect(()=>{const e=new Date,t=String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0");var p=P?c:(window.__ddpPrayerTimes||c);for(const b of Object.keys(p))if(p[b]===t&&a[b]){const q=b+"@"+e.toDateString()+" "+t;A.current!==q&&(A.current=q,I())}},[U,P,c,a]);const active=`;
const newEffect = `React.useEffect(()=>{const e=new Date,t=String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0");var p2=P?c:(window.__ddpPrayerTimes||c);for(const b of Object.keys(p2))if(p2[b]===t&&a[b]){const q=b+"@"+e.toDateString()+" "+t;A.current!==q&&(A.current=q,I())}},[U,P,c,a]);React.useEffect(function(){ddpBoot(r,function(){},hSurah);},[]);const active=`;
if (html.includes(oldEffect)) {
  html = html.replace(oldEffect, newEffect);
  console.log("Boot useEffect added.");
}

// 6. Add onboarding to active tab detection
const oldActive = `n==="tasks"||n==="settings"||n==="more"||n==="quranLog"||n==="goodDeeds"||n==="salahLog"||n==="prayerSettings"?"more":n`;
const newActive = `n==="tasks"||n==="settings"||n==="more"||n==="quranLog"||n==="goodDeeds"||n==="salahLog"||n==="prayerSettings"||n==="onboarding"?"more":n`;
if (html.includes(oldActive)) {
  html = html.replace(oldActive, newActive);
  console.log("Active tab updated for onboarding.");
}

// 7. Update version string
html = html.replace(/Deen o Dunya Planner · v1\.1/g, "Deen o Dunya Planner · v1.5.1");

// 8. Fix idb surah download
const oldDownload = `var downloadSurah = function(){
      if (dl === "downloading") return;
      setDl("downloading");
      setProg(0);
      var done = 0;
      var editions = ["quran-uthmani", "en.sahih", "ur.jalandhry"];
      Promise.all(editions.map(function(ed){ return fetch("https://api.alquran.cloud/v1/surah/" + t + "/" + ed).then(function(r){ done++; setProg(Math.round(done / editions.length * 100) / 100); return r.json(); }); }))`;
const newDownload = `var downloadSurah = function(){
      if (dl === "downloading") return;
      setDl("downloading");
      setProg(0);
      var tryIDB = window.DDP_DB ? window.DDP_DB.get("quran", t) : Promise.resolve(null);
      tryIDB.then(function(cached){
        if (cached && cached.ayahs && cached.ayahs.length > 0) {
          setProg(1); QCACHE[t] = cached;
          setTimeout(function(){ setDownloaded(cached); setDl("idle"); setCurrent(0); }, 200);
          return;
        }
        var done = 0;
        var editions = ["quran-uthmani", "en.sahih", "ur.jalandhry"];
        return Promise.all(editions.map(function(ed){ return fetch("https://api.alquran.cloud/v1/surah/" + t + "/" + ed).then(function(r){ done++; setProg(Math.round(done / editions.length * 100) / 100); return r.json(); }); }))`;
if (html.includes(oldDownload)) {
  html = html.replace(oldDownload, newDownload);
  // Also fix the IDB set call
  html = html.replace(
    `try { localStorage.setItem(storageKey, JSON.stringify(full)); } catch (err) {
            if (err.name === "QuotaExceededError") { setDl("quota"); return; }
          }`,
    `if (window.DDP_DB) { window.DDP_DB.set("quran", t, full).catch(function(){}); }
          try { localStorage.setItem(storageKey, JSON.stringify(full)); } catch (err) {
            if (err.name === "QuotaExceededError") { setDl("quota"); return; }
          }`
  );
  // Fix the catch at the end
  html = html.replace(
    `).catch(function(){ setDl("error"); });`,
    `);}).catch(function(){ setDl("error"); });`
  );
  console.log("IDB surah download wired.");
}

fs.writeFileSync(indexPath, html, "utf8");
console.log("Phase restore complete. index.html updated.");
