/* Claude Voice Bridge: claude.ai UI and audio capture.
 * Requires shared.js; Gemini key is NEVER transferred to this content script.
 */
(() => {
"use strict";
if(window.__claudeVoiceBridgeLoaded)return;
window.__claudeVoiceBridgeLoaded=true;
const s={phase:"idle",selectors:{},configured:false,sendMode:"auto",stream:null,recorder:null,
 chunks:[],started:0,autoTimer:null,wakeLock:null,pending:false,transcript:"",
 lastAnswer:"",audio:null,audioUrl:null,playToken:0,rate:1,lastSpoken:"",
 activeWait:null,audioEnd:null,fallbackEnd:null};
const hands={enabled:false,starting:false,vad:null,busy:false,generation:0,silenceMs:1200,speechAt:0};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const message=(type,data={})=>new Promise((resolve,reject)=>{
  chrome.runtime.sendMessage({type,...data},response=>{
    if(chrome.runtime.lastError)return reject(new Error(chrome.runtime.lastError.message));
    if(!response?.ok)return reject(new Error(response?.error||"A háttérszolgáltatás nem válaszol."));
    resolve(response);
  });
});
const wrapper=document.createElement("div");
wrapper.id="claude-voice-bridge";
wrapper.style.cssText="position:fixed;z-index:2147483646;right:12px;bottom:12px;max-width:calc(100vw - 24px);font-size:14px";
const shadow=wrapper.attachShadow({mode:"closed"});
shadow.innerHTML='<style>:host{all:initial}#panel{box-sizing:border-box;background:#14283a;color:#f2f7fc;width:305px;max-width:calc(100vw - 24px);border:1px solid #82a0b2;border-radius:15px;padding:12px;box-shadow:0 4px 25px #0006;font:13px/1.4 system-ui,sans-serif}h3{font:700 14px system-ui;margin:0 0 7px}#status{min-height:38px;white-space:pre-wrap;overflow-wrap:anywhere}#transcript{max-height:76px;overflow-y:auto;white-space:pre-wrap;color:#cbe0f5;font-size:12px;margin:5px 0}#actions{display:flex;flex-wrap:wrap;gap:5px}button{font:600 12px system-ui;border:0;border-radius:8px;padding:8px 9px;background:#95e5c8;color:#03291c;cursor:pointer}button.secondary{background:#314960;color:#fff}button:disabled{opacity:.5;cursor:default}button:focus-visible{outline:3px solid #fff}small{display:block;color:#b2c5d7;margin-top:7px}</style><section id="panel" aria-label="Claude Voice Bridge"><h3>Claude Voice Bridge</h3><div id="status" role="status" aria-live="polite">Indítás…</div><div id="transcript"></div><div id="actions"><button id="record">Beszéd indítása</button><button id="hands" class="secondary" title="Silero VAD, felolvasás alatt mikrofon szünetel">Automata: ki</button><button id="send" class="secondary" disabled>Küldés</button><button id="stop" class="secondary" disabled>Stop</button><button id="repeat" class="secondary" disabled>Ismétlés</button><button id="settings" class="secondary" title="Beállítások">⚙</button></div><small id="hint">A mikrofon gomb második megnyomása lezárja a felvételt.</small></section>';
(document.body||document.documentElement).appendChild(wrapper);
const $=id=>shadow.getElementById(id);
function setStatus(text,phase=s.phase){
  s.phase=phase; $("status").textContent=text;
  $("record").textContent=phase==="recording"?"Felvétel lezárása":"Beszéd indítása";
  $("record").disabled=hands.enabled||hands.starting||["transcribing","sending","waiting"].includes(phase);
  $("hands").textContent=hands.enabled?"Automata: be":"Automata: ki";
  $("hands").disabled=hands.starting;
  $("hands").setAttribute("aria-pressed",String(hands.enabled));
  $("send").disabled=!s.pending;
  $("stop").disabled=phase!=="playing";
  $("repeat").disabled=!s.lastAnswer||phase==="recording";
}
function issue(error){setStatus("Hiba: "+String(error?.message||error).slice(0,240),"idle");}
function visible(el){return !!(el?.isConnected&&el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden");}
function bySelector(type){
  for(const selector of s.selectors[type]||[]){
    try{const el=[...document.querySelectorAll(selector)].find(visible);if(el)return el;}catch{}
  }
  return null;
}
function editor(){
  for(const selector of s.selectors.editor||[]){
    try{const el=[...document.querySelectorAll(selector)].find(e=>visible(e)&&e.isContentEditable);
      if(el)return el;
    }catch{}
  }
  return null;
}
function sendButton(){
  for(const selector of s.selectors.send||[]){
    try{const el=[...document.querySelectorAll(selector)].find(e=>visible(e)&&!e.disabled);
      if(el)return el;
    }catch{}
  }
  return null;
}
function assistantElements(){
  for(const selector of s.selectors.assistant||[]){
    try{
      const nodes=[...document.querySelectorAll(selector)].filter(visible);
      if(nodes.length)return nodes;
    }catch{}
  }
  return [];
}
function assistantText(){
  const latest=assistantElements().at(-1);
  if(!latest)return "";
  const el=latest.cloneNode(true);
  el.querySelectorAll("pre,code,button,script,style,[data-testid*='thinking'],[data-testid*='tool'],[aria-label*='Copy']").forEach(node=>node.remove());
  return (el.textContent||"").replace(/\n{3,}/g,"\n\n").trim();
}
async function init(){
  try{
    const cfg=await message("GET_SETTINGS");
    s.configured=cfg.configured;
    s.sendMode=cfg.settings.sendMode;
    hands.silenceMs=Math.max(700,Math.min(2500,Number(cfg.settings.silenceMs)||1200));
    s.selectors=await fetch(chrome.runtime.getURL("selectors.json")).then(r=>r.json());
    if(!s.configured)setStatus("A Gemini API-kulcs nincs beállítva. Nyisd meg a ⚙ menüt.","idle");
    else if(!editor())setStatus("A Claude szerkesztő nem található. Nyiss meg egy beszélgetést.","idle");
    else setStatus("Készen áll. Indíthatod a beszédet.","idle");
  }catch(error){issue(error);}
}
async function lockScreen(){
  try{if("wakeLock" in navigator)s.wakeLock=await navigator.wakeLock.request("screen");}catch{}
}
async function unlockScreen(){
  try{await s.wakeLock?.release();}catch{}
  s.wakeLock=null;
}
function releaseMicrophone(){
  if(s.autoTimer)clearTimeout(s.autoTimer);
  s.autoTimer=null;
  if(s.stream){s.stream.getTracks().forEach(t=>t.stop());s.stream=null;}
  void unlockScreen();
}
async function startRecord(){
  if(!s.configured){setStatus("Előbb add meg a Gemini API-kulcsot.","idle");return;}
  if(["transcribing","sending","waiting"].includes(s.phase))return;
  if(s.phase==="playing")stopSpeech();
  if(s.recorder?.state==="recording")return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined")throw new Error("Ezen a böngészőn nincs MediaRecorder/getUserMedia támogatás.");
  const stream=await navigator.mediaDevices.getUserMedia({
    audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}
  });
  const mime=["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4"].find(x=>MediaRecorder.isTypeSupported(x));
  if(!mime){stream.getTracks().forEach(t=>t.stop());throw new Error("Nincs támogatott hangfelvételi formátum.");}
  const recorder=new MediaRecorder(stream,{mimeType:mime});
  s.stream=stream;s.recorder=recorder;s.chunks=[];s.started=Date.now();
  recorder.ondataavailable=event=>{if(event.data?.size)s.chunks.push(event.data);};
  recorder.onerror=()=>issue(new Error("A hangrögzítés megszakadt."));
  recorder.onstop=()=>{releaseMicrophone();void processRecorded(mime).catch(issue);};
  recorder.start(1000);
  void lockScreen();
  s.autoTimer=setTimeout(()=>{if(recorder.state==="recording")recorder.stop();},120000);
  setStatus("Felvétel. Beszélj magyarul, majd nyomd meg ismét a gombot.","recording");
}
function finishRecord(){
  if(s.recorder?.state!=="recording")return;
  s.recorder.stop();
  setStatus("Leirat készül a Geminivel…","transcribing");
}
function blobBase64(blob){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("A hangfelvétel nem olvasható."));
    reader.onload=()=>resolve(String(reader.result).split(",")[1]);
    reader.readAsDataURL(blob);
  });
}
async function processRecorded(mime){
  const seconds=(Date.now()-s.started)/1000;
  if(seconds<0.5){setStatus("A felvétel túl rövid. Próbáld újra.","idle");return;}
  const blob=new Blob(s.chunks,{type:mime});
  s.chunks=[];
  const data=await blobBase64(blob);
  const {transcript}=await message("TRANSCRIBE",{duration:Math.min(seconds,120),mime,data});
  $("transcript").textContent="Felismert: "+transcript;
  const command=CVB.speechCommand(transcript);
  if(command){
    await handleCommand(command);
    return;
  }
  putTranscript(transcript);
  s.transcript=transcript;s.pending=true;
  if(s.sendMode==="confirm")setStatus("Ellenőrizd a leiratot, majd nyomd meg a Küldés gombot.","idle");
  else await sendTranscript();
}
function putTranscript(text){
  const node=editor();
  if(!node)throw new Error("A beviteli mező nem található. A leirat nincs elküldve.");
  node.focus();
  const selection=window.getSelection();
  const range=document.createRange();
  range.selectNodeContents(node);range.collapse(false);
  selection.removeAllRanges();selection.addRange(range);
  const old=node.textContent?.trim();
  const inserted=document.execCommand("insertText",false,(old?"\n":"")+text);
  if(!inserted)throw new Error("A szerkesztő elutasította a szövegbeszúrást.");
  node.dispatchEvent(new InputEvent("input",{bubbles:true,inputType:"insertText",data:text}));
}
async function sendTranscript(){
  if(!s.pending)return;
  const button=await (async()=>{for(let i=0;i<10;i++){const b=sendButton();if(b)return b;await sleep(150);}return null;})();
  if(!button){setStatus("Nem található aktív Küldés gomb. A leirat a szerkesztőben maradt.","idle");return;}
  const baseline=assistantText();
  const count=assistantElements().length;
  s.pending=false;
  button.click();
  setStatus("Claude válaszára várok…","waiting");
  await monitorAnswer(baseline,count);
}
async function monitorAnswer(baseline,count){
  if(s.activeWait){s.activeWait.disconnect();s.activeWait=null;}
  const started=Date.now();
  let last="";let changedAt=Date.now();let reported=false;
  return new Promise((resolve,reject)=>{
    const obs=new MutationObserver(update);
    s.activeWait=obs;
    const ticker=setInterval(update,500);
    function cleanup(){
      obs.disconnect();clearInterval(ticker);
      if(s.activeWait===obs)s.activeWait=null;
    }
    function update(){
      if(!wrapper.isConnected){cleanup();resolve();return;}
      const now=Date.now();
      if(now-started>600000){cleanup();reject(new Error("Claude 10 perc alatt sem fejezte be a választ."));return;}
      if(now-started>180000&&!reported){reported=true;setStatus("Claude még dolgozik. Tovább várok…","waiting");}
      const elements=assistantElements();
      const text=assistantText();
      const fresh=(elements.length>count||text!==baseline)&&text.length>0;
      if(!fresh)return;
      if(last!==text){last=text;changedAt=now;return;}
      const stop=bySelector("stop");
      // Streaming flag avoids reading a partially rendered Claude response.
      const latest=elements.at(-1);
      if(stop||latest?.closest("[data-is-streaming='true']")||latest?.querySelector("[data-is-streaming='true']"))return;
      if(now-changedAt>=1300){
        cleanup();s.lastAnswer=text;resolve(speak(text));
      }
    }
    obs.observe(document.body,{subtree:true,childList:true,characterData:true});
    update();
  });
}
function clearAudio(){
  if(s.audioEnd){const done=s.audioEnd;s.audioEnd=null;done();}
  if(s.audio){s.audio.pause();s.audio.src="";s.audio=null;}
  if(s.audioUrl){URL.revokeObjectURL(s.audioUrl);s.audioUrl=null;}
}
function stopSpeech(){
  s.playToken++;clearAudio();
  if("speechSynthesis" in window)speechSynthesis.cancel();
  if(s.fallbackEnd){const done=s.fallbackEnd;s.fallbackEnd=null;done();}
  setStatus("Felolvasás leállítva.","idle");
}
function decodeAudio(base64,mime){
  const bytes=atob(base64);
  const arr=new Uint8Array(bytes.length);
  for(let i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i);
  return new Blob([arr],{type:mime||"audio/wav"});
}
async function playBlob(blob,token){
  if(token!==s.playToken)return;
  clearAudio();
  s.audioUrl=URL.createObjectURL(blob);
  const audio=new Audio(s.audioUrl);
  s.audio=audio;audio.playbackRate=s.rate;
  await new Promise((resolve,reject)=>{
    let settled=false;
    const complete=error=>{if(settled)return;settled=true;s.audioEnd=null;error?reject(error):resolve();};
    s.audioEnd=()=>complete();
    audio.onended=()=>complete();
    audio.onerror=()=>complete(new Error("A böngésző nem tudja lejátszani a hangot."));
    audio.play().catch(complete);
  });
  clearAudio();
}
function fallbackSpeak(text,token){
  return new Promise((resolve,reject)=>{
    if(!("speechSynthesis" in window))return reject(new Error("A böngészőben nincs beépített TTS."));
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang="hu-HU";utterance.rate=s.rate;
    let settled=false;
    const done=()=>{if(settled)return;settled=true;s.fallbackEnd=null;resolve();};
    s.fallbackEnd=done;
    utterance.onend=done;utterance.onerror=done;
    if(token!==s.playToken)return resolve();
    speechSynthesis.speak(utterance);
  });
}
async function speak(raw){
  stopSpeech();
  const token=s.playToken;
  const parts=CVB.splitForTts(raw,500).slice(0,60);
  if(!parts.length){setStatus("Nem található felolvasható szöveg.","idle");return;}
  setStatus("Felolvasás…","playing");
  for(const part of parts){
    if(token!==s.playToken)return;
    try{
      const output=await message("SYNTHESIZE",{text:part});
      if(token!==s.playToken)return;
      await playBlob(decodeAudio(output.data,output.mime),token);
    }catch(error){
      if(token!==s.playToken)return;
      setStatus("Gemini TTS-hiba, beépített felolvasás: "+String(error?.message||error).slice(0,90),"playing");
      await fallbackSpeak(part,token);
    }
  }
  if(token===s.playToken)setStatus("Válasz felolvasva. Indíthatod a következő beszédet.","idle");
}
function clearPendingTranscript(){
  const node=editor();
  const target=s.transcript;
  if(!node||!s.pending||!target||!(node.textContent||"").endsWith(target)){
    throw new Error("A leirat megváltozott. Biztonsági okból nem törlöm a szerkesztőt.");
  }
  const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
  const leaves=[];
  while(walker.nextNode())leaves.push(walker.currentNode);
  let remaining=target.length,start=null;
  for(let i=leaves.length-1;i>=0&&remaining>0;i--){
    const t=leaves[i],take=Math.min(remaining,t.textContent.length);
    remaining-=take;start={node:t,offset:t.textContent.length-take};
  }
  if(!start||remaining)throw new Error("Nem sikerült a leirat törlését előkészíteni.");
  const last=leaves.at(-1),r=document.createRange();
  r.setStart(start.node,start.offset);r.setEnd(last,last.textContent.length);
  node.focus();
  const selection=window.getSelection();selection.removeAllRanges();selection.addRange(r);
  if(!document.execCommand("delete",false))throw new Error("A szerkesztő elutasította a törlést.");
  s.pending=false;s.transcript="";
  $("transcript").textContent="";
  setStatus("A leirat törölve, a többi szöveg megmaradt.","idle");
}
async function handleCommand(command){
  if(command==="send"){
    if(s.pending)await sendTranscript();
    else setStatus("Nincs elküldésre váró leirat.","idle");
  }else if(command==="clear"){
    if(s.pending)clearPendingTranscript();
    else setStatus("Nincs függő leirat.","idle");
  }else if(command==="repeat"){
    if(s.lastAnswer)await speak(s.lastAnswer);
  }else if(command==="stop")stopSpeech();
  else if(command==="end"){stopSpeech();await disableHandsFree();setStatus("Hangos mód kikapcsolva.","idle");}
  else if(command==="slower"||command==="faster"){
    s.rate=Math.max(0.7,Math.min(1.4,s.rate+(command==="faster"?0.15:-0.15)));
    setStatus("Felolvasás tempója: "+Math.round(s.rate*100)+"%.","idle");
  }
}

