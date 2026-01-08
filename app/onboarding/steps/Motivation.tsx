import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface MotivationProps {
    onNext: (data: { motivation: string[] }) => void;
    initialData?: string[];
}

export default function Motivation({ onNext, initialData = [] }: MotivationProps) {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const [selectedMotivations, setSelectedMotivations] = useState<string[]>(initialData);

    const motivations = [
        { id: 'health', icon: 'heart-outline', label: t('onboarding.motivation.health') },
        { id: 'confidence', icon: 'happy-outline', label: t('onboarding.motivation.confidence') },
        { id: 'energy', icon: 'flash-outline', label: t('onboarding.motivation.energy') },
        { id: 'appearance', icon: 'body-outline', label: t('onboarding.motivation.appearance') },
        { id: 'strength', icon: 'barbell-outline', label: t('onboarding.motivation.strength') },
        { id: 'stress', icon: 'leaf-outline', label: t('onboarding.motivation.stress') },
    ];

    const toggleMotivation = (id: string) => {
        let newSelected = [...selectedMotivations];
        if (newSelected.includes(id)) {
            newSelected = newSelected.filter(item => item !== id);
        } else {
            if (newSelected.length < 3) {
                newSelected.push(id);
            }
        }
        setSelectedMotivations(newSelected);
    };

    const handleContinue = () => {
        onNext({ motivation: selectedMotivations });
    };

    return (
        <View className="flex-1">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <AccessibleText variant="h2" weight="bold" className="text-text mb-2">
                    {t('onboarding.motivation.title')}
                </AccessibleText>
                <AccessibleText className="text-text-secondary mb-8">
                    {t('onboarding.motivation.subtitle')}
                </AccessibleText>

                <View className="flex-row flex-wrap justify-between px-1">
                    {motivations.map((motivation, index) => {
                        const isSelected = selectedMotivations.includes(motivation.id);
                        return (
                            <Animated.View
                                key={motivation.id}
                                entering={FadeInDown.delay(index * 100).springify()}
                                className="w-[48%] mb-4"
                            >
                                <TouchableOpacity
                                    onPress={() => toggleMotivation(motivation.id)}
                                    activeOpacity={0.7}
                                    className={`p-4 rounded-3xl border-2 h-36 justify-between ${isSelected
                                            ? 'bg-secondary/10 border-secondary'
                                            : 'bg-surface-highlight/30 border-transparent'
                                        }`}
                                    style={{
                                        shadowColor: isSelected ? Colors[theme].secondary : 'transparent',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: isSelected ? 4 : 0
                                    }}
                                >
                                    <View className="flex-row justify-between items-start">
                                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isSelected ? 'bg-secondary' : 'bg-surface-highlight'}`}>
                                            <Ionicons
                                                name={motivation.icon as any}
                                                size={24}
                                                color={isSelected ? 'white' : Colors[theme].textSecondary}
                                            />
                                        </View>
                                        {isSelected && (
                                            <Animated.View entering={FadeInDown.duration(200)}>
                                                <Ionicons name="checkmark-circle" size={22} color={Colors[theme].secondary} />
                                            </Animated.View>
                                        )}
                                    </View>

                                    <View>
                                        <AccessibleText
                                            weight="bold"
                                            className={`text-base leading-5 ${isSelected ? 'text-secondary' : 'text-text'}`}
                                            numberOfLines={2}
                                        >
                                            {motivation.label}
                                        </AccessibleText>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 pt-4 bg-background">
                <TouchableOpacity
                    onPress={handleContinue}
                    disabled={selectedMotivations.length === 0}
                    className="mb-4"
                >
                    <LinearGradient
                        colors={selectedMotivations.length > 0 ? Colors.gradients.primary : ['#4b5563', '#374151']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-2xl py-4 items-center"
                    >
                        <AccessibleText className="text-white text-lg font-bold">
                            {t('common.continue')}
                        </AccessibleText>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}
