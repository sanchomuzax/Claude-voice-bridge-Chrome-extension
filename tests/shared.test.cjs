const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {speechCommand,normalizeCommand,cleanForSpeech,splitForTts}=require("../shared.js");
test("magyar parancsok írásjel nélkül",()=>{
 assert.equal(speechCommand("  KÜLDD!  "),"send");
 assert.equal(speechCommand("ÁLLJ."),"stop");
 assert.equal(speechCommand("mondj el egy mesét"),null);
 assert.equal(normalizeCommand("  IsMéTeLd... "),"ismételd");
});
test("szövegtisztítás nem tesz hozzá új jelentést",()=>{
 const cleaned=cleanForSpeech("## Cím\n- **Próba** [link](https://example.org)\n\n"+String.fromCharCode(96).repeat(3)+"js\nconsole.log(1)\n"+String.fromCharCode(96).repeat(3));
 assert.ok(cleaned.includes("Cím"));
 assert.ok(cleaned.includes("Próba link"));
 assert.ok(cleaned.includes("Kódrészlet kihagyva."));
 assert.ok(!cleaned.includes("https://"));
 assert.ok(!cleaned.includes("console.log"));
});
test("TTS darabolás maximális hossz alatt",()=>{
 const input="Egy magyar mondat. ".repeat(180);
 const items=splitForTts(input,110);
 assert.ok(items.length>=5);
 assert.ok(items.every(x=>x.length>0&&x.length<=110));
 assert.deepEqual(splitForTts(""),[]);
});
test("MV3 manifest érvényes és engedélyei célzottak",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"..","manifest.json"),"utf8"));
 assert.equal(manifest.manifest_version,3);
 assert.equal(manifest.background.service_worker,"background.js");
 assert.deepEqual(manifest.content_scripts[0].matches,["https://claude.ai/*"]);
 assert.ok(!manifest.permissions.includes("<all_urls>"));
});
