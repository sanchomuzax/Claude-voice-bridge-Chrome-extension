const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const content=fs.readFileSync(path.join(__dirname,"..","content.js"),"utf8");
const background=fs.readFileSync(path.join(__dirname,"..","background.js"),"utf8");

function clientHarness(){
 let sent=[],messages=[],disconnects=[],timers=[],disconnectCount=0;
 const port={
  onMessage:{addListener:f=>messages.push(f)},
  onDisconnect:{addListener:f=>disconnects.push(f)},
  postMessage:v=>sent.push(v),
  disconnect:()=>{disconnectCount++;}
 };
 const ctx={
  chrome:{runtime:{connect:()=>port,lastError:null}},
  Error,Promise,setInterval:(fn,ms)=>{const x={fn,ms};timers.push(x);return x;},
  clearInterval:()=>{},
  setTimeout:()=>1,clearTimeout:()=>{}
 };
 vm.createContext(ctx);
 const a=content.indexOf("function longAudioMessage(type,data){");
 const b=content.indexOf("const message=async(",a);
 assert.ok(a>=0&&b>a);
 vm.runInContext(content.slice(a,b)+"\nglobalThis.longTask=longAudioMessage;",ctx);
 return {run:ctx.longTask,send:()=>sent,reply:msg=>messages.forEach(f=>f(msg)),
  close:()=>disconnects.forEach(f=>f()),get disconnectCount(){return disconnectCount;},get intervals(){return timers;}};
}
test("long STT request receives RESULT through Port without a sendMessage response",async()=>{
 const client=clientHarness();
 const pending=client.run("TRANSCRIBE",{mime:"audio/webm",data:"fake"});
 assert.equal(client.send().length,1);
 assert.equal(client.send()[0].type,"REQUEST");
 assert.equal(client.send()[0].task,"TRANSCRIBE");
 client.reply({type:"ACCEPTED"});
 assert.equal(client.intervals[0].ms,20000);
 client.intervals[0].fn();
 assert.equal(client.send().at(-1).type,"PING");
 client.reply({type:"PONG"});
 client.reply({type:"RESULT",ok:true,transcript:"Sikeres átirat"});
 assert.equal((await pending).transcript,"Sikeres átirat");
 assert.equal(client.disconnectCount,1);
});
test("disconnected STT Port rejects without replaying the paid operation",async()=>{
 const client=clientHarness();
 const pending=client.run("TRANSCRIBE",{data:"audio"});
 client.reply({type:"ACCEPTED"});
 client.close();
 await assert.rejects(pending,/nem ismétlem automatikusan/);
 assert.equal(client.send().filter(x=>x.type==="REQUEST").length,1);
});
test("server errors are delivered as typed results rather than a closed channel",async()=>{
 const client=clientHarness();
 const pending=client.run("SYNTHESIZE",{text:"Szia"});
 client.reply({type:"ACCEPTED"});
 client.reply({type:"RESULT",ok:false,error:"Gemini API 429"});
 await assert.rejects(pending,/Gemini API 429/);
 assert.equal(client.send().filter(x=>x.type==="REQUEST").length,1);
});

function workerHarness(){
 const callbacks=[],sent=[],timers=[];
 let transcribed=0,spoken=0,workerCalls=0;
 const ctx={
  cvbActiveAudio:0,
  chrome:{
   runtime:{id:"test-extension",onConnect:{addListener:f=>callbacks.push(f)},getPlatformInfo:()=>{workerCalls++;return Promise.resolve({});}},
   storage:{onChanged:{addListener:()=>{}}}
  },
  Promise,Set,Error,String,Object,setInterval:(fn,ms)=>{const t={fn,ms};timers.push(t);return t;},
  clearInterval:timer=>{timer.cleared=true;},
  transcribe:async payload=>{transcribed++;return {transcript:"Átirat: "+payload.data};},
  synthesize:async payload=>{spoken++;return {data:"audio:"+payload.text,mime:"audio/wav"};}
 };
 const start=background.indexOf("function keepWorkerAlive(task){");
 const end=background.indexOf("chrome.storage.onChanged?.addListener(",start);
 assert.ok(start>=0&&end>start);
 vm.createContext(ctx);
 vm.runInContext(background.slice(start,end),ctx);
 function connect({id="test-extension",url="https://claude.ai/chat/test",name="cvb-audio-task"}={}){
  const listeners=[],gone=[],messages=[];
  const port={
   name,sender:{id,url},onMessage:{addListener:f=>listeners.push(f)},
   onDisconnect:{addListener:f=>gone.push(f)},
   postMessage:x=>messages.push(x),disconnect:()=>gone.forEach(f=>f())
  };
  callbacks.forEach(f=>f(port));
  return {request:x=>listeners.forEach(f=>f(x)),messages,port};
 }
 return {connect,timers,get operations(){return {transcribed,spoken,workerCalls}}};
}
test("MV3 worker keeps itself alive while Gemini task runs and sends typed RESULT",async()=>{
 const worker=workerHarness(),conn=worker.connect();
 conn.request({type:"REQUEST",task:"TRANSCRIBE",data:{data:"foo"}});
 for(let i=0;i<5;i++)await Promise.resolve();
 assert.deepEqual(conn.messages.map(m=>m.type),["ACCEPTED","RESULT"]);
 assert.equal(conn.messages[1].transcript,"Átirat: foo");
 assert.equal(worker.operations.transcribed,1);
 assert.equal(worker.timers[0].ms,20000);
 assert.equal(worker.timers[0].cleared,true);
});
test("MV3 Port refuses non-Claude callers and unexpected operation types",async()=>{
 const worker=workerHarness();
 const external=worker.connect({url:"https://attacker.test/"});
 assert.equal(external.messages.length,0);
 const internal=worker.connect();
 internal.request({type:"REQUEST",task:"DELETE_KEY",data:{}});
 assert.equal(internal.messages[0].ok,false);
 assert.equal(worker.operations.transcribed,0);
 assert.equal(worker.operations.spoken,0);
});
