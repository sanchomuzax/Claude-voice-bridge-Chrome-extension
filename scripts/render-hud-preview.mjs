// Render actual HUD Shadow DOM, synthetic content, no user conversation or keys.
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const source=readFileSync("panel-ui.js","utf8");
const match=source.match(/globalThis\.CVBPanel = ("[\s\S]*");\s*$/);
if(!match)throw new Error("Could not extract HUD");
const panel=JSON.parse(match[1]);
const target="docs/images/hud-v053-preview.png";
mkdirSync("docs/images",{recursive:true});
mkdirSync("dist",{recursive:true});
const page='<!doctype html><html lang="hu"><head><meta charset="utf-8">'+
'<meta name="viewport" content="width=device-width,initial-scale=1">'+
'<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#181818;color:#dedad5;font:14px system-ui,sans-serif;overflow:hidden}'+
'.topbar{height:58px;background:#252525;border-bottom:1px solid #383531;display:flex;align-items:center;padding:0 20px;gap:12px}'+
'.topbar .mark{width:22px;height:22px;border-radius:5px;background:#d97757}.topbar .name{font-weight:600}'+
'.line{background:#42403d;border-radius:6px;height:12px;margin:13px 0}.placeholder{margin:62px 32px;width:150px;opacity:.33}'+
'#hud{position:fixed;z-index:2;right:0;top:22px;font-family:system-ui,sans-serif}'+
'.footer{position:absolute;bottom:26px;left:12px;width:calc(100% - 24px);height:50px;border-radius:14px;background:#30302e}'+
'</style></head><body><header class="topbar"><span class="mark"></span><span class="name">Claude Voice Bridge</span></header>'+
'<main class="placeholder" aria-hidden="true"><div class="line" style="width:90%"></div><div class="line" style="width:70%"></div>'+
'<div class="line" style="width:80%"></div></main><div class="footer" aria-hidden="true"></div><div id="hud"></div>'+
'<script>const host=document.querySelector("#hud");const root=host.attachShadow({mode:"open"});root.innerHTML='+JSON.stringify(panel)+';'+
'root.getElementById("status").textContent="Beszélgetésre kész";'+
'root.getElementById("transcript").textContent="";'+
'root.getElementById("record").disabled=false;root.getElementById("hands").disabled=false;'+
'root.getElementById("barge").disabled=true;root.getElementById("send").disabled=true;'+
'root.getElementById("stop").disabled=true;root.getElementById("repeat").disabled=true;'+
'root.getElementById("helpPanel").hidden=true;</script></body></html>';
writeFileSync("dist/hud-preview.html",page);
const candidates=[process.env.CHROME_BIN,"google-chrome","google-chrome-stable","chromium","chromium-browser"].filter(Boolean);
let chrome=null;
for(const binary of candidates){
 const found=spawnSync("which",[binary],{encoding:"utf8"});
 if(found.status===0){chrome=found.stdout.trim();break;}
}
if(!chrome)throw new Error("Chrome/Chromium headless not found on runner");
const result=spawnSync(chrome,[
 "--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
 "--hide-scrollbars","--force-dark-mode","--force-device-scale-factor=1",
 "--window-size=460,940","--screenshot="+resolve(target),
 pathToFileURL(resolve("dist/hud-preview.html")).href
],{encoding:"utf8",timeout:45000});
if(result.status!==0)throw new Error("Chrome screenshot failed: "+result.stderr?.slice(-1500));
if(statSync(target).size<10000)throw new Error("Unexpectedly small HUD image");
console.log(target+": "+statSync(target).size+" bytes");
