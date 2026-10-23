#!/usr/bin/env python3
"""Native Messaging updater for unpacked Claude Voice Bridge (Windows Edge/Chrome).

No third-party dependencies. Installs only the published GitHub Release ZIP
from the fixed repository and verifies its SHA-256 release checksum. Neither
URLs, filesystem paths nor arbitrary commands are accepted from the extension.
"""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import struct
import sys
import tempfile
import urllib.request
import zipfile

REPO = "sanchomuzax/Claude-voice-bridge-Chrome-extension"
API = f"https://api.github.com/repos/{REPO}/releases/tags/"
HOST = "com.sancho.cvb_updater"
MAX_DOWNLOAD = 100 * 1024 * 1024
MAX_EXTRACT = 240 * 1024 * 1024
VALID_VERSION = re.compile(r"^\d+\.\d+\.\d+$")
STATIC_FILES = {
    "FRISSITES.bat", "update.bat", "manifest.json", "background.js", "content.js", "shared.js",
    "vad-codec.js", "panel-ui.js", "selectors.json",
    "options.html", "options.js", "popup.html", "popup.js", "popup.css",
    "ui.css", "dist/vad-bundle.js", "vendor/silero_vad_v5.onnx",
    "vendor/vad.worklet.bundle.min.js", "native/updater.py",
    "native/install-windows.ps1", "native/update-standalone.py"
}
USER_AGENT = "ClaudeVoiceBridgeUpdater/1.0"


def allowed_file(name):
    """Only files from the known, installable browser-extension package."""
    if name in STATIC_FILES:
        return True
    if name in {"config.json", "updater.json"}:
        return False
    if bool(re.fullmatch(r"[A-Za-z][A-Za-z0-9_.-]*\.(?:js|css|html|json)", name)):
        return True
    if bool(re.fullmatch(r"dist/[A-Za-z][A-Za-z0-9_.-]*\.js", name)):
        return True
    p = PurePosixPath(name)
    return (len(p.parts) == 2 and p.parts[0] == "vendor"
            and bool(re.fullmatch(r"[A-Za-z0-9_.-]+\.(wasm|mjs)", p.parts[1])))


def request_bytes(url, maximum=MAX_DOWNLOAD):
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "application/vnd.github+json" if "api.github.com" in url else "application/octet-stream",
    })
    with urllib.request.urlopen(req, timeout=55) as response:
        data = response.read(maximum + 1)
    if len(data) > maximum:
        raise ValueError("A GitHub csomag túllépte a méretkorlátot.")
    return data


def manifest_version(data):
    version = json.loads(data.decode("utf-8"))["version"]
    if not VALID_VERSION.fullmatch(version):
        raise ValueError("Érvénytelen verziószám.")
    return version


def version_tuple(v):
    if not VALID_VERSION.fullmatch(v):
        raise ValueError("Érvénytelen verziószám.")
    return tuple(map(int, v.split(".")))


def fetch_release(version):
    if not VALID_VERSION.fullmatch(version):
        raise ValueError("Érvénytelen kiadásazonosító.")
    tag = "v" + version
    release = json.loads(request_bytes(API + tag, 2 * 1024 * 1024).decode("utf-8"))
    if release.get("tag_name") != tag or release.get("draft") or release.get("prerelease"):
        raise ValueError("A kért verzió nem stabil GitHub-kiadás.")
    archive = f"Claude-Voice-Bridge-v{version}.zip"
    urls = {}
    for item in release.get("assets", []):
        if item.get("name") in (archive, archive + ".sha256"):
            name = item["name"]
            expected = f"https://github.com/{REPO}/releases/download/{tag}/{name}"
            if item.get("browser_download_url") != expected:
                raise ValueError("A GitHub kiadási eszközének címe nem egyezik az elvárttal.")
            urls[name] = expected
    if set(urls) != {archive, archive + ".sha256"}:
        raise ValueError("Hiányzik a ZIP vagy a SHA-256 ellenőrzőösszeg.")
    return archive, urls


def stage_release(zip_path, stage_dir, version):
    seen = set()
    total = 0
    paths = []
    with zipfile.ZipFile(zip_path) as zf:
        infos = zf.infolist()
        if len(infos) > 100:
            raise ValueError("Túl sok fájl a frissítőcsomagban.")
        for info in infos:
            name = info.filename
            if info.is_dir():
                continue
            pp = PurePosixPath(name)
            if (not allowed_file(name) or str(pp) != name or ".." in pp.parts
                    or name.startswith("/") or "\\" in name or ":" in name):
                raise ValueError("Tiltott útvonal a ZIP-ben: " + name)
            if name.casefold() in seen:
                raise ValueError("Többször szereplő ZIP-állomány: " + name)
            seen.add(name.casefold())
            if stat.S_IFMT(info.external_attr >> 16) == stat.S_IFLNK:
                raise ValueError("Szimbolikus link nem telepíthető.")
            total += info.file_size
            if total > MAX_EXTRACT or info.file_size > MAX_DOWNLOAD:
                raise ValueError("A kicsomagolt állomány túl nagy.")
            dest = stage_dir.joinpath(*pp.parts)
            dest.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(info) as source, dest.open("wb") as sink:
                shutil.copyfileobj(source, sink)
            paths.append(name)
    if not STATIC_FILES.issubset(set(paths)):
        raise ValueError("A kiadás nem tartalmaz minden szükséges bővítményfájlt.")
    if manifest_version((stage_dir / "manifest.json").read_bytes()) != version:
        raise ValueError("A ZIP-ben lévő manifest verziója nem egyezik a kiadással.")
    return paths


