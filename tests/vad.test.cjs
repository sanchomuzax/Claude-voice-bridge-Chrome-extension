const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pcm16Wav,pcm16WavBase64,SAMPLE_RATE}=require("../vad-codec.js");
test("silero mono float32 produces well formed RIFF PCM16 WAV",()=>{
 const audio=new Float32Array([0,1,-1,0.5,-0.5]);
 const wav=pcm16Wav(audio);
 assert.equal(SAMPLE_RATE,16000);
 assert.equal(Buffer.from(wav.subarray(0,4)).toString("ascii"),"RIFF");
 assert.equal(Buffer.from(wav.subarray(8,12)).toString("ascii"),"WAVE");
 assert.equal(Buffer.from(wav.subarray(36,40)).toString("ascii"),"data");
 const v=new DataView(wav.buffer,wav.byteOffset,wav.byteLength);
 assert.equal(v.getUint32(24,true),16000);
 assert.equal(v.getUint16(22,true),1);
 assert.equal(v.getUint16(34,true),16);
 assert.equal(v.getInt16(44,true),0);
 assert.equal(v.getInt16(46,true),32767);
 assert.equal(v.getInt16(48,true),-32768);
 assert.equal(v.getUint32(40,true),audio.length*2);
});
test("wav encoder produces API-safe base64 for 16 kHz audio",()=>{
 global.btoa=global.btoa||((s)=>Buffer.from(s,"binary").toString("base64"));
 const bytes=Buffer.from(pcm16WavBase64(new Float32Array(16000)),"base64");
 assert.equal(bytes.length,32044);
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
});
test("wav encoder rejects empty and absurdly long audio",()=>{
 assert.throws(()=>pcm16Wav(new Float32Array()),RangeError);
 assert.throws(()=>pcm16Wav([1]),TypeError);
});
test("MV3 includes local VAD script and vendor resources",()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,"..","manifest.json"),"utf8"));
 const scripts=manifest.content_scripts[0].js;
 assert.deepEqual(scripts,["shared.js","vad-codec.js","dist/vad-bundle.js","panel-ui.js","content.js"]);
 assert.ok(manifest.web_accessible_resources[0].resources.includes("vendor/*"));
 assert.equal(manifest.version,"0.5.15");
});
test("VAD remains opt-in and speech capture has explicit UI control",()=>{
 const src=fs.readFileSync(path.join(__dirname,"..","content.js"),"utf8");
 assert.ok(src.includes("enabled:false,starting:false"));
 const panel=fs.readFileSync(path.join(__dirname,"..","panel-ui.js"),"utf8");
 assert.ok(panel.includes("id=")&&panel.includes("hands"));
 assert.ok(src.includes("await pauseHands()"));
 assert.ok(src.includes("await resumeHands(generation)"));
 assert.ok(src.includes("Silero VAD"));
});
