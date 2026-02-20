import glob
import subprocess
import sys
from pathlib import Path


def optimize(file_path: Path) -> bool:
    """Runs SVGO via pnpm."""
    cmd = ["pnpm", "exec", "svgo", str(file_path)]

    try:
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            error_detail = res.stderr or res.stdout or "Unknown SVGO error"
            print(f"  ✗ Failed {file_path}: {error_detail.strip()}")
            return False

        print(f"  ✓ Optimized: {file_path}")
        return True
    except Exception as e:
        print(f"  ✗ System Error optimizing {file_path}: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python -m tools.pylib.cmd.svg <glob_pattern>")
        sys.exit(1)

    pattern = sys.argv[1]
    files = [Path(p) for p in glob.glob(pattern, recursive=True) if Path(p).is_file()]

    if not files:
        print(f"⚠️  No SVG files matched pattern: {pattern}")
        return

    processed_count = 0
    failed_count = 0

    for f in files:
        if optimize(f):
            processed_count += 1
        else:
            failed_count += 1

    if failed_count > 0:
        print(f"\n❌ Finished with errors. Optimized: {processed_count}, Failed: {failed_count}")
        sys.exit(1)

    print(f"✅ Successfully optimized {processed_count} files.")


if __name__ == "__main__":
    main()
