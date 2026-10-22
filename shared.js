/* Deterministic speech helpers, unit-testable with Node.js. */
(function (scope) {
"use strict";
function normalizeCommand(text) {
  return String(text || "").toLocaleLowerCase("hu-HU").trim()
    .replace(/[.!?,;:„”"'’]/g,"").replace(/\s+/g," ");
}
function speechCommand(text) {
  return {"állj":"stop","elég":"stop","ismételd":"repeat","vége":"end",
    "küldd":"send","töröld":"clear","lassabban":"slower","gyorsabban":"faster"
  }[normalizeCommand(text)] || null;
}
function cleanForSpeech(raw) {
  let text=String(raw||"");
  // Do not read screen-reader chrome or a duplicated opening sentence.
  // These can occur when Claude's response shell is accidentally included
  // alongside the rendered Markdown in some versions of the web UI.
  text=text.replace(/^\s*Claude\s+(?:responded|response)\s*[:\-–]?\s*/i,"");
  text=text.replace(/^([^\n.!?]{12,220}[.!?])\s+\1(?=\s|$)/i,"$1");
  text=text.replace(/```[\s\S]*?```/g,"\nKódrészlet kihagyva.\n");
  text=text.replace(/\[([^\]]+)\]\(https?:\/\/[^)\s]+\)/g,"$1");
  text=text.replace(/https?:\/\/\S+/g,"");
  text=text.replace(/^\s{0,3}#{1,6}\s+/gm,"");
  text=text.replace(/^\s{0,3}>\s?/gm,"");
  text=text.replace(/^\s*[-*+]\s+/gm,"");
  text=text.replace(/^\s*\d+[.)]\s+/gm,"");
  text=text.replace(/\*\*|__|~~|\x60/g,"");
  text=text.replace(/\[\d+\]/g,"");
  text=text.replace(/\bpl\./gi,"például").replace(/\bkb\./gi,"körülbelül").replace(/\bstb\./gi,"és a többi");
  return text.replace(/[ \t]{2,}/g," ").replace(/\n{3,}/g,"\n\n").trim();
}
function splitForTts(raw,max=500) {
  const text=cleanForSpeech(raw);
  if(!text) return [];
  const result=[];
  for(const para of text.split(/\n+/).map(x=>x.trim()).filter(Boolean)){
    if(para.length<=max){result.push(para);continue;}
    let buffer="";
    for(let sentence of (para.match(/[^.!?]+[.!?]*\s*/g)||[para])){
      sentence=sentence.trim();
      if(!sentence)continue;
      if(sentence.length>max){
        if(buffer){result.push(buffer);buffer="";}
        for(let i=0;i<sentence.length;i+=max)result.push(sentence.slice(i,i+max));
      }else if((buffer+" "+sentence).trim().length>max){result.push(buffer);buffer=sentence;}
      else buffer=(buffer+" "+sentence).trim();
    }
    if(buffer)result.push(buffer);
  }
  return result.filter(Boolean);
}
const api=Object.freeze({normalizeCommand,speechCommand,cleanForSpeech,splitForTts});
if(typeof module!=="undefined"&&module.exports)module.exports=api;
else scope.CVB=api;
})(typeof globalThis==="object"?globalThis:this);
