const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const shared=require("../shared.js");
const source=fs.readFileSync(path.join(__dirname,"..","content.js"),"utf8");

test("Gemini pending response is immediately cancellable and late response ignored",async()=>{
 let finish;
 const remote=new Promise(resolve=>{finish=resolve;});
 const controller=new AbortController();
 const pending=shared.untilCancelled(remote,controller.signal);
 controller.abort();
 assert.equal(await pending,null);
 finish({data:"late-audio"});
 await Promise.resolve();
 assert.equal(await shared.untilCancelled(Promise.resolve({data:"x"}),controller.signal),null);
});

function makeSpeechRuntime(remote){
 const status={textContent:""};
 const s={playToken:0,speechController:null,speechActive:false,phase:"idle",lastAnswer:"",audioEnd:null,fallbackEnd:null};
 let plays=0,calls=0;
 const ctx={
  s,AbortController,Promise,
  hands:{enabled:false,busy:false},barge:{enabled:false,monitoring:false},
  CVB:{splitForTts:()=>["Első mondat","Második mondat","Harmadik mondat"],untilCancelled:shared.untilCancelled},
  $:()=>status,
  message:()=>{calls++;return remote();},
  setStatus:(text,phase)=>{status.textContent=text;s.phase=phase;},
  clearAudio:()=>{s.audioEnd?.();s.audioEnd=null;},
  stopWaitChime:()=>{},startWaitChime:()=>{},
  window:{},disarmBargeDuringTts:async()=>{},
  armBargeDuringTts:async()=>{},
  decodeAudio:()=>({}),
  playBlob:()=>{plays++;return new Promise(resolve=>{s.audioEnd=resolve;});},
  fallbackSpeak:async()=>{throw Error("Should not fallback");}
 };
 const stop=source.slice(source.indexOf("function stopSpeech(){"),source.indexOf("function decodeAudio("));
 const speak=source.slice(source.indexOf("async function speak(raw){"),source.indexOf("function clearPendingTranscript()"));
 assert.ok(stop.includes("s.speechController?.abort()"));
 assert.ok(speak.includes("CVB.untilCancelled"));
 vm.createContext(ctx);
 vm.runInContext(stop+"\n"+speak+"\nglobalThis.beginSpeech=speak;globalThis.endSpeech=stop;",ctx);
 return {...ctx,status,get plays(){return plays;},get calls(){return calls;}};
}

test("Stop cancels full multi-paragraph run DURING an in-flight Gemini request",async()=>{
 let resolveRemote;
 const runtime=makeSpeechRuntime(()=>new Promise(resolve=>{resolveRemote=resolve;}));
 const job=runtime.beginSpeech("Long content");
 assert.equal(runtime.s.speechActive,true);
 assert.equal(runtime.calls,1);
 assert.equal(runtime.s.phase,"playing");
 assert.match(runtime.status.textContent,/készül/);
 runtime.endSpeech();
 await job;
 assert.equal(runtime.s.speechActive,false);
 assert.equal(runtime.s.phase,"idle");
 assert.equal(runtime.plays,0);
 assert.equal(runtime.calls,1);
 resolveRemote({data:"late"});
 await Promise.resolve();
 assert.equal(runtime.plays,0,"late response must not start playback");
});

test("Stop cancels current audio and prevents the next paragraph request",async()=>{
 const runtime=makeSpeechRuntime(()=>Promise.resolve({data:"wav",mime:"audio/wav"}));
 const job=runtime.beginSpeech("Long content");
 for(let i=0;i<8;i++)await Promise.resolve();
 assert.equal(runtime.calls,1);
 assert.equal(runtime.plays,1);
 runtime.endSpeech();
 await job;
 assert.equal(runtime.calls,1);
 assert.equal(runtime.plays,1);
 assert.equal(runtime.s.speechActive,false);
});

test("progress melody only schedules while waiting, stops immediately on cancellation",()=>{
 const created=new Map(),intervals=new Map(),cleared=[];
 let id=0,plays=0,paused=0;
 class FakeAudio{
  play(){plays++;return Promise.resolve();}
  pause(){paused++;}
  removeAttribute(){}
  load(){}
  set currentTime(t){}
 }
 const sandbox={
  s:{speechActive:true,cuesEnabled:true},
  Audio:FakeAudio,Blob,DataView,Uint8Array,Math,Promise,
  URL:{createObjectURL:()=>"blob:melody"},
  cueContext:null,
  primeAudio:()=>{},
  setTimeout:(fn,ms)=>{const n=++id;created.set(n,{fn,ms});return n;},
  clearTimeout:n=>{created.delete(n);cleared.push(n);},
  setInterval:(fn,ms)=>{const n=++id;intervals.set(n,{fn,ms});return n;},
  clearInterval:n=>{intervals.delete(n);cleared.push(n);}
 };
 const part=source.slice(source.indexOf("const waitChime={"),source.indexOf("function applyCollapsed(value){"));
 assert.ok(part.length>2000);
 vm.createContext(sandbox);
 vm.runInContext(part+"\nglobalThis.start=startWaitChime;globalThis.stop=stopWaitChime;",sandbox);
 const ctrl=new AbortController();
 sandbox.start(42,ctrl.signal);
 assert.equal([...created.values()][0].ms,800);
 const start=[...created.values()][0].fn;
 start();
 assert.equal(plays,1);
 assert.equal([...intervals.values()][0].ms,3200);
 sandbox.stop(42);
 assert.ok(paused>=1);
 assert.equal(intervals.size,0);
 assert.equal(created.size,1,"fired timeout remains recorded by fake timer only");
 // Stale token callback must not revive melody after cancellation.
 start();
 assert.equal(plays,1);
});

test("Stop button stays available while next part is being generated",()=>{
 assert.match(source,/\$\("stop"\)\.disabled=!s\.speechActive/);
 assert.match(source,/startWaitChime\(token,controller\.signal\)/);
 assert.match(source,/stopWaitChime\(token\)/);
 assert.match(source,/if\(!output\|\|controller\.signal\.aborted\|\|token!==s\.playToken\)return/);
 assert.match(source,/s\.speechController\?\.abort\(\)/);
});
