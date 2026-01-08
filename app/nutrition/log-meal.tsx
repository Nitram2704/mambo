import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNutritionStore, MealType } from '@/store/nutritionStore';
import { analyzeFoodImage, submitFoodFeedback, FoodAnalysisResult } from '@/utils/foodVisionService';
import { useAchievementsStore } from '@/store/achievementsStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';

export default function LogMealScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const { logMeal, getTodayData, getDataForDate } = useNutritionStore();
    const { checkNutritionStreaks } = useAchievementsStore();
    const { profile } = useUserProfileStore();
    const params = useLocalSearchParams<{
        selectedFoodName?: string;
        selectedFoodCalories?: string;
        selectedFoodProtein?: string;
        selectedFoodCarbs?: string;
        selectedFoodFats?: string;
        mealType?: string;
    }>();

    const [mealName, setMealName] = useState('');
    const [quantity, setQuantity] = useState('100'); // Default 100g
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<FoodAnalysisResult | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    // FIXED: Initialize from params if available to fix meal type bug
    const [selectedMealType, setSelectedMealType] = useState<MealType>(
        (params.mealType as MealType) || 'breakfast'
    );

    // Base values per 100g (if food selected)
    const [baseValues, setBaseValues] = useState<{
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    } | null>(null);

    // New State for Raw/Cooked
    const [measurementType, setMeasurementType] = useState<'raw' | 'cooked'>('raw');

    // Auto-fill when food selected
    useEffect(() => {
        if (params.selectedFoodName) {
            setMealName(params.selectedFoodName);
            const cal = parseFloat(params.selectedFoodCalories || '0');
            const prot = parseFloat(params.selectedFoodProtein || '0');
            const carb = parseFloat(params.selectedFoodCarbs || '0');
            const fat = parseFloat(params.selectedFoodFats || '0');

            setBaseValues({
                calories: cal,
                protein: prot,
                carbs: carb,
                fats: fat,
            });

            // Reset measurement type to raw by default
            setMeasurementType('raw');

            // Set initial values based on 100g
            setCalories(cal.toString());
            setProtein(prot.toString());
            setCarbs(carb.toString());
            setFats(fat.toString());
        }
    }, [params.selectedFoodName, params.selectedFoodCalories, params.selectedFoodProtein, params.selectedFoodCarbs, params.selectedFoodFats]);

    // Recalculate when quantity or measurement type changes
    useEffect(() => {
        if (baseValues && quantity) {
            let factor = parseFloat(quantity) / 100;

            // Apply Raw vs Cooked Logic
            if (measurementType === 'cooked') {
                // Heuristic: 
                // If high protein (meat), it loses water -> Cooked is denser. 100g cooked ~= 133g raw.
                // If high carbs (rice/pasta), it gains water -> Cooked is less dense. 100g cooked ~= 35g raw.

                const isHighProtein = baseValues.protein > baseValues.carbs;

                if (isHighProtein) {
                    // Meat: Multiplier ~1.33 (100g cooked came from ~133g raw)
                    factor = factor * 1.33;
                } else {
                    // Grains: Multiplier ~0.35 (100g cooked came from ~35g raw)
                    // Assuming baseValues are RAW (standard in DBs)
                    factor = factor * 0.35;
                }
            }

            if (!isNaN(factor)) {
                setCalories(Math.round(baseValues.calories * factor).toString());
                setProtein(Math.round(baseValues.protein * factor).toString());
                setCarbs(Math.round(baseValues.carbs * factor).toString());
                setFats(Math.round(baseValues.fats * factor).toString());
            }
        }
    }, [quantity, baseValues, measurementType]);

    const handleAnalyzePhoto = async (uri: string) => {
        setAnalyzingPhoto(true);
        try {
            const analysis = await analyzeFoodImage(uri);
            setAiAnalysis(analysis);

            // Auto-fill form with AI results
            setMealName(analysis.foodName);
            setCalories(analysis.calories.toString());
            setProtein(analysis.protein.toString());
            setCarbs(analysis.carbs.toString());
            setFats(analysis.fats.toString());

            Alert.alert(
                t('nutrition.logMeal.analysisComplete'),
                t('nutrition.logMeal.analysisCompleteNote', {
                    name: analysis.foodName,
                    confidence: Math.round(analysis.confidence * 100)
                }),
                [{ text: 'OK' }]
            );
        } catch (error) {
            Alert.alert(
                t('common.error'),
                t('nutrition.logMeal.analysisError'),
                [{ text: 'OK' }]
            );
        } finally {
            setAnalyzingPhoto(false);
        }
    };

    const pickImageFromGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert(t('nutrition.logMeal.permissionRequired'), t('nutrition.logMeal.galleryPermissionNote'));
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });
        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
            await handleAnalyzePhoto(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert(t('nutrition.logMeal.permissionRequired'), t('nutrition.logMeal.cameraPermissionNote'));
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });
        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
            await handleAnalyzePhoto(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (!mealName.trim()) {
            Alert.alert(t('common.error'), t('nutrition.logMeal.nameRequired'));
            return;
        }
        const caloriesNum = parseFloat(calories);
        if (!caloriesNum || caloriesNum <= 0) {
            Alert.alert(t('common.error'), t('nutrition.logMeal.caloriesRequired'));
            return;
        }

        console.log('Guardando comida con mealType:', selectedMealType);

        // Check if user significantly changed AI values
        if (aiAnalysis && photoUri) {
            const caloriesDiff = Math.abs(aiAnalysis.calories - caloriesNum) / aiAnalysis.calories;
            if (caloriesDiff > 0.15) {
                // Show feedback modal
                setShowFeedbackModal(true);
                return; // Don't save yet, wait for feedback decision
            }
        }

        logMeal({
            name: mealName,
            calories: caloriesNum,
            protein: parseFloat(protein) || 0,
            carbs: parseFloat(carbs) || 0,
            fats: parseFloat(fats) || 0,
            photoUri: photoUri || undefined,
            mealType: selectedMealType,
        });

        // Check nutrition streaks after logging meal
        if (profile) {
            const todayData = getTodayData();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = yesterday.toISOString().split('T')[0];
            const yesterdayData = getDataForDate(yesterdayKey);

            checkNutritionStreaks(todayData, yesterdayData, profile);
        }

        // Navigate to nutrition tab after saving
        // Use navigate to ensure we go back to the main tab, clearing the stack if needed
        router.push('/(tabs)/nutricion');
    };

    const mealTypes: { id: MealType; label: string; icon: string }[] = [
        { id: 'breakfast', label: t('nutrition.mealTypes.breakfast'), icon: 'sunny' },
        { id: 'mid_morning', label: t('nutrition.mealTypes.mid_morning'), icon: 'cafe' },
        { id: 'lunch', label: t('nutrition.mealTypes.lunch'), icon: 'restaurant' },
        { id: 'snack', label: t('nutrition.mealTypes.snack'), icon: 'ice-cream' },
        { id: 'dinner', label: t('nutrition.mealTypes.dinner'), icon: 'moon' },
    ];

    return (
        <ScreenWrapper>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor: Colors[theme].border }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <AccessibleText weight="medium" className="text-text-secondary text-base">{t('nutrition.logMeal.cancel')}</AccessibleText>
                </TouchableOpacity>
                <AccessibleText variant="h3" weight="bold" className="text-text">{t('nutrition.logMeal.title')}</AccessibleText>
                <TouchableOpacity onPress={handleSave}>
                    <AccessibleText weight="bold" className="text-primary text-base">{t('nutrition.logMeal.save')}</AccessibleText>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>

                {/* Meal Type Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                    <View className="flex-row gap-3">
                        {mealTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                onPress={() => setSelectedMealType(type.id)}
                                className={`flex-row items-center px-4 py-2 rounded-full border ${selectedMealType === type.id
                                    ? 'bg-orange-500 border-orange-400'
                                    : (isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200')
                                    }`}
                            >
                                <Ionicons
                                    name={type.icon as any}
                                    size={16}
                                    color={selectedMealType === type.id ? 'white' : Colors[theme].textMuted}
                                />
                                <AccessibleText weight="medium" className={`ml-2 ${selectedMealType === type.id ? 'text-white' : 'text-text-secondary'
                                    }`}>
                                    {type.label}
                                </AccessibleText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Meal Name */}
                <Card variant={isDark ? "glass" : "outline"} className="p-5 mb-4">
                    <AccessibleText variant="h3" weight="bold" className="text-text mb-3">{t('nutrition.logMeal.mealName')}</AccessibleText>
                    <TextInput
                        className="p-3 rounded-xl text-base border"
                        style={{
                            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                            color: Colors[theme].text,
                            borderColor: Colors[theme].border
                        }}
                        placeholder={t('nutrition.logMeal.mealNamePlaceholder')}
                        placeholderTextColor={Colors[theme].textMuted}
                        value={mealName}
                        onChangeText={setMealName}
                    />
                </Card>

                {/* Quantity Calculator */}
                <Card variant={isDark ? "glass" : "outline"} className="p-5 mb-4">
                    <View className="flex-row justify-between items-center mb-3">
                        <AccessibleText variant="h3" weight="bold" className="text-text">{t('nutrition.logMeal.quantity')}</AccessibleText>
                        {baseValues && (
                            <View className="bg-blue-500/20 px-2 py-1 rounded-md">
                                <AccessibleText weight="bold" className="text-blue-400 text-xs">{t('nutrition.logMeal.autoCalcActive')}</AccessibleText>
                            </View>
                        )}
                    </View>

                    <TextInput
                        className="p-3 rounded-xl text-base border mb-3"
                        style={{
                            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                            color: Colors[theme].text,
                            borderColor: Colors[theme].border
                        }}
                        placeholder="100"
                        placeholderTextColor={Colors[theme].textMuted}
                        keyboardType="decimal-pad"
                        value={quantity}
                        onChangeText={setQuantity}
                    />

                    {/* Raw/Cooked Selector */}
                    {baseValues && (
                        <View className="mb-2">
                            <AccessibleText variant="caption" className="text-text-secondary mb-2">{t('nutrition.logMeal.howDidYouWeight')}</AccessibleText>
                            <View className="flex-row rounded-lg p-1 border" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f3f4f6', borderColor: Colors[theme].border }}>
                                <TouchableOpacity
                                    onPress={() => setMeasurementType('raw')}
                                    className={`flex-1 py-1.5 rounded-md items-center ${measurementType === 'raw' ? (isDark ? 'bg-gray-700' : 'bg-white shadow-sm') : ''}`}
                                >
                                    <AccessibleText weight="bold" className={`text-xs ${measurementType === 'raw' ? (isDark ? 'text-white' : 'text-gray-900') : 'text-gray-500'}`}>{t('nutrition.logMeal.raw')}</AccessibleText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setMeasurementType('cooked')}
                                    className={`flex-1 py-1.5 rounded-md items-center ${measurementType === 'cooked' ? 'bg-blue-600' : ''}`}
                                >
                                    <AccessibleText weight="bold" className={`text-xs ${measurementType === 'cooked' ? 'text-white' : 'text-gray-500'}`}>{t('nutrition.logMeal.cooked')}</AccessibleText>
                                </TouchableOpacity>
                            </View>
                            {measurementType === 'cooked' && (
                                <AccessibleText variant="caption" className="text-blue-400 mt-1 italic">
                                    {t('nutrition.logMeal.cookedNote')}
                                </AccessibleText>
                            )}
                        </View>
                    )}

                    <AccessibleText variant="caption" className="text-text-muted mt-1">
                        {baseValues
                            ? t('nutrition.logMeal.autoCalcNote')
                            : t('nutrition.logMeal.manualNote')}
                    </AccessibleText>
                </Card>

                {/* Calories */}
                <Card variant={isDark ? "glass" : "outline"} className="p-5 mb-4">
                    <AccessibleText variant="h3" weight="bold" className="text-text mb-3">{t('nutrition.logMeal.caloriesLabel')}</AccessibleText>
                    <TextInput
                        className="p-3 rounded-xl text-base border"
                        style={{
                            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                            color: Colors[theme].text,
                            borderColor: Colors[theme].border
                        }}
                        placeholder={t('nutrition.logMeal.caloriesPlaceholder')}
                        placeholderTextColor={Colors[theme].textMuted}
                        keyboardType="decimal-pad"
                        value={calories}
                        onChangeText={setCalories}
                    />
                </Card>

                {/* Browse Foods Button */}
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/nutrition/food-database',
                        params: {
                            fromLogMeal: 'true',
                            mealType: selectedMealType
                        }
                    })}
                    className="mb-4"
                >
                    <LinearGradient
                        colors={['#f97316', '#ea580c']}
                        className="rounded-2xl p-4 border border-orange-400/30"
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="restaurant" size={20} color="white" />
                            <AccessibleText weight="bold" className="text-white text-base ml-2">{t('nutrition.logMeal.searchInDatabase')}</AccessibleText>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Macros */}
                <Card variant={isDark ? "glass" : "outline"} className="p-5 mb-4">
                    <AccessibleText variant="h3" weight="bold" className="text-text mb-4">{t('nutrition.logMeal.macronutrients')}</AccessibleText>

                    {/* Protein */}
                    <View className="mb-4">
                        <AccessibleText weight="medium" className="text-text-secondary text-sm mb-2">{t('nutrition.logMeal.proteinLabel')}</AccessibleText>
                        <TextInput
                            className="p-3 rounded-xl text-base border"
                            style={{
                                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                                color: Colors[theme].text,
                                borderColor: Colors[theme].border
                            }}
                            placeholder={t('nutrition.logMeal.proteinPlaceholder')}
                            placeholderTextColor={Colors[theme].textMuted}
                            keyboardType="decimal-pad"
                            value={protein}
                            onChangeText={setProtein}
                        />
                    </View>

                    {/* Carbs */}
                    <View className="mb-4">
                        <AccessibleText weight="medium" className="text-text-secondary text-sm mb-2">{t('nutrition.logMeal.carbsLabel')}</AccessibleText>
                        <TextInput
                            className="p-3 rounded-xl text-base border"
                            style={{
                                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                                color: Colors[theme].text,
                                borderColor: Colors[theme].border
                            }}
                            placeholder={t('nutrition.logMeal.carbsPlaceholder')}
                            placeholderTextColor={Colors[theme].textMuted}
                            keyboardType="decimal-pad"
                            value={carbs}
                            onChangeText={setCarbs}
                        />
                    </View>

                    {/* Fats */}
                    <View>
                        <AccessibleText weight="medium" className="text-text-secondary text-sm mb-2">{t('nutrition.logMeal.fatsLabel')}</AccessibleText>
                        <TextInput
                            className="p-3 rounded-xl text-base border"
                            style={{
                                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb',
                                color: Colors[theme].text,
                                borderColor: Colors[theme].border
                            }}
                            placeholder={t('nutrition.logMeal.fatsPlaceholder')}
                            placeholderTextColor={Colors[theme].textMuted}
                            keyboardType="decimal-pad"
                            value={fats}
                            onChangeText={setFats}
                        />
                    </View>
                </Card>

                {/* Photo Section */}
                <Card variant={isDark ? "glass" : "outline"} className="p-5 mb-8">
                    <AccessibleText variant="h3" weight="bold" className="text-text mb-4">{t('nutrition.logMeal.photo')}</AccessibleText>

                    {photoUri ? (
                        <View>
                            <Image
                                source={{ uri: photoUri }}
                                className="w-full h-48 rounded-xl mb-3"
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                onPress={() => setPhotoUri(null)}
                                className="bg-red-600/80 p-3 rounded-xl border border-red-500/30"
                            >
                                <AccessibleText weight="bold" className="text-white text-center">{t('nutrition.logMeal.deletePhoto')}</AccessibleText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="flex-row gap-3">
                            <TouchableOpacity onPress={takePhoto} className="flex-1">
                                <LinearGradient
                                    colors={['#3b82f6', '#2563eb']}
                                    className="p-4 rounded-xl flex-row items-center justify-center"
                                >
                                    <Ionicons name="camera" size={20} color="white" />
                                    <AccessibleText weight="bold" className="text-white ml-2">{t('nutrition.logMeal.camera')}</AccessibleText>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={pickImageFromGallery} className="flex-1">
                                <LinearGradient
                                    colors={['#a855f7', '#9333ea']}
                                    className="p-4 rounded-xl flex-row items-center justify-center"
                                >
                                    <Ionicons name="images" size={20} color="white" />
                                    <AccessibleText weight="bold" className="text-white ml-2">{t('nutrition.logMeal.gallery')}</AccessibleText>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card>
            </ScrollView>

            {/* Loading Overlay for AI Analysis */}
            {analyzingPhoto && (
                <View className="absolute inset-0 bg-black/80 items-center justify-center z-50">
                    <View className="bg-gray-800 rounded-2xl p-6 items-center">
                        <ActivityIndicator size="large" color="#f97316" />
                        <AccessibleText weight="bold" className="text-white text-lg mt-4">{t('nutrition.logMeal.analyzing')}</AccessibleText>
                        <AccessibleText variant="caption" className="text-gray-400 mt-2">{t('nutrition.logMeal.analyzingNote')}</AccessibleText>
                    </View>
                </View>
            )}

            {/* Feedback Modal */}
            <Modal
                visible={showFeedbackModal}
                animationType="slide"
                transparent
            >
                <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-gray-900 rounded-t-3xl p-6">
                        <AccessibleText weight="bold" className="text-white text-2xl mb-4">{t('nutrition.logMeal.feedbackTitle')}</AccessibleText>
                        <AccessibleText className="text-gray-400 mb-6">
                            {t('nutrition.logMeal.feedbackNote')}
                        </AccessibleText>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={async () => {
                                    setShowFeedbackModal(false);
                                    // Save without feedback
                                    logMeal({
                                        name: mealName,
                                        calories: parseFloat(calories),
                                        protein: parseFloat(protein) || 0,
                                        carbs: parseFloat(carbs) || 0,
                                        fats: parseFloat(fats) || 0,
                                        photoUri: photoUri || undefined,
                                        mealType: selectedMealType,
                                    });

                                    // Check nutrition streaks
                                    if (profile) {
                                        const todayData = getTodayData();
                                        const yesterday = new Date();
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        const yesterdayKey = yesterday.toISOString().split('T')[0];
                                        const yesterdayData = getDataForDate(yesterdayKey);

                                        checkNutritionStreaks(todayData, yesterdayData, profile);
                                    }

                                    router.push('/(tabs)/nutricion');
                                }}
                                className="flex-1 bg-gray-800 py-4 rounded-xl"
                            >
                                <AccessibleText weight="bold" className="text-white text-center">{t('nutrition.logMeal.noThanks')}</AccessibleText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={async () => {
                                    setShowFeedbackModal(false);
                                    // Submit feedback
                                    if (aiAnalysis && photoUri) {
                                        await submitFoodFeedback(
                                            photoUri,
                                            aiAnalysis,
                                            {
                                                calories: parseFloat(calories),
                                                protein: parseFloat(protein) || 0,
                                                carbs: parseFloat(carbs) || 0,
                                                fats: parseFloat(fats) || 0,
                                            }
                                        );
                                    }
                                    // Save meal
                                    logMeal({
                                        name: mealName,
                                        calories: parseFloat(calories),
                                        protein: parseFloat(protein) || 0,
                                        carbs: parseFloat(carbs) || 0,
                                        fats: parseFloat(fats) || 0,
                                        photoUri: photoUri || undefined,
                                        mealType: selectedMealType,
                                    });

                                    // Check nutrition streaks
                                    if (profile) {
                                        const todayData = getTodayData();
                                        const yesterday = new Date();
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        const yesterdayKey = yesterday.toISOString().split('T')[0];
                                        const yesterdayData = getDataForDate(yesterdayKey);

                                        checkNutritionStreaks(todayData, yesterdayData, profile);
                                    }

                                    Alert.alert(t('common.success'), t('nutrition.logMeal.feedbackSuccess'));
                                    router.push('/(tabs)/nutricion');
                                }}
                                className="flex-1 bg-orange-600 py-4 rounded-xl"
                            >
                                <AccessibleText weight="bold" className="text-white text-center">{t('nutrition.logMeal.yesSend')}</AccessibleText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
