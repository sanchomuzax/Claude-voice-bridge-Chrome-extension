const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
function makeWorker(respondFetch){
  const store={apiKey:"test-api-key",maxMinutes:50,maxChars:2000};
  let onMessage;
  const ctx={
    chrome:{
      storage:{local:{
        get:async names=>Object.fromEntries((Array.isArray(names)?names:[names]).filter(k=>k in store).map(k=>[k,store[k]])),
        set:async values=>Object.assign(store,values),
        setAccessLevel:async()=>{}
      }},
      runtime:{onInstalled:{addListener:()=>{}},onStartup:{addListener:()=>{}},onMessage:{addListener:f=>{onMessage=f;}}},
      commands:{onCommand:{addListener:()=>{}}},
      tabs:{query:async()=>[]}
    },
    fetch:respondFetch,
    AbortSignal,atob,setTimeout,clearTimeout,Uint8Array,Intl,Date,Promise,Error,TypeError
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..","background.js"),"utf8"),ctx);
  function send(req,url="https://claude.ai/chat/example"){
    return new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error("Background response timeout")),500);
      onMessage(req,{url,id:"test-extension",tab:{url}},response=>{clearTimeout(timeout);resolve(response);});
    });
  }
  return {store,send};
}
test("secrets are not present in GET_SETTINGS response",async()=>{
 const worker=makeWorker(async()=>{throw new Error("Should not fetch");});
 const output=await worker.send({type:"GET_SETTINGS"});
 assert.equal(output.ok,true);
 assert.equal(output.configured,true);
 assert.equal(output.settings.apiKey,undefined);
});
test("STT uses resumable Files upload, Interactions, and deletes temp file",async()=>{
 const calls=[];
 const worker=makeWorker(async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith("/upload/v1beta/files"))return new Response("",{status:200,headers:{"x-goog-upload-url":"https://generativelanguage.googleapis.com/upload-session"}});
  if(url.endsWith("/upload-session"))return Response.json({file:{uri:"https://files.google.test/blob",name:"files/abc123"}});
  if(url.endsWith("/v1beta/interactions"))return Response.json({output_text:"Szervusz, Claude!"});
  if(url.endsWith("/v1beta/files/abc123"))return Response.json({});
  throw new Error("Unknown request "+url);
 });
 const data=Buffer.alloc(1024,10).toString("base64");
 const result=await worker.send({type:"TRANSCRIBE",mime:"audio/webm",duration:5,data});
 assert.equal(result.ok,true,result.error);
 assert.equal(result.transcript,"Szervusz, Claude!");
 assert.equal(calls.length,4);
 const payload=JSON.parse(calls[2].options.body);
 assert.equal(payload.model,"gemini-3.5-transcribe");
 assert.equal(payload.input[0].type,"audio");
 assert.equal(payload.generation_config.transcription_config.mode,"verbatim");
 assert.equal(worker.store.dailyUsage.minutes,5/60);
});
test("TTS uses speech metadata and audio response",async()=>{
 let body;
 const worker=makeWorker(async(url,options)=>{
   body=JSON.parse(options.body);
   return Response.json({steps:[{type:"model_output",content:[{type:"audio",data:"UklGRgAAAAA=",mime_type:"audio/wav"}]}]});
 });
 const result=await worker.send({type:"SYNTHESIZE",text:"Szia!"});
 assert.equal(result.ok,true,result.error);
 assert.equal(result.data,"UklGRgAAAAA=");
 assert.equal(body.model,"gemini-3.8-flash-lite-tts");
 assert.equal(body.input[0].content[0].annotations[0].type,"speech_metadata");
 assert.equal(worker.store.dailyUsage.chars,5);
});
test("rejects external websites",async()=>{
 const worker=makeWorker(async()=>{throw new Error("No fetch");});
 const output=await worker.send({type:"TRANSCRIBE"},"https://attacker.example/");
 assert.equal(output.ok,false);
});
