"""Run every available L3 engineering lab test suite in an isolated process."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory


PROJECT_ROOT = Path(__file__).resolve().parent.parent
MANIFEST = PROJECT_ROOT / "design-system" / "engineering-labs.json"


def main() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    available = [lab for lab in manifest["labs"] if lab["status"] == "available"]
    with TemporaryDirectory(prefix="l3-engineering-tests-") as temporary:
        isolation_root = Path(temporary)
        for lab in available:
            print(f"\n=== {lab['stage']} · {lab['title']} · isolated copy ===", flush=True)
            source = PROJECT_ROOT / lab["directory"]
            isolated = isolation_root / source.name
            shutil.copytree(source, isolated)
            test_relative = Path(lab["tests"]).relative_to(Path(lab["directory"]))
            command = [
                sys.executable,
                "-m",
                "unittest",
                "discover",
                "-s",
                str(isolated / test_relative),
                "-t",
                str(isolated),
                "-v",
            ]
            completed = subprocess.run(command, cwd=isolated, check=False)
            if completed.returncode:
                return completed.returncode
    print(f"\nL3 工程案例回归通过: {len(available)} 个独立案例副本。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
