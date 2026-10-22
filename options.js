"use strict";
// Prices from Google Gemini Developer API pricing, verified 2026-10-22.
// Standard paid tier in USD; free availability and future prices differ.
const prices={
 "gemini-3.5-transcribe":"Fizetős standard: kb. 0,005 USD / perc összesen (bemenet 0,003 + kimenet 0,002).",
 "gemini-3.8-flash-lite-tts":"Fizetős standard 2026.12.31-ig: 0,50 USD / 1M bemeneti text token, 6 USD / 1M kimeneti audio token.",
 "gemini-3.8-flash-tts":"Fizetős standard 2026.12.31-ig: 0,50 USD / 1M bemeneti text token, 9 USD / 1M kimeneti audio token."
};
const defaultModels={
 stt:[{id:"gemini-3.5-transcribe",name:"Gemini 3.5 Transcribe"}],
 tts:[{id:"gemini-3.8-flash-lite-tts",name:"Gemini 3.8 Flash-Lite TTS"},{id:"gemini-3.8-flash-tts",name:"Gemini 3.8 Flash TTS"}]
};
const curatedVoices="Zephyr,Puck,Charon,Kore,Fenrir,Leda,Orus,Aoede,Callirrhoe,Autonoe,Enceladus,Iapetus,Umbriel,Algieba,Despina,Erinome,Algenib,Rasalgethi,Laomedeia,Achernar,Alnilam,Schedar,Gacrux,Pulcherrima,Achird,Zubenelgenubi,Vindemiatrix,Sadachbia,Sadaltager,Sulafat".split(",");
const defaults={
 sttModel:"gemini-3.5-transcribe",ttsModel:"gemini-3.8-flash-lite-tts",
 voice:"Kore",style:"Nyugodt, természetes magyar beszéd, közepes tempó.",
 sendMode:"auto",silenceMs:1200,vadThreshold:0.62,soundCues:true,
 maxMinutes:30,maxChars:20000,vocabulary:"Claude\nGemini\nQuetta"
};
const keys=["apiKey",...Object.keys(defaults)];
const el=id=>document.getElementById(id);
let liveModels=false,liveVoices=false;
function showPrice(){
 for(const [kind,id] of [["stt","sttModel"],["tts","ttsModel"]]){
   const chosen=el(id).value;
   el(kind+"Price").textContent=prices[chosen]||"Ehhez a modellhez nincs ellenőrzött ár. Lásd a Google hivatalos díjszabását.";
 }
}
function options(id,items,current){
 const element=el(id);element.replaceChildren();
 if(current&&!items.some(x=>x.id===current))items=[{id:current,name:current+" (korábbi beállítás, nem igazolt)"},...items];
 const seen=new Set();
 for(const item of items){
   if(!item.id||seen.has(item.id))continue;
   seen.add(item.id);
   const opt=document.createElement("option");
   opt.value=item.id;
   const pricing=id==="voice"?"":prices[item.id]?" · "+prices[item.id]:" · ár nem ellenőrzött";
   opt.textContent=item.name+pricing;
   element.add(opt);
 }
 if(current)element.value=current;
 if(!element.value&&element.options.length)element.selectedIndex=0;
}
async function rpc(type){
 return new Promise((resolve,reject)=>chrome.runtime.sendMessage({type},response=>{
   if(chrome.runtime.lastError)return reject(new Error(chrome.runtime.lastError.message));
   if(!response?.ok)return reject(new Error(response?.error||"Nem sikerült kapcsolódni a szolgáltatáshoz."));
   resolve(response);
 }));
}
async function catalog(){
 const status=el("catalogStatus");
 status.textContent="A Google hivatalos modell- és hanglistájának lekérése…";
 try{
   const response=await rpc("GET_CATALOG");
   const stt=response.models?.stt||[],tts=response.models?.tts||[];
   const voices=response.voices||[];
   const current={stt:el("sttModel").value,tts:el("ttsModel").value,voice:el("voice").value};
   if(stt.length){options("sttModel",stt,current.stt);liveModels=true;}
   if(tts.length){options("ttsModel",tts,current.tts);liveModels=true;}
   if(voices.length){options("voice",voices,current.voice);liveVoices=true;}
   status.textContent="Google API: "+stt.length+" STT, "+tts.length+" TTS modell és "+voices.length+" hang. "+
     (response.voicesError?"Hanglista figyelmeztetés: "+response.voicesError:"");
   if(!stt.length||!tts.length)status.textContent+=" Az API nem adott minden kategóriában kompatibilis modellt; a legutóbb ismert lista látható.";
   if(!voices.length)status.textContent+=" A 30 Google által dokumentált alap-hang látható.";
 }catch(error){status.textContent="Az élő katalógus most nem érhető el: "+error.message+" A Google dokumentált alaplistája látható.";}
 showPrice();
}
async function init(){
 const data=await chrome.storage.local.get(keys);
 options("sttModel",defaultModels.stt,data.sttModel||defaults.sttModel);
 options("ttsModel",defaultModels.tts,data.ttsModel||defaults.ttsModel);
 options("voice",curatedVoices.map(id=>({id,name:id})),data.voice||defaults.voice);
 for(const key of keys){
  const node=el(key);
  if(!node)continue;
  const value=data[key]??defaults[key]??"";
  if(node.type==="checkbox")node.checked=value!==false;
  else node.value=String(value);
 }
 showPrice();showSliders();
 void catalog();
}
function showSliders(){
 el("vadValue").textContent=Number(el("vadThreshold").value).toFixed(2).replace(".",",");
 el("silenceValue").textContent=el("silenceMs").value+" ms";
}
for(const id of ["vadThreshold","silenceMs"])el(id).addEventListener("input",showSliders);
el("sttModel").addEventListener("change",showPrice);
el("ttsModel").addEventListener("change",showPrice);
el("reloadCatalog").addEventListener("click",()=>{void catalog();});
document.getElementById("settings").addEventListener("submit",async event=>{
 event.preventDefault();
 const data={};
 for(const key of keys){
  const node=el(key);
  data[key]=node.type==="checkbox"?node.checked:node.value;
 }
 data.maxMinutes=Math.max(1,Number(data.maxMinutes)||30);
 data.maxChars=Math.max(100,Number(data.maxChars)||20000);
 data.silenceMs=Math.min(2500,Math.max(700,Number(data.silenceMs)||1200));
 data.vadThreshold=Math.min(0.9,Math.max(0.4,Number(data.vadThreshold)||0.62));
 data.apiKey=data.apiKey.trim();
 await chrome.storage.local.set(data);
 el("status").textContent="Beállítások mentve. A nyitott Claude-lapot frissítsd az új modellek használatához.";
});
el("checkMicrophone").addEventListener("click",async()=>{
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  stream.getTracks().forEach(t=>t.stop());
  el("status").textContent="Mikrofon működik. A claude.ai lap külön engedélyt kérhet.";
 }catch(error){el("status").textContent="Mikrofonhiba: "+error.message;}
});
init().catch(error=>el("status").textContent=error.message);
