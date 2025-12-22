import { Audio } from 'expo-av';

let sound: Audio.Sound | null = null;
let currentVolume = 1.0;
let fadeInterval: ReturnType<typeof setInterval> | null = null;

export const playSoundscape = async (type: 'rain' | 'white_noise' | 'waves') => {
    if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
    }

    const sounds = {
        rain: require('@/assets/sounds/rain.mp3'),
        white_noise: require('@/assets/sounds/white_noise.mp3'),
        waves: require('@/assets/sounds/waves.mp3'),
    };

    try {
        const { sound: newSound } = await Audio.Sound.createAsync(
            sounds[type],
            { shouldPlay: true, isLooping: true, volume: 1.0 }
        );
        sound = newSound;
        currentVolume = 1.0;
    } catch (e) {
        console.error('Failed to play soundscape', e);
    }
};

export const stopSoundscape = async () => {
    if (fadeInterval) clearInterval(fadeInterval);
    if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        sound = null;
    }
};

export const startFadeOut = (durationMinutes: number) => {
    if (!sound) return;

    const steps = 20; // Number of volume steps
    const stepDuration = (durationMinutes * 60 * 1000) / steps;
    const volumeStep = 1.0 / steps;

    fadeInterval = setInterval(async () => {
        if (!sound) {
            if (fadeInterval) clearInterval(fadeInterval);
            return;
        }

        currentVolume = Math.max(0, currentVolume - volumeStep);
        await sound.setVolumeAsync(currentVolume);

        if (currentVolume <= 0) {
            if (fadeInterval) clearInterval(fadeInterval);
            await stopSoundscape();
        }
    }, stepDuration);
};
