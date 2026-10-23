#!/usr/bin/env python3
"""Standalone, registry-free Claude Voice Bridge updater for Windows Edge/Chrome.

Run from an unpacked extension folder:
  py -3 native/update-standalone.py --check
  py -3 native/update-standalone.py --install
Only the fixed project's published GitHub Release is accepted.
"""
import argparse
import json
from pathlib import Path
import sys

import updater

LATEST_API = "https://api.github.com/repos/" + updater.REPO + "/releases/latest"


def check_latest(extension_dir):
    manifest = extension_dir / "manifest.json"
    if not manifest.is_file():
        raise ValueError("A megadott mappa nem tartalmaz manifest.json fájlt.")
    info = json.loads(manifest.read_text(encoding="utf-8-sig"))
    if info.get("name") != "Claude Voice Bridge":
        raise ValueError("Nem Claude Voice Bridge bővítménymappa.")
    current = info.get("version", "")
    updater.version_tuple(current)
    release = json.loads(updater.request_bytes(LATEST_API, 2 * 1024 * 1024).decode("utf-8"))
    if release.get("draft") or release.get("prerelease"):
        raise ValueError("A legújabb GitHub-kiadás nem stabil.")
    tag = release.get("tag_name", "")
    if not isinstance(tag, str) or not tag.startswith("v"):
        raise ValueError("Érvénytelen GitHub Release tag.")
    latest = tag[1:]
    updater.version_tuple(latest)
    return current, latest


def main():
    parser = argparse.ArgumentParser(description="Claude Voice Bridge registry nélküli frissítés")
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--check", action="store_true", help="Csak verzióellenőrzés")
    action.add_argument("--install", action="store_true", help="Frissítés telepítése")
    parser.add_argument("--extension-dir", type=Path,
                        default=Path(__file__).resolve().parent.parent,
                        help="Kicsomagolt bővítmény mappája (alapértelmezett: a szkript szülőmappája)")
    args = parser.parse_args()
    try:
        target = args.extension_dir.resolve(strict=True)
        current, latest = check_latest(target)
        print(f"Telepített verzió: {current}. Legújabb stabil kiadás: {latest}.")
        if updater.version_tuple(latest) <= updater.version_tuple(current):
            print("Nincs újabb stabil kiadás.")
            return 0
        if args.check:
            print("Újabb verzió érhető el. Telepítéshez használd a --install kapcsolót.")
            return 0
        result = updater.install_release(target, latest)
        if not result.get("ok"):
            raise RuntimeError(str(result.get("error", "Sikertelen frissítés.")))
        print(f"Frissítve: {result['version']}. Edge/Chrome bővítmény újratöltése, majd a claude.ai fül frissítése szükséges.")
        return 0
    except Exception as exc:
        print(f"Frissítési hiba: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
