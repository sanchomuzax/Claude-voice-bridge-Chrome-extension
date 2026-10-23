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
 activeWait:null,audioEnd:null,fallbackEnd:null,cuesEnabled:true,speechActive:false,speechController:null};
const hands={enabled:false,starting:false,vad:null,busy:false,generation:0,silenceMs:1200,speechAt:0,threshold:0.62};
// Barge-in consent is runtime-only and never restored automatically.
const barge={enabled:false,monitoring:false,candidateAt:0,highFrames:0,confirmed:false,confirmedAt:0,queuedAudio:null};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const message=async(type,data={})=>{
  // GET requests may be retried across an Edge/Chromium MV3 worker wake-up.
  // Never replay TRANSCRIBE, SYNTHESIZE or other charged/mutating requests:
  // the worker may have received them before the reply channel disappeared.
  const readOnly=type==="GET_SETTINGS"||type==="GET_STATUS";
  const attempt=()=>new Promise((resolve,reject)=>{
    try{
      chrome.runtime.sendMessage({type,...data},response=>{
        const error=chrome.runtime.lastError?.message;
        if(error)return reject(Object.assign(new Error(error),{transport:true}));
        if(!response?.ok)return reject(new Error(response?.error||"A háttérszolgáltatás nem válaszol."));
        resolve(response);
      });
    }catch(error){reject(Object.assign(new Error(String(error?.message||error)),{transport:true}));}
  });
  for(let n=0;;n++){
    try{return await attempt();}
    catch(error){
      const disconnected=Boolean(error.transport)&&
        /receiving end does not exist|could not establish connection|message port closed|extension context invalidated/i.test(error.message);
      if(disconnected&&readOnly&&n<2){await sleep(250*(n+1));continue;}
      if(disconnected)throw new Error("Az Edge nem éri el a Bridge háttérfolyamatát. Nem STT- vagy mikrofonhiba; ellenőrizd a bővítmény service workerét az edge://extensions oldalon. ("+error.message+")");
      throw error;
    }
  }
};
const wrapper=document.createElement("div");
wrapper.id="claude-voice-bridge";
wrapper.style.cssText="position:fixed;z-index:2147483646;right:0;top:calc(env(safe-area-inset-top, 0px) + 8px);max-width:calc(100vw - 44px);pointer-events:none";
wrapper.style.fontFamily=getComputedStyle(document.body).fontFamily;
const shadow=wrapper.attachShadow({mode:"closed"});
shadow.innerHTML=globalThis.CVBPanel;
(document.body||document.documentElement).appendChild(wrapper);
const $=id=>shadow.getElementById(id);
function setStatus(text,phase=s.phase){
  s.phase=phase;$("status").textContent=text;
  const recordLabel=phase==="recording"?"Felvétel lezárása":"Beszéd indítása";
  for(const [id,label] of Object.entries({
    record:recordLabel,
    hands:hands.enabled?"Automata mód aktív. Koppints a kikapcsoláshoz.":"Automata mód inaktív. Koppints a bekapcsoláshoz.",
    barge:barge.enabled?"Közbevágás aktív. Koppints a kikapcsoláshoz.":
      hands.enabled?"Közbevágás inaktív. Koppints a bekapcsoláshoz.":"Közbevágás nem aktív. Előbb az automata módot kapcsold be.",
    send:"Leirat elküldése",stop:"Felolvasás leállítása",
    repeat:"Válasz újraolvasása",settings:"Beállítások"
  })){
    const button=$(id);button.title=label;button.setAttribute("aria-label",label);
  }
  const recordCaption=$("record").querySelector(".btn-label");
  if(recordCaption)recordCaption.textContent=phase==="recording"?"Lezárás":"Felvétel";
  $("record").disabled=hands.enabled||hands.starting||["transcribing","sending","waiting"].includes(phase);
  $("hands").disabled=hands.starting;
  $("hands").setAttribute("aria-pressed",String(hands.enabled));
  $("barge").disabled=!hands.enabled||hands.starting;
  $("barge").setAttribute("aria-pressed",String(barge.enabled));
  $("modeState").textContent="Automata: "+(hands.enabled?"aktív":"inaktív")+" · Közbevágás: "+(barge.enabled?"aktív":"inaktív");
  $("send").disabled=!s.pending;
  // Stop is active through Gemini generation, between paragraphs AND while audio plays.
  $("stop").disabled=!s.speechActive;
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
// Read only rendered assistant Markdown, never a tool card or the
// accessibility-only "Need your input" / "Claude responded" labels.
// Tools can render before the final answer and even request approval.
function assistantText(){
  const messages=assistantElements();
  if(!messages.length)return "";
  const latest=messages.at(-1);
  const selectors=".standard-markdown,[data-testid='markdown-content'],.markdown";
  const nodes=(latest.matches(selectors)?[latest]:[]).concat([...latest.querySelectorAll(selectors)]);
  const roots=nodes.filter(node=>!nodes.some(parent=>parent!==node&&parent.contains(node)) &&
    !node.closest("[data-testid*='tool'],[data-testid*='approval'],[data-testid*='permission'],[role='dialog']"));
  // Some Claude layouts render an answer directly inside .font-claude-response
  // without a .standard-markdown child. Only this explicit prose element may
  // be used as fallback; never a generic tool/status container.
  if(!roots.length&&latest.matches(".font-claude-response,.font-claude-message") &&
    !latest.closest("[data-testid*='tool'],[data-testid*='permission'],[data-testid*='approval']") &&
    !CVB.isToolStatus(latest.textContent||""))roots.push(latest);
  if(!roots.length)return "";
  const forbidden="button,script,style,pre,code,svg,.sr-only,[hidden],[aria-hidden='true'],[data-testid*='thinking'],[data-testid*='tool'],[data-testid*='permission'],[data-testid*='approval'],[aria-label*='Copy']";
  function rendered(node){
    if(node.nodeType===Node.TEXT_NODE)return node.textContent||"";
    if(node.nodeType!==Node.ELEMENT_NODE)return "";
    if(node.matches(forbidden))return "";
    const tag=node.tagName;
    const text=[...node.childNodes].map(rendered).join("");
    return /^(P|DIV|SECTION|H1|H2|H3|H4|LI|BLOCKQUOTE|TR)$/.test(tag)?text+"\n":text;
  }
  const answer=CVB.cleanForSpeech(roots.map(rendered).join("\n"));
  return CVB.isToolStatus(answer)?"":answer;
}
function pendingToolApproval(){
  const last=assistantElements().at(-1);
  if(!last)return false;
  const tool=last.closest("[data-testid*='tool'],[data-testid*='approval'],[data-testid*='permission']")||
    last.querySelector("[data-testid*='approval'],[data-testid*='permission'],[data-testid*='tool']");
  // Only a *current*, visible tool prompt blocks narration. Old tool-card
  // history or the words quoted in a real answer should not.
  if(!tool||!visible(tool))return false;
  const text=(tool.textContent||"").slice(0,700);
  return /\bNeed your input\b|\b(?:Allow|Approve|Deny)\b/i.test(text) &&
    !!tool.querySelector("button,[role='button']");
}

let settingsRefreshSerial=0;
let vadRestartPending=false;
let vadRestarting=false;
async function restartVadIfNeeded(){
  if(!vadRestartPending||vadRestarting||!hands.enabled||hands.busy||hands.starting||barge.confirmed)return false;
  vadRestartPending=false;vadRestarting=true;
  const bargeAllowed=barge.enabled;
  try{
    // Silero options are specified when MicVAD is created. Recreate the
    // instance only between utterances, never during an active recording.
    await disableHandsFree();
    await enableHandsFree();
    barge.enabled=bargeAllowed;
    setStatus("Beszédérzékelés új beállításokkal aktív.","listening");
    return true;
  }catch(error){
    issue(new Error("Az új beszédérzékelési beállítások alkalmazása nem sikerült: "+String(error.message||error)));
    return false;
  }finally{vadRestarting=false;}
}
function applyBridgeConfig(cfg){
  const settings=cfg.settings||{};
  const previousConfigured=s.configured;
  const priorThreshold=hands.threshold,priorSilence=hands.silenceMs;
  s.configured=cfg.configured;
  s.sendMode=settings.sendMode||"auto";
  hands.silenceMs=Math.max(700,Math.min(2500,Number(settings.silenceMs)||1200));
  hands.threshold=Math.max(0.4,Math.min(0.9,Number(settings.vadThreshold)||0.62));
  s.cuesEnabled=settings.soundCues!==false;
  $("noise").value=String(hands.threshold);
  $("silence").value=String(hands.silenceMs);
  showSliderValues();
  applyCollapsed(Boolean(settings.panelCollapsed));
  if(!s.cuesEnabled)stopWaitChime();
  if(hands.enabled&&(priorThreshold!==hands.threshold||priorSilence!==hands.silenceMs)){
    vadRestartPending=true;
    // If speech is currently being recorded or processed, resumeHands()
    // will apply the new parameters after the current turn finishes.
    if(!hands.busy&&!barge.confirmed)void restartVadIfNeeded();
  }
  if(!previousConfigured&&s.configured&&s.phase==="idle")
    setStatus("Gemini kapcsolat beállítva. Indíthatod a beszédet.","idle");
  else setStatus($("status").textContent,s.phase);
}
async function reloadBridgeSettings(){
  const serial=++settingsRefreshSerial;
  const cfg=await message("GET_SETTINGS");
  if(serial!==settingsRefreshSerial)return;
  applyBridgeConfig(cfg);
}
function startSettingsSync(){
  let stopped=false,port=null;
  function connect(){
    if(stopped||!chrome.runtime?.id||!wrapper.isConnected)return;
    try{
      port=chrome.runtime.connect({name:"cvb-settings"});
      port.onMessage.addListener(data=>{
        if(data?.type==="SETTINGS_UPDATED")void reloadBridgeSettings().catch(issue);
      });
      port.onDisconnect.addListener(()=>{
        if(!stopped&&chrome.runtime?.id)setTimeout(connect,1500);
      });
    }catch{
      if(!stopped)setTimeout(connect,1500);
    }
  }
  connect();
  return ()=>{
    stopped=true;
    try{port?.disconnect();}catch{}
  };
}
async function init(){
  try{
    await reloadBridgeSettings();
    s.selectors=await fetch(chrome.runtime.getURL("selectors.json")).then(r=>r.json());
    if(!s.configured)setStatus("A Gemini API-kulcs nincs beállítva. Nyisd meg a Beállítások menüt.","idle");
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
function describeMicError(error){
  const name=String(error?.name||"");
  if(name==="NotAllowedError"||name==="PermissionDeniedError"||name==="SecurityError")
    return new Error("Az Edge nem engedte a mikrofont a claude.ai oldalnak ("+name+"). Az oldal mikrofonengedélyét vagy a Windows adatvédelmi beállítást ellenőrizd.");
  if(name==="NotReadableError")
    return new Error("A mikrofon nem olvasható az Edge-ben ("+name+"). Lehet, hogy másik program használja.");
  if(name==="NotFoundError"||name==="DevicesNotFoundError")
    return new Error("Az Edge nem talál használható mikrofont ("+name+").");
  return new Error("Edge mikrofonhiba: "+name+" – "+String(error?.message||error));
}
function createAudioRecorder(stream){
  const types=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg;codecs=opus"];
  const errors=[];
  for(const mimeType of types){
    if(MediaRecorder.isTypeSupported&&!MediaRecorder.isTypeSupported(mimeType))continue;
    try{return new MediaRecorder(stream,{mimeType});}
    catch(error){errors.push(mimeType+": "+String(error?.message||error));}
  }
  // Some Edge versions only accept their default encoder. Use its ACTUAL
  // MIME type for upload, never assume the requested codec was used.
  try{return new MediaRecorder(stream);}
  catch(error){throw new Error("A MediaRecorder nem indítható Edge alatt. "+errors.join("; ")+"; "+String(error?.message||error));}
}
async function startRecord(){
  // Options-page TTS preview uses a different path. Validate the Bridge
  // content-script ↔ service-worker channel before requesting the microphone.
  await reloadBridgeSettings();
  if(!s.configured){setStatus("Előbb add meg a Gemini API-kulcsot.","idle");return;}
  if(["transcribing","sending","waiting"].includes(s.phase))return;
  if(s.phase==="playing")stopSpeech();
  if(s.recorder?.state==="recording")return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined")
    throw new Error("Ezen az Edge-verzión nem érhető el a MediaRecorder/getUserMedia.");
  let stream;
  try{
    stream=await navigator.mediaDevices.getUserMedia({
      audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}
    });
  }catch(error){throw describeMicError(error);}
  let recorder;
  try{recorder=createAudioRecorder(stream);}
  catch(error){stream.getTracks().forEach(t=>t.stop());throw error;}
  s.stream=stream;s.recorder=recorder;s.chunks=[];s.started=Date.now();
  recorder.ondataavailable=event=>{if(event.data?.size)s.chunks.push(event.data);};
  recorder.onerror=event=>{
    issue(new Error("Az Edge hangrögzítője hibát jelzett: "+String(event.error?.message||event.error?.name||"MediaRecorder error")));
  };
  recorder.onstop=()=>{
    // MediaRecorder's final dataavailable fires before onstop.
    const mime=recorder.mimeType||s.chunks.find(x=>x.type)?.type||"";
    releaseMicrophone();
    void processRecorded(mime).catch(issue);
  };
  try{recorder.start(1000);}
  catch(error){releaseMicrophone();s.recorder=null;throw new Error("Az Edge nem tudta elindítani a felvételt: "+String(error?.message||error));}
  playCue("listen");
  void lockScreen();
  s.autoTimer=setTimeout(()=>{if(recorder.state==="recording")recorder.stop();},120000);
  setStatus("Mikrofon aktív, hangrögzítés folyamatban ("+(recorder.mimeType||"alapértelmezett formátum")+"). Beszélj, majd nyomd meg újra.","recording");
}
function finishRecord(){
  if(s.recorder?.state!=="recording")return;
  playCue("process");
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
async function transcribeWithChime(payload){
  // Processing feedback for BOTH manual recording and hands-free VAD.
  // Starts only after microphone capture/encoding, stops on success or error.
  // A Symbol cannot collide with numeric TTS playback tokens.
  const owner=Symbol("stt-progress");
  const controller=new AbortController();
  startWaitChime(owner,controller.signal,{delayMs:250,repeatMs:1900});
  try{
    return await message("TRANSCRIBE",payload);
  }finally{
    controller.abort();
    stopWaitChime(owner);
  }
}
async function processRecorded(mime){
  const seconds=(Date.now()-s.started)/1000;
  if(seconds<0.5){setStatus("A felvétel túl rövid. Próbáld újra.","idle");return;}
  const blob=new Blob(s.chunks,{type:mime||s.chunks.find(x=>x.type)?.type||""});
  s.chunks=[];
  const resolvedMime=blob.type.split(";")[0].toLowerCase();
  if(blob.size<128)throw new Error("A mikrofon elindult, de az Edge nem adott használható hangadatot ("+blob.size+" bájt). Nem indult Gemini STT-kérés.");
  if(!["audio/webm","audio/ogg","audio/mp4"].includes(resolvedMime))
    throw new Error("Az Edge nem támogatott felvételi formátumot adott: "+(blob.type||"ismeretlen")+". Nem indult Gemini STT-kérés.");
  setStatus("A felvétel elkészült: "+(blob.size/1024).toFixed(1)+" KiB, "+resolvedMime+", "+seconds.toFixed(1)+" mp. Gemini beszédátírás…","transcribing");
  const data=await blobBase64(blob);
  const {transcript}=await transcribeWithChime({duration:Math.min(seconds,120),mime:resolvedMime,data});
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
function dismissMobileKeyboard(){
  const node=editor();
  if(node&&node.contains(document.activeElement)||document.activeElement===node)document.activeElement?.blur();
  node?.blur();
  // Clear the programmatic caret after inserting. No forced blur on a user
  // refocus: users can still type manually after the automated send.
  window.getSelection()?.removeAllRanges();
}
function putTranscript(text){
  const node=editor();
  if(!node)throw new Error("A beviteli mező nem található. A leirat nincs elküldve.");
  // Programmatic insertion should not summon Android IME. Restore the
  // original inputmode immediately so manual editing still opens the keyboard.
  const oldMode=node.getAttribute("inputmode");
  node.setAttribute("inputmode","none");
  try{
    node.focus({preventScroll:true});
    const selection=window.getSelection();
    const range=document.createRange();
    range.selectNodeContents(node);range.collapse(false);
    selection.removeAllRanges();selection.addRange(range);
    const old=node.textContent?.trim();
    const inserted=document.execCommand("insertText",false,(old?"\n":"")+text);
    if(!inserted)throw new Error("A szerkesztő elutasította a szövegbeszúrást.");
    node.dispatchEvent(new InputEvent("input",{bubbles:true,inputType:"insertText",data:text}));
  }finally{
    dismissMobileKeyboard();
    if(oldMode===null)node.removeAttribute("inputmode");
    else node.setAttribute("inputmode",oldMode);
  }
}
async function sendTranscript(){
  if(!s.pending)return;
  const button=await (async()=>{for(let i=0;i<10;i++){const b=sendButton();if(b)return b;await sleep(150);}return null;})();
  if(!button){setStatus("Nem található aktív Küldés gomb. A leirat a szerkesztőben maradt.","idle");return;}
  const baseline=assistantText();
  const count=assistantElements().length;
  s.pending=false;
  dismissMobileKeyboard();
  button.click();
  dismissMobileKeyboard();
  setStatus("Claude válaszára várok…","waiting");
  await monitorAnswer(baseline,count);
}
async function monitorAnswer(baseline,count){
  if(s.activeWait){s.activeWait.disconnect();s.activeWait=null;}
  const started=Date.now(),owner=Symbol("claude-answer-wait");
  const waitController=new AbortController();
  const chimeOptions={delayMs:1100,repeatMs:4200};
  let last="",changedAt=started,reported=false,approvalPaused=false,sawGeneration=false;
  // Claude can spend much longer reasoning or calling tools than Gemini spends
  // synthesizing a segment. Keep the gentle progress sound while waiting.
  startWaitChime(owner,waitController.signal,chimeOptions);
  return new Promise((resolve,reject)=>{
    const obs=new MutationObserver(update);
    s.activeWait=obs;
    const ticker=setInterval(update,500);
    function cleanup(){
      obs.disconnect();clearInterval(ticker);
      waitController.abort();
      stopWaitChime(owner);
      if(s.activeWait===obs)s.activeWait=null;
    }
    function update(){
      if(!wrapper.isConnected){cleanup();resolve();return;}
      const now=Date.now();
      if(now-started>600000){cleanup();reject(new Error("Claude 10 perc alatt sem fejezte be a választ."));return;}
      if(now-started>180000&&!reported){reported=true;setStatus("Claude még dolgozik. Tovább várok…","waiting");}
      if(pendingToolApproval()){
        if(!approvalPaused){approvalPaused=true;stopWaitChime(owner);}
        setStatus("Claude jóváhagyást kér egy eszközművelethez. Ellenőrizd a Claude felületét.","waiting");
        changedAt=now;return;
      }
      if(approvalPaused){
        approvalPaused=false;
        startWaitChime(owner,waitController.signal,chimeOptions);
        setStatus("Claude válaszára várok…","waiting");
      }
      const elements=assistantElements(),latest=elements.at(-1);
      const text=assistantText();
      const fresh=(elements.length>count||text!==baseline)&&text.length>0;
      const stop=bySelector("stop");
      const streamingNode=latest?.closest("[data-is-streaming]")||
        latest?.querySelector("[data-is-streaming]");
      const streaming=streamingNode?.getAttribute("data-is-streaming")==="true";
      // We can only trust a short silence if the UI has demonstrably shown
      // generation in progress AND it has now stopped. Otherwise the mobile
      // Claude DOM may have no matching Stop button at all.
      if(stop||streaming)sawGeneration=true;
      if(!fresh)return;
      if(last!==text){last=text;changedAt=now;return;}
      if(stop||streaming)return;
      const stableMs=sawGeneration?2600:9500;
      if(now-changedAt>=stableMs){
        cleanup();
        s.lastAnswer=text;
        resolve(speak(text));
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
  s.playToken++;
  // An explicit stop cancels the ENTIRE multi-paragraph playback session,
  // including a request for the following paragraph still waiting on Gemini.
  s.speechController?.abort();
  s.speechController=null;
  s.speechActive=false;
  stopWaitChime();
  clearAudio();
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
  const controller=new AbortController();
  s.speechController=controller;
  s.speechActive=true;
  setStatus("Felolvasás indul…","playing");
  try{
    for(let i=0;i<parts.length;i++){
      if(controller.signal.aborted||token!==s.playToken)return;
      // The TTS provider returns each segment separately. Explain the silence
      // and play soft progress notes only while waiting, never over speech.
      setStatus("A következő szövegrész készül ("+(i+1)+"/"+parts.length+")…","playing");
      let output;
      startWaitChime(token,controller.signal);
      try{
        output=await CVB.untilCancelled(message("SYNTHESIZE",{text:parts[i]}),controller.signal);
      }catch(error){
        stopWaitChime(token);
        if(controller.signal.aborted||token!==s.playToken)return;
        // Restore half-duplex during native TTS fallback.
        if(barge.monitoring)await disarmBargeDuringTts();
        setStatus("Gemini TTS-hiba. Beépített felolvasás ("+(i+1)+"/"+parts.length+"): "+String(error?.message||error).slice(0,85),"playing");
        await fallbackSpeak(parts[i],token);
        continue;
      }finally{
        stopWaitChime(token);
      }
      if(!output||controller.signal.aborted||token!==s.playToken)return;
      setStatus("Felolvasás ("+(i+1)+"/"+parts.length+")…","playing");
      // Barge-in only needs the microphone while audible speech is playing,
      // not while an API request or chime is in progress.
      if(hands.enabled&&hands.busy&&barge.enabled)await armBargeDuringTts();
      if(controller.signal.aborted||token!==s.playToken)return;
      try{
        await playBlob(decodeAudio(output.data,output.mime),token);
      }catch(error){
        if(controller.signal.aborted||token!==s.playToken)return;
        if(barge.monitoring)await disarmBargeDuringTts();
        setStatus("Hanghiba. Beépített felolvasás ("+(i+1)+"/"+parts.length+")…","playing");
        await fallbackSpeak(parts[i],token);
      }finally{
        if(barge.monitoring)await disarmBargeDuringTts();
      }
    }
    if(token===s.playToken&&!controller.signal.aborted)
      setStatus("Felolvasás befejezve.","idle");
  }finally{
    stopWaitChime(token);
    if(barge.monitoring)await disarmBargeDuringTts();
    if(s.speechController===controller){
      s.speechController=null;
      s.speechActive=false;
      // Preserve the final completion or stopped state.
      setStatus($("status").textContent,s.phase);
    }
  }
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
function resetBargeCandidate(){
  barge.candidateAt=0;barge.highFrames=0;
  if(s.audio)s.audio.volume=1;
}
async function armBargeDuringTts(){
  if(!hands.enabled||!barge.enabled||!hands.busy||!hands.vad||s.phase!=="playing")return;
  barge.monitoring=true;resetBargeCandidate();
  try{await hands.vad.start();}
  catch(error){
    // A failed microphone start must never look like barge-in is active.
    barge.monitoring=false;barge.enabled=false;
    resetBargeCandidate();
    issue(new Error("Közbevágás nem indult, fél-duplex mód marad: "+String(error.message||error)));
  }
}
async function disarmBargeDuringTts(){
  if(!barge.monitoring)return;
  barge.monitoring=false;resetBargeCandidate();
  if(hands.vad&&hands.busy)await hands.vad.pause();
}
function consumeBargeAudio(generation){
  if(!hands.enabled||generation!==hands.generation){barge.queuedAudio=null;return;}
  if(hands.busy||!barge.queuedAudio)return;
  const audio=barge.queuedAudio;barge.queuedAudio=null;
  void handleHandsSpeech(audio,generation);
}
async function toggleBarge(){
  if(!hands.enabled)return;
  barge.enabled=!barge.enabled;
  if(!barge.enabled){
    if(barge.monitoring)await disarmBargeDuringTts();
    barge.confirmed=false;barge.queuedAudio=null;resetBargeCandidate();
  }else if(s.phase==="playing"&&hands.busy)await armBargeDuringTts();
  setStatus(barge.enabled?"Közbevágás aktív a felolvasás alatt.":"Közbevágás kikapcsolva. Half-duplex mód.",s.phase);
}
async function pauseHands(){
  if(hands.vad)await hands.vad.pause();
}
async function resumeHands(generation=hands.generation){
  if(vadRestartPending&&await restartVadIfNeeded())return;
  if(!hands.enabled||hands.generation!==generation||hands.busy||barge.confirmed||barge.queuedAudio||s.pending&&s.sendMode!=="confirm")return;
  if(!hands.vad)return;
  await hands.vad.start();
  if(hands.enabled&&hands.generation===generation&&!hands.busy){
    hands.speechAt=0;
    setStatus("Automata mód: hallgatok. A beszéd végét a Silero érzékeli.","listening");
    playCue("listen");
  }
}
async function disableHandsFree(){
  barge.enabled=false;barge.monitoring=false;barge.confirmed=false;
  barge.queuedAudio=null;resetBargeCandidate();
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
  await reloadBridgeSettings();
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
      getStream:async()=>{
        try{return await navigator.mediaDevices.getUserMedia({audio:{
          channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true
        }});}
        catch(error){throw describeMicError(error);}
      },
      startOnLoad:false,
      baseAssetPath:chrome.runtime.getURL("vendor/"),
      onnxWASMBasePath:chrome.runtime.getURL("vendor/"),
      positiveSpeechThreshold:hands.threshold,
      negativeSpeechThreshold:Math.max(0.25,hands.threshold-0.22),
      redemptionFrames:Math.round(hands.silenceMs/32),
      minSpeechFrames:16,
      preSpeechPadFrames:10,
      onSpeechStart:()=>{
        if(!hands.enabled||hands.generation!==generation)return;
        if(barge.monitoring&&barge.enabled&&hands.busy&&s.phase==="playing"){
          barge.candidateAt=Date.now();barge.highFrames=0;
          // Temporarily duck the Gemini audio. If actual user speech is still
          // detected after 300 ms, the interruption is confirmed.
          if(s.audio)s.audio.volume=0.12;
          return;
        }
        if(hands.busy)return;
        hands.speechAt=Date.now();
        setStatus("Beszédet érzékeltem. A csend után automatikusan küldöm.","listening");
      },
      onVADMisfire:()=>{
        if(barge.confirmed){
          barge.confirmed=false;resetBargeCandidate();
          if(!hands.busy)void resumeHands(generation).catch(issue);
          return;
        }
        if(barge.monitoring){resetBargeCandidate();return;}
        if(hands.enabled&&!hands.busy)setStatus("Túl rövid beszéd, tovább hallgatok.","listening");
      },
      onFrameProcessed:probabilities=>{
        if(!hands.enabled||hands.generation!==generation)return;
        if(barge.monitoring&&barge.candidateAt&&!barge.confirmed){
          const strong=Number(probabilities?.isSpeech||0)>=Math.max(0.65,hands.threshold);
          barge.highFrames=strong?barge.highFrames+1:0;
          if(CVB.bargeSpeechConfirmed(Date.now()-barge.candidateAt,barge.highFrames)){
            barge.confirmed=true;barge.confirmedAt=Date.now();barge.monitoring=false;
            stopSpeech();
            setStatus("Közbevágás érzékelve. Hallgatlak…","interrupting");
          }
        }
        if(barge.confirmed&&Date.now()-barge.confirmedAt>120000){
          void disableHandsFree().then(()=>issue(new Error("A közbevágás túl hosszú volt.")));
        }else if(!hands.busy&&hands.speechAt&&Date.now()-hands.speechAt>120000){
          hands.busy=true;
          void disableHandsFree().then(()=>issue(new Error("A beszéd meghaladta a 120 másodpercet.")));
        }
      },
      onSpeechEnd:audio=>{
        if(!hands.enabled||hands.generation!==generation)return;
        if(barge.confirmed){
          barge.confirmed=false;barge.queuedAudio=audio;resetBargeCandidate();
          // Wait for in-flight Claude/TTS loop to unwind before STT.
          if(!hands.busy)consumeBargeAudio(generation);
          return;
        }
        if(barge.monitoring){resetBargeCandidate();return;}
        void handleHandsSpeech(audio,generation);
      }
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
  primeAudio();
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
    playCue("process");
    const seconds=audio.length/globalThis.CVBWav.SAMPLE_RATE;
    if(seconds<0.5){setStatus("Túl rövid beszéd. Folytatom a figyelést.","idle");return;}
    if(seconds>122)throw new Error("A hang meghaladta a 120 másodperces keretet.");
    setStatus("Silero beszédvég érzékelve: "+seconds.toFixed(1)+" mp hang. Gemini STT indul…","transcribing");
    const data=globalThis.CVBWav.pcm16WavBase64(audio);
    const {transcript}=await transcribeWithChime({duration:Math.min(seconds,120),mime:"audio/wav",data});
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
      if(barge.queuedAudio){consumeBargeAudio(generation);}
      else if(!barge.confirmed){
        try{await resumeHands(generation);}catch(error){issue(error);await disableHandsFree();}
      }
    }
  }
}
async function sendWithHalfDuplex(){
  const generation=hands.generation;
  const manage=hands.enabled&&!hands.busy;
  if(manage){hands.busy=true;await pauseHands();}
  try{await sendTranscript();}
  finally{
    if(manage){
      hands.busy=false;
      if(barge.queuedAudio)consumeBargeAudio(generation);
      else if(!barge.confirmed)await resumeHands(generation);
    }
  }
}
async function repeatWithHalfDuplex(){
  const generation=hands.generation;
  const manage=hands.enabled&&!hands.busy;
  if(manage){hands.busy=true;await pauseHands();}
  try{if(s.lastAnswer)await speak(s.lastAnswer);}
  finally{
    if(manage){
      hands.busy=false;
      if(barge.queuedAudio)consumeBargeAudio(generation);
      else if(!barge.confirmed)await resumeHands(generation);
    }
  }
}

async function toggleRecord(){
  primeAudio();
  try{if(hands.enabled)await disableHandsFree();if(s.phase==="recording")finishRecord();else await startRecord();}
  catch(error){releaseMicrophone();issue(error);}
}

/* Two distinct, gentle, short state cues: listening and processing.
 * Quetta can suspend WebAudio even though media playback works. Prefer the
 * browser's native Audio (already verified for Gemini TTS), retry via
 * AudioContext on autoplay rejection. Both sounds are generated locally.
 */
const cueUrls=new Map();
let cuePlayer=null, cueContext=null, cueCounter=0;
function wavCue(type){
  if(cueUrls.has(type))return cueUrls.get(type);
  const sampleRate=22050, duration=0.22, count=Math.round(sampleRate*duration);
  const bytes=new Uint8Array(44+count*2),dv=new DataView(bytes.buffer);
  function name(i,str){for(let j=0;j<str.length;j++)bytes[i+j]=str.charCodeAt(j);}
  name(0,"RIFF");dv.setUint32(4,bytes.length-8,true);name(8,"WAVE");
  name(12,"fmt ");dv.setUint32(16,16,true);dv.setUint16(20,1,true);
  dv.setUint16(22,1,true);dv.setUint32(24,sampleRate,true);
  dv.setUint32(28,sampleRate*2,true);dv.setUint16(32,2,true);
  dv.setUint16(34,16,true);name(36,"data");dv.setUint32(40,count*2,true);
  for(let i=0;i<count;i++){
    const t=i/sampleRate,shape=Math.sin(Math.PI*i/count)**2;
    const f=type==="listen"?690+110*(i/count):570-120*(i/count);
    const amplitude=0.10*shape*Math.sin(2*Math.PI*f*t);
    dv.setInt16(44+i*2,Math.round(amplitude*32767),true);
  }
  const url=URL.createObjectURL(new Blob([bytes],{type:"audio/wav"}));
  cueUrls.set(type,url);
  return url;
}
function primeAudio(){
  try{
    const Constructor=window.AudioContext||window.webkitAudioContext;
    if(Constructor){
      cueContext ||= new Constructor();
      if(cueContext.state==="suspended")void cueContext.resume().catch(()=>{});
    }
    cuePlayer ||= new Audio();
    cuePlayer.volume=0.35; // Wave peak 0.10 => ~3.5% output.
  }catch{}
}
function webAudioCue(type){
  if(!cueContext||cueContext.state!=="running")return;
  const start=cueContext.currentTime+0.01,osc=cueContext.createOscillator(),
    gain=cueContext.createGain(),up=type==="listen";
  osc.type="sine";
  osc.frequency.setValueAtTime(up?690:570,start);
  osc.frequency.linearRampToValueAtTime(up?800:450,start+0.22);
  gain.gain.setValueAtTime(0.0001,start);
  gain.gain.linearRampToValueAtTime(0.033,start+0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001,start+0.22);
  osc.connect(gain).connect(cueContext.destination);
  osc.start(start);osc.stop(start+0.23);
  osc.onended=()=>{osc.disconnect();gain.disconnect();};
}
function playCue(type){
  if(!s.cuesEnabled||s.phase==="playing")return;
  const token=++cueCounter;
  primeAudio();
  if(cuePlayer){
    try{
      cuePlayer.pause();cuePlayer.src=wavCue(type);cuePlayer.currentTime=0;
      const result=cuePlayer.play();
      result?.catch(async()=>{
        if(token!==cueCounter)return;
        try{
          await cueContext?.resume();
          if(token===cueCounter)webAudioCue(type);
        }catch{}
      });
      return;
    }catch{}
  }
  if(cueContext?.state==="running")webAudioCue(type);
}
/* A faint four-note "ti-din-ti-dim" progress chime, only while Gemini
 * synthesizes the NEXT paragraph. First notes after 0.8 s; every 3.2 s
 * thereafter. It has a dedicated Audio instance, so it cannot take over
 * Claude's TTS player or the one-off listen/process beeps.
 */
const waitChime={token:null,delay:null,interval:null,player:null,url:null,oscillators:[]};
function makeWaitChimeWav(){
  if(waitChime.url)return waitChime.url;
  const sampleRate=22050,noteLength=0.087,gap=0.035;
  const notes=[665,820,720,555];
  const seconds=notes.length*(noteLength+gap)+0.05;
  const count=Math.round(seconds*sampleRate);
  const bytes=new Uint8Array(44+count*2),dv=new DataView(bytes.buffer);
  const label=(start,str)=>{for(let i=0;i<str.length;i++)bytes[start+i]=str.charCodeAt(i);};
  label(0,"RIFF");dv.setUint32(4,bytes.length-8,true);
  label(8,"WAVE");label(12,"fmt ");dv.setUint32(16,16,true);
  dv.setUint16(20,1,true);dv.setUint16(22,1,true);
  dv.setUint32(24,sampleRate,true);dv.setUint32(28,sampleRate*2,true);
  dv.setUint16(32,2,true);dv.setUint16(34,16,true);
  label(36,"data");dv.setUint32(40,count*2,true);
  for(let i=0;i<count;i++){
    const t=i/sampleRate;
    const idx=Math.floor(t/(noteLength+gap));
    let value=0;
    if(idx<notes.length){
      const local=t-idx*(noteLength+gap);
      if(local>=0&&local<noteLength){
        const envelope=Math.sin(Math.PI*local/noteLength)**2;
        value=0.075*envelope*Math.sin(2*Math.PI*notes[idx]*local);
      }
    }
    dv.setInt16(44+i*2,Math.round(value*32767),true);
  }
  waitChime.url=URL.createObjectURL(new Blob([bytes],{type:"audio/wav"}));
  return waitChime.url;
}
function playWaitChime(token,signal){
  // Shared by Gemini TTS segment generation and Gemini STT transcription.
  // waitChime.token is the single owner; late callbacks never make noise.
  if(waitChime.token!==token||signal.aborted||!s.cuesEnabled||s.audio||s.fallbackEnd)return;
  try{
    waitChime.player ||= new Audio();
    const player=waitChime.player;
    player.volume=0.28;  // PCM peak 7.5% * player volume 28% => ~2% peak.
    player.pause();
    player.src=makeWaitChimeWav();
    player.currentTime=0;
    const play=player.play();
    play?.catch(async()=>{
      if(waitChime.token!==token||signal.aborted)return;
      // Fall back to WebAudio if Quetta blocks a new media player.
      try{
        primeAudio();await cueContext?.resume();
        if(waitChime.token!==token||signal.aborted||s.audio||s.fallbackEnd||cueContext?.state!=="running")return;
        const start=cueContext.currentTime+0.02;
        for(const [i,freq] of [665,820,720,555].entries()){
          if(waitChime.token!==token)return;
          const at=start+i*0.122;
          const o=cueContext.createOscillator(),g=cueContext.createGain();
          o.type="sine";o.frequency.value=freq;
          g.gain.setValueAtTime(0.0001,at);
          g.gain.linearRampToValueAtTime(0.016,at+0.025);
          g.gain.exponentialRampToValueAtTime(0.0001,at+0.085);
          o.connect(g).connect(cueContext.destination);
          waitChime.oscillators.push(o);
          o.start(at);o.stop(at+0.09);
          o.onended=()=>{
            waitChime.oscillators=waitChime.oscillators.filter(item=>item!==o);
            o.disconnect();g.disconnect();
          };
        }
      }catch{}
    });
  }catch{}
}
function stopWaitChime(owner=null){
  // Ignore stale cleanup from a previous speech run.
  if(owner!==null&&waitChime.token!==owner)return;
  waitChime.token=null;
  if(waitChime.delay!==null){clearTimeout(waitChime.delay);waitChime.delay=null;}
  if(waitChime.interval!==null){clearInterval(waitChime.interval);waitChime.interval=null;}
  if(waitChime.player){
    try{
      waitChime.player.pause();
      waitChime.player.removeAttribute("src");
      waitChime.player.load();
    }catch{}
  }
  for(const osc of waitChime.oscillators){
    try{osc.stop();osc.disconnect();}catch{}
  }
  waitChime.oscillators=[];
}
function startWaitChime(token,signal,{delayMs=800,repeatMs=3200}={}){
  stopWaitChime();
  if(!s.cuesEnabled||signal.aborted)return;
  waitChime.token=token;
  waitChime.delay=setTimeout(()=>{
    waitChime.delay=null;
    if(waitChime.token!==token||signal.aborted)return;
    playWaitChime(token,signal);
    waitChime.interval=setInterval(()=>playWaitChime(token,signal),repeatMs);
  },delayMs);
}

function applyCollapsed(value){
  wrapper.dataset.collapsed=String(value);
  // Quetta Android renders the Claude conversation toolbar directly below
  // the browser chrome. Shift only the collapsed handle 68 px lower so it
  // does not cover the conversation title, share and navigation controls.
  // Keep the expanded drawer top-anchored as requested.
  wrapper.style.top=value
    ?"calc(env(safe-area-inset-top, 0px) + 76px)"
    :"calc(env(safe-area-inset-top, 0px) + 8px)";
  const button=$("toggle");
  button.textContent=value?"›":"‹";
  button.setAttribute("aria-expanded",String(!value));
  button.setAttribute("aria-label",value?"Panel kinyitása":"Panel becsukása");
}
function showSliderValues(){
  $("noiseValue").textContent=Number($("noise").value).toFixed(2).replace(".",",");
  $("silenceValue").textContent=$("silence").value+" ms";
}
async function updateVadControls(){
  const previous=hands.enabled;
  const threshold=Number($("noise").value);
  const silence=Number($("silence").value);
  if(previous)await disableHandsFree();
  const saved=await message("UPDATE_UI_SETTINGS",{values:{vadThreshold:threshold,silenceMs:silence}});
  hands.threshold=saved.settings.vadThreshold;
  hands.silenceMs=saved.settings.silenceMs;
  if(previous)await enableHandsFree();
}
$("toggle").addEventListener("click",()=>{
  const closed=wrapper.dataset.collapsed!=="true";
  applyCollapsed(closed);
  void message("UPDATE_UI_SETTINGS",{values:{panelCollapsed:closed}}).catch(issue);
});
for(const id of ["noise","silence"]){
  $(id).addEventListener("input",showSliderValues);
  $(id).addEventListener("change",()=>{void updateVadControls().catch(issue);});
}

$("cueTest").addEventListener("click",()=>{
  // Trusted user gesture unlocks Android media playback for subsequent VAD
  // state transitions. This also makes the two sounds independently testable.
  primeAudio();
  playCue("listen");
  setTimeout(()=>playCue("process"),550);
});
$("record").addEventListener("click",()=>{void toggleRecord();});
$("hands").addEventListener("click",()=>{void toggleHandsFree();});
$("barge").addEventListener("click",()=>{void toggleBarge().catch(issue);});
$("send").addEventListener("click",()=>{void sendWithHalfDuplex().catch(issue);});
$("stop").addEventListener("click",stopSpeech);
$("repeat").addEventListener("click",()=>{void repeatWithHalfDuplex().catch(issue);});
$("help").addEventListener("click",()=>{
  const panel=$("helpPanel"),next=panel.hidden;
  panel.hidden=!next;
  $("help").setAttribute("aria-expanded",String(next));
  $("help").setAttribute("aria-label",next?"Súgó bezárása":"Súgó megnyitása");
  $("help").title=next?"Súgó bezárása":"Súgó megnyitása";
});
$("settings").addEventListener("click",()=>{void message("OPEN_OPTIONS").catch(issue);});
chrome.runtime.onMessage.addListener((request,sender,reply)=>{
  if(request?.type==="TOGGLE_RECORD"){void toggleRecord();reply({ok:true});}
  if(request?.type==="STOP_SPEECH"){stopSpeech();reply({ok:true});}
});
const disconnectSettingsSync=startSettingsSync();
window.addEventListener("pagehide",()=>{
  disconnectSettingsSync();
  stopSpeech();
  if(waitChime.url)URL.revokeObjectURL(waitChime.url);
  void disableHandsFree();releaseMicrophone();clearAudio();
  cuePlayer?.pause();
  for(const url of cueUrls.values())URL.revokeObjectURL(url);
  cueUrls.clear();
});
void init();
})();
