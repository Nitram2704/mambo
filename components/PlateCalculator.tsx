import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlateCalculatorProps {
    initialWeight?: number;
    onClose?: () => void;
}

const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

export const PlateCalculator: React.FC<PlateCalculatorProps> = ({ initialWeight = 60, onClose }) => {
    const [targetWeight, setTargetWeight] = useState(initialWeight.toString());
    const [barWeight, setBarWeight] = useState('20');
    const [plates, setPlates] = useState<number[]>([]);
    const [remainder, setRemainder] = useState(0);

    const calculatePlates = useCallback(() => {
        const target = parseFloat(targetWeight) || 0;
        const bar = parseFloat(barWeight) || 0;

        if (target <= bar) {
            setPlates([]);
            setRemainder(0);
            return;
        }

        let weightPerSide = (target - bar) / 2;
        const calculatedPlates: number[] = [];

        AVAILABLE_PLATES.forEach(plate => {
            while (weightPerSide >= plate) {
                calculatedPlates.push(plate);
                weightPerSide -= plate;
            }
        });

        setPlates(calculatedPlates);
        setRemainder(weightPerSide * 2); // Total remainder (both sides)
    }, [targetWeight, barWeight]);

    useEffect(() => {
        calculatePlates();
    }, [calculatePlates]);

    const getPlateColor = (weight: number) => {
        switch (weight) {
            case 25: return 'bg-red-600';
            case 20: return 'bg-blue-600';
            case 15: return 'bg-yellow-500';
            case 10: return 'bg-green-600';
            case 5: return 'bg-white';
            case 2.5: return 'bg-black';
            case 1.25: return 'bg-gray-400';
            default: return 'bg-gray-600';
        }
    };

    const getPlateHeight = (weight: number) => {
        // Scale height based on weight for visual representation
        const max = 25;
        const min = 1.25;
        const scale = (weight - min) / (max - min);
        return 40 + (scale * 60); // 40px to 100px
    };

    return (
        <View className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-lg font-bold">Calculadora de Platos</Text>
                {onClose && (
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>

            <View className="flex-row gap-4 mb-6">
                <View className="flex-1">
                    <Text className="text-gray-400 text-xs mb-1">Peso Total (kg)</Text>
                    <TextInput
                        className="bg-gray-900 text-white p-3 rounded-lg border border-gray-700 font-bold text-lg"
                        keyboardType="numeric"
                        value={targetWeight}
                        onChangeText={setTargetWeight}
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-400 text-xs mb-1">Tipo de Barra</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {[20, 15, 10].map((w) => (
                            <TouchableOpacity
                                key={w}
                                onPress={() => setBarWeight(w.toString())}
                                className={`px-2 py-1 rounded ${barWeight === w.toString() ? 'bg-blue-600' : 'bg-gray-700'}`}
                            >
                                <Text className="text-white text-xs font-bold">{w}kg</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Visual Representation */}
            <View className="h-32 flex-row items-center justify-center mb-6 relative">
                {/* Bar */}
                <View className="absolute w-full h-4 bg-gray-400 rounded-full z-0" />

                {/* Center Marker */}
                <View className="absolute w-2 h-32 bg-gray-500/50 z-0" />

                {/* Plates Right Side (Visual only shows one side for simplicity or mirrored) */}
                <View className="flex-row items-center gap-1 ml-8 z-10">
                    {plates.map((plate, index) => (
                        <View
                            key={index}
                            className={`w-4 rounded-sm border border-gray-900/50 ${getPlateColor(plate)}`}
                            style={{ height: getPlateHeight(plate) }}
                        >
                            <Text className="text-[8px] text-center font-bold text-white/80 -rotate-90 w-20 absolute top-1/2 -left-8">
                                {plate}
                            </Text>
                        </View>
                    ))}
                    {/* Collar */}
                    <View className="w-6 h-10 bg-gray-300 rounded-sm border border-gray-500 ml-1" />
                </View>
            </View>

            {/* Text Summary */}
            <View className="bg-gray-900 p-4 rounded-lg">
                <Text className="text-gray-400 text-xs mb-2 text-center">POR LADO</Text>
                <View className="flex-row flex-wrap justify-center gap-2">
                    {plates.length === 0 ? (
                        <Text className="text-gray-500 italic">Barra vacía</Text>
                    ) : (
                        plates.map((plate, index) => (
                            <View key={index} className="flex-row items-center bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                <View className={`w-2 h-2 rounded-full mr-2 ${getPlateColor(plate)}`} />
                                <Text className="text-white font-bold">{plate} kg</Text>
                            </View>
                        ))
                    )}
                </View>
                {remainder > 0 && (
                    <Text className="text-red-400 text-xs text-center mt-2">
                        Faltan {remainder.toFixed(2)} kg para llegar al peso exacto
                    </Text>
                )}
            </View>
        </View>
    );
};
