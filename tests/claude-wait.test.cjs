const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"..","content.js"),"utf8");

function harness({stop=false,streaming=false,approval=false}={}){
 let clock=0,read="Végső válasz magyarul.",plays=[],stops=[],said=[],statuses=[];
 let tickFn,observer;
 const entry={
   isConnected:true,
   closest:()=>streaming?{getAttribute:()=>"true"}:null,
   querySelector:()=>null
 };
 const s={activeWait:null,lastAnswer:""};
 class Observer{constructor(fn){this.fn=fn;}observe(){}disconnect(){this.disconnected=true;}}
 const ctx={
   s,Symbol,AbortController,
   MutationObserver:Observer,
   document:{body:{}},wrapper:{isConnected:true},
   Date:{now:()=>clock},
   setInterval:fn=>{tickFn=fn;return 123;},
   clearInterval:()=>{tickFn=null;},
   setStatus:(str,phase)=>statuses.push([str,phase]),
   startWaitChime:(token,signal,opts)=>plays.push({token,signal,opts}),
   stopWaitChime:token=>stops.push(token),
   assistantElements:()=>[entry],
   assistantText:()=>read,
   bySelector:()=>stop?{}:null,
   pendingToolApproval:()=>approval,
   speak:async str=>{said.push(str);}
 };
 const a=source.indexOf("async function monitorAnswer(baseline,count){");
 const b=source.indexOf("function clearAudio()",a);
 assert.ok(a>=0&&b>a);
 vm.createContext(ctx);
 vm.runInContext(source.slice(a,b)+"\nglobalThis.watch=monitorAnswer;",ctx);
 return {
   run:()=>ctx.watch("",0),
   advance:ms=>{clock+=ms;if(tickFn)tickFn();},
   get said(){return said;},get plays(){return plays;},get stops(){return stops;},
   get statuses(){return statuses;},
   setStop:v=>{stop=v;},setApproval:v=>{approval=v;},
   setStreaming:v=>{streaming=v;},
   setText:v=>{read=v;}
 };
}

test("Claude monitor does not narrate partial answer after 2.6 sec without reliable Stop/stream state",async()=>{
 const h=harness();
 const outcome=h.run();
 h.advance(2800);
 assert.equal(h.said.length,0);
 h.advance(6200);
 assert.equal(h.said.length,0);
 h.advance(600);
 await outcome;
 assert.equal(h.said.length,1);
 assert.match(h.said[0],/Végső válasz/);
 assert.equal(h.plays.length,1);
 assert.equal(h.plays[0].opts.delayMs,1100);
 assert.equal(h.plays[0].opts.repeatMs,4200);
 assert.equal(h.stops.length,1);
});

test("Observed generating state permits 2.6 sec final stabilization AFTER it ends",async()=>{
 const h=harness({stop:true});
 const out=h.run();
 h.advance(1000);
 assert.equal(h.said.length,0);
 h.setStop(false);
 h.advance(2600);
 await out;
 assert.equal(h.said.length,1);
});

test("Streaming attribute blocks narration even when no Stop selector matches",async()=>{
 const h=harness({streaming:true});
 const out=h.run();
 h.advance(15000);
 assert.equal(h.said.length,0);
 h.setStreaming(false);
 h.advance(2600);
 await out;
 assert.equal(h.said.length,1);
});

test("Claude approval suspends waiting chime until user has resolved it",async()=>{
 const h=harness({approval:true});
 const out=h.run();
 assert.equal(h.plays.length,1);
 assert.equal(h.stops.length,1);
 assert.match(h.statuses.at(-1)[0],/jóváhagyást kér/);
 h.advance(12500);
 assert.equal(h.said.length,0);
 h.setApproval(false);
 h.advance(500);
 assert.equal(h.plays.length,2);
 h.advance(9500);
 await out;
 assert.equal(h.said.length,1);
 assert.equal(h.stops.length,2);
});

test("Progress chime has explicit silence guard during audio playback and fallback speech",()=>{
 const begin=source.indexOf("function playWaitChime(token,signal){");
 const end=source.indexOf("function stopWaitChime(",begin);
 const body=source.slice(begin,end);
 assert.match(body,/!s\.cuesEnabled\|\|s\.audio\|\|s\.fallbackEnd/);
 assert.match(body,/signal\.aborted\|\|s\.audio\|\|s\.fallbackEnd/);
 const play=source.slice(source.indexOf("async function speak(raw){"),source.indexOf("function clearPendingTranscript()"));
 assert.match(play,/stopWaitChime\(token\);\s*\}\s*if\(!output/);
});
