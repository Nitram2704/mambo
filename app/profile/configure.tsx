import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserProfileStore, Gender, ActivityLevel, Objective, GoalVelocity } from '@/store/userProfileStore';
import {
    calculateBMR,
    calculateTDEE,
    calculateCalorieGoal,
    calculateMacros,
    getActivityLevelDisplayName,
    getActivityLevelDescription,
    getObjectiveDisplayName,
    getObjectiveDescription,
} from '@/utils/nutrition';

export default function ConfigureProfileScreen() {
    const router = useRouter();
    const { profile, setProfile } = useUserProfileStore();

    // Initialize with existing profile or defaults
    const [age, setAge] = useState(profile?.age.toString() || '26');
    const [gender, setGender] = useState<Gender>(profile?.gender || 'male');
    const [height, setHeight] = useState(profile?.height.toString() || '175');
    const [weight, setWeight] = useState(profile?.weight.toString() || '70');
    const [targetWeight, setTargetWeight] = useState(profile?.targetWeight?.toString() || '');
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile?.activityLevel || 'moderate');
    const [objective, setObjective] = useState<Objective>(profile?.objective || 'maintenance');
    const [goalVelocity, setGoalVelocity] = useState<GoalVelocity>(profile?.goalVelocity || 'moderate');

    // BMI Calculation
    const heightNum = parseFloat(height) || 0;
    const weightNum = parseFloat(weight) || 0;
    const bmi = heightNum > 0 ? weightNum / Math.pow(heightNum / 100, 2) : 0;

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-400' };
        if (bmi < 25) return { label: 'Peso normal', color: 'text-green-400' };
        if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-400' };
        return { label: 'Obesidad', color: 'text-red-400' };
    };

    const bmiCategory = getBMICategory(bmi);
    const minNormalWeight = 18.5 * Math.pow(heightNum / 100, 2);
    const maxNormalWeight = 24.9 * Math.pow(heightNum / 100, 2);

    const handleCalculate = () => {
        const ageNum = parseInt(age);
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        const targetWeightNum = parseFloat(targetWeight) || weightNum;

        if (!ageNum || !heightNum || !weightNum) {
            alert('Por favor, completa todos los campos');
            return;
        }

        // Calculate nutritional data
        const bmr = calculateBMR(weightNum, heightNum, ageNum, gender);
        const tdee = calculateTDEE(bmr, activityLevel);

        // Adjust calorie goal based on velocity
        let velocityMultiplier = 0;
        if (objective === 'weight_loss' || objective === 'aggressive_cut') {
            switch (goalVelocity) {
                case 'slow': velocityMultiplier = -0.10; break; // -10%
                case 'moderate': velocityMultiplier = -0.20; break; // -20%
                case 'fast': velocityMultiplier = -0.25; break; // -25%
            }
        } else if (objective === 'bulking' || objective === 'lean_bulk') {
            switch (goalVelocity) {
                case 'slow': velocityMultiplier = 0.05; break; // +5%
                case 'moderate': velocityMultiplier = 0.10; break; // +10%
                case 'fast': velocityMultiplier = 0.15; break; // +15%
            }
        }

        const baseCalorieGoal = calculateCalorieGoal(tdee, objective);
        // If we have a specific velocity adjustment, apply it to TDEE instead of using standard objective multiplier
        const calorieGoal = velocityMultiplier !== 0
            ? Math.round(tdee * (1 + velocityMultiplier))
            : baseCalorieGoal;

        const macros = calculateMacros(calorieGoal, weightNum, objective);

        // Save profile
        setProfile({
            age: ageNum,
            gender,
            height: heightNum,
            weight: weightNum,
            targetWeight: targetWeightNum,
            activityLevel,
            objective,
            goalVelocity,
            bmr,
            tdee,
            calorieGoal,
            proteinGoal: macros.protein,
            carbsGoal: macros.carbs,
            fatsGoal: macros.fats,
        });

        alert(`Plan Nutricional Calculado!\n${calorieGoal} calorías diarias`);
        router.back();
    };

    const activityLevels: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active'];
    const objectives: Objective[] = ['weight_loss', 'maintenance', 'lean_bulk', 'bulking', 'aggressive_cut'];

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View className="flex-1 ml-4">
                    <Text className="text-white text-xl font-bold">Configurar Perfil</Text>
                    <Text className="text-gray-400 text-sm">Personaliza tu plan nutricional</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Datos Básicos */}
                <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                    <Text className="text-white text-lg font-bold mb-4">Datos Básicos</Text>

                    {/* Edad */}
                    <View className="mb-4">
                        <Text className="text-gray-400 text-sm mb-2">Edad *</Text>
                        <TextInput
                            className="bg-gray-700 text-white p-3 rounded-lg text-lg border border-gray-600"
                            placeholder="26"
                            placeholderTextColor="#6b7280"
                            keyboardType="number-pad"
                            value={age}
                            onChangeText={setAge}
                        />
                    </View>

                    {/* Género */}
                    <View className="mb-4">
                        <Text className="text-gray-400 text-sm mb-2">Género</Text>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setGender('male')}
                                className={`flex-1 p-3 rounded-lg ${gender === 'male' ? 'bg-orange-500' : 'bg-gray-700'
                                    }`}>
                                <Text className="text-white text-center font-bold">Masculino</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setGender('female')}
                                className={`flex-1 p-3 rounded-lg ${gender === 'female' ? 'bg-orange-500' : 'bg-gray-700'
                                    }`}>
                                <Text className="text-white text-center font-bold">Femenino</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Altura, Peso y Peso Objetivo */}
                    <View className="mb-4">
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm mb-2">Altura (cm) *</Text>
                                <TextInput
                                    className="bg-gray-700 text-white p-3 rounded-lg text-lg border border-gray-600"
                                    placeholder="175.00"
                                    placeholderTextColor="#6b7280"
                                    keyboardType="decimal-pad"
                                    value={height}
                                    onChangeText={setHeight}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-sm mb-2">Peso (kg) *</Text>
                                <TextInput
                                    className="bg-gray-700 text-white p-3 rounded-lg text-lg border border-gray-600"
                                    placeholder="70.00"
                                    placeholderTextColor="#6b7280"
                                    keyboardType="decimal-pad"
                                    value={weight}
                                    onChangeText={setWeight}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-gray-400 text-sm mb-2">Peso Objetivo (kg)</Text>
                            <TextInput
                                className="bg-gray-700 text-white p-3 rounded-lg text-lg border border-gray-600"
                                placeholder="65.00"
                                placeholderTextColor="#6b7280"
                                keyboardType="decimal-pad"
                                value={targetWeight}
                                onChangeText={setTargetWeight}
                            />
                        </View>
                    </View>

                    {/* BMI Info */}
                    {heightNum > 0 && weightNum > 0 && (
                        <View className="bg-gray-700/50 p-3 rounded-lg mb-4 border border-gray-600 border-dashed">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-gray-300 text-sm">IMC: <Text className="font-bold">{bmi.toFixed(1)}</Text></Text>
                                <Text className={`text-sm font-bold ${bmiCategory.color}`}>{bmiCategory.label}</Text>
                            </View>
                            <Text className="text-gray-400 text-xs">
                                Peso normal sugerido: {Math.round(minNormalWeight)}-{Math.round(maxNormalWeight)} kg
                            </Text>
                        </View>
                    )}
                </View>

                {/* Nivel de Actividad */}
                <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                    <Text className="text-white text-lg font-bold mb-4">Nivel de Actividad</Text>
                    {activityLevels.map((level) => (
                        <TouchableOpacity
                            key={level}
                            onPress={() => setActivityLevel(level)}
                            className={`p-4 rounded-lg mb-2 border ${activityLevel === level
                                ? 'bg-orange-500/20 border-orange-500'
                                : 'bg-gray-700 border-gray-600'
                                }`}>
                            <Text className={`font-bold mb-1 ${activityLevel === level ? 'text-orange-400' : 'text-white'}`}>
                                {getActivityLevelDisplayName(level)}
                            </Text>
                            <Text className="text-gray-400 text-xs">
                                {getActivityLevelDescription(level)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Objetivo */}
                <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                    <Text className="text-white text-lg font-bold mb-4">Objetivo</Text>
                    {objectives.map((obj) => (
                        <TouchableOpacity
                            key={obj}
                            onPress={() => setObjective(obj)}
                            className={`p-4 rounded-lg mb-2 border ${objective === obj
                                ? 'bg-green-500/20 border-green-500'
                                : 'bg-gray-700 border-gray-600'
                                }`}>
                            <Text className={`font-bold mb-1 ${objective === obj ? 'text-green-400' : 'text-white'}`}>
                                {getObjectiveDisplayName(obj)}
                            </Text>
                            <Text className="text-gray-400 text-xs">
                                {getObjectiveDescription(obj)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Velocidad del Objetivo */}
                <View className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                    <Text className="text-white text-lg font-bold mb-4">Velocidad</Text>
                    <View className="gap-3">
                        {[
                            { id: 'fast', label: 'Acelerado', desc: 'Mayor cambio, más difícil' },
                            { id: 'moderate', label: 'Moderado', desc: 'Balanceado y sostenible' },
                            { id: 'slow', label: 'Lento', desc: 'Cambios graduales, fácil de mantener' }
                        ].map((v) => (
                            <TouchableOpacity
                                key={v.id}
                                onPress={() => setGoalVelocity(v.id as GoalVelocity)}
                                className={`flex-row items-center p-3 rounded-lg border ${goalVelocity === v.id
                                    ? 'bg-blue-500/20 border-blue-500'
                                    : 'bg-gray-700/50 border-gray-600'
                                    }`}
                            >
                                <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${goalVelocity === v.id ? 'border-blue-400' : 'border-gray-400'
                                    }`}>
                                    {goalVelocity === v.id && <View className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                                </View>
                                <View>
                                    <Text className={`font-bold ${goalVelocity === v.id ? 'text-blue-400' : 'text-gray-300'}`}>
                                        {v.label}
                                    </Text>
                                    <Text className="text-gray-400 text-xs">{v.desc}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Calcular Button */}
                <TouchableOpacity
                    onPress={handleCalculate}
                    className="bg-orange-500 p-4 rounded-xl active:bg-orange-600 mb-8">
                    <Text className="text-white text-center font-bold text-lg">
                        Calcular Plan Nutricional
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