def install_release(extension_dir, version):
    target = Path(extension_dir).resolve(strict=True)
    current_file = target / "manifest.json"
    if not current_file.is_file():
        raise ValueError("Az előre beállított mappa nem kicsomagolt bővítmény.")
    existing = json.loads(current_file.read_text(encoding="utf-8-sig"))
    if existing.get("name") != "Claude Voice Bridge":
        raise ValueError("A telepítési mappa nem Claude Voice Bridge.")
    current = existing.get("version", "")
    if version_tuple(version) <= version_tuple(current):
        return {"ok": True, "version": current, "already_current": True}
    archive, urls = fetch_release(version)
    # Staging and backup are on the SAME filesystem as the extension.
    with tempfile.TemporaryDirectory(prefix=".cvb-update-", dir=str(target.parent)) as temp:
        root = Path(temp)
        archive_bytes = request_bytes(urls[archive])
        digest_bytes = request_bytes(urls[archive + ".sha256"], 1024)
        expected_match = re.search(rb"\b([a-fA-F0-9]{64})\b", digest_bytes)
        if not expected_match:
            raise ValueError("A SHA-256 ellenőrzőösszeg hibás formátumú.")
        actual = hashlib.sha256(archive_bytes).hexdigest()
        if actual.lower() != expected_match.group(1).decode("ascii").lower():
            raise ValueError("A ZIP SHA-256 ellenőrzése sikertelen. Telepítés megszakítva.")
        (root / archive).write_bytes(archive_bytes)
        stage = root / "stage"
        stage.mkdir()
        paths = stage_release(root / archive, stage, version)
        backup = root / "backup"
        backup.mkdir()
        replaced = []
        try:
            # Update manifest last, after all implementation assets are installed.
            for name in sorted(paths, key=lambda item: item == "manifest.json"):
                destination = target.joinpath(*PurePosixPath(name).parts)
                # Reject symlinked parents too. Otherwise vendor/foo.wasm could
                # escape into an unrelated folder via a symlinked vendor dir.
                for ancestor in [destination, *list(destination.parents)]:
                    if ancestor == target:
                        break
                    if ancestor.is_symlink():
                        raise ValueError("Szimbolikus link a telepítési célhelyen: " + name)
                destination.parent.mkdir(parents=True, exist_ok=True)
                previous = backup.joinpath(*PurePosixPath(name).parts)
                existed = destination.exists()
                if existed:
                    previous.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(destination, previous)
                replaced.append((destination, previous, existed))
                os.replace(stage.joinpath(*PurePosixPath(name).parts), destination)
            if manifest_version(current_file.read_bytes()) != version:
                raise ValueError("Telepítés utáni verzióellenőrzési hiba.")
        except Exception:
            for destination, previous, existed in reversed(replaced):
                try:
                    if existed and previous.exists():
                        os.replace(previous, destination)
                    elif not existed and destination.exists():
                        destination.unlink()
                except OSError:
                    pass
            raise
    return {"ok": True, "version": version}


def read_message():
    header = sys.stdin.buffer.read(4)
    if len(header) != 4:
        raise ValueError("Hiányzó Native Messaging fejléc.")
    length = struct.unpack("<I", header)[0]
    if length < 2 or length > 1024 * 1024:
        raise ValueError("Érvénytelen Native Messaging csomagméret.")
    data = sys.stdin.buffer.read(length)
    if len(data) != length:
        raise ValueError("Hiányos Native Messaging csomag.")
    return json.loads(data.decode("utf-8"))


def send_message(value):
    payload = json.dumps(value, ensure_ascii=False).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("<I", len(payload)) + payload)
    sys.stdout.buffer.flush()


def main():
    try:
        config = json.loads(Path(__file__).with_name("config.json").read_text(encoding="utf-8"))
        caller = sys.argv[1].rstrip("/") if len(sys.argv) >= 2 else ""
        if caller != config.get("origin", "").rstrip("/"):
            raise ValueError("A hívó bővítményazonosítója nem engedélyezett.")
        msg = read_message()
        if msg.get("cmd") != "install":
            raise ValueError("Nem engedélyezett frissítőművelet.")
        version = msg.get("version")
        if not isinstance(version, str):
            raise ValueError("Hiányzó verzió.")
        send_message(install_release(config["extension_dir"], version))
    except Exception as error:
        send_message({"ok": False, "error": str(error)[:450]})


if __name__ == "__main__":
    main()
