const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","content.js"),"utf8");

function extract(start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+1);
 assert.ok(a>=0&&b>a,"Missing function boundary "+start);
 return source.slice(a,b);
}
function makeMessaging(send){
 const runtime={lastError:null,sendMessage:(payload,callback)=>send(payload,callback,runtime)};
 const context={chrome:{runtime},sleep:()=>Promise.resolve(),Promise,Error,Object};
 vm.createContext(context);
 vm.runInContext(extract("const message=async(","const wrapper=")+"\nglobalThis.callBridge=message;",context);
 return context.callBridge;
}

test("GET_SETTINGS recovers from a transient missing Edge service-worker receiver",async()=>{
 let calls=0;
 const message=makeMessaging((payload,cb,runtime)=>{
   calls++;
   assert.equal(payload.type,"GET_SETTINGS");
   if(calls<3){runtime.lastError={message:"Could not establish connection. Receiving end does not exist."};cb();runtime.lastError=null;}
   else cb({ok:true,configured:true,settings:{sendMode:"auto"}});
 });
 const result=await message("GET_SETTINGS");
 assert.equal(result.configured,true);
 assert.equal(calls,3);
});

test("charged TRANSCRIBE is never auto-replayed on a broken Edge message channel",async()=>{
 let calls=0;
 const message=makeMessaging((payload,cb,runtime)=>{
   assert.equal(payload.type,"TRANSCRIBE");calls++;
   runtime.lastError={message:"Could not establish connection. Receiving end does not exist."};cb();runtime.lastError=null;
 });
 await assert.rejects(message("TRANSCRIBE",{data:"fake"}),/Edge.*háttérfolyamatát/);
 assert.equal(calls,1);
});

test("real Gemini API errors are not masked as worker-reconnect failures",async()=>{
 let calls=0;
 const message=makeMessaging((payload,cb)=>{
   calls++;cb({ok:false,error:"Gemini API 429: Quota exceeded"});
 });
 await assert.rejects(message("GET_SETTINGS"),/Gemini API 429/);
 assert.equal(calls,1);
});

test("Edge missing microphone permissions report the specific failure",()=>{
 const context={Error,MediaRecorder:class {},navigator:{}};
 vm.createContext(context);
 vm.runInContext(extract("function describeMicError(","async function startRecord(")+"\nglobalThis.describe=describeMicError;",context);
 assert.match(context.describe({name:"NotAllowedError"}).message,/Edge nem engedte/);
 assert.match(context.describe({name:"NotReadableError"}).message,/mikrofon nem olvasható/);
 assert.match(context.describe({name:"NotFoundError"}).message,/nem talál/);
});

test("Edge recording constructor gracefully tries a different supported codec",()=>{
 const calls=[];
 class Recorder{
  static isTypeSupported=()=>true;
  constructor(stream,options){
    calls.push(options?.mimeType||"default");
    if(options?.mimeType==="audio/webm;codecs=opus")throw Error("codec unavailable");
    this.mimeType=options?.mimeType||"audio/webm";
  }
 }
 const context={Error,MediaRecorder:Recorder};vm.createContext(context);
 vm.runInContext(extract("function describeMicError(","async function startRecord(")+"\nglobalThis.make=createAudioRecorder;",context);
 assert.equal(context.make({}).mimeType,"audio/webm");
 assert.deepEqual(calls,["audio/webm;codecs=opus","audio/webm"]);
});

test("empty Edge recording never reaches Gemini STT",async()=>{
 let called=0;
 const state={started:Date.now()-2500,chunks:[]};
 const context={
  s:state,Date,Blob,Error,
  setStatus:()=>{},
  blobBase64:()=>{called++;},
  transcribeWithChime:()=>{called++;},
  $:()=>({textContent:""}),
  CVB:{}
 };
 vm.createContext(context);
 vm.runInContext(extract("async function processRecorded(mime){","function dismissMobileKeyboard()")+
   "\nglobalThis.process=processRecorded;",context);
 await assert.rejects(context.process("audio/webm"),/nem adott használható hangadatot/);
 assert.equal(called,0);
});


test("GET_SETTINGS retries an empty Edge worker response safely",async()=>{
 let calls=0;
 const message=makeMessaging((_payload,cb)=>{
   calls++;
   if(calls===1)cb(undefined);
   else cb({ok:true,configured:true,settings:{}});
 });
 assert.equal((await message("GET_SETTINGS")).configured,true);
 assert.equal(calls,2);
});
