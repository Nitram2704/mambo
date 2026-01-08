import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useUserProfileStore } from '@/store/userProfileStore';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { a11y } from '@/utils/accessibility';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';

interface FitnessProfileProps {
    onNext: () => void;
    onBack: () => void;
}

export default function FitnessProfile({ onNext, onBack }: FitnessProfileProps) {
    const { t } = useTranslation();
    const { profile, updateProfile } = useUserProfileStore();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const [formData, setFormData] = React.useState({
        experienceLevel: profile?.experienceLevel,
        fitnessGoal: profile?.fitnessGoal,
        workoutDaysPerWeek: profile?.workoutDaysPerWeek || 3,
        minutesPerSession: profile?.minutesPerSession || 60,
        availableEquipment: profile?.availableEquipment,
        physicalRestrictions: profile?.physicalRestrictions || ''
    });

    React.useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                experienceLevel: prev.experienceLevel || profile.experienceLevel,
                fitnessGoal: prev.fitnessGoal || profile.fitnessGoal,
                workoutDaysPerWeek: prev.workoutDaysPerWeek === 3 ? (profile.workoutDaysPerWeek || 3) : prev.workoutDaysPerWeek,
                minutesPerSession: prev.minutesPerSession === 60 ? (profile.minutesPerSession || 60) : prev.minutesPerSession,
                availableEquipment: prev.availableEquipment || profile.availableEquipment,
                physicalRestrictions: prev.physicalRestrictions || profile.physicalRestrictions || ''
            }));
        }
    }, [profile]);

    const saveChanges = async () => {
        await updateProfile({
            experienceLevel: formData.experienceLevel,
            fitnessGoal: formData.fitnessGoal,
            workoutDaysPerWeek: formData.workoutDaysPerWeek,
            minutesPerSession: formData.minutesPerSession,
            availableEquipment: formData.availableEquipment,
            physicalRestrictions: formData.physicalRestrictions
        });
    };

    const handleNext = async () => {
        if (formData.experienceLevel && formData.fitnessGoal && formData.availableEquipment) {
            await saveChanges();
            onNext();
        }
    };

    const handleBack = async () => {
        await saveChanges();
        onBack();
    };

    const updateField = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const experienceLevels = [
        { id: 'sedentary', name: t('onboarding.fitnessProfile.experienceSedentary'), desc: t('onboarding.fitnessProfile.experienceSedentaryDesc'), icon: 'bed-outline' },
        { id: 'beginner', name: t('onboarding.fitnessProfile.experienceBeginner'), desc: t('onboarding.fitnessProfile.experienceBeginnerDesc'), icon: 'fitness-outline' },
        { id: 'intermediate', name: t('onboarding.fitnessProfile.experienceIntermediate'), desc: t('onboarding.fitnessProfile.experienceIntermediateDesc'), icon: 'barbell-outline' },
        { id: 'advanced', name: t('onboarding.fitnessProfile.experienceAdvanced'), desc: t('onboarding.fitnessProfile.experienceAdvancedDesc'), icon: 'trophy-outline' },
    ];

    const goals = [
        { id: 'lose_fat', name: t('onboarding.fitnessProfile.goalLoseFat'), icon: 'flame-outline', color: 'bg-orange-500' },
        { id: 'gain_muscle', name: t('onboarding.fitnessProfile.goalGainMuscle'), icon: 'body-outline', color: 'bg-green-500' },
        { id: 'improve_performance', name: t('onboarding.fitnessProfile.goalImprovePerformance'), icon: 'speedometer-outline', color: 'bg-purple-500' },
        { id: 'general_health', name: t('onboarding.fitnessProfile.goalGeneralHealth'), icon: 'heart-outline', color: 'bg-pink-500' },
    ];

    const equipmentOptions = [
        { id: 'full_gym', name: t('onboarding.fitnessProfile.equipmentFullGym'), icon: 'business-outline' },
        { id: 'dumbbells', name: t('onboarding.fitnessProfile.equipmentDumbbells'), icon: 'barbell-outline' },
        { id: 'bodyweight', name: t('onboarding.fitnessProfile.equipmentBodyweight'), icon: 'body-outline' },
        { id: 'bands', name: t('onboarding.fitnessProfile.equipmentBands'), icon: 'resize-outline' },
    ];

    return (
        <ScreenWrapper
            scrollable
            contentContainerClassName="px-6 pt-8 pb-8"
            footer={
                <View className="px-6 pt-2 pb-4 flex-row gap-4 bg-background">
                    <Button
                        variant="secondary"
                        label={t('common.back')}
                        onPress={handleBack}
                        className="flex-1"
                        icon={<Ionicons name="chevron-back" size={20} color="white" />}
                        accessibilityLabel={t('common.back')}
                        accessibilityHint="Vuelve al paso anterior"
                    />
                    <Button
                        variant="primary"
                        label={t('common.continue')}
                        onPress={handleNext}
                        className="flex-[2]"
                        icon={<Ionicons name="arrow-forward" size={20} color="white" />}
                        iconPosition="right"
                        accessibilityLabel={t('common.continue')}
                        accessibilityHint="Guarda tu perfil de fitness y continúa al siguiente paso"
                    />
                </View>
            }
        >
            {/* Header */}
            <View className="mb-10" {...a11y.header(t('onboarding.fitnessProfile.title'))}>
                <AccessibleText variant="h1" weight="bold" className="text-text text-3xl mb-2">
                    {t('onboarding.fitnessProfile.title')}
                </AccessibleText>
                <AccessibleText variant="body" className="text-text-secondary text-lg">
                    {t('onboarding.fitnessProfile.subtitle')}
                </AccessibleText>
            </View>

            {/* Experience Level */}
            <View className="mb-8">
                <AccessibleText variant="h3" weight="semibold" className="text-text mb-4">{t('onboarding.fitnessProfile.experienceLabel')}</AccessibleText>
                <View className="gap-3">
                    {experienceLevels.map((level) => (
                        <TouchableOpacity
                            key={level.id}
                            onPress={() => updateField('experienceLevel', level.id)}
                            {...a11y.button(
                                `${level.name}. ${level.desc}`,
                                `Selecciona nivel de experiencia ${level.name}`,
                                { selected: formData.experienceLevel === level.id }
                            )}
                        >
                            <Card
                                variant="glass"
                                className={`flex-row items-center p-4 ${formData.experienceLevel === level.id ? 'bg-primary border-primary' : 'border-border/10'}`}
                            >
                                <Ionicons
                                    name={level.icon as any}
                                    size={24}
                                    color={formData.experienceLevel === level.id ? 'white' : colors.textMuted}
                                />
                                <View className="ml-4 flex-1">
                                    <AccessibleText weight="bold" className={`${formData.experienceLevel === level.id ? 'text-white' : 'text-text'}`}>
                                        {level.name}
                                    </AccessibleText>
                                    <AccessibleText variant="caption" className={`${formData.experienceLevel === level.id ? 'text-white/80' : 'text-text-secondary'}`}>
                                        {level.desc}
                                    </AccessibleText>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Main Goal */}
            <View className="mb-8">
                <AccessibleText variant="h3" weight="semibold" className="text-text mb-4">{t('onboarding.fitnessProfile.goalLabel')}</AccessibleText>
                <View className="flex-row flex-wrap gap-3">
                    {goals.map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            onPress={() => updateField('fitnessGoal', goal.id)}
                            className="flex-1 min-w-[45%]"
                            {...a11y.button(
                                goal.name,
                                `Selecciona objetivo ${goal.name}`,
                                { selected: formData.fitnessGoal === goal.id }
                            )}
                        >
                            <Card
                                variant="glass"
                                className={`p-4 items-center ${formData.fitnessGoal === goal.id ? goal.color : 'border-border/10'}`}
                            >
                                <Ionicons
                                    name={goal.icon as any}
                                    size={32}
                                    color={formData.fitnessGoal === goal.id ? 'white' : colors.textMuted}
                                />
                                <AccessibleText weight="bold" className={`${formData.fitnessGoal === goal.id ? 'text-white' : 'text-text'} mt-2 text-center`}>
                                    {goal.name}
                                </AccessibleText>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Workout Days */}
            <View className="mb-8">
                <AccessibleText variant="h3" weight="semibold" className="text-text mb-2">
                    {t('onboarding.fitnessProfile.daysLabel')}: <AccessibleText weight="bold" className="text-primary">{formData.workoutDaysPerWeek}</AccessibleText>
                </AccessibleText>
                <Slider
                    minimumValue={1}
                    maximumValue={7}
                    step={1}
                    value={formData.workoutDaysPerWeek}
                    onValueChange={(val) => updateField('workoutDaysPerWeek', val)}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.surfaceHighlight}
                    thumbTintColor={colors.primary}
                    {...a11y.adjustable(
                        t('onboarding.fitnessProfile.daysLabel'),
                        formData.workoutDaysPerWeek,
                        1,
                        7
                    )}
                />
            </View>

            {/* Duration */}
            <View className="mb-8">
                <AccessibleText variant="h3" weight="semibold" className="text-text mb-2">
                    {t('onboarding.fitnessProfile.durationLabel')}: <AccessibleText weight="bold" className="text-primary">{formData.minutesPerSession} min</AccessibleText>
                </AccessibleText>
                <Slider
                    minimumValue={15}
                    maximumValue={120}
                    step={15}
                    value={formData.minutesPerSession}
                    onValueChange={(val) => updateField('minutesPerSession', val)}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.surfaceHighlight}
                    thumbTintColor={colors.primary}
                    {...a11y.adjustable(
                        t('onboarding.fitnessProfile.durationLabel'),
                        formData.minutesPerSession,
                        15,
                        120
                    )}
                />
            </View>

            {/* Equipment */}
            <View className="mb-8">
                <AccessibleText variant="h3" weight="semibold" className="text-text mb-4">{t('onboarding.fitnessProfile.equipmentLabel')}</AccessibleText>
                <View className="gap-3">
                    {equipmentOptions.map((eq) => (
                        <TouchableOpacity
                            key={eq.id}
                            onPress={() => updateField('availableEquipment', eq.id)}
                            {...a11y.button(
                                eq.name,
                                `Selecciona equipamiento ${eq.name}`,
                                { selected: formData.availableEquipment === eq.id }
                            )}
                        >
                            <Card
                                variant="glass"
                                className={`flex-row items-center p-4 ${formData.availableEquipment === eq.id ? 'bg-primary border-primary' : 'border-border/10'}`}
                            >
                                <Ionicons
                                    name={eq.icon as any}
                                    size={24}
                                    color={formData.availableEquipment === eq.id ? 'white' : colors.textMuted}
                                />
                                <AccessibleText weight="bold" className={`ml-4 ${formData.availableEquipment === eq.id ? 'text-white' : 'text-text'}`}>
                                    {eq.name}
                                </AccessibleText>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Restrictions */}
            <Input
                label={t('onboarding.fitnessProfile.restrictionsLabel')}
                placeholder={t('onboarding.fitnessProfile.restrictionsPlaceholder')}
                value={formData.physicalRestrictions}
                onChangeText={(text) => updateField('physicalRestrictions', text)}
                multiline
                numberOfLines={3}
                icon="warning-outline"
                accessibilityHint="Describe cualquier lesión o limitación física que debamos tener en cuenta"
            />

        </ScreenWrapper>
    );
}
