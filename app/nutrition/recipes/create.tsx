import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRecipesStore, Recipe } from '@/store/recipesStore';
import { generateRecipe } from '@/utils/aiService';

export default function CreateRecipeScreen() {
    const router = useRouter();
    const { addRecipe } = useRecipesStore();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'manual' | 'ai'>('manual');

    // Form State
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [prepTime, setPrepTime] = useState('');
    const [ingredients, setIngredients] = useState<{ name: string, amount: string }[]>([{ name: '', amount: '' }]);
    const [instructions, setInstructions] = useState<string[]>(['']);

    // AI Prompt State
    const [aiPrompt, setAiPrompt] = useState('');

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: '', amount: '' }]);
    };

    const handleAddInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const handleSave = () => {
        if (!name || !calories) {
            Alert.alert("Error", "Por favor completa al menos el nombre y las calorías.");
            return;
        }

        const newRecipe: Omit<Recipe, 'id' | 'createdAt'> = {
            name,
            calories: parseInt(calories) || 0,
            protein: parseFloat(protein) || 0,
            carbs: parseFloat(carbs) || 0,
            fats: parseFloat(fats) || 0,
            prepTime: parseInt(prepTime) || 15,
            servings: 1,
            difficulty: 'medium',
            tags: [],
            ingredients: ingredients.filter(i => i.name.trim() !== ''),
            instructions: instructions.filter(i => i.trim() !== ''),
            isAiGenerated: mode === 'ai',
        };

        addRecipe(newRecipe);
        Alert.alert("¡Éxito!", "Receta guardada correctamente.");
        router.back();
    };

    const handleGenerateAi = async () => {
        if (!aiPrompt.trim()) {
            Alert.alert("Error", "Por favor describe qué receta quieres.");
            return;
        }

        setLoading(true);
        try {
            const recipeData = await generateRecipe(aiPrompt);

            if (recipeData) {
                setName(recipeData.name);
                setCalories(recipeData.calories.toString());
                setProtein(recipeData.protein.toString());
                setCarbs(recipeData.carbs.toString());
                setFats(recipeData.fats.toString());
                setPrepTime(recipeData.prepTime.toString());
                setIngredients(recipeData.ingredients);
                setInstructions(recipeData.instructions);
                setMode('manual'); // Switch to manual to review/edit
                Alert.alert("¡Generado!", "Revisa la receta y guárdala si te gusta.");
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo generar la receta. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-900">
            <SafeAreaView className="flex-1">
                <View className="flex-row items-center justify-between p-4 border-b border-white/10">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Nueva Receta</Text>
                    <TouchableOpacity onPress={handleSave} className="w-10 h-10 items-center justify-center">
                        <Ionicons name="checkmark" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                </View>

                {/* Mode Switcher */}
                <View className="flex-row p-4 gap-4">
                    <TouchableOpacity
                        onPress={() => setMode('manual')}
                        className={`flex-1 py-3 rounded-xl items-center border ${mode === 'manual' ? 'bg-blue-600 border-blue-600' : 'bg-gray-800 border-white/10'}`}
                    >
                        <Text className={`font-bold ${mode === 'manual' ? 'text-white' : 'text-gray-400'}`}>Manual</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setMode('ai')}
                        className={`flex-1 py-3 rounded-xl items-center border ${mode === 'ai' ? 'bg-purple-600 border-purple-600' : 'bg-gray-800 border-white/10'}`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="sparkles" size={16} color={mode === 'ai' ? 'white' : '#9ca3af'} />
                            <Text className={`font-bold ml-2 ${mode === 'ai' ? 'text-white' : 'text-gray-400'}`}>Generar con IA</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4">
                    {mode === 'ai' ? (
                        <View className="mt-4">
                            <Text className="text-gray-400 mb-2">Describe tu receta ideal:</Text>
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-xl border border-white/10 h-32"
                                placeholder="Ej: Desayuno alto en proteína con huevos y avena, menos de 500 kcal..."
                                placeholderTextColor="#6b7280"
                                multiline
                                textAlignVertical="top"
                                value={aiPrompt}
                                onChangeText={setAiPrompt}
                            />
                            <TouchableOpacity
                                onPress={handleGenerateAi}
                                disabled={loading}
                                className="bg-purple-600 mt-4 py-4 rounded-xl items-center flex-row justify-center"
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="sparkles" size={20} color="white" />
                                        <Text className="text-white font-bold ml-2">Generar Receta</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="gap-4 pb-10">
                            {/* Basic Info */}
                            <View>
                                <Text className="text-gray-400 mb-1 text-xs uppercase font-bold">Nombre</Text>
                                <TextInput
                                    className="bg-gray-800 text-white p-3 rounded-xl border border-white/10"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Nombre de la receta"
                                    placeholderTextColor="#6b7280"
                                />
                            </View>

                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Text className="text-gray-400 mb-1 text-xs uppercase font-bold">Calorías</Text>
                                    <TextInput
                                        className="bg-gray-800 text-white p-3 rounded-xl border border-white/10"
                                        value={calories}
                                        onChangeText={setCalories}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 mb-1 text-xs uppercase font-bold">Tiempo (min)</Text>
                                    <TextInput
                                        className="bg-gray-800 text-white p-3 rounded-xl border border-white/10"
                                        value={prepTime}
                                        onChangeText={setPrepTime}
                                        keyboardType="numeric"
                                        placeholder="15"
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>
                            </View>

                            {/* Macros */}
                            <View className="flex-row gap-2">
                                <View className="flex-1">
                                    <Text className="text-red-400 mb-1 text-xs uppercase font-bold">Proteína</Text>
                                    <TextInput
                                        className="bg-gray-800 text-white p-3 rounded-xl border border-white/10"
                                        value={protein}
                                        onChangeText={setProtein}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-yellow-400 mb-1 text-xs uppercase font-bold">Carbs</Text>
                                    <TextInput
                                        className="bg-gray-800 text-white p-3 rounded-xl border border-white/10"
                                        value={carbs}
                                        onChangeText={setCarbs}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-blue-400 mb-1 text-xs uppercase font-bold">Grasas</Text>
                                    <TextInput
                                        className="bg-gray-800 text-white p-3 rounded-xl border border-white/10"
                                        value={fats}
                                        onChangeText={setFats}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor="#6b7280"
                                    />
                                </View>
                            </View>

                            {/* Ingredients */}
                            <View>
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-gray-400 text-xs uppercase font-bold">Ingredientes</Text>
                                    <TouchableOpacity onPress={handleAddIngredient}>
                                        <Text className="text-blue-400 font-bold text-xs">+ Agregar</Text>
                                    </TouchableOpacity>
                                </View>
                                {ingredients.map((ing, i) => (
                                    <View key={i} className="flex-row gap-2 mb-2">
                                        <TextInput
                                            className="flex-1 bg-gray-800 text-white p-3 rounded-xl border border-white/10"
                                            placeholder="Ingrediente"
                                            placeholderTextColor="#6b7280"
                                            value={ing.name}
                                            onChangeText={(text) => {
                                                const newIngs = [...ingredients];
                                                newIngs[i].name = text;
                                                setIngredients(newIngs);
                                            }}
                                        />
                                        <TextInput
                                            className="w-24 bg-gray-800 text-white p-3 rounded-xl border border-white/10"
                                            placeholder="Cant."
                                            placeholderTextColor="#6b7280"
                                            value={ing.amount}
                                            onChangeText={(text) => {
                                                const newIngs = [...ingredients];
                                                newIngs[i].amount = text;
                                                setIngredients(newIngs);
                                            }}
                                        />
                                    </View>
                                ))}
                            </View>

                            {/* Instructions */}
                            <View>
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-gray-400 text-xs uppercase font-bold">Instrucciones</Text>
                                    <TouchableOpacity onPress={handleAddInstruction}>
                                        <Text className="text-blue-400 font-bold text-xs">+ Paso</Text>
                                    </TouchableOpacity>
                                </View>
                                {instructions.map((step, i) => (
                                    <View key={i} className="flex-row gap-2 mb-2">
                                        <View className="w-8 h-8 items-center justify-center bg-gray-800 rounded-full border border-white/10 mt-1">
                                            <Text className="text-gray-400 font-bold">{i + 1}</Text>
                                        </View>
                                        <TextInput
                                            className="flex-1 bg-gray-800 text-white p-3 rounded-xl border border-white/10"
                                            placeholder={`Paso ${i + 1}`}
                                            placeholderTextColor="#6b7280"
                                            multiline
                                            value={step}
                                            onChangeText={(text) => {
                                                const newInst = [...instructions];
                                                newInst[i] = text;
                                                setInstructions(newInst);
                                            }}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
