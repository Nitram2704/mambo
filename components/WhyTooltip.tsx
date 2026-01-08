import React, { useState } from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AccessibleText } from './ui/AccessibleText';

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
                className="ml-2"
                accessibilityRole="button"
                accessibilityLabel={`¿Por qué ${title}?`}
                accessibilityHint="Muestra una explicación detallada"
            >
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
                                    <AccessibleText weight="bold" className="text-white font-bold text-lg ml-2">
                                        ¿Por Qué?
                                    </AccessibleText>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setShowModal(false)}
                                    className="w-8 h-8 items-center justify-center"
                                    accessibilityRole="button"
                                    accessibilityLabel="Cerrar"
                                >
                                    <Ionicons name="close" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                            <AccessibleText weight="bold" className="text-blue-100 font-bold text-base mt-1">
                                {title}
                            </AccessibleText>
                        </LinearGradient>

                        {/* Content */}
                        <View className="p-4">
                            <AccessibleText className="text-white text-base leading-6 mb-4">
                                {explanation}
                            </AccessibleText>

                            {Array.isArray(examples) && examples.length > 0 && (
                                <View className="mb-4">
                                    <AccessibleText weight="bold" className="text-blue-400 font-bold text-sm mb-2">
                                        Ejemplos:
                                    </AccessibleText>
                                    {examples.map((example, index) => (
                                        <View key={index} className="flex-row items-start mb-2">
                                            <AccessibleText className="text-gray-400 text-sm mr-2">•</AccessibleText>
                                            <AccessibleText className="text-gray-300 text-sm flex-1">
                                                {example}
                                            </AccessibleText>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {scientific && (
                                <View className="bg-gray-800/50 p-3 rounded-lg">
                                    <AccessibleText weight="bold" className="text-yellow-400 font-bold text-sm mb-1">
                                        Base Científica:
                                    </AccessibleText>
                                    <AccessibleText className="text-gray-300 text-sm">
                                        {scientific}
                                    </AccessibleText>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};