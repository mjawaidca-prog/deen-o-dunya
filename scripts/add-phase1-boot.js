const fs = require("fs");
const path = require("path");
const indexPath = path.join(__dirname, "..", "index.html");
let h = fs.readFileSync(indexPath, "utf8");

// Strip BOM
if (h.charCodeAt(0) === 0xFEFF) h = h.substring(1);

// Insert minimal boot functions before App
var bootCode = `
  /* Phase 1 boot */
  async function ddpBoot(setScreen) {
    try {
      if (window.DDP_I18N) DDP_I18N.apply();
      if (window.DDP_HABITS) DDP_HABITS.recalcStreak();
      var onboardDone = localStorage.getItem("ddp_onboard_v1");
      if (!onboardDone) { setScreen("onboarding"); return; }
    } catch(e) { console.warn("[ddp]", e); }
  }
  async function ddpPostOnboard(st) {
    localStorage.setItem("ddp_onboard_v1", "1");
    st("dashboard");
  }
  function Onboarding(_a) {
    var onDone = _a.onDone;
    var L = [{k:"en",n:"English"},{k:"ur",n:"اردو"},{k:"ar",n:"العربية"}];
    var s = React.useState(0), step = s[0], ss = s[1];
    var l = React.useState(function(){try{return localStorage.getItem("ddp_lang")||"en"}catch(e){return"en"}}), lang = l[0];
    return h("div",{style:{minHeight:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#FBF6EA",padding:30}},
      step === 0 ? h("div",{style:{textAlign:"center"}},
        h("div",{style:{fontSize:34,fontWeight:600,color:"#0C5A3B",marginBottom:6}},"Deen o Dunya"),
        h("div",{style:{fontSize:30,color:"#BD9A4E",marginBottom:24}},"دین و دنیا"),
        h("div",{style:{fontSize:14,color:"#8A8576",marginBottom:18}},"Choose language"),
        L.map(function(l2){return h("button",{key:l2.k,onClick:function(){if(window.DDP_I18N)DDP_I18N.setLang(l2.k);ss(2);},style:{display:"block",width:250,border:"none",borderRadius:18,padding:"18px",margin:"0 auto 12px",background:lang===l2.k?"#0C5A3B":"#eee",color:lang===l2.k?"#fff":"#333",fontSize:17,fontWeight:700,cursor:"pointer"}},l2.n);})
      ) : h("div",{style:{textAlign:"center"}},
        h("div",{style:{fontSize:28,fontWeight:600,color:"#333",marginBottom:16}},"You are all set!"),
        h("button",{onClick:function(){onDone();},style:{border:"none",borderRadius:999,padding:"16px 40px",background:"#0C5A3B",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer"}},"Start using the app")
      )
    );
  }
`;

h = h.replace(
  "  App=function EnhancedApp()",
  bootCode + "  App=function EnhancedApp()"
);

// Add boot useEffect
const oldEffect = 'React.useEffect(()=>{const e=new Date,t=String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0");var p=P?c:(window.__ddpPrayerTimes||c);';
const newEffect = 'React.useEffect(function(){ddpBoot(r);},[]);' + oldEffect.replace('var p=P?c:', 'var p2=P?c:');
h = h.replace(oldEffect, newEffect);

// Add onboarding to active tab check
h = h.replace(
  'n==="prayerSettings"?"more":n',
  'n==="prayerSettings"||n==="onboarding"?"more":n'
);

// Add onboarding case to switch (before case"more")
h = h.replace(
  'case"azkar":return h(Azkar,{openCatId:v,setOpenCatId:k});case"more"',
  'case"azkar":return h(Azkar,{openCatId:v,setOpenCatId:k});case"onboarding":return h(Onboarding,{onDone:function(){ddpPostOnboard(r);}});case"more"'
);

fs.writeFileSync(indexPath, h, "utf8");
console.log("✅ Phase 1 boot added. Size:", h.length);

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
  console.log("❌ SYNTAX ERROR:", e.message.substring(0, 150));
  var m = e.stack.match(/<anonymous>:(\d+)/);
  if (m) console.log("JS line:", m[1]);
}
