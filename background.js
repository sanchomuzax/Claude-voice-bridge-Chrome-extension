/* MV3 service worker: only component allowed to access the Gemini key. */
"use strict";
const BASE="https://generativelanguage.googleapis.com";
const defaults={
  sttModel:"gemini-3.5-transcribe",ttsModel:"gemini-3.8-flash-lite-tts",
  voice:"Kore",style:"Nyugodt, természetes magyar beszéd, határozott tempó.",
  sendMode:"auto",silenceMs:1200,vadThreshold:0.62,soundCues:true,panelCollapsed:false,maxMinutes:30,maxChars:20000,vocabulary:"Claude\nGemini\nQuetta"
};
const exposed=Object.keys(defaults);
const day=()=>new Date().toLocaleDateString("en-CA",{timeZone:"Europe/Budapest",year:"numeric",month:"2-digit",day:"2-digit"});
async function isolateKey(){
  if(chrome.storage.local.setAccessLevel)await chrome.storage.local.setAccessLevel({accessLevel:"TRUSTED_CONTEXTS"});
}
void isolateKey().catch(()=>{});
chrome.runtime.onInstalled.addListener(()=>{void isolateKey().catch(()=>{});});
chrome.runtime.onStartup.addListener(()=>{void isolateKey().catch(()=>{});});
async function settings(){return {...defaults,...await chrome.storage.local.get(["apiKey",...exposed])};}
async function getUsage(){
  const {dailyUsage}=await chrome.storage.local.get("dailyUsage");
  return dailyUsage?.date===day()?dailyUsage:{date:day(),minutes:0,chars:0};
}
async function charge(min=0,chars=0){
  const usage=await getUsage();
  const updated={date:usage.date,minutes:usage.minutes+min,chars:usage.chars+chars};
  await chrome.storage.local.set({dailyUsage:updated});
  return updated;
}
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
async function request(url,{method="POST",headers={},body}={}){
  let last;
  for(let attempt=0;attempt<2;attempt++){
    try{
      const response=await fetch(url,{method,headers,body,signal:AbortSignal.timeout(120000)});
      if(response.ok)return response;
      const json=await response.json().catch(()=>({}));
      const code=response.status;
      last=new Error("Gemini API "+code+": "+String(json.error?.message||response.statusText).slice(0,200));
      if(attempt===0&&(code===429||code>=500)){await sleep(1000);continue;}
      throw last;
    }catch(error){
      last=error;
      if(attempt===0&&error instanceof TypeError){await sleep(800);continue;}
      break;
    }
  }
  throw last||new Error("Ismeretlen Google API-hiba.");
}
function keyHeaders(key){return {"x-goog-api-key":key};}
async function postJson(path,key,object){
  const response=await request(BASE+"/v1beta/"+path,{headers:{...keyHeaders(key),"Content-Type":"application/json"},body:JSON.stringify(object)});
  return response.json();
}
function audioBytes(encoded){
  if(typeof encoded!=="string"||encoded.length<100||encoded.length>13000000||!/^[A-Za-z0-9+/=\s]+$/.test(encoded))
    throw new Error("Hibás vagy túl nagy hangadat.");
  const decoded=atob(encoded);
  const bytes=new Uint8Array(decoded.length);
  for(let i=0;i<decoded.length;i++)bytes[i]=decoded.charCodeAt(i);
  return bytes;
}
async function uploadAudio(key,bytes,mime){
  const start=await request(BASE+"/upload/v1beta/files",{
    headers:{
      ...keyHeaders(key),"Content-Type":"application/json",
      "X-Goog-Upload-Protocol":"resumable",
      "X-Goog-Upload-Command":"start",
      "X-Goog-Upload-Header-Content-Length":String(bytes.byteLength),
      "X-Goog-Upload-Header-Content-Type":mime
    },
    body:JSON.stringify({file:{display_name:"claude-voice-bridge-recording"}})
  });
  const uploadUrl=start.headers.get("x-goog-upload-url");
  if(!uploadUrl||!uploadUrl.startsWith(BASE+"/"))throw new Error("A Gemini nem adott érvényes feltöltési URL-t.");
  const done=await request(uploadUrl,{
    headers:{"X-Goog-Upload-Offset":"0","X-Goog-Upload-Command":"upload, finalize","Content-Type":mime},
    body:bytes
  });
  const {file}=await done.json();
  if(!file?.uri)throw new Error("A Google Files API nem adott fájl-URI-t.");
  return file;
}
async function removeAudio(key,file){
  if(!/^files\/[a-zA-Z0-9_-]+$/.test(file?.name||""))return;
  try{await request(BASE+"/v1beta/"+file.name,{method:"DELETE",headers:keyHeaders(key)});}catch{}
}
function readText(data){
  if(typeof data?.output_text==="string")return data.output_text.trim();
  if(typeof data?.interaction?.output_text==="string")return data.interaction.output_text.trim();
  const outputs=[...(data.outputs||[]),...(data.steps||[]).flatMap(step=>step.content||[])];
  const texts=outputs.filter(item=>item?.type==="text"&&typeof item.text==="string").map(item=>item.text);
  return texts.join("\n").trim();
}
async function transcribe(message){
  const config=await settings();
  if(!config.apiKey)throw new Error("Állítsd be előbb a Gemini API-kulcsot.");
  if(!/^[a-zA-Z0-9._-]{4,100}$/.test(config.sttModel))throw new Error("Érvénytelen STT modellnév.");
  const seconds=Number(message.duration);
  if(!Number.isFinite(seconds)||seconds<0.5||seconds>122)throw new Error("Érvénytelen felvételi hossz (0,5–120 s).");
  const mime=String(message.mime||"").split(";")[0].toLowerCase();
  if(!["audio/webm","audio/ogg","audio/mp4","audio/wav","audio/mpeg","audio/mp3"].includes(mime))throw new Error("Nem támogatott hangformátum: "+mime);
  const used=await getUsage();
  if(used.minutes+seconds/60>Number(config.maxMinutes))throw new Error("Elérted a napi STT-perckorlátot.");
  const bytes=audioBytes(message.data);
  const terms=String(config.vocabulary).split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,100);
  let file;
  try{
    file=await uploadAudio(config.apiKey,bytes,mime);
    const result=await postJson("interactions",config.apiKey,{
      model:config.sttModel,
      input:[{type:"audio",uri:file.uri,mime_type:mime}],
      generation_config:{transcription_config:{language_codes:["hu-HU"],mode:"verbatim",...(terms.length?{custom_vocabulary:terms}:{})}}
    });
    const transcript=readText(result);
    await charge(seconds/60,0);
    if(!transcript)throw new Error("A Gemini nem adott vissza leiratot.");
    return {transcript};
  }finally{if(file)await removeAudio(config.apiKey,file);}
}
function readAudio(data){
  if(typeof data?.output_audio?.data==="string")return data.output_audio;
  const steps=data?.steps||data?.interaction?.steps||[];
  for(const step of [...steps].reverse()){
    for(const item of [...(step.content||[])].reverse()){
      if(item?.type==="audio"&&typeof item.data==="string")return {data:item.data,mime:item.mime_type||item.mimeType||"audio/wav"};
    }
  }
  return null;
}
async function synthesize(message, preview=false){
  const config=await settings();
  if(!config.apiKey)throw new Error("Hiányzik a Gemini API-kulcs.");
  const model=preview?String(message.ttsModel||""):config.ttsModel;
  const voice=preview?String(message.voice||""):config.voice;
  const style=preview?String(message.style||""):config.style;
  // Preview is available only to the extension's own options UI.
  if(!/^[a-zA-Z0-9._-]{4,100}$/.test(model)||!/^gemini-3\.8-[\w.-]+-tts$/.test(model))
    throw new Error("Érvénytelen TTS modellnév.");
  if(!/^[a-zA-Z0-9_-]{2,110}$/.test(voice))throw new Error("Érvénytelen hangazonosító.");
  const sentence=String(message.text||"").trim();
  if(!sentence||sentence.length>600)throw new Error("Üres vagy túl hosszú felolvasandó szöveg.");
  const used=await getUsage();
  if(used.chars+sentence.length>Number(config.maxChars))throw new Error("Elérted a napi TTS-karakterkorlátot.");
  const result=await postJson("interactions",config.apiKey,{
    model,
    input:[{type:"user_input",content:[{type:"text",text:sentence,annotations:[{type:"speech_metadata",style:String(style||"").slice(0,200)}]}]}],
    response_format:{type:"audio"},
    generation_config:{speech_config:[{voice}]}
  });
  const audio=readAudio(result);
  if(!audio?.data)throw new Error("Gemini TTS nem adott hangot.");
  if(audio.data.length>15000000)throw new Error("Túl nagy TTS-válasz.");
  await charge(0,sentence.length);
  return {data:audio.data,mime:audio.mime||"audio/wav"};
}

