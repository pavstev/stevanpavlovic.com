import concurrent.futures
import glob
import json
import subprocess
import sys
from pathlib import Path


def optimize_file(file_path: Path) -> dict:
    """Invokes SVGO on a single file and returns a result dictionary."""
    cmd = ["pnpm", "exec", "svgo", str(file_path)]

    try:
        # We use check=True to raise an error on non-zero exit codes
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        return {"file": file_path.name, "path": str(file_path), "success": True}
    except subprocess.CalledProcessError as e:
        err = (e.stderr or e.stdout or "Unknown SVGO error").strip()
        return {
            "file": file_path.name,
            "path": str(file_path),
            "success": False,
            "error": err.splitlines()[0] if err else "Unknown SVGO error",
        }
    except Exception as e:
        return {"file": file_path.name, "path": str(file_path), "success": False, "error": str(e)}


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing glob pattern argument"}))
        sys.exit(1)

    pattern = sys.argv[1]
    # Find all matching files
    files = [Path(p) for p in glob.glob(pattern, recursive=True) if Path(p).is_file()]

    if not files:
        print(
            json.dumps(
                {
                    "summary": {"total": 0, "success": 0, "failed": 0},
                    "results": [],
                    "message": f"No SVG files found for pattern: {pattern}",
                }
            )
        )
        return

    # Using ThreadPoolExecutor for parallel SVGO runs
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = list(executor.map(optimize_file, files))

    success_count = sum(1 for r in results if r["success"])
    failed_count = len(results) - success_count

    output = {
        "summary": {"total": len(results), "success": success_count, "failed": failed_count},
        "results": results,
    }

    # Output the final JSON results
    print(json.dumps(output, indent=2))

    if failed_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
