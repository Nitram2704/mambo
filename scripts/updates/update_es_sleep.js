const fs = require('fs');
const path = 'c:/Users/marti/Visual/App fitness/mambo/locales/es.json';
try {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    data.sleep = {
        "title": "Sueño",
        "lastNight": "Anoche",
        "lastSession": "Última sesión registrada",
        "quality": "Calidad:",
        "logSleep": "Registrar Sueño",
        "tapToStart": "Toca para comenzar",
        "average": "PROMEDIO",
        "reports": "Reportes",
        "goals": "Metas",
        "thisWeek": "Esta Semana",
        "noLogs": "Sin registros esta semana",
        "register": "Registrar",
        "cancel": "Cancelar",
        "save": "Guardar",
        "date": "Fecha",
        "times": "Horarios",
        "bedTime": "Hora de Dormir",
        "wakeTime": "Hora de Despertar",
        "duration": "Duración",
        "qualityTitle": "Calidad del Sueño",
        "qualities": {
            "1": "Muy Malo",
            "2": "Malo",
            "3": "Regular",
            "4": "Bueno",
            "5": "Excelente"
        },
        "features": "Características",
        "tags": {
            "restless": "Inquieto",
            "dreams": "Sueños",
            "interrupted": "Interrumpido",
            "refreshed": "Descansado"
        },
        "notes": "Notas (Opcional)",
        "notesPlaceholder": "¿Cómo fue tu sueño?",
        "errorDuration": "La duración del sueño no es válida"
    };
    fs.writeFileSync(path, JSON.stringify(data, null, 4), 'utf8');
    console.log('Successfully updated es.json');
} catch (e) {
    console.error('Error updating es.json:', e.message);
}
