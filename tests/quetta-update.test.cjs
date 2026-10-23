const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../popup.html"),"utf8");
const js=fs.readFileSync(path.join(__dirname,"../popup.js"),"utf8");
test("Quetta ZIP action is present and hidden until an update is available",()=>{
 assert.match(html,/id="zipDownload"[^>]+hidden/);
 assert.match(js,/zip.hidden=!android\|\|!state.available/);
 assert.match(js,/releases\/download\/v/);
 assert.match(js,/test\(state.latestVersion\)/);
 assert.match(js,/Quetta.*importáld/);
});
