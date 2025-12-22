import { Audio } from 'expo-av';

let recording: Audio.Recording | null = null;
let noiseCount = 0;
let isMonitoring = false;

export const startAudioAnalysis = async (onNoiseDetected: (count: number) => void) => {
    try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') return;

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        recording = new Audio.Recording();
        await recording.prepareToRecordAsync({
            android: {
                extension: '.m4a',
                outputFormat: Audio.AndroidOutputFormat.MPEG_4,
                audioEncoder: Audio.AndroidOutputFormat.AMR_NB,
                sampleRate: 8000,
                numberOfChannels: 1,
                bitRate: 12800,
            },
            ios: {
                extension: '.m4a',
                audioQuality: Audio.IOSAudioQuality.MIN,
                sampleRate: 8000,
                numberOfChannels: 1,
                bitRate: 12800,
                linearPCMBitDepth: 16,
                linearPCMIsBigEndian: false,
                linearPCMIsFloat: false,
            },
            web: {}
        });

        await recording.startAsync();
        isMonitoring = true;
        noiseCount = 0;

        // Monitor amplitude every 1 second
        const interval = setInterval(async () => {
            if (!isMonitoring || !recording) {
                clearInterval(interval);
                return;
            }

            const status = await recording.getStatusAsync();
            if (status.canRecord && status.metering !== undefined) {
                // Metering is usually -160 to 0 dB
                // Threshold for "noise" (snore, movement, etc.)
                if (status.metering > -20) {
                    noiseCount++;
                    onNoiseDetected(noiseCount);
                }
            }
        }, 1000);

    } catch (error) {
        console.error('Failed to start audio analysis:', error);
    }
};

export const stopAudioAnalysis = async () => {
    isMonitoring = false;
    if (recording) {
        try {
            await recording.stopAndUnloadAsync();
        } catch (e) { }
        recording = null;
    }
    return noiseCount;
};
