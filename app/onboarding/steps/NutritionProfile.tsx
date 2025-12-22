import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useUserProfileStore } from '@/store/userProfileStore';

interface NutritionProfileProps {
    onNext: () => void;
    onBack: () => void;
}

export default function NutritionProfile({ onNext, onBack }: NutritionProfileProps) {
    const { t } = useTranslation();
    const { profile, updateProfile } = useUserProfileStore();

    const dietOptions = [
        { id: 'omnivore', name: t('onboarding.nutritionProfile.dietaryOmnivore'), icon: 'restaurant-outline', desc: t('onboarding.nutritionProfile.dietaryOmnivoreDesc') },
        { id: 'vegetarian', name: t('onboarding.nutritionProfile.dietaryVegetarian'), icon: 'leaf-outline', desc: t('onboarding.nutritionProfile.dietaryVegetarianDesc') },
        { id: 'vegan', name: t('onboarding.nutritionProfile.dietaryVegan'), icon: 'nutrition-outline', desc: t('onboarding.nutritionProfile.dietaryVeganDesc') },
        { id: 'other', name: t('onboarding.nutritionProfile.dietaryOther'), icon: 'ellipsis-horizontal-outline', desc: t('onboarding.nutritionProfile.dietaryOtherDesc') },
    ];

    const budgetOptions = [
        { id: 'low', name: t('onboarding.nutritionProfile.budgetLow'), icon: 'cash-outline', desc: t('onboarding.nutritionProfile.budgetLowDesc') },
        { id: 'medium', name: t('onboarding.nutritionProfile.budgetMedium'), icon: 'wallet-outline', desc: t('onboarding.nutritionProfile.budgetMediumDesc') },
        { id: 'high', name: t('onboarding.nutritionProfile.budgetHigh'), icon: 'diamond-outline', desc: t('onboarding.nutritionProfile.budgetHighDesc') },
    ];

    const skillOptions = [
        { id: 'basic', name: t('onboarding.nutritionProfile.skillBasic'), icon: 'cafe-outline', desc: t('onboarding.nutritionProfile.skillBasicDesc') },
        { id: 'intermediate', name: t('onboarding.nutritionProfile.skillIntermediate'), icon: 'pizza-outline', desc: t('onboarding.nutritionProfile.skillIntermediateDesc') },
        { id: 'advanced', name: t('onboarding.nutritionProfile.skillAdvanced'), icon: 'restaurant-outline', desc: t('onboarding.nutritionProfile.skillAdvancedDesc') },
    ];

    return (
        <ScreenWrapper scrollable contentContainerClassName="px-6 pt-8 pb-32">
            {/* Header */}
            <View className="mb-10">
                <Text className="text-white text-3xl font-bold mb-2">
                    {t('onboarding.nutritionProfile.title')}
                </Text>
                <Text className="text-text-secondary text-lg">
                    {t('onboarding.nutritionProfile.subtitle')}
                </Text>
            </View>

            {/* Diet Type */}
            <View className="mb-8">
                <Text className="text-white text-lg font-semibold mb-4">{t('onboarding.nutritionProfile.dietaryLabel')}</Text>
                <View className="gap-3">
                    {dietOptions.map((diet) => (
                        <TouchableOpacity
                            key={diet.id}
                            onPress={() => updateProfile({ dietaryPreferences: diet.id as any })}
                        >
                            <Card
                                variant={profile?.dietaryPreferences === diet.id ? 'solid' : 'outline'}
                                className={`flex-row items-center p-4 ${profile?.dietaryPreferences === diet.id ? 'bg-primary border-primary' : ''}`}
                            >
                                <Ionicons
                                    name={diet.icon as any}
                                    size={24}
                                    color={profile?.dietaryPreferences === diet.id ? 'white' : '#94a3b8'}
                                />
                                <View className="ml-4 flex-1">
                                    <Text className={`font-bold ${profile?.dietaryPreferences === diet.id ? 'text-white' : 'text-white'}`}>
                                        {diet.name}
                                    </Text>
                                    <Text className={`text-sm ${profile?.dietaryPreferences === diet.id ? 'text-white/80' : 'text-text-secondary'}`}>
                                        {diet.desc}
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Food Restrictions */}
            <View className="mb-8">
                <Input
                    label={t('onboarding.nutritionProfile.restrictionsLabel')}
                    placeholder={t('onboarding.nutritionProfile.restrictionsPlaceholder')}
                    value={profile?.foodRestrictions || ''}
                    onChangeText={(text) => updateProfile({ foodRestrictions: text })}
                    multiline
                    numberOfLines={3}
                    icon="warning-outline"
                />
            </View>

            {/* Budget */}
            <View className="mb-8">
                <Text className="text-white text-lg font-semibold mb-4">{t('onboarding.nutritionProfile.budgetLabel')}</Text>
                <View className="gap-3">
                    {budgetOptions.map((budget) => (
                        <TouchableOpacity
                            key={budget.id}
                            onPress={() => updateProfile({ foodBudget: budget.id as any })}
                        >
                            <Card
                                variant={profile?.foodBudget === budget.id ? 'solid' : 'outline'}
                                className={`flex-row items-center p-4 ${profile?.foodBudget === budget.id ? 'bg-success border-success' : ''}`}
                            >
                                <Ionicons
                                    name={budget.icon as any}
                                    size={24}
                                    color={profile?.foodBudget === budget.id ? 'white' : '#94a3b8'}
                                />
                                <View className="ml-4 flex-1">
                                    <Text className={`font-bold ${profile?.foodBudget === budget.id ? 'text-white' : 'text-white'}`}>
                                        {budget.name}
                                    </Text>
                                    <Text className={`text-sm ${profile?.foodBudget === budget.id ? 'text-white/80' : 'text-text-secondary'}`}>
                                        {budget.desc}
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Cooking Skill */}
            <View className="mb-8">
                <Text className="text-white text-lg font-semibold mb-4">{t('onboarding.nutritionProfile.skillLabel')}</Text>
                <View className="gap-3">
                    {skillOptions.map((skill) => (
                        <TouchableOpacity
                            key={skill.id}
                            onPress={() => updateProfile({ cookingSkill: skill.id as any })}
                        >
                            <Card
                                variant={profile?.cookingSkill === skill.id ? 'solid' : 'outline'}
                                className={`flex-row items-center p-4 ${profile?.cookingSkill === skill.id ? 'bg-secondary border-secondary' : ''}`}
                            >
                                <Ionicons
                                    name={skill.icon as any}
                                    size={24}
                                    color={profile?.cookingSkill === skill.id ? 'white' : '#94a3b8'}
                                />
                                <View className="ml-4 flex-1">
                                    <Text className={`font-bold ${profile?.cookingSkill === skill.id ? 'text-white' : 'text-white'}`}>
                                        {skill.name}
                                    </Text>
                                    <Text className={`text-sm ${profile?.cookingSkill === skill.id ? 'text-white/80' : 'text-text-secondary'}`}>
                                        {skill.desc}
                                    </Text>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

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
                        label={t('common.generatePlan')}
                        onPress={onNext}
                        className="flex-[2]"
                        icon={<Ionicons name="sparkles-outline" size={20} color="white" />}
                        iconPosition="right"
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}
