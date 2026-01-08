import React, { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import BasicInfo from './steps/BasicInfo';
import Barriers from './steps/Barriers';
import Motivation from './steps/Motivation';
import SocialProof from './steps/SocialProof';
import FitnessProfile from './steps/FitnessProfile';
import NutritionProfile from './steps/NutritionProfile';
import GeneratingPlans from './steps/GeneratingPlans';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { a11y } from '@/utils/accessibility';

const TOTAL_STEPS = 7;

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
                return <Barriers onNext={nextStep} />;
            case 3:
                return <Motivation onNext={nextStep} />;
            case 4:
                return <SocialProof onNext={nextStep} />;
            case 5:
                return <FitnessProfile onNext={nextStep} onBack={prevStep} />;
            case 6:
                return <NutritionProfile onNext={nextStep} onBack={prevStep} />;
            case 7:
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
                        <AccessibleText variant="caption" weight="medium" className="text-text-secondary">
                            {t('onboarding.progress', { current: currentStep, total: TOTAL_STEPS - 1 })}
                        </AccessibleText>
                        <AccessibleText weight="bold" className="text-primary">
                            {progress > 100 ? 100 : progress}%
                        </AccessibleText>
                    </View>
                    <View
                        className="h-2 bg-surface rounded-full overflow-hidden"
                        {...a11y.adjustable(
                            t('onboarding.progress', { current: currentStep, total: TOTAL_STEPS - 1 }),
                            progress > 100 ? 100 : progress,
                            0,
                            100
                        )}
                        accessibilityRole="progressbar"
                    >
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
