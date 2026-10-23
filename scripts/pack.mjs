import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";

const output = "Claude-Voice-Bridge-v0.5.10.zip";
const files = [
  "manifest.json","background.js","content.js","shared.js","vad-codec.js","panel-ui.js",
  "selectors.json","options.html","options.js","popup.html","popup.js","popup.css","ui.css",
  "native/updater.py","native/install-windows.ps1","native/update-standalone.py",
  "dist/vad-bundle.js","vendor/silero_vad_v5.onnx","vendor/vad.worklet.bundle.min.js"
];
import { readdirSync } from "node:fs";
for (const f of readdirSync("vendor").filter(n => n.endsWith(".wasm") || n.endsWith(".mjs"))) {
  files.push("vendor/" + f);
}
for (const path of files) if (!existsSync(path)) throw Error("Missing extension file: " + path);
if (existsSync(output)) rmSync(output);
execFileSync("zip", ["-9", "-q", output, ...files], {stdio:"inherit"});
console.log(output);
