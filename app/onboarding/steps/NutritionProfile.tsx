import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
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

interface NutritionProfileProps {
    onNext: () => void;
    onBack: () => void;
}

export default function NutritionProfile({ onNext, onBack }: NutritionProfileProps) {
    const { t } = useTranslation();
    const { profile, updateProfile } = useUserProfileStore();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const [formData, setFormData] = React.useState({
        dietaryPreferences: profile?.dietaryPreferences,
        foodRestrictions: profile?.foodRestrictions || '',
        foodBudget: profile?.foodBudget,
        cookingSkill: profile?.cookingSkill
    });

    React.useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                dietaryPreferences: prev.dietaryPreferences || profile.dietaryPreferences,
                foodRestrictions: prev.foodRestrictions || profile.foodRestrictions || '',
                foodBudget: prev.foodBudget || profile.foodBudget,
                cookingSkill: prev.cookingSkill || profile.cookingSkill
            }));
        }
    }, [profile]);

    const saveChanges = async () => {
        await updateProfile({
            dietaryPreferences: formData.dietaryPreferences,
            foodRestrictions: formData.foodRestrictions,
            foodBudget: formData.foodBudget,
            cookingSkill: formData.cookingSkill
        });
    };

    const handleNext = async () => {
        if (formData.dietaryPreferences && formData.foodBudget && formData.cookingSkill) {
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
                        label={t('common.generatePlan')}
                        onPress={handleNext}
                        className="flex-[2]"
                        icon={<Ionicons name="sparkles-outline" size={20} color="white" />}
                        iconPosition="right"
                        accessibilityLabel={t('common.generatePlan')}
                        accessibilityHint="Guarda tu perfil de nutrición y genera tu plan personalizado"
                    />
                </View>
            }
        >
            {/* Header */}
            <View className="mb-10" {...a11y.header(t('onboarding.nutritionProfile.title'))}>
                <AccessibleText variant="h1" weight="bold" className="text-text text-3xl mb-2">
                    {t('onboarding.nutritionProfile.title')}
                </AccessibleText>
                <AccessibleText variant="body" className="text-text-secondary text-lg">
                    {t('onboarding.nutritionProfile.subtitle')}
                </AccessibleText>
            </View>

            {/* Diet Type */}
            <View className="mb-8">
                <AccessibleText variant="h3" weight="semibold" className="text-text mb-4">{t('onboarding.nutritionProfile.dietaryLabel')}</AccessibleText>
                <View className="gap-3">
                    {dietOptions.map((diet) => (
                        <TouchableOpacity
                            key={diet.id}
                            onPress={() => updateField('dietaryPreferences', diet.id)}
                            {...a11y.button(
                                `${diet.name}. ${diet.desc}`,
                                `Selecciona tipo de dieta ${diet.name}`,
                                { selected: formData.dietaryPreferences === diet.id }
                            )}
                        >
                            <Card
                                variant="glass"
                                className={`flex-row items-center p-4 ${formData.dietaryPreferences === diet.id ? 'bg-primary border-primary' : 'border-border/10'}`}
                            >
                                <Ionicons
                                    name={diet.icon as any}
                                    size={24}
                                    color={formData.dietaryPreferences === diet.id ? 'white' : colors.textMuted}
                                />
                                <View className="ml-4 flex-1">
                                    <AccessibleText weight="bold" className={`${formData.dietaryPreferences === diet.id ? 'text-white' : 'text-text'}`}>
                                        {diet.name}
                                    </AccessibleText>
                                    <AccessibleText variant="caption" className={`${formData.dietaryPreferences === diet.id ? 'text-white/80' : 'text-text-secondary'}`}>
                                        {diet.desc}
                                    </AccessibleText>
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
                    value={formData.foodRestrictions}
                    onChangeText={(text) => updateField('foodRestrictions', text)}
                    multiline
                    numberOfLines={3}
                    icon="warning-outline"
                    accessibilityHint="Indica cualquier alergia o alimento que no te guste"
                />
            </View>

            {/* Budget */}
            <View className="mb-8">
                <AccessibleText variant="h3" weight="semibold" className="text-text mb-4">{t('onboarding.nutritionProfile.budgetLabel')}</AccessibleText>
                <View className="gap-3">
                    {budgetOptions.map((budget) => (
                        <TouchableOpacity
                            key={budget.id}
                            onPress={() => updateField('foodBudget', budget.id)}
                            {...a11y.button(
                                `${budget.name}. ${budget.desc}`,
                                `Selecciona presupuesto ${budget.name}`,
                                { selected: formData.foodBudget === budget.id }
                            )}
                        >
                            <Card
                                variant="glass"
                                className={`flex-row items-center p-4 ${formData.foodBudget === budget.id ? 'bg-success border-success' : 'border-border/10'}`}
                            >
                                <Ionicons
                                    name={budget.icon as any}
                                    size={24}
                                    color={formData.foodBudget === budget.id ? 'white' : colors.textMuted}
                                />
                                <View className="ml-4 flex-1">
                                    <AccessibleText weight="bold" className={`${formData.foodBudget === budget.id ? 'text-white' : 'text-text'}`}>
                                        {budget.name}
                                    </AccessibleText>
                                    <AccessibleText variant="caption" className={`${formData.foodBudget === budget.id ? 'text-white/80' : 'text-text-secondary'}`}>
                                        {budget.desc}
                                    </AccessibleText>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Cooking Skill */}
            <View className="mb-8">
                <AccessibleText variant="h3" weight="semibold" className="text-text mb-4">{t('onboarding.nutritionProfile.skillLabel')}</AccessibleText>
                <View className="gap-3">
                    {skillOptions.map((skill) => (
                        <TouchableOpacity
                            key={skill.id}
                            onPress={() => updateField('cookingSkill', skill.id)}
                            {...a11y.button(
                                `${skill.name}. ${skill.desc}`,
                                `Selecciona habilidad culinaria ${skill.name}`,
                                { selected: formData.cookingSkill === skill.id }
                            )}
                        >
                            <Card
                                variant="glass"
                                className={`flex-row items-center p-4 ${formData.cookingSkill === skill.id ? 'bg-secondary border-secondary' : 'border-border/10'}`}
                            >
                                <Ionicons
                                    name={skill.icon as any}
                                    size={24}
                                    color={formData.cookingSkill === skill.id ? 'white' : colors.textMuted}
                                />
                                <View className="ml-4 flex-1">
                                    <AccessibleText weight="bold" className={`${formData.cookingSkill === skill.id ? 'text-white' : 'text-text'}`}>
                                        {skill.name}
                                    </AccessibleText>
                                    <AccessibleText variant="caption" className={`${formData.cookingSkill === skill.id ? 'text-white/80' : 'text-text-secondary'}`}>
                                        {skill.desc}
                                    </AccessibleText>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

        </ScreenWrapper>
    );
}
