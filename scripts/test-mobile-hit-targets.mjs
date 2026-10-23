// Browser-level hit test against the actual extension Shadow DOM.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
const body=readFileSync("content.js","utf8");
const match=body.match(/wrapper\.style\.cssText="([^"]+)"/);
if(!match)throw Error("HUD host inline CSS not found");
const source=readFileSync("panel-ui.js","utf8");
const ui=source.match(/globalThis\.CVBPanel = ("[\s\S]*");\s*$/);
if(!ui)throw Error("HUD template not found");
const panel=JSON.parse(ui[1]);
mkdirSync("dist",{recursive:true});
const fixture='<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">'+
'<style>html,body{margin:0;width:100%;height:100%;font:16px system-ui}'+
'button.background{position:fixed;background:#85ca86;border:0;min-width:35px;min-height:35px;z-index:0}'+
'#claude-menu{top:110px;left:5px}#claude-chat{top:51%;left:5px}'+
'#claude-reply{bottom:30px;left:calc(50% - 40px);width:80px}'+
'#claude-other{top:28%;left:calc(50% - 40px);width:80px}</style></head><body>'+
'<button class="background" id="claude-menu">Menü</button>'+
'<button class="background" id="claude-chat">Chat</button>'+
'<button class="background" id="claude-reply">Válasz</button>'+
'<button class="background" id="claude-other">Más</button><script>'+
'const wrapper=document.createElement("div");wrapper.id="claude-voice-bridge";'+
'wrapper.style.cssText='+JSON.stringify(match[1])+';'+
'const root=wrapper.attachShadow({mode:"open"});root.innerHTML='+JSON.stringify(panel)+';'+
'document.body.appendChild(wrapper);'+
'function topElementAt(id){const el=document.getElementById(id),r=el.getBoundingClientRect();'+
'return document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.id||"";}'+
'const results={};results.expandedMenu=topElementAt("claude-menu");'+
'results.expandedChat=topElementAt("claude-chat");'+
'wrapper.dataset.collapsed="true";'+
'for(const animation of root.getElementById("drawer").getAnimations())animation.finish();'+
'results.collapsedMenu=topElementAt("claude-menu");'+
'results.collapsedChat=topElementAt("claude-chat");'+
'results.collapsedReply=topElementAt("claude-reply");'+
'results.collapsedOther=topElementAt("claude-other");'+
'const toggle=root.getElementById("toggle"),rect=toggle.getBoundingClientRect();'+
'results.toggleVisible=rect.width>10&&rect.height>10&&rect.right>0&&rect.left<innerWidth;'+
'results.toggleHitHost=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2)===wrapper;'+
'const pre=document.createElement("pre");pre.id="results";pre.textContent=JSON.stringify(results);'+
'document.body.appendChild(pre);</script></body></html>';
const file=resolve("dist/mobile-hit-targets.html");
writeFileSync(file,fixture);
const candidates=[process.env.CHROME_BIN,"google-chrome","google-chrome-stable","chromium","chromium-browser"].filter(Boolean);
let chrome=null;
for(const binary of candidates){
 const found=spawnSync("which",[binary],{encoding:"utf8"});
 if(found.status===0){chrome=found.stdout.trim();break;}
}
if(!chrome)throw Error("Chrome/Chromium not found");
const run=spawnSync(chrome,[
 "--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
 "--window-size=430,900","--force-device-scale-factor=1","--dump-dom",
 pathToFileURL(file).href
],{encoding:"utf8",timeout:45000,maxBuffer:1024*1024});
if(run.status!==0)throw Error("Chrome hit test failed: "+run.stderr?.slice(-2000));
const result=run.stdout.match(/<pre id="results"[^>]*>(\{[^<]+\})<\/pre>/);
if(!result)throw Error("No hit-test result from Chrome: "+run.stdout.slice(-1200));
const actual=JSON.parse(result[1].replaceAll("&quot;",'"'));
for(const id of ["Menu","Chat","Reply","Other"]){
 if(actual["collapsed"+id]!=="claude-"+id.toLowerCase())throw Error("Collapsed HUD blocks "+id+": "+JSON.stringify(actual));
}
for(const id of ["Menu","Chat"]){
 if(actual["expanded"+id]!=="claude-"+id.toLowerCase())throw Error("Open HUD blocks background "+id+": "+JSON.stringify(actual));
}
if(!actual.toggleVisible||!actual.toggleHitHost)throw Error("Collapsed toggle inaccessible: "+JSON.stringify(actual));
console.log("Mobile touch pass-through OK: "+JSON.stringify(actual));
