import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface WhyTooltipProps {
    title: string;
    explanation: string;
    examples?: string[];
    scientific?: string;
}

export const WhyTooltip: React.FC<WhyTooltipProps> = ({
    title,
    explanation,
    examples,
    scientific
}) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <TouchableOpacity
                onPress={() => setShowModal(true)}
                className="ml-2">
                <View className="w-6 h-6 rounded-full bg-blue-500/20 items-center justify-center border border-blue-500/30">
                    <Ionicons name="help-circle" size={14} color="#60a5fa" />
                </View>
            </TouchableOpacity>

            <Modal
                visible={showModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowModal(false)}>
                <View className="flex-1 bg-black/80 justify-center items-center p-4">
                    <View className="bg-gray-900 rounded-2xl w-full max-w-sm border border-gray-700">
                        {/* Header */}
                        <LinearGradient
                            colors={['#3b82f6', '#1d4ed8']}
                            className="p-4 rounded-t-2xl">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="information-circle" size={24} color="white" />
                                    <Text className="text-white font-bold text-lg ml-2">
                                        ¿Por Qué?
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowModal(false)}
                                    className="w-8 h-8 items-center justify-center">
                                    <Ionicons name="close" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-blue-100 font-bold text-base mt-1">
                                {title}
                            </Text>
                        </LinearGradient>

                        {/* Content */}
                        <View className="p-4">
                            <Text className="text-white text-base leading-6 mb-4">
                                {explanation}
                            </Text>

                            {Array.isArray(examples) && examples.length > 0 && (
                                <View className="mb-4">
                                    <Text className="text-blue-400 font-bold text-sm mb-2">
                                        Ejemplos:
                                    </Text>
                                    {examples.map((example, index) => (
                                        <View key={index} className="flex-row items-start mb-2">
                                            <Text className="text-gray-400 text-sm mr-2">•</Text>
                                            <Text className="text-gray-300 text-sm flex-1">
                                                {example}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {scientific && (
                                <View className="bg-gray-800/50 p-3 rounded-lg">
                                    <Text className="text-yellow-400 font-bold text-sm mb-1">
                                        Base Científica:
                                    </Text>
                                    <Text className="text-gray-300 text-sm">
                                        {scientific}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};