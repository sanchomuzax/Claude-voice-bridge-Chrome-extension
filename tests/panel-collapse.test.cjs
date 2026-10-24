const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","content.js"),"utf8");

function harness(){
 const applied=[],controls={noise:{value:""},silence:{value:""}};
 const ctx={
  s:{configured:false,phase:"idle"},
  hands:{enabled:false,busy:false,threshold:0.62,silenceMs:1200},
  barge:{confirmed:false},
  $:id=>controls[id]||{textContent:""},
  showSliderValues:()=>{},stopWaitChime:()=>{},setStatus:()=>{},
  restartVadIfNeeded:async()=>false,vadRestartPending:false,
  applyCollapsed:value=>applied.push(value)
 };
 const a=source.indexOf("function applyVadSettings(");
 const b=source.indexOf("async function reloadBridgeSettings()",a);
 assert.ok(a>=0&&b>a);
 vm.createContext(ctx);
 vm.runInContext(source.slice(a,b)+
  "\nglobalThis.apply=applyBridgeConfig;globalThis.begin=()=>collapseWrites++;globalThis.end=()=>collapseWrites--;",ctx);
 return {ctx,applied};
}

test("saved collapsed state is applied to a newly opened tab",()=>{
 const {ctx,applied}=harness();
 ctx.apply({configured:true,settings:{panelCollapsed:true}});
 ctx.apply({configured:true,settings:{panelCollapsed:false}});
 assert.deepEqual(applied,[true,false]);
});

test("settings read before a collapse click cannot revert it while it is saved",()=>{
 const {ctx,applied}=harness();
 ctx.begin();
 ctx.apply({configured:true,settings:{panelCollapsed:false}});
 assert.deepEqual(applied,[]);
 ctx.end();
 ctx.apply({configured:true,settings:{panelCollapsed:true}});
 assert.deepEqual(applied,[true]);
});

test("HUD stays hidden until the saved panel state is known",()=>{
 assert.match(source,/wrapper\.style\.visibility="hidden"/);
 assert.match(source,/try\{await reloadBridgeSettings\(\);\}finally\{revealPanel\(\);\}/);
 assert.match(source,/setTimeout\(revealPanel,1500\)/);
 const click=source.slice(source.indexOf('$("toggle").addEventListener'),source.indexOf('for(const id of ["noise","silence"])'));
 assert.match(click,/UPDATE_UI_SETTINGS",\{values:\{panelCollapsed:closed\}\}/);
 assert.match(click,/collapseWrites\+\+/);
 assert.match(click,/collapseWrites--/);
});

test("slider changes keep automatic mode on and restart VAD between turns",()=>{
 const {ctx}=harness();
 ctx.hands.enabled=true;ctx.hands.busy=true;
 ctx.apply({configured:true,settings:{vadThreshold:0.7,silenceMs:1500}});
 assert.equal(ctx.vadRestartPending,true);
 assert.equal(ctx.hands.threshold,0.7);
 const fn=source.slice(source.indexOf("async function updateVadControls()"),source.indexOf('$("toggle").addEventListener'));
 assert.doesNotMatch(fn,/disableHandsFree|enableHandsFree/);
 assert.match(fn,/applyVadSettings\(saved\.settings\.vadThreshold,saved\.settings\.silenceMs\)/);
});

test("re-enabling automatic mode clears a busy flag left by a 120 s overrun",()=>{
 const fn=source.slice(source.indexOf("async function enableHandsFree()"),source.indexOf("async function toggleHandsFree()"));
 assert.ok(fn.indexOf("hands.busy=false")>=0&&fn.indexOf("hands.busy=false")<fn.indexOf("hands.enabled=true"));
});

test("back/forward cache restore reconnects settings sync",()=>{
 assert.match(source,/addEventListener\("pageshow",event=>\{/);
 assert.match(source,/if\(!event\.persisted\)return;\s*disconnectSettingsSync=startSettingsSync\(\);/);
 assert.match(source,/URL\.revokeObjectURL\(waitChime\.url\);waitChime\.url=null;/);
});
