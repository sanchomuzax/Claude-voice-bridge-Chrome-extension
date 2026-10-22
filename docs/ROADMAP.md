# Fejlesztési terv és tesztkapuk

A csatolt **Claude Voice Bridge** koncepciót követő fejlesztési ütemterv. A repóban jelenleg az **MVP (push-to-talk)** kódja található.

## 0. API / architektúra felmérés – kész kódszinten

- Manifest V3 service worker, Quetta-kompatibilitásra törekvő content-script UI.
- Gemini 3.5 Transcribe a Files + Interactions API-val. A felvételt a Google feldolgozza, a törlés best effort.
- Gemini 3.8 Flash-Lite TTS az Interactions API-val, külön beszédstílus-metaadattal.
- Kulcs elkülönítve, korlátozott tartalom-szkript hozzáféréssel.

## 1. Push-to-talk MVP – elkészült a kód, eszközön tesztelendő

- Felvétel és 120 s limit, STT, beillesztés és opcionális automatikus küldés.
- Claude válaszának megfigyelése (DOM-helyettesítés miatt szelektorok tesztelendők).
- TTS-sel felolvasás, darabolás, stop, ismétlés, system speechSynthesis fallback.
- 20 tesztforduló asztali Chrome-ban és Quettában. Cél: legalább 95% hibátlan leirat.

**Kockázatok:** DOM-verzióeltérések, Quetta getUserMedia/MediaRecorder/extension API-támogatás, mobil autolejátszás. A szoftver ezeket még nem igazolta.

## 2. Kéz nélküli beszélgetés – nincs implementálva

- Silero VAD WASM beépítése saját csomagból, illetve erőforrás-kímélő mobil alternatíva.
- 1,2 s csendküszöb, 3 beszédkeret kezdéshez, 500 ms minimális hang.
- Half-duplex felolvasás közbeni mikrofonzár, fejhallgatós barge-in.
- 10 perces hamis indulás nélküli teszt.

## 3. Késleltetés-optimalizálás – nincs implementálva

- Streaming válasz lezárt bekezdéseinek felismerése.
- Pipelined TTS hívások és sorban lejátszás.
- Első hang cél: 1,5 másodperc a bekezdés lezárása után.

## 4. Autós mód – nincs implementálva

- Media Session play/pause és Android Auto kompatibilitási vizsgálat.
- Wake Lock és háttérbeli életciklus mérése Quettában.
- Kormánygomb csak ha valóban támogatott; vezetés közben nem ajánlott képernyőkezelés.

## További ellenőrzések

- Gemini API-val éles STT/TTS hívás saját kulccsal.
- claude.ai felület szelektorai magyar és angol UI-n, projektbeszélgetésben és hosszú válasznál.
- Engedélykérés a mobil böngészőben, automatikus hanglejátszás, felfüggesztés.
- Google API-kulcs számlázási limitje és adatkezelési feltételei.
- Chrome commands hibakezelés és UI visszajelzés.
