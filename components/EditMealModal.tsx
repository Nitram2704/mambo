import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Meal } from '@/store/mealPlanStore';
import { AccessibleText } from './ui/AccessibleText';

interface EditMealModalProps {
    visible: boolean;
    meal: Meal | null;
    onSave: (updatedMeal: Meal) => void;
    onDelete: () => void;
    onClose: () => void;
}

export default function EditMealModal({ visible, meal, onSave, onDelete, onClose }: EditMealModalProps) {
    const [name, setName] = useState(meal?.name || '');
    const [calories, setCalories] = useState(meal?.calories.toString() || '');
    const [protein, setProtein] = useState(meal?.protein.toString() || '');
    const [carbs, setCarbs] = useState(meal?.carbs.toString() || '');
    const [fat, setFat] = useState(meal?.fat.toString() || '');
    const [ingredients, setIngredients] = useState(meal?.ingredients.join('\n') || '');
    const [instructions, setInstructions] = useState(meal?.instructions || '');
    const [prepTime, setPrepTime] = useState(meal?.prepTime || '');

    // Update local state when meal prop changes
    React.useEffect(() => {
        if (meal) {
            setName(meal.name);
            setCalories(meal.calories.toString());
            setProtein(meal.protein.toString());
            setCarbs(meal.carbs.toString());
            setFat(meal.fat.toString());
            setIngredients(meal.ingredients.join('\n'));
            setInstructions(meal.instructions || '');
            setPrepTime(meal.prepTime || '');
        }
    }, [meal]);

    const handleSave = () => {
        // Validación
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        const cal = parseInt(calories);
        const prot = parseFloat(protein);
        const carb = parseFloat(carbs);
        const f = parseFloat(fat);

        if (isNaN(cal) || isNaN(prot) || isNaN(carb) || isNaN(f)) {
            Alert.alert('Error', 'Valores nutricionales inválidos');
            return;
        }

        if (cal < 0 || prot < 0 || carb < 0 || f < 0) {
            Alert.alert('Error', 'Los valores no pueden ser negativos');
            return;
        }

        const updatedMeal: Meal = {
            id: meal!.id,
            type: meal!.type,
            name: name.trim(),
            calories: cal,
            protein: prot,
            carbs: carb,
            fat: f,
            ingredients: ingredients.split('\n').map(i => i.trim()).filter(i => i),
            instructions: instructions.trim() || undefined,
            prepTime: prepTime.trim() || undefined,
        };

        onSave(updatedMeal);
        onClose();
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar Comida',
            '¿Estás seguro de eliminar esta comida?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        onDelete();
                        onClose();
                    }
                }
            ]
        );
    };

    if (!meal) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-gray-950">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                    <TouchableOpacity
                        onPress={onClose}
                        accessibilityRole="button"
                        accessibilityLabel="Cerrar"
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <AccessibleText variant="h3" weight="bold" className="text-white text-lg font-bold">Editar Comida</AccessibleText>
                    <TouchableOpacity
                        onPress={handleDelete}
                        accessibilityRole="button"
                        accessibilityLabel="Eliminar comida"
                    >
                        <Ionicons name="trash" size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 p-4">
                    {/* Nombre */}
                    <View className="mb-4">
                        <AccessibleText weight="semibold" className="text-white text-sm font-semibold mb-2">Nombre</AccessibleText>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Nombre de la comida"
                            placeholderTextColor="#6b7280"
                            className="bg-gray-800 text-white px-4 py-3 rounded-xl"
                            accessibilityLabel="Nombre de la comida"
                        />
                    </View>

                    {/* Macros */}
                    <AccessibleText variant="h3" weight="bold" className="text-white text-lg font-bold mb-3">Valores Nutricionales</AccessibleText>

                    <View className="mb-4">
                        <AccessibleText weight="semibold" className="text-white text-sm font-semibold mb-2">Calorías</AccessibleText>
                        <TextInput
                            value={calories}
                            onChangeText={setCalories}
                            placeholder="0"
                            keyboardType="numeric"
                            placeholderTextColor="#6b7280"
                            className="bg-gray-800 text-white px-4 py-3 rounded-xl"
                            accessibilityLabel="Calorías"
                        />
                    </View>

                    <View className="flex-row gap-3 mb-4">
                        <View className="flex-1">
                            <AccessibleText weight="semibold" className="text-green-400 text-sm font-semibold mb-2">Proteína (g)</AccessibleText>
                            <TextInput
                                value={protein}
                                onChangeText={setProtein}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#6b7280"
                                className="bg-gray-800 text-white px-4 py-3 rounded-xl"
                                accessibilityLabel="Proteína en gramos"
                            />
                        </View>
                        <View className="flex-1">
                            <AccessibleText weight="semibold" className="text-blue-400 text-sm font-semibold mb-2">Carbos (g)</AccessibleText>
                            <TextInput
                                value={carbs}
                                onChangeText={setCarbs}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#6b7280"
                                className="bg-gray-800 text-white px-4 py-3 rounded-xl"
                                accessibilityLabel="Carbohidratos en gramos"
                            />
                        </View>
                        <View className="flex-1">
                            <AccessibleText weight="semibold" className="text-orange-400 text-sm font-semibold mb-2">Grasas (g)</AccessibleText>
                            <TextInput
                                value={fat}
                                onChangeText={setFat}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#6b7280"
                                className="bg-gray-800 text-white px-4 py-3 rounded-xl"
                                accessibilityLabel="Grasas en gramos"
                            />
                        </View>
                    </View>

                    {/* Tiempo de preparación */}
                    <View className="mb-4">
                        <AccessibleText weight="semibold" className="text-white text-sm font-semibold mb-2">Tiempo de Preparación</AccessibleText>
                        <TextInput
                            value={prepTime}
                            onChangeText={setPrepTime}
                            placeholder="ej: 15 minutos"
                            placeholderTextColor="#6b7280"
                            className="bg-gray-800 text-white px-4 py-3 rounded-xl"
                            accessibilityLabel="Tiempo de preparación"
                        />
                    </View>

                    {/* Ingredientes */}
                    <View className="mb-4">
                        <AccessibleText weight="semibold" className="text-white text-sm font-semibold mb-2">
                            Ingredientes (uno por línea)
                        </AccessibleText>
                        <TextInput
                            value={ingredients}
                            onChangeText={setIngredients}
                            placeholder="Ingrediente 1&#10;Ingrediente 2&#10;..."
                            placeholderTextColor="#6b7280"
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                            className="bg-gray-800 text-white px-4 py-3 rounded-xl"
                            accessibilityLabel="Lista de ingredientes"
                        />
                    </View>

                    {/* Instrucciones */}
                    <View className="mb-4">
                        <AccessibleText weight="semibold" className="text-white text-sm font-semibold mb-2">
                            Instrucciones (opcional)
                        </AccessibleText>
                        <TextInput
                            value={instructions}
                            onChangeText={setInstructions}
                            placeholder="Instrucciones de preparación..."
                            placeholderTextColor="#6b7280"
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            className="bg-gray-800 text-white px-4 py-3 rounded-xl"
                            accessibilityLabel="Instrucciones de preparación"
                        />
                    </View>

                    {/* Botón Guardar */}
                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-blue-500 py-4 rounded-xl mb-8"
                        accessibilityRole="button"
                        accessibilityLabel="Guardar cambios"
                    >
                        <AccessibleText weight="bold" className="text-white text-center font-bold text-lg">
                            Guardar Cambios
                        </AccessibleText>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
}
