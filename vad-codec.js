/* Silero returns Float32 mono PCM sampled at 16 kHz.
 * Convert to WAV PCM16 for the existing Gemini Files API.
 * All transformations are local; the microphone never leaves the device except via TRANSCRIBE.
 */
(function(scope){
"use strict";
const SAMPLE_RATE=16000;
function pcm16Wav(samples,sampleRate=SAMPLE_RATE){
  if(!(samples instanceof Float32Array))throw new TypeError("Expected Float32Array PCM");
  if(samples.length<1||samples.length>sampleRate*122)throw new RangeError("Invalid audio length");
  const result=new Uint8Array(44+samples.length*2);
  const view=new DataView(result.buffer);
  const ascii=(start,str)=>{for(let i=0;i<str.length;i++)result[start+i]=str.charCodeAt(i);};
  ascii(0,"RIFF");view.setUint32(4,result.length-8,true);
  ascii(8,"WAVE");ascii(12,"fmt ");view.setUint32(16,16,true);
  view.setUint16(20,1,true);view.setUint16(22,1,true);
  view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);
  view.setUint16(32,2,true);view.setUint16(34,16,true);
  ascii(36,"data");view.setUint32(40,samples.length*2,true);
  for(let i=0;i<samples.length;i++){
    const value=Math.max(-1,Math.min(1,samples[i]||0));
    view.setInt16(44+i*2,value<0?Math.round(value*32768):Math.round(value*32767),true);
  }
  return result;
}
function pcm16WavBase64(samples){
  const bytes=pcm16Wav(samples);
  const chunk=32768;let binary="";
  for(let i=0;i<bytes.length;i+=chunk){
    binary+=String.fromCharCode.apply(null,bytes.subarray(i,i+chunk));
  }
  return btoa(binary);
}
const api={SAMPLE_RATE,pcm16Wav,pcm16WavBase64};
if(typeof module!=="undefined"&&module.exports)module.exports=api;
else scope.CVBWav=api;
})(typeof globalThis==="object"?globalThis:this);
