import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWaterStore } from '@/store/waterStore';

export default function WaterScreen() {
    const router = useRouter();
    const { getTodayWater, addWater, removeWater, setGoal } = useWaterStore();
    const todayWater = getTodayWater();

    const [customAmount, setCustomAmount] = useState('');
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState(todayWater.goal.toString());
    const [mode, setMode] = useState<'add' | 'remove'>('add');

    const handleCustomAction = () => {
        const amount = parseInt(customAmount);
        if (amount > 0) {
            if (mode === 'add') {
                addWater(amount);
                Alert.alert('¡Agua registrada!', `Se añadieron ${amount}ml`);
            } else {
                // For removing, we technically need a log ID to remove specific logs in the current store implementation
                // But the user wants to "subtract" amount.
                // We can implement a "negative" add or just find the last log?
                // The store has `removeWater(id)`.
                // To support "subtracting arbitrary amount", we might need to update the store or just remove recent logs that sum up to amount?
                // For simplicity/safety, let's just add a negative log if we supported it, but the store expects positive logs.
                // Let's stick to "Removing specific logs" in history for now, OR we can add a negative value if we update the store.
                // Wait, the user asked "que tambien se pueda restar".
                // If I add -250ml, it messes up the logs if they are expected to be positive.
                // Let's implement "Quick Remove" by finding the most recent log of that amount?
                // Or better: Update the store to allow "adjustment" logs.
                // For now, I will interpret "subtract" as "add a negative adjustment" if I modify the store, 
                // OR I will just show a "Remove Last" button.
                // But the user wants to input a custom amount to subtract.
                // Let's modify the store to allow negative amounts in `addWater`?
                // The `WaterLog` has `amount: number`. If I allow negative, `totalAmount` will decrease.
                // This is the easiest way.
                addWater(-amount);
                Alert.alert('Corrección', `Se restaron ${amount}ml`);
            }
            setCustomAmount('');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Hidratación</Text>
                <TouchableOpacity onPress={() => setIsEditingGoal(!isEditingGoal)}>
                    <Ionicons name="settings-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Main Progress Circle */}
                <View className="items-center justify-center py-8">
                    <View className="w-48 h-48 rounded-full border-8 border-gray-800 items-center justify-center relative">
                        <View className="absolute w-full h-full rounded-full border-8 border-blue-500 opacity-30" />
                        <Ionicons name="water" size={64} color="#3b82f6" />
                        <Text className="text-white text-3xl font-bold mt-2">{todayWater.totalAmount}ml</Text>
                        <Text className="text-gray-400">Meta: {todayWater.goal}ml</Text>
                    </View>
                </View>

                {/* Goal Editor */}
                {isEditingGoal && (
                    <View className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700">
                        <Text className="text-white font-bold mb-2">Nueva Meta Diaria (ml)</Text>
                        <View className="flex-row gap-2">
                            <TextInput
                                className="flex-1 bg-gray-700 text-white p-3 rounded-lg border border-gray-600"
                                keyboardType="number-pad"
                                value={newGoal}
                                onChangeText={setNewGoal}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    const goal = parseInt(newGoal);
                                    if (goal > 0) {
                                        setGoal(goal);
                                        setIsEditingGoal(false);
                                    }
                                }}
                                className="bg-blue-600 px-6 justify-center rounded-lg">
                                <Text className="text-white font-bold">Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Mode Toggle */}
                <View className="flex-row bg-gray-800 p-1 rounded-xl mb-6 border border-gray-700">
                    <TouchableOpacity
                        onPress={() => setMode('add')}
                        className={`flex-1 py-3 rounded-lg items-center flex-row justify-center gap-2 ${mode === 'add' ? 'bg-blue-600' : 'bg-transparent'}`}>
                        <Ionicons name="add-circle-outline" size={20} color={mode === 'add' ? 'white' : '#9ca3af'} />
                        <Text className={`font-bold ${mode === 'add' ? 'text-white' : 'text-gray-400'}`}>Añadir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setMode('remove')}
                        className={`flex-1 py-3 rounded-lg items-center flex-row justify-center gap-2 ${mode === 'remove' ? 'bg-red-600' : 'bg-transparent'}`}>
                        <Ionicons name="remove-circle-outline" size={20} color={mode === 'remove' ? 'white' : '#9ca3af'} />
                        <Text className={`font-bold ${mode === 'remove' ? 'text-white' : 'text-gray-400'}`}>Restar</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Action Grid */}
                <Text className="text-white text-lg font-bold mb-4">
                    {mode === 'add' ? 'Añadir Rápido' : 'Restar Rápido'}
                </Text>
                <View className="flex-row flex-wrap gap-3 mb-6">
                    {[250, 500, 750, 1000].map((amount) => (
                        <TouchableOpacity
                            key={amount}
                            onPress={() => {
                                const val = mode === 'add' ? amount : -amount;
                                addWater(val);
                            }}
                            className={`w-[48%] p-4 rounded-xl border items-center active:opacity-80 ${mode === 'add'
                                ? 'bg-blue-900/30 border-blue-500/30'
                                : 'bg-red-900/30 border-red-500/30'
                                }`}>
                            <Ionicons
                                name={mode === 'add' ? "water-outline" : "water"}
                                size={24}
                                color={mode === 'add' ? "#60a5fa" : "#f87171"}
                            />
                            <Text className={`font-bold mt-1 ${mode === 'add' ? 'text-blue-200' : 'text-red-200'}`}>
                                {mode === 'add' ? '+' : '-'}{amount}ml
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Custom Amount */}
                <View className="flex-row gap-2 mb-8">
                    <TextInput
                        className="flex-1 bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
                        placeholder="Cantidad personalizada (ml)"
                        placeholderTextColor="#6b7280"
                        keyboardType="number-pad"
                        value={customAmount}
                        onChangeText={setCustomAmount}
                    />
                    <TouchableOpacity
                        onPress={handleCustomAction}
                        className={`px-6 justify-center rounded-xl border active:opacity-80 ${mode === 'add'
                            ? 'bg-blue-600 border-blue-500'
                            : 'bg-red-600 border-red-500'
                            }`}>
                        <Ionicons name={mode === 'add' ? "add" : "remove"} size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* History Log */}
                <Text className="text-white text-lg font-bold mb-4">Historial de Hoy</Text>
                {todayWater.logs.length === 0 ? (
                    <Text className="text-gray-500 text-center py-4">No hay registros hoy</Text>
                ) : (
                    todayWater.logs.slice().reverse().map((log) => (
                        <View key={log.id} className="flex-row items-center justify-between bg-gray-800 p-4 rounded-xl mb-2 border border-gray-700">
                            <View className="flex-row items-center">
                                <View className={`p-2 rounded-full mr-3 ${log.amount > 0 ? 'bg-blue-500/20' : 'bg-red-500/20'}`}>
                                    <Ionicons
                                        name={log.amount > 0 ? "water" : "remove-circle"}
                                        size={16}
                                        color={log.amount > 0 ? "#60a5fa" : "#f87171"}
                                    />
                                </View>
                                <View>
                                    <Text className={`font-bold ${log.amount > 0 ? 'text-white' : 'text-red-400'}`}>
                                        {log.amount > 0 ? '+' : ''}{log.amount}ml
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => removeWater(log.id)}>
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
                <View className="h-8" />
            </ScrollView>
        </SafeAreaView>
    );
}
