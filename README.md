# Claude Voice Bridge

## v0.2.0 kéz nélküli mód (fejlesztési változat)

- **Automata: be/ki** gomb a claude.ai oldalán. Első aktiváláskor a helyi **Silero VAD v5** betöltődik az ONNX/WASM csomagból.
- Kb. **1,2 másodperc csend** után automatikus leirat és üzenetküldés; a küszöb a beállításokban **700 és 2500 ms** között állítható.
- **Half-duplex**: a VAD szünetel a Gemini STT, Claude-válasz és Gemini TTS teljes ideje alatt. A válasz felolvasása után újra hallgat.
- Megerősítéses módban a **„küldd”** vagy **„töröld”** hangparancs használható. A felolvasás megismétlésére az **„ismételd”**, kikapcsolásra a **„vége”** parancs szolgál.
- Induláskor mindig **kikapcsolt**. A korábbi kézi push-to-talk mód változatlanul megmarad. Mikrofonnal kapcsolatos hiba esetén kézi módra lehet visszatérni.
- **Nem autós használatra hitelesített.** A Quetta ONNX/WASM és audio-worklet támogatását valódi eszközön még ellenőrizni kell. A munkamenet a böngésző előterében működik, háttérben nem garantált.
- **Fontos:** a régi v0.1.0 ZIP nem tartalmazza a Silero modellt. A kéz nélküli módhoz a **[Claude-Voice-Bridge-v0.2.0.zip](Claude-Voice-Bridge-v0.2.0.zip)** telepítése szükséges. Ez a fájl a GitHub Actions sikeres buildje után jelenik meg.

### Fejlesztői build

Node.js 20+ és npm szükséges, egyszeri `npm install`, majd `npm run check`, `npm run build`, `npm run pack`. A build az összes felhasznált ONNX-modellt, audio-workletet és WASM/MJS runtime-fájlt a csomagba másolja. Futás közben semmilyen CDN-kódot nem tölt be.

---



Privát proof of concept a **claude.ai** magyar nyelvű hangos használatához. Manifest V3 Chrome-bővítmény, amely a Claude webes munkamenetét használja, és **Gemini 3.5 Transcribe** segítségével készít leiratot, **Gemini 3.8 Flash-Lite TTS** segítségével olvassa fel a választ. Nincs Claude API-hívás és nincs szükség külön szerverre.

## Állapot

**v0.1.0, push-to-talk MVP igazolt Quettán a felhasználó által; v0.2.0 Silero kódja elkészült, Quetta-tesztelésre vár.** Az alapfunkciók meg vannak írva; a claude.ai aktuális felületén, Gemini API-kulccsal, illetve Android/Quetta alatt végponttól végpontig még tesztelendő. **A kormánygombvezérlés és az autós használat még nincsen kész, az automatikus VAD Quetta-tesztje hátravan.**

## Telepítés: asztali Chrome

1. Töltsd le a repó gyökerében található **[Claude-Voice-Bridge-v0.2.0.zip](Claude-Voice-Bridge-v0.2.0.zip)** fájlt, és csomagold ki. A korábbi, Quettán már ellenőrzött **[v0.1.0](Claude-Voice-Bridge-v0.1.0.zip)** változat megmarad.
2. Chrome: `chrome://extensions` → **Developer mode** → **Load unpacked** → a kicsomagolt projekt mappája.
3. A bővítmény **Beállítások** lapján add meg a saját [Gemini API-kulcsodat](https://aistudio.google.com/apikey).
4. Nyisd meg a `https://claude.ai/` oldalt egy bejelentkezett munkamenetben.
5. A jobb alsó sarokban a **Beszéd indítása** gombbal kezdd el a kézi módot, majd ugyanezzel zárd le a felvételt. A kéz nélküli módhoz egyszer nyomd meg az **Automata: ki** gombot. A leirat vagy automatikusan elküldésre kerül, vagy jóváhagyásra vár a beállításodtól függően.
6. A Claude válasza után megindul a hangos felolvasás. A **Stop** gomb leállítja, az **Ismétlés** újra felolvassa.

## Android: Quetta (kísérleti)

A Quettában a **[Claude-Voice-Bridge-v0.2.0.zip](Claude-Voice-Bridge-v0.2.0.zip)** fájlt töltsd be a saját bővítménykezelőjében. A Chrome Androidon nem támogatja a hagyományos bővítményeket. A Quetta **MV3 service worker, getUserMedia, API-hívások és autoplay** kompatibilitása egyelőre nincs ellenőrizve. Használatkor a Quetta maradjon előtérben, és a kijelző bekapcsolva.

## Fő funkciók

- Mikrofonos felvétel (maximum 120 másodperc), háttérhang-feldolgozás a Google API-ján.
- Gemini Files API feltöltés + Transcribe Interactions API (`gemini-3.5-transcribe`).
- Gemini TTS Interactions API (`gemini-3.8-flash-lite-tts`) és magyar szöveg tisztítása felolvasáshoz.
- Megerősítéses/automatikus küldési mód, nem üres szerkesztő tartalmának megőrzése.
- Látható hibák DOM-változás esetén, stopper a hosszabb Claude-válaszra.
- API-kulcs az extension helyi, tartalom-szkriptek elől korlátozott tárolójában.
- Napi STT-perc és TTS-karakter kvóta, állítható modell, hang, STT-szótár.
- Az API-hívások csak a felhasználó által elindított felvétel vagy felolvasás után indulnak.

## Nem része a v0.2.0-nak

Beszéd alapú közbevágás TTS közben, Bluetooth kormánygomb, sidePanel, bekezdésenkénti élő TTS, vezetés közbeni ellenőrzött autós üzemmód. A részletes továbbfejlesztési ütemterv a `docs/ROADMAP.md` fájlban található.

## Biztonság és adatvédelem

Az API-kulcsot **soha ne commitold**. A mikrofon felvétele és a felolvasandó Claude-válasz részletei a Google Gemini API-hoz kerülnek; a felvételeket a Files API kezeli, és a bővítmény a feldolgozás után törlést kér rájuk. A prototípust **ne használd érzékeny adatokkal**. A kvóták kizárólag helyi szoftveres korlátok, nem garantált számlázási limitek. Állíts be külön keretet a Google Cloudban. A felhasználó végzi a Claude bejelentkezést, a bővítmény nem tárol Claude-jelszót.

## Tesztelés

Nincs telepítendő JS-függőség. Node.js 20+ alatt: `node --test tests/*.test.cjs`. A GitHub Actions is futtatja az egységteszteket.

API-dokumentáció: [Gemini Transcription](https://ai.google.dev/gemini-api/docs/transcribe), [Gemini Files API](https://ai.google.dev/gemini-api/docs/files), [Gemini TTS](https://ai.google.dev/gemini-api/docs/speech-generation).
