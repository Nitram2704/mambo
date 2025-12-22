import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform } from 'react-native';

export interface VoiceInputResult {
    uri: string;
    base64: string | null;
    duration: number;
}

export function useVoiceInput() {
    const [isRecording, setIsRecording] = useState(false);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const recordingRef = useRef<Audio.Recording | null>(null);

    async function startRecording() {
        try {
            if (permissionResponse?.status !== 'granted') {
                console.log('Requesting permission..');
                const resp = await requestPermission();
                if (resp.status !== 'granted') {
                    Alert.alert('Permiso denegado', 'Necesitamos acceso al micrófono para escucharte.');
                    return;
                }
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recordingRef.current = recording;
            setIsRecording(true);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'No se pudo iniciar la grabación.');
        }
    }

    async function stopRecording(): Promise<VoiceInputResult | null> {
        console.log('Stopping recording..');
        const recording = recordingRef.current;
        if (!recording) {
            console.error('No recording instance found');
            return null;
        }

        setIsRecording(false);
        try {
            console.log('Stopping and unloading recording...');
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            const uri = recording.getURI();
            console.log('Recording stopped and stored at', uri);

            if (!uri) {
                console.error('No URI returned from recording');
                return null;
            }

            console.log('Reading audio file as base64...');
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });
            console.log('Base64 data length:', base64.length);

            const status = await recording.getStatusAsync();
            const duration = status.durationMillis;
            console.log('Recording duration:', duration, 'ms');

            recordingRef.current = null;

            return {
                uri,
                base64,
                duration
            };

        } catch (error) {
            console.error('Error stopping recording:', error);
            recordingRef.current = null;
            return null;
        }
    }

    return {
        isRecording,
        startRecording,
        stopRecording,
        hasPermission: permissionResponse?.status === 'granted'
    };
}
