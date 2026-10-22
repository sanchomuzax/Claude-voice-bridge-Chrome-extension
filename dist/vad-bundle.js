(()=>{var zh=Object.create;var ac=Object.defineProperty;var Ch=Object.getOwnPropertyDescriptor;var Ah=Object.getOwnPropertyNames;var Oh=Object.getPrototypeOf,Rh=Object.prototype.hasOwnProperty;var ot=(P=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(P,{get:(N,U)=>(typeof require<"u"?require:N)[U]}):P)(function(P){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+P+'" is not supported')});var Je=(P,N)=>()=>(N||P((N={exports:{}}).exports,N),N.exports);var Bh=(P,N,U,H)=>{if(N&&typeof N=="object"||typeof N=="function")for(let K of Ah(N))!Rh.call(P,K)&&K!==U&&ac(P,K,{get:()=>N[K],enumerable:!(H=Ch(N,K))||H.enumerable});return P};var Mh=(P,N,U)=>(U=P!=null?zh(Oh(P)):{},Bh(N||!P||!P.__esModule?ac(U,"default",{value:P,enumerable:!0}):U,P));var ln=Je(Aa=>{"use strict";Object.defineProperty(Aa,"__esModule",{value:!0});Aa.baseAssetPath=void 0;var Dh=typeof window<"u"&&typeof window.document<"u",sc=Dh?window.document.currentScript:null,nc="/";sc&&(nc=sc.src.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^/]+$/,"/"));Aa.baseAssetPath=nc});var Ra=Je(Oa=>{"use strict";Object.defineProperty(Oa,"__esModule",{value:!0});Oa.defaultModelFetcher=void 0;var Ph=P=>fetch(P).then(N=>N.arrayBuffer());Oa.defaultModelFetcher=Ph});var ii=Je(Ba=>{"use strict";Object.defineProperty(Ba,"__esModule",{value:!0});Ba.log=void 0;var dn=P=>N=>{console.log(`VAD | ${P} >`,N)};Ba.log={error:dn("error"),debug:dn("debug"),warn:dn("warn")}});var oa=Je(Ma=>{"use strict";Object.defineProperty(Ma,"__esModule",{value:!0});Ma.Message=void 0;var oc;(function(P){P.AudioFrame="AUDIO_FRAME",P.SpeechStart="SPEECH_START",P.VADMisfire="VAD_MISFIRE",P.SpeechEnd="SPEECH_END",P.SpeechStop="SPEECH_STOP",P.SpeechRealStart="SPEECH_REAL_START",P.FrameProcessed="FRAME_PROCESSED"})(oc||(Ma.Message=oc={}))});var Da=Je(Yt=>{"use strict";Object.defineProperty(Yt,"__esModule",{value:!0});Yt.FrameProcessor=Yt.validateOptions=Yt.defaultFrameProcessorOptions=void 0;var ua=ii(),Mr=oa();Yt.defaultFrameProcessorOptions={positiveSpeechThreshold:.3,negativeSpeechThreshold:.25,preSpeechPadMs:800,redemptionMs:1400,minSpeechMs:400,submitUserSpeechOnPause:!1};function Uh(P){(P.positiveSpeechThreshold<0||P.positiveSpeechThreshold>1)&&ua.log.error("positiveSpeechThreshold should be a number between 0 and 1"),(P.negativeSpeechThreshold<0||P.negativeSpeechThreshold>P.positiveSpeechThreshold)&&ua.log.error("negativeSpeechThreshold should be between 0 and positiveSpeechThreshold"),P.preSpeechPadMs<0&&ua.log.error("preSpeechPadMs should be positive"),P.redemptionMs<0&&ua.log.error("redemptionMs should be positive"),P.minSpeechMs<0&&ua.log.error("minSpeechMs should be positive")}Yt.validateOptions=Uh;var uc=P=>{let N=P.reduce((H,K)=>(H.push(H.at(-1)+K.length),H),[0]),U=new Float32Array(N.at(-1));return P.forEach((H,K)=>{let I=N[K];U.set(H,I)}),U};function lc(P,N){let U=Math.floor(P.redemptionMs/N),H=Math.floor(P.preSpeechPadMs/N),K=Math.floor(P.minSpeechMs/N);return{redemptionFrames:U,preSpeechPadFrames:H,minSpeechFrames:K}}var pn=class{constructor(N,U,H,K){this.modelProcessFunc=N,this.modelResetFunc=U,this.options=H,this.msPerFrame=K,this.speaking=!1,this.redemptionCounter=0,this.speechFrameCount=0,this.active=!1,this.speechRealStartFired=!1,this.setOptions=re=>{this.options={...this.options,...re};let{redemptionFrames:fe,preSpeechPadFrames:ye,minSpeechFrames:Ee}=lc(this.options,this.msPerFrame);this.redemptionFrames=fe,this.preSpeechPadFrames=ye,this.minSpeechFrames=Ee},this.reset=()=>{this.speaking=!1,this.speechRealStartFired=!1,this.audioBuffer=[],this.modelResetFunc(),this.redemptionCounter=0,this.speechFrameCount=0},this.pause=re=>{this.active=!1,this.options.submitUserSpeechOnPause?this.endSegment(re):this.reset()},this.resume=()=>{this.active=!0},this.endSegment=re=>{let fe=this.audioBuffer;this.audioBuffer=[];let ye=this.speaking;if(this.reset(),ye)if(fe.reduce((et,dt)=>dt.isSpeech?et+1:et,0)>=this.minSpeechFrames){let et=uc(fe.map(dt=>dt.frame));re({msg:Mr.Message.SpeechEnd,audio:et})}else re({msg:Mr.Message.VADMisfire});return{}},this.process=async(re,fe)=>{if(!this.active)return;let ye=await this.modelProcessFunc(re),Ee=ye.isSpeech>=this.options.positiveSpeechThreshold;if(fe({probs:ye,msg:Mr.Message.FrameProcessed,frame:re}),this.audioBuffer.push({frame:re,isSpeech:Ee}),Ee&&(this.speechFrameCount++,this.redemptionCounter=0),Ee&&!this.speaking&&(this.speaking=!0,fe({msg:Mr.Message.SpeechStart})),this.speaking&&this.speechFrameCount===this.minSpeechFrames&&!this.speechRealStartFired&&(this.speechRealStartFired=!0,fe({msg:Mr.Message.SpeechRealStart})),ye.isSpeech<this.options.negativeSpeechThreshold&&this.speaking&&++this.redemptionCounter>=this.redemptionFrames){this.redemptionCounter=0,this.speechFrameCount=0,this.speaking=!1,this.speechRealStartFired=!1;let et=this.audioBuffer;if(this.audioBuffer=[],et.reduce((Te,mt)=>mt.isSpeech?Te+1:Te,0)>=this.minSpeechFrames){let Te=uc(et.map(mt=>mt.frame));fe({msg:Mr.Message.SpeechEnd,audio:Te})}else fe({msg:Mr.Message.VADMisfire})}if(!this.speaking){for(;this.audioBuffer.length>this.preSpeechPadFrames;)this.audioBuffer.shift();this.speechFrameCount=0}},this.audioBuffer=[];let{redemptionFrames:I,preSpeechPadFrames:ue,minSpeechFrames:ve}=lc(this.options,this.msPerFrame);this.redemptionFrames=I,this.preSpeechPadFrames=ue,this.minSpeechFrames=ve,this.reset()}};Yt.FrameProcessor=pn});var hc=Je((cc,cn)=>{"use strict";var Nh=(()=>{var P=Object.defineProperty,N=Object.getOwnPropertyDescriptor,U=Object.getOwnPropertyNames,H=Object.prototype.hasOwnProperty,K=(e=>typeof ot<"u"?ot:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof ot<"u"?ot:t)[r]}):e)(function(e){if(typeof ot<"u")return ot.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),I=(e,t)=>()=>(e&&(t=e(e=0)),t),ue=(e,t)=>{for(var r in t)P(e,r,{get:t[r],enumerable:!0})},ve=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of U(t))!H.call(e,a)&&a!==r&&P(e,a,{get:()=>t[a],enumerable:!(i=N(t,a))||i.enumerable});return e},re=e=>ve(P({},"__esModule",{value:!0}),e),fe,ye,Ee,et,dt,Te=I(()=>{"use strict";fe=new Map,ye=[],Ee=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=fe.get(e);if(i===void 0)fe.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let a=ye.indexOf(e);a!==-1&&ye.splice(a,1);for(let s=0;s<ye.length;s++)if(fe.get(ye[s]).priority<=r){ye.splice(s,0,e);return}ye.push(e)}return}throw new TypeError("not a valid backend")},et=async e=>{let t=fe.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},dt=async e=>{let t=e.executionProviders||[],r=t.map(u=>typeof u=="string"?u:u.name),i=r.length===0?ye:r,a,s=[],n=new Set;for(let u of i){let l=await et(u);typeof l=="string"?s.push({name:u,err:l}):(a||(a=l),a===l&&n.add(u))}if(!a)throw new Error(`no available backend found. ERR: ${s.map(u=>`[${u.name}] ${u.err}`).join(", ")}`);for(let{name:u,err:l}of s)r.includes(u)&&console.warn(`removing requested execution provider "${u}" from session options because it is not available: ${l}`);let o=t.filter(u=>n.has(typeof u=="string"?u:u.name));return[a,new Proxy(e,{get:(u,l)=>l==="executionProviders"?o:Reflect.get(u,l)})]}}),mt=I(()=>{"use strict";Te()}),Jt,Pr=I(()=>{"use strict";Jt="1.22.0"}),er,Oe,ai=I(()=>{"use strict";Pr(),er="warning",Oe={wasm:{},webgl:{},webgpu:{},versions:{common:Jt},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);er=e}},get logLevel(){return er}},Object.defineProperty(Oe,"logLevel",{enumerable:!0})}),pe,Fa=I(()=>{"use strict";ai(),pe=Oe}),si,ni,Wa=I(()=>{"use strict";si=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let a,s;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],s=e.dims[3]):(a=e.dims[3],s=e.dims[2]);let n=t?.format!==void 0?t.format:"RGB",o=t?.norm,u,l;o===void 0||o.mean===void 0?u=[255,255,255,255]:typeof o.mean=="number"?u=[o.mean,o.mean,o.mean,o.mean]:(u=[o.mean[0],o.mean[1],o.mean[2],0],o.mean[3]!==void 0&&(u[3]=o.mean[3])),o===void 0||o.bias===void 0?l=[0,0,0,0]:typeof o.bias=="number"?l=[o.bias,o.bias,o.bias,o.bias]:(l=[o.bias[0],o.bias[1],o.bias[2],0],o.bias[3]!==void 0&&(l[3]=o.bias[3]));let d=s*a,p=0,h=d,m=d*2,f=-1;n==="RGBA"?(p=0,h=d,m=d*2,f=d*3):n==="RGB"?(p=0,h=d,m=d*2):n==="RBG"&&(p=0,m=d,h=d*2);for(let w=0;w<s;w++)for(let b=0;b<a;b++){let _=(e.data[p++]-l[0])*u[0],y=(e.data[h++]-l[1])*u[1],x=(e.data[m++]-l[2])*u[2],v=f===-1?255:(e.data[f++]-l[3])*u[3];i.fillStyle="rgba("+_+","+y+","+x+","+v+")",i.fillRect(b,w,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},ni=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let a,s,n;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],s=e.dims[1],n=e.dims[3]):(a=e.dims[3],s=e.dims[2],n=e.dims[1]);let o=t!==void 0&&t.format!==void 0?t.format:"RGB",u=t?.norm,l,d;u===void 0||u.mean===void 0?l=[255,255,255,255]:typeof u.mean=="number"?l=[u.mean,u.mean,u.mean,u.mean]:(l=[u.mean[0],u.mean[1],u.mean[2],255],u.mean[3]!==void 0&&(l[3]=u.mean[3])),u===void 0||u.bias===void 0?d=[0,0,0,0]:typeof u.bias=="number"?d=[u.bias,u.bias,u.bias,u.bias]:(d=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(d[3]=u.bias[3]));let p=s*a;if(t!==void 0&&(t.format!==void 0&&n===4&&t.format!=="RGBA"||n===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let h=4,m=0,f=1,w=2,b=3,_=0,y=p,x=p*2,v=-1;o==="RGBA"?(_=0,y=p,x=p*2,v=p*3):o==="RGB"?(_=0,y=p,x=p*2):o==="RBG"&&(_=0,x=p,y=p*2),i=r.createImageData(a,s);for(let E=0;E<s*a;m+=h,f+=h,w+=h,b+=h,E++)i.data[m]=(e.data[_++]-d[0])*l[0],i.data[f]=(e.data[y++]-d[1])*l[1],i.data[w]=(e.data[x++]-d[2])*l[2],i.data[b]=v===-1?255:(e.data[v++]-d[3])*l[3]}else throw new Error("Can not access image data");return i}}),Ut,oi,ui,li,di,pi,Ga=I(()=>{"use strict";rr(),Ut=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,a=t.norm??{mean:255,bias:0},s,n;typeof a.mean=="number"?s=[a.mean,a.mean,a.mean,a.mean]:s=[a.mean[0],a.mean[1],a.mean[2],a.mean[3]??255],typeof a.bias=="number"?n=[a.bias,a.bias,a.bias,a.bias]:n=[a.bias[0],a.bias[1],a.bias[2],a.bias[3]??0];let o=t.format!==void 0?t.format:"RGBA",u=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",l=r*i,d=u==="RGBA"?new Float32Array(l*4):new Float32Array(l*3),p=4,h=0,m=1,f=2,w=3,b=0,_=l,y=l*2,x=-1;o==="RGB"&&(p=3,h=0,m=1,f=2,w=-1),u==="RGBA"?x=l*3:u==="RBG"?(b=0,y=l,_=l*2):u==="BGR"&&(y=0,_=l,b=l*2);for(let v=0;v<l;v++,h+=p,f+=p,m+=p,w+=p)d[b++]=(e[h]+n[0])/s[0],d[_++]=(e[m]+n[1])/s[1],d[y++]=(e[f]+n[2])/s[2],x!==-1&&w!==-1&&(d[x++]=(e[w]+n[3])/s[3]);return u==="RGBA"?new ze("float32",d,[1,4,r,i]):new ze("float32",d,[1,3,r,i])},oi=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,a=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,s=typeof e=="string",n,o=t??{},u=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},l=d=>typeof HTMLCanvasElement<"u"&&d instanceof HTMLCanvasElement||d instanceof OffscreenCanvas?d.getContext("2d"):null;if(r){let d=u();d.width=e.width,d.height=e.height;let p=l(d);if(p!=null){let h=e.height,m=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(h=t.resizedHeight,m=t.resizedWidth),t!==void 0){if(o=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");o.tensorFormat="RGBA",o.height=h,o.width=m}else o.tensorFormat="RGBA",o.height=h,o.width=m;p.drawImage(e,0,0),n=p.getImageData(0,0,m,h).data}else throw new Error("Can not access image data")}else if(i){let d,p;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(d=t.resizedHeight,p=t.resizedWidth):(d=e.height,p=e.width),t!==void 0&&(o=t),o.format="RGBA",o.height=d,o.width=p,t!==void 0){let h=u();h.width=p,h.height=d;let m=l(h);if(m!=null)m.putImageData(e,0,0),n=m.getImageData(0,0,p,d).data;else throw new Error("Can not access image data")}else n=e.data}else if(a){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let d=u();d.width=e.width,d.height=e.height;let p=l(d);if(p!=null){let h=e.height,m=e.width;return p.drawImage(e,0,0,m,h),n=p.getImageData(0,0,m,h).data,o.height=h,o.width=m,Ut(n,o)}else throw new Error("Can not access image data")}else{if(s)return new Promise((d,p)=>{let h=u(),m=l(h);if(!e||!m)return p();let f=new Image;f.crossOrigin="Anonymous",f.src=e,f.onload=()=>{h.width=f.width,h.height=f.height,m.drawImage(f,0,0,h.width,h.height);let w=m.getImageData(0,0,h.width,h.height);o.height=h.height,o.width=h.width,d(Ut(w.data,o))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(n!==void 0)return Ut(n,o);throw new Error("Input data provided is not supported - aborted tensor creation")},ui=(e,t)=>{let{width:r,height:i,download:a,dispose:s}=t,n=[1,i,r,4];return new ze({location:"texture",type:"float32",texture:e,dims:n,download:a,dispose:s})},li=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:s}=t;return new ze({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:a,dispose:s})},di=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:s}=t;return new ze({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:a,dispose:s})},pi=(e,t,r)=>new ze({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),tt,gt,tr,ci,ja=I(()=>{"use strict";tt=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),gt=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),tr=!1,ci=()=>{if(!tr){tr=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(tt.set("int64",BigInt64Array),gt.set(BigInt64Array,"int64")),t&&(tt.set("uint64",BigUint64Array),gt.set(BigUint64Array,"uint64")),i?(tt.set("float16",r),gt.set(r,"float16")):tt.set("float16",Uint16Array)}}}),hi,fi,Ha=I(()=>{"use strict";rr(),hi=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},fi=(e,t)=>{switch(e.location){case"cpu":return new ze(e.type,e.data,t);case"cpu-pinned":return new ze({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new ze({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new ze({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new ze({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),ze,rr=I(()=>{"use strict";Wa(),Ga(),ja(),Ha(),ze=class{constructor(e,t,r){ci();let i,a;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,a=e.dims,e.location){case"cpu-pinned":{let n=tt.get(i);if(!n)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof n))throw new TypeError(`buffer should be of type ${n.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let n,o;if(typeof e=="string")if(i=e,o=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");n=t}else{let u=tt.get(e);if(u===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&u===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${u.name} as data.`);e==="uint64"||e==="int64"?n=u.from(t,BigInt):n=u.from(t)}else if(t instanceof u)n=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")n=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&u!==Uint16Array)n=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${u}`)}else if(o=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let u=typeof e[0];if(u==="string")i="string",n=e;else if(u==="boolean")i="bool",n=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${u}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",n=Uint8Array.from(e);else{let u=gt.get(e.constructor);if(u===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=u,n=e}if(o===void 0)o=[n.length];else if(!Array.isArray(o))throw new TypeError("A tensor's dims must be a number array");a=o,this.cpuData=n,this.dataLocation="cpu"}let s=hi(a);if(this.cpuData&&s!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(s/2)===this.cpuData.length))throw new Error(`Tensor's size(${s}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=a,this.size=s}static async fromImage(e,t){return oi(e,t)}static fromTexture(e,t){return ui(e,t)}static fromGpuBuffer(e,t){return li(e,t)}static fromMLTensor(e,t){return di(e,t)}static fromPinnedBuffer(e,t,r){return pi(e,t,r)}toDataURL(e){return si(this,e)}toImageData(e){return ni(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return fi(this,e)}}}),Me,mi=I(()=>{"use strict";rr(),Me=ze}),zt,ir,Ge,Ve,gi=I(()=>{"use strict";ai(),zt=(e,t)=>{(typeof Oe.trace>"u"?!Oe.wasm.trace:!Oe.trace)||console.timeStamp(`${e}::ORT::${t}`)},ir=(e,t)=>{let r=new Error().stack?.split(/\r\n|\r|\n/g)||[],i=!1;for(let a=0;a<r.length;a++){if(i&&!r[a].includes("TRACE_FUNC")){let s=`FUNC_${e}::${r[a].trim().split(" ")[1]}`;t&&(s+=`::${t}`),zt("CPU",s);return}r[a].includes("TRACE_FUNC")&&(i=!0)}},Ge=e=>{(typeof Oe.trace>"u"?!Oe.wasm.trace:!Oe.trace)||ir("BEGIN",e)},Ve=e=>{(typeof Oe.trace>"u"?!Oe.wasm.trace:!Oe.trace)||ir("END",e)}}),yi,Ka=I(()=>{"use strict";Te(),mi(),gi(),yi=class dc{constructor(t){this.handler=t}async run(t,r,i){Ge();let a={},s={};if(typeof t!="object"||t===null||t instanceof Me||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let n=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof Me)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");n=!1;for(let l of r){if(typeof l!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(l)===-1)throw new RangeError(`'fetches' contains invalid output name: ${l}.`);a[l]=null}if(typeof i=="object"&&i!==null)s=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let l=!1,d=Object.getOwnPropertyNames(r);for(let p of this.outputNames)if(d.indexOf(p)!==-1){let h=r[p];(h===null||h instanceof Me)&&(l=!0,n=!1,a[p]=h)}if(l){if(typeof i=="object"&&i!==null)s=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else s=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let l of this.inputNames)if(typeof t[l]>"u")throw new Error(`input '${l}' is missing in 'feeds'.`);if(n)for(let l of this.outputNames)a[l]=null;let o=await this.handler.run(t,a,s),u={};for(let l in o)if(Object.hasOwnProperty.call(o,l)){let d=o[l];d instanceof Me?u[l]=d:u[l]=new Me(d.type,d.data,d.dims)}return Ve(),u}async release(){return this.handler.dispose()}static async create(t,r,i,a){Ge();let s,n={};if(typeof t=="string"){if(s=t,typeof r=="object"&&r!==null)n=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(s=t,typeof r=="object"&&r!==null)n=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let d=t,p=0,h=t.byteLength;if(typeof r=="object"&&r!==null)n=r;else if(typeof r=="number"){if(p=r,!Number.isSafeInteger(p))throw new RangeError("'byteOffset' must be an integer.");if(p<0||p>=d.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${d.byteLength}).`);if(h=t.byteLength-p,typeof i=="number"){if(h=i,!Number.isSafeInteger(h))throw new RangeError("'byteLength' must be an integer.");if(h<=0||p+h>d.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${d.byteLength-p}].`);if(typeof a=="object"&&a!==null)n=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");s=new Uint8Array(d,p,h)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[o,u]=await dt(n),l=await o.createInferenceSessionHandler(s,u);return Ve(),new dc(l)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),ar,Za=I(()=>{"use strict";Ka(),ar=yi}),Qa=I(()=>{"use strict"}),Xa=I(()=>{"use strict"}),Ya=I(()=>{"use strict"}),Ja=I(()=>{"use strict"}),wi={};ue(wi,{InferenceSession:()=>ar,TRACE:()=>zt,TRACE_FUNC_BEGIN:()=>Ge,TRACE_FUNC_END:()=>Ve,Tensor:()=>Me,env:()=>pe,registerBackend:()=>Ee});var je=I(()=>{"use strict";mt(),Fa(),Za(),mi(),Qa(),Xa(),gi(),Ya(),Ja()}),sr=I(()=>{"use strict"}),_i={};ue(_i,{default:()=>bi});var nr,or,bi,es=I(()=>{"use strict";Fp(),it(),cr(),nr="ort-wasm-proxy-worker",or=globalThis.self?.name===nr,or&&(self.onmessage=e=>{let{type:t,in:r}=e.data;try{switch(t){case"init-wasm":mr(r.wasm).then(()=>{Zs(r).then(()=>{postMessage({type:t})},i=>{postMessage({type:t,err:i})})},i=>{postMessage({type:t,err:i})});break;case"init-ep":{let{epName:i,env:a}=r;Qs(a,i).then(()=>{postMessage({type:t})},s=>{postMessage({type:t,err:s})});break}case"copy-from":{let{buffer:i}=r,a=Ia(i);postMessage({type:t,out:a});break}case"create":{let{model:i,options:a}=r;Ys(i,a).then(s=>{postMessage({type:t,out:s})},s=>{postMessage({type:t,err:s})});break}case"release":Js(r),postMessage({type:t});break;case"run":{let{sessionId:i,inputIndices:a,inputs:s,outputIndices:n,options:o}=r;tn(i,a,s,n,new Array(n.length).fill(null),o).then(u=>{u.some(l=>l[3]!=="cpu")?postMessage({type:t,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:t,out:u},an([...s,...u]))},u=>{postMessage({type:t,err:u})});break}case"end-profiling":rn(r),postMessage({type:t});break;default:}}catch(i){postMessage({type:t,err:i})}}),bi=or?null:e=>new Worker(e??Ce,{type:"classic",name:nr})}),$i,vi,Ce,ur,Nt,xi,Si,lr,Ti,dr,Ei,pr,ki,cr=I(()=>{"use strict";sr(),$i=typeof location>"u"?void 0:location.origin,vi=()=>typeof document<"u"?document.currentScript?.src:typeof self<"u"?self.location?.href:void 0,Ce=vi(),ur=()=>{if(Ce&&!Ce.startsWith("blob:"))return Ce.substring(0,Ce.lastIndexOf("/")+1)},Nt=(e,t)=>{try{let r=t??Ce;return(r?new URL(e,r):new URL(e)).origin===$i}catch{return!1}},xi=(e,t)=>{let r=t??Ce;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},Si=(e,t)=>`${t??"./"}${e}`,lr=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},Ti=async e=>(await import(e)).default,dr=(es(),re(_i)).default,Ei=async()=>{if(!Ce)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(Nt(Ce))return[void 0,dr()];let e=await lr(Ce);return[e,dr(e)]},pr=void 0,ki=async(e,t,r)=>{if(!e&&!t&&pr&&Ce&&Nt(Ce))return[void 0,pr];{let i="ort-wasm-simd-threaded.jsep.mjs",a=e??xi(i,t),s=r&&a&&!Nt(a,t),n=s?await lr(a):a??Si(i,t);return[s?n:void 0,await Ti(n)]}}}),hr,Lt,yt,fr,Ii,zi,Ci,mr,le,it=I(()=>{"use strict";cr(),Lt=!1,yt=!1,fr=!1,Ii=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},zi=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},Ci=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},mr=async e=>{if(Lt)return Promise.resolve();if(yt)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(fr)throw new Error("previous call to 'initializeWebAssembly()' failed.");yt=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!Ci())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!zi())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=Ii();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let a=e.wasmPaths,s=typeof a=="string"?a:void 0,n=a?.mjs,o=n?.href??n,u=a?.wasm,l=u?.href??u,d=e.wasmBinary,[p,h]=await ki(o,s,r>1),m=!1,f=[];if(t>0&&f.push(new Promise(w=>{setTimeout(()=>{m=!0,w()},t)})),f.push(new Promise((w,b)=>{let _={numThreads:r};if(d)_.wasmBinary=d;else if(l||s)_.locateFile=y=>l??s+y;else if(o&&o.indexOf("blob:")!==0)_.locateFile=y=>new URL(y,o).href;else if(p){let y=ur();y&&(_.locateFile=x=>y+x)}h(_).then(y=>{yt=!1,Lt=!0,hr=y,w(),p&&URL.revokeObjectURL(p)},y=>{yt=!1,fr=!0,b(y)})})),await Promise.race(f),m)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},le=()=>{if(Lt&&hr)return hr;throw new Error("WebAssembly is not initialized yet.")}}),De,qt,se,gr=I(()=>{"use strict";it(),De=(e,t)=>{let r=le(),i=r.lengthBytesUTF8(e)+1,a=r._malloc(i);return r.stringToUTF8(e,a,i),t.push(a),a},qt=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([a,s])=>{let n=t?t+a:a;if(typeof s=="object")qt(s,n+".",r,i);else if(typeof s=="string"||typeof s=="number")i(n,s.toString());else if(typeof s=="boolean")i(n,s?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof s}`)})},se=e=>{let t=le(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetLastError(a,a+i);let s=Number(t.getValue(a,i===4?"i32":"i64")),n=t.getValue(a+i,"*"),o=n?t.UTF8ToString(n):"";throw new Error(`${e} ERROR_CODE: ${s}, ERROR_MESSAGE: ${o}`)}finally{t.stackRestore(r)}}}),Ai,ts=I(()=>{"use strict";it(),gr(),Ai=e=>{let t=le(),r=0,i=[],a=e||{};try{if(e?.logSeverityLevel===void 0)a.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log serverity level is not valid: ${e.logSeverityLevel}`);if(e?.logVerbosityLevel===void 0)a.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);e?.terminate===void 0&&(a.terminate=!1);let s=0;return e?.tag!==void 0&&(s=De(e.tag,i)),r=t._OrtCreateRunOptions(a.logSeverityLevel,a.logVerbosityLevel,!!a.terminate,s),r===0&&se("Can't create run options."),e?.extra!==void 0&&qt(e.extra,"",new WeakSet,(n,o)=>{let u=De(n,i),l=De(o,i);t._OrtAddRunConfigEntry(r,u,l)!==0&&se(`Can't set a run config entry: ${n} - ${o}.`)}),[r,i]}catch(s){throw r!==0&&t._OrtReleaseRunOptions(r),i.forEach(n=>t._free(n)),s}}}),Oi,Ri,Bi,wt,Mi,Di,rs=I(()=>{"use strict";it(),gr(),Oi=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},Ri=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},Bi=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},wt=(e,t,r,i)=>{let a=De(t,i),s=De(r,i);le()._OrtAddSessionConfigEntry(e,a,s)!==0&&se(`Can't set a session config entry: ${t} - ${r}.`)},Mi=async(e,t,r)=>{for(let i of t){let a=typeof i=="string"?i:i.name,s=[];switch(a){case"webnn":if(a="WEBNN",typeof i!="string"){let d=i?.deviceType;d&&wt(e,"deviceType",d,r)}break;case"webgpu":if(a="JS",typeof i!="string"){let d=i;if(d?.preferredLayout){if(d.preferredLayout!=="NCHW"&&d.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${d.preferredLayout}`);wt(e,"preferredLayout",d.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${a}`)}let n=De(a,r),o=s.length,u=0,l=0;if(o>0){u=le()._malloc(o*le().PTR_SIZE),r.push(u),l=le()._malloc(o*le().PTR_SIZE),r.push(l);for(let d=0;d<o;d++)le().setValue(u+d*le().PTR_SIZE,s[d][0],"*"),le().setValue(l+d*le().PTR_SIZE,s[d][1],"*")}await le()._OrtAppendExecutionProvider(e,n,u,l,o)!==0&&se(`Can't append execution provider: ${a}.`)}},Di=async e=>{let t=le(),r=0,i=[],a=e||{};Bi(a);try{let s=Oi(a.graphOptimizationLevel??"all"),n=Ri(a.executionMode??"sequential"),o=typeof a.logId=="string"?De(a.logId,i):0,u=a.logSeverityLevel??2;if(!Number.isInteger(u)||u<0||u>4)throw new Error(`log serverity level is not valid: ${u}`);let l=a.logVerbosityLevel??0;if(!Number.isInteger(l)||l<0||l>4)throw new Error(`log verbosity level is not valid: ${l}`);let d=typeof a.optimizedModelFilePath=="string"?De(a.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(s,!!a.enableCpuMemArena,!!a.enableMemPattern,n,!!a.enableProfiling,0,o,u,l,d),r===0&&se("Can't create session options."),a.executionProviders&&await Mi(r,a.executionProviders,i),a.enableGraphCapture!==void 0){if(typeof a.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${a.enableGraphCapture}`);wt(r,"enableGraphCapture",a.enableGraphCapture.toString(),i)}if(a.freeDimensionOverrides)for(let[p,h]of Object.entries(a.freeDimensionOverrides)){if(typeof p!="string")throw new Error(`free dimension override name must be a string: ${p}`);if(typeof h!="number"||!Number.isInteger(h)||h<0)throw new Error(`free dimension override value must be a non-negative integer: ${h}`);let m=De(p,i);t._OrtAddFreeDimensionOverride(r,m,h)!==0&&se(`Can't set a free dimension override: ${p} - ${h}.`)}return a.extra!==void 0&&qt(a.extra,"",new WeakSet,(p,h)=>{wt(r,p,h,i)}),[r,i]}catch(s){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&se("Can't release session options."),i.forEach(n=>t._free(n)),s}}}),at,st,nt,yr,wr,_r,br,Ur,ne=I(()=>{"use strict";at=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},st=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},nt=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((a,s)=>a*s,1);return r>0?Math.ceil(i*r):void 0},yr=e=>{switch(e){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},wr=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},_r=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",br=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Ur=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),$r,Pi=I(()=>{"use strict";sr(),$r=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let a=t.body.getReader(),s;try{s=new ArrayBuffer(i)}catch(o){if(o instanceof RangeError){let u=Math.ceil(i/65536);s=new WebAssembly.Memory({initial:u,maximum:u}).buffer}else throw o}let n=0;for(;;){let{done:o,value:u}=await a.read();if(o)break;let l=u.byteLength;new Uint8Array(s,n,l).set(u),n+=l}return new Uint8Array(s,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),Ui,Nr,Lr,Ct,qr,Vr,be,ut=I(()=>{"use strict";ne(),Ui=["V","I","W","E","F"],Nr=(e,t)=>{console.log(`[${Ui[e]},${new Date().toISOString()}]${t}`)},qr=(e,t)=>{Lr=e,Ct=t},Vr=(e,t)=>{let r=wr(e),i=wr(Lr);r>=i&&Nr(r,typeof t=="function"?t():t)},be=(...e)=>{Ct&&Vr(...e)}}),Fr,At,D,Gt,Wr,Ni,_t,ae=I(()=>{"use strict";Fr=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},At=class{static calcShape(e,t,r=!1){let i=e.length,a=t.length;if(i===0)return t;if(a===0)return e;let s=Math.max(e.length,t.length),n=new Array(s);if(r){if(i<2||a<2)return;let o=Fr.calcMatMulShape([e[i-2],e[i-1]],[t[a-2],t[a-1]]);if(o===void 0)return;[n[s-2],n[s-1]]=o}for(let o=r?3:1;o<=s;o++){let u=i-o<0?1:e[i-o],l=a-o<0?1:t[a-o];if(u!==l&&u>1&&l>1)return;let d=Math.max(u,l);if(u&&l)n[s-o]=Math.max(u,l);else{if(d>1)return;n[s-o]=0}}return n}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let a=1;a<=r;a++)if(e[r-a]!==1&&e[r-a]!==t[i-a])return!1;return!0}},D=class Pa{static size(t){return Pa.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let a=new Array(i),s=i-1;for(;s>=0;){if(t[s]%r===0){a[s]=t[s]/r;break}if(r%t[s]!==0)throw new Error("cannot convert shape");a[s]=1,r/=t[s],s--}for(s--;s>=0;s--)a[s]=t[s];return a}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return Pa.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return Pa.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let a=1;for(let s=r;s<i;s++){if(t[s]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");a*=Number(t[s])}return a}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let a=r-3;a>=0;--a)i[a]=i[a+1]*t[a+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((a,s)=>a+r[s]+r[s+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,a)=>i===r[a])}},Gt=class la{static adjustPoolAttributes(t,r,i,a,s,n){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let o=0;o<r.length-2;o++)o>=i.length?i.push(r[o+2]):i[o]=r[o+2];for(let o=0;o<i.length;o++)if(o<a.length){if(a[o]<0)throw new Error("strides should be greater than or equal to 1")}else a.push(1);for(let o=0;o<i.length;o++)if(o<s.length){if(s[o]<0)throw new Error("dilations should be greater than or equal to 1")}else s.push(1);for(let o=0;o<i.length*2;o++)if(o<n.length){if(n[o]<0)throw new Error("pad should be greater than or equal to 1")}else n.push(0);for(let o=0;o<i.length;o++){if(i[o]<=0)throw new Error("kernel shapes need to be greater than 0");if(n[o]>=i[o]||n[o+i.length]>=i[o])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,a,s,n,o){if(o){if(s.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(a.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let u=0;u<t.length-2;u++)la.adjustPadAndReturnShape(t[u+(n?1:2)],r[u],i[u],a[u],s,u,u+t.length-2,o)}}static computePoolOutputShape(t,r,i,a,s,n,o){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let u=[r[0],r[1]];return la.computeShapeHelper(t,r,u,i,a,s,n,o),u}static computeConvOutputShape(t,r,i,a,s,n,o){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let u=[t[0],r[0]];return la.computeShapeHelper(!1,t,u,i,a,s,n,o),u}static computeShapeHelper(t,r,i,a,s,n,o,u){if(t)for(let l=0;l<r.length-2;l++)i.push(1);else for(let l=0;l<r.length-2;l++)i.push(la.adjustPadAndReturnShape(r[l+2],a[l],s[l],n[l],o,l,l+r.length-2,u))}static adjustPadAndReturnShape(t,r,i,a,s,n,o,u){let l=i*(a-1)+1;if(u&&u!=="NOTSET")switch(u){case"VALID":return s[n]=0,s[o]=0,Math.floor((t-l)/r+1);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let d=((t+r-1)/r-1)*r+a-t;return s[n]=Math.floor(u==="SAME_LOWER"?(d+1)/2:d/2),s[o]=d-s[n],Math.floor((t+d-a)/r+1)}default:throw new Error("Unsupported AutoPad type")}else return Math.floor((t+s[n]+s[o]-l)/r+1)}},Wr=class{static getShapeOfGemmResult(e,t,r,i,a){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let s,n,o;t?(s=e[1],n=e[0]):(s=e[0],n=e[1]);let u=-1;if(i?(o=r[0],u=1):(o=r[1],u=0),r[u]!==n)throw new Error("dimension mismatch");if(s<=0||o<=0||n<=0)throw new Error("invalid shape specified");if(a&&!At.isValidBroadcast(a,[s,o]))throw new Error("gemm: invalid bias shape for broadcast");return[s,o,n]}},Ni=-34028234663852886e22,_t=34028234663852886e22}),Ot,jt=I(()=>{"use strict";ne(),Ot=(e,t)=>new(yr(t))(e)}),Vt,Ht,vr,xr,bt,Rt,Gr,jr,Hr,Li,qi,ha=I(()=>{"use strict";ne(),ut(),Vt=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),Ht=(e,t)=>{if(t==="int32")return e;let r=Vt.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let a=e.byteLength/i,s=new(yr(t))(e.buffer,e.byteOffset,a);switch(t){case"int64":case"uint64":{let n=new Int32Array(a);for(let o=0;o<a;o++){let u=s[o];if(u>2147483647n||u<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");n[o]=Number(u)}return new Uint8Array(n.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&s.some(o=>o>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let n=Int32Array.from(s,Number);return new Uint8Array(n.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},vr=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let a=BigInt64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"uint64":{if(i.some(s=>s<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let a=BigUint64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"int8":{if(i.some(s=>s<-128||s>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let a=Int8Array.from(i,Number);return new Uint8Array(a.buffer)}case"uint8":{if(i.some(a=>a<0||a>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(s=>s<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let a=Uint32Array.from(i,Number);return new Uint8Array(a.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},xr=1,bt=()=>xr++,Rt=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Gr=(e,t)=>{let r=Vt.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,a)=>i*a)*r/8):0},jr=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:a,shape:s,fallbackDataType:n}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=a,this.tensorShape=s,this.fallbackDataType=n}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Gr(this.dataType,this.tensorShape)}destroy(){be("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=vr(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return r.buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,a)=>i===r[a])}setIsDataConverted(e){this.isDataConverted=e}},Hr=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let a=this.tensorManager.getMLContext(e),s;if(!a.opSupportLimits().input.dataTypes.includes(t)){if(s=Rt.get(t),!s||!a.opSupportLimits().input.dataTypes.includes(s))throw new Error(`WebNN backend does not support data type: ${t}`);be("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(a,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Gr(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let n=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,n,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=Ht(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else be("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){if(this.activeUpload){let t=this.wrapper?.isDataConverted?vr(this.activeUpload,this.wrapper?.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(t):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(t);return}else return t.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},Li=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}reserveTensorId(){let e=bt();return this.tensorTrackersById.set(e,new Hr(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,a){be("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${a}}`);let s=this.tensorTrackersById.get(t);if(!s)throw new Error("Tensor not found.");return s.ensureTensor(e,r,i,a)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){be("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t?.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let a=this.getMLContext(e),s=bt(),n=new jr({sessionId:e,context:a,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(s,new Hr(this,n)),this.externalTensors.add(n),s}async getCachedTensor(e,t,r,i,a,s,n){let o=this.getMLContext(e);for(let[l,d]of this.freeTensors.entries())if(d.canReuseTensor(o,t,r)){be("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${n?`fallbackDataType: ${n},`:""} shape: ${r}`);let p=this.freeTensors.splice(l,1)[0];return p.sessionId=e,p}be("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${n?`fallbackDataType: ${n},`:""} shape: ${r}}`);let u=await o.createTensor({dataType:n??t,shape:r,dimensions:r,usage:i,writable:a,readable:s});return new jr({sessionId:e,context:o,tensor:u,dataType:t,shape:r,fallbackDataType:n})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},qi=(...e)=>new Li(...e)}),Kt,Vi,Fi,Wi=I(()=>{"use strict";ne(),it(),jt(),ha(),ut(),Kt=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),Vi=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((a,s)=>a===i[s]&&e[a]===t[a])},Fi=class{constructor(e){this.tensorManager=qi(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,qr(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){be("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){be("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)be("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>Vi(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(a=>a.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){be("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,a){let s=Kt.get(r);if(!s)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,s,i,a)}async createTemporaryTensor(e,t,r){be("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=Kt.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let a=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,a,i,r,!1);let s=this.temporarySessionTensorIds.get(e);return s?s.push(a):this.temporarySessionTensorIds.set(e,[a]),a}uploadTensor(e,t){if(!le().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");be("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return Ot(r,t)}}registerMLTensor(e,t,r,i){let a=Kt.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);let s=this.tensorManager.registerTensor(e,t,a,i);return be("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${a}, dimensions: ${i}} -> {tensorId: ${s}}`),s}registerMLConstant(e,t,r,i,a,s,n=!1){if(!s)throw new Error("External mounted files are not available.");let o=e;e.startsWith("./")&&(o=e.substring(2));let u=s.get(o);if(!u)throw new Error(`File with name ${o} not found in preloaded files.`);if(t+r>u.byteLength)throw new Error("Out of bounds: data offset and length exceed the external file data size.");let l=u.slice(t,t+r).buffer,d;switch(a.dataType){case"float32":d=new Float32Array(l);break;case"float16":d=typeof Float16Array<"u"&&Float16Array.from?new Float16Array(l):new Uint16Array(l);break;case"int32":d=new Int32Array(l);break;case"uint32":d=new Uint32Array(l);break;case"int64":if(n){let p=Ht(new Uint8Array(l),"int64");d=new Int32Array(p.buffer),a.dataType="int32"}else d=new BigInt64Array(l);break;case"uint64":d=new BigUint64Array(l);break;case"int8":d=new Int8Array(l);break;case"int4":case"uint4":case"uint8":d=new Uint8Array(l);break;default:throw new Error(`Unsupported data type: ${a.dataType} in creating WebNN Constant from external data.`)}return be("verbose",()=>`[WebNN] registerMLConstant {dataType: ${a.dataType}, shape: ${a.shape}}} ${n?"(Note: it was int64 data type and registered to int32 as workaround)":""}`),i.constant(a,d)}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=this.mlContextBySessionId.get(e),a=Kt.get(at(t));return typeof a>"u"?!1:r?!!i?.opSupportLimits().input.dataTypes.includes(a):!!i?.opSupportLimits().output.dataTypes.includes(a)}flush(){}}}),Kr=I(()=>{"use strict"}),Zr,Qr,Sr,Xr,Yr,Jr,Gi,ji,fa,is=I(()=>{"use strict";ut(),Kr(),Zr=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Qr=[],Sr=e=>Math.ceil(Number(e)/16)*16,Xr=e=>{for(let t=0;t<Qr.length;t++){let r=Qr[t];if(e<=r)return r}return Math.ceil(e/16)*16},Yr=1,Jr=()=>Yr++,Gi=async(e,t,r,i)=>{let a=Sr(r),s=e.device.createBuffer({size:a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let n=e.getCommandEncoder();e.endComputePass(),n.copyBufferToBuffer(t,0,s,0,a),e.flush(),await s.mapAsync(GPUMapMode.READ);let o=s.getMappedRange();if(i){let u=i();return u.set(new Uint8Array(o,0,r)),u}else return new Uint8Array(o.slice(0,r))}finally{s.destroy()}},ji=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of Zr)Qr.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,a=t.byteLength,s=Sr(a),n=this.storageCache.get(e);if(!n)throw new Error("gpu data for uploading does not exist");if(Number(n.originalSize)!==a)throw new Error(`inconsistent data size. gpu data size=${n.originalSize}, data size=${a}`);let o=this.backend.device.createBuffer({mappedAtCreation:!0,size:s,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}),u=o.getMappedRange();new Uint8Array(u).set(new Uint8Array(r,i,a)),o.unmap();let l=this.backend.device.createCommandEncoder();l.copyBufferToBuffer(o,0,n.gpuData.buffer,0,s),this.backend.device.queue.submit([l.finish()]),o.destroy(),be("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let a=Sr(r.originalSize),s=this.backend.getCommandEncoder();this.backend.endComputePass(),s.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,a)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return be("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=Jr();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),be("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),be("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=Xr(e),i,a=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,s=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(a||s){let o=(a?this.freeBuffers:this.freeUniformBuffers).get(r);o?o.length>0?i=o.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let n={id:Jr(),type:0,buffer:i};return this.storageCache.set(n.id,{gpuData:n,originalSize:Number(e)}),be("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${n.id}`),n}get(e){return this.storageCache.get(e)?.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return be("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await Gi(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=Zr.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(be("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},fa=(...e)=>new ji(...e)}),c,g,$=I(()=>{"use strict";c=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},g=e=>new c(e)}),T,S,O,z,k,R,q,V,F,M,ee,C,j,Ie,ce,me,$e,Z=I(()=>{"use strict";ne(),ae(),T=64,S=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},O=(e,t=1)=>{let r=S(e,t);return typeof r=="string"?r:r[0]},z=(e,t=1)=>{let r=S(e,t);return typeof r=="string"?r:r[1]},k=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:D.computeStrides(r)})}),t},R=e=>e%4===0?4:e%2===0?2:1,q=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,V=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,F=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,M=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,ee=(e,t,r,i,a)=>{let s=typeof r=="number",n=s?r:r.length,o=[...new Array(n).keys()],u=n<2?"u32":n<=4?`vec${n}<u32>`:`array<u32, ${n}>`,l=S(t,a),d=typeof l=="string"?l:l[1],p=typeof l=="string"?l:l[0],h={indices:u,value:d,storage:p,tensor:t},m=G=>typeof G=="string"?G:`${G}u`,f={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},w=s?"uniforms.":"",b=`${w}${e}_shape`,_=`${w}${e}_strides`,y="";for(let G=0;G<n-1;G++)y+=`
    let dim${G} = current / ${M(_,G,n)};
    let rest${G} = current % ${M(_,G,n)};
    indices[${G}] = dim${G};
    current = rest${G};
    `;y+=`indices[${n-1}] = current;`;let x=n<2?"":`
  fn o2i_${e}(offset: u32) -> ${h.indices} {
    var indices: ${h.indices};
    var current = offset;
    ${y}
    return indices;
  }`,v=G=>(f.offsetToIndices=!0,n<2?G:`o2i_${e}(${G})`),E=[];if(n>=2)for(let G=n-1;G>=0;G--)E.push(`${M(_,G,n)} * (indices[${G}])`);let A=n<2?"":`
  fn i2o_${e}(indices: ${h.indices}) -> u32 {
    return ${E.join("+")};
  }`,B=G=>(f.indicesToOffset=!0,n<2?G:`i2o_${e}(${G})`),L=(...G)=>n===0?"0u":`${h.indices}(${G.map(m).join(",")})`,W=(G,X)=>n<2?`${G}`:`${M(G,X,n)}`,Q=(G,X,ge)=>n<2?`${G}=${ge};`:`${M(G,X,n)}=${ge};`,de={},te=(G,X)=>{f.broadcastedIndicesToOffset=!0;let ge=`${X.name}broadcastedIndicesTo${e}Offset`;if(ge in de)return`${ge}(${G})`;let ke=[];for(let Ze=n-1;Ze>=0;Ze--){let Dt=X.indicesGet("outputIndices",Ze+X.rank-n);ke.push(`${W(_,Ze)} * (${Dt} % ${W(b,Ze)})`)}return de[ge]=`fn ${ge}(outputIndices: ${X.type.indices}) -> u32 {
             return ${ke.length>0?ke.join("+"):"0u"};
           }`,`${ge}(${G})`},he=(G,X)=>(()=>{if(h.storage===h.value)return`${e}[${G}]=${X};`;if(h.storage==="vec2<u32>"&&h.value==="i32")return`${e}[${G}]=vec2<u32>(u32(${X}), select(0u, 0xFFFFFFFFu, ${X} < 0));`;if(h.storage==="vec2<u32>"&&h.value==="u32")return`${e}[${G}]=vec2<u32>(u32(${X}), 0u);`;if(h.storage==="u32"&&h.value==="vec4<bool>")return`${e}[${G}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${X}));`;throw new Error(`not supported combination of storage type ${h.storage} and value type ${h.value} yet`)})(),Y=G=>(()=>{if(h.storage===h.value)return`${e}[${G}]`;if(h.storage==="vec2<u32>"&&h.value==="i32")return`i32(${e}[${G}].x)`;if(h.storage==="vec2<u32>"&&h.value==="u32")return`u32(${e}[${G}].x)`;if(h.storage==="u32"&&h.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${G}] & 0xFFu), bool(${e}[${G}] & 0xFF00u), bool(${e}[${G}] & 0xFF0000u), bool(${e}[${G}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${h.storage} and value type ${h.value} yet`)})(),_e=n<2?"":`
  fn get_${e}ByIndices(indices: ${h.indices}) -> ${d} {
    return ${Y(`i2o_${e}(indices)`)};
  }`,oe=n<2?"":(()=>{let G=o.map(ge=>`d${ge}: u32`).join(", "),X=o.map(ge=>`d${ge}`).join(", ");return`
  fn get_${e}(${G}) -> ${d} {
    return get_${e}ByIndices(${L(X)});
  }`})(),J=(...G)=>{if(G.length!==n)throw new Error(`indices length must be ${n}`);let X=G.map(m).join(",");return n===0?Y("0u"):n===1?Y(X[0]):(f.get=!0,f.getByIndices=!0,f.indicesToOffset=!0,`get_${e}(${X})`)},Se=G=>n<2?Y(G):(f.getByIndices=!0,f.indicesToOffset=!0,`get_${e}ByIndices(${G})`),ie=n<2?"":`
  fn set_${e}ByIndices(indices: ${h.indices}, value: ${d}) {
    ${he(`i2o_${e}(indices)`,"value")}
  }`,Ae=n<2?"":(()=>{let G=o.map(ge=>`d${ge}: u32`).join(", "),X=o.map(ge=>`d${ge}`).join(", ");return`
  fn set_${e}(${G}, value: ${d}) {
    set_${e}ByIndices(${L(X)}, value);
  }`})();return{impl:()=>{let G=[],X=!1;return f.offsetToIndices&&(G.push(x),X=!0),f.indicesToOffset&&(G.push(A),X=!0),f.broadcastedIndicesToOffset&&(Object.values(de).forEach(ge=>G.push(ge)),X=!0),f.set&&(G.push(Ae),X=!0),f.setByIndices&&(G.push(ie),X=!0),f.get&&(G.push(oe),X=!0),f.getByIndices&&(G.push(_e),X=!0),!s&&X&&G.unshift(`const ${b} = ${h.indices}(${r.join(",")});`,`const ${_} = ${h.indices}(${D.computeStrides(r).join(",")});`),G.join(`
`)},type:h,offsetToIndices:v,indicesToOffset:B,broadcastedIndicesToOffset:te,indices:L,indicesGet:W,indicesSet:Q,set:(...G)=>{if(G.length!==n+1)throw new Error(`indices length must be ${n}`);let X=G[n];if(typeof X!="string")throw new Error("value must be string");let ge=G.slice(0,n).map(m).join(",");return n===0?he("0u",X):n===1?he(ge[0],X):(f.set=!0,f.setByIndices=!0,f.indicesToOffset=!0,`set_${e}(${ge}, ${X})`)},setByOffset:he,setByIndices:(G,X)=>n<2?he(G,X):(f.setByIndices=!0,f.indicesToOffset=!0,`set_${e}ByIndices(${G}, ${X});`),get:J,getByOffset:Y,getByIndices:Se,usage:i,name:e,strides:_,shape:b,rank:n}},C=(e,t,r,i=1)=>ee(e,t,r,"input",i),j=(e,t,r,i=1)=>ee(e,t,r,"output",i),Ie=(e,t,r)=>ee(e,t,r,"atomicOutput",1),ce=(e,t,r,i=1)=>ee(e,t,r,"internal",i),me=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=T){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let a=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,s=a?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,n=a?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${s}) {
    ${n}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let a=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${a}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},$e=(e,t)=>new me(e,t)}),Pe,Xe,He,Bt,ei,Hi,Re,pt,Ki,we=I(()=>{"use strict";ne(),ae(),$(),Z(),Pe=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Xe=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),He=(e,t)=>D.sortBasedOnPerm(e,Xe(e.length,t)),Bt=(e,t,r,i)=>{let a=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let s=0;s<t;++s)a+=`a[${e[s]}]=i[${s}];`;return a+="return a;}"},ei=(e,t)=>{let r=[],i=[];for(let a=0;a<e.length;++a)e[a]!==1&&r.push(e[a]),e[t[a]]!==1&&i.push(t[a]);return{newShape:r,newPerm:i}},Hi=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},Re=(e,t)=>{let r=e.dataType,i=e.dims.length,a=Xe(i,t),s=He(e.dims,a),n=e.dims,o=s,u=i<2||Hi(a,e.dims),l;if(u)return l=f=>{let w=C("input",r,n,4),b=j("output",r,o,4);return`
  ${f.registerUniform("output_size","u32").declareVariables(w,b)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let f=D.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(f/64/4)},programUniforms:[{type:12,data:Math.ceil(f/4)}]}},getShaderSource:l};let{newShape:d,newPerm:p}=ei(e.dims,a),h=D.areEqual(p,[2,3,1]),m=D.areEqual(p,[3,1,2]);if(d.length===2||h||m){n=h?[d[0],d[1]*d[2]]:m?[d[0]*d[1],d[2]]:d,o=[n[1],n[0]];let f=16;return l=w=>{let b=C("a",r,n.length),_=j("output",r,o.length);return`
  ${w.registerUniform("output_size","u32").declareVariables(b,_)}
  var<workgroup> tile : array<array<${_.type.value}, ${f+1}>, ${f}>;
  ${w.mainStart([f,f,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${f} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${f}u + local_id.x;
    let input_row = workgroup_id_x * ${f}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${b.getByIndices(`${b.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${f}u + local_id.x;
    let output_row = workgroup_id_y * ${f}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${_.setByIndices(`${_.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let w=D.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(o[1]/f),y:Math.ceil(o[0]/f)},programUniforms:[{type:12,data:w},...k(n,o)]}},getShaderSource:l}}return l=f=>{let w=C("a",r,n.length),b=j("output",r,o.length);return`
  ${f.registerUniform("output_size","u32").declareVariables(w,b)}

  ${Bt(a,i,w,b)}

  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${b.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${b.setByOffset("global_idx",w.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let f=D.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:[{type:12,data:f},...k(n,o)]}},getShaderSource:l}},pt=(e,t)=>{Pe(e.inputs,t.perm),e.compute(Re(e.inputs[0],t.perm))},Ki=e=>g({perm:e.perm})}),$t,ma,vt,Tr,Ue,Ye,ti,Er,Zi,ga,Fe,xt,Zt,Ne,Be,ct,ya,wa,Sn,Tn,En,Oc=I(()=>{"use strict";ne(),ae(),Z(),ss(),we(),$t={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},ma={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},vt={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},Tr={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Ue=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},Ye=(e,t)=>{let r=[],i=e.length;for(let s=0;s<i;s++)t.indexOf(s)===-1&&r.push(e[s]);let a=t.map(s=>e[s]);return[r,a]},ti=(e,t)=>{let r=e.length+t.length,i=[],a=0;for(let s=0;s<r;s++)t.indexOf(s)===-1?i.push(e[a++]):i.push(1);return i},Er=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Zi=(e,t)=>{let r=[];if(!Er(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},ga=(e,t,r,i,a,s,n)=>{let o=r[0].dims,u=D.size(s),l=D.size(n),d=C("_A",r[0].dataType,o),p=j("output",a,s),h=64;u===1&&(h=256);let m=`
          var<workgroup> aBestValues : array<f32, ${h}>;
       `,f=w=>`
        ${w.registerUniform("reduceSize","u32").declareVariables(d,p)}
        ${m}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${w.mainStart(h)}

          let outputIndex = global_idx / ${h};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${vt[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${h}) {
           let candidate = f32(${d.getByOffset("offset + k")});
           bestValue = ${$t[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${h}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${ma[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${p.setByOffset("outputIndex",`${i==="mean"?`${p.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${p.type.storage}(${Tr[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${h}`,inputDependencies:["type"]},getShaderSource:f,getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:u},programUniforms:[{type:12,data:l}]})}},Fe=(e,t,r,i)=>{let a=e.inputs.length===1?r:as(e.inputs,r),s=a.axes;s.length===0&&!a.noopWithEmptyAxes&&(s=e.inputs[0].dims.map((m,f)=>f));let n=D.normalizeAxes(s,e.inputs[0].dims.length),o=n,u=e.inputs[0],l=Zi(o,e.inputs[0].dims.length);l.length>0&&(u=e.compute(Re(e.inputs[0],l),{inputs:[0],outputs:[-1]})[0],o=Ue(o.length,u.dims.length));let[d,p]=Ye(u.dims,o),h=d;a.keepDims&&(h=ti(d,n)),e.compute(ga(t,a.cacheKey,[u],i,e.inputs[0].dataType,h,p),{inputs:[u]})},xt=(e,t)=>{Fe(e,"ReduceMeanShared",t,"mean")},Zt=(e,t)=>{Fe(e,"ReduceL1Shared",t,"l1")},Ne=(e,t)=>{Fe(e,"ReduceL2Shared",t,"l2")},Be=(e,t)=>{Fe(e,"ReduceLogSumExpShared",t,"logSumExp")},ct=(e,t)=>{Fe(e,"ReduceMaxShared",t,"max")},ya=(e,t)=>{Fe(e,"ReduceMinShared",t,"min")},wa=(e,t)=>{Fe(e,"ReduceProdShared",t,"prod")},Sn=(e,t)=>{Fe(e,"ReduceSumShared",t,"sum")},Tn=(e,t)=>{Fe(e,"ReduceSumSquareShared",t,"sumSquare")},En=(e,t)=>{Fe(e,"ReduceLogSumShared",t,"logSum")}}),St,kn,_a,as,Tt,In,zn,Cn,An,On,Rn,Bn,Mn,Dn,Pn,Et,Un,Nn,Ln,qn,Vn,Fn,Wn,Gn,jn,Hn,ss=I(()=>{"use strict";ne(),ae(),$(),Z(),Oc(),St=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},kn=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],_a=(e,t,r,i,a,s,n=!1,o=!1)=>{let u=[],l=r[0].dims,d=l.length,p=D.normalizeAxes(a,d),h=!o&&p.length===0;l.forEach((w,b)=>{h||p.indexOf(b)>=0?n&&u.push(1):u.push(w)});let m=u.length,f=D.size(u);return{name:e,shaderCache:t,getShaderSource:w=>{let b=[],_=C("_A",r[0].dataType,d),y=j("output",s,m),x=i(_,y,p),v=x[2];for(let E=0,A=0;E<d;E++)h||p.indexOf(E)>=0?(n&&A++,v=`for(var j${E}: u32 = 0; j${E} < ${l[E]}; j${E}++) {
                  ${x[2].includes("last_index")?`let last_index = j${E};`:""}
                  ${_.indicesSet("input_indices",E,`j${E}`)}
                  ${v}
                }`):(b.push(`${_.indicesSet("input_indices",E,y.indicesGet("output_indices",A))};`),A++);return`

        ${w.registerUniform("output_size","u32").declareVariables(_,y)}

        ${w.mainStart()}
          ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${_.type.indices};
          let output_indices = ${y.offsetToIndices("global_idx")};

          ${b.join(`
`)}
          ${x[0]}       // init ops for reduce max/min
          ${x[1]}
          ${v}
          ${x[3]}
          ${x.length===4?y.setByOffset("global_idx","value"):x.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:u,dataType:s}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:[{type:12,data:f},...k(l,u)]})}},as=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),g({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Tt=(e,t,r,i)=>{let a=e.inputs,s=a.length===1?r:as(a,r);e.compute(_a(t,{hint:s.cacheKey,inputDependencies:["rank"]},[a[0]],s.noopWithEmptyAxes&&s.axes.length===0?kn:i,s.axes,a[0].dataType,s.keepDims,s.noopWithEmptyAxes),{inputs:[0]})},In=(e,t)=>{St(e.inputs),Tt(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},zn=(e,t)=>{St(e.inputs),Tt(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},Cn=(e,t)=>{St(e.inputs),Tt(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},An=(e,t)=>{St(e.inputs),Tt(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},On=(e,t)=>{St(e.inputs),Tt(e,"ReduceMax",t,(r,i,a)=>{let s=[];for(let n=0;n<r.rank;n++)(a.indexOf(n)>=0||a.length===0)&&s.push(r.indicesSet("input_indices",n,0));return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},Rn=(e,t)=>{St(e.inputs),Tt(e,"ReduceMean",t,(r,i,a)=>{let s=1;for(let n=0;n<r.rank;n++)(a.indexOf(n)>=0||a.length===0)&&(s*=e.inputs[0].dims[n]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${s});`]})},Bn=(e,t)=>{St(e.inputs),Tt(e,"ReduceMin",t,(r,i,a)=>{let s=[];for(let n=0;n<r.rank;n++)(a.indexOf(n)>=0||a.length===0)&&s.push(`input_indices[${n}] = 0;`);return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},Mn=(e,t)=>{St(e.inputs),Tt(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},Dn=(e,t)=>{St(e.inputs),Tt(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},Pn=(e,t)=>{St(e.inputs),Tt(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},Et=(e,t,r)=>{if(t.length===0)return r;let i=1,a=1;for(let s=0;s<t.length;s++)t.indexOf(s)===-1?i*=e[s]:a*=e[s];return a<32&&i>1024},Un=(e,t)=>{Et(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Rn(e,t):xt(e,t)},Nn=(e,t)=>{Et(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?zn(e,t):Zt(e,t)},Ln=(e,t)=>{Et(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Cn(e,t):Ne(e,t)},qn=(e,t)=>{Et(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?An(e,t):Be(e,t)},Vn=(e,t)=>{Et(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?On(e,t):ct(e,t)},Fn=(e,t)=>{Et(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Bn(e,t):ya(e,t)},Wn=(e,t)=>{Et(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Mn(e,t):wa(e,t)},Gn=(e,t)=>{Et(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Dn(e,t):Sn(e,t)},jn=(e,t)=>{Et(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Pn(e,t):Tn(e,t)},Hn=(e,t)=>{Et(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?In(e,t):En(e,t)}}),ns,Kn,Zn,os,Rc=I(()=>{"use strict";ne(),$(),ss(),ns=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},Kn=(e,t)=>{ns(e.inputs);let r=(i,a,s)=>{let n=[];for(let o=0;o<i.rank;o++)(s.indexOf(o)>=0||s.length===0)&&n.push(`input_indices[${o}] = 0;`);return[`${n.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(_a("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Zn=(e,t)=>{ns(e.inputs);let r=(i,a,s)=>{let n=[];for(let o=0;o<i.rank;o++)(s.indexOf(o)>=0||s.length===0)&&n.push(`input_indices[${o}] = 0;`);return[`${n.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(_a("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},os=e=>g(e)}),Qn,ba,Xn,Yn,Jn,Qi,eo,to,us=I(()=>{"use strict";ne(),ae(),Kr(),Z(),Qn=(e,t)=>{let r=e[0],i=e[1],a=e[2],s=e[3],n=e[4],o=e[5];if(n&&o)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let u=r.dims[0],l=r.dims[1],d=r.dims[2];if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==d)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(a.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let p=a.dims[0]/3,h=p,m=h;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let x of t.qkvHiddenSizes)if(x%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");p=t.qkvHiddenSizes[0],h=t.qkvHiddenSizes[1],m=t.qkvHiddenSizes[2]}let f=l;if(p!==h)throw new Error("qkv_hidden_sizes first element should be same as the second");if(a.dims[0]!==p+h+m)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let w=0;if(n){if(h!==m)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(n.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(n.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(n.dims[1]!==u)throw new Error('Input "past" second dimension must be batch_size');if(n.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(n.dims[4]!==h/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(w=n.dims[3])}let b=f+w,_=-1,y=0;if(s)throw new Error("Mask not supported");if(n)throw new Error("past is not supported");if(o){if(o.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(o.dims[0]!==u||o.dims[1]!==t.numHeads||o.dims[2]!==l||o.dims[3]!==b)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:u,sequenceLength:l,pastSequenceLength:w,kvSequenceLength:f,totalSequenceLength:b,maxSequenceLength:_,inputHiddenSize:d,hiddenSize:p,vHiddenSize:m,headSize:Math.floor(p/t.numHeads),vHeadSize:Math.floor(m/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:y,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},ba=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e?.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,Xn=(e,t,r,i,a,s,n,o)=>{let u=R(n?1:s),l=64,d=s/u;d<l&&(l=32);let p=Math.ceil(s/u/l),h=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:a},{type:12,data:d},{type:12,data:p}],m=O(e.dataType,u),f=z(1,u),w=["type"];n&&w.push("type"),o&&w.push("type");let b=_=>{let y=j("x",e.dataType,e.dims,u),x=[y],v=n?C("seq_lens",n.dataType,n.dims):void 0;v&&x.push(v);let E=o?C("total_sequence_length_input",o.dataType,o.dims):void 0;E&&x.push(E);let A=z(e.dataType),B=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${l}>;
  var<workgroup> thread_sum: array<f32, ${l}>;
  ${_.registerUniforms(B).declareVariables(...x)}
  ${_.mainStart([l,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${ba(v,E,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${l}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${n?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${f}(-3.402823e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${f}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(u){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${u}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.402823e+38f);
    for (var i = 0u; i < ${l}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${f}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${f}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(u){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${u}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${l}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${y.type.value}(${A}(1.0) / ${A}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${f}(x[offset + i]);
        x[offset + i] = ${y.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${n?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${y.type.value}(${A}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${l};${m};${u}`,inputDependencies:w},getShaderSource:b,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:a,z:t*r},programUniforms:h})}},Yn=(e,t,r,i,a,s,n,o,u)=>{let l=n+s.kvSequenceLength,d=[s.batchSize,s.numHeads,s.sequenceLength,l],p=e>1&&i,h=s.kvNumHeads?s.kvNumHeads:s.numHeads,m=p?[s.batchSize,h,l,s.headSize]:void 0,f=s.nReps?s.nReps:1,w=s.scale===0?1/Math.sqrt(s.headSize):s.scale,b=R(s.headSize),_=s.headSize/b,y=12,x={x:Math.ceil(l/y),y:Math.ceil(s.sequenceLength/y),z:s.batchSize*s.numHeads},v=[{type:12,data:s.sequenceLength},{type:12,data:_},{type:12,data:l},{type:12,data:s.numHeads},{type:12,data:s.headSize},{type:1,data:w},{type:12,data:n},{type:12,data:s.kvSequenceLength},{type:12,data:f}],E=p&&i&&D.size(i.dims)>0,A=["type","type"];E&&A.push("type"),a&&A.push("type"),o&&A.push("type"),u&&A.push("type");let B=[{dims:d,dataType:t.dataType,gpuDataType:0}];p&&B.push({dims:m,dataType:t.dataType,gpuDataType:0});let L=W=>{let Q=C("q",t.dataType,t.dims,b),de=C("key",r.dataType,r.dims,b),te=[Q,de];if(E){let ie=C("past_key",i.dataType,i.dims,b);te.push(ie)}a&&te.push(C("attention_bias",a.dataType,a.dims));let he=o?C("seq_lens",o.dataType,o.dims):void 0;he&&te.push(he);let Y=u?C("total_sequence_length_input",u.dataType,u.dims):void 0;Y&&te.push(Y);let _e=j("output",t.dataType,d),oe=[_e];p&&oe.push(j("present_key",t.dataType,m,b));let J=z(1,b),Se=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${y}u;

  var<workgroup> tileQ: array<${Q.type.storage}, ${y*y}>;
  var<workgroup> tileK: array<${Q.type.storage}, ${y*y}>;
  ${W.registerUniforms(Se).declareVariables(...te,...oe)}
  ${W.mainStart([y,y,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${f===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${f===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${ba(he,Y,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${E&&p?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${p?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${J}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${E&&p?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${p?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${J}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(b){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${b}`)}})()};
        output[outputIdx] = ${_e.type.value} (sum * uniforms.alpha) + ${a?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${b};${a!==void 0};${i!==void 0};${e}`,inputDependencies:A},getRunData:()=>({outputs:B,dispatchGroup:x,programUniforms:v}),getShaderSource:L}},Jn=(e,t,r,i,a,s,n=void 0,o=void 0)=>{let u=s+a.kvSequenceLength,l=a.nReps?a.nReps:1,d=a.vHiddenSize*l,p=e>1&&i,h=a.kvNumHeads?a.kvNumHeads:a.numHeads,m=p?[a.batchSize,h,u,a.headSize]:void 0,f=[a.batchSize,a.sequenceLength,d],w=12,b={x:Math.ceil(a.vHeadSize/w),y:Math.ceil(a.sequenceLength/w),z:a.batchSize*a.numHeads},_=[{type:12,data:a.sequenceLength},{type:12,data:u},{type:12,data:a.vHeadSize},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:12,data:d},{type:12,data:s},{type:12,data:a.kvSequenceLength},{type:12,data:l}],y=p&&i&&D.size(i.dims)>0,x=["type","type"];y&&x.push("type"),n&&x.push("type"),o&&x.push("type");let v=[{dims:f,dataType:t.dataType,gpuDataType:0}];p&&v.push({dims:m,dataType:t.dataType,gpuDataType:0});let E=A=>{let B=C("probs",t.dataType,t.dims),L=C("v",r.dataType,r.dims),W=[B,L];y&&W.push(C("past_value",i.dataType,i.dims));let Q=n?C("seq_lens",n.dataType,n.dims):void 0;n&&W.push(Q);let de=o?C("total_sequence_length_input",o.dataType,o.dims):void 0;o&&W.push(de);let te=[j("output",t.dataType,f)];p&&te.push(j("present_value",t.dataType,m));let he=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${w}u;
  var<workgroup> tileQ: array<${B.type.value}, ${w*w}>;
  var<workgroup> tileV: array<${B.type.value}, ${w*w}>;
  ${A.registerUniforms(he).declareVariables(...W,...te)}
  ${A.mainStart([w,w,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${l===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${l===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${ba(Q,de,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${y&&p?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${p?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${B.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${y&&p?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${p?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:x},getRunData:()=>({outputs:v,dispatchGroup:b,programUniforms:_}),getShaderSource:E}},Qi=(e,t,r,i,a,s,n,o,u,l,d=void 0,p=void 0)=>{let h=Math.min(e.outputCount,1+(n?1:0)+(o?1:0)),m=h>1?l.pastSequenceLength:0,f=m+l.kvSequenceLength,w=u&&D.size(u.dims)>0?u:void 0,b=[t,r];h>1&&n&&D.size(n.dims)>0&&b.push(n),w&&b.push(w),d&&b.push(d),p&&b.push(p);let _=e.compute(Yn(h,t,r,n,w,l,m,d,p),{inputs:b,outputs:h>1?[-1,1]:[-1]})[0];e.compute(Xn(_,l.batchSize,l.numHeads,m,l.sequenceLength,f,d,p),{inputs:d&&p?[_,d,p]:[_],outputs:[]});let y=[_,i];h>1&&o&&D.size(o.dims)>0&&y.push(o),d&&y.push(d),p&&y.push(p),e.compute(Jn(h,_,i,o,l,m,d,p),{inputs:y,outputs:h>1?[0,2]:[0]})},eo=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,a=t.inputHiddenSize,s=t.headSize,n=12,o={x:Math.ceil(t.headSize/n),y:Math.ceil(t.sequenceLength/n),z:t.batchSize*t.numHeads},u=[e.inputs[0],e.inputs[1],e.inputs[2]],l=[{type:12,data:i},{type:12,data:a},{type:12,data:s},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],d=p=>{let h=j("output_q",u[0].dataType,r),m=j("output_k",u[0].dataType,r),f=j("output_v",u[0].dataType,r),w=C("input",u[0].dataType,u[0].dims),b=C("weight",u[1].dataType,u[1].dims),_=C("bias",u[2].dataType,u[2].dims),y=w.type.storage,x=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${n}u;
  var<workgroup> tileInput: array<${y}, ${n*n}>;
  var<workgroup> tileWeightQ: array<${y}, ${n*n}>;
  var<workgroup> tileWeightK: array<${y}, ${n*n}>;
  var<workgroup> tileWeightV: array<${y}, ${n*n}>;
  ${p.registerUniforms(x).declareVariables(w,b,_,h,m,f)}
  ${p.mainStart([n,n,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${y}(0);
    var valueK = ${y}(0);
    var valueV = ${y}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:o,programUniforms:l}),getShaderSource:d},{inputs:u,outputs:[-1,-1,-1]})},to=(e,t)=>{let r=Qn(e.inputs,t),[i,a,s]=eo(e,r);return Qi(e,i,a,s,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),ro,io,ao,so,Bc=I(()=>{"use strict";je(),ne(),ae(),$(),Z(),ro=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,a,s)=>{let n=a.length;if(n!==i.length)throw new Error(`${s}: num dimensions != ${n}`);a.forEach((o,u)=>{if(o!==i[u])throw new Error(`${s}: dim[${u}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},io=(e,t)=>{let{epsilon:r,spatial:i,format:a}=t,s=e[0].dims,n=i?R(s[s.length-1]):1,o=a==="NHWC"&&s.length>1?n:1,u=D.size(s)/n,l=i,d=l?s.length:s,p=C("x",e[0].dataType,e[0].dims,n),h=C("scale",e[1].dataType,e[1].dims,o),m=C("bias",e[2].dataType,e[2].dims,o),f=C("inputMean",e[3].dataType,e[3].dims,o),w=C("inputVar",e[4].dataType,e[4].dims,o),b=j("y",e[0].dataType,d,n),_=()=>{let x="";if(i)x=`let cOffset = ${s.length===1?"0u":a==="NHWC"?`outputIndices[${s.length-1}] / ${n}`:"outputIndices[1]"};`;else if(a==="NCHW")x=`
            ${b.indicesSet("outputIndices","0","0")}
            let cOffset = ${b.indicesToOffset("outputIndices")};`;else{x=`var cIndices = ${h.type.indices}(0);
                       cIndices[0] = outputIndices[${s.length-1}];`;for(let v=1;v<h.rank;v++)x+=`cIndices[${v}] = outputIndices[${v}];`;x+=`let cOffset = ${h.indicesToOffset("cIndices")};`}return x},y=x=>`
  const epsilon = ${r};
  ${x.registerUniform("outputSize","u32").declareVariables(p,h,m,f,w,b)}
  ${x.mainStart()}
  ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${b.offsetToIndices(`global_idx * ${n}`)};
    ${_()}
    let scale = ${h.getByOffset("cOffset")};
    let bias = ${m.getByOffset("cOffset")};
    let inputMean = ${f.getByOffset("cOffset")};
    let inputVar = ${w.getByOffset("cOffset")};
    let x = ${p.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${b.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${n}`,inputDependencies:l?["rank","type","type","type","type"]:void 0},getShaderSource:y,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l?[{type:12,data:u},...k(s)]:[{type:12,data:u}]})}},ao=e=>g(e),so=(e,t)=>{let{inputs:r,outputCount:i}=e,a=ao({...t,outputCount:i});if(pe.webgpu.validateInputContent&&ro(r,a),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(io(r,a))}}),no,oo,uo,Mc=I(()=>{"use strict";ae(),Z(),no=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},oo=e=>{let t=e[0].dims,r=e[0].dims[2],i=D.size(t)/4,a=e[0].dataType,s=C("input",a,t,4),n=C("bias",a,[r],4),o=C("residual",a,t,4),u=j("output",a,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:l=>`
  const channels = ${r}u / 4;
  ${l.declareVariables(s,n,o,u)}

  ${l.mainStart()}
    ${l.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${s.getByOffset("global_idx")}
      + ${n.getByOffset("global_idx % channels")} + ${o.getByOffset("global_idx")};
    ${u.setByOffset("global_idx","value")}
  }`}},uo=e=>{no(e.inputs),e.compute(oo(e.inputs))}}),lo,xe,po,co,ho,fo,mo,go,yo,wo,_o,bo,$o,vo,xo,So,Xi,To,$a,Eo,ko,Io,zo,Co,Ao,Oo,Ro,Bo,Mo,Do,Po,Uo,No,Lo,qo,ls,Vo,ds,ps,Fo,Wo,Go,jo,Ho,Ko,cs=I(()=>{"use strict";ne(),ae(),$(),Z(),lo=(e,t,r,i,a,s,n)=>{let o=Math.ceil(t/4),u="";typeof a=="string"?u=`${a}(a)`:u=a("a");let l=C("inputData",r,[o],4),d=j("outputData",i,[o],4),p=[{name:"vec_size",type:"u32"}];return n&&p.push(...n),`
      ${e.registerUniforms(p).declareVariables(l,d)}

  ${s??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${l.getByOffset("global_idx")};
    ${d.setByOffset("global_idx",u)}
  }`},xe=(e,t,r,i,a,s=e.dataType,n,o)=>{let u=[{type:12,data:Math.ceil(D.size(e.dims)/4)}];return n&&u.push(...n),{name:t,shaderCache:{hint:a,inputDependencies:["type"]},getShaderSource:l=>lo(l,D.size(e.dims),e.dataType,s,r,i,o),getRunData:l=>({outputs:[{dims:e.dims,dataType:s}],dispatchGroup:{x:Math.ceil(D.size(l[0].dims)/64/4)},programUniforms:u})}},po=e=>{e.compute(xe(e.inputs[0],"Abs","abs"))},co=e=>{e.compute(xe(e.inputs[0],"Acos","acos"))},ho=e=>{e.compute(xe(e.inputs[0],"Acosh","acosh"))},fo=e=>{e.compute(xe(e.inputs[0],"Asin","asin"))},mo=e=>{e.compute(xe(e.inputs[0],"Asinh","asinh"))},go=e=>{e.compute(xe(e.inputs[0],"Atan","atan"))},yo=e=>{e.compute(xe(e.inputs[0],"Atanh","atanh"))},wo=e=>g(e),_o=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(xe(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},bo=e=>{let t,r,i=e.length>=2&&e[1].data!==0,a=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=a?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=a?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return g({min:t,max:r})},$o=(e,t)=>{let r=t||bo(e.inputs),i=z(e.inputs[0].dataType);e.compute(xe(e.inputs[0],"Clip",a=>`clamp(${a}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},vo=e=>{e.compute(xe(e.inputs[0],"Ceil","ceil"))},xo=e=>{e.compute(xe(e.inputs[0],"Cos","cos"))},So=e=>{e.compute(xe(e.inputs[0],"Cosh","cosh"))},Xi=e=>g(e),To=(e,t)=>{let r=z(e.inputs[0].dataType);e.compute(xe(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},$a=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,Eo=e=>{let t=z(e.inputs[0].dataType);e.compute(xe(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,$a(t)))},ko=e=>{e.compute(xe(e.inputs[0],"Exp","exp"))},Io=e=>{e.compute(xe(e.inputs[0],"Floor","floor"))},zo=e=>{let t=z(e.inputs[0].dataType);e.compute(xe(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,$a(t)))},Co=(e,t)=>{let r=z(e.inputs[0].dataType);e.compute(xe(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},Ao=e=>{e.compute(xe(e.inputs[0],"Not",t=>`!${t}`))},Oo=e=>{e.compute(xe(e.inputs[0],"Neg",t=>`-${t}`))},Ro=e=>{e.compute(xe(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},Bo=e=>{let t=z(e.inputs[0].dataType);e.compute(xe(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},Mo=e=>{e.compute(xe(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},Do=e=>g(e),Po=(e,t)=>{let r=z(e.inputs[0].dataType);e.compute(xe(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},Uo=e=>{e.compute(xe(e.inputs[0],"Sin","sin"))},No=e=>{e.compute(xe(e.inputs[0],"Sinh","sinh"))},Lo=e=>{e.compute(xe(e.inputs[0],"Sqrt","sqrt"))},qo=e=>{e.compute(xe(e.inputs[0],"Tan","tan"))},ls=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,Vo=e=>{e.compute(xe(e.inputs[0],"Tanh",ls))},ds=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${ls("v")};
}
`,ps=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,Fo=e=>{let t=z(e.inputs[0].dataType);e.compute(xe(e.inputs[0],"FastGelu",ps,ds(t),void 0,e.inputs[0].dataType))},Wo=(e,t)=>{let r=z(e.inputs[0].dataType);return e.compute(xe(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},Go=e=>{e.compute(xe(e.inputs[0],"Log","log"))},jo=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,Ho=e=>`quick_gelu_impl(${e})`,Ko=(e,t)=>{let r=z(e.inputs[0].dataType);e.compute(xe(e.inputs[0],"QuickGelu",Ho,jo(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),Zo,Qo,Xo,Dc=I(()=>{"use strict";ae(),Z(),cs(),Zo=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Qo=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=C("input",e[0].dataType,e[0].dims,4),i=C("bias",e[0].dataType,[e[0].dims[2]],4),a=j("output",e[0].dataType,t,4),s=D.size(t)/4,n=O(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)}}),getShaderSource:o=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${o.declareVariables(r,i,a)}

  ${$a(n)}

  ${o.mainStart()}
    ${o.guardAgainstOutOfBoundsWorkgroupSizes(s)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${a.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},Xo=e=>{Zo(e.inputs),e.compute(Qo(e.inputs))}}),Yo,Jo,kt,eu,tu,ru,iu,au,su,nu,ou,uu,lu,Pc=I(()=>{"use strict";ne(),ae(),Z(),Yo=(e,t,r,i,a,s,n,o,u,l,d,p)=>{let h,m;typeof o=="string"?h=m=(y,x)=>`${o}((${y}),(${x}))`:typeof o=="function"?h=m=o:(h=o.scalar,m=o.vector);let f=j("outputData",d,i.length,4),w=C("aData",u,t.length,4),b=C("bData",l,r.length,4),_;if(a)if(s){let y=D.size(t)===1,x=D.size(r)===1,v=t.length>0&&t[t.length-1]%4===0,E=r.length>0&&r[r.length-1]%4===0;y||x?_=f.setByOffset("global_idx",m(y?`${w.type.value}(${w.getByOffset("0")}.x)`:w.getByOffset("global_idx"),x?`${b.type.value}(${b.getByOffset("0")}.x)`:b.getByOffset("global_idx"))):_=`
            let outputIndices = ${f.offsetToIndices("global_idx * 4u")};
            let offsetA = ${w.broadcastedIndicesToOffset("outputIndices",f)};
            let offsetB = ${b.broadcastedIndicesToOffset("outputIndices",f)};
            ${f.setByOffset("global_idx",m(n||v?w.getByOffset("offsetA / 4u"):`${w.type.value}(${w.getByOffset("offsetA / 4u")}[offsetA % 4u])`,n||E?b.getByOffset("offsetB / 4u"):`${b.type.value}(${b.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else _=f.setByOffset("global_idx",m(w.getByOffset("global_idx"),b.getByOffset("global_idx")));else{if(!s)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let y=(x,v,E="")=>{let A=`aData[indexA${v}][componentA${v}]`,B=`bData[indexB${v}][componentB${v}]`;return`
            let outputIndices${v} = ${f.offsetToIndices(`global_idx * 4u + ${v}u`)};
            let offsetA${v} = ${w.broadcastedIndicesToOffset(`outputIndices${v}`,f)};
            let offsetB${v} = ${b.broadcastedIndicesToOffset(`outputIndices${v}`,f)};
            let indexA${v} = offsetA${v} / 4u;
            let indexB${v} = offsetB${v} / 4u;
            let componentA${v} = offsetA${v} % 4u;
            let componentB${v} = offsetB${v} % 4u;
            ${x}[${v}] = ${E}(${h(A,B)});
          `};d===9?_=`
            var data = vec4<u32>(0);
            ${y("data",0,"u32")}
            ${y("data",1,"u32")}
            ${y("data",2,"u32")}
            ${y("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:_=`
            ${y("outputData[global_idx]",0)}
            ${y("outputData[global_idx]",1)}
            ${y("outputData[global_idx]",2)}
            ${y("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(w,b,f)}

        ${p??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${_}
      }`},Jo=(e,t,r,i,a,s,n=r.dataType)=>{let o=r.dims.map(w=>Number(w)??1),u=i.dims.map(w=>Number(w)??1),l=!D.areEqual(o,u),d=o,p=D.size(o),h=!1,m=!1,f=[l];if(l){let w=At.calcShape(o,u,!1);if(!w)throw new Error("Can't perform binary op on the given tensors");d=w.slice(),p=D.size(d);let b=D.size(o)===1,_=D.size(u)===1,y=o.length>0&&o[o.length-1]%4===0,x=u.length>0&&u[u.length-1]%4===0;f.push(b),f.push(_),f.push(y),f.push(x);let v=1;for(let E=1;E<d.length;E++){let A=o[o.length-E],B=u[u.length-E];if(A===B)v*=A;else break}v%4===0?(m=!0,h=!0):(b||_||y||x)&&(h=!0)}else h=!0;return f.push(h),{name:e,shaderCache:{hint:t+f.map(w=>w.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:w=>Yo(w,o,u,d,h,l,m,a,r.dataType,i.dataType,n,s),getRunData:()=>({outputs:[{dims:d,dataType:n}],dispatchGroup:{x:Math.ceil(p/64/4)},programUniforms:[{type:12,data:Math.ceil(D.size(d)/4)},...k(o,u,d)]})}},kt=(e,t,r,i,a,s)=>{e.compute(Jo(t,a??"",e.inputs[0],e.inputs[1],r,i,s))},eu=e=>{kt(e,"Add",(t,r)=>`${t}+${r}`)},tu=e=>{kt(e,"Div",(t,r)=>`${t}/${r}`)},ru=e=>{kt(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},iu=e=>{kt(e,"Mul",(t,r)=>`${t}*${r}`)},au=e=>{let t=C("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;kt(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},su=e=>{kt(e,"Sub",(t,r)=>`${t}-${r}`)},nu=e=>{kt(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},ou=e=>{kt(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},uu=e=>{kt(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},lu=e=>{kt(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),du,pu,cu,hu,fu,mu,Uc=I(()=>{"use strict";ne(),ae(),$(),Z(),du=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],a=i.dataType,s=i.dims.length;e.forEach((n,o)=>{if(o!==r){if(n.dataType!==a)throw new Error("input tensors should be one type");if(n.dims.length!==s)throw new Error("input tensors should have the same shape");n.dims.forEach((u,l)=>{if(l!==t&&u!==i.dims[l])throw new Error("non concat dimensions must match")})}})},pu=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,cu=(e,t)=>{let r=e.length,i=[];for(let a=0;a<r;++a){let s=t.setByOffset("global_idx",e[a].getByIndices("indices"));r===1?i.push(s):a===0?i.push(`if (inputIndex == ${a}u) { ${s} }`):a===r-1?i.push(`else { ${s} }`):i.push(`else if (inputIndex == ${a}) { ${s} }`)}return i.join(`
`)},hu=(e,t,r,i)=>{let a=D.size(r),s=new Array(e.length),n=new Array(e.length),o=0,u=[],l=[],d=[{type:12,data:a}];for(let w=0;w<e.length;++w)o+=e[w].dims[t],s[w]=o,l.push(e[w].dims.length),n[w]=C(`input${w}`,i,l[w]),u.push("rank"),d.push({type:12,data:s[w]});for(let w=0;w<e.length;++w)d.push(...k(e[w].dims));d.push(...k(r));let p=j("output",i,r.length),h=p.indicesGet("indices",t),m=Array.from(Array(s.length).keys()).map(w=>`uniforms.sizeInConcatAxis${w}`).join(","),f=w=>`

  ${(()=>{w.registerUniform("outputSize","u32");for(let b=0;b<e.length;b++)w.registerUniform(`sizeInConcatAxis${b}`,"u32");return w.declareVariables(...n,p)})()}

  ${pu(s.length,m)}

  ${w.mainStart()}
    ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${p.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${h});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${s.length}u>(${m});
      ${h} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${cu(n,p)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:d}),getShaderSource:f}},fu=(e,t)=>{let r=e.inputs,i=r[0].dims,a=D.normalizeAxis(t.axis,i.length);du(r,a);let s=i.slice();s[a]=r.reduce((o,u)=>o+(u.dims.length>a?u.dims[a]:0),0);let n=r.filter(o=>D.size(o.dims)>0);e.compute(hu(n,a,s,r[0].dataType),{inputs:n})},mu=e=>g({axis:e.axis})}),kr,Ir,zr,hs,Cr=I(()=>{"use strict";ne(),ae(),kr=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Ir=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},zr=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},hs=e=>{let t=e?.activation||"";if(t==="HardSigmoid"){let[r,i]=e?.activation_params||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=e?.activation_params||[Ni,_t];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=e?.activation_params||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Ke,gu,fs=I(()=>{"use strict";Ke=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},gu=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),yu,Nc=I(()=>{"use strict";yu=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),Yi,ms,gs=I(()=>{"use strict";ne(),ae(),Z(),Cr(),Yi=(e,t,r,i,a)=>{let s=i-r;return`
      ${Array.from({length:r}).map((n,o)=>`
      if (${M(t.shape,o,t.rank)} != 1) {
        ${t.indicesSet(e,o,M(a,o+s,i))}
      } else {
        ${t.indicesSet(e,o,0)}
      }`).join("")}
`},ms=(e,t,r,i,a=!1,s)=>{let n=e[0].dims,o=e[1].dims,u=n[n.length-2],l=o[o.length-1],d=n[n.length-1],p=R(l),h=R(d),m=R(u),f=D.size(r)/p/m,w=e.length>2,b=i?i.slice(0,-2):r.slice(0,-2),_=[D.size(b),u,l],y=[{type:12,data:f},{type:12,data:u},{type:12,data:l},{type:12,data:d}];Ir(t,y),y.push(...k(b,n,o)),w&&y.push(...k(e[2].dims)),y.push(...k(_));let x=v=>{let E=ce("batch_dims",e[0].dataType,b.length),A=C("a",e[0].dataType,n.length,h),B=C("b",e[1].dataType,o.length,p),L=j("output",e[0].dataType,_.length,p),W=O(L.type.tensor),Q=kr(t,L.type.value,W),de=[A,B],te="";if(w){let _e=a?p:1;de.push(C("bias",e[2].dataType,e[2].dims.length,_e)),te=`${a?`value += bias[col / ${_e}];`:`value += ${L.type.value}(bias[row + i]);`}`}let he=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];zr(t,he);let Y=()=>{let _e=`var a_data: ${A.type.value};`;for(let oe=0;oe<h;oe++)_e+=`
              let b_data${oe} = b[(b_offset + (k + ${oe}) * uniforms.N + col) / ${p}];`;for(let oe=0;oe<m;oe++){_e+=`a_data = a[(a_offset + (row + ${oe}) * uniforms.K + k) / ${h}];`;for(let J=0;J<h;J++)_e+=`
            values[${oe}] = fma(${B.type.value}(a_data${h===1?"":`[${J}]`}), b_data${J}, values[${oe}]);
`}return _e};return`
  ${v.registerUniforms(he).registerInternalVariables(E).declareVariables(...de,L)}
  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${p})) * ${p};
    var index1 = global_idx / (uniforms.N / ${p});
    let stride1 = uniforms.M / ${m};
    let row = (index1 % stride1) * ${m};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${E.offsetToIndices("batch")};`}

    var a_indices: ${A.type.indices};
    ${Yi("a_indices",A,A.rank-2,E.rank,"batch_indices")}
    ${A.indicesSet("a_indices",A.rank-2,0)}
    ${A.indicesSet("a_indices",A.rank-1,0)}
    let a_offset = ${A.indicesToOffset("a_indices")};

    var b_indices: ${B.type.indices};
    ${Yi("b_indices",B,B.rank-2,E.rank,"batch_indices")}
    ${B.indicesSet("b_indices",B.rank-2,0)}
    ${B.indicesSet("b_indices",B.rank-1,0)}
    let b_offset = ${B.indicesToOffset("b_indices")};
    var values: array<${L.type.value}, ${m}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${h}) {
      ${Y()}
    }
    for (var i = 0u; i < ${m}u; i++) {
      var value = values[i];
      ${te}
      ${Q}
      let cur_indices = ${L.type.indices}(batch, row + i, col);
      let offset = ${L.indicesToOffset("cur_indices")};
      ${L.setByOffset(`offset / ${p}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${p};${h};${m};${a}`,inputDependencies:w?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:s?s(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:y}),getShaderSource:x}}}),wu,_u,ys,ws,bu,_s,$u,va,bs=I(()=>{"use strict";ne(),ae(),Z(),Cr(),gs(),fs(),wu=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,_u=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,ys=(e,t,r="f32",i,a=!1,s=32,n=!1,o=32)=>{let u=t[1]*e[1],l=t[0]*e[0],d=a?u:s,p=a?s:u,h=d/t[0],m=s/t[1];if(!((a&&h===4&&e[1]===4||!a&&(h===3||h===4))&&d%t[0]===0&&s%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${a} is true, innerElementSize ${h} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${h} must be 3 or 4.
  tileAWidth ${d} must be divisible by workgroupSize[0]${t[0]}. tileInner ${s} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${h}<${r}>, ${d/h}>, ${p}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${l/e[0]}>, ${s}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${h};
const tileInner = ${s};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${n?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${u};

  let num_tiles = ${n?`${Math.ceil(o/s)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${n?`i32(globalId.z) * ${o}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${m};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${wu(a,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${m}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${h===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${_u(a,h)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},ws=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,bu=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",_s=(e,t,r="f32",i,a=!1,s=32,n=!1,o=32,u=!1)=>{let l=e[1]*t[1],d=e[0]*t[0],p=a?l:s,h=a?s:l;if(!(h%t[1]===0&&p%t[0]===0&&s%t[1]===0))throw new Error(`tileAHight ${h} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${p} must be divisible by workgroupSize[0]${t[0]}, tileInner ${s} must be divisible by workgroupSize[1]${t[1]}`);let m=h/t[1],f=p/t[0],w=s/t[1],b=u?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${l};
    let globalColStart = i32(workgroupId.x) * ${d};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${h}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${p}; inputCol = inputCol + ${t[0]}) {
          ${ws(a,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${s}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${d}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${a?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${l};

let tileRowA = i32(localId.y) * ${m};
let tileColA = i32(localId.x) * ${f};
let tileRowB = i32(localId.y) * ${w};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${m}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${f}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${ws(a,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${w}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${bu(a)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${p}>, ${h}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${d}>, ${s}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${s};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${n?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${n?`${Math.ceil(o/s)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${n?`i32(globalId.z) * ${o}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${b}
  }
`},$u=(e,t,r,i,a=!1)=>{let[s,n,o,u]=i,l=O(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${s.type.indices}) -> ${Ke(e,l)} {
      var value = ${Ke(e,l)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${n.type.indices};
        ${Yi("aIndices",n,n.rank-2,s.rank,"batchIndices")}
        ${n.indicesSet("aIndices",n.rank-2,"u32(row)")}
        ${n.indicesSet("aIndices",n.rank-1,"u32(colIn)")}
        value = ${n.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${s.type.indices}) -> ${Ke(e,l)} {
      var value = ${Ke(e,l)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${o.type.indices};
        ${Yi("bIndices",o,o.rank-2,s.rank,"batchIndices")}
        ${o.indicesSet("bIndices",o.rank-2,"u32(row)")}
        ${o.indicesSet("bIndices",o.rank-1,"u32(colIn)")}
        value = ${o.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Ke(e,l)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${a?"bias[colIn]":`${Ke(e,l)}(bias[row])`};`:""}
        ${r}
        ${u.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},va=(e,t,r,i,a=!1,s)=>{let n=e[0].dims,o=e[1].dims,u=n.slice(0,-2),l=o.slice(0,-2),d=i?i.slice(0,-2):r.slice(0,-2),p=D.size(d),h=n[n.length-2],m=n[n.length-1],f=o[o.length-1],w=m%4===0&&f%4===0,b=h<=8?[4,1,1]:[4,4,1],_=[8,8,1],y=[Math.ceil(f/_[0]/b[0]),Math.ceil(h/_[1]/b[1]),Math.ceil(p/_[2]/b[2])],x=w?4:1,v=[...u,h,m/x],E=v.length,A=[...l,m,f/x],B=A.length,L=[p,h,f/x],W=[{type:6,data:h},{type:6,data:f},{type:6,data:m}];Ir(t,W),W.push(...k(d,v,A));let Q=["rank","rank"],de=e.length>2;de&&(W.push(...k(e[2].dims)),Q.push("rank")),W.push(...k(L));let te=he=>{let Y=d.length,_e=ce("batchDims",e[0].dataType,Y,1),oe=O(e[0].dataType),J=C("a",e[0].dataType,E,x),Se=C("b",e[1].dataType,B,x),ie=j("result",e[0].dataType,L.length,x),Ae=[J,Se];if(de){let Ze=a?x:1;Ae.push(C("bias",e[2].dataType,e[2].dims.length,Ze))}let G=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];zr(t,G);let X=O(ie.type.tensor),ge=kr(t,ie.type.value,X),ke=$u(x,de,ge,[_e,J,Se,ie],a);return`
  ${he.registerUniforms(G).registerInternalVariables(_e).declareVariables(...Ae,ie)}
  ${ke}
  ${w?ys(b,_,oe,_e):_s(b,_,oe,_e)}
                   `};return{name:"MatMul",shaderCache:{hint:`${b};${t.activation};${w};${a}`,inputDependencies:Q},getRunData:()=>({outputs:[{dims:s?s(r):r,dataType:e[0].dataType}],dispatchGroup:{x:y[0],y:y[1],z:y[2]},programUniforms:W}),getShaderSource:te}}}),vu,xu,Lc=I(()=>{"use strict";ne(),ut(),Z(),Cr(),fs(),Nc(),bs(),vu=(e,t,r,i,a=!1,s,n=4,o=4,u=4,l="f32")=>{let d=W=>{switch(W){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${l}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${W} is not supported.`)}},p=W=>{switch(W){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${W} is not supported.`)}},h=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,m=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,f=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",w=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",b=e?"row":"col",_=e?"col":"row",y=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${b} / outWidth;
    let outCol = ${b} % outWidth;

    let WRow = ${_} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${_} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${_} % inChannels;
    var resData = ${Ke(n,l)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${f} && xCol >= 0 && xCol < ${w}) {
      ${h}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${d(n)}
    }
    return resData;`,x=e?t&&i?`
    let col = colIn * ${n};
    ${y}`:`
    let col = colIn * ${n};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${y}
    }
    return ${Ke(n,l)}(0.0);`:i&&r?`
    let col = colIn * ${n};
    ${y}`:`
    let col = colIn * ${n};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${y}
    }
    return ${Ke(n,l)}(0.0);`,v=e?i&&r?p(o):`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${p(o)}
    }
    return ${Ke(o,l)}(0.0);`:`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${p(o)}
    }
    return ${Ke(o,l)}(0.0);`,E=Ke(u,l),A=Ke(e?n:o,l),B=Ke(e?o:n,l),L=kr(s,E,l);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${A} {
      ${e?x:v}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${B} {
      ${e?v:x}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${E}) {
      let col = colIn * ${u};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${m}
      ${gu(a)}
      ${L}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},xu=(e,t,r,i,a,s,n,o,u)=>{let l=t.format==="NHWC",d=l?e[0].dims[3]:e[0].dims[1],p=r[0],h=l?r[2]:r[3],m=l?r[1]:r[2],f=l?r[3]:r[1],w=l&&(d%4===0||d%3===0)&&f%4===0,b=l?f:h*m,_=l?h*m:f,y=[8,8,1],x=i<=8?[4,1,1]:[4,4,1],v=[Math.ceil(b/y[0]/x[0]),Math.ceil(_/y[1]/x[1]),Math.ceil(p/y[2]/x[2])];be("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${v}`);let E=w?l&&d%4!==0?3:4:1,A=y[1]*x[1],B=y[0]*x[0],L=Math.max(y[0]*E,y[1]),W=i%A===0,Q=a%B===0,de=s%L===0,te=w?[E,4,4]:[1,1,1],he=[{type:6,data:i},{type:6,data:a},{type:6,data:s},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Ir(t,he),he.push(...k(e[0].dims,e[1].dims));let Y=["rank","rank"];n&&(he.push(...k(e[2].dims)),Y.push("rank")),he.push(...k(r));let _e=oe=>{let J=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];zr(t,J);let Se=w?4:1,ie=O(e[0].dataType),Ae=`
      fn setOutputAtIndex(flatIndex : i32, value : ${w?`vec4<${ie}>`:ie}) {
        result[flatIndex] = ${w?`vec4<${ie}>`:ie}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${w?`vec4<${ie}>`:ie}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${w?"/ 4":""}, value);
      }`,G=C("x",e[0].dataType,e[0].dims.length,E===3?1:E),X=C("w",e[1].dataType,e[1].dims.length,Se),ge=[G,X],ke=j("result",e[0].dataType,r.length,Se);if(n){let Ze=C("bias",e[2].dataType,e[2].dims.length,Se);ge.push(Ze),Ae+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${w?`vec4<${ie}>`:ie} {
          return bias[coords.${l?"w":"y"}${w?"/ 4":""}];
        }`}return`
        ${yu("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${oe.registerUniforms(J).declareVariables(...ge,ke)}
        ${Ae}
        ${vu(l,W,Q,de,n,t,te[0],te[1],te[2],ie)}
        ${w?ys(x,y,ie,void 0,!l,L):_s(x,y,ie,void 0,!l,L,!1,void 0,o)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${E};${w};${W};${Q};${de};${A};${B};${L}`,inputDependencies:Y},getRunData:()=>({outputs:[{dims:u?u(r):r,dataType:e[0].dataType}],dispatchGroup:{x:v[0],y:v[1],z:v[2]},programUniforms:he}),getShaderSource:_e}}}),Su,$s,Ji,Tu,vs,Eu,ku,Iu,qc=I(()=>{"use strict";ne(),ut(),ae(),Z(),Cr(),fs(),Su=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},$s=e=>typeof e=="number"?[e,e,e]:e,Ji=(e,t)=>t<=1?e:e+(e-1)*(t-1),Tu=(e,t,r,i=1)=>{let a=Ji(t,i);return Math.floor((e[0]*(r-1)-r+a)/2)},vs=(e,t,r,i,a)=>{a==null&&(a=Tu(e,t[0],i[0]));let s=[0,0,0,r];for(let n=0;n<3;n++)e[n]+2*a>=t[n]&&(s[n]=Math.trunc((e[n]-t[n]+2*a)/i[n]+1));return s},Eu=(e,t,r,i,a,s,n,o,u,l)=>{let d,p,h,m;if(e==="VALID"&&(e=0),typeof e=="number"){d={top:e,bottom:e,left:e,right:e,front:e,back:e};let f=vs([t,r,i,1],[o,u,l],1,[a,s,n],e);p=f[0],h=f[1],m=f[2]}else if(Array.isArray(e)){if(!e.every((w,b,_)=>w===_[0]))throw Error(`Unsupported padding parameter: ${e}`);d={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let f=vs([t,r,i,1],[o,u,l],1,[a,s,n],e[0]);p=f[0],h=f[1],m=f[2]}else if(e==="SAME_UPPER"){p=Math.ceil(t/a),h=Math.ceil(r/s),m=Math.ceil(i/n);let f=(p-1)*a+o-t,w=(h-1)*s+u-r,b=(m-1)*n+l-i,_=Math.floor(f/2),y=f-_,x=Math.floor(w/2),v=w-x,E=Math.floor(b/2),A=b-E;d={top:x,bottom:v,left:E,right:A,front:_,back:y}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:d,outDepth:p,outHeight:h,outWidth:m}},ku=(e,t,r,i,a,s=!1,n="channelsLast")=>{let o,u,l,d,p;if(n==="channelsLast")[o,u,l,d,p]=e;else if(n==="channelsFirst")[o,p,u,l,d]=e;else throw new Error(`Unknown dataFormat ${n}`);let[h,,m,f,w]=t,[b,_,y]=$s(r),[x,v,E]=$s(i),A=Ji(m,x),B=Ji(f,v),L=Ji(w,E),{padInfo:W,outDepth:Q,outHeight:de,outWidth:te}=Eu(a,u,l,d,b,_,y,A,B,L),he=s?h*p:h,Y=[0,0,0,0,0];return n==="channelsFirst"?Y=[o,he,Q,de,te]:n==="channelsLast"&&(Y=[o,Q,de,te,he]),{batchSize:o,dataFormat:n,inDepth:u,inHeight:l,inWidth:d,inChannels:p,outDepth:Q,outHeight:de,outWidth:te,outChannels:he,padInfo:W,strideDepth:b,strideHeight:_,strideWidth:y,filterDepth:m,filterHeight:f,filterWidth:w,effectiveFilterDepth:A,effectiveFilterHeight:B,effectiveFilterWidth:L,dilationDepth:x,dilationHeight:v,dilationWidth:E,inShape:e,outShape:Y,filterShape:t}},Iu=(e,t,r,i,a,s)=>{let n=s==="channelsLast",o=n?e[0].dims[3]:e[0].dims[1],u=!1,l=[64,1,1],d={x:r.map((y,x)=>x)},p=[Math.ceil(Su(d.x.map(y=>r[y]))/l[0]),1,1];be("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${p}`);let h=u?n&&o%4!==0?3:4:1,m=D.size(r),f=[{type:12,data:m},{type:12,data:i},{type:12,data:a},{type:12,data:t.strides},{type:12,data:t.dilations}];Ir(t,f),f.push(...k(e[0].dims,e[1].dims));let w=["rank","rank"],b=e.length===3;b&&(f.push(...k(e[2].dims)),w.push("rank")),f.push(...k(r));let _=y=>{let x=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:a.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];zr(t,x);let v=u?4:1,E=O(e[0].dataType),A=C("x",e[0].dataType,e[0].dims.length,h===3?1:h),B=C("W",e[1].dataType,e[1].dims.length,v),L=[A,B],W=j("result",e[0].dataType,r.length,v),Q="";if(b){let he=C("bias",e[2].dataType,e[2].dims.length,v);L.push(he),Q+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${u?`vec4<${E}>`:E} {
          return bias[${n?M("coords",4,5):M("coords",1,5)}${u?"/ 4":""}];
        }`}let de=Ke(h,E),te=kr(t,de,E);return`
            ${Q}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${A.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${B.getByIndices("aIndices")};
            }
          ${y.registerUniforms(x).declareVariables(...L,W)}
          ${y.mainStart()}
          ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${W.offsetToIndices("global_idx")};
              let batch = ${M("coords",0,A.rank)};
              let d2 = ${n?M("coords",A.rank-1,A.rank):M("coords",1,A.rank)};
              let xFRCCorner = vec3<u32>(${n?M("coords",1,A.rank):M("coords",2,A.rank)},
              ${n?M("coords",2,A.rank):M("coords",3,A.rank)},
              ${n?M("coords",3,A.rank):M("coords",4,A.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${n?M("uniforms.x_shape",1,A.rank):M("uniforms.x_shape",2,A.rank)};
              let xShapeZ = ${n?M("uniforms.x_shape",2,A.rank):M("uniforms.x_shape",3,A.rank)};
              let xShapeW = ${n?M("uniforms.x_shape",3,A.rank):M("uniforms.x_shape",4,A.rank)};
              let xShapeU = ${n?M("uniforms.x_shape",4,A.rank):M("uniforms.x_shape",1,A.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${n?`let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${n?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${n?`let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${n?`let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${b?"value = value + getBiasByOutputCoords(coords)":""};
              ${te}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${n};${h};${b}`,inputDependencies:w},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:p[0],y:p[1],z:p[2]},programUniforms:f}),getShaderSource:_}}}),zu,Cu,Vc=I(()=>{"use strict";ne(),ae(),Z(),Cr(),zu=(e,t,r,i)=>{let a=e.length>2,s=a?"value += b[output_channel];":"",n=e[0].dims,o=e[1].dims,u=t.format==="NHWC",l=u?r[3]:r[1],d=l/t.group,p=u&&d>=4?R(l):1,h=D.size(r)/p,m=[{type:12,data:h},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:d}];Ir(t,m),m.push(...k(n,[o[0],o[1],o[2],o[3]/p]));let f=a?["rank","rank","rank"]:["rank","rank"];m.push(...k([r[0],r[1],r[2],r[3]/p]));let w=b=>{let _=j("output",e[0].dataType,r.length,p),y=O(_.type.tensor),x=kr(t,_.type.value,y),v=C("x",e[0].dataType,n.length),E=C("w",e[1].dataType,o.length,p),A=[v,E];a&&A.push(C("b",e[2].dataType,e[2].dims,p));let B=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];zr(t,B);let L=u?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${v.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${E.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${v.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${E.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${b.registerUniforms(B).declareVariables(...A,_)}

  ${b.mainStart()}
    ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${_.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${u?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${u?1:2}], outputIndices[${u?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${p} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${u?2:1}];

    var value: ${_.type.value} = ${_.type.value}(0);
    ${L}
    ${s}
    ${x}
    ${_.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${p}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:m}),getShaderSource:w}},Cu=(e,t,r,i)=>{let a=e.length>2,s=R(r[3]),n=R(r[2]),o=D.size(r)/s/n,u=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/s],l=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/s],d=[r[0],r[1],r[2],r[3]/s],p=[{type:12,data:o},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Ir(t,p),p.push(...k(u,l,d));let h=(n-1)*t.strides[1]+l[1],m=f=>{let w=j("output",e[0].dataType,d.length,s),b=O(w.type.tensor),_=kr(t,w.type.value,b),y=C("x",e[0].dataType,u.length,s),x=C("w",e[1].dataType,l.length,s),v=[y,x];a&&v.push(C("b",e[2].dataType,e[2].dims,s));let E=a?"value += b[output_channel];":"",A=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return zr(t,A),`
  ${f.registerUniforms(A).declareVariables(...v,w)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${n}u;
    let col = (index1 % width1) * ${n}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${y.type.value}, ${h}>;
    var values: array<${w.type.value}, ${n}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${l[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${h}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${y.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${y.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${l[1]}; w_width++) {
          let w_val = ${x.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${n}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${n}u; i++) {
      var value = values[i];
      ${E}
      ${_}
      ${w.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${s};${n};${h};${l[0]};${l[1]}`,inputDependencies:a?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:p}),getShaderSource:m}}}),Au,xa,Ou,Sa,xs,Ss,Ru,Bu,Ts,Fc=I(()=>{"use strict";ae(),Lc(),qc(),bs(),Vc(),Cr(),gs(),we(),Au=(e,t,r,i,a,s)=>{let n=e[0],o=e.slice(s?1:2,s?3:4),u=o.length,l=t[0],d=t.slice(2).map((h,m)=>h+(h-1)*(r[m]-1)),p=o.map((h,m)=>h+i[m]+i[m+u]).map((h,m)=>Math.floor((h-d[m]+a[m])/a[m]));return p.splice(0,0,n),p.splice(s?3:1,0,l),p},xa=[2,3,1,0],Ou=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Sa=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let s=2;s<t[1].dims.length;++s)r[s-2]===0&&(r[s-2]=t[1].dims[s]);let i=e.pads.slice();Gt.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let a=Object.assign({},e);return Object.assign(a,{kernelShape:r,pads:i}),a},xs=e=>{let t=hs(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],a=e.dilations,s=e.group,n=e.kernel_shape,o=e.pads,u=e.strides,l=e.w_is_const();return{autoPad:i,format:r,dilations:a,group:s,kernelShape:n,pads:o,strides:u,wIsConst:l,...t,cacheKey:`${e.format};${t.activation};`}},Ss=(e,t,r,i)=>{let a=r.format==="NHWC",s=Au(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,a);if(r.group!==1){let A=[t[0]];if(a){let B=e.kernelCustomData.wT??e.compute(Re(t[1],xa),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=B),A.push(B)}else A.push(t[1]);t.length===3&&A.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&a&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(Cu(A,r,s,i),{inputs:A}):e.compute(zu(A,r,s,i),{inputs:A});return}let n=t.length===3,o=t[0].dims[a?1:2],u=t[0].dims[a?2:3],l=t[0].dims[a?3:1],d=t[1].dims[2],p=t[1].dims[3],h=s[a?1:2],m=s[a?2:3],f=s[a?3:1],w=a&&d===o&&p===u&&r.pads[0]===0&&r.pads[1]===0;if(w||d===1&&p===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let A=s[0],B,L,W,Q=[];if(a){let he=e.kernelCustomData.wT??e.compute(Re(t[1],xa),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=he),w){let Y=o*u*l;B=t[0].reshape([1,A,Y]),L=he.reshape([1,Y,f]),W=[1,A,f]}else B=t[0].reshape([A,o*u,l]),L=he.reshape([1,l,f]),W=[A,h*m,f];Q.push(B),Q.push(L)}else B=t[0].reshape([A,l,o*u]),L=t[1].reshape([1,f,l]),W=[A,f,h*m],Q.push(L),Q.push(B);n&&Q.push(t[2]);let de=W[2],te=Q[0].dims[Q[0].dims.length-1];de<8&&te<8?e.compute(ms(Q,r,s,W,a,i),{inputs:Q}):e.compute(va(Q,r,s,W,a,i),{inputs:Q});return}let b=!0,_=e.kernelCustomData.wT??e.compute(Re(t[1],xa),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=_);let y=[t[0],_];n&&y.push(t[2]);let x=a?h*m:f,v=a?f:h*m,E=d*p*l;e.compute(xu(y,r,s,x,v,E,n,b,i),{inputs:y})},Ru=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=[0,t.pads[0],0,t.pads[1]],s=[1].concat(t.strides),n=[1].concat(t.dilations),o=[1].concat(t.kernelShape),u=Sa({...t,pads:a,strides:s,dilations:n,kernelShape:o},i);Ss(e,i,u,l=>r?[l[0],l[2],l[3]]:[l[0],l[1],l[3]])},Bu=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",a=Sa(r,t),s=r.autoPad==="NOTSET"?r.pads:r.autoPad,n=ku(t[0].dims,t[1].dims,r.strides,r.dilations,s,!1,i);e.compute(Iu(t,a,n.outShape,[n.filterDepth,n.filterHeight,n.filterWidth],[n.padInfo.front,n.padInfo.top,n.padInfo.left],i))},Ts=(e,t)=>{if(Ou(e.inputs,t),e.inputs[0].dims.length===3)Ru(e,t);else if(e.inputs[0].dims.length===5)Bu(e,e.inputs,t);else{let r=Sa(t,e.inputs);Ss(e,e.inputs,r)}}}),Mu,Wc=I(()=>{"use strict";ne(),ut(),ae(),Z(),Mu=(e,t,r)=>{let i=e.length>2,a=t.outputShape,s=t.format==="NHWC",n=t.group,o=e[1].dims,u=o[2]/n,l=o[3],d=s?R(u):1,p=s&&l===1&&u>=4,h=p?Math.floor(u/4)*4:Math.floor(u/d)*d,m=u-h,f=s?R(l):1,w=s?l===1?d:f:1,b=D.size(a)/f,_=[Math.ceil(b/64),1,1];be("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${_}`);let y=["rank","rank"],x=[t.strides[0],t.strides[1]],v=[t.kernelShape[s?1:2],t.kernelShape[s?2:3]],E=[t.dilations[0],t.dilations[1]],A=[v[0]+(t.dilations[0]<=1?0:(t.kernelShape[s?1:2]-1)*(t.dilations[0]-1)),v[1]+(t.dilations[1]<=1?0:(t.kernelShape[s?2:3]-1)*(t.dilations[1]-1))],B=[A[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),A[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],L=[{type:12,data:b},{type:12,data:x},{type:12,data:v},{type:12,data:E},{type:12,data:A},{type:6,data:B},{type:12,data:h},{type:12,data:u},{type:12,data:l},...k(e[0].dims,e[1].dims)];i&&(L.push(...k(e[2].dims)),y.push("rank")),L.push(...k(a));let W=Q=>{let de=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:x.length},{name:"filter_dims",type:"u32",length:v.length},{name:"dilations",type:"u32",length:v.length},{name:"effective_filter_dims",type:"u32",length:A.length},{name:"pads",type:"i32",length:B.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],te=O(e[0].dataType),he=s?1:2,Y=s?2:3,_e=s?3:1,oe=C("W",e[1].dataType,e[1].dims.length,w),J=C("Dy",e[0].dataType,e[0].dims.length,d),Se=[J,oe];i&&Se.push(C("bias",e[2].dataType,[a[_e]].length,f));let ie=j("result",e[0].dataType,a.length,f),Ae=()=>{let ge="";if(p)d===4?ge+=`
        let xValue = ${J.getByOffset("x_offset")};
        let wValue = ${oe.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:d===2?ge+=`
          dotProd = dotProd + dot(vec4<${te}>(${J.getByOffset("x_offset")}, ${J.getByOffset("x_offset + 1u")}), vec4<${te}>(${oe.getByOffset("w_offset")}, ${oe.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:d===1&&(ge+=`
          dotProd = dotProd + dot(vec4<${te}>(${J.getByOffset("x_offset")}, ${J.getByOffset("x_offset + 1u")}, ${J.getByOffset("x_offset + 2u")}, ${J.getByOffset("x_offset + 3u")}), vec4<${te}>(${oe.getByOffset("w_offset")}, ${oe.getByOffset("w_offset + 1u")}, ${oe.getByOffset("w_offset + 2u")}, ${oe.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(ge+=`
                  let xValue = ${s?J.getByOffset(`${J.indicesToOffset(`${J.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${d}`):J.get("batch","inputChannel","idyR","idyC")};
        `,d===1)ge+=`
          let w_offset = ${oe.indicesToOffset(`${oe.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${oe.getByOffset(`w_offset / ${w}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let ke=0;ke<d;ke++)ge+=`
            let wValue${ke} = ${oe.getByOffset(`${oe.indicesToOffset(`${oe.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${ke}, wOutChannel)`)} / ${w}`)};
            dotProd = dotProd + xValue[${ke}] * wValue${ke};`;return ge},G=()=>{if(m===0)return"";if(!p)throw new Error(`packInputAs4 ${p} is not true.`);let ge="";if(d===1){ge+="dotProd = dotProd";for(let ke=0;ke<m;ke++)ge+=`
            + ${J.getByOffset(`x_offset + ${ke}`)} * ${oe.getByOffset(`w_offset + ${ke}`)}`;ge+=";"}else if(d===2){if(m!==2)throw new Error(`Invalid inputChannelsRemainder ${m}.`);ge+=`
          let xValue = ${J.getByOffset("x_offset")};
          let wValue = ${oe.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return ge},X=`
            let outputIndices = ${ie.offsetToIndices(`global_idx * ${f}`)};
            let batch = ${ie.indicesGet("outputIndices",0)};
            let d1 = ${ie.indicesGet("outputIndices",_e)};
            let r = ${ie.indicesGet("outputIndices",he)};
            let c = ${ie.indicesGet("outputIndices",Y)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${ie.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${te}(dyRCorner) + ${te}(wR)) / ${te}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${te}(uniforms.Dy_shape[${he}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${te}(dyCCorner) + ${te}(wC)) / ${te}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${te}(uniforms.Dy_shape[${Y}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${p?`
                var x_offset = ${J.indicesToOffset(`${J.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${d};
                var w_offset = ${oe.indicesToOffset(`${oe.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${w};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${p?4:d}) {
                  ${Ae()}
                  inputChannel = inputChannel + ${p?4:d};
                }
                ${G()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${f}]`:""};
            ${ie.setByOffset("global_idx","value")};
          `;return`
    ${Q.registerUniforms(de).declareVariables(...Se,ie)}
      ${Q.mainStart()}
      ${Q.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${X}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${d}${w}${f}${p}${m}`,inputDependencies:y},getRunData:()=>({dispatchGroup:{x:_[0],y:_[1],z:_[2]},outputs:[{dims:r?r(a):a,dataType:e[0].dataType}],programUniforms:L}),getShaderSource:W}}}),Du,Pu,Uu,Es,Nu,Lu,ks,qu,Vu,Gc=I(()=>{"use strict";Wc(),Cr(),we(),Du=(e,t,r,i,a,s)=>(e-1)*t+r+(i-1)*a+1-s,Pu=(e,t,r,i,a)=>{let s=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=s,r[a]=e-s):t==="SAME_LOWER"&&(r[i]=e-s,r[a]=s)},Uu=(e,t,r,i,a,s,n,o,u,l)=>{let d=e.length-2,p=l.length===0;u.length<d&&u.push(...Array(d-u.length).fill(0));let h=e[0],m=t[o?3:1]*a;for(let f=0,w=e.length-d-(o?1:0);f<d;++f,++w){let b=e[w],_=p?b*n[f]:l[f],y=Du(b,n[f],s[f],t[w],r[f],_);Pu(y,i,s,f,f+d),p&&l.push(n[f]*(b-1)+u[f]+(t[w]-1)*r[f]+1-s[f]-s[f+d])}l.splice(0,0,h),l.splice(o?3:1,0,m)},Es=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((p,h)=>p*h,1)===0){r.length=0;for(let p=2;p<t[1].dims.length;++p)r.push(t[1].dims[p])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let a=e.pads.slice(),s=e.outputShape.slice(),n=e.outputPadding.slice(),o=t[0].dims,u=e.dilations.slice();if(u.reduce((p,h)=>p+h,0)===0){let p=t[0].dims.length-2;u=new Array(p).fill(1)}let l=e.strides.slice();if(l.reduce((p,h)=>p+h,0)===0){let p=t[0].dims.length-2;l=new Array(p).fill(1)}Uu(o,r,u,e.autoPad,e.group,a,l,i,n,s);let d=Object.assign({},e);return Object.assign(d,{kernelShape:r,pads:a,outputPadding:n,outputShape:s,dilations:u,strides:l}),d},Nu=e=>{let t=hs(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],a=e.dilations,s=e.group,n=e.kernelShape,o=e.pads,u=e.strides,l=e.wIsConst(),d=e.outputPadding,p=e.outputShape;return{autoPad:i,format:r,dilations:a,group:s,kernelShape:n,outputPadding:d,outputShape:p,pads:o,strides:u,wIsConst:l,...t,cacheKey:`${e.format};${t.activation};`}},Lu=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let a=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==a))throw new Error("invalid bias");let s=e[0].dims.length-2;if(t.dilations.reduce((n,o)=>n+o,0)>0&&t.dilations.length!==s)throw new Error(`dilations should be ${s}D`);if(t.strides.reduce((n,o)=>n+o,0)>0&&t.strides.length!==s)throw new Error(`strides should be ${s}D`);if(t.pads.reduce((n,o)=>n+o,0)>0&&t.pads.length!==s*2)throw new Error(`pads should be ${s*2}D`);if(t.outputPadding.length!==s&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${s}D`);if(t.kernelShape.reduce((n,o)=>n+o,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},ks=(e,t,r,i)=>{let a=e.kernelCustomData.wT??e.compute(Re(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=a);let s=[t[0],a];t.length===3&&s.push(t[2]),e.compute(Mu(s,r,i),{inputs:s})},qu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=t.kernelShape;(a.length===0||a[0]===0)&&(a=[e.inputs[1].dims[2]]);let s=t.dilations;(s.length===0||s[0]===0)&&(s=[1]);let n=t.strides;(n.length===0||n[0]===0)&&(n=[1]);let o=t.pads;o.length===0&&(o=[0,0]),o=[0,o[0],0,o[1]],n=[1].concat(n),s=[1].concat(s),a=[1].concat(a);let u=t.outputPadding;u=[0].concat(u);let l=Es({...t,pads:o,strides:n,dilations:s,kernelShape:a,outputPadding:u},i);ks(e,i,l,d=>r?[d[0],d[2],d[3]]:[d[0],d[1],d[3]])},Vu=(e,t)=>{if(Lu(e.inputs,t),e.inputs[0].dims.length===3)qu(e,t);else{let r=Es(t,e.inputs);ks(e,e.inputs,r)}}}),Fu,Wu,Gu,jc=I(()=>{"use strict";ne(),ae(),$(),Z(),Fu=(e,t,r,i)=>{let a=D.size(t),s=t.length,n=C("input",e,s),o=j("output",e,s),u=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),l=D.normalizeAxis(u,s),d=p=>{let h=` i32(${n.indicesGet("inputIndices","uniforms.axis")}) `,m=M("uniforms.input_shape","uniforms.axis",s),f=i.reverse?h+(i.exclusive?" + 1":""):"0",w=i.reverse?m:h+(i.exclusive?"":" + 1");return`
                ${p.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(n,o)}
                ${p.mainStart()}
                  ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${o.offsetToIndices("global_idx")};
                  var sum = ${o.type.value}(0);
                  let first : i32 = ${f};
                  let last : i32 = ${w};
                  for (var i : i32 = first; i < last; i++) {
                    ${n.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${n.getByIndices("inputIndices")};
                  }
                  ${o.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},{type:12,data:l},...k(t,t)]}),getShaderSource:d}},Wu=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,a=e.inputs[1];e.compute(Fu(i,r,a,t),{inputs:[0]})},Gu=e=>{let t=e.exclusive===1,r=e.reverse===1;return g({exclusive:t,reverse:r})}}),ju,Hu,Ku,Zu,Qu,Hc=I(()=>{"use strict";ne(),ae(),$(),Z(),ju=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},Hu=(e,t,r,i)=>{let a=[];a.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let s=0;s<t;++s)a.push(r.indicesSet("a",e[s],`i[${s}]`));return a.push("return a;}"),a.join(`
`)},Ku=(e,t)=>{let r,i,a,s,n,o,u=t.format==="NHWC",l=t.blocksize,d=t.mode==="DCR";u?([r,i,a,s]=e.dims,n=d?[r,i,a,l,l,s/l**2]:[r,i,a,s/l**2,l,l],o=d?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,a,s]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],n=d?[r,l,l,s/l**2,i,a]:[r,s/l**2,l,l,i,a],o=d?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let p=e.reshape(n),h=p.dims.length,m=e.dataType,f=C("a",m,h),w=j("output",m,h),b=_=>`
  ${_.registerUniform("output_size","u32").declareVariables(f,w)}

  ${Hu(o,h,f,w)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${w.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${w.setByOffset("global_idx",f.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:_=>{let y=u?[r,i*l,a*l,s/l**2]:[r,s/l**2,i*l,a*l],x=D.size(y),v=p.dims,E=D.sortBasedOnPerm(v,o);return{outputs:[{dims:y,dataType:_[0].dataType}],dispatchGroup:{x:Math.ceil(x/64)},programUniforms:[{type:12,data:x},...k(v,E)]}},getShaderSource:b}},Zu=(e,t)=>{ju(e.inputs),e.compute(Ku(e.inputs[0],t))},Qu=e=>g({blocksize:e.blocksize,mode:e.mode,format:e.format})}),Ta,ea,Is,Xu,Yu,Ju,el,zs,tl,rl,il,Kc=I(()=>{"use strict";ne(),ae(),$(),Z(),Ta="[a-zA-Z]|\\.\\.\\.",ea="("+Ta+")+",Is="^"+ea+"$",Xu="("+ea+",)*"+ea,Yu="^"+Xu+"$",Ju=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},el=class{constructor(e,t){this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(Yu)))throw new Error("Invalid LHS term");if(r.split(",").forEach((a,s)=>{let n=e[s].dims.slice();if(!a.match(RegExp(Is)))throw new Error("Invalid LHS term");let o=this.processTerm(a,!0,n,s);this.lhs.push(o)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([a,s])=>s.count===1||a==="...").map(([a])=>a).join("");else if(!i.match(RegExp(ea)))throw new Error("Invalid RHS");i.match(RegExp(Ta,"g"))?.forEach(a=>{if(a==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let s=this.symbolToInfo.get(a);if(s===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(s.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let a=r.length,s=!1,n=[],o=0;if(!e.match(RegExp(Is))&&!t&&e!=="")throw new Error("Invalid LHS term");let u=e.match(RegExp(Ta,"g")),l=new Ju(i);return u?.forEach((d,p)=>{if(d==="..."){if(s)throw new Error("Only one ellipsis is allowed per input term");s=!0;let h=a-u.length+1;if(h<0)throw new Error("Ellipsis out of bounds");if(n=r.slice(o,o+h),this.hasEllipsis){if(this.ellipsisDims.length!==n.length||this.ellipsisDims.toString()!==n.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=n;else throw new Error("Ellipsis must be specified in the LHS");for(let m=0;m<n.length;m++){let f=String.fromCharCode(48+m);l.addSymbol(f,p+m),this.addSymbol(f,r[o++],i)}}else l.addSymbol(d,p+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(d,r[o++],i)}),l}},zs=e=>e+"_max",tl=(e,t,r,i)=>{let a=e.map(l=>l.length).map((l,d)=>C(`input${d}`,t,l)),s=D.size(i),n=j("output",t,i.length),o=[...r.symbolToInfo.keys()].filter(l=>!r.rhs.symbolToIndices.has(l)),u=l=>{let d=[],p="var prod = 1.0;",h="var sum = 0.0;",m="sum += prod;",f=[],w=[],b=[],_=[],y=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((v,E)=>{if(r.rhs.symbolToIndices.has(E)){let A=r.rhs.symbolToIndices.get(E)?.[0];A!==void 0&&r.lhs.forEach((B,L)=>{if(v.inputIndices.includes(L)){let W=B.symbolToIndices.get(E);if(W===void 0)throw new Error("Invalid symbol error");W.forEach(Q=>{d.push(`${a[L].indicesSet(`input${L}Indices`,Q,n.indicesGet("outputIndices",A))}`)})}})}else r.lhs.forEach((A,B)=>{if(v.inputIndices.includes(B)){let L=A.symbolToIndices.get(E);if(L===void 0)throw new Error("Invalid symbol error");L.forEach(W=>{f.push(`${a[B].indicesSet(`input${B}Indices`,W,`${E}`)}`)}),_.push(`prod *= ${a[B].getByIndices(`input${B}Indices`)};`)}}),w.push(`for(var ${E}: u32 = 0; ${E} < uniforms.${zs(E)}; ${E}++) {`),b.push("}")});let x=y?[...d,`let sum = ${a.map((v,E)=>v.getByIndices(`input${E}Indices`)).join(" * ")};`]:[...d,h,...w,...f,p,..._,m,...b];return`
            ${l.registerUniforms(o.map(v=>({name:`${zs(v)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...a,n)}

            ${l.mainStart()}
            ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${n.offsetToIndices("global_idx")};
            ${a.map((v,E)=>`var input${E}Indices: ${a[E].type.indices};`).join(`
`)}
            ${x.join(`
`)};
            ${n.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let l=o.filter(p=>r.symbolToInfo.has(p)).map(p=>({type:12,data:r.symbolToInfo.get(p)?.dimValue||0}));l.push({type:12,data:s});let d=e.map((p,h)=>[...k(p)]).reduce((p,h)=>p.concat(h),l);return d.push(...k(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:d}},getShaderSource:u}},rl=(e,t)=>{let r=new el(e.inputs,t.equation),i=r.outputDims,a=e.inputs.map((s,n)=>s.dims);e.compute(tl(a,e.inputs[0].dataType,r,i))},il=e=>{let t=e.equation.replace(/\s+/g,"");return g({equation:t})}}),al,Cs,sl,nl,ol,Zc=I(()=>{"use strict";ne(),ae(),Z(),al=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,a=t.length<r.length?0:t.length-r.length;for(;i<r.length&&a<t.length;++i,++a)if(r[i]!==t[a]&&r[i]!==1&&t[a]!==1)throw new Error("Expand requires shape to be broadcastable to input")},Cs=(e,t)=>{let r=e.length-t.length,i=[];for(let a=0;a<r;++a)i.push(e[a]);for(let a=0;a<t.length;++a)i.push(t[a]===1?e[a+r]:t[a]);return i},sl=(e,t)=>e.length>t.length?Cs(e,t):Cs(t,e),nl=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=sl(t,r),a=e[0].dataType,s=a===9||D.size(t)===1,n=a===9||t.length>0&&t[t.length-1]%4===0?4:1,o=s||i.length>0&&i[i.length-1]%4===0?4:1,u=Math.ceil(D.size(i)/o),l=p=>{let h=C("input",a,t.length,n),m=j("output",a,i.length,o),f;if(a===9){let w=(b,_,y="")=>`
          let outputIndices${_} = ${m.offsetToIndices(`outputOffset + ${_}u`)};
          let offset${_} = ${h.broadcastedIndicesToOffset(`outputIndices${_}`,m)};
          let index${_} = offset${_} / 4u;
          let component${_} = offset${_} % 4u;
          ${b}[${_}] = ${y}(${h.getByOffset(`index${_}`)}[component${_}]);
        `;f=`
        let outputOffset = global_idx * ${o};
        var data = vec4<u32>(0);
        ${w("data",0,"u32")}
        ${w("data",1,"u32")}
        ${w("data",2,"u32")}
        ${w("data",3,"u32")}
        ${m.setByOffset("global_idx","data")}
      }`}else f=`
        let outputIndices = ${m.offsetToIndices(`global_idx * ${o}`)};
        let inputOffset = ${h.broadcastedIndicesToOffset("outputIndices",m)};
        let data = ${m.type.value}(${h.getByOffset(`inputOffset / ${n}`)});
        ${m.setByOffset("global_idx","data")}
      }`;return`
    ${p.registerUniform("vec_size","u32").declareVariables(h,m)}
    ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${f}`},d=[{type:12,data:u},...k(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${n}${o}`,inputDependencies:["rank"]},getShaderSource:l,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:d})}},ol=e=>{al(e.inputs),e.compute(nl(e.inputs),{inputs:[0]})}}),ul,ll,Qc=I(()=>{"use strict";ne(),ae(),Z(),cs(),ul=e=>{let t=e[0].dataType,r=D.size(e[0].dims),i=D.size(e[1].dims),a=i%4===0,s=n=>{let o=C("x",t,[1],4),u=C("bias",t,[1],4),l=j("y",t,[1],4),d=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],p=m=>`
      let bias${m}_offset: u32 = (global_idx * 4 + ${m}) % uniforms.bias_size;
      let bias${m} = ${u.getByOffset(`bias${m}_offset / 4`)}[bias${m}_offset % 4];`,h=a?`
      let bias = ${u.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${p(0)}${p(1)}${p(2)}${p(3)}
      let bias = ${o.type.value}(bias0, bias1, bias2, bias3);`;return`${n.registerUniforms(d).declareVariables(o,u,l)}

    ${ds(z(t))}

    ${n.mainStart(T)}
      ${n.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${o.getByOffset("global_idx")};
      ${h}
      let x_in = x + bias;
      ${l.setByOffset("global_idx",ps("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${a}`,inputDependencies:["type","type"]},getShaderSource:s,getRunData:n=>({outputs:[{dims:n[0].dims,dataType:n[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/T/4)}})}},ll=e=>{e.inputs.length<2||D.size(e.inputs[1].dims)===0?Fo(e):e.compute(ul(e.inputs))}}),dl,pl,cl,hl,Xc=I(()=>{"use strict";ne(),ae(),$(),Z(),dl=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},pl=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,s=D.normalizeAxis(t.axis,a),n=r.slice(0);n.splice(s,1,...i);let o=r[s],u=e[0].dataType===9?4:1,l=Math.ceil(D.size(n)/u),d=[{type:12,data:l},{type:6,data:o},{type:12,data:s},...k(e[0].dims,e[1].dims,n)],p=h=>{let m=C("data",e[0].dataType,e[0].dims.length,u),f=C("inputIndices",e[1].dataType,e[1].dims.length),w=j("output",e[0].dataType,n.length,u),b=y=>{let x=i.length,v=`var indicesIndices${y}  = ${f.type.indices}(0);`;for(let E=0;E<x;E++)v+=`${x>1?`indicesIndices${y}[${E}]`:`indicesIndices${y}`} = ${n.length>1?`outputIndices${y}[uniforms.axis + ${E}]`:`outputIndices${y}`};`;v+=`
          var idx${y} = ${f.getByIndices(`indicesIndices${y}`)};
          if (idx${y} < 0) {
            idx${y} = idx${y} + uniforms.axisDimLimit;
          }
          var dataIndices${y} : ${m.type.indices};
        `;for(let E=0,A=0;E<a;E++)E===s?(v+=`${a>1?`dataIndices${y}[${E}]`:`dataIndices${y}`} = u32(idx${y});`,A+=x):(v+=`${a>1?`dataIndices${y}[${E}]`:`dataIndices${y}`} = ${n.length>1?`outputIndices${y}[${A}]`:`outputIndices${y}`};`,A++);return v},_;if(e[0].dataType===9){let y=(x,v,E="")=>`
          let outputIndices${v} = ${w.offsetToIndices(`outputOffset + ${v}u`)};
          ${b(v)};
          let offset${v} = ${m.indicesToOffset(`dataIndices${v}`)};
          let index${v} = offset${v} / 4u;
          let component${v} = offset${v} % 4u;
          ${x}[${v}] = ${E}(${m.getByOffset(`index${v}`)}[component${v}]);
        `;_=`
        let outputOffset = global_idx * ${u};
        var value = vec4<u32>(0);
        ${y("value",0,"u32")}
        ${y("value",1,"u32")}
        ${y("value",2,"u32")}
        ${y("value",3,"u32")}
        ${w.setByOffset("global_idx","value")}
      `}else _=`
      let outputIndices = ${w.offsetToIndices("global_idx")};
      ${b("")};
      let value = ${m.getByIndices("dataIndices")};
      ${w.setByOffset("global_idx","value")};
      `;return`
      ${h.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(m,f,w)}
      ${h.mainStart()}
        ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${_}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:d}),getShaderSource:p}},cl=e=>g({axis:e.axis}),hl=(e,t)=>{let r=e.inputs;dl(r),e.compute(pl(e.inputs,t))}}),fl,ml,gl,Yc=I(()=>{"use strict";ne(),ae(),Z(),fl=(e,t,r,i,a,s,n,o,u)=>{let l=[{type:12,data:s},{type:12,data:i},{type:12,data:a},{type:12,data:r},{type:12,data:n},{type:12,data:o},{type:12,data:u}],d=[s];l.push(...k(t.dims,d));let p=h=>{let m=C("indices_data",t.dataType,t.dims.length),f=j("input_slice_offsets_data",12,1,1),w=[m,f],b=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:a.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${h.registerUniforms(b).declareVariables(...w)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${a.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${a.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:d,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:l}),getShaderSource:p},{inputs:[t],outputs:[-1]})[0]},ml=(e,t)=>{let r=e.inputs,i=r[0].dims,a=r[0].dataType,s=r[1].dims,n=s[s.length-1],o=D.sizeToDimension(s,s.length-1),u=D.sizeFromDimension(i,t.batchDims+n),l=D.sizeToDimension(i,t.batchDims),d=D.sizeFromDimension(i,t.batchDims),p=o/l,h=new Array(n),m=u;for(let v=0;v<n;++v)h[n-1-v]=m,m*=i[t.batchDims+n-1-v];let f=fl(e,r[1],h,t.batchDims,i,o,p,d,n),w=t.batchDims+n;if(w>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let b=s.slice(0,-1).concat(i.slice(w)),_=D.size(b),y=[{type:12,data:_},{type:12,data:u},...k(r[0].dims,f.dims,b)],x=v=>{let E=C("data",r[0].dataType,r[0].dims.length),A=C("slice_offsets",12,f.dims.length),B=j("output",r[0].dataType,b.length);return`
          ${v.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(E,A,B)}
            ${v.mainStart()}
            ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:b,dataType:a}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:y}),getShaderSource:x},{inputs:[r[0],f]})},gl=e=>({batchDims:e.batch_dims,cacheKey:""})}),yl,wl,_l,bl,Jc=I(()=>{"use strict";ne(),ae(),$(),Z(),yl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=D.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,a=e[0],s=e[2],n=e.length===4?e[3]:void 0;if(s.dims.length!==a.dims.length||!a.dims.map((o,u)=>u===r?Math.ceil(o/i)===s.dims[u]:o===s.dims[u]).reduce((o,u)=>o&&u,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(n){if(n.dataType!==a.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(n.dims.length!==s.dims.length||!n.dims.map((o,u)=>o===s.dims[u]).reduce((o,u)=>o&&u,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},wl=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,s=D.normalizeAxis(t.gatherAxis,a),n=D.normalizeAxis(t.quantizeAxis,a),o=r.slice(0);o.splice(s,1,...i);let u=D.size(o),l=e[2].dataType,d=e[0].dataType===22,p=[{type:12,data:u},{type:12,data:n},{type:12,data:s},{type:12,data:t.blockSize},...k(...e.map((m,f)=>m.dims),o)],h=m=>{let f=C("data",e[0].dataType,e[0].dims.length),w=C("inputIndices",e[1].dataType,e[1].dims.length),b=C("scales",e[2].dataType,e[2].dims.length),_=e.length>3?C("zeroPoint",e[3].dataType,e[3].dims.length):void 0,y=j("output",l,o.length),x=[f,w,b];_&&x.push(_);let v=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${m.registerUniforms(v).declareVariables(...x,y)}
        ${m.mainStart()}
        let output_indices = ${y.offsetToIndices("global_idx")};
        var indices_indices = ${w.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${y.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${w.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${y.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${f.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${y.indicesGet("output_indices","i")};
          ${f.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${w.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[s]};
        }
        ${f.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${o.length}; i++) {
          let index = ${y.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${f.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${f.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${f.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${d?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${b.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${b.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${b.getByIndices("scale_indices")};
        ${_?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${_.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${_.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${d?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${z(l)}(quantized_data - zero_point) * scale;
        ${y.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((m,f)=>f!==1).map(m=>m.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(m,f)=>"rank")},getRunData:()=>({outputs:[{dims:o,dataType:l}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:p}),getShaderSource:h}},_l=(e,t)=>{let r=e.inputs;yl(r,t),e.compute(wl(e.inputs,t))},bl=e=>g({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),$l,vl,xl,Sl,eh=I(()=>{"use strict";ne(),ae(),$(),Z(),$l=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},vl=(e,t)=>{let r=e[0].dims,i=e[0].dataType,a=r.length,s=e[1].dims,n=e[1].dataType,o=D.normalizeAxis(t.axis,a),u=r[o],l=s.slice(0),d=D.size(l),p=C("input",i,a),h=C("indicesInput",n,s.length),m=j("output",i,l.length),f=[{type:12,data:d},{type:6,data:u},{type:12,data:o}];return f.push(...k(r,s,l)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:l,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:f}),getShaderSource:w=>`
      ${w.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(p,h,m)}
      ${w.mainStart()}
      ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${m.offsetToIndices("global_idx")};

      var idx = ${h.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${p.type.indices}(outputIndices);
      ${p.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${p.getByIndices("inputIndices")};

      ${m.setByOffset("global_idx","value")};
  }`}},xl=e=>g({axis:e.axis}),Sl=(e,t)=>{let r=e.inputs;$l(r),e.compute(vl(e.inputs,t))}}),Tl,El,kl,Il,th=I(()=>{"use strict";ne(),ae(),Z(),Tl=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},El=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[a,s,n]=Wr.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),o=[a,s];if(!o)throw new Error("Can't use gemm on the given tensors");let u=16,l=Math.ceil(s/u),d=Math.ceil(a/u),p=!0,h=D.size(o),m=[{type:12,data:p?l:h},{type:12,data:a},{type:12,data:s},{type:12,data:n},{type:1,data:t.alpha},{type:1,data:t.beta}],f=["type","type"];e.length===3&&(m.push(...k(e[2].dims)),f.push("rank")),m.push(...k(o));let w=_=>{let y="";t.transA&&t.transB?y="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?y="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?y="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(y="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let x=t.alpha===1?"":"value *= uniforms.alpha;",v=C("a",e[0].dataType,e[0].dims),E=C("b",e[1].dataType,e[1].dims),A=v.type.value,B=null,L=[v,E];e.length===3&&(B=C("c",e[2].dataType,e[2].dims.length),L.push(B));let W=j("output",e[0].dataType,o.length);L.push(W);let Q=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${_.registerUniforms(Q).declareVariables(...L)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${A}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${y}
    }

    ${x}
    ${B!=null?`let cOffset = ${B.broadcastedIndicesToOffset("vec2(m, n)",W)}; value += ${A}(uniforms.beta) * ${B.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},b=_=>{let y=C("a",e[0].dataType,e[0].dims),x=C("b",e[1].dataType,e[1].dims),v=null,E=[y,x];e.length===3&&(v=C("c",e[2].dataType,e[2].dims.length),E.push(v));let A=j("output",e[0].dataType,o.length);E.push(A);let B=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],L="",W="";t.transA&&t.transB?(W=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${x.type.value}(0);
      }
      `,L="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(W=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${x.type.value}(0);
      }
      `,L="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(W=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${x.type.value}(0);
      }
      `,L="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(W=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${x.type.value}(0);
      }
      `,L="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let Q=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${_.registerUniforms(B).declareVariables(...E)}
  var<workgroup> tile_a: array<array<${y.type.storage}, ${u}>, ${u}>;
  var<workgroup> tile_b: array<array<${x.type.storage}, ${u}>, ${u}>;
  ${_.mainStart([u,u,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${u};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${u};
    let num_tiles = (uniforms.K - 1) / ${u} + 1;
    var k_start = 0u;
    var value = ${A.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${W}
      k_start = k_start + ${u};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${u}; k++) {
        ${L}
      }
      workgroupBarrier();
    }

    ${Q}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${v!=null?`let cOffset = ${v.broadcastedIndicesToOffset("vec2(m, n)",A)}; value += ${A.type.value}(uniforms.beta) * ${v.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return p?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:l*d},programUniforms:m}),getShaderSource:b}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:m}),getShaderSource:w}},kl=e=>{let t=e.transA,r=e.transB,i=e.alpha,a=e.beta;return{transA:t,transB:r,alpha:i,beta:a,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},Il=(e,t)=>{Tl(e.inputs),e.compute(El(e.inputs,t))}}),Mt,Ft,Ar,Or,zl,Cl,Al,Ol,Rl,Bl,Ml,Dl,Pl,Ul,rh=I(()=>{"use strict";ne(),ae(),$(),Z(),[Mt,Ft,Ar,Or]=[0,1,2,3],zl=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},Cl=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,Al=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,Ol=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,Rl=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,Bl=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${Mt}] = batch;
     indices[${Ft}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${Ar}] = u32(r);
            indices[${Or}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${Ar}] = u32(clamp(r, 0, H - 1));
          indices[${Or}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${Ar}] = gs_reflect(r, border[1], border[3]);
          indices[${Or}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,Ml=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${Mt}], indices[${Ft}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${Mt}], indices[${Ft}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${Mt}], indices[${Ft}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${Mt}], indices[${Ft}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${Mt}], indices[${Ft}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${Mt}], indices[${Ft}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,Dl=(e,t)=>{let r=C("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],a=C("grid",e[1].dataType,i.length,2),s=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(s=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[Mt,Ft,Ar,Or]=[0,3,1,2]);let n=j("output",e[0].dataType,s.length),o=r.type.value,u=D.size(s),l=[{type:12,data:u},...k(e[0].dims,i,s)],d=p=>`
  ${p.registerUniform("output_size","u32").declareVariables(r,a,n)}
  ${Cl}
  ${Al(o)}
  ${Ol(t)}
  ${Rl(t)}
  ${Bl(r,o,t)}

  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${Ar}]);
      let W_in = i32(uniforms.x_shape[${Or}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${n.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${Mt}], indices[${Ar}], indices[${Or}]);
      let nxy = ${a.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${Ml(n,o,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:p=>{let h=D.size(s);return{outputs:[{dims:s,dataType:p[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:l}},getShaderSource:d}},Pl=(e,t)=>{zl(e.inputs),e.compute(Dl(e.inputs,t))},Ul=e=>g({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),rt,Nl,Ll,As,ql,ta,Vl,Fl=I(()=>{"use strict";ne(),ae(),$(),Kr(),us(),Z(),we(),rt=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,Nl=(e,t)=>{let r=e[0],i=rt(e,1),a=rt(e,2),s=rt(e,3),n=rt(e,4),o=rt(e,5),u=rt(e,6),l=rt(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let d=r.dims[0],p=r.dims[1],h=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],m=p,f=0,w=0,b=Math.floor(h/t.numHeads);if(u&&l&&D.size(u.dims)&&D.size(l.dims)){if(u.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(u.dims[0]!==d||u.dims[1]!==t.numHeads||u.dims[3]!==b)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(l.dims[0]!==d||l.dims[1]!==t.numHeads||l.dims[3]!==b)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(u.dims[2]!==l.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(l.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');f=u.dims[2],w=u.dims[2]}else if(u&&D.size(u.dims)||l&&D.size(l.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let _;if(i&&D.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');_=2,m=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==b)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');_=5,m=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==b)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');_=0,m=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');_=3}if(s&&D.size(s.dims)>0){if(s.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let y=f+m,x=0;if(n&&D.size(n.dims)>0){x=8;let B=n.dims;throw B.length===1?B[0]===d?x=1:B[0]===3*d+2&&(x=3):B.length===2&&B[0]===d&&B[1]===y&&(x=5),x===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let v=!1,E=h;if(a&&D.size(a.dims)>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(m!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');E=a.dims[2]}else{if(m!==a.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');E=a.dims[1]*a.dims[3],v=!0}}let A=!1;if(n&&D.size(n.dims)>0)throw new Error("Key padding mask is not supported");if(o&&D.size(o.dims)>0){if(o.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(o.dims[0]!==d||o.dims[1]!==t.numHeads||o.dims[2]!==p||o.dims[3]!==y)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:d,sequenceLength:p,pastSequenceLength:f,kvSequenceLength:m,totalSequenceLength:y,maxSequenceLength:w,inputHiddenSize:0,hiddenSize:h,vHiddenSize:E,headSize:b,vHeadSize:Math.floor(E/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:x,scale:t.scale,broadcastResPosBias:A,passPastInKv:v,qkvFormat:_}},Ll=e=>g({...e}),As=g({perm:[0,2,1,3]}),ql=(e,t,r,i,a,s,n)=>{let o=[i,a,s],u=D.size(o),l=[{type:12,data:u},{type:12,data:n},{type:12,data:s}],d=p=>{let h=j("qkv_with_bias",t.dataType,o),m=C("qkv",t.dataType,o),f=C("bias",r.dataType,o),w=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${p.registerUniforms(w).declareVariables(m,f,h)}
  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:o,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l}),getShaderSource:d},{inputs:[t,r],outputs:[-1]})[0]},ta=(e,t,r,i,a,s,n,o)=>{let u=s;if(n&&D.size(n.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return u=ql(e,s,n,t,i,r*a,o),u=u.reshape([t,i,r,a]),r===1||i===1?u:e.compute(Re(u,As.perm),{inputs:[u],outputs:[-1]})[0]}else return s.dims.length===3&&(u=s.reshape([t,i,r,a])),r===1||i===1?u:e.compute(Re(u,As.perm),{inputs:[u],outputs:[-1]})[0]},Vl=(e,t)=>{let r=Nl(e.inputs,t),i=e.inputs[0],a=rt(e.inputs,1),s=rt(e.inputs,2),n=rt(e.inputs,3),o=rt(e.inputs,4),u=rt(e.inputs,5),l=rt(e.inputs,6),d=rt(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if(a?.dims.length===5)throw new Error("Packed KV is not implemented");let p=a&&s&&a.dims.length===4&&s.dims.length===4,h=ta(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,n,0);if(p)return Qi(e,h,a,s,o,void 0,l,d,u,r);if(!a||!s)throw new Error("key and value must be provided");let m=ta(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,a,n,r.hiddenSize),f=ta(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,s,n,2*r.hiddenSize);Qi(e,h,m,f,o,void 0,l,d,u,r)}}),Wl,Gl,jl,Hl,Os,Kl,Zl,Ql=I(()=>{"use strict";ne(),ae(),$(),Z(),Wl=e=>{if(!e||e.length<1)throw new Error("too few inputs")},Gl=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(a=>r.push(Number(a))),i=r.length),g({numOutputs:i,axis:t.axis,splitSizes:r})},jl=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${M("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,Hl=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let a=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(a):i===0?r.push(`if (output_number == ${i}u) { ${a} }`):i===t-1?r.push(`else { ${a} }`):r.push(`else if (output_number == ${i}) { ${a} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Os=(e,t)=>{let r=e[0].dims,i=D.size(r),a=e[0].dataType,s=D.normalizeAxis(t.axis,r.length),n=new Array(t.numOutputs),o=C("input",a,r.length),u=new Array(t.numOutputs),l=[],d=[],p=0,h=[{type:12,data:i}];for(let f=0;f<t.numOutputs;f++){p+=t.splitSizes[f],u[f]=p;let w=r.slice();w[s]=t.splitSizes[f],d.push(w),n[f]=j(`output${f}`,a,w.length),l.push({dims:d[f],dataType:e[0].dataType})}h.push({type:12,data:u},...k(r,...d));let m=f=>`
  ${f.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",u.length).declareVariables(o,...n)}
  ${jl(u.length)}
  ${Hl(n)}

  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${o.offsetToIndices("global_idx")};
    var index = ${o.indicesGet("indices",s)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${M("uniforms.size_in_split_axis","output_number - 1u",u.length)};
      ${o.indicesSet("indices",s,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:m,getRunData:()=>({outputs:l,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:h})}},Kl=(e,t)=>{Wl(e.inputs);let r=e.inputs.length===1?t:Gl(e.inputs,t);e.compute(Os(e.inputs,r),{inputs:[0]})},Zl=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes lengh must be equal");return g({axis:t,numOutputs:i,splitSizes:r})}}),Xl,Ea,Yl,Jl=I(()=>{"use strict";ne(),ae(),$(),Z(),Xl=(e,t)=>{let[r,i,a,s]=e,{numHeads:n,rotaryEmbeddingDim:o}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!D.areEqual(i.dims,[])&&!D.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(s.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${s.dims.length}`);if(!D.areEqual(a.dims,s.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(o>0&&n===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let u=r.dims[0],l=r.dims[r.dims.length-2],d=a.dims[0],p=D.sizeFromDimension(r.dims,1)/l,h=o===0?a.dims[1]*2:p/n;if(o>h)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(u!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(l!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(h/2!==a.dims[1]&&o/2!==a.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${a.dims[1]}`);if(l>d)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported")},Ea=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:a,scale:s}=t,n=e[0].dims[0],o=D.sizeFromDimension(e[0].dims,1),u=e[0].dims[e[0].dims.length-2],l=o/u,d=e[2].dims[1],p=a===0?d*2:l/i,h=new Array(n,u,l/p,p-d),m=D.computeStrides(h),f=[{type:1,data:s},{type:12,data:h},{type:12,data:m},...e[0].dims.length===3?new Array({type:12,data:[o,l,p,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[o,p,u*p,1]}):[],...k(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],w=b=>{let _=C("input",e[0].dataType,e[0].dims.length),y=C("position_ids",e[1].dataType,e[1].dims.length),x=C("cos_cache",e[2].dataType,e[2].dims.length),v=C("sin_cache",e[3].dataType,e[3].dims.length),E=j("output",e[0].dataType,e[0].dims.length);return b.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:h.length},{name:"global_strides",type:"u32",length:m.length},{name:"input_output_strides",type:"u32",length:m.length}]),`
        ${b.declareVariables(_,y,x,v,E)}

        ${b.mainStart(T)}
          let half_rotary_emb_dim = uniforms.${x.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${b.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${y.broadcastedIndicesToOffset("bsnh.xy",j("",y.type.tensor,2))};
            let position_id =
                u32(${y.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${_.getByOffset("i")} * ${x.get("position_id","bsnh[3]")} -
                ${_.getByOffset("j")} * ${v.get("position_id","bsnh[3]")};
            ${E.setByOffset("i","re")}
            let im = ${_.getByOffset("i")} * ${v.get("position_id","bsnh[3]")} +
                ${_.getByOffset("j")} * ${x.get("position_id","bsnh[3]")};
            ${E.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${E.setByOffset("k",_.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:g({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:w,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(D.size(h)/T)},programUniforms:f})}},Yl=(e,t)=>{Xl(e.inputs,t),e.compute(Ea(e.inputs,t))}}),ed,td,Rs,rd,id,ih=I(()=>{"use strict";$(),ne(),us(),Fl(),Ql(),we(),Jl(),Z(),ed=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],a=e[2],s=e[3],n=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let o=!1,u=r.dims[0],l=r.dims[1],d=r.dims.length===3?o?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],p=l,h=0,m=!i||i.dims.length===0,f=Math.floor(m?d/(t.numHeads+2*t.kvNumHeads):d/t.numHeads);m&&(d=f*t.numHeads);let w=s&&s.dims.length!==0,b=n&&n.dims.length!==0;if(w&&s.dims.length===4&&s.dims[0]===u&&s.dims[1]!==t.kvNumHeads&&s.dims[2]===t.kvNumHeads&&s.dims[3]===f)throw new Error("BSNH pastKey/pastValue is not supported");if(w&&b){if(s.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(n.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');h=s.dims[2]}else if(w||b)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let _=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');p=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==f)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');p=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==f)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');p=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');_=3}let y=0,x=!1,v=t.kvNumHeads?f*t.kvNumHeads:d;if(a&&a.dims.length>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(p!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');v=a.dims[2]}else{if(p!==a.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');v=a.dims[1]*a.dims[3],x=!0}}let E=e.length>4?e[5]:void 0;if(E&&E.dims.length!==1&&E.dims[0]!==u)throw new Error('Input "seqlens" is expected to have 1 dimension and the same dim 0 as batch_size');return{batchSize:u,sequenceLength:l,pastSequenceLength:h,kvSequenceLength:p,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:d,vHiddenSize:v,headSize:f,vHeadSize:Math.floor(v/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:y,scale:t.scale,broadcastResPosBias:!1,passPastInKv:x,qkvFormat:_}},td=g({perm:[0,2,1,3]}),Rs=(e,t,r)=>{let i=t,a=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,a,r.headSize]),i=e.compute(Re(i,td.perm),{inputs:[i],outputs:[-1]})[0]),i},rd=(e,t,r,i)=>{let a=7,s=["type","type"],n=[e*t],o=e*t,u=[{type:12,data:o},{type:12,data:t},{type:12,data:e}],l=d=>{let p=C("seq_lens",r.dataType,r.dims),h=C("total_seq_lens",i.dataType,i.dims),m=j("pos_ids",a,n),f=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${d.registerUniforms(f).declareVariables(p,h,m)}
  ${d.mainStart()}
    ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${h.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${p.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${m.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${m.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${m.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:s},getRunData:()=>({outputs:[{dims:n,dataType:a}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:u}),getShaderSource:l}},id=(e,t)=>{let r=ed(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(e.inputs[1]?.dims.length===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],a=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,s=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,n=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,o=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,u=e.inputs.length>4?e.inputs[5]:void 0,l=e.inputs.length>5?e.inputs[6]:void 0,d=r.kvNumHeads?r.kvNumHeads:r.numHeads,p=g({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,d*r.headSize,d*r.headSize]}),[h,m,f]=!a&&!s?e.compute(Os([i],p),{inputs:[i],outputs:[-1,-1,-1]}):[i,a,s],w,b;if(t.doRotary){let v=e.compute(rd(r.batchSize,r.sequenceLength,u,l),{inputs:[u,l],outputs:[-1]})[0],E=e.inputs[7],A=e.inputs[8],B=g({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),L=[h,v,E,A],W=[-1];w=e.compute(Ea(L,B),{inputs:L,outputs:W})[0],L.splice(0,1,m);let Q=g({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});b=e.compute(Ea(L,Q),{inputs:L,outputs:W})[0]}let _=ta(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?w:h,void 0,0),y=Rs(e,t.doRotary?b:m,r),x=Rs(e,f,r);Qi(e,_,y,x,void 0,void 0,n,o,void 0,r,u,l)}}),Bs,ad,sd,nd,ah=I(()=>{"use strict";ne(),ae(),we(),Z(),Bs=(e,t,r,i,a,s,n,o)=>{let u=R(s),l=u===1?"f32":`vec${u}f`,d=u===1?"vec2f":`mat2x${u}f`,p=a*n,h=64;p===1&&(h=256);let m=[a,n,s/u],f=[a,n,2],w=["rank","type","type"],b=[];b.push(...k(m,f));let _=y=>{let x=C("x",t.dataType,3,u),v=C("scale",r.dataType,r.dims),E=C("bias",i.dataType,i.dims),A=j("output",1,3,2),B=[x,v,E,A];return`
  var<workgroup> workgroup_shared : array<${d}, ${h}>;
  const workgroup_size = ${h}u;
  ${y.declareVariables(...B)}
  ${y.mainStart(h)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${l}(0);
    var squared_sum = ${l}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${l}(${x.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${d}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${F("workgroup_shared[0][0]",u)} / f32(hight * ${u});
      let squared_sum_final = ${F("workgroup_shared[0][1]",u)} / f32(hight * ${u});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${o}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${u};${o};${h}`,inputDependencies:w},getRunData:()=>({outputs:[{dims:f,dataType:1}],dispatchGroup:{x:p},programUniforms:b}),getShaderSource:_},{inputs:[t,r,i],outputs:[-1]})[0]},ad=(e,t,r)=>{let i=t[0].dims,a=i,s=2,n=i[0],o=i[1],u=D.sizeFromDimension(i,s),l=R(u),d=D.size(a)/l,p=Bs(e,t[0],t[1],t[2],n,u,o,r.epsilon),h=[n,o,u/l],m=[n,o],f=["type","none"],w=b=>{let _=C("x",t[0].dataType,h.length,l),y=C("scale_shift",1,m.length,2),x=j("output",t[0].dataType,h.length,l),v=[_,y,x];return`
  ${b.registerUniform("output_size","u32").declareVariables(...v)}
  ${b.mainStart()}
  ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${x.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${y.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${_.getByOffset("global_idx")} * ${x.type.value}(scale_shift.x) + ${x.type.value}(scale_shift.y);
      ${x.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${l}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:[{type:12,data:d},...k(h,m,h)]}),getShaderSource:w},{inputs:[t[0],p]})},sd=(e,t,r)=>{let i=t[0].dims,a=i,s=i[0],n=i[i.length-1],o=D.sizeFromDimension(i,1)/n,u=R(n),l=D.size(a)/u,d=[{type:12,data:o},{type:12,data:Math.floor(n/u)}],p=["type","type"],h=!1,m=[0,i.length-1];for(let _=0;_<i.length-2;_++)h=h||i[_+1]!==1,m.push(_+1);h=h&&i[i.length-1]!==1;let f=h?e.compute(Re(e.inputs[0],m),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},(_,y)=>i[m[y]])),w=Bs(e,f,t[1],t[2],s,o,n,r.epsilon),b=_=>{let y=O(t[0].dataType),x=u===1?"vec2f":`mat${u}x2f`,v=B=>{let L=B===0?"x":"y",W=u===1?"f32":`vec${u}f`;switch(u){case 1:return`${y}(${W}(scale.${L}))`;case 2:return`vec2<${y}>(${W}(scale[0].${L}, scale[1].${L}))`;case 4:return`vec4<${y}>(${W}(scale[0].${L}, scale[1].${L}, scale[2].${L}, scale[3].${L}))`;default:throw new Error(`Not supported compoents ${u}`)}},E=C("input",t[0].dataType,t[0].dims,u),A=j("output",t[0].dataType,a,u);return`
  @group(0) @binding(0) var<storage, read> input : array<${E.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${x}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${A.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${_.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${v(0)}, ${v(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${u}`,inputDependencies:p},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:d}),getShaderSource:b},{inputs:[t[0],w]})},nd=(e,t)=>{t.format==="NHWC"?sd(e,e.inputs,t):ad(e,e.inputs,t)}}),od,ud,ld,sh=I(()=>{"use strict";ne(),ae(),Z(),od=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},ud=(e,t,r)=>{let i=t.simplified,a=e[0].dims,s=e[1],n=!i&&e[2],o=a,u=D.normalizeAxis(t.axis,a.length),l=D.sizeToDimension(a,u),d=D.sizeFromDimension(a,u),p=D.size(s.dims),h=n?D.size(n.dims):0;if(p!==d||n&&h!==d)throw new Error(`Size of X.shape()[axis:] == ${d}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${p} and bias size of ${h}`);let m=[];for(let E=0;E<a.length;++E)E<u?m.push(a[E]):m.push(1);let f=R(d),w=["type","type"],b=[{type:12,data:l},{type:1,data:d},{type:12,data:Math.floor(d/f)},{type:1,data:t.epsilon}];n&&w.push("type");let _=r>1,y=r>2,x=E=>{let A=O(e[0].dataType),B=[C("x",e[0].dataType,e[0].dims,f),C("scale",s.dataType,s.dims,f)];n&&B.push(C("bias",n.dataType,n.dims,f)),B.push(j("output",e[0].dataType,o,f)),_&&B.push(j("mean_data_output",1,m)),y&&B.push(j("inv_std_output",1,m));let L=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${E.registerUniforms(L).declareVariables(...B)}
  ${E.mainStart()}
    ${E.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${q("f32",f)};
    var mean_square_vector = ${q("f32",f)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${V(A,f,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${F("mean_vector",f)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${F("mean_square_vector",f)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${V(A,f,"x[j + offset]")};
      let f32scale = ${V(A,f,"scale[j]")};
      output[j + offset] = ${B[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${n?`+ ${V(A,f,"bias[j]")}`:""}
      );
    }

    ${_?"mean_data_output[global_idx] = mean":""};
    ${y?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},v=[{dims:o,dataType:e[0].dataType}];return _&&v.push({dims:m,dataType:1}),y&&v.push({dims:m,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${f};${r};${i}`,inputDependencies:w},getRunData:()=>({outputs:v,dispatchGroup:{x:Math.ceil(l/64)},programUniforms:b}),getShaderSource:x}},ld=(e,t)=>{od(e.inputs),e.compute(ud(e.inputs,t,e.outputCount))}}),dd,pd,nh=I(()=>{"use strict";ae(),gs(),bs(),dd=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},pd=e=>{dd(e.inputs);let t=At.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(ms(e.inputs,{activation:""},t));else{let a=t[t.length-2],s=D.size(e.inputs[0].dims.slice(0,-2)),n=D.size(e.inputs[1].dims.slice(0,-2));if(s!==1&&a===1&&n===1){let o=e.inputs[0].reshape([1,s,i]),u=e.inputs[1].reshape([1,i,r]),l=[1,s,r],d=[o,u];e.compute(va(d,{activation:""},t,l),{inputs:d})}else e.compute(va(e.inputs,{activation:""},t))}}}),cd,hd,fd,md,gd,oh=I(()=>{"use strict";ne(),ae(),$(),Z(),cd=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let a=Math.floor((t.k+t.blockSize-1)/t.blockSize),s=t.blockSize/8*t.bits,n=e[1];if(!D.areEqual(n.dims,[t.n,a,s]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let o=e[2].dims;if(D.size(o)!==t.n*a)throw new Error("scales input size error.");if(e.length===4){let u=e[3].dims,l=t.bits>4?t.n*a:t.n*Math.floor((a+1)/2);if(D.size(u)!==l)throw new Error("zeroPoints input size error.")}},hd=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],s=t.k,n=t.n,o=r.slice(0,i-2),u=D.size(o),l=e[1].dims[2]/4,d=e[0].dataType,p=R(t.k),h=R(l),m=R(n),f=o.concat([a,n]),w=a>1&&n/m%2===0?2:1,b=D.size(f)/m/w,_=64,y=[],x=[u,a,s/p],v=D.convertShape(e[1].dims).slice();v.splice(-1,1,l/h),y.push(...k(x)),y.push(...k(v)),y.push(...k(e[2].dims)),e.length===4&&y.push(...k(D.convertShape(e[3].dims)));let E=[u,a,n/m];y.push(...k(E));let A=B=>{let L=x.length,W=C("a",e[0].dataType,L,p),Q=C("b",12,v.length,h),de=C("scales",e[2].dataType,e[2].dims.length),te=[W,Q,de],he=e.length===4?C("zero_points",12,e[3].dims.length):void 0;he&&te.push(he);let Y=E.length,_e=j("output",e[0].dataType,Y,m),oe=O(e[0].dataType),J=(()=>{switch(p){case 1:return`array<${oe}, 8>`;case 2:return`mat4x2<${oe}>`;case 4:return`mat2x4<${oe}>`;default:throw new Error(`${p}-component is not supported.`)}})(),Se=()=>{let G=`
          // reuse a data
            var input_offset = ${W.indicesToOffset(`${W.type.indices}(batch, row, word_offset)`)};
            var a_data: ${J};
            for (var j: u32 = 0; j < ${8/p}; j++) {
              a_data[j] = ${W.getByOffset("input_offset")};
              input_offset++;
            }
          `;for(let X=0;X<m*w;X++)G+=`
            b_value = ${h===1?`b${X}_data`:`b${X}_data[i]`};
            b_value_lower = unpack4xU8(b_value & b_mask);
            b_value_upper = unpack4xU8((b_value >> 4) & b_mask);
            b_quantized_values = ${J}(${Array.from({length:4},(ge,ke)=>`${oe}(b_value_lower[${ke}]), ${oe}(b_value_upper[${ke}])`).join(", ")});
            b_dequantized_values = ${p===1?`${J}(${Array.from({length:8},(ge,ke)=>`(b_quantized_values[${ke}] - ${he?`zero_point${X}`:"zero_point"}) * scale${X}`).join(", ")});`:`(b_quantized_values - ${J}(${Array(8).fill(`${he?`zero_point${X}`:"zero_point"}`).join(",")})) * scale${X};`};
            workgroup_shared[local_id.x * ${w} + ${Math.floor(X/m)}]${m>1?`[${X%m}]`:""} += ${Array.from({length:8/p},(ge,ke)=>`${p===1?`a_data[${ke}] * b_dequantized_values[${ke}]`:`dot(a_data[${ke}], b_dequantized_values[${ke}])`}`).join(" + ")};
          `;return G},ie=()=>{let G=`
            var col_index = col * ${m};
            ${he?`
            let zero_point_bytes_per_col = (nBlocksPerCol + 1) / 2;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${oe}(8);`}
            `;for(let X=0;X<m*w;X++)G+=`
            let scale${X} = ${de.getByOffset("col_index * nBlocksPerCol + block")};
            ${he?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block >> 0x1u);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            zero_point_word = ${he.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${X} = ${oe}((zero_point_word) & 0xFu);`:""}
            col_index += 1;`;return G},Ae=()=>{let G=`col_index = col * ${m};`;for(let X=0;X<m*w;X++)G+=`
            let b${X}_data = ${Q.getByIndices(`${Q.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return G+=`
            var b_value: u32;
            let b_mask: u32 = 0x0F0F0F0Fu;
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${J};
            var b_dequantized_values: ${J};`,G};return`
        var<workgroup> workgroup_shared: array<${_e.type.value}, ${w*_}>;
        ${B.declareVariables(...te,_e)}
        ${B.mainStart([_,1,1])}
          let output_indices = ${_e.offsetToIndices(`(global_idx / ${_}) * ${w}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${_}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/p};
            ${ie()}
            for (var word: u32 = 0; word < ${l}; word += ${h}) {
              ${Ae()}
              for (var i: u32 = 0; i < ${h}; i++) {
                ${Se()}
                word_offset += ${8/p};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${w}) {
            var output_value: ${_e.type.value} = ${_e.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${_}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${w};
            }
            ${_e.setByIndices(`${_e.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${p};${h};${m};${w};${_}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:f,dataType:d}],dispatchGroup:{x:b},programUniforms:y}),getShaderSource:A}},fd=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],s=t.k,n=t.n,o=r.slice(0,i-2),u=D.size(o),l=e[1].dims[2]/4,d=e[0].dataType,p=R(t.k),h=R(l),m=o.concat([a,n]),f=128,w=n%8===0?8:n%4===0?4:1,b=f/w,_=b*h*8,y=_/p,x=_/t.blockSize,v=D.size(m)/w,E=[],A=[u,a,s/p],B=D.convertShape(e[1].dims).slice();B.splice(-1,1,l/h),E.push(...k(A)),E.push(...k(B)),E.push(...k(e[2].dims)),e.length===4&&E.push(...k(D.convertShape(e[3].dims)));let L=[u,a,n];E.push(...k(L));let W=Q=>{let de=A.length,te=C("a",e[0].dataType,de,p),he=C("b",12,B.length,h),Y=C("scales",e[2].dataType,e[2].dims.length),_e=[te,he,Y],oe=e.length===4?C("zero_points",12,e[3].dims.length):void 0;oe&&_e.push(oe);let J=L.length,Se=j("output",e[0].dataType,J),ie=O(e[0].dataType),Ae=()=>{switch(p){case 1:return`
          let a_data0 = vec4<${ie}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${ie}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${ie}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${ie}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${p}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${te.type.value}, ${y}>;
        var<workgroup> inter_results: array<array<${Se.type.value}, ${b}>, ${w}>;
        ${Q.declareVariables(..._e,Se)}
        ${Q.mainStart([b,w,1])}
          let output_indices = ${Se.offsetToIndices(`workgroup_index * ${w}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${x} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${y};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${y}; a_offset += ${f})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${te.getByIndices(`${te.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${te.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${x} + local_id.x;
            ${oe?`
            let zero_point_bytes_per_col = (n_blocks_per_col + 1) / 2;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block >> 0x1u);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            let zero_point_word = ${oe.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${ie}((zero_point_word) & 0xFu);`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${ie}(8);`}
            let scale = ${Y.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${he.getByIndices(`${he.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/p};
            for (var i: u32 = 0; i < ${h}; i++) {
              ${Ae()}
              let b_value = ${h===1?"b_data":"b_data[i]"};
              let b_value_lower = unpack4xU8(b_value & 0x0F0F0F0Fu);
              let b_value_upper = unpack4xU8((b_value >> 4) & 0x0F0F0F0Fu);
              let b_quantized_values = mat2x4<${ie}>(${Array.from({length:4},(G,X)=>`${ie}(b_value_lower[${X}]), ${ie}(b_value_upper[${X}])`).join(", ")});
              let b_dequantized_values = (b_quantized_values - mat2x4<${ie}>(${Array(8).fill("zero_point").join(",")})) * scale;
              inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(G,X)=>`${`dot(a_data${X}, b_dequantized_values[${X}])`}`).join(" + ")};
              word_offset += ${8/p};
            }
            workgroupBarrier();
          }

          if (local_idx < ${w}) {
            var output_value: ${Se.type.value} = ${Se.type.value}(0);
            for (var b = 0u; b < ${b}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${Se.setByIndices(`${Se.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${p};${h};${b};${w}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:m,dataType:d}],dispatchGroup:{x:v},programUniforms:E}),getShaderSource:W}},md=(e,t)=>{cd(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(fd(e.inputs,t)):e.compute(hd(e.inputs,t))},gd=e=>g(e)}),yd,wd,_d,bd,$d,vd,xd,Sd,Td,uh=I(()=>{"use strict";ne(),ae(),Z(),yd=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},wd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
            k = i32(${e.indicesGet("indices",a)}) - ${M("uniforms.pads",a,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${M("uniforms.x_shape",a,t)})) {
              break;
            }
            offset += k * i32(${M("uniforms.x_strides",a,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},_d=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${M("uniforms.pads",a,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${M("uniforms.x_shape",a,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${M("uniforms.x_shape",a,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${M("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},bd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${M("uniforms.pads",a,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${M("uniforms.x_shape",a,t)})) {
                  k = i32(${M("uniforms.x_shape",a,t)}) - 1;
                }
                offset += k * i32(${M("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},$d=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${M("uniforms.pads",a,r)};
                if (k < 0)  {
                  k += i32(${M("uniforms.x_shape",a,t)}]);
                }
                if (k >= i32(${M("uniforms.x_shape",a,t)})) {
                  k -= i32(${M("uniforms.x_shape",a,t)});
                }
                offset += k * i32(${M("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},vd=(e,t,r)=>{switch(r.mode){case 0:return wd(e,t,r.pads.length);case 1:return _d(e,t,r.pads.length);case 2:return bd(e,t,r.pads.length);case 3:return $d(e,t,r.pads.length);default:throw new Error("Invalid mode")}},xd=(e,t)=>{let r=D.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,a=D.size(r),s=[{type:12,data:a},{type:6,data:t.pads}],n=e.length>=3&&e[2].data;t.mode===0&&s.push({type:n?e[2].dataType:1,data:t.value}),s.push(...k(e[0].dims,r));let o=["rank"],u=l=>{let d=j("output",e[0].dataType,r.length),p=C("x",e[0].dataType,i.length),h=p.type.value,m=vd(d,i.length,t),f=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&f.push({name:"constant_value",type:n?h:"f32"}),`
            ${l.registerUniforms(f).declareVariables(p,d)}
            ${l.mainStart()}
            ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${d.offsetToIndices("global_idx")};

            var value = ${h}(0);
            ${m}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${n}`,inputDependencies:o},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(D.size(r)/64)},programUniforms:s}),getShaderSource:u}},Sd=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,a=e[0].dims.length,s=new Int32Array(2*a).fill(0);if(e.length>=4){let o=e[3].getBigInt64Array();for(let u=0;u<o.length;u++)s[Number(o[u])]=Number(r[u]),s[Number(o[u])+a]=Number(r[u+o.length])}else r.forEach((o,u)=>s[Number(u)]=Number(o));let n=[];return s.forEach(o=>n.push(o)),{mode:t.mode,value:i,pads:n}}else return t},Td=(e,t)=>{yd(e.inputs);let r=Sd(e.inputs,t);e.compute(xd(e.inputs,r),{inputs:[0]})}}),ra,Ms,Ds,Ps,Us,Ed,kd,Ns,Ls,Id,zd,qs,Cd,Ad,Vs,Od,Rd,Bd,Md,lh=I(()=>{"use strict";je(),ne(),ae(),Z(),ra=e=>{if(pe.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},Ms=(e,t,r)=>{let i=t.format==="NHWC",a=e.dims.slice();i&&a.splice(1,0,a.pop());let s=Object.hasOwnProperty.call(t,"dilations"),n=t.kernelShape.slice(),o=t.strides.slice(),u=s?t.dilations.slice():[],l=t.pads.slice();Gt.adjustPoolAttributes(r,a,n,o,u,l);let d=Gt.computePoolOutputShape(r,a,o,u,n,l,t.autoPad),p=Object.assign({},t);s?Object.assign(p,{kernelShape:n,strides:o,pads:l,dilations:u,cacheKey:t.cacheKey}):Object.assign(p,{kernelShape:n,strides:o,pads:l,cacheKey:t.cacheKey});let h=d.slice();return h.push(h.splice(1,1)[0]),[p,i?h:d]},Ds=(e,t)=>{let r=t.format==="NHWC",i=D.size(e),a=D.size(t.kernelShape),s=[{type:12,data:i},{type:12,data:a}],n=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let o=t.kernelShape[t.kernelShape.length-1],u=t.strides[t.strides.length-1],l=t.pads[t.pads.length/2-1],d=t.pads[t.pads.length-1],p=!!(l+d);s.push({type:12,data:o},{type:12,data:u},{type:12,data:l},{type:12,data:d}),n.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let h=!1;if(t.kernelShape.length===2){let m=t.kernelShape[t.kernelShape.length-2],f=t.strides[t.strides.length-2],w=t.pads[t.pads.length/2-2],b=t.pads[t.pads.length-2];h=!!(w+b),s.push({type:12,data:m},{type:12,data:f},{type:12,data:w},{type:12,data:b}),n.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[s,n,!0,p,h]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let o=D.computeStrides(t.kernelShape);s.push({type:12,data:o},{type:12,data:t.pads},{type:12,data:t.strides}),n.push({name:"kernelStrides",type:"u32",length:o.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let u=t.pads.reduce((l,d)=>l+d);return[s,n,!!u,!1,!1]}},Ps=(e,t,r,i,a,s,n,o,u,l,d,p)=>{let h=a.format==="NHWC",m=t.type.value,f=j("output",t.type.tensor,i);if(a.kernelShape.length<=2){let w="",b="",_="",y=r-(h?2:1);if(d?w=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${y}] = indices[${y}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${y}] < 0 || xIndices[${y}]
                      >= uniforms.x_shape[${y}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${s}
                }`:w=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${y}] = indices[${y}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${s}
                }`,a.kernelShape.length===2){let x=r-(h?3:2);p?b=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${x}] = indices[${x}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${x}] < 0 || xIndices[${x}] >= uniforms.x_shape[${x}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:b=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${x}] = indices[${x}] * uniforms.sh - uniforms.phStart + j;
                `,_=`
              }
            `}return`
            ${e.registerUniforms(u).declareVariables(t,f)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${f.offsetToIndices("global_idx")};
              var xIndices = ${f.offsetToIndices("global_idx")};

              var value = ${m}(${o});
              var pad = 0;
              ${b}
              ${w}
              ${_}
              ${n}

              output[global_idx] = value;
            }`}else{if(h)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let w=a.kernelShape.length,b=a.pads.length,_="";return l?_=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${s}
              }`:_=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${s}
            `,`
            ${e.registerUniforms(u).declareVariables(t,f)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${f.offsetToIndices("global_idx")};
              var xIndices = ${f.offsetToIndices("global_idx")};

              var offsets: array<u32, ${w}>;

              var value = ${m}(${o});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${w-1}u; j++) {
                  offsets[j] = offset / ${M("uniforms.kernelStrides","j",w)};
                  offset -= offsets[j] * ${M("uniforms.kernelStrides","j",w)};
                }
                offsets[${w-1}] = offset;

                isPad = false;
                for (var j = ${r-w}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${M("uniforms.strides",`j - ${r-w}u`,w)}
                    + offsets[j - ${r-w}u] - ${M("uniforms.pads","j - 2u",b)};
                  ${_}
              }
              ${n}

              output[global_idx] = value;
            }`}},Us=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,Ed=e=>`${Us(e)};${e.countIncludePad}`,kd=e=>`${Us(e)};${e.storageOrder};${e.dilations}`,Ns=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),Ls=(e,t,r,i)=>{let[a,s]=Ms(t,i,r),n=C("x",t.dataType,t.dims.length),o=n.type.value,u="value += x_val;",l="";a.countIncludePad?l+=`value /= ${o}(uniforms.kernelSize);`:l+=`value /= ${o}(i32(uniforms.kernelSize) - pad);`;let[d,p,h,m,f]=Ds(s,a);d.push(...k(t.dims,s));let w=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${h};${m};${f}`,inputDependencies:w},getRunData:()=>({outputs:[{dims:s,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(D.size(s)/64)},programUniforms:d}),getShaderSource:b=>Ps(b,n,t.dims.length,s.length,a,u,l,0,p,h,m,f)}},Id=e=>{let t=e.count_include_pad!==0,r=Ns(e);if(r.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for AveragePool");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:Ed(i)}},zd=(e,t)=>{ra(e.inputs),e.compute(Ls("AveragePool",e.inputs[0],!1,t))},qs={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},Cd=e=>{let t=e.format;return{format:t,...qs,cacheKey:t}},Ad=(e,t)=>{ra(e.inputs),e.compute(Ls("GlobalAveragePool",e.inputs[0],!0,t))},Vs=(e,t,r,i)=>{let[a,s]=Ms(t,i,r),n=`
      value = max(x_val, value);
    `,o="",u=C("x",t.dataType,t.dims.length),l=["rank"],[d,p,h,m,f]=Ds(s,a);return d.push(...k(t.dims,s)),{name:e,shaderCache:{hint:`${i.cacheKey};${h};${m};${f}`,inputDependencies:l},getRunData:()=>({outputs:[{dims:s,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(D.size(s)/64)},programUniforms:d}),getShaderSource:w=>Ps(w,u,t.dims.length,s.length,a,n,o,t.dataType===10?-65504:-1e5,p,h,m,f)}},Od=(e,t)=>{ra(e.inputs),e.compute(Vs("MaxPool",e.inputs[0],!1,t))},Rd=e=>{let t=e.storage_order,r=e.dilations,i=Ns(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for MaxPool");let a={storageOrder:t,dilations:r,...i,cacheKey:""};return{...a,cacheKey:kd(a)}},Bd=e=>{let t=e.format;return{format:t,...qs,cacheKey:t}},Md=(e,t)=>{ra(e.inputs),e.compute(Vs("GlobalMaxPool",e.inputs[0],!0,t))}}),Dd,Pd,Ud,Nd,dh=I(()=>{"use strict";ne(),ae(),$(),Z(),Dd=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[0].dataType===6&&e.length>2)throw new Error("In the case of dequantizing int32 there is no zero point.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((a,s)=>s===t.axis||a===e[0].dims[s]).reduce((a,s)=>a&&s,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},Pd=(e,t)=>{let r=D.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,a=i===3,s=e[0].dims,n=e[1].dataType,o=D.size(s),u=i===3||i===2,l=u?[Math.ceil(D.size(e[0].dims)/4)]:e[0].dims,d=e[1].dims,p=e.length>2?e[2]:void 0,h=p?u?[Math.ceil(D.size(p.dims)/4)]:p.dims:void 0,m=d.length===0||d.length===1&&d[0]===1,f=m===!1&&d.length===1,w=R(o),b=m&&(!u||w===4),_=b?w:1,y=b&&!u?w:1,x=C("input",u?12:i,l.length,y),v=C("scale",n,d.length),E=p?C("zero_point",u?12:i,h.length):void 0,A=j("output",n,s.length,_),B=[x,v];E&&B.push(E);let L=[l,d];p&&L.push(h);let W=[{type:12,data:o/_},{type:12,data:r},{type:12,data:t.blockSize},...k(...L,s)],Q=de=>{let te=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${de.registerUniforms(te).declareVariables(...B,A)}
      ${de.mainStart()}
          ${de.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${A.offsetToIndices("global_idx")};

          // Set input x
          ${u?`
            let input = ${x.getByOffset("global_idx / 4")};
            let x_vec = ${a?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${_===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${x.getByOffset("global_idx")};`};

          // Set scale input
          ${m?`let scale_value= ${v.getByOffset("0")}`:f?`
            let scale_index = ${A.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${v.getByOffset("scale_index")};`:`
            var scale_indices: ${v.type.indices} = output_indices;
            let index = ${v.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${v.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${v.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${E?m?u?`
                let zero_point_input = ${E.getByOffset("0")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${E.getByOffset("0")}`:f?u?`
                let zero_point_index = ${A.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${E.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${A.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${E.getByOffset("zero_point_index")};`:u?`
                let zero_point_offset = ${v.indicesToOffset("scale_indices")};
                let zero_point_input = ${E.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${E.getByIndices("scale_indices")};`:`let zero_point_value = ${u?a?"i32":"u32":x.type.value}(0);`};
      // Compute and write output
      ${A.setByOffset("global_idx",`${A.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:E?["rank","rank","rank"]:["rank","rank"]},getShaderSource:Q,getRunData:()=>({outputs:[{dims:s,dataType:n}],dispatchGroup:{x:Math.ceil(o/_/64),y:1,z:1},programUniforms:W})}},Ud=(e,t)=>{Dd(e.inputs,t),e.compute(Pd(e.inputs,t))},Nd=e=>g({axis:e.axis,blockSize:e.blockSize})}),Ld,qd,Vd,ph=I(()=>{"use strict";je(),ne(),Z(),Ld=(e,t,r)=>{let i=e===t,a=e<t&&r<0,s=e>t&&r>0;if(i||a||s)throw new Error("Range these inputs' contents are invalid.")},qd=(e,t,r,i)=>{let a=Math.abs(Math.ceil((t-e)/r)),s=[a],n=a,o=[{type:12,data:n},{type:i,data:e},{type:i,data:r},...k(s)],u=l=>{let d=j("output",i,s.length),p=d.type.value,h=[{name:"outputSize",type:"u32"},{name:"start",type:p},{name:"delta",type:p}];return`
        ${l.registerUniforms(h).declareVariables(d)}
        ${l.mainStart()}
        ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${p}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:u,getRunData:()=>({outputs:[{dims:s,dataType:i}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:o})}},Vd=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),pe.webgpu.validateInputContent&&Ld(t,r,i),e.compute(qd(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),Fd,Fs,Ws,Wd,Gd,jd,ch=I(()=>{"use strict";ne(),ae(),$(),Z(),Fd=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let a=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,s=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${a}bitcast<${i}>(oldValue) + (${r})${s}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${a}max(bitcast<f32>(oldValue), (${r}))${s}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${a}min(bitcast<${i}>(oldValue), (${r}))${s}`;case"mul":return`${a}(bitcast<${i}>(oldValue) * (${r}))${s}`;default:throw new Error(`Reduction ${e} is not supported.`)}},Fs=(e,t)=>`${e===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[${t?"i - indices_start":"i"}];
    let dim_value = uniforms.output_shape[${t?"i - indices_start":"i"} + uniforms.last_index_dimension];`}
    
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));`,Ws=(e,t,r)=>`for (var i = 0u; i < uniforms.num_updates_elements; i++) {
        let value = updates[uniforms.num_updates_elements * ${r?"global_idx":"idx"} + i];
        ${Fd(e.reduction,"output[data_offset + i]","value",t)}
      }`,Wd=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r,s=1,n=Math.ceil(D.size(i)/s),o=i[i.length-1],u=D.sizeFromDimension(r,o),l=D.sizeFromDimension(i,0)/o,d=[{type:12,data:n},{type:12,data:o},{type:12,data:u},...k(e[1].dims,e[2].dims,a)],p=h=>{let m=C("indices",e[1].dataType,e[1].dims.length),f=C("updates",e[2].dataType,e[2].dims.length,s),w=t.reduction!=="none"&&t.reduction!==""?Ie("output",e[0].dataType,a.length):j("output",e[0].dataType,a.length,s);return`
      ${h.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(m,f,w)}
      ${h.mainStart()}
        ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var hasDuplicates = false;
  if (${t.reduction==="none"}) {
    for (var i = 0; i < ${l}; i = i + 1) {
      for (var j = i + 1; j < ${l}; j = j + 1) {
        var index_i = i32(indices[i].x);
        var index_j = i32(indices[j].x);
        if (index_i == index_j) {
          hasDuplicates = true;
          break;
        }
      }
      if (hasDuplicates) {
        break;
      }
    }
  }

  if (${t.reduction==="none"} && hasDuplicates) {
    if (global_idx != 0u) {
      return;
    }
    // Process each index-update pair individually when duplicates exist
    for (var idx = 0u; idx < ${l}u; idx++) {
      var data_offset = 0u;
      for (var i = 0u; i < uniforms.last_index_dimension; i++) {
        var index = i32(indices[idx * uniforms.last_index_dimension + i].x);
        ${Fs(r.length,!1)}
      }
      ${Ws(t,w.type.value,!1)}
    }
    return;
  }

  var data_offset = 0u;
  var indices_start = uniforms.last_index_dimension * global_idx;
  var indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${Fs(r.length,!0)}
  }
  ${Ws(t,w.type.value,!0)}
  }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:d}),getShaderSource:p}},Gd=e=>g({reduction:e.reduction}),jd=(e,t)=>{e.compute(Wd(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),Hd,Kd,Zd,Gs,Qd,Xd,Yd,Jd,ep,tp,rp,ip,js,ap,sp,np,op,up,lp,dp,hh=I(()=>{"use strict";ne(),ae(),$(),Z(),Hd=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},Kd=(e,t,r)=>{t.every(a=>a>=0&&a<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((a,s)=>i[a]=e[s]),i},Zd=(e,t,r,i,a,s)=>{let[n,o,u]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],l=e[0].dims.length;if(n>0&&e.length>n&&e[n].dims.length>0)e[n].getFloat32Array().forEach(d=>s.push(d));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(o>0&&e.length>o&&e[o].dims.length===1&&e[o].dims[0]>0){if(e[o].getFloat32Array().forEach(d=>i.push(d)),i.length!==0&&i.length!==l&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");Hd(i,t),t.axes.length>0&&Kd(i,t.axes,l).forEach((d,p)=>i[p]=d)}if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0&&(e[u].getBigInt64Array().forEach(d=>a.push(Number(d))),a.length!==0&&a.length!==l&&r>=18&&a.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(a.length!==0&&a.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof a<"u"&&i.length>0&&a.length>l)throw new Error("Resize requires only of scales or sizes to be specified")},Gs=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,Qd=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${Gs("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${Gs("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",Xd=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";case"simple":default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",Yd=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),a=e.length===0?i:e.slice();return t.length>0?(t.forEach((s,n)=>{i[s]=a[n],i[n+r]=a[t.length+n]}),i):a},Jd=(e,t,r,i)=>{let a=[];if(r.length>0)if(i.length>0){if(e.forEach(s=>a.push(s)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((s,n)=>a[s]=r[n])}else r.forEach(s=>a.push(s));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");a=e.map((s,n)=>Math.round(s*t[n]))}return a},ep=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(s=>t[s]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(s=>t[s]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let a=e.slice();return r.axes.length>0?(r.axes.forEach(s=>t[s]=i),r.axes.forEach(s=>a[s]=Math.round(e[s]*t[s]))):(t.fill(i,0,t.length),a.forEach((s,n)=>a[n]=Math.round(s*t[n]))),a},tp=(e,t,r,i,a)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${M("uniforms.scales","i",i)};
        var roi_low = ${M("uniforms.roi","i",a)};
        var roi_hi = ${M("uniforms.roi",`i + ${t.length}`,a)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${M("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${M("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,rp=(e,t,r,i,a,s,n)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${M("uniforms.scales","i",a)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${M("uniforms.roi","i",s)};
          var roi_hi = ${M("uniforms.roi",`i + ${r.length}`,s)};
          var input_shape_i = ${M("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${M("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${n} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,ip=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${M("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,js=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",ap=(e,t,r,i,a)=>{let[s,n,o,u]=r.length===2?[-1,0,1,-1]:[0,2,3,1],l=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${l} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",n,`max(0, min(row, ${r[n]} - 1))`)};
      ${e.indicesSet("input_indices",o,`max(0, min(col, ${r[o]} - 1))`)};
      ${js(e,u,s,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${l} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${l} = originalIndices[${n}];
      var col:${l} = originalIndices[${o}];
      ${i?`if (row < 0 || row > (${r[n]} - 1) || col < 0 || col > (${r[o]} - 1)) {
        return ${a};
      }`:""};
      row = max(0, min(row, ${r[n]} - 1));
      col = max(0, min(col, ${r[o]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${u}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${s}])`:"0"};
      var x11: ${l} = getInputValue(batch, channel, row1, col1);
      var x12: ${l} = getInputValue(batch, channel, row1, col2);
      var x21: ${l} = getInputValue(batch, channel, row2, col1);
      var x22: ${l} = getInputValue(batch, channel, row2, col2);
      var dx1: ${l} = abs(row - ${l}(row1));
      var dx2: ${l} = abs(${l}(row2) - row);
      var dy1: ${l} = abs(col - ${l}(col1));
      var dy2: ${l} = abs(${l}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},sp=(e,t,r,i,a,s,n,o,u,l)=>{let d=r.length===2,p=!0,[h,m]=d?[0,1]:p?[2,3]:[1,2],f=e.type.value,w=b=>{let _=b===h?"row":"col";return`
      fn ${_}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${f} {
        var output_index = ${t.indicesGet("output_indices",b)};
        var originalIdx: ${f} = getOriginalCoordinateFromResizedCoordinate(output_index, ${a[b]},
        ${i[b]}, ${r[b]}, ${s[b]}, ${s[b]} + ${r.length});
        var fractOriginalIdx: ${f} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${o} && (originalIdx < 0 || originalIdx > (${r[b]} - 1))) {
          return ${u};
        }
        var data: array<${f}, 4> = array<${f}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${_}: ${f} = originalIdx + ${f}(i);
          if (${_} < 0 || ${_} >= ${r[b]}) {
            ${l?`coefs[i + 1] = 0.0;
                        continue;`:o?`return ${u};`:`${_} = max(0, min(${_}, ${r[b]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",b,`u32(${_})`)};
          data[i + 1] = ${b===h?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${w(h)};
    ${w(m)};
  fn getCubicInterpolationCoefs(s: ${f}) -> array<${f}, 4> {
    var absS = abs(s);
    var coeffs: array<${f}, 4> = array<${f}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${f} = 1.0 - absS;
    var twoMinusAbsS: ${f} = 2.0 - absS;
    var onePlusAbsS: ${f} = 1.0 + absS;
    coeffs[0] = ((${n} * onePlusAbsS - 5 * ${n}) * onePlusAbsS + 8 * ${n}) * onePlusAbsS - 4 * ${n};
    coeffs[1] = ((${n} + 2) * absS - (${n} + 3)) * absS * absS + 1;
    coeffs[2] = ((${n} + 2) * oneMinusAbsS - (${n} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${n} * twoMinusAbsS - 5 * ${n}) * twoMinusAbsS + 8 * ${n}) * twoMinusAbsS - 4 * ${n};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${f}, 4>, coefs: array<${f}, 4>) -> ${f} {
    var coefsSum: ${f} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${f} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},np=(e,t,r,i,a)=>{let[s,n,o,u,l]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],d=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${d} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",n,`max(0, min(depth, ${r[n]} - 1))`)};
      ${e.indicesSet("input_indices",o,`max(0, min(height, ${r[o]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(width, ${r[u]} - 1))`)};
      ${js(e,l,s,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${d} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${d} = originalIndices[${n}];
      var height:${d} = originalIndices[${o}];
      var width:${d} = originalIndices[${u}];
      ${i?`if (depth < 0 || depth > (${r[n]} - 1) || height < 0 || height > (${r[o]} - 1) || width < 0 || (width > ${r[u]} - 1)) {
      return ${a};
        }`:""};

    depth = max(0, min(depth, ${r[n]} - 1));
      height = max(0, min(height, ${r[o]} - 1));
      width = max(0, min(width, ${r[u]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${l}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${s}])`:"0"};

      var x111: ${d} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${d} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${d} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${d} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${d} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${d} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${d} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${d} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${d} = abs(depth - ${d}(depth1));
      var dx2: ${d} = abs(${d}(depth2) - depth);
      var dy1: ${d} = abs(height - ${d}(height1));
      var dy2: ${d} = abs(${d}(height2) - height);
      var dz1: ${d} = abs(width - ${d}(width1));
      var dz2: ${d} = abs(${d}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},op=(e,t,r,i,a,s)=>{let n=e.dims,o=Yd(s,t.axes,n.length),u=Jd(n,i,a,t.axes),l=i.slice();i.length===0&&(l=n.map((y,x)=>y===0?1:u[x]/y),t.keepAspectRatioPolicy!=="stretch"&&(u=ep(n,l,t)));let d=j("output",e.dataType,u.length),p=C("input",e.dataType,n.length),h=D.size(u),m=n.length===u.length&&n.every((y,x)=>y===u[x]),f=t.coordinateTransformMode==="tf_crop_and_resize",w=t.extrapolationValue,b=p.type.value,_=y=>`
      ${m?"":`
      ${Qd(t.coordinateTransformMode,b)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${ip(p,n)};
              ${Xd(t.nearestMode,r,b)};
              ${rp(p,d,n,u,l.length,o.length,f)};
              `;case"linear":return`
              ${tp(d,n,u,l.length,o.length)};
              ${(()=>{if(n.length===2||n.length===4)return`${ap(p,d,n,f,w)}`;if(n.length===3||n.length===5)return`${np(p,d,n,f,w)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(n.length===2||n.length===4)return`${sp(p,d,n,u,l,o,t.cubicCoeffA,f,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${y.registerUniform("output_size","u32").registerUniform("scales","f32",l.length).registerUniform("roi","f32",o.length).declareVariables(p,d)}
      ${y.mainStart()}
        ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${m?"output[global_idx] = input[global_idx];":`
        let output_indices = ${d.offsetToIndices("global_idx")};
        var input_indices: ${p.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${p.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${n.length===2||n.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${l.length>0?t.mode==="cubic"?l:l.length:""}|${a.length>0?a:""}|${o.length>0?o:""}|${m}|${t.mode==="nearest"?n.length:n}`,inputDependencies:["rank"]},getShaderSource:_,getRunData:()=>({outputs:[{dims:u,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:[{type:12,data:h},{type:1,data:l},{type:1,data:o},...k(n,u)]})}},up=e=>{let t=e.customDataBuffer;return new Uint32Array(t,t.byteOffset,1)[0]},lp=(e,t)=>{let r=[],i=[],a=[],s=up(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");Zd(e.inputs,t,s,r,i,a),e.compute(op(e.inputs[0],t,s,r,i,a),{inputs:[0]})},dp=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,a=e.cubicCoeffA,s=e.excludeOutside!==0,n=e.extrapolationValue,o=e.keepAspectRatioPolicy,u=e.mode,l=e.nearestMode===""?"simple":e.nearestMode;return g({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:a,excludeOutside:s,extrapolationValue:n,keepAspectRatioPolicy:o,mode:u,nearestMode:l})}}),pp,cp,hp,fh=I(()=>{"use strict";ne(),ae(),Z(),pp=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let a=t.dims[t.dims.length-1],s=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==a)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==s)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==a)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let n=e[3];if(n.dims.length!==1)throw new Error("Beta must be 1D");if(n.dims[n.dims.length-1]!==a)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let n=e[4];if(n.dims.length!==1)throw new Error("Bias must be 1D");if(n.dims[n.dims.length-1]!==a)throw new Error("Bias must have the same hidden size as input")}},cp=(e,t,r,i)=>{let a=t.simplified,s=e[0].dims,n=D.size(s),o=s,u=n,l=s.slice(-1)[0],d=i?s.slice(0,-1).concat(1):[],p=!a&&e.length>3,h=e.length>4,m=i&&r>1,f=i&&r>2,w=r>3,b=64,_=R(l),y=[{type:12,data:u},{type:12,data:_},{type:12,data:l},{type:1,data:t.epsilon}],x=E=>{let A=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],B=[C("x",e[0].dataType,e[0].dims,_),C("skip",e[1].dataType,e[1].dims,_),C("gamma",e[2].dataType,e[2].dims,_)];p&&B.push(C("beta",e[3].dataType,e[3].dims,_)),h&&B.push(C("bias",e[4].dataType,e[4].dims,_)),B.push(j("output",e[0].dataType,o,_)),m&&B.push(j("mean_output",1,d)),f&&B.push(j("inv_std_output",1,d)),w&&B.push(j("input_skip_bias_sum",e[0].dataType,o,_));let L=O(e[0].dataType),W=O(1,_);return`

      ${E.registerUniforms(A).declareVariables(...B)}
      var<workgroup> sum_shared : array<${W}, ${b}>;
      var<workgroup> sum_squared_shared : array<${W}, ${b}>;

      ${E.mainStart([b,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${b};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${b};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${b-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${h?"bias[offset1d + i]":L+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${w?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${V(L,_,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${b};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${F("sum",_)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${F("square_sum",_)} / f32(uniforms.hidden_size) ${a?"":"- mean * mean"} + uniforms.epsilon);
        ${m?"mean_output[global_idx] = mean;":""}
        ${f?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${a?"":`- ${L}(mean)`}) *
            ${L}(inv_std_dev) * gamma[offset1d + i]
            ${p?"+ beta[offset1d + i]":""};
        }
      }`},v=[{dims:o,dataType:e[0].dataType}];return r>1&&v.push({dims:d,dataType:1}),r>2&&v.push({dims:d,dataType:1}),r>3&&v.push({dims:s,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${_};${m};${f};${w}`,inputDependencies:e.map((E,A)=>"type")},getShaderSource:x,getRunData:()=>({outputs:v,dispatchGroup:{x:Math.ceil(u/l)},programUniforms:y})}},hp=(e,t)=>{pp(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(cp(e.inputs,t,e.outputCount,!1),{outputs:r})}}),fp,ia,mp,Hs,gp,yp,wp,_p,mh=I(()=>{"use strict";ne(),ae(),$(),Z(),fp=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},ia=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},mp=(e,t)=>{if(e.length>1){let r=ia(e,1),i=ia(e,2),a=ia(e,3);return a.length===0&&(a=[...Array(e[0].dims.length).keys()]),g({starts:r,ends:i,axes:a})}else return t},Hs=(e,t,r,i,a)=>{let s=e;return e<0&&(s+=r[i[t]]),a[t]<0?Math.max(0,Math.min(s,r[i[t]]-1)):Math.max(0,Math.min(s,r[i[t]]))},gp=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length}; i >= 0; i--) {
            let input_shape_i = ${M("uniforms.input_shape","i",r.length)};
            let steps_i = ${M("uniforms.steps","i",r.length)};
            let signs_i = ${M("uniforms.signs","i",r.length)};
            let starts_i = ${M("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,yp=(e,t)=>{let r=e[0].dims,i=D.size(r),a=t.axes.length>0?D.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],s=ia(e,4);s.forEach(_=>_!==0||(()=>{throw new Error("step cannot be 0")})),s.length===0&&(s=Array(a.length).fill(1));let n=t.starts.map((_,y)=>Hs(_,y,r,a,s)),o=t.ends.map((_,y)=>Hs(_,y,r,a,s));if(a.length!==n.length||a.length!==o.length)throw new Error("start, ends and axes should have the same number of elements");if(a.length!==r.length)for(let _=0;_<r.length;++_)a.includes(_)||(n.splice(_,0,0),o.splice(_,0,r[_]),s.splice(_,0,1));let u=s.map(_=>Math.sign(_));s.forEach((_,y,x)=>{if(_<0){let v=(o[y]-n[y])/_,E=n[y],A=E+v*s[y];n[y]=A,o[y]=E,x[y]=-_}});let l=r.slice(0);a.forEach((_,y)=>{l[_]=Math.ceil((o[_]-n[_])/s[_])});let d={dims:l,dataType:e[0].dataType},p=j("output",e[0].dataType,l.length),h=C("input",e[0].dataType,e[0].dims.length),m=D.size(l),f=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:n.length},{name:"signs",type:"i32",length:u.length},{name:"steps",type:"u32",length:s.length}],w=[{type:12,data:m},{type:12,data:n},{type:6,data:u},{type:12,data:s},...k(e[0].dims,l)],b=_=>`
      ${_.registerUniforms(f).declareVariables(h,p)}
        ${gp(h,p,r)}
        ${_.mainStart()}
          ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${p.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${p.setByOffset("global_idx",h.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${u.length}_${n.length}_${s.length}`,inputDependencies:["rank"]},getShaderSource:b,getRunData:()=>({outputs:[d],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:w})}},wp=(e,t)=>{fp(e.inputs,t);let r=mp(e.inputs,t);e.compute(yp(e.inputs,r),{inputs:[0]})},_p=e=>{let t=e.starts,r=e.ends,i=e.axes;return g({starts:t,ends:r,axes:i})}}),bp,$p,vp,xp,gh=I(()=>{"use strict";ne(),ae(),$(),we(),Z(),bp=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},$p=(e,t)=>{let r=e.inputs[0],i=r.dims,a=D.size(i),s=i.length,n=D.normalizeAxis(t.axis,s),o=n<i.length-1,u,l=[];o?(l=Array.from({length:s},(B,L)=>L),l[n]=s-1,l[s-1]=n,u=e.compute(Re(r,l),{inputs:[r],outputs:[-1]})[0]):u=r;let d=u.dims,p=d[s-1],h=a/p,m=R(p),f=p/m,w=64;h===1&&(w=256);let b=(B,L)=>L===4?`max(max(${B}.x, ${B}.y), max(${B}.z, ${B}.w))`:L===2?`max(${B}.x, ${B}.y)`:L===3?`max(max(${B}.x, ${B}.y), ${B}.z)`:B,_=C("x",u.dataType,u.dims,m),y=j("result",u.dataType,u.dims,m),x=_.type.value,v=O(u.dataType)==="f32"?`var threadMax = ${x}(-3.402823e+38f);`:`var threadMax = ${x}(-65504.0h);`,E=B=>`
      var<workgroup> rowMaxShared : ${x};
      var<workgroup> rowSumShared : ${x};
      var<workgroup> threadShared : array<${x}, ${w}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${x} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${x}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${B.registerUniform("packedCols","i32").declareVariables(_,y)}
      ${B.mainStart(w)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${w};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${v}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${x}(${b("threadShared[0]",m)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${x}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${x}(${F("threadShared[0]",m)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          let value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          setValue(row, col, row_stride, value);
        }
      }`,A=e.compute({name:"Softmax",shaderCache:{hint:`${m};${w}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:d,dataType:u.dataType}],dispatchGroup:{x:h},programUniforms:[{type:6,data:f}]}),getShaderSource:E},{inputs:[u],outputs:[o?-1:0]})[0];o&&e.compute(Re(A,l),{inputs:[A]})},vp=(e,t)=>{bp(e.inputs),$p(e,t)},xp=e=>g({axis:e.axis})}),Ks,Sp,Tp,Ep,kp,yh=I(()=>{"use strict";ne(),ae(),Z(),Ks=e=>Array.from(e.getBigInt64Array(),Number),Sp=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(Ks(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},Tp=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},Ep=(e,t)=>{let r=e[0].dims,i=t??Ks(e[1]),a=Tp(r,i),s=D.size(a),n=e[0].dataType,o=C("input",n,r.length),u=j("output",n,a.length),l=d=>`
      const inputShape = ${o.indices(...r)};
      ${d.registerUniform("output_size","u32").declareVariables(o,u)}
      ${d.mainStart()}
      ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${u.offsetToIndices("global_idx")};
      var input_indices: ${o.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${o.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${u.indicesGet("output_indices","i")}  % input_dim_i;

        ${o.indicesSet("input_indices","i","input_dim_value")}
      }
      ${u.setByOffset("global_idx",o.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:[{type:12,data:s},...k(e[0].dims,a)]}),getShaderSource:l}},kp=e=>{Sp(e.inputs),e.compute(Ep(e.inputs),{inputs:[0]})}}),Ip,zp,Cp,wh=I(()=>{"use strict";ne(),ae(),Z(),Ip=(e,t,r,i,a)=>{let s=j("output_data",a,r.length,4),n=C("a_data",t[1].dataType,t[1].dims.length,4),o=C("b_data",t[2].dataType,t[2].dims.length,4),u=C("c_data",t[0].dataType,t[0].dims.length,4),l,d=(p,h,m)=>`select(${h}, ${p}, ${m})`;if(!i)l=s.setByOffset("global_idx",d(n.getByOffset("global_idx"),o.getByOffset("global_idx"),u.getByOffset("global_idx")));else{let p=(h,m,f="")=>{let w=`a_data[index_a${m}][component_a${m}]`,b=`b_data[index_b${m}][component_b${m}]`,_=`bool(c_data[index_c${m}] & (0xffu << (component_c${m} * 8)))`;return`
            let output_indices${m} = ${s.offsetToIndices(`global_idx * 4u + ${m}u`)};
            let offset_a${m} = ${n.broadcastedIndicesToOffset(`output_indices${m}`,s)};
            let offset_b${m} = ${o.broadcastedIndicesToOffset(`output_indices${m}`,s)};
            let offset_c${m} = ${u.broadcastedIndicesToOffset(`output_indices${m}`,s)};
            let index_a${m} = offset_a${m} / 4u;
            let index_b${m} = offset_b${m} / 4u;
            let index_c${m} = offset_c${m} / 4u;
            let component_a${m} = offset_a${m} % 4u;
            let component_b${m} = offset_b${m} % 4u;
            let component_c${m} = offset_c${m} % 4u;
            ${h}[${m}] = ${f}(${d(w,b,_)});
          `};a===9?l=`
            var data = vec4<u32>(0);
            ${p("data",0,"u32")}
            ${p("data",1,"u32")}
            ${p("data",2,"u32")}
            ${p("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:l=`
            ${p("output_data[global_idx]",0)}
            ${p("output_data[global_idx]",1)}
            ${p("output_data[global_idx]",2)}
            ${p("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(u,n,o,s)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${l}
      }`},zp=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,a=e[1].dataType,s=!(D.areEqual(t,r)&&D.areEqual(r,i)),n=t,o=D.size(t);if(s){let l=At.calcShape(At.calcShape(t,r,!1),i,!1);if(!l)throw new Error("Can't perform where op on the given tensors");n=l,o=D.size(n)}let u=Math.ceil(o/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:l=>Ip(l,e,n,s,a),getRunData:()=>({outputs:[{dims:n,dataType:a}],dispatchGroup:{x:Math.ceil(o/64/4)},programUniforms:[{type:12,data:u},...k(i,t,r,n)]})}},Cp=e=>{e.compute(zp(e.inputs))}}),Ap,_h=I(()=>{"use strict";Rc(),us(),Bc(),Mc(),Dc(),Pc(),Uc(),Fc(),Gc(),jc(),Hc(),Kc(),Zc(),Qc(),Xc(),Yc(),Jc(),eh(),th(),rh(),ih(),ah(),sh(),nh(),oh(),Fl(),uh(),lh(),dh(),ph(),ch(),ss(),hh(),Jl(),fh(),mh(),gh(),Ql(),yh(),we(),cs(),wh(),Ap=new Map([["Abs",[po]],["Acos",[co]],["Acosh",[ho]],["Add",[eu]],["ArgMax",[Zn,os]],["ArgMin",[Kn,os]],["Asin",[fo]],["Asinh",[mo]],["Atan",[go]],["Atanh",[yo]],["Attention",[to]],["AveragePool",[zd,Id]],["BatchNormalization",[so]],["BiasAdd",[uo]],["BiasSplitGelu",[Xo]],["Cast",[_o,wo]],["Ceil",[vo]],["Clip",[$o]],["Concat",[fu,mu]],["Conv",[Ts,xs]],["ConvTranspose",[Vu,Nu]],["Cos",[xo]],["Cosh",[So]],["CumSum",[Wu,Gu]],["DepthToSpace",[Zu,Qu]],["DequantizeLinear",[Ud,Nd]],["Div",[tu]],["Einsum",[rl,il]],["Elu",[To,Xi]],["Equal",[ru]],["Erf",[Eo]],["Exp",[ko]],["Expand",[ol]],["FastGelu",[ll]],["Floor",[Io]],["FusedConv",[Ts,xs]],["Gather",[hl,cl]],["GatherElements",[Sl,xl]],["GatherBlockQuantized",[_l,bl]],["GatherND",[ml,gl]],["Gelu",[zo]],["Gemm",[Il,kl]],["GlobalAveragePool",[Ad,Cd]],["GlobalMaxPool",[Md,Bd]],["Greater",[nu]],["GreaterOrEqual",[uu]],["GridSample",[Pl,Ul]],["GroupQueryAttention",[id]],["HardSigmoid",[Po,Do]],["InstanceNormalization",[nd]],["LayerNormalization",[ld]],["LeakyRelu",[Co,Xi]],["Less",[ou]],["LessOrEqual",[lu]],["Log",[Go]],["MatMul",[pd]],["MatMulNBits",[md,gd]],["MaxPool",[Od,Rd]],["Mul",[iu]],["MultiHeadAttention",[Vl,Ll]],["Neg",[Oo]],["Not",[Ao]],["Pad",[Td]],["Pow",[au]],["QuickGelu",[Ko,Xi]],["Range",[Vd]],["Reciprocal",[Ro]],["ReduceMin",[Fn]],["ReduceMean",[Un]],["ReduceMax",[Vn]],["ReduceSum",[Gn]],["ReduceProd",[Wn]],["ReduceL1",[Nn]],["ReduceL2",[Ln]],["ReduceLogSum",[Hn]],["ReduceLogSumExp",[qn]],["ReduceSumSquare",[jn]],["Relu",[Bo]],["Resize",[lp,dp]],["RotaryEmbedding",[Yl]],["ScatterND",[jd,Gd]],["Sigmoid",[Mo]],["Sin",[Uo]],["Sinh",[No]],["Slice",[wp,_p]],["SkipLayerNormalization",[hp]],["Split",[Kl,Zl]],["Sqrt",[Lo]],["Softmax",[vp,xp]],["Sub",[su]],["Tan",[qo]],["Tanh",[Vo]],["ThresholdedRelu",[Wo,Xi]],["Tile",[kp]],["Transpose",[pt,Ki]],["Where",[Cp]]])}),Op,bh=I(()=>{"use strict";je(),ut(),Z(),Op=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,a){Ge(e.programInfo.name);let s=this.backend.device,n=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let o=[];for(let l of t)o.push({binding:o.length,resource:{buffer:l.buffer}});for(let l of r)o.push({binding:o.length,resource:{buffer:l.buffer}});a&&o.push({binding:o.length,resource:a});let u=s.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:o,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let l={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:u,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(l)}n.setPipeline(e.computePipeline),n.setBindGroup(0,u),n.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),Ve(e.programInfo.name)}dispose(){}build(e,t){Ge(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(l=>{r.features.has(l.feature)&&i.push(`enable ${l.extension};`)});let a=$e(t,this.backend.device.limits),s=e.getShaderSource(a),n=`${i.join(`
`)}
${a.additionalImplementations}
${s}`,o=r.createShaderModule({code:n,label:e.name});be("verbose",()=>`[WebGPU] ${e.name} shader code: ${n}`);let u=r.createComputePipeline({compute:{module:o,entryPoint:"main"},layout:"auto",label:e.name});return Ve(e.name),{programInfo:e,computePipeline:u,uniformVariablesInfo:a.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,a=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=a&&r<=a&&i<=a)return[t,r,i];let s=t*r*i,n=Math.ceil(Math.sqrt(s));if(n>a){if(n=Math.ceil(Math.cbrt(s)),n>a)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[n,n,n]}else return[n,n,1]}}}),Rp={};ue(Rp,{WebGpuBackend:()=>Pp});var Bp,Mp,Dp,Pp,$h=I(()=>{"use strict";je(),ne(),ut(),jt(),is(),_h(),bh(),Bp=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let a=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${a}`);break}case"rank":{let s=e[i].dims.length;r.push(`${a};${s}`);break}case"dims":{let s=e[i].dims.join(",");r.push(`${a};${s}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},Mp=(e,t,r)=>{let i=e.name;return e.shaderCache?.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${Bp(t,e.shaderCache?.inputDependencies??new Array(t.length).fill("dims"))}`,i},Dp=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},Pp=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},a=s=>t.features.has(s)&&r.push(s)&&!0;a("chromium-experimental-timestamp-query-inside-passes")||a("timestamp-query"),a("shader-f16"),a("subgroups"),this.device=await t.requestDevice(i),this.adapterInfo=new Dp(t.info||await t.requestAdapterInfo()),this.gpuDataManager=fa(this),this.programManager=new Op(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,qr(e.logLevel,!!e.debug),this.device.onuncapturederror=s=>{s.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${s.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!1}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose()}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;Ge(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let i=0;i<t.length/2;i++){let a=r[i],s=a.kernelId,n=this.kernels.get(s),o=n.kernelType,u=n.kernelName,l=a.programName,d=a.inputTensorViews,p=a.outputTensorViews,h=t[i*2],m=t[i*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=h);let f=Number(h-this.queryTimeBase),w=Number(m-this.queryTimeBase);if(!Number.isSafeInteger(f)||!Number.isSafeInteger(w))throw new RangeError("incorrect timestamp range");if(this.env.webgpu.profiling?.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:d.map(b=>({dims:b.dims,dataType:st(b.dataType)})),outputsMetadata:p.map(b=>({dims:b.dims,dataType:st(b.dataType)})),kernelId:s,kernelType:o,kernelName:u,programName:l,startTime:f,endTime:w});else{let b="";d.forEach((y,x)=>{b+=`input[${x}]: [${y.dims}] | ${st(y.dataType)}, `});let _="";p.forEach((y,x)=>{_+=`output[${x}]: [${y.dims}] | ${st(y.dataType)}, `}),console.log(`[profiling] kernel "${s}|${o}|${u}|${l}" ${b}${_}execution time: ${w-f} ns`)}zt("GPU",`${l}::${h}::${m}`)}e.unmap(),this.pendingQueries.delete(e)}),Ve()}run(e,t,r,i,a,s){Ge(e.name);let n=[];for(let y=0;y<t.length;++y){let x=t[y].data;if(x===0)continue;let v=this.gpuDataManager.get(x);if(!v)throw new Error(`no GPU data for input: ${x}`);n.push(v)}let{outputs:o,dispatchGroup:u,programUniforms:l}=e.getRunData(t),d=r.length===0?o.map((y,x)=>x):r;if(d.length!==o.length)throw new Error(`Output size ${d.length} must be equal to ${o.length}.`);let p=[],h=[];for(let y=0;y<o.length;++y){if(!Number.isInteger(d[y])||d[y]<-3||d[y]>=s)throw new Error(`Invalid output index: ${d[y]}`);if(d[y]===-3)continue;let x=d[y]===-1,v=d[y]===-2,E=x||v?a(o[y].dataType,o[y].dims):i(d[y],o[y].dataType,o[y].dims);if(p.push(E),E.data===0)continue;let A=this.gpuDataManager.get(E.data);if(!A)throw new Error(`no GPU data for output: ${E.data}`);if(x&&this.temporaryData.push(A),v){let B=this.kernelPersistentData.get(this.currentKernelId);B||(B=[],this.kernelPersistentData.set(this.currentKernelId,B)),B.push(A)}h.push(A)}if(n.length!==t.length||h.length!==p.length){if(h.length===0)return Ve(e.name),p;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let m;if(l){let y=0,x=[];l.forEach(B=>{let L=typeof B.data=="number"?[B.data]:B.data;if(L.length===0)return;let W=B.type===10?2:4,Q,de;B.type===10?(de=L.length>4?16:L.length>2?8:L.length*W,Q=L.length>4?16:W*L.length):(de=L.length<=2?L.length*W:16,Q=16),y=Math.ceil(y/de)*de,x.push(y);let te=B.type===10?8:4;y+=L.length>4?Math.ceil(L.length/te)*Q:L.length*W});let v=16;y=Math.ceil(y/v)*v;let E=new ArrayBuffer(y);l.forEach((B,L)=>{let W=x[L],Q=typeof B.data=="number"?[B.data]:B.data;if(B.type===6)new Int32Array(E,W,Q.length).set(Q);else if(B.type===12)new Uint32Array(E,W,Q.length).set(Q);else if(B.type===10)new Uint16Array(E,W,Q.length).set(Q);else if(B.type===1)new Float32Array(E,W,Q.length).set(Q);else throw new Error(`Unsupported uniform type: ${st(B.type)}`)});let A=this.gpuDataManager.create(y,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(A.buffer,0,E,0,y),this.gpuDataManager.release(A.id),m={offset:0,size:y,buffer:A.buffer}}let f=this.programManager.normalizeDispatchGroupSize(u),w=f[1]===1&&f[2]===1,b=Mp(e,t,w),_=this.programManager.getArtifact(b);if(_||(_=this.programManager.build(e,f),this.programManager.setArtifact(b,_),be("info",()=>`[artifact] key: ${b}, programName: ${e.name}`)),l&&_.uniformVariablesInfo){if(l.length!==_.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${_.uniformVariablesInfo.length}, got ${l.length} in program "${_.programInfo.name}".`);for(let y=0;y<l.length;y++){let x=l[y],v=x.type,E=typeof x.data=="number"?1:x.data.length,[A,B]=_.uniformVariablesInfo[y];if(v!==A||E!==B)throw new Error(`Uniform variable ${y} mismatch: expect type ${A} with size ${B}, got type ${v} with size ${E} in program "${_.programInfo.name}".`)}}if(be("info",()=>`[ProgramManager] run "${e.name}" (key=${b}) with ${f[0]}x${f[1]}x${f[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let y={kernelId:this.currentKernelId,programName:_.programInfo.name,inputTensorViews:t,outputTensorViews:p};this.pendingKernels.push(y),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(y)}return this.programManager.run(_,n,h,f,m),Ve(e.name),p}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let a=Ap.get(e);if(!a)throw new Error(`kernel not implemented: ${e}`);let s={kernelType:e,kernelName:i,kernelEntry:a[0],attributes:[a[1],r]};this.kernels.set(t,s)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let a=i.kernelType,s=i.kernelName,n=i.kernelEntry,o=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${a}] ${s}" is not allowed to be called recursively`);this.currentKernelId=e,o[0]&&(o[1]=o[0](o[1]),o[0]=void 0),be("info",()=>`[WebGPU] Start to run kernel "[${a}] ${s}"...`);let u=this.env.debug;this.temporaryData=[];try{return u&&this.device.pushErrorScope("validation"),n(t,o[1]),0}catch(l){return r.push(Promise.resolve(`[WebGPU] Kernel "[${a}] ${s}" failed. ${l}`)),1}finally{u&&r.push(this.device.popErrorScope().then(l=>l?`GPU validation error for kernel "[${a}] ${s}": ${l.message}`:null));for(let l of this.temporaryData)this.gpuDataManager.release(l.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let a=this.sessionExternalDataMapping.get(e);a||(a=new Map,this.sessionExternalDataMapping.set(e,a));let s=a.get(t),n=this.gpuDataManager.registerExternalBuffer(r,i,s);return a.set(t,[n,r]),n}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await Gi(this,e,t);return Ot(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){this.queryType="none",(this.env.webgpu.profiling?.mode==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){be("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){be("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){be("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let a=this.getComputePassEncoder(),s=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),a.setPipeline(s.computePipeline),a.setBindGroup(0,s.bindGroup),a.dispatchWorkgroups(...s.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),Up={};ue(Up,{init:()=>Lp});var ka,Np,Lp,vh=I(()=>{"use strict";ne(),ut(),ae(),Wi(),ka=class pc{constructor(t,r,i,a){this.module=t,this.dataType=r,this.data=i,this.dims=a}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=D.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=D.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=D.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=D.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(D.size(t)!==D.size(this.dims))throw new Error("Invalid new shape");return new pc(this.module,this.dataType,this.data,t)}},Np=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let i=e.PTR_SIZE,a=r/e.PTR_SIZE,s=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*a++,s));let n=Number(e.getValue(i*a++,s));this.outputCount=Number(e.getValue(i*a++,s)),this.customDataOffset=Number(e.getValue(i*a++,"*")),this.customDataSize=Number(e.getValue(i*a++,s));let o=[];for(let u=0;u<n;u++){let l=Number(e.getValue(i*a++,s)),d=Number(e.getValue(i*a++,"*")),p=Number(e.getValue(i*a++,s)),h=[];for(let m=0;m<p;m++)h.push(Number(e.getValue(i*a++,s)));o.push(new ka(e,l,d,h))}this.inputs=o}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){let r=t?.inputs?.map(n=>typeof n=="number"?this.inputs[n]:n)??this.inputs,i=t?.outputs??[],a=(n,o,u)=>new ka(this.module,o,this.output(n,u),u),s=(n,o)=>{let u=nt(n,o);if(!u)throw new Error(`Unsupported data type: ${n}`);let l=u>0?this.backend.gpuDataManager.create(u).id:0;return new ka(this.module,n,l,o)};return this.backend.run(e,r,i,a,s,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,a=i===4?"i32":"i64",s=this.module.stackAlloc((1+t.length)*i);this.module.setValue(s,t.length,a);for(let n=0;n<t.length;n++)this.module.setValue(s+i*(n+1),t[n],a);return this.module._JsepOutput(this.opKernelContext,e,s)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},Lp=async(e,t,r,i)=>{let a=t.jsepInit;if(!a)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let s=($h(),re(Rp)).WebGpuBackend,n=new s;await n.initialize(r,i),a("webgpu",[n,o=>n.alloc(Number(o)),o=>n.free(o),(o,u,l,d=!1)=>{if(d)be("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(o)}, dst=${Number(u)}, size=${Number(l)}`),n.memcpy(Number(o),Number(u));else{be("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(o)}, gpuDataId=${Number(u)}, size=${Number(l)}`);let p=t.HEAPU8.subarray(Number(o>>>0),Number(o>>>0)+Number(l));n.upload(Number(u),p)}},async(o,u,l)=>{be("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${o}, dataOffset=${u}, size=${l}`),await n.download(Number(o),()=>t.HEAPU8.subarray(Number(u)>>>0,Number(u+l)>>>0))},(o,u,l)=>n.createKernel(o,Number(u),l,t.UTF8ToString(t._JsepGetNodeName(Number(u)))),o=>n.releaseKernel(o),(o,u,l,d)=>{be("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${l}, kernel=${o}, contextDataOffset=${u}`);let p=new Np(t,n,Number(u));return n.computeKernel(Number(o),p,d)},()=>n.captureBegin(),()=>n.captureEnd(),()=>n.replay()])}else{let s=new Fi(r);a("webnn",[s,()=>s.reserveTensorId(),n=>s.releaseTensorId(n),async(n,o,u,l,d)=>s.ensureTensor(n,o,u,l,d),(n,o)=>{s.uploadTensor(n,o)},async(n,o)=>s.downloadTensor(n,o)])}}}),qp,Zs,Qs,Qt,Vp,Xs,Ia,Ys,Js,en,tn,rn,an,Fp=I(()=>{"use strict";ts(),rs(),ne(),it(),gr(),Pi(),qp=(e,t)=>{le()._OrtInit(e,t)!==0&&se("Can't initialize onnxruntime.")},Zs=async e=>{qp(e.wasm.numThreads,wr(e.logLevel))},Qs=async(e,t)=>{le().asyncInit?.();{let r=(vh(),re(Up)).init;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");let i=e.webgpu.adapter;if(i){if(typeof i.limits!="object"||typeof i.features!="object"||typeof i.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let a=e.webgpu.powerPreference;if(a!==void 0&&a!=="low-power"&&a!=="high-performance")throw new Error(`Invalid powerPreference setting: "${a}"`);let s=e.webgpu.forceFallbackAdapter;if(s!==void 0&&typeof s!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${s}"`);if(i=await navigator.gpu.requestAdapter({powerPreference:a,forceFallbackAdapter:s}),!i)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}await r("webgpu",le(),e,i)}if(t==="webnn"){if(typeof navigator>"u"||!navigator.ml)throw new Error("WebNN is not supported in current environment");await r("webnn",le(),e)}}},Qt=new Map,Vp=e=>{let t=le(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,a,a+i)!==0&&se("Can't get session input/output count.");let s=i===4?"i32":"i64";return[Number(t.getValue(a,s)),Number(t.getValue(a+i,s))]}finally{t.stackRestore(r)}},Xs=(e,t)=>{let r=le(),i=r.stackSave(),a=0;try{let s=r.PTR_SIZE,n=r.stackAlloc(2*s);r._OrtGetInputOutputMetadata(e,t,n,n+s)!==0&&se("Can't get session input/output metadata.");let o=Number(r.getValue(n,"*"));a=Number(r.getValue(n+s,"*"));let u=r.HEAP32[a/4];if(u===0)return[o,0];let l=r.HEAPU32[a/4+1],d=[];for(let p=0;p<l;p++){let h=Number(r.getValue(a+8+p*s,"*"));d.push(h!==0?r.UTF8ToString(h):Number(r.getValue(a+8+(p+l)*s,"*")))}return[o,u,d]}finally{r.stackRestore(i),a!==0&&r._OrtFree(a)}},Ia=e=>{let t=le(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},Ys=async(e,t)=>{let r,i,a=le();Array.isArray(e)?[r,i]=e:e.buffer===a.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=Ia(e);let s=0,n=0,o=0,u=[],l=[],d=[];try{if([n,u]=await Di(t),t?.externalData&&a.mountExternalData){let v=[];for(let E of t.externalData){let A=typeof E=="string"?E:E.path;v.push($r(typeof E=="string"?E:E.data).then(B=>{a.mountExternalData(A,B)}))}await Promise.all(v)}for(let v of t?.executionProviders??[])if((typeof v=="string"?v:v.name)==="webnn"){if(a.shouldTransferToMLTensor=!1,typeof v!="string"){let E=v,A=E?.context,B=E?.gpuDevice,L=E?.deviceType,W=E?.powerPreference;A?a.currentContext=A:B?a.currentContext=await a.webnnCreateMLContext(B):a.currentContext=await a.webnnCreateMLContext({deviceType:L,powerPreference:W})}else a.currentContext=await a.webnnCreateMLContext();break}s=await a._OrtCreateSession(r,i,n),a.webgpuOnCreateSession?.(s),s===0&&se("Can't create a session."),a.jsepOnCreateSession?.(),a.currentContext&&(a.webnnRegisterMLContext(s,a.currentContext),a.currentContext=void 0,a.shouldTransferToMLTensor=!0);let[p,h]=Vp(s),m=!!t?.enableGraphCapture,f=[],w=[],b=[],_=[],y=[];for(let v=0;v<p;v++){let[E,A,B]=Xs(s,v);E===0&&se("Can't get an input name."),l.push(E);let L=a.UTF8ToString(E);f.push(L),b.push(A===0?{name:L,isTensor:!1}:{name:L,isTensor:!0,type:st(A),shape:B})}for(let v=0;v<h;v++){let[E,A,B]=Xs(s,v+p);E===0&&se("Can't get an output name."),d.push(E);let L=a.UTF8ToString(E);w.push(L),_.push(A===0?{name:L,isTensor:!1}:{name:L,isTensor:!0,type:st(A),shape:B});{if(m&&t?.preferredOutputLocation===void 0){y.push("gpu-buffer");continue}let W=typeof t?.preferredOutputLocation=="string"?t.preferredOutputLocation:t?.preferredOutputLocation?.[L]??"cpu",Q=a.webnnIsGraphOutput;if(W==="cpu"&&Q&&Q(s,L)){y.push("ml-tensor-cpu-output");continue}if(W!=="cpu"&&W!=="cpu-pinned"&&W!=="gpu-buffer"&&W!=="ml-tensor")throw new Error(`Not supported preferred output location: ${W}.`);if(m&&W!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${W}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);y.push(W)}}let x=null;return y.some(v=>v==="gpu-buffer"||v==="ml-tensor"||v==="ml-tensor-cpu-output")&&(o=a._OrtCreateBinding(s),o===0&&se("Can't create IO binding."),x={handle:o,outputPreferredLocations:y,outputPreferredLocationsEncoded:y.map(v=>v==="ml-tensor-cpu-output"?"ml-tensor":v).map(v=>Ur(v))}),Qt.set(s,[s,l,d,x,m,!1]),[s,f,w,b,_]}catch(p){throw l.forEach(h=>a._OrtFree(h)),d.forEach(h=>a._OrtFree(h)),o!==0&&a._OrtReleaseBinding(o)!==0&&se("Can't release IO binding."),s!==0&&a._OrtReleaseSession(s)!==0&&se("Can't release session."),p}finally{a._free(r),n!==0&&a._OrtReleaseSessionOptions(n)!==0&&se("Can't release session options."),u.forEach(p=>a._free(p)),a.unmountExternalData?.()}},Js=e=>{let t=le(),r=Qt.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,a,s,n,o]=r;n&&(o&&t._OrtClearBoundOutputs(n.handle)!==0&&se("Can't clear bound outputs."),t._OrtReleaseBinding(n.handle)!==0&&se("Can't release IO binding.")),t.jsepOnReleaseSession?.(e),t.webnnOnReleaseSession?.(e),t.webgpuOnReleaseSession?.(e),a.forEach(u=>t._OrtFree(u)),s.forEach(u=>t._OrtFree(u)),t._OrtReleaseSession(i)!==0&&se("Can't release session."),Qt.delete(e)},en=async(e,t,r,i,a,s,n=!1)=>{if(!e){t.push(0);return}let o=le(),u=o.PTR_SIZE,l=e[0],d=e[1],p=e[3],h=p,m,f;if(l==="string"&&(p==="gpu-buffer"||p==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(n&&p!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${s} when enableGraphCapture is true.`);if(p==="gpu-buffer"){let _=e[2].gpuBuffer;f=nt(at(l),d);{let y=o.jsepRegisterBuffer;if(!y)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');m=y(i,s,_,f)}}else if(p==="ml-tensor"){let _=e[2].mlTensor;f=nt(at(l),d);let y=o.webnnRegisterMLTensor;if(!y)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');m=y(i,_,at(l),d)}else{let _=e[2];if(Array.isArray(_)){f=u*_.length,m=o._malloc(f),r.push(m);for(let y=0;y<_.length;y++){if(typeof _[y]!="string")throw new TypeError(`tensor data at index ${y} is not a string`);o.setValue(m+y*u,De(_[y],r),"*")}}else{let y=o.webnnIsGraphInput,x=o.webnnIsGraphOutput;if(l!=="string"&&y&&x){let v=o.UTF8ToString(a);if(y(i,v)||x(i,v)){let E=at(l);f=nt(E,d),h="ml-tensor";let A=o.webnnCreateTemporaryTensor,B=o.webnnUploadTensor;if(!A||!B)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let L=await A(i,E,d);B(L,new Uint8Array(_.buffer,_.byteOffset,_.byteLength)),m=L}else f=_.byteLength,m=o._malloc(f),r.push(m),o.HEAPU8.set(new Uint8Array(_.buffer,_.byteOffset,f),m)}else f=_.byteLength,m=o._malloc(f),r.push(m),o.HEAPU8.set(new Uint8Array(_.buffer,_.byteOffset,f),m)}}let w=o.stackSave(),b=o.stackAlloc(4*d.length);try{d.forEach((y,x)=>o.setValue(b+x*u,y,u===4?"i32":"i64"));let _=o._OrtCreateTensor(at(l),m,f,b,d.length,Ur(h));_===0&&se(`Can't create tensor for input/output. session=${i}, index=${s}.`),t.push(_)}finally{o.stackRestore(w)}},tn=async(e,t,r,i,a,s)=>{let n=le(),o=n.PTR_SIZE,u=Qt.get(e);if(!u)throw new Error(`cannot run inference. invalid session id: ${e}`);let l=u[0],d=u[1],p=u[2],h=u[3],m=u[4],f=u[5],w=t.length,b=i.length,_=0,y=[],x=[],v=[],E=[],A=n.stackSave(),B=n.stackAlloc(w*o),L=n.stackAlloc(w*o),W=n.stackAlloc(b*o),Q=n.stackAlloc(b*o);try{[_,y]=Ai(s);for(let Y=0;Y<w;Y++)await en(r[Y],x,E,e,d[t[Y]],t[Y],m);for(let Y=0;Y<b;Y++)await en(a[Y],v,E,e,p[i[Y]],w+i[Y],m);for(let Y=0;Y<w;Y++)n.setValue(B+Y*o,x[Y],"*"),n.setValue(L+Y*o,d[t[Y]],"*");for(let Y=0;Y<b;Y++)n.setValue(W+Y*o,v[Y],"*"),n.setValue(Q+Y*o,p[i[Y]],"*");if(h&&!f){let{handle:Y,outputPreferredLocations:_e,outputPreferredLocationsEncoded:oe}=h;if(d.length!==w)throw new Error(`input count from feeds (${w}) is expected to be always equal to model's input count (${d.length}).`);for(let J=0;J<w;J++){let Se=t[J];await n._OrtBindInput(Y,d[Se],x[J])!==0&&se(`Can't bind input[${J}] for session=${e}.`)}for(let J=0;J<b;J++){let Se=i[J];a[J]?.[3]?n._OrtBindOutput(Y,p[Se],v[J],0)!==0&&se(`Can't bind pre-allocated output[${J}] for session=${e}.`):n._OrtBindOutput(Y,p[Se],0,oe[Se])!==0&&se(`Can't bind output[${J}] to ${_e[J]} for session=${e}.`)}Qt.set(e,[l,d,p,h,m,!0])}n.jsepOnRunStart?.(l),n.webnnOnRunStart?.(l);let de;h?de=await n._OrtRunWithBinding(l,h.handle,b,W,_):de=await n._OrtRun(l,L,B,w,Q,b,W,_),de!==0&&se("failed to call OrtRun().");let te=[],he=[];for(let Y=0;Y<b;Y++){let _e=Number(n.getValue(W+Y*o,"*"));if(_e===v[Y]){te.push(a[Y]);continue}let oe=n.stackSave(),J=n.stackAlloc(4*o),Se=!1,ie,Ae=0;try{n._OrtGetTensorData(_e,J,J+o,J+2*o,J+3*o)!==0&&se(`Can't access output tensor data on index ${Y}.`);let G=o===4?"i32":"i64",X=Number(n.getValue(J,G));Ae=n.getValue(J+o,"*");let ge=n.getValue(J+o*2,"*"),ke=Number(n.getValue(J+o*3,G)),Ze=[];for(let Qe=0;Qe<ke;Qe++)Ze.push(Number(n.getValue(ge+Qe*o,G)));n._OrtFree(ge)!==0&&se("Can't free memory for tensor dims.");let Dt=Ze.reduce((Qe,Le)=>Qe*Le,1);ie=st(X);let na=h?.outputPreferredLocations[i[Y]];if(ie==="string"){if(na==="gpu-buffer"||na==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let Qe=[];for(let Le=0;Le<Dt;Le++){let Wt=n.getValue(Ae+Le*o,"*"),kh=n.getValue(Ae+(Le+1)*o,"*"),Ih=Le===Dt-1?void 0:kh-Wt;Qe.push(n.UTF8ToString(Wt,Ih))}te.push([ie,Ze,Qe,"cpu"])}else if(na==="gpu-buffer"&&Dt>0){let Qe=n.jsepGetBuffer;if(!Qe)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let Le=Qe(Ae),Wt=nt(X,Dt);if(Wt===void 0||!_r(ie))throw new Error(`Unsupported data type: ${ie}`);Se=!0,te.push([ie,Ze,{gpuBuffer:Le,download:n.jsepCreateDownloader(Le,Wt,ie),dispose:()=>{n._OrtReleaseTensor(_e)!==0&&se("Can't release tensor.")}},"gpu-buffer"])}else if(na==="ml-tensor"&&Dt>0){let Qe=n.webnnEnsureTensor,Le=n.webnnIsGraphInputOutputTypeSupported;if(!Qe||!Le)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(nt(X,Dt)===void 0||!br(ie))throw new Error(`Unsupported data type: ${ie}`);if(!Le(e,ie,!1))throw new Error(`preferredLocation "ml-tensor" for ${ie} output is not supported by current WebNN Context.`);let Wt=await Qe(e,Ae,X,Ze,!1);Se=!0,te.push([ie,Ze,{mlTensor:Wt,download:n.webnnCreateMLTensorDownloader(Ae,ie),dispose:()=>{n.webnnReleaseTensorId(Ae),n._OrtReleaseTensor(_e)}},"ml-tensor"])}else if(na==="ml-tensor-cpu-output"&&Dt>0){let Qe=n.webnnCreateMLTensorDownloader(Ae,ie)(),Le=te.length;Se=!0,he.push((async()=>{let Wt=[Le,await Qe];return n.webnnReleaseTensorId(Ae),n._OrtReleaseTensor(_e),Wt})()),te.push([ie,Ze,[],"cpu"])}else{let Qe=yr(ie),Le=new Qe(Dt);new Uint8Array(Le.buffer,Le.byteOffset,Le.byteLength).set(n.HEAPU8.subarray(Ae,Ae+Le.byteLength)),te.push([ie,Ze,Le,"cpu"])}}finally{n.stackRestore(oe),ie==="string"&&Ae&&n._free(Ae),Se||n._OrtReleaseTensor(_e)}}h&&!m&&(n._OrtClearBoundOutputs(h.handle)!==0&&se("Can't clear bound outputs."),Qt.set(e,[l,d,p,h,m,!1]));for(let[Y,_e]of await Promise.all(he))te[Y][2]=_e;return te}finally{n.webnnOnRunEnd?.(l),n.stackRestore(A),x.forEach(de=>n._OrtReleaseTensor(de)),v.forEach(de=>n._OrtReleaseTensor(de)),E.forEach(de=>n._free(de)),_!==0&&n._OrtReleaseRunOptions(_),y.forEach(de=>n._free(de))}},rn=e=>{let t=le(),r=Qt.get(e);if(!r)throw new Error("invalid session id");let i=r[0],a=t._OrtEndProfiling(i);a===0&&se("Can't get an profile file name."),t._OrtFree(a)},an=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),Xt,ht,ri,aa,sa,za,sn,Ca,Rr,Br,Wp,Gp,jp,Hp,Kp,Zp,Qp,Xp,Yp=I(()=>{"use strict";je(),Fp(),it(),cr(),Xt=()=>!!pe.wasm.proxy&&typeof document<"u",ri=!1,aa=!1,sa=!1,Ca=new Map,Rr=(e,t)=>{let r=Ca.get(e);r?r.push(t):Ca.set(e,[t])},Br=()=>{if(ri||!aa||sa||!ht)throw new Error("worker not ready")},Wp=e=>{switch(e.data.type){case"init-wasm":ri=!1,e.data.err?(sa=!0,sn[1](e.data.err)):(aa=!0,sn[0]()),za&&(URL.revokeObjectURL(za),za=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Ca.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}default:}},Gp=async()=>{if(!aa){if(ri)throw new Error("multiple calls to 'initWasm()' detected.");if(sa)throw new Error("previous call to 'initWasm()' failed.");if(ri=!0,Xt())return new Promise((e,t)=>{ht?.terminate(),Ei().then(([r,i])=>{try{ht=i,ht.onerror=s=>t(s),ht.onmessage=Wp,sn=[e,t];let a={type:"init-wasm",in:pe};if(!a.in.wasm.wasmPaths&&r){let s=ur();s&&(a.in.wasm.wasmPaths=s)}ht.postMessage(a),za=r}catch(a){t(a)}},t)});try{await mr(pe.wasm),await Zs(pe),aa=!0}catch(e){throw sa=!0,e}finally{ri=!1}}},jp=async e=>{if(Xt())return Br(),new Promise((t,r)=>{Rr("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:pe}};ht.postMessage(i)});await Qs(pe,e)},Hp=async e=>Xt()?(Br(),new Promise((t,r)=>{Rr("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};ht.postMessage(i,[e.buffer])})):Ia(e),Kp=async(e,t)=>{if(Xt()){if(t?.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return Br(),new Promise((r,i)=>{Rr("create",[r,i]);let a={type:"create",in:{model:e,options:{...t}}},s=[];e instanceof Uint8Array&&s.push(e.buffer),ht.postMessage(a,s)})}else return Ys(e,t)},Zp=async e=>{if(Xt())return Br(),new Promise((t,r)=>{Rr("release",[t,r]);let i={type:"release",in:e};ht.postMessage(i)});Js(e)},Qp=async(e,t,r,i,a,s)=>{if(Xt()){if(r.some(n=>n[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(a.some(n=>n))throw new Error("pre-allocated output tensor is not supported for proxy.");return Br(),new Promise((n,o)=>{Rr("run",[n,o]);let u=r,l={type:"run",in:{sessionId:e,inputIndices:t,inputs:u,outputIndices:i,options:s}};ht.postMessage(l,an(u))})}else return tn(e,t,r,i,a,s)},Xp=async e=>{if(Xt())return Br(),new Promise((t,r)=>{Rr("end-profiling",[t,r]);let i={type:"end-profiling",in:e};ht.postMessage(i)});rn(e)}}),nn,Jp,ec,xh=I(()=>{"use strict";je(),Yp(),ne(),sr(),Pi(),nn=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},Jp=e=>{switch(e[3]){case"cpu":return new Me(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!_r(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:a}=e[2];return Me.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:a})}case"ml-tensor":{let t=e[0];if(!br(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:a}=e[2];return Me.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:a})}default:throw new Error(`invalid data location: ${e[3]}`)}},ec=class{async fetchModelAndCopyToWasmMemory(e){return Hp(await $r(e))}async loadModel(e,t){Ge();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await Kp(r,t),Ve()}async dispose(){return Zp(this.sessionId)}async run(e,t,r){Ge();let i=[],a=[];Object.entries(e).forEach(p=>{let h=p[0],m=p[1],f=this.inputNames.indexOf(h);if(f===-1)throw new Error(`invalid input '${h}'`);i.push(m),a.push(f)});let s=[],n=[];Object.entries(t).forEach(p=>{let h=p[0],m=p[1],f=this.outputNames.indexOf(h);if(f===-1)throw new Error(`invalid output '${h}'`);s.push(m),n.push(f)});let o=i.map((p,h)=>nn(p,()=>`input "${this.inputNames[a[h]]}"`)),u=s.map((p,h)=>p?nn(p,()=>`output "${this.outputNames[n[h]]}"`):null),l=await Qp(this.sessionId,a,o,n,u,r),d={};for(let p=0;p<l.length;p++)d[this.outputNames[n[p]]]=s[p]??Jp(l[p]);return Ve(),d}startProfiling(){}endProfiling(){Xp(this.sessionId)}}}),tc={};ue(tc,{OnnxruntimeWebAssemblyBackend:()=>un,initializeFlags:()=>on,wasmBackend:()=>rc});var on,un,rc,Sh=I(()=>{"use strict";je(),Yp(),xh(),on=()=>{(typeof pe.wasm.initTimeout!="number"||pe.wasm.initTimeout<0)&&(pe.wasm.initTimeout=0);let e=pe.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),pe.wasm.simd=!1),typeof pe.wasm.proxy!="boolean"&&(pe.wasm.proxy=!1),typeof pe.wasm.trace!="boolean"&&(pe.wasm.trace=!1),typeof pe.wasm.numThreads!="number"||!Number.isInteger(pe.wasm.numThreads)||pe.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)pe.wasm.numThreads=1;else{let t=typeof navigator>"u"?K("node:os").cpus().length:navigator.hardwareConcurrency;pe.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},un=class{async init(e){on(),await Gp(),await jp(e)}async createInferenceSessionHandler(e,t){let r=new ec;return await r.loadModel(e,t),r}},rc=new un}),ic={};ue(ic,{InferenceSession:()=>ar,TRACE:()=>zt,TRACE_FUNC_BEGIN:()=>Ge,TRACE_FUNC_END:()=>Ve,Tensor:()=>Me,default:()=>Eh,env:()=>pe,registerBackend:()=>Ee}),je(),je(),je();var Th="1.22.0",Eh=wi;{let e=(Sh(),re(tc)).wasmBackend;Ee("webgpu",e,5),Ee("webnn",e,5),Ee("cpu",e,10),Ee("wasm",e,10)}return Object.defineProperty(pe.versions,"web",{value:Th,enumerable:!0}),re(ic)})();typeof cc=="object"&&typeof cn=="object"&&(cn.exports=Nh)});var mc=Je(fc=>{"use strict";Object.defineProperty(fc,"__esModule",{value:!0})});var wc=Je(Ua=>{"use strict";var yc;Object.defineProperty(Ua,"__esModule",{value:!0});Ua.SileroLegacy=void 0;var gc=ii(),da=class{constructor(N,U,H,K,I){this.ortInstance=N,this._session=U,this._h=H,this._c=K,this._sr=I,this.reset_state=()=>{let ue=Array(128).fill(0);this._h=new this.ortInstance.Tensor("float32",ue,[2,1,64]),this._c=new this.ortInstance.Tensor("float32",ue,[2,1,64])},this.process=async ue=>{let re={input:new this.ortInstance.Tensor("float32",ue,[1,ue.length]),h:this._h,c:this._c,sr:this._sr},fe=await this._session.run(re);this._h=fe.hn,this._c=fe.cn;let[ye]=fe.output?.data;return{notSpeech:1-ye,isSpeech:ye}},this.release=async()=>{await this._session.release(),this._h.dispose(),this._c.dispose(),this._sr.dispose()}}};Ua.SileroLegacy=da;yc=da;da.new=async(P,N)=>{gc.log.debug("initializing vad");let U=await N(),H=await P.InferenceSession.create(U),K=new P.Tensor("int64",[16000n]),I=Array(128).fill(0),ue=new P.Tensor("float32",I,[2,1,64]),ve=new P.Tensor("float32",I,[2,1,64]);return gc.log.debug("vad is initialized"),new yc(P,H,ue,ve,K)}});var vc=Je(Na=>{"use strict";var bc;Object.defineProperty(Na,"__esModule",{value:!0});Na.Silero=void 0;var _c=ii(),pa=64;function $c(P){let N=Array(256).fill(0);return new P.Tensor("float32",N,[2,1,128])}var ca=class{constructor(N,U,H,K){this._session=N,this._state=U,this._sr=H,this.ortInstance=K,this._context=new Float32Array(pa),this.reset_state=()=>{this._state=$c(this.ortInstance),this._context=new Float32Array(pa)},this.process=async I=>{let ue=new Float32Array(pa+I.length);ue.set(this._context,0),ue.set(I,pa),this._context=I.slice(-pa);let re={input:new this.ortInstance.Tensor("float32",ue,[1,ue.length]),state:this._state,sr:this._sr},fe=await this._session.run(re);if(!fe.stateN)throw new Error("No state from model");if(this._state=fe.stateN,!fe.output?.data)throw new Error("No output from model");let ye=fe.output.data[0];if(typeof ye!="number")throw new Error("Weird output data");return{notSpeech:1-ye,isSpeech:ye}},this.release=async()=>{await this._session.release(),this._state.dispose(),this._sr.dispose()}}};Na.Silero=ca;bc=ca;ca.new=async(P,N)=>{_c.log.debug("Loading VAD...");let U=await N(),H=await P.InferenceSession.create(U),K=new P.Tensor("int64",[16000n]),I=$c(P);return _c.log.debug("...finished loading VAD"),new bc(H,I,K,P)}});var hn=Je(It=>{"use strict";var Lh=It&&It.__createBinding||(Object.create?(function(P,N,U,H){H===void 0&&(H=U);var K=Object.getOwnPropertyDescriptor(N,U);(!K||("get"in K?!N.__esModule:K.writable||K.configurable))&&(K={enumerable:!0,get:function(){return N[U]}}),Object.defineProperty(P,H,K)}):(function(P,N,U,H){H===void 0&&(H=U),P[H]=N[U]})),qh=It&&It.__exportStar||function(P,N){for(var U in P)U!=="default"&&!Object.prototype.hasOwnProperty.call(N,U)&&Lh(N,P,U)};Object.defineProperty(It,"__esModule",{value:!0});It.Silero=It.SileroLegacy=void 0;qh(mc(),It);var Vh=wc();Object.defineProperty(It,"SileroLegacy",{enumerable:!0,get:function(){return Vh.SileroLegacy}});var Fh=vc();Object.defineProperty(It,"Silero",{enumerable:!0,get:function(){return Fh.Silero}})});var mn=Je(La=>{"use strict";Object.defineProperty(La,"__esModule",{value:!0});La.Resampler=void 0;var Wh=ii(),fn=class{constructor(N){this.options=N,this.process=U=>{let H=[];for(let K of U)for(this.inputBuffer.push(K);this.hasEnoughDataForFrame();){let I=this.generateOutputFrame();H.push(I)}return H},N.nativeSampleRate<16e3&&Wh.log.error("nativeSampleRate is too low. Should have 16000 = targetSampleRate <= nativeSampleRate"),this.inputBuffer=[]}async*stream(N){for(let U of N)for(this.inputBuffer.push(U);this.hasEnoughDataForFrame();)yield this.generateOutputFrame()}hasEnoughDataForFrame(){return this.inputBuffer.length*this.options.targetSampleRate/this.options.nativeSampleRate>=this.options.targetFrameSize}generateOutputFrame(){let N=new Float32Array(this.options.targetFrameSize),U=0,H=0;for(;U<this.options.targetFrameSize;){let K=0,I=0;for(;H<Math.min(this.inputBuffer.length,(U+1)*this.options.nativeSampleRate/this.options.targetSampleRate);){let ue=this.inputBuffer[H];ue!==void 0&&(K+=ue,I++),H++}N[U]=K/I,U++}return this.inputBuffer=this.inputBuffer.slice(H),N}};La.Resampler=fn});var xc=Je(lt=>{"use strict";var Gh=lt&&lt.__createBinding||(Object.create?(function(P,N,U,H){H===void 0&&(H=U);var K=Object.getOwnPropertyDescriptor(N,U);(!K||("get"in K?!N.__esModule:K.writable||K.configurable))&&(K={enumerable:!0,get:function(){return N[U]}}),Object.defineProperty(P,H,K)}):(function(P,N,U,H){H===void 0&&(H=U),P[H]=N[U]})),jh=lt&&lt.__setModuleDefault||(Object.create?(function(P,N){Object.defineProperty(P,"default",{enumerable:!0,value:N})}):function(P,N){P.default=N}),Hh=lt&&lt.__importStar||function(P){if(P&&P.__esModule)return P;var N={};if(P!=null)for(var U in P)U!=="default"&&Object.prototype.hasOwnProperty.call(P,U)&&Gh(N,P,U);return jh(N,P),N};Object.defineProperty(lt,"__esModule",{value:!0});lt.NonRealTimeVAD=lt.defaultNonRealTimeVADOptions=void 0;var gn=Hh(hc()),Kh=ln(),Zh=Ra(),wn=Da(),yn=oa(),Qh=hn(),Xh=mn();lt.defaultNonRealTimeVADOptions={...wn.defaultFrameProcessorOptions,modelURL:Kh.baseAssetPath+"silero_vad_legacy.onnx",modelFetcher:Zh.defaultModelFetcher};var _n=class{static async new(N={}){let U={...lt.defaultNonRealTimeVADOptions,...N};(0,wn.validateOptions)(U),U.ortConfig!==void 0&&U.ortConfig(gn);let H=()=>U.modelFetcher(U.modelURL),K=await Qh.SileroLegacy.new(gn,H),I=new wn.FrameProcessor(K.process,K.reset_state,{positiveSpeechThreshold:U.positiveSpeechThreshold,negativeSpeechThreshold:U.negativeSpeechThreshold,redemptionMs:U.redemptionMs,preSpeechPadMs:U.preSpeechPadMs,minSpeechMs:U.minSpeechMs,submitUserSpeechOnPause:U.submitUserSpeechOnPause},1536/16);return I.resume(),new this(H,gn,U,I)}constructor(N,U,H,K){this.modelFetcher=N,this.ort=U,this.options=H,this.frameProcessor=K,this.frameSamples=1536}async*run(N,U){let H={nativeSampleRate:U,targetSampleRate:16e3,targetFrameSize:this.frameSamples},K=new Xh.Resampler(H),I=0,ue=0,ve=0;for await(let fe of K.stream(N)){let ye=[];await this.frameProcessor.process(fe,Ee=>{ye.push(Ee)});for(let Ee of ye)switch(Ee.msg){case yn.Message.SpeechStart:I=ve*this.frameSamples/16;break;case yn.Message.SpeechEnd:ue=(ve+1)*this.frameSamples/16,yield{audio:Ee.audio,start:I,end:ue};break;default:break}ve++}let re=[];this.frameProcessor.endSegment(fe=>{re.push(fe)});for(let fe of re)switch(fe.msg){case yn.Message.SpeechEnd:yield{audio:fe.audio,start:I,end:ve*this.frameSamples/16}}}};lt.NonRealTimeVAD=_n});var Sc=Je(Pt=>{"use strict";Object.defineProperty(Pt,"__esModule",{value:!0});Pt.audioFileToArray=Pt.encodeWAV=Pt.arrayBufferToBase64=Pt.minFramesForTargetMS=void 0;function Yh(P,N,U=16e3){return Math.ceil(P*U/1e3/N)}Pt.minFramesForTargetMS=Yh;function Jh(P){let N=new Uint8Array(P),U=N.byteLength,H=new Array(U);for(let K=0;K<U;K++){let I=N[K];if(I===void 0)break;H[K]=String.fromCharCode(I)}return btoa(H.join(""))}Pt.arrayBufferToBase64=Jh;function ef(P,N=3,U=16e3,H=1,K=32){let I=K/8,ue=H*I,ve=new ArrayBuffer(44+P.length*I),re=new DataView(ve);return qa(re,0,"RIFF"),re.setUint32(4,36+P.length*I,!0),qa(re,8,"WAVE"),qa(re,12,"fmt "),re.setUint32(16,16,!0),re.setUint16(20,N,!0),re.setUint16(22,H,!0),re.setUint32(24,U,!0),re.setUint32(28,U*ue,!0),re.setUint16(32,ue,!0),re.setUint16(34,K,!0),qa(re,36,"data"),re.setUint32(40,P.length*I,!0),N===1?rf(re,44,P):tf(re,44,P),ve}Pt.encodeWAV=ef;function tf(P,N,U){for(let H=0;H<U.length;H++,N+=4)P.setFloat32(N,U[H],!0)}function rf(P,N,U){for(let H=0;H<U.length;H++,N+=2){let K=Math.max(-1,Math.min(1,U[H]));P.setInt16(N,K<0?K*32768:K*32767,!0)}}function qa(P,N,U){for(let H=0;H<U.length;H++)P.setUint8(N+H,U.charCodeAt(H))}async function af(P){let N=new OfflineAudioContext(1,1,44100),U=new FileReader,H=null;if(await new Promise(ue=>{U.addEventListener("loadend",()=>{let ve=U.result;N.decodeAudioData(ve,re=>{H=re,N.startRendering().then(()=>{console.log("Rendering completed successfully"),ue()}).catch(fe=>{console.error("Rendering failed: ",fe)})},re=>{console.log("Error with decoding audio data: ",re)})}),U.readAsArrayBuffer(P)}),H===null)throw Error("some shit");let K=H,I=new Float32Array(K.length);for(let ue=0;ue<K.length;ue++)for(let ve=0;ve<K.numberOfChannels;ve++){let re=K.getChannelData(ve)[ue],fe=I[ue];if(re===void 0||fe===void 0)throw new Error("sample or out[i] is undefined");I[ue]=fe+re}return{audio:I,sampleRate:K.sampleRate}}Pt.audioFileToArray=af});var kc=Je((Ec,bn)=>{"use strict";var sf=(()=>{var P=Object.defineProperty,N=Object.getOwnPropertyDescriptor,U=Object.getOwnPropertyNames,H=Object.prototype.hasOwnProperty,K=(c=>typeof ot<"u"?ot:typeof Proxy<"u"?new Proxy(c,{get:(g,$)=>(typeof ot<"u"?ot:g)[$]}):c)(function(c){if(typeof ot<"u")return ot.apply(this,arguments);throw Error('Dynamic require of "'+c+'" is not supported')}),I=(c,g)=>()=>(c&&(g=c(c=0)),g),ue=(c,g)=>{for(var $ in g)P(c,$,{get:g[$],enumerable:!0})},ve=(c,g,$,T)=>{if(g&&typeof g=="object"||typeof g=="function")for(let S of U(g))!H.call(c,S)&&S!==$&&P(c,S,{get:()=>g[S],enumerable:!(T=N(g,S))||T.enumerable});return c},re=c=>ve(P({},"__esModule",{value:!0}),c),fe,ye,Ee,et,dt,Te=I(()=>{"use strict";fe=new Map,ye=[],Ee=(c,g,$)=>{if(g&&typeof g.init=="function"&&typeof g.createInferenceSessionHandler=="function"){let T=fe.get(c);if(T===void 0)fe.set(c,{backend:g,priority:$});else{if(T.priority>$)return;if(T.priority===$&&T.backend!==g)throw new Error(`cannot register backend "${c}" using priority ${$}`)}if($>=0){let S=ye.indexOf(c);S!==-1&&ye.splice(S,1);for(let O=0;O<ye.length;O++)if(fe.get(ye[O]).priority<=$){ye.splice(O,0,c);return}ye.push(c)}return}throw new TypeError("not a valid backend")},et=async c=>{let g=fe.get(c);if(!g)return"backend not found.";if(g.initialized)return g.backend;if(g.aborted)return g.error;{let $=!!g.initPromise;try{return $||(g.initPromise=g.backend.init(c)),await g.initPromise,g.initialized=!0,g.backend}catch(T){return $||(g.error=`${T}`,g.aborted=!0),g.error}finally{delete g.initPromise}}},dt=async c=>{let g=c.executionProviders||[],$=g.map(R=>typeof R=="string"?R:R.name),T=$.length===0?ye:$,S,O=[],z=new Set;for(let R of T){let q=await et(R);typeof q=="string"?O.push({name:R,err:q}):(S||(S=q),S===q&&z.add(R))}if(!S)throw new Error(`no available backend found. ERR: ${O.map(R=>`[${R.name}] ${R.err}`).join(", ")}`);for(let{name:R,err:q}of O)$.includes(R)&&console.warn(`removing requested execution provider "${R}" from session options because it is not available: ${q}`);let k=g.filter(R=>z.has(typeof R=="string"?R:R.name));return[S,new Proxy(c,{get:(R,q)=>q==="executionProviders"?k:Reflect.get(R,q)})]}}),mt=I(()=>{"use strict";Te()}),Jt,Pr=I(()=>{"use strict";Jt="1.22.0"}),er,Oe,ai=I(()=>{"use strict";Pr(),er="warning",Oe={wasm:{},webgl:{},webgpu:{},versions:{common:Jt},set logLevel(c){if(c!==void 0){if(typeof c!="string"||["verbose","info","warning","error","fatal"].indexOf(c)===-1)throw new Error(`Unsupported logging level: ${c}`);er=c}},get logLevel(){return er}},Object.defineProperty(Oe,"logLevel",{enumerable:!0})}),pe,Fa=I(()=>{"use strict";ai(),pe=Oe}),si,ni,Wa=I(()=>{"use strict";si=(c,g)=>{let $=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);$.width=c.dims[3],$.height=c.dims[2];let T=$.getContext("2d");if(T!=null){let S,O;g?.tensorLayout!==void 0&&g.tensorLayout==="NHWC"?(S=c.dims[2],O=c.dims[3]):(S=c.dims[3],O=c.dims[2]);let z=g?.format!==void 0?g.format:"RGB",k=g?.norm,R,q;k===void 0||k.mean===void 0?R=[255,255,255,255]:typeof k.mean=="number"?R=[k.mean,k.mean,k.mean,k.mean]:(R=[k.mean[0],k.mean[1],k.mean[2],0],k.mean[3]!==void 0&&(R[3]=k.mean[3])),k===void 0||k.bias===void 0?q=[0,0,0,0]:typeof k.bias=="number"?q=[k.bias,k.bias,k.bias,k.bias]:(q=[k.bias[0],k.bias[1],k.bias[2],0],k.bias[3]!==void 0&&(q[3]=k.bias[3]));let V=O*S,F=0,M=V,ee=V*2,C=-1;z==="RGBA"?(F=0,M=V,ee=V*2,C=V*3):z==="RGB"?(F=0,M=V,ee=V*2):z==="RBG"&&(F=0,ee=V,M=V*2);for(let j=0;j<O;j++)for(let Ie=0;Ie<S;Ie++){let ce=(c.data[F++]-q[0])*R[0],me=(c.data[M++]-q[1])*R[1],$e=(c.data[ee++]-q[2])*R[2],Z=C===-1?255:(c.data[C++]-q[3])*R[3];T.fillStyle="rgba("+ce+","+me+","+$e+","+Z+")",T.fillRect(Ie,j,1,1)}if("toDataURL"in $)return $.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},ni=(c,g)=>{let $=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),T;if($!=null){let S,O,z;g?.tensorLayout!==void 0&&g.tensorLayout==="NHWC"?(S=c.dims[2],O=c.dims[1],z=c.dims[3]):(S=c.dims[3],O=c.dims[2],z=c.dims[1]);let k=g!==void 0&&g.format!==void 0?g.format:"RGB",R=g?.norm,q,V;R===void 0||R.mean===void 0?q=[255,255,255,255]:typeof R.mean=="number"?q=[R.mean,R.mean,R.mean,R.mean]:(q=[R.mean[0],R.mean[1],R.mean[2],255],R.mean[3]!==void 0&&(q[3]=R.mean[3])),R===void 0||R.bias===void 0?V=[0,0,0,0]:typeof R.bias=="number"?V=[R.bias,R.bias,R.bias,R.bias]:(V=[R.bias[0],R.bias[1],R.bias[2],0],R.bias[3]!==void 0&&(V[3]=R.bias[3]));let F=O*S;if(g!==void 0&&(g.format!==void 0&&z===4&&g.format!=="RGBA"||z===3&&g.format!=="RGB"&&g.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let M=4,ee=0,C=1,j=2,Ie=3,ce=0,me=F,$e=F*2,Z=-1;k==="RGBA"?(ce=0,me=F,$e=F*2,Z=F*3):k==="RGB"?(ce=0,me=F,$e=F*2):k==="RBG"&&(ce=0,$e=F,me=F*2),T=$.createImageData(S,O);for(let Pe=0;Pe<O*S;ee+=M,C+=M,j+=M,Ie+=M,Pe++)T.data[ee]=(c.data[ce++]-V[0])*q[0],T.data[C]=(c.data[me++]-V[1])*q[1],T.data[j]=(c.data[$e++]-V[2])*q[2],T.data[Ie]=Z===-1?255:(c.data[Z++]-V[3])*q[3]}else throw new Error("Can not access image data");return T}}),Ut,oi,ui,li,di,pi,Ga=I(()=>{"use strict";rr(),Ut=(c,g)=>{if(c===void 0)throw new Error("Image buffer must be defined");if(g.height===void 0||g.width===void 0)throw new Error("Image height and width must be defined");if(g.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:$,width:T}=g,S=g.norm??{mean:255,bias:0},O,z;typeof S.mean=="number"?O=[S.mean,S.mean,S.mean,S.mean]:O=[S.mean[0],S.mean[1],S.mean[2],S.mean[3]??255],typeof S.bias=="number"?z=[S.bias,S.bias,S.bias,S.bias]:z=[S.bias[0],S.bias[1],S.bias[2],S.bias[3]??0];let k=g.format!==void 0?g.format:"RGBA",R=g.tensorFormat!==void 0&&g.tensorFormat!==void 0?g.tensorFormat:"RGB",q=$*T,V=R==="RGBA"?new Float32Array(q*4):new Float32Array(q*3),F=4,M=0,ee=1,C=2,j=3,Ie=0,ce=q,me=q*2,$e=-1;k==="RGB"&&(F=3,M=0,ee=1,C=2,j=-1),R==="RGBA"?$e=q*3:R==="RBG"?(Ie=0,me=q,ce=q*2):R==="BGR"&&(me=0,ce=q,Ie=q*2);for(let Z=0;Z<q;Z++,M+=F,C+=F,ee+=F,j+=F)V[Ie++]=(c[M]+z[0])/O[0],V[ce++]=(c[ee]+z[1])/O[1],V[me++]=(c[C]+z[2])/O[2],$e!==-1&&j!==-1&&(V[$e++]=(c[j]+z[3])/O[3]);return R==="RGBA"?new ze("float32",V,[1,4,$,T]):new ze("float32",V,[1,3,$,T])},oi=async(c,g)=>{let $=typeof HTMLImageElement<"u"&&c instanceof HTMLImageElement,T=typeof ImageData<"u"&&c instanceof ImageData,S=typeof ImageBitmap<"u"&&c instanceof ImageBitmap,O=typeof c=="string",z,k=g??{},R=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},q=V=>typeof HTMLCanvasElement<"u"&&V instanceof HTMLCanvasElement||V instanceof OffscreenCanvas?V.getContext("2d"):null;if($){let V=R();V.width=c.width,V.height=c.height;let F=q(V);if(F!=null){let M=c.height,ee=c.width;if(g!==void 0&&g.resizedHeight!==void 0&&g.resizedWidth!==void 0&&(M=g.resizedHeight,ee=g.resizedWidth),g!==void 0){if(k=g,g.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");k.tensorFormat="RGBA",k.height=M,k.width=ee}else k.tensorFormat="RGBA",k.height=M,k.width=ee;F.drawImage(c,0,0),z=F.getImageData(0,0,ee,M).data}else throw new Error("Can not access image data")}else if(T){let V,F;if(g!==void 0&&g.resizedWidth!==void 0&&g.resizedHeight!==void 0?(V=g.resizedHeight,F=g.resizedWidth):(V=c.height,F=c.width),g!==void 0&&(k=g),k.format="RGBA",k.height=V,k.width=F,g!==void 0){let M=R();M.width=F,M.height=V;let ee=q(M);if(ee!=null)ee.putImageData(c,0,0),z=ee.getImageData(0,0,F,V).data;else throw new Error("Can not access image data")}else z=c.data}else if(S){if(g===void 0)throw new Error("Please provide image config with format for Imagebitmap");let V=R();V.width=c.width,V.height=c.height;let F=q(V);if(F!=null){let M=c.height,ee=c.width;return F.drawImage(c,0,0,ee,M),z=F.getImageData(0,0,ee,M).data,k.height=M,k.width=ee,Ut(z,k)}else throw new Error("Can not access image data")}else{if(O)return new Promise((V,F)=>{let M=R(),ee=q(M);if(!c||!ee)return F();let C=new Image;C.crossOrigin="Anonymous",C.src=c,C.onload=()=>{M.width=C.width,M.height=C.height,ee.drawImage(C,0,0,M.width,M.height);let j=ee.getImageData(0,0,M.width,M.height);k.height=M.height,k.width=M.width,V(Ut(j.data,k))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(z!==void 0)return Ut(z,k);throw new Error("Input data provided is not supported - aborted tensor creation")},ui=(c,g)=>{let{width:$,height:T,download:S,dispose:O}=g,z=[1,T,$,4];return new ze({location:"texture",type:"float32",texture:c,dims:z,download:S,dispose:O})},li=(c,g)=>{let{dataType:$,dims:T,download:S,dispose:O}=g;return new ze({location:"gpu-buffer",type:$??"float32",gpuBuffer:c,dims:T,download:S,dispose:O})},di=(c,g)=>{let{dataType:$,dims:T,download:S,dispose:O}=g;return new ze({location:"ml-tensor",type:$??"float32",mlTensor:c,dims:T,download:S,dispose:O})},pi=(c,g,$)=>new ze({location:"cpu-pinned",type:c,data:g,dims:$??[g.length]})}),tt,gt,tr,ci,ja=I(()=>{"use strict";tt=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),gt=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),tr=!1,ci=()=>{if(!tr){tr=!0;let c=typeof BigInt64Array<"u"&&BigInt64Array.from,g=typeof BigUint64Array<"u"&&BigUint64Array.from,$=globalThis.Float16Array,T=typeof $<"u"&&$.from;c&&(tt.set("int64",BigInt64Array),gt.set(BigInt64Array,"int64")),g&&(tt.set("uint64",BigUint64Array),gt.set(BigUint64Array,"uint64")),T?(tt.set("float16",$),gt.set($,"float16")):tt.set("float16",Uint16Array)}}}),hi,fi,Ha=I(()=>{"use strict";rr(),hi=c=>{let g=1;for(let $=0;$<c.length;$++){let T=c[$];if(typeof T!="number"||!Number.isSafeInteger(T))throw new TypeError(`dims[${$}] must be an integer, got: ${T}`);if(T<0)throw new RangeError(`dims[${$}] must be a non-negative integer, got: ${T}`);g*=T}return g},fi=(c,g)=>{switch(c.location){case"cpu":return new ze(c.type,c.data,g);case"cpu-pinned":return new ze({location:"cpu-pinned",data:c.data,type:c.type,dims:g});case"texture":return new ze({location:"texture",texture:c.texture,type:c.type,dims:g});case"gpu-buffer":return new ze({location:"gpu-buffer",gpuBuffer:c.gpuBuffer,type:c.type,dims:g});case"ml-tensor":return new ze({location:"ml-tensor",mlTensor:c.mlTensor,type:c.type,dims:g});default:throw new Error(`tensorReshape: tensor location ${c.location} is not supported`)}}}),ze,rr=I(()=>{"use strict";Wa(),Ga(),ja(),Ha(),ze=class{constructor(c,g,$){ci();let T,S;if(typeof c=="object"&&"location"in c)switch(this.dataLocation=c.location,T=c.type,S=c.dims,c.location){case"cpu-pinned":{let z=tt.get(T);if(!z)throw new TypeError(`unsupported type "${T}" to create tensor from pinned buffer`);if(!(c.data instanceof z))throw new TypeError(`buffer should be of type ${z.name}`);this.cpuData=c.data;break}case"texture":{if(T!=="float32")throw new TypeError(`unsupported type "${T}" to create tensor from texture`);this.gpuTextureData=c.texture,this.downloader=c.download,this.disposer=c.dispose;break}case"gpu-buffer":{if(T!=="float32"&&T!=="float16"&&T!=="int32"&&T!=="int64"&&T!=="uint32"&&T!=="uint8"&&T!=="bool"&&T!=="uint4"&&T!=="int4")throw new TypeError(`unsupported type "${T}" to create tensor from gpu buffer`);this.gpuBufferData=c.gpuBuffer,this.downloader=c.download,this.disposer=c.dispose;break}case"ml-tensor":{if(T!=="float32"&&T!=="float16"&&T!=="int32"&&T!=="int64"&&T!=="uint32"&&T!=="uint64"&&T!=="int8"&&T!=="uint8"&&T!=="bool"&&T!=="uint4"&&T!=="int4")throw new TypeError(`unsupported type "${T}" to create tensor from MLTensor`);this.mlTensorData=c.mlTensor,this.downloader=c.download,this.disposer=c.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let z,k;if(typeof c=="string")if(T=c,k=$,c==="string"){if(!Array.isArray(g))throw new TypeError("A string tensor's data must be a string array.");z=g}else{let R=tt.get(c);if(R===void 0)throw new TypeError(`Unsupported tensor type: ${c}.`);if(Array.isArray(g)){if(c==="float16"&&R===Uint16Array||c==="uint4"||c==="int4")throw new TypeError(`Creating a ${c} tensor from number array is not supported. Please use ${R.name} as data.`);c==="uint64"||c==="int64"?z=R.from(g,BigInt):z=R.from(g)}else if(g instanceof R)z=g;else if(g instanceof Uint8ClampedArray)if(c==="uint8")z=Uint8Array.from(g);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(c==="float16"&&g instanceof Uint16Array&&R!==Uint16Array)z=new globalThis.Float16Array(g.buffer,g.byteOffset,g.length);else throw new TypeError(`A ${T} tensor's data must be type of ${R}`)}else if(k=g,Array.isArray(c)){if(c.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let R=typeof c[0];if(R==="string")T="string",z=c;else if(R==="boolean")T="bool",z=Uint8Array.from(c);else throw new TypeError(`Invalid element type of data array: ${R}.`)}else if(c instanceof Uint8ClampedArray)T="uint8",z=Uint8Array.from(c);else{let R=gt.get(c.constructor);if(R===void 0)throw new TypeError(`Unsupported type for tensor data: ${c.constructor}.`);T=R,z=c}if(k===void 0)k=[z.length];else if(!Array.isArray(k))throw new TypeError("A tensor's dims must be a number array");S=k,this.cpuData=z,this.dataLocation="cpu"}let O=hi(S);if(this.cpuData&&O!==this.cpuData.length&&!((T==="uint4"||T==="int4")&&Math.ceil(O/2)===this.cpuData.length))throw new Error(`Tensor's size(${O}) does not match data length(${this.cpuData.length}).`);this.type=T,this.dims=S,this.size=O}static async fromImage(c,g){return oi(c,g)}static fromTexture(c,g){return ui(c,g)}static fromGpuBuffer(c,g){return li(c,g)}static fromMLTensor(c,g){return di(c,g)}static fromPinnedBuffer(c,g,$){return pi(c,g,$)}toDataURL(c){return si(this,c)}toImageData(c){return ni(this,c)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(c){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let g=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=g,c&&this.disposer&&(this.disposer(),this.disposer=void 0),g}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(c){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return fi(this,c)}}}),Me,mi=I(()=>{"use strict";rr(),Me=ze}),zt,ir,Ge,Ve,gi=I(()=>{"use strict";ai(),zt=(c,g)=>{(typeof Oe.trace>"u"?!Oe.wasm.trace:!Oe.trace)||console.timeStamp(`${c}::ORT::${g}`)},ir=(c,g)=>{let $=new Error().stack?.split(/\r\n|\r|\n/g)||[],T=!1;for(let S=0;S<$.length;S++){if(T&&!$[S].includes("TRACE_FUNC")){let O=`FUNC_${c}::${$[S].trim().split(" ")[1]}`;g&&(O+=`::${g}`),zt("CPU",O);return}$[S].includes("TRACE_FUNC")&&(T=!0)}},Ge=c=>{(typeof Oe.trace>"u"?!Oe.wasm.trace:!Oe.trace)||ir("BEGIN",c)},Ve=c=>{(typeof Oe.trace>"u"?!Oe.wasm.trace:!Oe.trace)||ir("END",c)}}),yi,Ka=I(()=>{"use strict";Te(),mi(),gi(),yi=class Tc{constructor(g){this.handler=g}async run(g,$,T){Ge();let S={},O={};if(typeof g!="object"||g===null||g instanceof Me||Array.isArray(g))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let z=!0;if(typeof $=="object"){if($===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if($ instanceof Me)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray($)){if($.length===0)throw new TypeError("'fetches' cannot be an empty array.");z=!1;for(let q of $){if(typeof q!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(q)===-1)throw new RangeError(`'fetches' contains invalid output name: ${q}.`);S[q]=null}if(typeof T=="object"&&T!==null)O=T;else if(typeof T<"u")throw new TypeError("'options' must be an object.")}else{let q=!1,V=Object.getOwnPropertyNames($);for(let F of this.outputNames)if(V.indexOf(F)!==-1){let M=$[F];(M===null||M instanceof Me)&&(q=!0,z=!1,S[F]=M)}if(q){if(typeof T=="object"&&T!==null)O=T;else if(typeof T<"u")throw new TypeError("'options' must be an object.")}else O=$}}else if(typeof $<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let q of this.inputNames)if(typeof g[q]>"u")throw new Error(`input '${q}' is missing in 'feeds'.`);if(z)for(let q of this.outputNames)S[q]=null;let k=await this.handler.run(g,S,O),R={};for(let q in k)if(Object.hasOwnProperty.call(k,q)){let V=k[q];V instanceof Me?R[q]=V:R[q]=new Me(V.type,V.data,V.dims)}return Ve(),R}async release(){return this.handler.dispose()}static async create(g,$,T,S){Ge();let O,z={};if(typeof g=="string"){if(O=g,typeof $=="object"&&$!==null)z=$;else if(typeof $<"u")throw new TypeError("'options' must be an object.")}else if(g instanceof Uint8Array){if(O=g,typeof $=="object"&&$!==null)z=$;else if(typeof $<"u")throw new TypeError("'options' must be an object.")}else if(g instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&g instanceof SharedArrayBuffer){let V=g,F=0,M=g.byteLength;if(typeof $=="object"&&$!==null)z=$;else if(typeof $=="number"){if(F=$,!Number.isSafeInteger(F))throw new RangeError("'byteOffset' must be an integer.");if(F<0||F>=V.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${V.byteLength}).`);if(M=g.byteLength-F,typeof T=="number"){if(M=T,!Number.isSafeInteger(M))throw new RangeError("'byteLength' must be an integer.");if(M<=0||F+M>V.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${V.byteLength-F}].`);if(typeof S=="object"&&S!==null)z=S;else if(typeof S<"u")throw new TypeError("'options' must be an object.")}else if(typeof T<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof $<"u")throw new TypeError("'options' must be an object.");O=new Uint8Array(V,F,M)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[k,R]=await dt(z),q=await k.createInferenceSessionHandler(O,R);return Ve(),new Tc(q)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),ar,Za=I(()=>{"use strict";Ka(),ar=yi}),Qa=I(()=>{"use strict"}),Xa=I(()=>{"use strict"}),Ya=I(()=>{"use strict"}),Ja=I(()=>{"use strict"}),wi={};ue(wi,{InferenceSession:()=>ar,TRACE:()=>zt,TRACE_FUNC_BEGIN:()=>Ge,TRACE_FUNC_END:()=>Ve,Tensor:()=>Me,env:()=>pe,registerBackend:()=>Ee});var je=I(()=>{"use strict";mt(),Fa(),Za(),mi(),Qa(),Xa(),gi(),Ya(),Ja()}),sr=I(()=>{"use strict"}),_i={};ue(_i,{default:()=>bi});var nr,or,bi,es=I(()=>{"use strict";Ni(),it(),cr(),nr="ort-wasm-proxy-worker",or=globalThis.self?.name===nr,or&&(self.onmessage=c=>{let{type:g,in:$}=c.data;try{switch(g){case"init-wasm":mr($.wasm).then(()=>{Nr($).then(()=>{postMessage({type:g})},T=>{postMessage({type:g,err:T})})},T=>{postMessage({type:g,err:T})});break;case"init-ep":{let{epName:T,env:S}=$;Lr(S,T).then(()=>{postMessage({type:g})},O=>{postMessage({type:g,err:O})});break}case"copy-from":{let{buffer:T}=$,S=be(T);postMessage({type:g,out:S});break}case"create":{let{model:T,options:S}=$;ut(T,S).then(O=>{postMessage({type:g,out:O})},O=>{postMessage({type:g,err:O})});break}case"release":Fr($),postMessage({type:g});break;case"run":{let{sessionId:T,inputIndices:S,inputs:O,outputIndices:z,options:k}=$;D(T,S,O,z,new Array(z.length).fill(null),k).then(R=>{R.some(q=>q[3]!=="cpu")?postMessage({type:g,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:g,out:R},Wr([...O,...R]))},R=>{postMessage({type:g,err:R})});break}case"end-profiling":Gt($),postMessage({type:g});break;default:}}catch(T){postMessage({type:g,err:T})}}),bi=or?null:c=>new Worker(c??Ce,{type:"classic",name:nr})}),$i,vi,Ce,ur,Nt,xi,Si,lr,Ti,dr,Ei,pr,ki,cr=I(()=>{"use strict";sr(),$i=typeof location>"u"?void 0:location.origin,vi=()=>typeof document<"u"?document.currentScript?.src:typeof self<"u"?self.location?.href:void 0,Ce=vi(),ur=()=>{if(Ce&&!Ce.startsWith("blob:"))return Ce.substring(0,Ce.lastIndexOf("/")+1)},Nt=(c,g)=>{try{let $=g??Ce;return($?new URL(c,$):new URL(c)).origin===$i}catch{return!1}},xi=(c,g)=>{let $=g??Ce;try{return($?new URL(c,$):new URL(c)).href}catch{return}},Si=(c,g)=>`${g??"./"}${c}`,lr=async c=>{let g=await(await fetch(c,{credentials:"same-origin"})).blob();return URL.createObjectURL(g)},Ti=async c=>(await import(c)).default,dr=(es(),re(_i)).default,Ei=async()=>{if(!Ce)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(Nt(Ce))return[void 0,dr()];let c=await lr(Ce);return[c,dr(c)]},pr=void 0,ki=async(c,g,$)=>{if(!c&&!g&&pr&&Ce&&Nt(Ce))return[void 0,pr];{let T="ort-wasm-simd-threaded.mjs",S=c??xi(T,g),O=$&&S&&!Nt(S,g),z=O?await lr(S):S??Si(T,g);return[O?z:void 0,await Ti(z)]}}}),hr,Lt,yt,fr,Ii,zi,Ci,mr,le,it=I(()=>{"use strict";cr(),Lt=!1,yt=!1,fr=!1,Ii=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},zi=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},Ci=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},mr=async c=>{if(Lt)return Promise.resolve();if(yt)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(fr)throw new Error("previous call to 'initializeWebAssembly()' failed.");yt=!0;let g=c.initTimeout,$=c.numThreads;if(c.simd!==!1){if(c.simd==="relaxed"){if(!Ci())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!zi())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let T=Ii();$>1&&!T&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+$+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),c.numThreads=$=1);let S=c.wasmPaths,O=typeof S=="string"?S:void 0,z=S?.mjs,k=z?.href??z,R=S?.wasm,q=R?.href??R,V=c.wasmBinary,[F,M]=await ki(k,O,$>1),ee=!1,C=[];if(g>0&&C.push(new Promise(j=>{setTimeout(()=>{ee=!0,j()},g)})),C.push(new Promise((j,Ie)=>{let ce={numThreads:$};if(V)ce.wasmBinary=V;else if(q||O)ce.locateFile=me=>q??O+me;else if(k&&k.indexOf("blob:")!==0)ce.locateFile=me=>new URL(me,k).href;else if(F){let me=ur();me&&(ce.locateFile=$e=>me+$e)}M(ce).then(me=>{yt=!1,Lt=!0,hr=me,j(),F&&URL.revokeObjectURL(F)},me=>{yt=!1,fr=!0,Ie(me)})})),await Promise.race(C),ee)throw new Error(`WebAssembly backend initializing failed due to timeout: ${g}ms`)},le=()=>{if(Lt&&hr)return hr;throw new Error("WebAssembly is not initialized yet.")}}),De,qt,se,gr=I(()=>{"use strict";it(),De=(c,g)=>{let $=le(),T=$.lengthBytesUTF8(c)+1,S=$._malloc(T);return $.stringToUTF8(c,S,T),g.push(S),S},qt=(c,g,$,T)=>{if(typeof c=="object"&&c!==null){if($.has(c))throw new Error("Circular reference in options");$.add(c)}Object.entries(c).forEach(([S,O])=>{let z=g?g+S:S;if(typeof O=="object")qt(O,z+".",$,T);else if(typeof O=="string"||typeof O=="number")T(z,O.toString());else if(typeof O=="boolean")T(z,O?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof O}`)})},se=c=>{let g=le(),$=g.stackSave();try{let T=g.PTR_SIZE,S=g.stackAlloc(2*T);g._OrtGetLastError(S,S+T);let O=Number(g.getValue(S,T===4?"i32":"i64")),z=g.getValue(S+T,"*"),k=z?g.UTF8ToString(z):"";throw new Error(`${c} ERROR_CODE: ${O}, ERROR_MESSAGE: ${k}`)}finally{g.stackRestore($)}}}),Ai,ts=I(()=>{"use strict";it(),gr(),Ai=c=>{let g=le(),$=0,T=[],S=c||{};try{if(c?.logSeverityLevel===void 0)S.logSeverityLevel=2;else if(typeof c.logSeverityLevel!="number"||!Number.isInteger(c.logSeverityLevel)||c.logSeverityLevel<0||c.logSeverityLevel>4)throw new Error(`log serverity level is not valid: ${c.logSeverityLevel}`);if(c?.logVerbosityLevel===void 0)S.logVerbosityLevel=0;else if(typeof c.logVerbosityLevel!="number"||!Number.isInteger(c.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${c.logVerbosityLevel}`);c?.terminate===void 0&&(S.terminate=!1);let O=0;return c?.tag!==void 0&&(O=De(c.tag,T)),$=g._OrtCreateRunOptions(S.logSeverityLevel,S.logVerbosityLevel,!!S.terminate,O),$===0&&se("Can't create run options."),c?.extra!==void 0&&qt(c.extra,"",new WeakSet,(z,k)=>{let R=De(z,T),q=De(k,T);g._OrtAddRunConfigEntry($,R,q)!==0&&se(`Can't set a run config entry: ${z} - ${k}.`)}),[$,T]}catch(O){throw $!==0&&g._OrtReleaseRunOptions($),T.forEach(z=>g._free(z)),O}}}),Oi,Ri,Bi,wt,Mi,Di,rs=I(()=>{"use strict";it(),gr(),Oi=c=>{switch(c){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${c}`)}},Ri=c=>{switch(c){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${c}`)}},Bi=c=>{c.extra||(c.extra={}),c.extra.session||(c.extra.session={});let g=c.extra.session;g.use_ort_model_bytes_directly||(g.use_ort_model_bytes_directly="1"),c.executionProviders&&c.executionProviders.some($=>(typeof $=="string"?$:$.name)==="webgpu")&&(c.enableMemPattern=!1)},wt=(c,g,$,T)=>{let S=De(g,T),O=De($,T);le()._OrtAddSessionConfigEntry(c,S,O)!==0&&se(`Can't set a session config entry: ${g} - ${$}.`)},Mi=async(c,g,$)=>{for(let T of g){let S=typeof T=="string"?T:T.name,O=[];switch(S){case"webnn":if(S="WEBNN",typeof T!="string"){let V=T?.deviceType;V&&wt(c,"deviceType",V,$)}break;case"webgpu":if(S="JS",typeof T!="string"){let V=T;if(V?.preferredLayout){if(V.preferredLayout!=="NCHW"&&V.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${V.preferredLayout}`);wt(c,"preferredLayout",V.preferredLayout,$)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${S}`)}let z=De(S,$),k=O.length,R=0,q=0;if(k>0){R=le()._malloc(k*le().PTR_SIZE),$.push(R),q=le()._malloc(k*le().PTR_SIZE),$.push(q);for(let V=0;V<k;V++)le().setValue(R+V*le().PTR_SIZE,O[V][0],"*"),le().setValue(q+V*le().PTR_SIZE,O[V][1],"*")}await le()._OrtAppendExecutionProvider(c,z,R,q,k)!==0&&se(`Can't append execution provider: ${S}.`)}},Di=async c=>{let g=le(),$=0,T=[],S=c||{};Bi(S);try{let O=Oi(S.graphOptimizationLevel??"all"),z=Ri(S.executionMode??"sequential"),k=typeof S.logId=="string"?De(S.logId,T):0,R=S.logSeverityLevel??2;if(!Number.isInteger(R)||R<0||R>4)throw new Error(`log serverity level is not valid: ${R}`);let q=S.logVerbosityLevel??0;if(!Number.isInteger(q)||q<0||q>4)throw new Error(`log verbosity level is not valid: ${q}`);let V=typeof S.optimizedModelFilePath=="string"?De(S.optimizedModelFilePath,T):0;if($=g._OrtCreateSessionOptions(O,!!S.enableCpuMemArena,!!S.enableMemPattern,z,!!S.enableProfiling,0,k,R,q,V),$===0&&se("Can't create session options."),S.executionProviders&&await Mi($,S.executionProviders,T),S.enableGraphCapture!==void 0){if(typeof S.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${S.enableGraphCapture}`);wt($,"enableGraphCapture",S.enableGraphCapture.toString(),T)}if(S.freeDimensionOverrides)for(let[F,M]of Object.entries(S.freeDimensionOverrides)){if(typeof F!="string")throw new Error(`free dimension override name must be a string: ${F}`);if(typeof M!="number"||!Number.isInteger(M)||M<0)throw new Error(`free dimension override value must be a non-negative integer: ${M}`);let ee=De(F,T);g._OrtAddFreeDimensionOverride($,ee,M)!==0&&se(`Can't set a free dimension override: ${F} - ${M}.`)}return S.extra!==void 0&&qt(S.extra,"",new WeakSet,(F,M)=>{wt($,F,M,T)}),[$,T]}catch(O){throw $!==0&&g._OrtReleaseSessionOptions($)!==0&&se("Can't release session options."),T.forEach(z=>g._free(z)),O}}}),at,st,nt,yr,wr,_r,br,Ur,ne=I(()=>{"use strict";at=c=>{switch(c){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${c}`)}},st=c=>{switch(c){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${c}`)}},nt=(c,g)=>{let $=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][c],T=typeof g=="number"?g:g.reduce((S,O)=>S*O,1);return $>0?Math.ceil(T*$):void 0},yr=c=>{switch(c){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${c}`)}},wr=c=>{switch(c){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${c}`)}},_r=c=>c==="float32"||c==="float16"||c==="int32"||c==="int64"||c==="uint32"||c==="uint8"||c==="bool"||c==="uint4"||c==="int4",br=c=>c==="float32"||c==="float16"||c==="int32"||c==="int64"||c==="uint32"||c==="uint64"||c==="int8"||c==="uint8"||c==="bool"||c==="uint4"||c==="int4",Ur=c=>{switch(c){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${c}`)}}}),$r,Pi=I(()=>{"use strict";sr(),$r=async c=>{if(typeof c=="string"){let g=await fetch(c);if(!g.ok)throw new Error(`failed to load external data file: ${c}`);let $=g.headers.get("Content-Length"),T=$?parseInt($,10):0;if(T<1073741824)return new Uint8Array(await g.arrayBuffer());{if(!g.body)throw new Error(`failed to load external data file: ${c}, no response body.`);let S=g.body.getReader(),O;try{O=new ArrayBuffer(T)}catch(k){if(k instanceof RangeError){let R=Math.ceil(T/65536);O=new WebAssembly.Memory({initial:R,maximum:R}).buffer}else throw k}let z=0;for(;;){let{done:k,value:R}=await S.read();if(k)break;let q=R.byteLength;new Uint8Array(O,z,q).set(R),z+=q}return new Uint8Array(O,0,T)}}else return c instanceof Blob?new Uint8Array(await c.arrayBuffer()):c instanceof Uint8Array?c:new Uint8Array(c)}}),Ui,Nr,Lr,Ct,qr,Vr,be,ut,Fr,At,D,Gt,Wr,Ni=I(()=>{"use strict";ts(),rs(),ne(),it(),gr(),Pi(),Ui=(c,g)=>{le()._OrtInit(c,g)!==0&&se("Can't initialize onnxruntime.")},Nr=async c=>{Ui(c.wasm.numThreads,wr(c.logLevel))},Lr=async(c,g)=>{le().asyncInit?.()},Ct=new Map,qr=c=>{let g=le(),$=g.stackSave();try{let T=g.PTR_SIZE,S=g.stackAlloc(2*T);g._OrtGetInputOutputCount(c,S,S+T)!==0&&se("Can't get session input/output count.");let O=T===4?"i32":"i64";return[Number(g.getValue(S,O)),Number(g.getValue(S+T,O))]}finally{g.stackRestore($)}},Vr=(c,g)=>{let $=le(),T=$.stackSave(),S=0;try{let O=$.PTR_SIZE,z=$.stackAlloc(2*O);$._OrtGetInputOutputMetadata(c,g,z,z+O)!==0&&se("Can't get session input/output metadata.");let k=Number($.getValue(z,"*"));S=Number($.getValue(z+O,"*"));let R=$.HEAP32[S/4];if(R===0)return[k,0];let q=$.HEAPU32[S/4+1],V=[];for(let F=0;F<q;F++){let M=Number($.getValue(S+8+F*O,"*"));V.push(M!==0?$.UTF8ToString(M):Number($.getValue(S+8+(F+q)*O,"*")))}return[k,R,V]}finally{$.stackRestore(T),S!==0&&$._OrtFree(S)}},be=c=>{let g=le(),$=g._malloc(c.byteLength);if($===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${c.byteLength}.`);return g.HEAPU8.set(c,$),[$,c.byteLength]},ut=async(c,g)=>{let $,T,S=le();Array.isArray(c)?[$,T]=c:c.buffer===S.HEAPU8.buffer?[$,T]=[c.byteOffset,c.byteLength]:[$,T]=be(c);let O=0,z=0,k=0,R=[],q=[],V=[];try{if([z,R]=await Di(g),g?.externalData&&S.mountExternalData){let $e=[];for(let Z of g.externalData){let Pe=typeof Z=="string"?Z:Z.path;$e.push($r(typeof Z=="string"?Z:Z.data).then(Xe=>{S.mountExternalData(Pe,Xe)}))}await Promise.all($e)}for(let $e of g?.executionProviders??[])if((typeof $e=="string"?$e:$e.name)==="webnn"){if(S.shouldTransferToMLTensor=!1,typeof $e!="string"){let Z=$e,Pe=Z?.context,Xe=Z?.gpuDevice,He=Z?.deviceType,Bt=Z?.powerPreference;Pe?S.currentContext=Pe:Xe?S.currentContext=await S.webnnCreateMLContext(Xe):S.currentContext=await S.webnnCreateMLContext({deviceType:He,powerPreference:Bt})}else S.currentContext=await S.webnnCreateMLContext();break}O=await S._OrtCreateSession($,T,z),S.webgpuOnCreateSession?.(O),O===0&&se("Can't create a session."),S.jsepOnCreateSession?.(),S.currentContext&&(S.webnnRegisterMLContext(O,S.currentContext),S.currentContext=void 0,S.shouldTransferToMLTensor=!0);let[F,M]=qr(O),ee=!!g?.enableGraphCapture,C=[],j=[],Ie=[],ce=[],me=[];for(let $e=0;$e<F;$e++){let[Z,Pe,Xe]=Vr(O,$e);Z===0&&se("Can't get an input name."),q.push(Z);let He=S.UTF8ToString(Z);C.push(He),Ie.push(Pe===0?{name:He,isTensor:!1}:{name:He,isTensor:!0,type:st(Pe),shape:Xe})}for(let $e=0;$e<M;$e++){let[Z,Pe,Xe]=Vr(O,$e+F);Z===0&&se("Can't get an output name."),V.push(Z);let He=S.UTF8ToString(Z);j.push(He),ce.push(Pe===0?{name:He,isTensor:!1}:{name:He,isTensor:!0,type:st(Pe),shape:Xe})}return Ct.set(O,[O,q,V,null,ee,!1]),[O,C,j,Ie,ce]}catch(F){throw q.forEach(M=>S._OrtFree(M)),V.forEach(M=>S._OrtFree(M)),k!==0&&S._OrtReleaseBinding(k)!==0&&se("Can't release IO binding."),O!==0&&S._OrtReleaseSession(O)!==0&&se("Can't release session."),F}finally{S._free($),z!==0&&S._OrtReleaseSessionOptions(z)!==0&&se("Can't release session options."),R.forEach(F=>S._free(F)),S.unmountExternalData?.()}},Fr=c=>{let g=le(),$=Ct.get(c);if(!$)throw new Error(`cannot release session. invalid session id: ${c}`);let[T,S,O,z,k]=$;z&&(k&&g._OrtClearBoundOutputs(z.handle)!==0&&se("Can't clear bound outputs."),g._OrtReleaseBinding(z.handle)!==0&&se("Can't release IO binding.")),g.jsepOnReleaseSession?.(c),g.webnnOnReleaseSession?.(c),g.webgpuOnReleaseSession?.(c),S.forEach(R=>g._OrtFree(R)),O.forEach(R=>g._OrtFree(R)),g._OrtReleaseSession(T)!==0&&se("Can't release session."),Ct.delete(c)},At=async(c,g,$,T,S,O,z=!1)=>{if(!c){g.push(0);return}let k=le(),R=k.PTR_SIZE,q=c[0],V=c[1],F=c[3],M=F,ee,C;if(q==="string"&&(F==="gpu-buffer"||F==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(z&&F!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${O} when enableGraphCapture is true.`);if(F==="gpu-buffer"){let ce=c[2].gpuBuffer;C=nt(at(q),V);{let me=k.jsepRegisterBuffer;if(!me)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');ee=me(T,O,ce,C)}}else if(F==="ml-tensor"){let ce=c[2].mlTensor;C=nt(at(q),V);let me=k.webnnRegisterMLTensor;if(!me)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');ee=me(T,ce,at(q),V)}else{let ce=c[2];if(Array.isArray(ce)){C=R*ce.length,ee=k._malloc(C),$.push(ee);for(let me=0;me<ce.length;me++){if(typeof ce[me]!="string")throw new TypeError(`tensor data at index ${me} is not a string`);k.setValue(ee+me*R,De(ce[me],$),"*")}}else{let me=k.webnnIsGraphInput,$e=k.webnnIsGraphOutput;if(q!=="string"&&me&&$e){let Z=k.UTF8ToString(S);if(me(T,Z)||$e(T,Z)){let Pe=at(q);C=nt(Pe,V),M="ml-tensor";let Xe=k.webnnCreateTemporaryTensor,He=k.webnnUploadTensor;if(!Xe||!He)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let Bt=await Xe(T,Pe,V);He(Bt,new Uint8Array(ce.buffer,ce.byteOffset,ce.byteLength)),ee=Bt}else C=ce.byteLength,ee=k._malloc(C),$.push(ee),k.HEAPU8.set(new Uint8Array(ce.buffer,ce.byteOffset,C),ee)}else C=ce.byteLength,ee=k._malloc(C),$.push(ee),k.HEAPU8.set(new Uint8Array(ce.buffer,ce.byteOffset,C),ee)}}let j=k.stackSave(),Ie=k.stackAlloc(4*V.length);try{V.forEach((me,$e)=>k.setValue(Ie+$e*R,me,R===4?"i32":"i64"));let ce=k._OrtCreateTensor(at(q),ee,C,Ie,V.length,Ur(M));ce===0&&se(`Can't create tensor for input/output. session=${T}, index=${O}.`),g.push(ce)}finally{k.stackRestore(j)}},D=async(c,g,$,T,S,O)=>{let z=le(),k=z.PTR_SIZE,R=Ct.get(c);if(!R)throw new Error(`cannot run inference. invalid session id: ${c}`);let q=R[0],V=R[1],F=R[2],M=R[3],ee=R[4],C=R[5],j=g.length,Ie=T.length,ce=0,me=[],$e=[],Z=[],Pe=[],Xe=z.stackSave(),He=z.stackAlloc(j*k),Bt=z.stackAlloc(j*k),ei=z.stackAlloc(Ie*k),Hi=z.stackAlloc(Ie*k);try{[ce,me]=Ai(O);for(let we=0;we<j;we++)await At($[we],$e,Pe,c,V[g[we]],g[we],ee);for(let we=0;we<Ie;we++)await At(S[we],Z,Pe,c,F[T[we]],j+T[we],ee);for(let we=0;we<j;we++)z.setValue(He+we*k,$e[we],"*"),z.setValue(Bt+we*k,V[g[we]],"*");for(let we=0;we<Ie;we++)z.setValue(ei+we*k,Z[we],"*"),z.setValue(Hi+we*k,F[T[we]],"*");z.jsepOnRunStart?.(q),z.webnnOnRunStart?.(q);let Re;Re=await z._OrtRun(q,Bt,He,j,Hi,Ie,ei,ce),Re!==0&&se("failed to call OrtRun().");let pt=[],Ki=[];for(let we=0;we<Ie;we++){let $t=Number(z.getValue(ei+we*k,"*"));if($t===Z[we]){pt.push(S[we]);continue}let ma=z.stackSave(),vt=z.stackAlloc(4*k),Tr=!1,Ue,Ye=0;try{z._OrtGetTensorData($t,vt,vt+k,vt+2*k,vt+3*k)!==0&&se(`Can't access output tensor data on index ${we}.`);let ti=k===4?"i32":"i64",Er=Number(z.getValue(vt,ti));Ye=z.getValue(vt+k,"*");let Zi=z.getValue(vt+k*2,"*"),ga=Number(z.getValue(vt+k*3,ti)),Fe=[];for(let Ne=0;Ne<ga;Ne++)Fe.push(Number(z.getValue(Zi+Ne*k,ti)));z._OrtFree(Zi)!==0&&se("Can't free memory for tensor dims.");let xt=Fe.reduce((Ne,Be)=>Ne*Be,1);Ue=st(Er);let Zt=M?.outputPreferredLocations[T[we]];if(Ue==="string"){if(Zt==="gpu-buffer"||Zt==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let Ne=[];for(let Be=0;Be<xt;Be++){let ct=z.getValue(Ye+Be*k,"*"),ya=z.getValue(Ye+(Be+1)*k,"*"),wa=Be===xt-1?void 0:ya-ct;Ne.push(z.UTF8ToString(ct,wa))}pt.push([Ue,Fe,Ne,"cpu"])}else if(Zt==="gpu-buffer"&&xt>0){let Ne=z.jsepGetBuffer;if(!Ne)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let Be=Ne(Ye),ct=nt(Er,xt);if(ct===void 0||!_r(Ue))throw new Error(`Unsupported data type: ${Ue}`);Tr=!0,pt.push([Ue,Fe,{gpuBuffer:Be,download:z.jsepCreateDownloader(Be,ct,Ue),dispose:()=>{z._OrtReleaseTensor($t)!==0&&se("Can't release tensor.")}},"gpu-buffer"])}else if(Zt==="ml-tensor"&&xt>0){let Ne=z.webnnEnsureTensor,Be=z.webnnIsGraphInputOutputTypeSupported;if(!Ne||!Be)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(nt(Er,xt)===void 0||!br(Ue))throw new Error(`Unsupported data type: ${Ue}`);if(!Be(c,Ue,!1))throw new Error(`preferredLocation "ml-tensor" for ${Ue} output is not supported by current WebNN Context.`);let ct=await Ne(c,Ye,Er,Fe,!1);Tr=!0,pt.push([Ue,Fe,{mlTensor:ct,download:z.webnnCreateMLTensorDownloader(Ye,Ue),dispose:()=>{z.webnnReleaseTensorId(Ye),z._OrtReleaseTensor($t)}},"ml-tensor"])}else if(Zt==="ml-tensor-cpu-output"&&xt>0){let Ne=z.webnnCreateMLTensorDownloader(Ye,Ue)(),Be=pt.length;Tr=!0,Ki.push((async()=>{let ct=[Be,await Ne];return z.webnnReleaseTensorId(Ye),z._OrtReleaseTensor($t),ct})()),pt.push([Ue,Fe,[],"cpu"])}else{let Ne=yr(Ue),Be=new Ne(xt);new Uint8Array(Be.buffer,Be.byteOffset,Be.byteLength).set(z.HEAPU8.subarray(Ye,Ye+Be.byteLength)),pt.push([Ue,Fe,Be,"cpu"])}}finally{z.stackRestore(ma),Ue==="string"&&Ye&&z._free(Ye),Tr||z._OrtReleaseTensor($t)}}M&&!ee&&(z._OrtClearBoundOutputs(M.handle)!==0&&se("Can't clear bound outputs."),Ct.set(c,[q,V,F,M,ee,!1]));for(let[we,$t]of await Promise.all(Ki))pt[we][2]=$t;return pt}finally{z.webnnOnRunEnd?.(q),z.stackRestore(Xe),$e.forEach(Re=>z._OrtReleaseTensor(Re)),Z.forEach(Re=>z._OrtReleaseTensor(Re)),Pe.forEach(Re=>z._free(Re)),ce!==0&&z._OrtReleaseRunOptions(ce),me.forEach(Re=>z._free(Re))}},Gt=c=>{let g=le(),$=Ct.get(c);if(!$)throw new Error("invalid session id");let T=$[0],S=g._OrtEndProfiling(T);S===0&&se("Can't get an profile file name."),g._OrtFree(S)},Wr=c=>{let g=[];for(let $ of c){let T=$[2];!Array.isArray(T)&&"buffer"in T&&g.push(T.buffer)}return g}}),_t,ae,Ot,jt,Vt,Ht,vr,xr,bt,Rt,Gr,jr,Hr,Li,qi,ha,Kt,Vi,Fi=I(()=>{"use strict";je(),Ni(),it(),cr(),_t=()=>!!pe.wasm.proxy&&typeof document<"u",Ot=!1,jt=!1,Vt=!1,xr=new Map,bt=(c,g)=>{let $=xr.get(c);$?$.push(g):xr.set(c,[g])},Rt=()=>{if(Ot||!jt||Vt||!ae)throw new Error("worker not ready")},Gr=c=>{switch(c.data.type){case"init-wasm":Ot=!1,c.data.err?(Vt=!0,vr[1](c.data.err)):(jt=!0,vr[0]()),Ht&&(URL.revokeObjectURL(Ht),Ht=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let g=xr.get(c.data.type);c.data.err?g.shift()[1](c.data.err):g.shift()[0](c.data.out);break}default:}},jr=async()=>{if(!jt){if(Ot)throw new Error("multiple calls to 'initWasm()' detected.");if(Vt)throw new Error("previous call to 'initWasm()' failed.");if(Ot=!0,_t())return new Promise((c,g)=>{ae?.terminate(),Ei().then(([$,T])=>{try{ae=T,ae.onerror=O=>g(O),ae.onmessage=Gr,vr=[c,g];let S={type:"init-wasm",in:pe};if(!S.in.wasm.wasmPaths&&$){let O=ur();O&&(S.in.wasm.wasmPaths=O)}ae.postMessage(S),Ht=$}catch(S){g(S)}},g)});try{await mr(pe.wasm),await Nr(pe),jt=!0}catch(c){throw Vt=!0,c}finally{Ot=!1}}},Hr=async c=>{if(_t())return Rt(),new Promise((g,$)=>{bt("init-ep",[g,$]);let T={type:"init-ep",in:{epName:c,env:pe}};ae.postMessage(T)});await Lr(pe,c)},Li=async c=>_t()?(Rt(),new Promise((g,$)=>{bt("copy-from",[g,$]);let T={type:"copy-from",in:{buffer:c}};ae.postMessage(T,[c.buffer])})):be(c),qi=async(c,g)=>{if(_t()){if(g?.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return Rt(),new Promise(($,T)=>{bt("create",[$,T]);let S={type:"create",in:{model:c,options:{...g}}},O=[];c instanceof Uint8Array&&O.push(c.buffer),ae.postMessage(S,O)})}else return ut(c,g)},ha=async c=>{if(_t())return Rt(),new Promise((g,$)=>{bt("release",[g,$]);let T={type:"release",in:c};ae.postMessage(T)});Fr(c)},Kt=async(c,g,$,T,S,O)=>{if(_t()){if($.some(z=>z[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(S.some(z=>z))throw new Error("pre-allocated output tensor is not supported for proxy.");return Rt(),new Promise((z,k)=>{bt("run",[z,k]);let R=$,q={type:"run",in:{sessionId:c,inputIndices:g,inputs:R,outputIndices:T,options:O}};ae.postMessage(q,Wr(R))})}else return D(c,g,$,T,S,O)},Vi=async c=>{if(_t())return Rt(),new Promise((g,$)=>{bt("end-profiling",[g,$]);let T={type:"end-profiling",in:c};ae.postMessage(T)});Gt(c)}}),Wi,Kr,Zr,Qr=I(()=>{"use strict";je(),Fi(),ne(),sr(),Pi(),Wi=(c,g)=>{switch(c.location){case"cpu":return[c.type,c.dims,c.data,"cpu"];case"gpu-buffer":return[c.type,c.dims,{gpuBuffer:c.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[c.type,c.dims,{mlTensor:c.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${c.location} for ${g()}`)}},Kr=c=>{switch(c[3]){case"cpu":return new Me(c[0],c[2],c[1]);case"gpu-buffer":{let g=c[0];if(!_r(g))throw new Error(`not supported data type: ${g} for deserializing GPU tensor`);let{gpuBuffer:$,download:T,dispose:S}=c[2];return Me.fromGpuBuffer($,{dataType:g,dims:c[1],download:T,dispose:S})}case"ml-tensor":{let g=c[0];if(!br(g))throw new Error(`not supported data type: ${g} for deserializing MLTensor tensor`);let{mlTensor:$,download:T,dispose:S}=c[2];return Me.fromMLTensor($,{dataType:g,dims:c[1],download:T,dispose:S})}default:throw new Error(`invalid data location: ${c[3]}`)}},Zr=class{async fetchModelAndCopyToWasmMemory(c){return Li(await $r(c))}async loadModel(c,g){Ge();let $;typeof c=="string"?$=await this.fetchModelAndCopyToWasmMemory(c):$=c,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await qi($,g),Ve()}async dispose(){return ha(this.sessionId)}async run(c,g,$){Ge();let T=[],S=[];Object.entries(c).forEach(F=>{let M=F[0],ee=F[1],C=this.inputNames.indexOf(M);if(C===-1)throw new Error(`invalid input '${M}'`);T.push(ee),S.push(C)});let O=[],z=[];Object.entries(g).forEach(F=>{let M=F[0],ee=F[1],C=this.outputNames.indexOf(M);if(C===-1)throw new Error(`invalid output '${M}'`);O.push(ee),z.push(C)});let k=T.map((F,M)=>Wi(F,()=>`input "${this.inputNames[S[M]]}"`)),R=O.map((F,M)=>F?Wi(F,()=>`output "${this.outputNames[z[M]]}"`):null),q=await Kt(this.sessionId,S,k,z,R,$),V={};for(let F=0;F<q.length;F++)V[this.outputNames[z[F]]]=O[F]??Kr(q[F]);return Ve(),V}startProfiling(){}endProfiling(){Vi(this.sessionId)}}}),Sr={};ue(Sr,{OnnxruntimeWebAssemblyBackend:()=>Yr,initializeFlags:()=>Xr,wasmBackend:()=>Jr});var Xr,Yr,Jr,Gi=I(()=>{"use strict";je(),Fi(),Qr(),Xr=()=>{(typeof pe.wasm.initTimeout!="number"||pe.wasm.initTimeout<0)&&(pe.wasm.initTimeout=0);let c=pe.wasm.simd;if(typeof c!="boolean"&&c!==void 0&&c!=="fixed"&&c!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${c}". Reset it to \`false\` and ignore SIMD feature checking.`),pe.wasm.simd=!1),typeof pe.wasm.proxy!="boolean"&&(pe.wasm.proxy=!1),typeof pe.wasm.trace!="boolean"&&(pe.wasm.trace=!1),typeof pe.wasm.numThreads!="number"||!Number.isInteger(pe.wasm.numThreads)||pe.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)pe.wasm.numThreads=1;else{let g=typeof navigator>"u"?K("node:os").cpus().length:navigator.hardwareConcurrency;pe.wasm.numThreads=Math.min(4,Math.ceil((g||1)/2))}},Yr=class{async init(c){Xr(),await jr(),await Hr(c)}async createInferenceSessionHandler(c,g){let $=new Zr;return await $.loadModel(c,g),$}},Jr=new Yr}),ji={};ue(ji,{InferenceSession:()=>ar,TRACE:()=>zt,TRACE_FUNC_BEGIN:()=>Ge,TRACE_FUNC_END:()=>Ve,Tensor:()=>Me,default:()=>is,env:()=>pe,registerBackend:()=>Ee}),je(),je(),je();var fa="1.22.0",is=wi;{let c=(Gi(),re(Sr)).wasmBackend;Ee("cpu",c,10),Ee("wasm",c,10)}return Object.defineProperty(pe.versions,"web",{value:fa,enumerable:!0}),re(ji)})();typeof Ec=="object"&&typeof bn=="object"&&(bn.exports=sf)});var zc=Je(qe=>{"use strict";var nf=qe&&qe.__createBinding||(Object.create?(function(P,N,U,H){H===void 0&&(H=U);var K=Object.getOwnPropertyDescriptor(N,U);(!K||("get"in K?!N.__esModule:K.writable||K.configurable))&&(K={enumerable:!0,get:function(){return N[U]}}),Object.defineProperty(P,H,K)}):(function(P,N,U,H){H===void 0&&(H=U),P[H]=N[U]})),of=qe&&qe.__setModuleDefault||(Object.create?(function(P,N){Object.defineProperty(P,"default",{enumerable:!0,value:N})}):function(P,N){P.default=N}),uf=qe&&qe.__importStar||function(P){if(P&&P.__esModule)return P;var N={};if(P!=null)for(var U in P)U!=="default"&&Object.prototype.hasOwnProperty.call(P,U)&&nf(N,P,U);return of(N,P),N};Object.defineProperty(qe,"__esModule",{value:!0});qe.MicVAD=qe.getDefaultRealTimeVADOptions=qe.ort=qe.DEFAULT_MODEL=void 0;var lf=uf(kc()),df=Ra(),$n=Da(),ft=ii(),Dr=oa(),Ic=hn(),pf=mn();qe.DEFAULT_MODEL="legacy";qe.ort=lf;var cf="vad.worklet.bundle.min.js",hf={legacy:"silero_vad_legacy.onnx",v5:"silero_vad_v5.onnx",v6:"silero_vad_v6.onnx"},ff=P=>({...$n.defaultFrameProcessorOptions,onFrameProcessed:()=>{},onVADMisfire:()=>{ft.log.debug("VAD misfire")},onSpeechStart:()=>{ft.log.debug("Detected speech start")},onSpeechEnd:()=>{ft.log.debug("Detected speech end")},onSpeechRealStart:()=>{ft.log.debug("Detected real speech start")},baseAssetPath:"./",onnxWASMBasePath:"./",model:P,workletOptions:{},getStream:async()=>await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:!0,autoGainControl:!0,noiseSuppression:!0}}),pauseStream:async N=>{N.getTracks().forEach(U=>{U.stop()})},resumeStream:async()=>await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:!0,autoGainControl:!0,noiseSuppression:!0}}),ortConfig:N=>{N.env.logLevel="error"},startOnLoad:!0,processorType:"auto"});qe.getDefaultRealTimeVADOptions=ff;var mf=P=>"audioWorklet"in P&&typeof AudioWorkletNode=="function"?"AudioWorklet":"ScriptProcessor";async function gf(P,N,U,H,K){await U.audioWorklet.addModule(P),N.processorOptions={...N.processorOptions??{},frameSamples:H};let I=new AudioWorkletNode(U,"vad-helper-worklet",N);return I.port.onmessage=async ue=>{let ve=ue.data;if(!(typeof ve=="object"&&ve&&"message"in ve)){console.error("Invalid message event",ve);return}switch(ve.message){case Dr.Message.AudioFrame:{if(!("data"in ve&&ve.data instanceof ArrayBuffer)){console.log("Audio frame message has no data");return}let re=new Float32Array(ve.data);await K(re);break}}},I}async function yf(P,N,U){let H=new pf.Resampler({nativeSampleRate:P.sampleRate,targetSampleRate:16e3,targetFrameSize:N});ft.log.debug("using script processor");let I=P.createScriptProcessor(4096,1,1),ue=!1;return I.onaudioprocess=async ve=>{if(!ue){ue=!0;try{let re=ve.inputBuffer.getChannelData(0);ve.outputBuffer.getChannelData(0).fill(0);let ye=H.process(re);for(let Ee of ye)await U(Ee)}catch(re){console.error("Error processing audio:",re)}finally{ue=!1}}},I.connect(P.destination),I}var vn=class P{constructor(N,U,H,K,I=!1,ue=null,ve=null,re=null,fe=null,ye=null,Ee=null,et="uninitialized",dt=!1){this.options=N,this.frameProcessor=U,this.model=H,this.frameSamples=K,this.listening=I,this.errored=ue,this._stream=ve,this._audioContext=re,this._vadNode=fe,this._mediaStreamAudioSourceNode=ye,this._audioProcessorAdapterType=Ee,this.initializationState=et,this.ownsAudioContext=dt,this.getAudioInstances=()=>{if(this._stream===null||this._audioContext===null||this._vadNode==null||this._mediaStreamAudioSourceNode==null)throw new Error("MicVAD has null stream, audio context, or processor adapter");return{stream:this._stream,audioContext:this._audioContext,vadNode:this._vadNode,mediaStreamAudioSourceNode:this._mediaStreamAudioSourceNode}},this.setErrored=Te=>{this.initializationState="errored",this.errored=Te},this.start=async()=>{switch(this.initializationState){case"uninitialized":{ft.log.debug("initializing micVAD"),this.initializationState="initializing",this.frameProcessor.resume();try{this._stream=await this.options.getStream()}catch(Te){throw Te instanceof Error?this.setErrored(Te.message):this.setErrored(String(Te)),Te}if(this.options.audioContext?(console.log("using custom audio context"),this._audioContext=this.options.audioContext):(console.log("using default audio context"),this._audioContext=new AudioContext,this.ownsAudioContext=!0),!this._audioContext)throw this.setErrored("Audio context is null"),Error("Audio context is null");switch(this._audioProcessorAdapterType=this.options.processorType=="auto"?mf(this._audioContext):this.options.processorType,this._audioProcessorAdapterType){case"AudioWorklet":this._vadNode=await gf(this.options.baseAssetPath+cf,this.options.workletOptions,this._audioContext,this.frameSamples,this.processFrame);break;case"ScriptProcessor":this._vadNode=await yf(this._audioContext,this.frameSamples,this.processFrame);break;default:throw new Error(`Unsupported audio processor adapter type: ${this._audioProcessorAdapterType}`)}this._mediaStreamAudioSourceNode=new MediaStreamAudioSourceNode(this._audioContext,{mediaStream:this._stream}),this._mediaStreamAudioSourceNode.connect(this._vadNode),ft.log.debug("started micVAD"),this.listening=!0,this.initializationState="initialized";break}case"initializing":{ft.log.warn("start called while initializing");break}case"initialized":{if(this.listening)return;this.listening=!0,this.frameProcessor.resume();let{stream:Te,audioContext:mt,vadNode:Jt}=this.getAudioInstances();this._stream=await this.options.resumeStream(Te);let Pr=new MediaStreamAudioSourceNode(mt,{mediaStream:this._stream});this._mediaStreamAudioSourceNode=Pr,Pr.connect(Jt);break}case"destroyed":{ft.log.warn("start called after destroyed");break}case"errored":{ft.log.error("start called after errored");break}default:{ft.log.warn("weird initialization state");break}}},this.pause=async()=>{if(!this.listening)return;this.listening=!1;let{stream:Te,mediaStreamAudioSourceNode:mt}=this.getAudioInstances();await this.options.pauseStream(Te),mt.disconnect(),this.frameProcessor.pause(this.handleFrameProcessorEvent)},this.destroy=async()=>{ft.log.debug("destroy called"),this.initializationState="destroyed";let{vadNode:Te}=this.getAudioInstances();Te instanceof AudioWorkletNode&&Te.port.postMessage(Dr.Message.SpeechStop),this.listening&&await this.pause(),await this.model.release(),this.ownsAudioContext&&await this._audioContext?.close()},this.setOptions=Te=>{this.frameProcessor.setOptions(Te)},this.processFrame=async Te=>{await this.frameProcessor.process(Te,this.handleFrameProcessorEvent)},this.handleFrameProcessorEvent=Te=>{switch(Te.msg){case Dr.Message.FrameProcessed:this.options.onFrameProcessed(Te.probs,Te.frame);break;case Dr.Message.SpeechStart:this.options.onSpeechStart();break;case Dr.Message.SpeechRealStart:this.options.onSpeechRealStart();break;case Dr.Message.VADMisfire:this.options.onVADMisfire();break;case Dr.Message.SpeechEnd:this.options.onSpeechEnd(Te.audio);break}}}static async new(N={}){let U={...(0,qe.getDefaultRealTimeVADOptions)(N.model??qe.DEFAULT_MODEL),...N};(0,$n.validateOptions)(U),qe.ort.env.wasm.wasmPaths=U.onnxWASMBasePath,U.ortConfig!==void 0&&U.ortConfig(qe.ort);let H=U.baseAssetPath+hf[U.model],K=U.model==="legacy"?Ic.SileroLegacy.new:Ic.Silero.new,I;try{I=await K(qe.ort,()=>(0,df.defaultModelFetcher)(H))}catch(ye){throw console.error(`Encountered an error while loading model file ${H}`),ye}let ue=U.model==="legacy"?1536:512,ve=ue/16,re=new $n.FrameProcessor(I.process,I.reset_state,{positiveSpeechThreshold:U.positiveSpeechThreshold,negativeSpeechThreshold:U.negativeSpeechThreshold,redemptionMs:U.redemptionMs,preSpeechPadMs:U.preSpeechPadMs,minSpeechMs:U.minSpeechMs,submitUserSpeechOnPause:U.submitUserSpeechOnPause},ve),fe=new P(U,re,I,ue);if(U.startOnLoad)try{await fe.start()}catch(ye){throw console.error("Error starting micVad",ye),ye}return fe}};qe.MicVAD=vn});var Cc=Je(We=>{"use strict";Object.defineProperty(We,"__esModule",{value:!0});We.getDefaultRealTimeVADOptions=We.MicVAD=We.DEFAULT_MODEL=We.utils=We.NonRealTimeVAD=We.Message=We.FrameProcessor=We.defaultModelFetcher=We.baseAssetPath=void 0;var wf=ln();Object.defineProperty(We,"baseAssetPath",{enumerable:!0,get:function(){return wf.baseAssetPath}});var _f=Ra();Object.defineProperty(We,"defaultModelFetcher",{enumerable:!0,get:function(){return _f.defaultModelFetcher}});var bf=Da();Object.defineProperty(We,"FrameProcessor",{enumerable:!0,get:function(){return bf.FrameProcessor}});var $f=oa();Object.defineProperty(We,"Message",{enumerable:!0,get:function(){return $f.Message}});var vf=xc();Object.defineProperty(We,"NonRealTimeVAD",{enumerable:!0,get:function(){return vf.NonRealTimeVAD}});var Va=Sc();We.utils={audioFileToArray:Va.audioFileToArray,minFramesForTargetMS:Va.minFramesForTargetMS,arrayBufferToBase64:Va.arrayBufferToBase64,encodeWAV:Va.encodeWAV};var xn=zc();Object.defineProperty(We,"DEFAULT_MODEL",{enumerable:!0,get:function(){return xn.DEFAULT_MODEL}});Object.defineProperty(We,"MicVAD",{enumerable:!0,get:function(){return xn.MicVAD}});Object.defineProperty(We,"getDefaultRealTimeVADOptions",{enumerable:!0,get:function(){return xn.getDefaultRealTimeVADOptions}})});var Ac=Mh(Cc());globalThis.CVBSilero=Object.freeze({MicVAD:Ac.MicVAD});})();
/*! Bundled license information:

onnxruntime-web/dist/ort.min.js:
  (*!
   * ONNX Runtime Web v1.22.0
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
  (**
   * @license
   * Copyright 2020 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
  (**
   * @license
   * Copyright 2019 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)

onnxruntime-web/dist/ort.wasm.min.js:
  (*!
   * ONNX Runtime Web v1.22.0
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)
*/
