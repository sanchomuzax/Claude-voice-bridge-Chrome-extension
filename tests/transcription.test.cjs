const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","content.js"),"utf8");

function makeRuntime(remote){
  let starts=0,stops=0,lastOwner=null,lastSignal=null,calls=0;
  const ctx={
    AbortController,Symbol,
    startWaitChime:(token,signal)=>{starts++;lastOwner=token;lastSignal=signal;},
    stopWaitChime:(token)=>{stops++;assert.strictEqual(token,lastOwner);},
    message:(type,payload)=>{
      assert.equal(type,"TRANSCRIBE");
      assert.equal(payload.duration,1);
      calls++;
      return remote();
    }
  };
  const start=source.indexOf("async function transcribeWithChime(payload){");
  const end=source.indexOf("async function processRecorded(mime){",start);
  assert.ok(start>=0&&end>start,"STT chime wrapper exists");
  vm.createContext(ctx);
  vm.runInContext(source.slice(start,end)+"\nglobalThis.transcribe=transcribeWithChime;",ctx);
  return {transcribe:ctx.transcribe,get starts(){return starts;},get stops(){return stops;},
    get signal(){return lastSignal;},get calls(){return calls;}};
}

test("manual or VAD STT triggers chime for in-flight Gemini transcription",async()=>{
  let finish;
  const runtime=makeRuntime(()=>new Promise(resolve=>{finish=resolve;}));
  const pending=runtime.transcribe({duration:1});
  assert.equal(runtime.starts,1);
  assert.equal(runtime.stops,0);
  assert.equal(runtime.signal.aborted,false);
  finish({transcript:"Érthető beszéd."});
  assert.equal((await pending).transcript,"Érthető beszéd.");
  assert.equal(runtime.stops,1);
  assert.equal(runtime.signal.aborted,true);
  assert.equal(runtime.calls,1);
});

test("STT server rejection also stops chime immediately and propagates error",async()=>{
 const runtime=makeRuntime(()=>Promise.reject(new Error("STT unavailable")));
 await assert.rejects(runtime.transcribe({duration:1}),/STT unavailable/);
 assert.equal(runtime.starts,1);
 assert.equal(runtime.stops,1);
 assert.equal(runtime.signal.aborted,true);
});

test("both manual and hands-free capture call the same STT chime helper",()=>{
 const matches=source.match(/await transcribeWithChime\(/g)||[];
 assert.equal(matches.length,2);
 assert.match(source,/async function processRecorded\(mime\)[\s\S]*?await transcribeWithChime\(\{duration:Math\.min\(seconds,120\),mime,data\}\)/);
 assert.match(source,/async function handleHandsSpeech\(audio,generation\)[\s\S]*?await transcribeWithChime\(\{duration:Math\.min\(seconds,120\),mime:"audio\/wav",data\}\)/);
 assert.equal((source.match(/await message\("TRANSCRIBE"/g)||[]).length,1,"Only the shared chime wrapper may call TRANSCRIBE directly");
});

test("progress notes can play in STT without TTS speechActive flag",()=>{
 const start=source.indexOf("function playWaitChime(token,signal){");
 const end=source.indexOf("function stopWaitChime(",start);
 assert.ok(start>=0&&end>start);
 const body=source.slice(start,end);
 assert.match(body,/waitChime\.token!==token\|\|signal\.aborted\|\|!s\.cuesEnabled/);
 assert.doesNotMatch(body,/s\.speechActive/);
});


test("STT uses a quicker first note and tighter repetition than TTS",()=>{
 const wrap=source.slice(source.indexOf("async function transcribeWithChime(payload){"),source.indexOf("async function processRecorded(mime){"));
 assert.match(wrap,/startWaitChime\(owner,controller\.signal,\{delayMs:250,repeatMs:1900\}\)/);
 const spoken=source.slice(source.indexOf("async function speak(raw){"),source.indexOf("function clearPendingTranscript()"));
 assert.match(spoken,/startWaitChime\(token,controller\.signal\)/);
});

test("Waiting melody cannot play over active output, including browser fallback speech",()=>{
 const begin=source.indexOf("const waitChime={");
 const end=source.indexOf("function applyCollapsed(value){",begin);
 assert.ok(begin>=0&&end>begin);
 let timer=null,interval=null,playCount=0;
 class FakeAudio{
  play(){playCount++;return Promise.resolve();}
  pause(){}
  removeAttribute(){}
  load(){}
  set currentTime(_value){}
 }
 const state={cuesEnabled:true,speechActive:true,audio:{},fallbackEnd:null};
 const sandbox={
  s:state,Math,Uint8Array,DataView,Blob,Promise,
  URL:{createObjectURL:()=>"blob:stub"},
  Audio:FakeAudio,cueContext:null,primeAudio:()=>{},
  setTimeout:fn=>{timer=fn;return 1;},clearTimeout:()=>{timer=null;},
  setInterval:fn=>{interval=fn;return 2;},clearInterval:()=>{interval=null;}
 };
 vm.createContext(sandbox);
 vm.runInContext(source.slice(begin,end)+"\nglobalThis.begin=startWaitChime;globalThis.end=stopWaitChime;",sandbox);
 const abort=new AbortController();
 sandbox.begin("Gemini",abort.signal,{delayMs:250,repeatMs:1900});
 timer();
 assert.equal(playCount,0,"audible TTS should block melody");
 state.audio=null;
 interval();
 assert.equal(playCount,1,"melody may play after TTS sound ends");
 state.fallbackEnd=()=>{};
 interval();
 assert.equal(playCount,1,"native fallback TTS also blocks melody");
 sandbox.end("Gemini");
 assert.equal(interval,null);
});
