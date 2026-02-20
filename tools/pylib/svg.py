import concurrent.futures
import glob
import subprocess
import sys
from pathlib import Path

# ANSI Colors for "Coolness"
C_GREEN = "\033[92m"
C_RED = "\033[91m"
C_YELLOW = "\033[93m"
C_CYAN = "\033[96m"
C_END = "\033[0m"
C_BOLD = "\033[1m"


def log_success(msg):
    print(f"{C_GREEN}  ✓ {msg}{C_END}")


def log_error(msg):
    print(f"{C_RED}  ✗ {msg}{C_END}")


def log_info(msg):
    print(f"{C_CYAN}  ℹ {msg}{C_END}")


def optimize_file(file_path: Path) -> bool:
    """Invokes SVGO on a single file. Returns True on success."""
    # Ensure pnpm is available in the shell context
    cmd = ["pnpm", "exec", "svgo", str(file_path)]

    try:
        # We use check=True to raise an error on non-zero exit codes
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        log_success(f"Optimized: {file_path.name}")
        return True
    except subprocess.CalledProcessError as e:
        err = (e.stderr or e.stdout or "Unknown SVGO error").strip()
        log_error(f"Failed {file_path.name}: {err.splitlines()[0]}")
        return False
    except Exception as e:
        log_error(f"System Error {file_path.name}: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print(f'{C_BOLD}Usage:{C_END} python svg.py "<glob_pattern>"')
        sys.exit(1)

    pattern = sys.argv[1]
    # Find all matching files
    files = [Path(p) for p in glob.glob(pattern, recursive=True) if Path(p).is_file()]

    if not files:
        print(f"{C_YELLOW}⚠️  No SVG files found for pattern: {pattern}{C_END}")
        return

    log_info(f"Found {len(files)} files. Optimizing in parallel...")

    # Using ThreadPoolExecutor for parallel SVGO runs (faster I/O)
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = list(executor.map(optimize_file, files))

    success_count = sum(results)
    failed_count = len(results) - success_count

    print("-" * 40)
    if failed_count > 0:
        print(f"{C_RED}{C_BOLD}FAILURE:{C_END} {success_count} succeeded, {failed_count} failed.")
        sys.exit(1)

    print(f"{C_GREEN}{C_BOLD}SUCCESS:{C_END} All {success_count} SVGs optimized.")


if __name__ == "__main__":
    main()
