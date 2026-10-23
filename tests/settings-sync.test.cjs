const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.join(__dirname,"..");
const background=fs.readFileSync(path.join(root,"background.js"),"utf8");
const content=fs.readFileSync(path.join(root,"content.js"),"utf8");

test("trusted background broadcasts only invalidation notifications, never API keys",()=>{
 const begin=background.indexOf("const settingsPorts=new Set();");
 const end=background.indexOf("chrome.runtime.onMessage.addListener(",begin);
 assert.ok(begin>0&&end>begin);
 let onConnect=null,onChange=null,payload=null;
 const ctx={Set,
  chrome:{
   runtime:{onConnect:{addListener:fn=>onConnect=fn}},
   storage:{onChanged:{addListener:fn=>onChange=fn}}
  },
  exposed:["sendMode","vadThreshold","soundCues"]
 };
 vm.createContext(ctx);
 vm.runInContext(background.slice(begin,end),ctx);
 assert.equal(typeof onConnect,"function");
 assert.equal(typeof onChange,"function");
 let disconnect;
 const port={
  name:"cvb-settings",sender:{url:"https://claude.ai/chat/example"},
  onDisconnect:{addListener:fn=>disconnect=fn},
  postMessage:message=>payload=message
 };
 onConnect(port);
 onChange({apiKey:{oldValue:"private-old",newValue:"private-new"}},"local");
 assert.equal(JSON.stringify(payload),'{"type":"SETTINGS_UPDATED"}');
 payload=null;
 onChange({dailyUsage:{newValue:{chars:100}}},"local");
 assert.equal(payload,null);
 disconnect();
 onChange({soundCues:{newValue:false}},"local");
 assert.equal(payload,null);
});

test("HUD automatically reloads sanitized settings, not extension storage secrets",()=>{
 assert.match(content,/port=chrome\.runtime\.connect\(\{name:"cvb-settings"\}\)/);
 assert.match(content,/data\?\.type==="SETTINGS_UPDATED"/);
 assert.match(content,/void reloadBridgeSettings\(\)/);
 assert.match(content,/const cfg=await message\("GET_SETTINGS"\)/);
 assert.match(content,/s\.sendMode=settings\.sendMode\|\|"auto"/);
 assert.match(content,/s\.cuesEnabled=settings\.soundCues!==false/);
 assert.match(content,/vadRestartPending=true/);
 assert.match(content,/if\(vadRestartPending&&await restartVadIfNeeded\(\)\)return/);
 assert.match(content,/const bargeAllowed=barge\.enabled/);
 assert.doesNotMatch(content,/chrome\.storage\.local\.get\(/);
});

test("desktop settings are wider and the Settings gear is in the HUD header",()=>{
 const css=fs.readFileSync(path.join(root,"ui.css"),"utf8");
 assert.match(css,/@media\(min-width:1040px\)/);
 assert.match(css,/max-width:1080px/);
 assert.match(css,/#settings\{display:grid;grid-template-columns/);
 const src=fs.readFileSync(path.join(root,"panel-ui.js"),"utf8");
 const match=src.match(/globalThis.CVBPanel = ("[\s\S]*");\s*$/);
 assert.ok(match);
 const html=JSON.parse(match[1]);
 const header=html.slice(html.indexOf('<div id="brand">'),html.indexOf("</div>",html.indexOf('<div id="brand">'))+6);
 assert.match(header,/id="settings"/);
 assert.match(header,/>Beállítás<\/span>/);
 assert.doesNotMatch(html.slice(html.indexOf('<div id="actions">'),html.indexOf('<div id="modeState"')),/id="settings"/);
});

test("options save message correctly promises live settings synchronization",()=>{
 const s=fs.readFileSync(path.join(root,"options.js"),"utf8");
 assert.match(s,/panel automatikusan átveszi a változásokat/);
 assert.doesNotMatch(s,/frissítsd az új modellek használatához/);
});
