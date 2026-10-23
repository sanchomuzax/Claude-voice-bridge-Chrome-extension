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

test("TTS drops Claude screen-reader label from reply text",()=>{
 assert.equal(cleanForSpeech("Claude responded\nSzia, itt vagyok."),"Szia, itt vagyok.");
 assert.equal(cleanForSpeech("Claude response: Rendben."),"Rendben.");
});
test("TTS avoids doubling the leading sentence only",()=>{
 assert.equal(cleanForSpeech("Ez egy bemutatkozó mondat. Ez egy bemutatkozó mondat. Folytatás."),
   "Ez egy bemutatkozó mondat. Folytatás.");
 assert.equal(cleanForSpeech("Ez az első mondat. Második mondat."),"Ez az első mondat. Második mondat.");
});
test("v0.3 UI, model lists and audio cues are wired",()=>{
 const root=require("node:path").join(__dirname,"..");
 const content=require("node:fs").readFileSync(root+"/content.js","utf8");
 const background=require("node:fs").readFileSync(root+"/background.js","utf8");
 const panel=require("node:fs").readFileSync(root+"/panel-ui.js","utf8");
 const options=require("node:fs").readFileSync(root+"/options.js","utf8");
 const manifest=JSON.parse(require("node:fs").readFileSync(root+"/manifest.json","utf8"));
 assert.ok(manifest.content_scripts[0].js.includes("panel-ui.js"));
 assert.equal(manifest.version,"0.5.0");
 assert.match(content,/wrapper\.dataset\.collapsed/);
 assert.match(content,/playCue\("process"\)/);
 assert.match(content,/playCue\("listen"\)/);
 assert.match(content,/function rendered\(node\)/);
 assert.match(content,/\.sr-only/);
 assert.match(background,/GET_CATALOG/);
 assert.match(background,/UPDATE_UI_SETTINGS/);
 assert.match(options,/ai\.google\.dev\/gemini-api\/docs\/pricing|prices=/);
 assert.match(panel,/Zajküszöb/);
});

test("collapsed handle sits below Claude toolbar on Quetta",()=>{
 const root=require("node:path").join(__dirname,"..");
 const content=require("node:fs").readFileSync(root+"/content.js","utf8");
 const fn=content.slice(content.indexOf("function applyCollapsed(value)"),content.indexOf("function showSliderValues()"));
 assert.match(fn,/wrapper\.style\.top=value/);
 assert.match(fn,/\+ 76px/);
 assert.match(fn,/\+ 8px/);
 assert.match(fn,/aria-expanded/);
});

test("TTS preview has stop gesture, pressed state and local playback",()=>{
 const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,"..");
 const opts=fs.readFileSync(path.join(root,"options.js"),"utf8");
 const html=fs.readFileSync(path.join(root,"options.html"),"utf8");
 assert.match(html,/id="previewTts"/);
 assert.match(opts,/PREVIEW_TTS/);
 assert.match(opts,/aria-pressed/);
 assert.match(opts,/previewAudio\.pause/);
 assert.match(opts,/previewEpoch\+\+/);
 assert.match(opts,/határozott tempó/);
});


test("tool cards and approval prompts are not narrated as Claude answers",()=>{
 const {isToolStatus}=require("../shared.js");
 for(const text of [
  "Need your input",
  "Need your input\nAllow Google Calendar",
  "Used Google Calendar: Creates a calendar",
  "Running tool",
  "Claude responded"
 ])assert.equal(isToolStatus(text),true,text);
 for(const text of [
  "Beírtam a naptáradba ma reggel fél nyolcra.",
  "Rendben, hozzáadtam az eseményt.",
  "A következő naptáreseményed holnap van."
 ])assert.equal(isToolStatus(text),false,text);
});
test("mobile injection releases keyboard and sends only after insertion",()=>{
 const content=fs.readFileSync(path.join(__dirname,"..","content.js"),"utf8");
 assert.match(content,/function dismissMobileKeyboard\(\)/);
 assert.match(content,/node\.setAttribute\("inputmode","none"\)/);
 assert.match(content,/node\.removeAttribute\("inputmode"\)/);
 assert.match(content,/dismissMobileKeyboard\(\);\s*button\.click\(\);\s*dismissMobileKeyboard\(\)/);
 assert.match(content,/node\.focus\(\{preventScroll:true\}\)/);
});
test("gentle audible cues survive mobile autoplay restriction",()=>{
 const content=fs.readFileSync(path.join(__dirname,"..","content.js"),"utf8");
 const panel=fs.readFileSync(path.join(__dirname,"..","panel-ui.js"),"utf8");
 assert.match(content,/function wavCue\(type\)/);
 assert.match(content,/cuePlayer\.play\(\)/);
 assert.match(content,/webAudioCue\(type\)/);
 assert.match(content,/playCue\("listen"\)/);
 assert.match(content,/playCue\("process"\)/);
 assert.match(content,/cueTest/);
 assert.match(panel,/Jelzések próbája/);
});
test("tool response watcher waits for real Markdown, not intermediate labels",()=>{
 const content=fs.readFileSync(path.join(__dirname,"..","content.js"),"utf8");
 assert.match(content,/if\(!roots\.length\)return ""/);
 assert.match(content,/CVB\.isToolStatus/);
 assert.match(content,/pendingToolApproval\(\)/);
 assert.match(content,/now-changedAt>=2600/);
});
