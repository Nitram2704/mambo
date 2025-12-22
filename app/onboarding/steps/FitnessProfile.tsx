import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useUserProfileStore } from '@/store/userProfileStore';

interface FitnessProfileProps {
    onNext: () => void;
    onBack: () => void;
}

export default function FitnessProfile({ onNext, onBack }: FitnessProfileProps) {
    const { t } = useTranslation();
    const { profile, updateProfile } = useUserProfileStore();

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
        <ScreenWrapper scrollable contentContainerClassName="px-6 pt-8 pb-32">
            {/* Header */}
            <View className="mb-10">
                <Text className="text-white text-3xl font-bold mb-2">
                    {t('onboarding.fitnessProfile.title')}
                </Text>
                <Text className="text-text-secondary text-lg">
                    {t('onboarding.fitnessProfile.subtitle')}
                </Text>
            </View>

            {/* Experience Level */}
            <View className="mb-8">
                <Text className="text-white text-lg font-semibold mb-4">{t('onboarding.fitnessProfile.experienceLabel')}</Text>
                <View className="gap-3">
                    {experienceLevels.map((level) => (
                        <TouchableOpacity
                            key={level.id}
                            onPress={() => updateProfile({ experienceLevel: level.id as any })}
                        >
                            <Card
                                variant={profile?.experienceLevel === level.id ? 'solid' : 'outline'}
                                className={`flex-row items-center p-4 ${profile?.experienceLevel === level.id ? 'bg-primary border-primary' : ''}`}
                            >
                                <Ionicons
                                    name={level.icon as any}
                                    size={24}
                                    color={profile?.experienceLevel === level.id ? 'white' : '#94a3b8'}
                                />
                                <View className="ml-4 flex-1">
                                    <Text className={`font-bold ${profile?.experienceLevel === level.id ? 'text-white' : 'text-white'}`}>
                                        {level.name}
                                    </Text>
                                    <Text className={`text-sm ${profile?.experienceLevel === level.id ? 'text-white/80' : 'text-text-secondary'}`}>
                                        {level.desc}
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Main Goal */}
            <View className="mb-8">
                <Text className="text-white text-lg font-semibold mb-4">{t('onboarding.fitnessProfile.goalLabel')}</Text>
                <View className="flex-row flex-wrap gap-3">
                    {goals.map((goal) => (
                        <TouchableOpacity
                            key={goal.id}
                            onPress={() => updateProfile({ fitnessGoal: goal.id as any })}
                            className="flex-1 min-w-[45%]"
                        >
                            <Card
                                variant={profile?.fitnessGoal === goal.id ? 'solid' : 'outline'}
                                className={`p-4 items-center ${profile?.fitnessGoal === goal.id ? goal.color : ''}`}
                            >
                                <Ionicons
                                    name={goal.icon as any}
                                    size={32}
                                    color="white"
                                />
                                <Text className="text-white font-bold mt-2 text-center">
                                    {goal.name}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Workout Days */}
            <View className="mb-8">
                <Text className="text-white text-lg font-semibold mb-2">
                    {t('onboarding.fitnessProfile.daysLabel')}: <Text className="text-primary">{profile?.workoutDaysPerWeek || 3}</Text>
                </Text>
                <Slider
                    minimumValue={1}
                    maximumValue={7}
                    step={1}
                    value={profile?.workoutDaysPerWeek || 3}
                    onValueChange={(val) => updateProfile({ workoutDaysPerWeek: val })}
                    minimumTrackTintColor="#3b82f6"
                    maximumTrackTintColor="#334155"
                    thumbTintColor="#3b82f6"
                />
            </View>

            {/* Duration */}
            <View className="mb-8">
                <Text className="text-white text-lg font-semibold mb-2">
                    {t('onboarding.fitnessProfile.durationLabel')}: <Text className="text-primary">{profile?.minutesPerSession || 60} min</Text>
                </Text>
                <Slider
                    minimumValue={15}
                    maximumValue={120}
                    step={15}
                    value={profile?.minutesPerSession || 60}
                    onValueChange={(val) => updateProfile({ minutesPerSession: val })}
                    minimumTrackTintColor="#3b82f6"
                    maximumTrackTintColor="#334155"
                    thumbTintColor="#3b82f6"
                />
            </View>

            {/* Equipment */}
            <View className="mb-8">
                <Text className="text-white text-lg font-semibold mb-4">{t('onboarding.fitnessProfile.equipmentLabel')}</Text>
                <View className="gap-3">
                    {equipmentOptions.map((eq) => (
                        <TouchableOpacity
                            key={eq.id}
                            onPress={() => updateProfile({ availableEquipment: eq.id as any })}
                        >
                            <Card
                                variant={profile?.availableEquipment === eq.id ? 'solid' : 'outline'}
                                className={`flex-row items-center p-4 ${profile?.availableEquipment === eq.id ? 'bg-primary border-primary' : ''}`}
                            >
                                <Ionicons
                                    name={eq.icon as any}
                                    size={24}
                                    color={profile?.availableEquipment === eq.id ? 'white' : '#94a3b8'}
                                />
                                <Text className={`ml-4 font-bold ${profile?.availableEquipment === eq.id ? 'text-white' : 'text-white'}`}>
                                    {eq.name}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Restrictions */}
            <Input
                label={t('onboarding.fitnessProfile.restrictionsLabel')}
                placeholder={t('onboarding.fitnessProfile.restrictionsPlaceholder')}
                value={profile?.physicalRestrictions || ''}
                onChangeText={(text) => updateProfile({ physicalRestrictions: text })}
                multiline
                numberOfLines={3}
                icon="warning-outline"
            />

            {/* Fixed Footer */}
            <View className="absolute bottom-0 left-0 right-0 bg-background/80 border-t border-white/5">
                <View className="px-6 py-6 flex-row gap-4">
                    <Button
                        variant="secondary"
                        label={t('common.back')}
                        onPress={onBack}
                        className="flex-1"
                        icon={<Ionicons name="chevron-back" size={20} color="white" />}
                    />
                    <Button
                        variant="primary"
                        label={t('common.continue')}
                        onPress={onNext}
                        className="flex-[2]"
                        icon={<Ionicons name="arrow-forward" size={20} color="white" />}
                        iconPosition="right"
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}
