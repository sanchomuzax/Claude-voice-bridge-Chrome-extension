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
 assert.doesNotMatch(source,/await message\("TRANSCRIBE"/);
});

test("progress notes can play in STT without TTS speechActive flag",()=>{
 const start=source.indexOf("function playWaitChime(token,signal){");
 const end=source.indexOf("function stopWaitChime(",start);
 assert.ok(start>=0&&end>start);
 const body=source.slice(start,end);
 assert.match(body,/waitChime\.token!==token\|\|signal\.aborted\|\|!s\.cuesEnabled/);
 assert.doesNotMatch(body,/s\.speechActive/);
});
