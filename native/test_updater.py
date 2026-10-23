"""Offline tests: native updater cannot execute commands or overwrite arbitrary files."""
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock
import zipfile

import updater as u


def package(version="0.5.9"):
    out = io.BytesIO()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for name in sorted(u.STATIC_FILES):
            body = (json.dumps({"name": "Claude Voice Bridge", "version": version})
                    if name == "manifest.json" else "new content for " + name)
            z.writestr(name, body)
    return out.getvalue()


class NativeUpdaterTest(unittest.TestCase):
    def test_versions_and_fixed_package_paths(self):
        self.assertEqual(u.version_tuple("0.5.9"), (0, 5, 9))
        for path in ("../../evil.exe", "/tmp/evil", "vendor/evil.exe",
                     "native/host.py", "dist/x.exe", "config.json"):
            self.assertFalse(u.allowed_file(path), path)
        self.assertTrue(u.allowed_file("vendor/ort-wasm-simd.wasm"))
        self.assertTrue(u.allowed_file("manifest.json"))

    def test_staging_rejects_path_traversal(self):
        out = io.BytesIO()
        with zipfile.ZipFile(out, "w") as z:
            z.writestr("../../outside.txt", "bad")
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "input.zip"
            p.write_bytes(out.getvalue())
            with self.assertRaises(ValueError):
                u.stage_release(p, Path(tmp) / "extract", "0.5.9")

    def test_staging_rejects_wrong_manifest(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "input.zip"
            p.write_bytes(package("0.5.6"))
            with self.assertRaisesRegex(ValueError, "verzió"):
                u.stage_release(p, Path(tmp) / "extract", "0.5.9")

    def test_valid_checksum_install_updates_only_allowlisted_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "extension"
            root.mkdir()
            (root / "manifest.json").write_text(json.dumps({
                "name": "Claude Voice Bridge", "version": "0.5.8"
            }))
            (root / "own_notes.txt").write_text("do not touch")
            zip_data = package()
            archive = "Claude-Voice-Bridge-v0.5.9.zip"
            urls = {archive: "zip", archive + ".sha256": "checksum"}
            sha = hashlib.sha256(zip_data).hexdigest()
            responses = {"zip": zip_data, "checksum": (sha + "  " + archive + "\n").encode()}
            with mock.patch.object(u, "fetch_release", return_value=(archive, urls)):
                with mock.patch.object(u, "request_bytes", side_effect=lambda url, *_: responses[url]):
                    result = u.install_release(root, "0.5.9")
            self.assertEqual(result["version"], "0.5.9")
            self.assertEqual(u.manifest_version((root / "manifest.json").read_bytes()), "0.5.9")
            self.assertEqual((root / "own_notes.txt").read_text(), "do not touch")
            self.assertTrue((root / "vendor/silero_vad_v5.onnx").is_file())

    def test_mismatch_checksum_leaves_extension_unchanged(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "extension"
            root.mkdir()
            original = json.dumps({"name": "Claude Voice Bridge", "version": "0.5.8"})
            (root / "manifest.json").write_text(original)
            archive = "Claude-Voice-Bridge-v0.5.9.zip"
            urls = {archive: "zip", archive + ".sha256": "checksum"}
            responses = {"zip": package(), "checksum": b"0" * 64}
            with mock.patch.object(u, "fetch_release", return_value=(archive, urls)):
                with mock.patch.object(u, "request_bytes", side_effect=lambda url, *_: responses[url]):
                    with self.assertRaisesRegex(ValueError, "SHA-256"):
                        u.install_release(root, "0.5.9")
            self.assertEqual((root / "manifest.json").read_text(), original)

    def test_symlinked_vendor_directory_cannot_escape_install_root(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "extension"
            elsewhere = Path(tmp) / "elsewhere"
            root.mkdir()
            elsewhere.mkdir()
            (root / "manifest.json").write_text(json.dumps({
                "name": "Claude Voice Bridge", "version": "0.5.8"
            }))
            try:
                (root / "vendor").symlink_to(elsewhere, target_is_directory=True)
            except (OSError, NotImplementedError):
                self.skipTest("Symlinks unavailable")
            data = package()
            archive = "Claude-Voice-Bridge-v0.5.9.zip"
            urls = {archive: "zip", archive + ".sha256": "checksum"}
            digest = hashlib.sha256(data).hexdigest()
            replies = {"zip": data, "checksum": digest.encode()}
            with mock.patch.object(u, "fetch_release", return_value=(archive, urls)):
                with mock.patch.object(u, "request_bytes", side_effect=lambda key, *_: replies[key]):
                    with self.assertRaisesRegex(ValueError, "Szimbolikus"):
                        u.install_release(root, "0.5.9")
            self.assertEqual(list(elsewhere.iterdir()), [])
            self.assertEqual(u.manifest_version((root / "manifest.json").read_bytes()), "0.5.8")

    def test_only_newer_version_is_written(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "extension"
            root.mkdir()
            (root / "manifest.json").write_text(json.dumps({
                "name": "Claude Voice Bridge", "version": "0.5.9"
            }))
            with mock.patch.object(u, "fetch_release", side_effect=AssertionError("no download")):
                result = u.install_release(root, "0.5.9")
            self.assertTrue(result["already_current"])


if __name__ == "__main__":
    unittest.main()
