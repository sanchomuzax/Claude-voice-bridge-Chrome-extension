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
 $("autoInstall").checked=state.autoInstall;
 actions.hidden=!state.available;
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
$("installUpdate").addEventListener("click",async()=>{
 const btn=$("installUpdate");btn.disabled=true;
 $("updateInfo").textContent="Frissítés letöltése és ellenőrzése a Windows segédprogrammal…";
 try{
   const result=await call("INSTALL_UPDATE");
   $("updateInfo").textContent="Telepítve: "+result.version+". A bővítmény újratöltődik; a claude.ai lapját külön frissítsd.";
 }catch(error){statusError(error);}
 finally{btn.disabled=false;}
});
$("autoInstall").addEventListener("change",async()=>{
 const box=$("autoInstall");box.disabled=true;
 try{await showUpdate((await call("SET_AUTO_INSTALL",{enabled:box.checked})).update);}
 catch(error){box.checked=!box.checked;statusError(error);}
 finally{box.disabled=false;}
});
call("GET_STATUS").then(response=>{
 $("usage").textContent="Mai felhasználás: "+response.usage.minutes.toFixed(1)+" STT-perc, "+response.usage.chars+" TTS-karakter.";
}).catch(()=>$("usage").textContent="A háttérszolgáltatás nem érhető el.");
void loadUpdates();
