
import os
import re
import glob

# Base directory for the project
PROJECT_ROOT = os.getcwd()
SRC_DIR = os.path.join(PROJECT_ROOT, 'src')

# Aliases from tsconfig.json - simplified for direct mapping
# Note: ALIASES are designed to map alias prefixes to their corresponding file system paths.
# The trailing slash in alias keys (e.g., "@components/") is crucial for directory mapping.
ALIASES = {
    "@assets/": os.path.join(SRC_DIR, "assets/"),
    "@client/": os.path.join(SRC_DIR, "client/"),
    "@components/": os.path.join(SRC_DIR, "components/"),
    "@server/": os.path.join(SRC_DIR, "server/"),
    # Specific file aliases (without trailing slash) should be handled carefully
    # For instance, "@constants" maps to a specific file src/constants.ts
    # If the alias is for a specific file, its fs_path_target should be the full path.
    "@constants": os.path.join(SRC_DIR, "constants.ts"),
    # The "@client" alias from tsconfig is "@client": ["./src/client/index.ts"]
    # We will treat this as a specific file alias as well
    "@client": os.path.join(SRC_DIR, "client", "index.ts"),
}


# Regex to find import statements
# Group 1: 'import ... from ' part
# Group 2: The quote character (single or double)
# Group 3: The module path itself (e.g., "@components/ui/button" or "./utils")
# Group 4: The closing quote and optional semicolon
IMPORT_REGEX = re.compile(r"(import(?:[\s\w,{}\*]*from\s*)?)(['\"])([^'\"]+)(\2;?)")


def resolve_alias_to_fs_path(module_path: str) -> str | None:
    """
    Resolves an aliased module path to a its potential file system base path (without extension).
    Returns None if it's likely an npm package or unresolvable local path.
    """
    if module_path.startswith('./') or module_path.startswith('../'):
        # Relative paths will be resolved later relative to the current file
        return module_path
    
    if module_path.startswith('@'):
        # Prioritize longest match for aliases
        best_match_alias = None
        for alias_key in ALIASES:
            if module_path.startswith(alias_key):
                if best_match_alias is None or len(alias_key) > len(best_match_alias):
                    best_match_alias = alias_key
        
        if best_match_alias:
            fs_path_target = ALIASES[best_match_alias]
            if best_match_alias.endswith('/'):
                # Alias for a directory, append the rest of the module path
                return os.path.join(fs_path_target, module_path[len(best_match_alias):])
            else:
                # Alias for a specific file (e.g., @constants, @client)
                # The fs_path_target already contains the full path including extension
                # We need to return the base path without the extension for find_file_with_extension
                return fs_path_target.rsplit('.', 1)[0] if '.' in fs_path_target else fs_path_target
    
    # If it's not an alias or relative, assume it's an npm package or unresolvable
    return None


def find_file_with_extension(base_path: str, current_file_dir: str) -> str | None:
    """
    Checks if a file exists with .tsx, .ts, .astro extensions.
    Returns the extension (e.g., ".tsx") if found, or "/index.ext" if it's a directory with an index file,
    otherwise None.
    """
    # For relative paths (starting with . or ..)
    if base_path.startswith('./') or base_path.startswith('../'):
        # Convert to an absolute path for os.path.exists checks
        abs_base_path = os.path.abspath(os.path.join(current_file_dir, base_path))
    else:
        abs_base_path = base_path # Assume it's already an absolute path from alias resolution

    # Try with direct extensions first
    for ext in ['.tsx', '.ts', '.astro']:
        full_path = f"{abs_base_path}{ext}"
        if os.path.exists(full_path) and os.path.isfile(full_path):
            return ext
    # Handle cases where the path might resolve to a directory and an index file is implied
    if os.path.isdir(abs_base_path):
        for ext in ['.tsx', '.ts', '.astro']:
            full_path = os.path.join(abs_base_path, f"index{ext}")
            if os.path.exists(full_path) and os.path.isfile(full_path):
                return f"/index{ext}" # Return as /index.ext for appending to module path
    return None

def fix_imports_in_file(file_path: str):
    """Reads a file, fixes import statements, and writes back if changes are made."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content_lines = []
    changes_made = False
    current_file_dir = os.path.dirname(file_path)

    for line in content.splitlines():
        match = IMPORT_REGEX.match(line)
        if match:
            pre_import_str = match.group(1)
            quote_char = match.group(2)
            module_path_raw = match.group(3)
            post_import_str_suffix = match.group(4) # Closing quote and optional semicolon

            # Skip if module path already has an extension
            if '.' in os.path.basename(module_path_raw):
                new_content_lines.append(line)
                continue
            
            resolved_fs_base_path_potential = resolve_alias_to_fs_path(module_path_raw)

            if resolved_fs_base_path_potential is None: # npm package or unresolvable
                new_content_lines.append(line)
                continue
            
            ext = find_file_with_extension(resolved_fs_base_path_potential, current_file_dir)

            if ext:
                # Construct the new module path for the import statement
                # If find_file_with_extension returned "/index.ext", we need to append it correctly
                new_module_path = f"{module_path_raw}{ext}"
                
                new_line = f"{pre_import_str}{quote_char}{new_module_path}{post_import_str_suffix}"
                
                new_content_lines.append(new_line)
                if new_line != line:
                    changes_made = True
            else: # No matching file with extension found, keep original line
                new_content_lines.append(line)
        else:
            new_content_lines.append(line)
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_content_lines))
        print(f"Fixed imports in: {file_path}")
    else:
        print(f"No changes needed for: {file_path}")


def main():
    patterns = [
        os.path.join(SRC_DIR, '**', '*.astro'),
        os.path.join(SRC_DIR, '**', '*.ts'),
        os.path.join(SRC_DIR, '**', '*.tsx'),
    ]
    files_to_process = []
    for pattern in patterns:
        files_to_process.extend(glob.glob(pattern, recursive=True))

    print(f"Found {len(files_to_process)} files to process.")
    for file_path in files_to_process:
        fix_imports_in_file(file_path)

if __name__ == "__main__":
    main()
