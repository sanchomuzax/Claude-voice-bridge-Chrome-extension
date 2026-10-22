import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { build } from "esbuild";
import { join } from "node:path";

const source = "node_modules/@ricky0123/vad-web/dist";
const wasmSource = "node_modules/onnxruntime-web/dist";
if (!existsSync(join(source, "silero_vad_v5.onnx"))) throw Error("Silero v5 model missing");
mkdirSync("dist", { recursive: true });
mkdirSync("vendor", { recursive: true });
await build({
  entryPoints: ["src/silero-entry.js"],
  outfile: "dist/vad-bundle.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["chrome110"],
  minify: true,
  logLevel: "info"
});
for (const file of ["silero_vad_v5.onnx", "vad.worklet.bundle.min.js"]) {
  copyFileSync(join(source, file), join("vendor", file));
}
for (const file of readdirSync(wasmSource).filter(name => name.endsWith(".wasm") || name.endsWith(".mjs"))) {
  copyFileSync(join(wasmSource, file), join("vendor", file));
}
console.log("VAD scripts and local ONNX/WASM assets ready (no runtime CDN).");
