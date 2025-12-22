import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSavedRoutinesStore } from '@/store/savedRoutinesStore';
import { exportRoutineAsText, exportRoutineAsJSON } from '@/utils/routineExport';
import * as Clipboard from 'expo-clipboard';

export default function ShareRoutineScreen() {
    const router = useRouter();
    const { routineId } = useLocalSearchParams<{ routineId: string }>();
    const { routines } = useSavedRoutinesStore();

    const routine = routines.find(r => r.id === routineId);

    if (!routine) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <Text className="text-white">Rutina no encontrada</Text>
            </SafeAreaView>
        );
    }

    const handleShareText = async () => {
        const text = exportRoutineAsText(routine);

        try {
            await Share.share({
                message: text,
                title: `Rutina: ${routine.name}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleCopyJSON = async () => {
        const json = exportRoutineAsJSON(routine);
        await Clipboard.setStringAsync(json);
        Alert.alert('✅ Copiado', 'JSON de la rutina copiado al portapapeles');
    };

    const handleCopyText = async () => {
        const text = exportRoutineAsText(routine);
        await Clipboard.setStringAsync(text);
        Alert.alert('✅ Copiado', 'Rutina copiada al portapapeles');
    };

    const textPreview = exportRoutineAsText(routine);

    return (
        <View className="flex-1 bg-gray-900">
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-white/10">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Compartir Rutina</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                    {/* Preview */}
                    <LinearGradient
                        colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
                        className="rounded-2xl p-5 mb-4 border border-white/10"
                    >
                        <Text className="text-white font-bold text-lg mb-3">Vista Previa</Text>
                        <View className="bg-gray-800/50 rounded-xl p-4 border border-white/5">
                            <Text className="text-gray-300 text-sm font-mono" selectable>
                                {textPreview}
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Share Options */}
                    <LinearGradient
                        colors={['rgba(30, 41, 59, 0.7)', 'rgba(15, 23, 42, 0.8)']}
                        className="rounded-2xl p-5 mb-4 border border-white/10"
                    >
                        <Text className="text-white font-bold text-lg mb-4">Opciones de Compartir</Text>

                        {/* Share via Share Sheet */}
                        <TouchableOpacity
                            onPress={handleShareText}
                            className="mb-3"
                        >
                            <LinearGradient
                                colors={['#3b82f6', '#2563eb']}
                                className="rounded-xl p-4 flex-row items-center"
                            >
                                <Ionicons name="share-social" size={24} color="white" />
                                <Text className="text-white font-bold text-base ml-3">
                                    Compartir como Texto
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Copy Text */}
                        <TouchableOpacity
                            onPress={handleCopyText}
                            className="mb-3"
                        >
                            <LinearGradient
                                colors={['#10b981', '#059669']}
                                className="rounded-xl p-4 flex-row items-center"
                            >
                                <Ionicons name="copy" size={24} color="white" />
                                <Text className="text-white font-bold text-base ml-3">
                                    Copiar Texto
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Copy JSON */}
                        <TouchableOpacity onPress={handleCopyJSON}>
                            <LinearGradient
                                colors={['#a855f7', '#9333ea']}
                                className="rounded-xl p-4 flex-row items-center"
                            >
                                <Ionicons name="code" size={24} color="white" />
                                <Text className="text-white font-bold text-base ml-3">
                                    Copiar JSON (Avanzado)
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Info */}
                    <LinearGradient
                        colors={['rgba(59, 130, 246, 0.15)', 'rgba(37, 99, 235, 0.1)']}
                        className="rounded-2xl p-5 border border-blue-500/30"
                    >
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="information-circle" size={20} color="#60a5fa" />
                            <Text className="text-blue-300 font-bold ml-2">Información</Text>
                        </View>
                        <Text className="text-blue-100 text-sm leading-5">
                            Comparte tu rutina con amigos o guárdala para importarla en otro dispositivo. El formato JSON es útil para respaldos.
                        </Text>
                    </LinearGradient>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
