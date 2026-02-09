import json

def find_duplicate_keys(data, path=""):
    keys = set()
    duplicates = []
    if isinstance(data, dict):
        for key, value in data.items():
            if key in keys:
                duplicates.append(f"{path}.{key}" if path else key)
            keys.add(key)
            duplicates.extend(find_duplicate_keys(value, f"{path}.{key}" if path else key))
    elif isinstance(data, list):
        for i, item in enumerate(data):
            duplicates.extend(find_duplicate_keys(item, f"{path}[{i}]"))
    return duplicates

# This won't work with standard json.load because it overwrites duplicates.
# We need a custom decoder or just read the file and look for patterns.

def find_duplicates_manually(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    stack = []
    current_keys = set()
    duplicates = []
    
    import re
    key_pattern = re.compile(r'^\s*"([^"]+)"\s*:')
    
    for i, line in enumerate(lines):
        indent = len(line) - len(line.lstrip())
        match = key_pattern.match(line)
        if match:
            key = match.group(1)
            # This is a very simple check and might have false positives with nested structures
            # but for a flat-ish JSON like locales it might work.
            # Better: check indentation level.
            pass

find_duplicates_manually('c:/Users/marti/Visual/App fitness/mambo/locales/es.json')
