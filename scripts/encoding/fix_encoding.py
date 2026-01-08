import json
import os

def fix_json(path):
    try:
        # Try reading with utf-8-sig (handles BOM)
        with open(path, 'rb') as f:
            raw = f.read()
        
        # Try to decode and fix common PowerShell encoding issues
        # PowerShell Set-Content -Encoding UTF8 often produces UTF-8 with BOM
        # But if it's "DÃ­a", it might be that UTF-8 was interpreted as Latin-1
        content = raw.decode('utf-8-sig')
        
        # If we see "Ã­", it means it was double-encoded or interpreted wrong
        # Let's try to fix it if it looks like that
        if 'Ã­' in content or 'Â¡' in content:
            content = content.encode('latin-1').decode('utf-8')
            
        data = json.loads(content)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"Fixed {path}")
    except Exception as e:
        print(f"Error fixing {path}: {e}")

es_path = 'c:/Users/marti/Visual/App fitness/mambo/locales/es.json'
en_path = 'c:/Users/marti/Visual/App fitness/mambo/locales/en.json'

fix_json(es_path)
fix_json(en_path)
