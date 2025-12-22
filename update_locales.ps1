$assistant_es = @'
    ,
    "assistant": {
        "chat": "Chat",
        "agenda": "Agenda",
        "weeklyAgenda": "Tu Agenda Semanal",
        "agendaSubtitle": "Organiza tus entrenamientos y mantén la constancia.",
        "viewAll": "Ver Todo",
        "restDay": "Día de descanso",
        "exercises": "ejercicios",
        "welcome": "¡Hola! 👋 Veo que estás en {{goal}}. ¿En qué te ayudo hoy?",
        "listening": "Escuchando...",
        "placeholder": "Escribe un mensaje...",
        "errorVoice": "❌ Error al procesar el audio.",
        "errorVoiceMessage": "❌ Error al procesar el mensaje de voz.",
        "errorVoiceStart": "❌ Error al iniciar la grabación."
    }
}
'@

$assistant_en = @'
    ,
    "assistant": {
        "chat": "Chat",
        "agenda": "Agenda",
        "weeklyAgenda": "Your Weekly Agenda",
        "agendaSubtitle": "Organize your workouts and stay consistent.",
        "viewAll": "View All",
        "restDay": "Rest day",
        "exercises": "exercises",
        "welcome": "Hi! 👋 I see you're in {{goal}}. How can I help you today?",
        "listening": "Listening...",
        "placeholder": "Type a message...",
        "errorVoice": "❌ Error processing audio.",
        "errorVoiceMessage": "❌ Error processing voice message.",
        "errorVoiceStart": "❌ Error starting recording."
    }
}
'@

$es_path = 'c:\Users\marti\Visual\App fitness\mambo\locales\es.json'
$en_path = 'c:\Users\marti\Visual\App fitness\mambo\locales\en.json'

$es_content = Get-Content $es_path
$es_content[-1] = $assistant_es
$es_content | Set-Content $es_path -Encoding UTF8

$en_content = Get-Content $en_path
$en_content[-1] = $assistant_en
$en_content | Set-Content $en_path -Encoding UTF8
