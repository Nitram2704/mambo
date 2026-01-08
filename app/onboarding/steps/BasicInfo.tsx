import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUserProfileStore } from '@/store/userProfileStore';
import { Ionicons } from '@expo/vector-icons';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { a11y } from '@/utils/accessibility';

interface BasicInfoProps {
    onNext: () => void;
}

export default function BasicInfo({ onNext }: BasicInfoProps) {
    const { t } = useTranslation();
    const { profile, updateProfile } = useUserProfileStore();

    // Local state to prevent DB updates on every keystroke
    const [formData, setFormData] = React.useState({
        name: profile?.name || '',
        age: profile?.age?.toString() || '',
        gender: profile?.gender || '',
        weight: profile?.weight?.toString() || '',
        height: profile?.height?.toString() || ''
    });

    // Update local state when profile loads (if needed)
    React.useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || profile.name || '',
                age: prev.age || profile.age?.toString() || '',
                gender: prev.gender || profile.gender || '',
                weight: prev.weight || profile.weight?.toString() || '',
                height: prev.height || profile.height?.toString() || ''
            }));
        }
    }, [profile]);

    const handleNext = async () => {
        const age = parseInt(formData.age) || 0;
        const weight = parseFloat(formData.weight) || 0;
        const height = parseFloat(formData.height) || 0;

        if (formData.name && age && weight && height) {
            await updateProfile({
                name: formData.name,
                age,
                gender: formData.gender as any,
                weight,
                height
            });
            onNext();
        }
    };

    const isStepValid = !!(formData.name && formData.age && formData.weight && formData.height);

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <ScreenWrapper
            scrollable
            contentContainerClassName="px-6 pt-8 pb-8"
            footer={
                <View className="px-6 pt-2 pb-4 bg-background">
                    <Button
                        label={t('common.continue')}
                        onPress={handleNext}
                        disabled={!isStepValid}
                        icon={<Ionicons name="arrow-forward" size={20} color="white" />}
                        iconPosition="right"
                        accessibilityLabel={t('common.continue')}
                        accessibilityHint="Guarda tu información básica y continúa al siguiente paso"
                    />
                </View>
            }
        >
            {/* Header */}
            <View className="mb-10" {...a11y.header(t('onboarding.basicInfo.title'))}>
                <AccessibleText variant="h1" weight="bold" className="text-text text-3xl mb-2">
                    {t('onboarding.basicInfo.title')}
                </AccessibleText>
                <AccessibleText variant="body" className="text-text-secondary text-lg">
                    {t('onboarding.basicInfo.subtitle')}
                </AccessibleText>
            </View>

            {/* Form */}
            <View className="gap-2">
                <Input
                    label={t('onboarding.basicInfo.nameLabel')}
                    placeholder={t('onboarding.basicInfo.namePlaceholder')}
                    value={formData.name}
                    onChangeText={(text) => updateField('name', text)}
                    icon="person-outline"
                    accessibilityHint="Ingresa tu nombre completo"
                />

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Input
                            label={t('onboarding.basicInfo.ageLabel')}
                            placeholder="25"
                            value={formData.age}
                            onChangeText={(text) => updateField('age', text)}
                            keyboardType="numeric"
                            icon="calendar-outline"
                            accessibilityHint="Ingresa tu edad en años"
                        />
                    </View>
                    <View className="flex-1">
                        <Input
                            label={t('onboarding.basicInfo.genderLabel')}
                            placeholder="M / F"
                            value={formData.gender}
                            onChangeText={(text) => updateField('gender', text)}
                            icon="male-female-outline"
                            accessibilityHint="Ingresa tu género (M para masculino, F para femenino)"
                        />
                    </View>
                </View>

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Input
                            label={t('onboarding.basicInfo.weightLabel')}
                            placeholder="70"
                            value={formData.weight}
                            onChangeText={(text) => updateField('weight', text)}
                            keyboardType="numeric"
                            icon="speedometer-outline"
                            accessibilityHint="Ingresa tu peso actual en kilogramos"
                        />
                    </View>
                    <View className="flex-1">
                        <Input
                            label={t('onboarding.basicInfo.heightLabel')}
                            placeholder="175"
                            value={formData.height}
                            onChangeText={(text) => updateField('height', text)}
                            keyboardType="numeric"
                            icon="resize-outline"
                            accessibilityHint="Ingresa tu altura en centímetros"
                        />
                    </View>
                </View>
            </View>

        </ScreenWrapper>
    );
}
