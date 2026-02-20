import os
import re
import glob

# Base directory for the project
PROJECT_ROOT = os.getcwd()
SRC_DIR = os.path.join(PROJECT_ROOT, 'src')

# Aliases from tsconfig.json - simplified for direct mapping
ALIASES = {
    "@assets/": os.path.join(SRC_DIR, "assets/"),
    "@client/": os.path.join(SRC_DIR, "client/"),
    "@components/": os.path.join(SRC_DIR, "components/"),
    "@constants": os.path.join(SRC_DIR, "constants.ts"), # Specific file
    "@server/": os.path.join(SRC_DIR, "server/"),
}

# Regex to find import statements
# Group 1: 'import ... from ' or 'import ... ' (if no 'from')
# Group 2: The quote character (single or double).
# Group 3: The module path itself (e.g., "@components/ui/button" or "./utils").
# Group 4: The closing quote and optional semicolon.
IMPORT_REGEX = re.compile(r"(import(?:[\s\w,{}\*]*from\s*)?)(['\"])([^'\"]+)(\2;?)")


def resolve_alias_path(module_path: str) -> str:
    """Resolves an aliased module path to a file system path."""
    for alias, fs_path in ALIASES.items():
        if module_path.startswith(alias.rstrip('/')): # Match alias without trailing slash
            # Handle cases where alias maps to a specific file (like @constants)
            if alias == "@constants":
                return fs_path # full path including extension
            elif alias == "@client/" and module_path == "@client":
                # Special case for @client alias pointing to index.ts
                return os.path.join(ALIASES["@client/"], "index.ts")


            # Handle aliases that map to directories
            if alias.endswith('/'):
                return os.path.join(fs_path, module_path[len(alias):])
            else: # Handle aliases like @client (if it were a dir alias)
                # This case is tricky and depends on how the alias was defined.
                # For now, assume it's either alias/ or alias directly to a file
                # If module_path is exactly the alias (e.g., "@client" if @client mapped to src/client)
                # then return the directory, otherwise return the path inside.
                return os.path.join(fs_path, module_path[len(alias):])


    # If it's a relative path starting with ./ or ../
    if module_path.startswith('./') or module_path.startswith('../'):
        # This will be resolved relative to the current file, not SRC_DIR initially
        return module_path
        
    # Fallback for paths that are neither alias nor relative but should be in SRC_DIR (e.g., 'constants')
    # This part might need more refinement depending on exact project structure
    return os.path.join(SRC_DIR, module_path)


def find_file_with_extension(base_path: str) -> str | None:
    """
    Checks if a file exists with .tsx, .ts, .astro extensions.
    Returns the extension if found, otherwise None.
    """
    # Ensure base_path is absolute for os.path.exists check
    # if not os.path.isabs(base_path):
    #     base_path = os.path.abspath(os.path.join(os.getcwd(), base_path)) # This might not be right for relative imports

    for ext in ['.tsx', '.ts', '.astro']:
        full_path = f"{base_path}{ext}"
        if os.path.exists(full_path) and os.path.isfile(full_path):
            return ext
    # Handle cases where the path might resolve to a directory and an index file is implied
    if os.path.isdir(base_path):
        for ext in ['.tsx', '.ts', '.astro']:
            full_path = os.path.join(base_path, f"index{ext}")
            if os.path.exists(full_path) and os.path.isfile(full_path):
                return f"/index{ext}" # Return extension relative to the directory for import path
    return None

def fix_imports_in_file(file_path: str):
    """Reads a file, fixes import statements, and writes back if changes are made."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content_lines = []
    changes_made = False

    for line in content.splitlines():
        match = IMPORT_REGEX.match(line)
        if match:
            pre_import_str = match.group(1)
            quote_char = match.group(2)
            module_path_raw = match.group(3)
            post_import_str = match.group(4) # Includes closing quote and optional semicolon

            if '.' in os.path.basename(module_path_raw): # Already has an extension, skip
                new_content_lines.append(line)
                continue
            
            # Special handling for explicit '@client' and '@constants' aliases
            if module_path_raw == "@client":
                new_line = f"{pre_import_str}{quote_char}{module_path_raw}.ts{quote_char}{';' if post_import_str.endswith(';') else ''}"
                new_content_lines.append(new_line)
                if new_line != line:
                    changes_made = True
                continue
            elif module_path_raw == "@constants":
                new_line = f"{pre_import_str}{quote_char}{module_path_raw}.ts{quote_char}{';' if post_import_str.endswith(';') else ''}"
                new_content_lines.append(new_line)
                if new_line != line:
                    changes_made = True
                continue

            # Resolve base path for other aliases and relative imports
            resolved_base_path = "" # File system base path to check for extensions
            if original_module_path.startswith('@'):
                # Handle aliases that end with /
                matched_alias_prefix = None
                for alias_key in ALIASES:
                    # Find the longest matching alias
                    if original_module_path.startswith(alias_key.rstrip('/')):
                        matched_alias_prefix = alias_key
                        break
                if matched_alias_prefix:
                    # Construct the file system base path
                    # ALIASES values are already absolute paths
                    resolved_base_path = original_module_path.replace(matched_alias_prefix.rstrip('/'), ALIASES[matched_alias_prefix].rstrip('/'))
                else:
                    # Fallback for unhandled aliases, assume it's directly under src/ if alias not matched
                    resolved_base_path = os.path.join(SRC_DIR, original_module_path.lstrip('@').replace('/', os.sep))
            elif module_path_raw.startswith('./') or module_path_raw.startswith('../'):
                # For relative imports, calculate absolute path relative to the current file
                resolved_base_path = os.path.abspath(os.path.join(os.path.dirname(file_path), module_path_raw))
            else: # npm package or other non-local import, do not touch
                new_content_lines.append(line)
                continue
            
            ext = find_file_with_extension(resolved_base_path)

            if ext:
                # Construct the new module path for the import statement
                # If it's an alias like @client/utils, the module_path_raw is @client/utils
                # We append .ts to that.
                if module_path_raw == "@client": # Special case handling for @client alias if it's meant to be index.ts
                    new_module_path = f"{module_path_raw}{ext}" if not ext.startswith('/') else f"{module_path_raw}/index{ext}"
                elif ext.startswith('/'): # This means it found index.tsx/ts/astro inside a directory
                     # This logic needs to be careful: if base_path was a directory, ext is /index.ext
                     # If module_path_raw was "my-dir", new_module_path should be "my-dir/index.ext"
                     # If module_path_raw was "my-dir/index", new_module_path should be "my-dir/index.ext"
                    # For now, let's just append the ext if it's not a directory and we don't have index
                    new_module_path = f"{module_path_raw}{ext}"
                else:
                    new_module_path = f"{module_path_raw}{ext}"

                new_line = f"{pre_import_str}{quote_char}{new_module_path}{post_import_str}"
                
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
