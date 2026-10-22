"use strict";
const defaults={sttModel:"gemini-3.5-transcribe",ttsModel:"gemini-3.8-flash-lite-tts",voice:"Kore",style:"Nyugodt, természetes magyar beszéd, közepes tempó.",sendMode:"auto",maxMinutes:30,maxChars:20000,vocabulary:"Claude\nGemini\nQuetta"};
const keys=["apiKey",...Object.keys(defaults)];
async function init(){const obj=await chrome.storage.local.get(keys);keys.forEach(k=>document.getElementById(k).value=obj[k]??defaults[k]??"");}
document.getElementById("settings").addEventListener("submit",async e=>{
e.preventDefault();const obj=Object.fromEntries(keys.map(k=>[k,document.getElementById(k).value]));
obj.maxMinutes=Math.max(1,Number(obj.maxMinutes)||30);obj.maxChars=Math.max(100,Number(obj.maxChars)||20000);obj.apiKey=obj.apiKey.trim();
await chrome.storage.local.set(obj);document.getElementById("status").textContent="Elmentve.";
});
document.getElementById("checkMicrophone").addEventListener("click",async()=>{
try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});stream.getTracks().forEach(t=>t.stop());document.getElementById("status").textContent="A mikrofon működik az options oldalon. A claude.ai lap külön engedélyt kérhet.";}
catch(error){document.getElementById("status").textContent="Mikrofonhiba: "+error.message;}
});init().catch(error=>document.getElementById("status").textContent=error.message);