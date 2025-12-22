import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useShoppingListStore, ShoppingItem } from '@/store/shoppingListStore';

export default function ShoppingListScreen() {
    const router = useRouter();
    const { items, toggleItem, deleteItem, addItem, clearChecked, generateFromMealPlan, clearAll } = useShoppingListStore();
    const [newItemName, setNewItemName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Group items by category
    const groupedItems = React.useMemo(() => {
        const groups: Record<string, ShoppingItem[]> = {};

        // Define category order and labels
        const categoryOrder = ['protein', 'carbs', 'fats', 'vegetables', 'fruits', 'dairy', 'pantry', 'other'];
        const categoryLabels: Record<string, string> = {
            protein: 'Proteínas',
            carbs: 'Carbohidratos',
            fats: 'Grasas',
            vegetables: 'Verduras',
            fruits: 'Frutas',
            dairy: 'Lácteos',
            pantry: 'Despensa',
            other: 'Otros'
        };

        items.forEach(item => {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push(item);
        });

        // Convert to SectionList format
        return categoryOrder
            .filter(cat => groups[cat] && groups[cat].length > 0)
            .map(cat => ({
                title: categoryLabels[cat],
                data: groups[cat]
            }));
    }, [items]);

    const handleAddItem = () => {
        if (newItemName.trim()) {
            addItem(newItemName.trim());
            setNewItemName('');
            setIsAdding(false);
        }
    };

    const handleGenerate = () => {
        Alert.alert(
            "Generar Lista",
            "Esto agregará los ingredientes de tu plan semanal actual a la lista. ¿Continuar?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Generar",
                    onPress: () => {
                        generateFromMealPlan();
                        Alert.alert("¡Listo!", "Ingredientes agregados.");
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-900">
            <LinearGradient
                colors={['#0f172a', '#1e293b']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-white/10">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Lista de Compras</Text>
                    <TouchableOpacity onPress={handleGenerate} className="w-10 h-10 items-center justify-center">
                        <Ionicons name="flash" size={24} color="#f97316" />
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View className="flex-row px-4 py-3 gap-3">
                    <TouchableOpacity
                        onPress={() => setIsAdding(!isAdding)}
                        className="flex-1 bg-blue-600/20 border border-blue-500/30 p-3 rounded-xl flex-row items-center justify-center"
                    >
                        <Ionicons name="add" size={20} color="#60a5fa" />
                        <Text className="text-blue-400 font-bold ml-2">Agregar Item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={clearChecked}
                        className="bg-gray-800 border border-white/10 p-3 rounded-xl items-center justify-center"
                    >
                        <Ionicons name="checkmark-done" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert("Limpiar Todo", "¿Borrar toda la lista?", [
                                { text: "Cancelar", style: "cancel" },
                                { text: "Borrar", style: "destructive", onPress: clearAll }
                            ]);
                        }}
                        className="bg-gray-800 border border-white/10 p-3 rounded-xl items-center justify-center"
                    >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                {/* Add Item Input */}
                {isAdding && (
                    <View className="px-4 mb-4">
                        <View className="flex-row gap-2">
                            <TextInput
                                className="flex-1 bg-gray-800 text-white p-3 rounded-xl border border-white/10"
                                placeholder="Nombre del producto..."
                                placeholderTextColor="#6b7280"
                                value={newItemName}
                                onChangeText={setNewItemName}
                                autoFocus
                                onSubmitEditing={handleAddItem}
                            />
                            <TouchableOpacity
                                onPress={handleAddItem}
                                className="bg-blue-600 px-4 rounded-xl items-center justify-center"
                            >
                                <Ionicons name="arrow-up" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* List */}
                <SectionList
                    sections={groupedItems}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
                    stickySectionHeadersEnabled={false}
                    renderSectionHeader={({ section: { title } }) => (
                        <View className="mt-4 mb-2">
                            <Text className="text-orange-400 font-bold text-sm uppercase tracking-wider">{title}</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => toggleItem(item.id)}
                            className={`flex-row items-center p-4 mb-2 rounded-xl border ${item.checked ? 'bg-gray-800/30 border-gray-800' : 'bg-gray-800/80 border-white/5'}`}
                        >
                            <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                {item.checked && <Ionicons name="checkmark" size={14} color="white" />}
                            </View>
                            <Text className={`flex-1 text-base ${item.checked ? 'text-gray-500 line-through' : 'text-white'}`}>
                                {item.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => deleteItem(item.id)}
                                className="p-2"
                            >
                                <Ionicons name="close" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="cart-outline" size={64} color="#374151" />
                            <Text className="text-gray-500 text-lg mt-4 font-medium">Tu lista está vacía</Text>
                            <Text className="text-gray-600 text-center mt-2 px-10">
                                Agrega items manualmente o genera la lista desde tu plan semanal.
                            </Text>
                        </View>
                    )}
                />
            </SafeAreaView>
        </View>
    );
}
