const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const panel=JSON.parse(read("panel-ui.js").match(/globalThis\.CVBPanel = ("[\s\S]*");\s*$/)[1]);

test("toolbar popup has its OWN responsive 360px layout, not the options page stylesheet",()=>{
 const html=read("popup.html"),css=read("popup.css");
 assert.match(html,/href="popup\.css"/);
 assert.doesNotMatch(html,/href="ui\.css"/);
 assert.match(html,/id="open"/);
 assert.match(html,/id="usage"/);
 assert.match(css,/width:360px/);
 assert.match(css,/min-width:340px/);
 assert.match(css,/@media\(max-width:359px\)/);
 assert.match(read("scripts/pack.mjs"),/"popup\.css"/);
});

test("HUD and extension popup show a matching conventional settings gear",()=>{
 const popup=read("popup.html");
 const hud=panel.slice(panel.indexOf('id="settings"'));
 const headerIcon=hud.match(/<svg[\s\S]*?<\/svg>/);
 const popupIcon=popup.slice(popup.indexOf('id="open"')).match(/<svg[\s\S]*?<\/svg>/);
 assert.ok(headerIcon&&popupIcon);
 const gearPath=headerIcon[0].match(/<path d="([^"]+)"/)?.[1];
 assert.ok(gearPath);
 assert.match(gearPath,/Z$/);
 assert.ok(gearPath.split(" L").length>=24);
 assert.ok(popupIcon[0].includes(gearPath));
 assert.match(headerIcon[0],/<circle cx="12" cy="12" r="3\.05"/);
});

test("HUD help repeats EACH of the exact button icons",()=>{
 const start=panel.indexOf('<section id="helpPanel"'),end=panel.indexOf('</section>',start);
 assert.ok(start>0&&end>start);
 const help=panel.slice(start,end);
 const idFor={
   "Felvétel":"record","Automata":"hands","Közbevág":"barge",
   "Küldés":"send","Leállítás":"stop","Ismétlés":"repeat",
   "Beállítás":"settings","Hangpróba":"cueTest"
 };
 for(const [label,id] of Object.entries(idFor)){
  const buttonStart=panel.indexOf('id="'+id+'"');
  const buttonSvgStart=panel.indexOf("<svg",buttonStart);
  const buttonSvgEnd=panel.indexOf("</svg>",buttonSvgStart)+6;
  assert.ok(buttonStart>=0&&buttonSvgStart>=0&&buttonSvgEnd>0,id+" button");
  const buttonSvg=panel.slice(buttonSvgStart,buttonSvgEnd);
  const path=buttonSvg.match(/<path d="([^"]+)"/)?.[1];
  const entryStart=help.indexOf('<span>'+label+'</span>');
  assert.ok(entryStart>=0,label+" help label");
  const iconStart=help.lastIndexOf('<svg',entryStart);
  const iconEnd=help.indexOf('</svg>',iconStart)+6;
  assert.ok(iconStart>=0&&iconEnd>iconStart,label+" icon");
  const helpSvg=help.slice(iconStart,iconEnd);
  if(path)assert.ok(helpSvg.includes(path),label+" icon differs from real button");
 }
 assert.match(panel,/#helpPanel \.help-icon/);
});

test("README links fresh cache-busted HUD and popup screenshots from real source",()=>{
 const readme=read("README.md");
 const workflow=read(".github/workflows/test.yml");
 assert.match(readme,/docs\/images\/hud-v055-preview\.png/);
 assert.match(readme,/docs\/images\/popup-v059-preview\.png/);
 assert.doesNotMatch(readme,/hud-v053-preview\.png/);
 assert.match(workflow,/node scripts\/render-hud-preview\.mjs/);
 assert.match(workflow,/node scripts\/render-popup-preview\.mjs/);
 assert.match(workflow,/git add -f docs\/images\/hud-v055-preview\.png docs\/images\/popup-v059-preview\.png/);
 assert.match(read("scripts/render-popup-preview.mjs"),/readFileSync\("popup\.html"/);
 assert.match(read("scripts/render-hud-preview.mjs"),/readFileSync\("panel-ui\.js"/);
});
