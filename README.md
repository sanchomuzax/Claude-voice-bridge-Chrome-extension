# Claude Voice Bridge

Privát proof of concept a **claude.ai** magyar nyelvű hangos használatához. Manifest V3 Chrome-bővítmény, amely a Claude webes munkamenetét használja, és **Gemini 3.5 Transcribe** segítségével készít leiratot, **Gemini 3.8 Flash-Lite TTS** segítségével olvassa fel a választ. Nincs Claude API-hívás és nincs szükség külön szerverre.

## Állapot

**v0.1.0, push-to-talk MVP.** Az alapfunkciók meg vannak írva; a claude.ai aktuális felületén, Gemini API-kulccsal, illetve Android/Quetta alatt végponttól végpontig még tesztelendő. **A kéz nélküli VAD, a vezetés közbeni használat és a kormánygombvezérlés még nincsenek kész.**

## Telepítés: asztali Chrome

1. Töltsd le a projektet ZIP-ként a GitHubon (Code → Download ZIP), és csomagold ki.
2. Chrome: `chrome://extensions` → **Developer mode** → **Load unpacked** → a kicsomagolt projekt mappája.
3. A bővítmény **Beállítások** lapján add meg a saját [Gemini API-kulcsodat](https://aistudio.google.com/apikey).
4. Nyisd meg a `https://claude.ai/` oldalt egy bejelentkezett munkamenetben.
5. A jobb alsó sarokban a **Beszéd indítása** gombbal kezdd el, majd ugyanezzel zárd le a felvételt. A leirat vagy automatikusan elküldésre kerül, vagy jóváhagyásra vár a beállításodtól függően.
6. A Claude válasza után megindul a hangos felolvasás. A **Stop** gomb leállítja, az **Ismétlés** újra felolvassa.

## Android: Quetta (kísérleti)

A Quetta megfelelő verziója alatt ZIP-ként töltsd be a bővítményt a saját bővítménykezelőjében. A Chrome Androidon nem támogatja a hagyományos bővítményeket. A Quetta **MV3 service worker, getUserMedia, API-hívások és autoplay** kompatibilitása egyelőre nincs ellenőrizve. Használatkor a Quetta maradjon előtérben, és a kijelző bekapcsolva.

## Fő funkciók

- Mikrofonos felvétel (maximum 120 másodperc), háttérhang-feldolgozás a Google API-ján.
- Gemini Files API feltöltés + Transcribe Interactions API (`gemini-3.5-transcribe`).
- Gemini TTS Interactions API (`gemini-3.8-flash-lite-tts`) és magyar szöveg tisztítása felolvasáshoz.
- Megerősítéses/automatikus küldési mód, nem üres szerkesztő tartalmának megőrzése.
- Látható hibák DOM-változás esetén, stopper a hosszabb Claude-válaszra.
- API-kulcs az extension helyi, tartalom-szkriptek elől korlátozott tárolójában.
- Napi STT-perc és TTS-karakter kvóta, állítható modell, hang, STT-szótár.
- Az API-hívások csak a felhasználó által elindított felvétel vagy felolvasás után indulnak.

## Nem része az MVP-nek

Silero VAD, folyamatos hallgatás, beszéd alapú közbevágás, Bluetooth kormánygomb, sidePanel, bekezdésenkénti élő TTS, vakon működő autós üzemmód. A részletes továbbfejlesztési ütemterv a `docs/ROADMAP.md` fájlban található.

## Biztonság és adatvédelem

Az API-kulcsot **soha ne commitold**. A mikrofon felvétele és a felolvasandó Claude-válasz részletei a Google Gemini API-hoz kerülnek; a felvételeket a Files API kezeli, és a bővítmény a feldolgozás után törlést kér rájuk. A prototípust **ne használd érzékeny adatokkal**. A kvóták kizárólag helyi szoftveres korlátok, nem garantált számlázási limitek. Állíts be külön keretet a Google Cloudban. A felhasználó végzi a Claude bejelentkezést, a bővítmény nem tárol Claude-jelszót.

## Tesztelés

Nincs telepítendő JS-függőség. Node.js 20+ alatt: `node --test tests/*.test.cjs`. A GitHub Actions is futtatja az egységteszteket.

API-dokumentáció: [Gemini Transcription](https://ai.google.dev/gemini-api/docs/transcribe), [Gemini Files API](https://ai.google.dev/gemini-api/docs/files), [Gemini TTS](https://ai.google.dev/gemini-api/docs/speech-generation).
