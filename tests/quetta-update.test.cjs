const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../popup.js"),"utf8");
const html=fs.readFileSync(path.join(__dirname,"../popup.html"),"utf8");
const start=source.indexOf("async function showUpdate(state){");
const end=source.indexOf("function statusError",start);
assert.ok(start>=0&&end>start);

function harness(userAgent){
 const elements=new Map(["updateInfo","updateActions","zipDownload","installHint","releaseLink"].map(id=>
   [id,{hidden:true,href:"",textContent:""}]));
 const context={document:{getElementById:id=>elements.get(id)},navigator:{userAgent},Date};
 vm.runInNewContext("const $=id=>document.getElementById(id);\n"+source.slice(start,end)+"\nglobalThis.render=showUpdate;",context);
 return {elements,render:context.render};
}
const state={available:true,localVersion:"0.5.17",latestVersion:"0.5.18",
 releaseUrl:"https://github.com/sanchomuzax/Claude-voice-bridge-Chrome-extension/releases/tag/v0.5.18",
 checkedAt:null,error:""};
test("Android Quetta update shows actual version-specific ZIP URL",async()=>{
 assert.match(html,/id="zipDownload"[^>]+hidden/);
 const h=harness("Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Quetta");
 await h.render(state);
 assert.equal(h.elements.get("zipDownload").hidden,false);
 assert.equal(h.elements.get("zipDownload").href,
  "https://github.com/sanchomuzax/Claude-voice-bridge-Chrome-extension/releases/download/v0.5.18/Claude-Voice-Bridge-v0.5.18.zip");
 assert.equal(h.elements.get("updateActions").hidden,false);
 assert.match(h.elements.get("installHint").textContent,/Quetta.*új bővítménypéldányt.*NEM frissíti/);
 assert.match(html,/ZIP letöltése \(új telepítés\)/);
});
test("No update, invalid versions and desktop never show ZIP action",async()=>{
 for(const [ua,changed] of [
  ["Mozilla/5.0 (Linux; Android 16)",{available:false}],
  ["Mozilla/5.0 (Linux; Android 16)",{latestVersion:"0.5.18x"}],
  ["Mozilla/5.0 (Windows NT 10.0)",{}]
 ]){
  const h=harness(ua);
  await h.render({...state,...changed});
  assert.equal(h.elements.get("zipDownload").hidden,true);
 }
});
