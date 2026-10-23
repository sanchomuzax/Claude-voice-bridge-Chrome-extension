// Render the actual popup markup+CSS with sample usage. Never read user keys.
import {readFileSync,writeFileSync,mkdirSync,statSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
const target="docs/images/popup-v055-preview.png";
mkdirSync("dist",{recursive:true});mkdirSync("docs/images",{recursive:true});
let markup=readFileSync("popup.html","utf8");
markup=markup.replace('href="popup.css"','href="../popup.css"');
markup=markup.replace(/<script src="popup\.js"><\/script>/,"");
markup=markup.replace("Adatok lekérése…","0,7 STT-perc · 674 TTS-karakter (példa)");
writeFileSync("dist/popup-preview.html",markup);
const bins=[process.env.CHROME_BIN,"google-chrome","google-chrome-stable","chromium","chromium-browser"].filter(Boolean);
let chrome=null;
for(const name of bins){
 const found=spawnSync("which",[name],{encoding:"utf8"});
 if(found.status===0){chrome=found.stdout.trim();break;}
}
if(!chrome)throw Error("Chrome/Chromium headless not found");
const result=spawnSync(chrome,[
 "--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",
 "--hide-scrollbars","--force-dark-mode","--force-device-scale-factor=1",
 "--window-size=400,370","--screenshot="+resolve(target),
 pathToFileURL(resolve("dist/popup-preview.html")).href
],{encoding:"utf8",timeout:45000});
if(result.status!==0)throw Error("Screenshot failure: "+result.stderr?.slice(-1300));
if(statSync(target).size<5000)throw Error("Popup screenshot unexpectedly small");
console.log("Popup screenshot "+target+" "+statSync(target).size+" bytes");
