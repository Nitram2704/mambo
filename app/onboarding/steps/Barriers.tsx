import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface BarriersProps {
    onNext: (data: { barriers: string[] }) => void;
    initialData?: string[];
}

export default function Barriers({ onNext, initialData = [] }: BarriersProps) {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const [selectedBarriers, setSelectedBarriers] = useState<string[]>(initialData);

    const barriers = [
        { id: 'time', icon: 'time-outline', label: t('onboarding.barriers.time') },
        { id: 'motivation', icon: 'battery-dead-outline', label: t('onboarding.barriers.motivation') },
        { id: 'knowledge', icon: 'help-circle-outline', label: t('onboarding.barriers.knowledge') },
        { id: 'injury', icon: 'medkit-outline', label: t('onboarding.barriers.injury') },
        { id: 'consistency', icon: 'repeat-outline', label: t('onboarding.barriers.consistency') },
        { id: 'none', icon: 'rocket-outline', label: t('onboarding.barriers.none') },
    ];

    const toggleBarrier = (id: string) => {
        if (id === 'none') {
            setSelectedBarriers(['none']);
            return;
        }

        let newSelected = [...selectedBarriers];
        if (newSelected.includes('none')) {
            newSelected = [];
        }

        if (newSelected.includes(id)) {
            newSelected = newSelected.filter(item => item !== id);
        } else {
            newSelected.push(id);
        }
        setSelectedBarriers(newSelected);
    };

    const handleContinue = () => {
        onNext({ barriers: selectedBarriers });
    };

    return (
        <View className="flex-1">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <AccessibleText variant="h2" weight="bold" className="text-text mb-2">
                    {t('onboarding.barriers.title')}
                </AccessibleText>
                <AccessibleText className="text-text-secondary mb-8">
                    {t('onboarding.barriers.subtitle')}
                </AccessibleText>

                <View className="gap-3">
                    {barriers.map((barrier, index) => {
                        const isSelected = selectedBarriers.includes(barrier.id);
                        return (
                            <Animated.View
                                key={barrier.id}
                                entering={FadeInDown.delay(index * 100).springify()}
                            >
                                <TouchableOpacity
                                    onPress={() => toggleBarrier(barrier.id)}
                                    className={`flex-row items-center p-4 rounded-2xl border ${isSelected ? 'bg-primary/10 border-primary' : 'bg-surface-highlight/50 border-transparent'}`}
                                >
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isSelected ? 'bg-primary' : 'bg-surface-highlight'}`}>
                                        <Ionicons
                                            name={barrier.icon as any}
                                            size={20}
                                            color={isSelected ? 'white' : Colors[theme].textSecondary}
                                        />
                                    </View>
                                    <AccessibleText weight="medium" className={`text-lg flex-1 ${isSelected ? 'text-primary' : 'text-text'}`}>
                                        {barrier.label}
                                    </AccessibleText>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={24} color={Colors[theme].primary} />
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 pt-4 bg-background">
                <TouchableOpacity
                    onPress={handleContinue}
                    disabled={selectedBarriers.length === 0}
                    className="mb-4"
                >
                    <LinearGradient
                        colors={selectedBarriers.length > 0 ? Colors.gradients.primary : ['#4b5563', '#374151']}
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
