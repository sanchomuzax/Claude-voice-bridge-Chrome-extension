const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","background.js"),"utf8");
const start=source.indexOf("const CVB_REPOSITORY=");
const end=source.indexOf("chrome.runtime.onMessage.addListener((message,sender,respond)=>",start);
assert.ok(start>0&&end>start);
const update=source.slice(start,end);
function harness(remote="0.5.18"){
 const callbacks={},store={},alarms=[],badges=[],native=[],scheduled=[];
 let fetchCount=0,reloads=0;
 const zip="Claude-Voice-Bridge-v"+remote+".zip";
 const ctx={chrome:{
  runtime:{
   getManifest:()=>({version:"0.5.17"}),
   onInstalled:{addListener:f=>callbacks.installed=f},
   onStartup:{addListener:f=>callbacks.startup=f},
   sendNativeMessage:(host,request,respond)=>{native.push({host,request});respond({ok:true,version:request.version});},
   reload:()=>{reloads++;}
  },
  alarms:{create:(name,opts)=>alarms.push({name,opts}),onAlarm:{addListener:f=>callbacks.alarm=f}},
  storage:{local:{
   get:async keys=>Object.fromEntries(keys.filter(k=>k in store).map(k=>[k,store[k]])),
   set:async values=>Object.assign(store,values)
  }},
  action:{setBadgeText:async x=>badges.push(x.text),setBadgeBackgroundColor:async()=>{}}
 },Date,Promise,Number,Set,String,Boolean,Object,Error,RegExp,
  AbortSignal,fetch:async()=>{
   fetchCount++;
   return {ok:true,json:async()=>({tag_name:"v"+remote,assets:[
     {name:zip},{name:zip+".sha256"}],draft:false,prerelease:false})};
  },
  setTimeout:fn=>{scheduled.push(fn);return 1},
  clearTimeout:()=>{},setInterval:()=>1,clearInterval:()=>{}
 };
 vm.createContext(ctx);
 vm.runInContext(update+"\nglobalThis.check=cvbCheckUpdate;globalThis.get=cvbSavedStatus;globalThis.install=cvbInstallUpdate;globalThis.newer=cvbIsNewer;globalThis.setAuto=cvbSetAutoInstall;globalThis.active=(count)=>{cvbActiveAudio=count;};",ctx);
 return {ctx,store,callbacks,alarms,badges,native,scheduled,
  get fetchCount(){return fetchCount;},get reloads(){return reloads;}};
}
test("numeric semver comparison",()=>{
 const h=harness();
 assert.equal(h.ctx.newer("0.5.18","0.5.17"),true);
 assert.equal(h.ctx.newer("0.5.17","0.5.18"),false);
 assert.equal(h.ctx.newer("0.6.0","0.5.179"),true);
 assert.equal(h.ctx.newer("0.5.17","0.5.17"),false);
 assert.equal(h.ctx.newer("wrong","0.5.17"),false);
});
test("hourly alarm checks GitHub and shows UPD badge",async()=>{
 const h=harness();
 h.callbacks.installed();
 assert.equal(h.alarms[0].opts.periodInMinutes,60);
 await h.ctx.check();
 const state=await h.ctx.get();
 assert.equal(state.available,true);
 assert.equal(state.latestVersion,"0.5.18");
 assert.equal(h.badges.at(-1),"UPD");
 assert.equal(h.native.length,0);
});
test("native install sends only version and command, then reloads",async()=>{
 const h=harness();
 await h.ctx.check();
 const result=await h.ctx.install();
 assert.equal(result.version,"0.5.18");
 assert.equal(h.native.length,1);
 assert.equal(h.native[0].host,"com.sancho.cvb_updater");
 assert.deepEqual(Object.keys(h.native[0].request).sort(),["cmd","version"]);
 assert.equal(h.reloads,0);
 h.scheduled.at(-1)();
 assert.equal(h.reloads,1);
});
test("do not interrupt active audio",async()=>{
 const h=harness();
 await h.ctx.check();
 h.ctx.active(1);
 await assert.rejects(h.ctx.install(),/Hangfeldolgozás/);
 assert.equal(h.native.length,0);
});
test("automatic installation requires explicit opt-in",async()=>{
 const h=harness();
 await h.ctx.setAuto(true);
 assert.equal((await h.ctx.get()).autoInstall,true);
 await h.ctx.check();
 assert.equal(h.native.length,0);
});
test("web content cannot request native update or settings changes",()=>{
 const handler=source.slice(source.indexOf("chrome.runtime.onMessage.addListener((message,sender,respond)=>"));
 assert.match(handler,/message.type==="INSTALL_UPDATE"&&isExtension/);
 assert.match(handler,/message.type==="SET_AUTO_INSTALL"&&isExtension/);
 assert.match(handler,/message.type==="CHECK_UPDATE"&&isExtension/);
 assert.match(source,/const CVB_RELEASE_API="https:\/\/api.github.com\/repos\/"/);
});
