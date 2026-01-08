const fs = require('fs');

function fixJson(path) {
    try {
        let content = fs.readFileSync(path, 'utf8');
        console.log(`Read ${path}, length: ${content.length}`);

        // Remove BOM and any other non-JSON characters from the start
        content = content.replace(/^[^{\[]+/, '');

        // Check for common corrupted patterns
        if (content.includes('Ã­') || content.includes('Â¡') || content.includes('Ã©') || content.includes('Ã³')) {
            console.log(`Found corrupted characters in ${path}, attempting fix...`);
            // This fix assumes the file was saved as UTF-8 but the bytes were interpreted as Latin-1
            content = Buffer.from(content, 'binary').toString('utf8');
            // Re-clean after fix
            content = content.replace(/^[^{\[]+/, '');
        }

        content = content.trim();

        const data = JSON.parse(content);
        fs.writeFileSync(path, JSON.stringify(data, null, 4), 'utf8');
        console.log(`Successfully fixed and saved ${path}`);
    } catch (e) {
        console.error(`Error fixing ${path}: ${e.message}`);
        try {
            const partial = fs.readFileSync(path, 'utf8').substring(0, 100);
            console.error(`Start of file (raw): ${partial}`);
        } catch (e2) { }
    }
}

fixJson('c:/Users/marti/Visual/App fitness/mambo/locales/es.json');
fixJson('c:/Users/marti/Visual/App fitness/mambo/locales/en.json');
