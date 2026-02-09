import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export const VoiceCoach = {
    speak: async (text: string, language: string = 'es-ES') => {
        try {
            const isSpeaking = await Speech.isSpeakingAsync();
            if (isSpeaking) {
                await Speech.stop();
            }

            Speech.speak(text, {
                language,
                pitch: 1.0,
                rate: 0.9,
                voice: Platform.OS === 'ios' ? 'com.apple.ttsbundle.siri_es-ES_compact' : undefined,
            });
        } catch (error) {
            console.error('VoiceCoach speak error:', error);
        }
    },

    stop: async () => {
        await Speech.stop();
    }
};