/* Opt-in Silero VAD mode. Speech detection stays local in ONNX/WASM.
 * The valid PCM segment is transcribed only after the end-of-speech callback.
 * The VAD stream is paused throughout STT, Claude response and TTS (half-duplex).
 */
async function pauseHands(){
  if(hands.vad)await hands.vad.pause();
}
async function resumeHands(generation=hands.generation){
  if(!hands.enabled||hands.generation!==generation||hands.busy||s.pending&&s.sendMode!=="confirm")return;
  if(!hands.vad)return;
  await hands.vad.start();
  if(hands.enabled&&hands.generation===generation&&!hands.busy){
    hands.speechAt=0;
    setStatus("Automata mód: hallgatok. A beszéd végét a Silero érzékeli.","listening");
  }
}
async function disableHandsFree(){
  hands.enabled=false;
  hands.generation++;
  hands.speechAt=0;
  const model=hands.vad;
  hands.vad=null;
  // Cancel a pending callback by advancing generation. Any in-flight STT is
  // checked again before the page is modified or another Claude message sent.
  try{await model?.destroy();}catch{}
  await unlockScreen();
  setStatus("Automata mód kikapcsolva. A kézi felvétel továbbra is működik.","idle");
}
async function enableHandsFree(){
  if(!s.configured)throw new Error("Előbb add meg a Gemini API-kulcsot.");
  if(["recording","transcribing","waiting","playing"].includes(s.phase)||s.pending)
    throw new Error("Előbb fejezd be a folyamatban lévő kört.");
  if(!globalThis.CVBSilero?.MicVAD||!globalThis.CVBWav?.pcm16WavBase64)
    throw new Error("Hiányzik a helyi Silero modell/bundle. Telepítsd a teljes v0.2.0 ZIP-et.");
  hands.enabled=true;
  const generation=++hands.generation;
  await lockScreen();
  try{
    const vad=await globalThis.CVBSilero.MicVAD.new({
      model:"v5",
      processorType:"auto",
      baseAssetPath:chrome.runtime.getURL("vendor/"),
      onnxWASMBasePath:chrome.runtime.getURL("vendor/"),
      positiveSpeechThreshold:0.62,
      negativeSpeechThreshold:0.40,
      redemptionFrames:Math.round(hands.silenceMs/32),
      minSpeechFrames:16,
      preSpeechPadFrames:10,
      onSpeechStart:()=>{
        if(!hands.enabled||hands.generation!==generation||hands.busy)return;
        hands.speechAt=Date.now();
        setStatus("Beszédet érzékeltem. A csend után automatikusan küldöm.","listening");
      },
      onVADMisfire:()=>{
        if(hands.enabled&&!hands.busy)setStatus("Túl rövid beszéd, tovább hallgatok.","listening");
      },
      onFrameProcessed:()=>{
        if(hands.enabled&&!hands.busy&&hands.speechAt&&Date.now()-hands.speechAt>120000){
          hands.busy=true;
          void disableHandsFree().then(()=>issue(new Error("A beszéd meghaladta a 120 másodpercet. Indítsd újra az automata módot.")));
        }
      },
      onSpeechEnd:audio=>{void handleHandsSpeech(audio,generation);}
    });
    if(!hands.enabled||hands.generation!==generation){await vad.destroy();return;}
    hands.vad=vad;
    await resumeHands(generation);
  }catch(error){
    hands.enabled=false;hands.generation++;
    if(hands.vad){try{await hands.vad.destroy();}catch{}hands.vad=null;}
    await unlockScreen();
    throw error;
  }
}
async function toggleHandsFree(){
  if(hands.starting)return;
  hands.starting=true;
  setStatus("Silero VAD inicializálása…","idle");
  try{
    if(hands.enabled)await disableHandsFree();
    else await enableHandsFree();
  }catch(error){issue(error);}
  finally{hands.starting=false;setStatus($("status").textContent,s.phase);}
}
async function handleHandsSpeech(audio,generation){
  if(!hands.enabled||hands.generation!==generation||hands.busy)return;
  hands.busy=true;
  try{
    await pauseHands();
    if(!hands.enabled||hands.generation!==generation)return;
    const seconds=audio.length/globalThis.CVBWav.SAMPLE_RATE;
    if(seconds<0.5){setStatus("Túl rövid beszéd. Folytatom a figyelést.","idle");return;}
    if(seconds>122)throw new Error("A hang meghaladta a 120 másodperces keretet.");
    setStatus("Gemini STT: a beszéd átirata készül…","transcribing");
    const data=globalThis.CVBWav.pcm16WavBase64(audio);
    const {transcript}=await message("TRANSCRIBE",{duration:Math.min(seconds,120),mime:"audio/wav",data});
    if(!hands.enabled||hands.generation!==generation)return;
    $("transcript").textContent="Felismert: "+transcript;
    const command=CVB.speechCommand(transcript);
    if(command){await handleCommand(command);return;}
    if(s.pending){
      setStatus("Megerősítésre váró szöveg van a mezőben. Mondd: küldd vagy töröld.","idle");
      return;
    }
    putTranscript(transcript);
    s.transcript=transcript;s.pending=true;
    if(s.sendMode==="confirm"){
      setStatus("Jóváhagyás szükséges. Mondd: küldd, vagy nyomd meg a Küldés gombot.","idle");
      return;
    }
    await sendTranscript();
  }catch(error){
    if(hands.enabled&&hands.generation===generation)issue(error);
  }finally{
    hands.busy=false;
    if(hands.enabled&&hands.generation===generation){
      try{await resumeHands(generation);}catch(error){issue(error);await disableHandsFree();}
    }
  }
}
async function sendWithHalfDuplex(){
  const generation=hands.generation;
  const manage=hands.enabled&&!hands.busy;
  if(manage){hands.busy=true;await pauseHands();}
  try{await sendTranscript();}
  finally{if(manage){hands.busy=false;await resumeHands(generation);}}
}
async function repeatWithHalfDuplex(){
  const generation=hands.generation;
  const manage=hands.enabled&&!hands.busy;
  if(manage){hands.busy=true;await pauseHands();}
  try{if(s.lastAnswer)await speak(s.lastAnswer);}
  finally{if(manage){hands.busy=false;await resumeHands(generation);}}
}

async function toggleRecord(){
  try{if(hands.enabled)await disableHandsFree();if(s.phase==="recording")finishRecord();else await startRecord();}
  catch(error){releaseMicrophone();issue(error);}
}
$("record").addEventListener("click",()=>{void toggleRecord();});
$("hands").addEventListener("click",()=>{void toggleHandsFree();});
$("send").addEventListener("click",()=>{void sendWithHalfDuplex().catch(issue);});
$("stop").addEventListener("click",stopSpeech);
$("repeat").addEventListener("click",()=>{void repeatWithHalfDuplex().catch(issue);});
$("settings").addEventListener("click",()=>{void message("OPEN_OPTIONS").catch(issue);});
chrome.runtime.onMessage.addListener((request,sender,reply)=>{
  if(request?.type==="TOGGLE_RECORD"){void toggleRecord();reply({ok:true});}
  if(request?.type==="STOP_SPEECH"){stopSpeech();reply({ok:true});}
});
window.addEventListener("pagehide",()=>{void disableHandsFree();releaseMicrophone();clearAudio();});
void init();
})();