async function officialCatalog(){
  const cfg=await settings();
  if(!cfg.apiKey)throw new Error("Előbb mentsd el a Gemini API-kulcsodat.");
  const headers=keyHeaders(cfg.apiKey);
  const modelItems=[];
  let token="";
  for(let page=0;page<5;page++){
    const url=new URL(BASE+"/v1beta/models");
    url.searchParams.set("pageSize","1000");
    if(token)url.searchParams.set("pageToken",token);
    const result=await (await request(url.toString(),{method:"GET",headers})).json();
    modelItems.push(...(result.models||[]));
    token=result.nextPageToken||"";
    if(!token)break;
  }
  // This extension uses the Interactions API transcription and 3.8 TTS
  // schemas: do NOT offer unsupported Live or generateContent-only models.
  const stt=modelItems.filter(item=>/^models\/gemini-[\w.-]+-transcribe$/.test(item.name||""));
  const tts=modelItems.filter(item=>/^models\/gemini-3\.8-[\w.-]+-tts$/.test(item.name||""));
  const models={stt:stt.map(item=>({id:item.name.slice(7),name:item.displayName||item.name.slice(7)})),
    tts:tts.map(item=>({id:item.name.slice(7),name:item.displayName||item.name.slice(7)}))};
  let voices=[],voicesError="";
  try{
    const url=new URL(BASE+"/v1beta/voices");
    url.searchParams.set("page_size","1000");
    const result=await (await request(url.toString(),{method:"GET",headers})).json();
    voices=(result.voices||[]).map(item=>({
      id:item.id||item.voice_id||item.name?.replace(/^voices\//,"")||"",
      name:item.display_name||item.displayName||item.id||item.name||"",
      description:item.description||""
    })).filter(item=>item.id).slice(0,1000);
    if(result.next_page_token||result.nextPageToken)voicesError="A hanglista első 1000 eleme látható.";
  }catch(e){voicesError=String(e?.message||e).slice(0,200);}
  return {models,voices,voicesError,asOf:"2026-10-22"};
}
async function updateUiSettings(values){
  if(!values||typeof values!=="object")throw new Error("Hibás felületbeállítás.");
  const allowed=new Set(["vadThreshold","silenceMs","panelCollapsed","soundCues"]);
  const keys=Object.keys(values);
  if(!keys.length||keys.some(key=>!allowed.has(key)))throw new Error("Nem engedélyezett beállítás.");
  const out={};
  if("vadThreshold" in values){
    const v=Number(values.vadThreshold);
    if(!Number.isFinite(v)||v<0.4||v>0.9)throw new Error("Zajküszöb csak 0,40 és 0,90 között lehet.");
    out.vadThreshold=v;
  }
  if("silenceMs" in values){
    const v=Number(values.silenceMs);
    if(!Number.isInteger(v)||v<700||v>2500)throw new Error("A csendküszöb 700 és 2500 ms közé eshet.");
    out.silenceMs=v;
  }
  if("panelCollapsed" in values)out.panelCollapsed=Boolean(values.panelCollapsed);
  if("soundCues" in values)out.soundCues=Boolean(values.soundCues);
  await chrome.storage.local.set(out);
  return {settings:out};
}

/* Edge/Chromium MV3 may terminate an idle worker while awaiting a long
 * remote upload/transcription. Keep only active Gemini operations alive with
 * a harmless extension API call every 20 seconds; never keep it alive idle.
 * This is separate from the content-script port heartbeat and protects fetch
 * gaps while retaining automatic shutdown after the task ends.
 */
function keepWorkerAlive(task){
  cvbActiveAudio++;
  const timer=setInterval(()=>{
    try{const pending=chrome.runtime.getPlatformInfo();pending?.catch?.(()=>{});}catch{}
  },20000);
  return Promise.resolve(task).finally(()=>{clearInterval(timer);cvbActiveAudio--;});
}
/* A dedicated long-lived Port avoids pinning a large STT/TTS result on a
 * single one-shot sendMessage response. Only the claude.ai content script may
 * request these paid operations. One task per Port, NEVER automatically retry.
 */
chrome.runtime.onConnect?.addListener(port=>{
  if(port.name!=="cvb-audio-task")return;
  const page=String(port.sender?.url||port.sender?.tab?.url||"");
  if(port.sender?.id!==chrome.runtime.id||!page.startsWith("https://claude.ai/")){
    try{port.disconnect();}catch{}return;
  }
  let busy=false,disconnected=false;
  const reply=message=>{if(!disconnected)try{port.postMessage(message);}catch{}};
  port.onDisconnect.addListener(()=>{disconnected=true;});
  port.onMessage.addListener(message=>{
    if(message?.type==="PING"){reply({type:"PONG"});return;}
    if(message?.type!=="REQUEST"||busy)return;
    busy=true;
    const task=message.task;
    const payload=message.data||{};
    if(task!=="TRANSCRIBE"&&task!=="SYNTHESIZE"){
      reply({type:"RESULT",ok:false,error:"Nem engedélyezett hangművelet."});return;
    }
    reply({type:"ACCEPTED"});
    keepWorkerAlive(task==="TRANSCRIBE"?transcribe(payload):synthesize(payload))
      .then(result=>reply({type:"RESULT",ok:true,...result}))
      .catch(error=>reply({type:"RESULT",ok:false,error:String(error?.message||error).slice(0,300)}));
  });
});
/* Extension updates: the browser can discover a release, but cannot alter
 * its own unpacked files. The optional Windows native host installs the
 * published, checksum-verified ZIP into the fixed unpacked folder.
 * Neither a web page nor a content script may invoke native installation.
 */
const CVB_REPOSITORY="sanchomuzax/Claude-voice-bridge-Chrome-extension";
const CVB_RELEASE_API="https://api.github.com/repos/"+CVB_REPOSITORY+"/releases/latest";
const CVB_NATIVE_HOST="com.sancho.cvb_updater";
const CVB_UPDATE_ALARM="cvb-release-check";
let cvbChecking=null,cvbInstalling=null,cvbActiveAudio=0;
function cvbSemver(value){
  const m=/^v?(\d+)\.(\d+)\.(\d+)$/.exec(String(value||""));
  return m?[Number(m[1]),Number(m[2]),Number(m[3])]:null;
}
function cvbIsNewer(remote,local){
  const a=cvbSemver(remote),b=cvbSemver(local);
  if(!a||!b)return false;
  for(let i=0;i<3;i++)if(a[i]!==b[i])return a[i]>b[i];
  return false;
}
async function cvbSavedStatus(){
  const data=await chrome.storage.local.get(["cvbAvailableUpdate","cvbCheckedAt","cvbUpdateError","cvbAutoInstall"]);
  const local=chrome.runtime.getManifest().version;
  const available=data.cvbAvailableUpdate;
  return {
    localVersion:local,
    latestVersion:available?.version||local,
    available:Boolean(available&&cvbIsNewer(available.version,local)),
    releaseUrl:available?.releaseUrl||"https://github.com/"+CVB_REPOSITORY+"/releases/latest",
    checkedAt:data.cvbCheckedAt||null,
    error:data.cvbUpdateError||"",
    autoInstall:data.cvbAutoInstall===true
  };
}
async function cvbRefreshBadge(status){
  try{
    await chrome.action?.setBadgeText({text:status.available?"UPD":""});
    if(status.available)await chrome.action?.setBadgeBackgroundColor({color:"#bf643f"});
  }catch{}
}
async function cvbCheckUpdate(){
  if(cvbChecking)return cvbChecking;
  cvbChecking=(async()=>{
    try{
      const response=await fetch(CVB_RELEASE_API,{
        headers:{"Accept":"application/vnd.github+json"},
        cache:"no-store",signal:AbortSignal.timeout(16000)
      });
      if(!response.ok)throw new Error("GitHub Releases HTTP "+response.status);
      const release=await response.json();
      const version=String(release.tag_name||"").replace(/^v/,"");
      if(!cvbSemver(version)||release.draft||release.prerelease)
        throw new Error("A GitHub nem érvényes stabil verziót adott.");
      const local=chrome.runtime.getManifest().version;
      const available=cvbIsNewer(version,local);
      const asset="Claude-Voice-Bridge-v"+version+".zip";
      const zip=(release.assets||[]).find(x=>x.name===asset);
      const checksum=(release.assets||[]).find(x=>x.name===asset+".sha256");
      const url="https://github.com/"+CVB_REPOSITORY+"/releases/tag/v"+version;
      if(available&&(!zip||!checksum))
        throw new Error("Az új kiadás ZIP-je vagy SHA-256 ellenőrzőösszege még nincs kész.");
      const update=available?{version,releaseUrl:url}:null;
      await chrome.storage.local.set({cvbAvailableUpdate:update,cvbCheckedAt:Date.now(),cvbUpdateError:""});
      const status=await cvbSavedStatus();
      await cvbRefreshBadge(status);
      if(status.available&&status.autoInstall&&cvbActiveAudio===0)
        void cvbInstallUpdate().catch(async error=>{
          await chrome.storage.local.set({cvbUpdateError:String(error?.message||error).slice(0,250)});
        });
      return status;
    }catch(error){
      await chrome.storage.local.set({cvbUpdateError:String(error?.message||error).slice(0,250),cvbCheckedAt:Date.now()});
      return cvbSavedStatus();
    }
  })().finally(()=>{cvbChecking=null;});
  return cvbChecking;
}
async function cvbInstallUpdate(){
  if(cvbInstalling)return cvbInstalling;
  cvbInstalling=(async()=>{
    if(cvbActiveAudio>0)throw new Error("Hangfeldolgozás van folyamatban. Frissíts utána.");
    const status=await cvbSavedStatus();
    if(!status.available)throw new Error("Nincs telepíthető új verzió.");
    const version=status.latestVersion;
    const reply=await new Promise((resolve,reject)=>{
      if(!chrome.runtime.sendNativeMessage){
        reject(new Error("Ez a böngésző nem támogatja a Native Messaging frissítőt."));return;
      }
      try{
        chrome.runtime.sendNativeMessage(CVB_NATIVE_HOST,{cmd:"install",version},value=>{
          const error=chrome.runtime.lastError?.message;
          if(error)return reject(new Error("A Windowsos frissítő nincs telepítve vagy nem érhető el: "+error));
          if(!value?.ok)return reject(new Error(value?.error||"A telepítés nem sikerült."));
          resolve(value);
        });
      }catch(error){reject(error);}
    });
    if(reply.version!==version)throw new Error("A Native Messaging segéd eltérő verziót jelentett.");
    await chrome.storage.local.set({cvbAvailableUpdate:null,cvbUpdateError:""});
    await cvbRefreshBadge({available:false});
    // Respond to popup before reloading the extension. The claude.ai tab
    // still needs its own reload to reinject the content script.
    setTimeout(()=>chrome.runtime.reload(),1200);
    return {ok:true,version,reloading:true};
  })().finally(()=>{cvbInstalling=null;});
  return cvbInstalling;
}
async function cvbSetAutoInstall(enabled){
  await chrome.storage.local.set({cvbAutoInstall:enabled===true});
  return cvbSavedStatus();
}
chrome.runtime.onInstalled.addListener(()=>{
  try{chrome.alarms?.create(CVB_UPDATE_ALARM,{periodInMinutes:60,delayInMinutes:1});}catch{}
  void cvbCheckUpdate();
});
chrome.runtime.onStartup.addListener(()=>{
  try{chrome.alarms?.create(CVB_UPDATE_ALARM,{periodInMinutes:60,delayInMinutes:1});}catch{}
  void cvbCheckUpdate();
});
chrome.alarms?.onAlarm.addListener(alarm=>{
  if(alarm.name===CVB_UPDATE_ALARM)void cvbCheckUpdate();
});
// A version check also runs when the worker first starts on an existing
// installation. Avoid doing network work inside a time-critical audio handler.
void cvbSavedStatus().then(cvbRefreshBadge).catch(()=>{});

/* Content scripts cannot read chrome.storage.local: the Gemini key is
 * deliberately restricted to trusted contexts. Push a key-free invalidation
 * signal through extension ports, then let each HUD request sanitized settings.
 */
const settingsPorts=new Set();
chrome.runtime.onConnect?.addListener(port=>{
  if(port.name!=="cvb-settings")return;
  const page=String(port.sender?.url||port.sender?.tab?.url||"");
  if(!page.startsWith("https://claude.ai/"))return;
  settingsPorts.add(port);
  port.onDisconnect.addListener(()=>settingsPorts.delete(port));
});
chrome.storage.onChanged?.addListener((changes,area)=>{
  if(area!=="local")return;
  // Usage accounting does not invalidate configuration.
  if(!Object.keys(changes).some(key=>key==="apiKey"||exposed.includes(key)))return;
  for(const port of settingsPorts){
    try{port.postMessage({type:"SETTINGS_UPDATED"});}
    catch{settingsPorts.delete(port);}
  }
});

chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(!message||typeof message.type!=="string")return;
  const page=String(sender.url||sender.tab?.url||"");
  const isExtension=sender.id===chrome.runtime.id&&page.startsWith(chrome.runtime.getURL(""));
  const allowed=page.startsWith("https://claude.ai/")||isExtension;
  if(!allowed){respond({ok:false,error:"Nem engedélyezett hívó."});return;}
  (async()=>{
    if(message.type==="GET_SETTINGS"){
      const config=await settings();
      return {settings:Object.fromEntries(exposed.map(k=>[k,config[k]])),configured:!!config.apiKey};
    }
    if(message.type==="GET_STATUS")return {usage:await getUsage()};
    if(message.type==="GET_UPDATE_STATUS"&&isExtension)return {update:await cvbSavedStatus()};
    if(message.type==="CHECK_UPDATE"&&isExtension)return {update:await cvbCheckUpdate()};
    if(message.type==="SET_AUTO_INSTALL"&&isExtension)return {update:await cvbSetAutoInstall(message.enabled)};
    if(message.type==="INSTALL_UPDATE"&&isExtension)return cvbInstallUpdate();
    if(message.type==="GET_CATALOG"&&isExtension)return officialCatalog();
    if(message.type==="PREVIEW_TTS"&&isExtension){
      const text=String(message.text||"").trim();
      if(text.length>200)throw new Error("A stíluspróba legfeljebb 200 karakteres lehet.");
      return keepWorkerAlive(synthesize({text,ttsModel:message.ttsModel,voice:message.voice,style:message.style},true));
    }
    if(message.type==="UPDATE_UI_SETTINGS"&&page.startsWith("https://claude.ai/"))return updateUiSettings(message.values);
    if(message.type==="OPEN_OPTIONS"){await chrome.runtime.openOptionsPage();return{};}
    if(message.type==="TRANSCRIBE"&&page.startsWith("https://claude.ai/"))return keepWorkerAlive(transcribe(message));
    if(message.type==="SYNTHESIZE"&&page.startsWith("https://claude.ai/"))return keepWorkerAlive(synthesize(message));
    throw new Error("Ismeretlen üzenet.");
  })().then(result=>respond({ok:true,...result})).catch(e=>respond({ok:false,error:String(e?.message||e).slice(0,300)}));
  return true;
});
chrome.commands.onCommand.addListener(async command=>{
  if(!["toggle-recording","stop-speech"].includes(command))return;
  const tabs=await chrome.tabs.query({active:true,currentWindow:true});
  const tab=tabs[0];
  if(!tab?.id)return;
  try{await chrome.tabs.sendMessage(tab.id,{type:command==="toggle-recording"?"TOGGLE_RECORD":"STOP_SPEECH"});}catch{}
});
