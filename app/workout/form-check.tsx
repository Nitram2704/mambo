import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { FormFeedbackCard } from '@/components/workout/FormFeedbackCard';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { analyzeExerciseForm, FormCheckResult } from '@/utils/formCheckService';
import { useFormCheckStore } from '@/store/formCheckStore';
import { supabase } from '@/lib/supabase';

export default function FormCheckScreen() {
    const router = useRouter();
    const { exerciseName, workoutId } = useLocalSearchParams<{ exerciseName: string; workoutId?: string }>();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { saveFormCheck } = useFormCheckStore();

    const [permission, requestPermission] = useCameraPermissions();
    const [isRecording, setIsRecording] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<FormCheckResult | null>(null);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <ScreenWrapper headerTitle="Form Check">
                <View className="flex-1 items-center justify-center p-6">
                    <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
                    <AccessibleText weight="bold" className="text-text text-xl mt-4 mb-2">
                        Permiso de Cámara Requerido
                    </AccessibleText>
                    <AccessibleText className="text-text-secondary text-center mb-6">
                        Necesitamos acceso a tu cámara para grabar y analizar tu técnica
                    </AccessibleText>
                    <TouchableOpacity
                        onPress={requestPermission}
                        className="px-6 py-3 rounded-xl"
                        style={{ backgroundColor: colors.primary }}
                    >
                        <AccessibleText weight="bold" className="text-white">
                            Permitir Acceso
                        </AccessibleText>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const handleStartRecording = async () => {
        if (!cameraRef.current) return;

        try {
            setIsRecording(true);
            const video = await cameraRef.current.recordAsync({
                maxDuration: 10,
            });
            if (!video) {
                Alert.alert('Error', 'No se pudo grabar el video');
                return;
            }
            setVideoUri(video.uri);
            await handleAnalyze(video.uri);
        } catch (error) {
            console.error('Error recording video:', error);
            Alert.alert('Error', 'No se pudo grabar el video');
        } finally {
            setIsRecording(false);
        }
    };

    const handleStopRecording = () => {
        if (cameraRef.current && isRecording) {
            cameraRef.current.stopRecording();
        }
    };

    const handleAnalyze = async (uri: string) => {
        setAnalyzing(true);
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const analysisResult = await analyzeExerciseForm(base64, exerciseName || 'Squat');
            setResult(analysisResult);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const fileName = `${user.id}/${Date.now()}.mp4`;
            const { error: uploadError } = await supabase.storage
                .from('workout-videos')
                .upload(fileName, {
                    uri,
                    type: 'video/mp4',
                    name: fileName,
                } as any);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('workout-videos')
                .getPublicUrl(fileName);

            await saveFormCheck({
                workout_id: workoutId,
                exercise_name: exerciseName || 'Squat',
                video_url: publicUrl,
                result: analysisResult,
            });

            Alert.alert('¡Análisis Completo!', `Puntuación: ${analysisResult.score}/100`);
        } catch (error) {
            console.error('Error analyzing video:', error);
            Alert.alert('Error', 'No se pudo analizar el video. Verifica tu API key de Gemini.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (result) {
        return (
            <ScreenWrapper headerTitle="Análisis de Técnica" scrollable>
                <View className="p-4">
                    <FormFeedbackCard result={result} />
                    <TouchableOpacity
                        onPress={() => {
                            setResult(null);
                            setVideoUri(null);
                        }}
                        className="mt-4 p-4 rounded-xl items-center"
                        style={{ backgroundColor: colors.primary }}
                    >
                        <AccessibleText weight="bold" className="text-white">
                            Grabar Otro Video
                        </AccessibleText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-2 p-4 rounded-xl items-center border border-border"
                    >
                        <AccessibleText weight="bold" className="text-text">
                            Volver al Workout
                        </AccessibleText>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    if (analyzing) {
        return (
            <ScreenWrapper headerTitle="Form Check">
                <View className="flex-1 items-center justify-center p-6">
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AccessibleText weight="bold" className="text-text text-xl mt-4">
                        Analizando Técnica...
                    </AccessibleText>
                    <AccessibleText className="text-text-secondary text-center mt-2">
                        La IA está evaluando tu movimiento
                    </AccessibleText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper headerTitle={`Form Check: ${exerciseName || 'Ejercicio'}`}>
            <View className="flex-1">
                <CameraView
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    facing="back"
                >
                    <View className="flex-1 justify-between p-6">
                        <Card variant="glass" className="p-4">
                            <AccessibleText weight="bold" className="text-white text-lg mb-2">
                                Instrucciones
                            </AccessibleText>
                            <AccessibleText className="text-white/80 text-sm">
                                • Coloca tu teléfono en un lugar estable{'\n'}
                                • Asegúrate de que todo tu cuerpo sea visible{'\n'}
                                • Graba 1-3 repeticiones del ejercicio{'\n'}
                                • Máximo 10 segundos de video
                            </AccessibleText>
                        </Card>

                        <View className="items-center">
                            <TouchableOpacity
                                onPress={isRecording ? handleStopRecording : handleStartRecording}
                                className="w-20 h-20 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: isRecording ? colors.error : colors.primary,
                                }}
                            >
                                <Ionicons
                                    name={isRecording ? 'stop' : 'videocam'}
                                    size={40}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                            <AccessibleText weight="bold" className="text-white mt-2">
                                {isRecording ? 'Detener' : 'Grabar'}
                            </AccessibleText>
                        </View>
                    </View>
                </CameraView>
            </View>
        </ScreenWrapper>
    );
}