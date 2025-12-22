import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWeightStore } from '@/store/weightStore';

export default function WeightDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ weightId: string }>();
    const weightId = params.weightId;

    const { logs } = useWeightStore();
    const weightLog = logs.find(log => log.id === weightId);

    if (!weightLog) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900">
                <View className="p-4">
                    <Text className="text-white">Registro no encontrado</Text>
                </View>
            </SafeAreaView>
        );
    }

    const date = new Date(weightLog.date);
    const formattedDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Get all weight logs sorted by date
    const allWeights = [...logs].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const currentIndex = allWeights.findIndex(w => w.id === weightLog.id);
    const previousWeight = currentIndex < allWeights.length - 1 ? allWeights[currentIndex + 1] : null;
    const weightChange = previousWeight ? weightLog.weight - previousWeight.weight : 0;

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Detalle de Peso</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Main Weight Card */}
                <View className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
                    <Text className="text-gray-400 text-sm mb-2">{formattedDate}</Text>
                    <Text className="text-white text-6xl font-bold mb-2">{weightLog.weight}</Text>
                    <Text className="text-gray-400 text-xl">kg</Text>

                    {weightChange !== 0 && (
                        <View className="flex-row items-center mt-4">
                            <Ionicons
                                name={weightChange > 0 ? 'trending-up' : 'trending-down'}
                                size={20}
                                color={weightChange > 0 ? '#ef4444' : '#22c55e'}
                            />
                            <Text className={`ml-2 font-bold ${weightChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                            </Text>
                            <Text className="text-gray-400 ml-2">desde último registro</Text>
                        </View>
                    )}
                </View>

                {/* Photo Section */}
                {weightLog.photoUri && (
                    <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                        <Text className="text-white font-bold text-lg mb-3">Foto de Progreso</Text>
                        <Image
                            source={{ uri: weightLog.photoUri }}
                            style={{ width: '100%', height: 400, borderRadius: 12 }}
                            resizeMode="cover"
                        />
                    </View>
                )}

                {/* Photo Comparison */}
                {weightLog.photoUri && previousWeight?.photoUri && (
                    <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                        <Text className="text-white font-bold text-lg mb-3">Comparación</Text>
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm mb-2">Anterior</Text>
                                <Image
                                    source={{ uri: previousWeight.photoUri }}
                                    style={{ width: '100%', height: 200, borderRadius: 8 }}
                                    resizeMode="cover"
                                />
                                <Text className="text-gray-400 text-center mt-2">
                                    {previousWeight.weight} kg
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-blue-400 text-sm mb-2">Actual</Text>
                                <Image
                                    source={{ uri: weightLog.photoUri }}
                                    style={{ width: '100%', height: 200, borderRadius: 8 }}
                                    resizeMode="cover"
                                />
                                <Text className="text-white text-center mt-2 font-bold">
                                    {weightLog.weight} kg
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Notes Section */}
                {weightLog.note && (
                    <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                        <Text className="text-white font-bold text-lg mb-2">Notas</Text>
                        <Text className="text-gray-300">{weightLog.note}</Text>
                    </View>
                )}

                {/* Stats Card */}
                <View className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <Text className="text-white font-bold text-lg mb-3">Estadísticas</Text>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-400">Registros totales</Text>
                        <Text className="text-white font-bold">{allWeights.length}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-400">Peso inicial</Text>
                        <Text className="text-white font-bold">
                            {allWeights[allWeights.length - 1]?.weight} kg
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-400">Cambio total</Text>
                        <Text className={`font-bold ${weightLog.weight - allWeights[allWeights.length - 1]?.weight > 0
                            ? 'text-red-500'
                            : 'text-green-500'
                            }`}>
                            {weightLog.weight - allWeights[allWeights.length - 1]?.weight > 0 ? '+' : ''}
                            {(weightLog.weight - allWeights[allWeights.length - 1]?.weight).toFixed(1)} kg
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
