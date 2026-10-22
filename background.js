/* MV3 service worker: only component allowed to access the Gemini key. */
"use strict";
const BASE="https://generativelanguage.googleapis.com";
const defaults={
  sttModel:"gemini-3.5-transcribe",ttsModel:"gemini-3.8-flash-lite-tts",
  voice:"Kore",style:"Nyugodt, természetes magyar beszéd, közepes tempó.",
  sendMode:"auto",maxMinutes:30,maxChars:20000,vocabulary:"Claude\nGemini\nQuetta"
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
async function synthesize(message){
  const config=await settings();
  if(!config.apiKey)throw new Error("Hiányzik a Gemini API-kulcs.");
  if(!/^[a-zA-Z0-9._-]{4,100}$/.test(config.ttsModel))throw new Error("Érvénytelen TTS modellnév.");
  const sentence=String(message.text||"").trim();
  if(!sentence||sentence.length>600)throw new Error("Üres vagy túl hosszú felolvasandó szöveg.");
  const used=await getUsage();
  if(used.chars+sentence.length>Number(config.maxChars))throw new Error("Elérted a napi TTS-karakterkorlátot.");
  const result=await postJson("interactions",config.apiKey,{
    model:config.ttsModel,
    input:[{type:"user_input",content:[{type:"text",text:sentence,annotations:[{type:"speech_metadata",style:String(config.style||"").slice(0,200)}]}]}],
    response_format:{type:"audio"},
    generation_config:{speech_config:[{voice:String(config.voice||"Kore").slice(0,100)}]}
  });
  const audio=readAudio(result);
  if(!audio?.data)throw new Error("Gemini TTS nem adott hangot.");
  if(audio.data.length>15000000)throw new Error("Túl nagy TTS-válasz.");
  await charge(0,sentence.length);
  return {data:audio.data,mime:audio.mime||"audio/wav"};
}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(!message||typeof message.type!=="string")return;
  const page=String(sender.url||sender.tab?.url||"");
  const allowed=page.startsWith("https://claude.ai/")||(sender.id===chrome.runtime.id&&!sender.tab);
  if(!allowed){respond({ok:false,error:"Nem engedélyezett hívó."});return;}
  (async()=>{
    if(message.type==="GET_SETTINGS"){
      const config=await settings();
      return {settings:Object.fromEntries(exposed.map(k=>[k,config[k]])),configured:!!config.apiKey};
    }
    if(message.type==="GET_STATUS")return {usage:await getUsage()};
    if(message.type==="OPEN_OPTIONS"){await chrome.runtime.openOptionsPage();return{};}
    if(message.type==="TRANSCRIBE"&&page.startsWith("https://claude.ai/"))return transcribe(message);
    if(message.type==="SYNTHESIZE"&&page.startsWith("https://claude.ai/"))return synthesize(message);
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
