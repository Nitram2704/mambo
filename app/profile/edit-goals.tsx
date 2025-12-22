import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfileStore } from '@/store/userProfileStore';

export default function EditGoalsScreen() {
    const router = useRouter();
    const { profile, updateProfile } = useUserProfileStore();

    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');

    useEffect(() => {
        if (profile) {
            setCalories(profile.calorieGoal.toString());
            setProtein(profile.proteinGoal.toString());
            setCarbs(profile.carbsGoal.toString());
            setFats(profile.fatsGoal.toString());
        }
    }, [profile]);

    const handleSave = () => {
        const cal = parseInt(calories);
        const pro = parseInt(protein);
        const car = parseInt(carbs);
        const fat = parseInt(fats);

        if (isNaN(cal) || isNaN(pro) || isNaN(car) || isNaN(fat)) {
            Alert.alert('Error', 'Por favor ingresa números válidos');
            return;
        }

        updateProfile({
            calorieGoal: cal,
            proteinGoal: pro,
            carbsGoal: car,
            fatsGoal: fat
        });

        router.back();
    };

    const handleReset = () => {
        Alert.alert(
            'Restablecer Calculados',
            '¿Quieres volver a calcular tus metas basadas en tus datos físicos?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sí, recalcular',
                    onPress: () => {
                        // Logic to recalculate would go here, or we just navigate back to onboarding/setup
                        // For now, let's just warn them this is manual override only
                        Alert.alert('Info', 'Para recalcular automáticamente, por favor actualiza tu peso u objetivo en el perfil.');
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Editar Metas</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-blue-500 font-bold">Guardar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                    <Text className="text-gray-400 mb-4 text-sm">
                        Ajusta manualmente tus objetivos diarios. Los cambios se reflejarán en el Dashboard.
                    </Text>

                    <View className="mb-4">
                        <Text className="text-white font-bold mb-2">Calorías (kcal)</Text>
                        <TextInput
                            className="bg-gray-900 text-white p-4 rounded-xl border border-gray-700 font-bold text-lg"
                            keyboardType="numeric"
                            value={calories}
                            onChangeText={setCalories}
                        />
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1 mb-4">
                            <Text className="text-white font-bold mb-2">Proteína (g)</Text>
                            <TextInput
                                className="bg-gray-900 text-white p-4 rounded-xl border border-gray-700 font-bold"
                                keyboardType="numeric"
                                value={protein}
                                onChangeText={setProtein}
                            />
                        </View>
                        <View className="flex-1 mb-4">
                            <Text className="text-white font-bold mb-2">Carbos (g)</Text>
                            <TextInput
                                className="bg-gray-900 text-white p-4 rounded-xl border border-gray-700 font-bold"
                                keyboardType="numeric"
                                value={carbs}
                                onChangeText={setCarbs}
                            />
                        </View>
                        <View className="flex-1 mb-4">
                            <Text className="text-white font-bold mb-2">Grasas (g)</Text>
                            <TextInput
                                className="bg-gray-900 text-white p-4 rounded-xl border border-gray-700 font-bold"
                                keyboardType="numeric"
                                value={fats}
                                onChangeText={setFats}
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleReset}
                    className="p-4 rounded-xl border border-gray-700 items-center active:bg-gray-800"
                >
                    <Text className="text-gray-400">Restablecer a valores calculados</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
