"""Ensure local working files cannot leak into the downloadable starter ZIPs."""
import io
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

import build_starters


class PackageTests(unittest.TestCase):
    def test_package_contents_and_reproducibility(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            for package, names in build_starters.PACKAGE_FILES.items():
                for name in names:
                    target = root / package / name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(b"example\r\n")
                # Deliberately add files which must never enter a download.
                for name in [".env", "train.csv", "notes.txt", "__pycache__/app.pyc"]:
                    target = root / package / name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(b"local-only test fixture")
                with patch.object(build_starters, "STARTER", root):
                    first = build_starters.package_bytes(package)
                    self.assertEqual(first, build_starters.package_bytes(package))
                with zipfile.ZipFile(io.BytesIO(first)) as archive:
                    self.assertEqual(set(archive.namelist()), {f"{package}/{name}" for name in names})
                    for name in archive.namelist():
                        self.assertNotIn("\\", name)
                        self.assertEqual(archive.read(name), b"example\n")


if __name__ == "__main__":
    unittest.main()
