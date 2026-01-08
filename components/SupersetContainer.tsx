import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SupersetContainerProps {
    exerciseNames: string[];
    currentIndex: number;
    totalInSuperset: number;
    onUnlink?: () => void;
    children: React.ReactNode;
}

export const SupersetContainer: React.FC<SupersetContainerProps> = ({
    exerciseNames,
    currentIndex,
    totalInSuperset,
    onUnlink,
    children
}) => {
    return (
        <View className="relative">
            {/* Superset Indicator Bar */}
            <View className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-full" />

            {/* Superset Header */}
            <View className="ml-3 mb-2">
                <View className="flex-row items-center gap-2 bg-secondary/20 px-3 py-2 rounded-xl border border-secondary/30">
                    <Ionicons name="link" size={16} color="#a78bfa" />
                    <Text className="text-secondary font-bold text-xs uppercase tracking-wider">
                        Superset ({currentIndex + 1}/{totalInSuperset})
                    </Text>
                    <View className="flex-1" />
                    {onUnlink && (
                        <TouchableOpacity
                            onPress={onUnlink}
                            className="bg-secondary/30 px-2 py-1 rounded-lg"
                        >
                            <Ionicons name="unlink" size={14} color="#a78bfa" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Partner exercises list */}
                <View className="mt-1 px-2">
                    {exerciseNames.map((name, idx) => (
                        <View key={idx} className="flex-row items-center gap-1 py-0.5">
                            <Ionicons
                                name={idx === currentIndex ? "chevron-forward" : "remove"}
                                size={12}
                                color={idx === currentIndex ? "#a855f7" : "#6b7280"}
                            />
                            <Text
                                className={`text-xs ${idx === currentIndex ? 'text-purple-400 font-bold' : 'text-gray-500'}`}
                            >
                                {name}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Content */}
            <View className="ml-3">
                {children}
            </View>
        </View>
    );
};

interface SupersetLinkButtonProps {
    onPress: () => void;
    isLinked?: boolean;
}

export const SupersetLinkButton: React.FC<SupersetLinkButtonProps> = ({ onPress, isLinked }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center gap-2 px-3 py-2 rounded-xl border ${isLinked
                ? 'bg-purple-500/20 border-purple-500/50'
                : 'bg-gray-800/50 border-gray-700 border-dashed'
                }`}
        >
            <Ionicons
                name={isLinked ? "unlink" : "link"}
                size={16}
                color={isLinked ? "#a855f7" : "#9ca3af"}
            />
            <Text className={`text-sm font-bold ${isLinked ? 'text-purple-400' : 'text-gray-400'}`}>
                {isLinked ? 'Desvincular Superset' : 'Vincular como Superset'}
            </Text>
        </TouchableOpacity>
    );
};

export default SupersetContainer;
