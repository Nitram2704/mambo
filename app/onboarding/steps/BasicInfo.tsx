import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUserProfileStore } from '@/store/userProfileStore';
import { Ionicons } from '@expo/vector-icons';

interface BasicInfoProps {
    onNext: () => void;
}

export default function BasicInfo({ onNext }: BasicInfoProps) {
    const { t } = useTranslation();
    const { profile, updateProfile } = useUserProfileStore();

    const handleNext = () => {
        if (profile?.name && profile?.age && profile?.weight && profile?.height) {
            onNext();
        }
    };

    const isStepValid = !!(profile?.name && profile?.age && profile?.weight && profile?.height);

    return (
        <ScreenWrapper scrollable contentContainerClassName="px-6 pt-8 pb-32">
            {/* Header */}
            <View className="mb-10">
                <Text className="text-white text-3xl font-bold mb-2">
                    {t('onboarding.basicInfo.title')}
                </Text>
                <Text className="text-text-secondary text-lg">
                    {t('onboarding.basicInfo.subtitle')}
                </Text>
            </View>

            {/* Form */}
            <View className="gap-2">
                <Input
                    label={t('onboarding.basicInfo.nameLabel')}
                    placeholder={t('onboarding.basicInfo.namePlaceholder')}
                    value={profile?.name || ''}
                    onChangeText={(text) => updateProfile({ name: text })}
                    icon="person-outline"
                />

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Input
                            label={t('onboarding.basicInfo.ageLabel')}
                            placeholder="25"
                            value={profile?.age?.toString() || ''}
                            onChangeText={(text) => updateProfile({ age: parseInt(text) || 0 })}
                            keyboardType="numeric"
                            icon="calendar-outline"
                        />
                    </View>
                    <View className="flex-1">
                        <Input
                            label={t('onboarding.basicInfo.genderLabel')}
                            placeholder="M / F"
                            value={profile?.gender || ''}
                            onChangeText={(text) => updateProfile({ gender: text as any })}
                            icon="male-female-outline"
                        />
                    </View>
                </View>

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Input
                            label={t('onboarding.basicInfo.weightLabel')}
                            placeholder="70"
                            value={profile?.weight?.toString() || ''}
                            onChangeText={(text) => updateProfile({ weight: parseFloat(text) || 0 })}
                            keyboardType="numeric"
                            icon="speedometer-outline"
                        />
                    </View>
                    <View className="flex-1">
                        <Input
                            label={t('onboarding.basicInfo.heightLabel')}
                            placeholder="175"
                            value={profile?.height?.toString() || ''}
                            onChangeText={(text) => updateProfile({ height: parseFloat(text) || 0 })}
                            keyboardType="numeric"
                            icon="resize-outline"
                        />
                    </View>
                </View>
            </View>

            {/* Fixed Footer */}
            <View className="absolute bottom-0 left-0 right-0 bg-background/80 border-t border-white/5">
                <View className="px-6 py-6">
                    <Button
                        label={t('common.continue')}
                        onPress={handleNext}
                        disabled={!isStepValid}
                        icon={<Ionicons name="arrow-forward" size={20} color="white" />}
                        iconPosition="right"
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}
