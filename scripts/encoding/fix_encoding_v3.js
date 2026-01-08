const fs = require('fs');

const replacements = [
    { from: /Atrs/g, to: 'Atrás' },
    { from: /xito/g, to: 'Éxito' },
    { from: /Hola! Cuntanos de ti =K/g, to: '¡Hola! Cuéntanos de ti 👋' },
    { from: /Hola! Cuntanos de ti =K/g, to: '¡Hola! Cuéntanos de ti 👋' },
    { from: /ayudar/g, to: 'ayudará' },
    { from: /ayudar /g, to: 'ayudará' },
    { from: /Gnero/g, to: 'Género' },
    { from: /Gnero/g, to: 'Género' },
    { from: /Tu Perfil Fitness =/g, to: 'Tu Perfil Fitness 💪' },
    { from: /Tu Perfil Fitness =/g, to: 'Tu Perfil Fitness 💪' },
    { from: /Tu Perfil Nutricional x️/g, to: 'Tu Perfil Nutricional 🥗️' },
    { from: /Tu Perfil Nutricional x️/g, to: 'Tu Perfil Nutricional 🥗️' },
    { from: /creado! S&/g, to: 'creado! ✅' },
    { from: /creado! S&/g, to: 'creado! ✅' },
    { from: /listo! S&/g, to: 'listo! ✅' },
    { from: /listo! S&/g, to: 'listo! ✅' },
    { from: /¡Todo listo! x\}0/g, to: '¡Todo listo! 🎉' },
    { from: /¡Todo listo! x\}0/g, to: '¡Todo listo! 🎉' },
    { from: /x Analizando/g, to: '💡 Analizando' },
    { from: /x Analizando/g, to: '💡 Analizando' },
    { from: /x9️/g, to: '🏋️‍♂️' },
    { from: /x9️/g, to: '🏋️‍♂️' },
    { from: /x️/g, to: '🥗️' },
    { from: /x️/g, to: '🥗️' },
    { from: /xa/g, to: '🚀' },
    { from: /xa/g, to: '🚀' },
    { from: /NUTRICIN/g, to: 'NUTRICIÓN' },
    { from: /NUTRICIN/g, to: 'NUTRICIÓN' },
    { from: /SUEO PROFUNDO/g, to: 'SUEÑO PROFUNDO' },
    { from: /SUEO PROFUNDO/g, to: 'SUEÑO PROFUNDO' },
    { from: /altimo/g, to: 'Último' },
    { from: /altimo/g, to: 'Último' },
    { from: /x9/g, to: '👋' },
    { from: /x9/g, to: '👋' },
    { from: /R/g, to: '⚠️' },
    { from: /R /g, to: '⚠️ ' },
    { from: /DESPU0S/g, to: 'DESPUÉS' },
    { from: /DESPU0S/g, to: 'DESPUÉS' },
    { from: /TIMING PTIMO/g, to: 'TIMING ÓPTIMO' },
    { from: /TIMING PTIMO/g, to: 'TIMING ÓPTIMO' },
    {
        from: //g, to: (match) => {
        // Generic diamond replacement if we can't match specific ones
        // This is risky, but let's see
        return '';
    }}
];

function fixFile(path) {
    let content = fs.readFileSync(path, 'utf8');

    replacements.forEach(rep => {
        content = content.replace(rep.from, rep.to);
    });

    // Fix common Spanish characters that might be broken as single diamonds
    content = content.replace(//g, (match, offset) => {
        const prev = content[offset - 1];
    const next = content[offset + 1];
    // Heuristic: if it's between letters, it's likely an accented vowel or ñ
    if (prev === 'u' && next === 'n') return 'é'; // Cuéntanos
    if (prev === 'a' && next === 'n') return 'ñ'; // acompañar
    if (prev === 'i' && next === 'n') return 'ó'; // nutrición
    return ''; // Remove if unknown
});

fs.writeFileSync(path, content, 'utf8');
console.log(`Fixed ${path}`);
}

fixFile('c:/Users/marti/Visual/App fitness/mambo/locales/es.json');
fixFile('c:/Users/marti/Visual/App fitness/mambo/locales/en.json');
