import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Pattern-based safety gate. Does not prove the absence of every possible
// secret. Checks tracked text and full historical textual diffs (not ZIP blobs).
const patterns=[
  ["Google API key",/\bAIza[0-9A-Za-z_-]{30,}\b/g],
  ["GitHub classic PAT",/\bgh[pousr]_[0-9A-Za-z]{20,}\b/g],
  ["GitHub fine-grained PAT",/\bgithub_pat_[0-9A-Za-z_]{30,}\b/g],
  ["OpenAI key",/\bsk-(?:proj-)?[0-9A-Za-z_-]{30,}\b/g],
  ["Private key block",/-----BEGIN (?:RSA|EC|OPENSSH|DSA|PGP|PRIVATE) PRIVATE KEY-----/g],
  ["AWS access key",/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g]
];
const ignored=new Set(["node_modules",".git","vendor","dist"]);
let files=0,findings=0;
function scan(text,where){
 for(const [name,rx] of patterns){
  rx.lastIndex=0;
  if(rx.test(text)){process.stderr.write("Potential secret ("+name+"): "+where+"\n");findings++;}
 }
}
function walk(dir){
 for(const name of readdirSync(dir)){
  if(ignored.has(name)||name.endsWith(".zip")||name.endsWith(".wasm")||name.endsWith(".onnx")||name.endsWith(".webp")||name.endsWith(".jpg"))continue;
  const path=join(dir,name),st=statSync(path);
  if(st.isDirectory())walk(path);
  else if(st.size<1_000_000){
   files++;scan(readFileSync(path,"utf8"),path);
  }
 }
}
walk(".");
try{
 const patch=execFileSync("git",["log","--all","-p","--","." ,":!*.zip",":!vendor/**",":!dist/**"],{encoding:"utf8",maxBuffer:40_000_000});
 scan(patch,"complete Git history (textual changes)");
}catch(err){
 // Standalone ZIP source trees lack .git metadata. On GitHub Actions the
 // history is required, so this is fatal under CI.
 if(process.env.CI)throw err;
 console.warn("Git history not available in this directory.");
}
console.log("Secret pattern audit:",files,"text files,",findings,"findings.");
if(findings)process.exitCode=1;
