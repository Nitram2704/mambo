const fs = require('fs');

function fixFile(path) {
    let content = fs.readFileSync(path, 'utf8');

    // Replace the diamond character \uFFFD and common corrupted sequences
    content = content.replace(/\uFFFD/g, (match, offset) => {
        const prev = content[offset - 1];
        const next = content[offset + 1];

        // Context-aware replacement
        if (prev === 'u' && next === 'n') return 'é'; // Cuéntanos
        if (prev === 'a' && next === 'n') return 'ñ'; // acompañar
        if (prev === 'i' && next === 'n') return 'ó'; // nutrición
        if (prev === 'G' && next === 'n') return 'é'; // Género
        if (prev === 'x' && next === 'i') return 'É'; // Éxito
        if (prev === 'r' && next === 's') return 'á'; // Atrás
        if (prev === ' ' && next === 'H') return '¡'; // ¡Hola
        if (prev === ' ' && next === 'C') return '¿'; // ¿Cómo
        if (prev === 'a' && next === 'r') return 'á'; // ayudará
        if (prev === 'S' && next === 'U') return 'E'; // DESPUÉS (partial)

        return ''; // Default: remove it
    });

    // Specific string replacements for known corrupted patterns
    const patterns = [
        { from: 'Hola! Cuntanos de ti =K', to: '¡Hola! Cuéntanos de ti 👋' },
        { from: 'Tu Perfil Fitness =', to: 'Tu Perfil Fitness 💪' },
        { from: 'Tu Perfil Nutricional x️', to: 'Tu Perfil Nutricional 🥗️' },
        { from: 'creado! S&', to: 'creado! ✅' },
        { from: 'listo! S&', to: 'listo! ✅' },
        { from: '¡Todo listo! x}0', to: '¡Todo listo! 🎉' },
        { from: 'x Analizando', to: '💡 Analizando' },
        { from: 'x9️', to: '🏋️‍♂️' },
        { from: 'x️', to: '🥗️' },
        { from: 'xa', to: '🚀' },
        { from: 'NUTRICIN', to: 'NUTRICIÓN' },
        { from: 'SUEO PROFUNDO', to: 'SUEÑO PROFUNDO' },
        { from: 'altimo', to: 'Último' },
        { from: 'x9', to: '👋' },
        { from: 'DESPU0S', to: 'DESPUÉS' },
        { from: 'TIMING PTIMO', to: 'TIMING ÓPTIMO' }
    ];

    patterns.forEach(p => {
        content = content.split(p.from).join(p.to);
    });

    fs.writeFileSync(path, content, 'utf8');
    console.log(`Fixed ${path}`);
}

fixFile('c:/Users/marti/Visual/App fitness/mambo/locales/es.json');
fixFile('c:/Users/marti/Visual/App fitness/mambo/locales/en.json');
