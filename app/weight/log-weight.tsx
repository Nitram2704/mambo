import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useWeightStore } from '@/store/weightStore';

export default function LogWeightScreen() {
    const router = useRouter();
    const { logWeight } = useWeightStore();

    const [weight, setWeight] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [note, setNote] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    const handleSave = () => {
        if (!weight) {
            Alert.alert('Error', 'Por favor ingresa tu peso');
            return;
        }

        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum <= 0 || weightNum > 300) {
            Alert.alert('Error', 'Por favor ingresa un peso válido');
            return;
        }

        logWeight({
            date: date.toISOString().split('T')[0],
            weight: weightNum,
            note: note.trim() || undefined,
            photoUri: photoUri || undefined,
        });

        Alert.alert('¡Registrado!', 'Peso registrado exitosamente', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    const pickImage = async (useCamera: boolean) => {
        let result;

        if (useCamera) {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara');
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.7,
            });
        } else {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permiso denegado', 'Se necesita acceso a la galería');
                return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
            });
        }

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-gray-400 text-lg">Cancelar</Text>
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Registrar Peso</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-orange-500 text-lg font-bold">Guardar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Date Picker */}
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700 flex-row justify-between items-center">
                    <Text className="text-white font-bold">Fecha</Text>
                    <Text className="text-gray-400">{date.toLocaleDateString()}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDate(selectedDate);
                        }}
                    />
                )}

                {/* Weight Input */}
                <View className="bg-gray-800 p-6 rounded-xl mb-4 border border-gray-700 items-center">
                    <Text className="text-gray-400 mb-2">Peso Actual (kg)</Text>
                    <View className="flex-row items-end">
                        <TextInput
                            className="text-white text-5xl font-bold text-center w-32"
                            placeholder="0.0"
                            placeholderTextColor="#4b5563"
                            keyboardType="decimal-pad"
                            value={weight}
                            onChangeText={setWeight}
                            autoFocus
                        />
                        <Text className="text-gray-500 text-xl mb-2 ml-2">kg</Text>
                    </View>
                </View>

                {/* Photo Section */}
                <View className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700">
                    <Text className="text-white font-bold mb-4">Foto de Progreso (Opcional)</Text>

                    {photoUri ? (
                        <View>
                            <Image
                                source={{ uri: photoUri }}
                                className="w-full h-64 rounded-lg mb-3 bg-gray-900"
                                resizeMode="contain"
                            />
                            <TouchableOpacity
                                onPress={() => setPhotoUri(null)}
                                className="bg-red-500/20 p-3 rounded-lg border border-red-500/50">
                                <Text className="text-red-400 text-center font-bold">Eliminar Foto</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => pickImage(true)}
                                className="flex-1 bg-gray-700 p-4 rounded-lg items-center justify-center border border-gray-600 active:bg-gray-600">
                                <Ionicons name="camera" size={24} color="#fb923c" />
                                <Text className="text-gray-300 font-bold mt-2">Cámara</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => pickImage(false)}
                                className="flex-1 bg-gray-700 p-4 rounded-lg items-center justify-center border border-gray-600 active:bg-gray-600">
                                <Ionicons name="images" size={24} color="#fb923c" />
                                <Text className="text-gray-300 font-bold mt-2">Galería</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Notes */}
                <View className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700">
                    <Text className="text-white font-bold mb-2">Notas</Text>
                    <TextInput
                        className="bg-gray-700 text-white p-3 rounded-lg min-h-[100px]"
                        placeholder="¿Cómo te sientes hoy?"
                        placeholderTextColor="#6b7280"
                        multiline
                        textAlignVertical="top"
                        value={note}
                        onChangeText={setNote}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
