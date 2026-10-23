"use strict";
const $=id=>document.getElementById(id);
$("open").addEventListener("click",()=>chrome.runtime.openOptionsPage());
function call(type,extra={}){
 return new Promise((resolve,reject)=>{
   chrome.runtime.sendMessage({type,...extra},reply=>{
     if(chrome.runtime.lastError)return reject(new Error(chrome.runtime.lastError.message));
     if(!reply?.ok)return reject(new Error(reply?.error||"A Bridge háttérfolyamata nem érhető el."));
     resolve(reply);
   });
 });
}
async function showUpdate(state){
 const info=$("updateInfo"),actions=$("updateActions");
 actions.hidden=!state.available;
 const android=/Android/i.test(navigator.userAgent);
 const zip=$("zipDownload"),hint=$("installHint");
 zip.hidden=!android||!state.available;
 hint.textContent=android
   ?"Quetta (Android): töltsd le a kiadás ZIP-jét, majd importáld a Quetta bővítménykezelőjében. A meglévő beállítások megőrzése nem garantált."
   :"Windows Edge/Chrome: a bővítmény helyi mappájában indítsd az update.bat fájlt, majd töltsd újra a bővítményt.";
 if(android&&state.available&&/^\\d+\\.\\d+\\.\\d+$/.test(state.latestVersion)){
   zip.href="https://github.com/sanchomuzax/Claude-voice-bridge-Chrome-extension/releases/download/v"+state.latestVersion+"/Claude-Voice-Bridge-v"+state.latestVersion+".zip";
 }
 $("releaseLink").href=state.releaseUrl;
 const checked=state.checkedAt?new Date(state.checkedAt).toLocaleString("hu-HU"):"még nem volt ellenőrizve";
 info.textContent=state.available
   ?"Telepítve: "+state.localVersion+" • új verzió: "+state.latestVersion
   :"Telepítve: "+state.localVersion+" • nincs ismert újabb kiadás";
 if(state.error)info.textContent+=". Ellenőrzési hiba: "+state.error;
 else info.textContent+=". Utolsó ellenőrzés: "+checked;
}
function statusError(error){$("updateInfo").textContent="Frissítési hiba: "+String(error?.message||error);}
async function loadUpdates(){
 try{await showUpdate((await call("GET_UPDATE_STATUS")).update);}
 catch(error){statusError(error);}
}
$("checkUpdate").addEventListener("click",async()=>{
 const btn=$("checkUpdate");btn.disabled=true;
 $("updateInfo").textContent="GitHub Releases ellenőrzése…";
 try{await showUpdate((await call("CHECK_UPDATE")).update);}
 catch(error){statusError(error);}
 finally{btn.disabled=false;}
});
call("GET_STATUS").then(response=>{
 $("usage").textContent="Mai felhasználás: "+response.usage.minutes.toFixed(1)+" STT-perc, "+response.usage.chars+" TTS-karakter.";
}).catch(()=>$("usage").textContent="A háttérszolgáltatás nem érhető el.");
void loadUpdates();
