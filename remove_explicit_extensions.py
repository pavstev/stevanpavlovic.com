import os
import re
import glob

# Base directory for the project
PROJECT_ROOT = os.getcwd()
SRC_DIR = os.path.join(PROJECT_ROOT, 'src')

# Regex to find import statements with .ts or .tsx extensions
# Group 1: The full import statement leading up to the module path.
# Group 2: The quote character (single or double).
# Group 3: The module path itself (e.g., "@components/ui/button").
# Group 4: The extension to remove (e.g., ".tsx" or ".ts").
# Group 5: The closing quote and optional semicolon.
# This regex now allows for whitespace and comments after the import path,
# and it uses non-greedy matching for the module path.
REMOVE_EXT_REGEX = re.compile(r"(import(?:[\s\w,{}\*]*from\s*)?)(['\"])([^'\"]+?)(\.tsx|\.ts|\.astro)(\2)(;?)(?=\s*//|\s*$|\s*\))")


def remove_explicit_extension_in_file(file_path: str):
    """Reads a file, removes explicit .ts/.tsx/.astro extensions from import statements, and writes back if changes are made."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content_lines = []
    changes_made = False

    for line in content.splitlines():
        match = REMOVE_EXT_REGEX.search(line) # Use search instead of match to find anywhere in line
        if match:
            pre_import_str = match.group(1)
            quote_char = match.group(2)
            module_path_without_ext = match.group(3) 
            extension_to_remove = match.group(4) 
            # Reconstruct the line without the explicit extension
            # The closing quote and optional semicolon are handled by rejoining the parts
            new_line = line[:match.start(4)] + line[match.end(4):]
            new_content_lines.append(new_line)
            if new_line != line:
                changes_made = True
        else:
            new_content_lines.append(line)
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_content_lines))
        print(f"Removed explicit extensions in: {file_path}")
    else:
        print(f"No explicit extensions to remove in: {file_path}")


def main():
    patterns = [
        os.path.join(SRC_DIR, '**', '*.astro'),
        os.path.join(SRC_DIR, '**', '*.ts'),
        os.path.join(SRC_DIR, '**', '*.tsx'),
    ]
    files_to_process = []
    for pattern in patterns:
        files_to_process.extend(glob.glob(pattern, recursive=True))

    print(f"Found {len(files_to_process)} files to process for extension removal.")
    for file_path in files_to_process:
        remove_explicit_extension_in_file(file_path)

if __name__ == "__main__":
    main()
