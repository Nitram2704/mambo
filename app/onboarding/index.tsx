import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import BasicInfo from './steps/BasicInfo';
import FitnessProfile from './steps/FitnessProfile';
import NutritionProfile from './steps/NutritionProfile';
import GeneratingPlans from './steps/GeneratingPlans';

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);

    const nextStep = () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <BasicInfo onNext={nextStep} />;
            case 2:
                return <FitnessProfile onNext={nextStep} onBack={prevStep} />;
            case 3:
                return <NutritionProfile onNext={nextStep} onBack={prevStep} />;
            case 4:
                return <GeneratingPlans />;
            default:
                return null;
        }
    };

    const progress = Math.round(((currentStep) / (TOTAL_STEPS - 1)) * 100);

    return (
        <ScreenWrapper bg="bg-background" safeArea={true}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Progress Bar */}
            {currentStep < TOTAL_STEPS && (
                <View className="pt-4 px-6 pb-4 bg-background">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-text-secondary text-sm font-medium">
                            {t('onboarding.progress', { current: currentStep, total: TOTAL_STEPS - 1 })}
                        </Text>
                        <Text className="text-primary text-sm font-bold">
                            {progress > 100 ? 100 : progress}%
                        </Text>
                    </View>
                    <View className="h-2 bg-surface rounded-full overflow-hidden">
                        <View
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${progress > 100 ? 100 : progress}%` }}
                        />
                    </View>
                </View>
            )}

            {/* Step Content */}
            <View className="flex-1">
                {renderStep()}
            </View>
        </ScreenWrapper>
    );
}
