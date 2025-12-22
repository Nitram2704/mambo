const fs = require('fs');

function fixEncoding(path) {
    try {
        // Read as binary to get raw bytes
        const buffer = fs.readFileSync(path);

        // Check if it has a BOM
        let start = 0;
        if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
            console.log(`${path} has UTF-8 BOM`);
            start = 3;
        } else if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
            console.log(`${path} has UTF-16 LE BOM`);
            // UTF-16 is likely what PowerShell used if it's messed up
            const content = buffer.toString('utf16le');
            fs.writeFileSync(path, content, 'utf8');
            console.log(`Converted ${path} from UTF-16 LE to UTF-8`);
            return;
        }

        // If it's corrupted like "Ã­", it's likely UTF-8 bytes interpreted as Latin-1
        // and then saved again.
        let content = buffer.toString('utf8', start);

        if (content.includes('Ã­') || content.includes('Â¡')) {
            console.log(`Found corrupted characters in ${path}, attempting binary re-decode...`);
            // Try to treat the string as latin1 bytes and decode as utf8
            content = Buffer.from(content, 'binary').toString('utf8');
        }

        // Final check: if it's still corrupted, we might need a different approach
        // But let's try to parse it as JSON to see if it's valid now
        try {
            // Remove any non-JSON characters from start
            const jsonStart = content.indexOf('{');
            if (jsonStart > 0) content = content.substring(jsonStart);

            JSON.parse(content);
            fs.writeFileSync(path, content, 'utf8');
            console.log(`Successfully fixed and saved ${path}`);
        } catch (e) {
            console.error(`JSON still invalid in ${path}: ${e.message}`);
            // If it's "Bad control character", let's try to remove them
            content = content.replace(/[\x00-\x1F\x7F-\x9F]/g, (match) => {
                if (match === '\n' || match === '\r' || match === '\t') return match;
                return '';
            });
            try {
                JSON.parse(content);
                fs.writeFileSync(path, content, 'utf8');
                console.log(`Fixed control characters and saved ${path}`);
            } catch (e2) {
                console.error(`JSON still invalid after control char fix: ${e2.message}`);
            }
        }
    } catch (e) {
        console.error(`Error in fixEncoding for ${path}: ${e.message}`);
    }
}

fixEncoding('c:/Users/marti/Visual/App fitness/mambo/locales/es.json');
fixEncoding('c:/Users/marti/Visual/App fitness/mambo/locales/en.json');
