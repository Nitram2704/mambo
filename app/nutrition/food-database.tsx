import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FoodItem, getAllFoods } from '@/data/foodDatabase';
import { useFavoriteFoodsStore } from '@/store/favoriteFoodsStore';
import { searchOpenFoodFacts } from '@/utils/openFoodFactsService';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { PaywallModal } from '@/components/PaywallModal';
import { AccessibleText } from '@/components/ui/AccessibleText';

export default function FoodDatabaseScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const params = useLocalSearchParams<{ fromLogMeal?: string; mealType?: string }>();
    const fromLogMeal = params.fromLogMeal === 'true';
    const mealType = params.mealType;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<FoodItem['category'] | 'all' | 'favorites'>('all');
    const { toggleFavorite, isFavorite, favoriteFoodIds } = useFavoriteFoodsStore();

    // New State for Online Search
    const [searchMode, setSearchMode] = useState<'local' | 'online'>('local');
    const [onlineResults, setOnlineResults] = useState<FoodItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Subscription & Paywall
    const { checkPermission, getRemainingCredits } = useSubscriptionStore();
    const [paywallVisible, setPaywallVisible] = useState(false);

    const categories: (FoodItem['category'] | 'all' | 'favorites')[] = [
        'all', 'favorites', 'protein', 'carbs', 'fats', 'vegetables', 'dairy', 'fruits', 'snacks', 'beverages'
    ];

    const allFoods = getAllFoods();

    // Local Filtering
    const localFilteredFoods = searchQuery
        ? allFoods.filter(food =>
            food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            food.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : selectedCategory === 'favorites'
            ? allFoods.filter(food => favoriteFoodIds.includes(food.id))
            : selectedCategory === 'all'
                ? allFoods
                : allFoods.filter(food => food.category === selectedCategory);

    // Online Search Handler (Debounced)
    const performOnlineSearch = async (query: string) => {
        if (!query.trim()) {
            setOnlineResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchOpenFoodFacts(query);
            setOnlineResults(results);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    // Trigger online search when query changes (if in online mode)
    useEffect(() => {
        if (searchMode === 'online') {
            const timer = setTimeout(() => {
                performOnlineSearch(searchQuery);
            }, 600); // 600ms debounce
            return () => clearTimeout(timer);
        }
    }, [searchQuery, searchMode]);

    const handleSelectFood = (food: FoodItem) => {
        if (fromLogMeal) {
            // Navigate back to log-meal with food data and meal type
            const displayName = food.brand ? `${food.name} (${food.brand})` : food.name;

            router.push({
                pathname: '/nutrition/log-meal',
                params: {
                    selectedFoodName: displayName,
                    selectedFoodCalories: food.calories.toString(),
                    selectedFoodProtein: food.protein.toString(),
                    selectedFoodCarbs: food.carbs.toString(),
                    selectedFoodFats: food.fats.toString(),
                    mealType: mealType || undefined,
                }
            });
        } else {
            router.back();
        }
    };

    const getCategoryLabel = (category: FoodItem['category'] | 'all' | 'favorites'): string => {
        if (category === 'all') return t('nutrition.categories.all');
        if (category === 'favorites') return '⭐';
        return t(`nutrition.categories.${category}`);
    };

    const displayedFoods = searchMode === 'local' ? localFilteredFoods : onlineResults;

    return (
        <ScreenWrapper>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor: Colors[theme].border }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <View className="flex-1 ml-3">
                    <AccessibleText variant="h3" weight="bold" className="text-text">{t('nutrition.foodDatabaseScreen.title')}</AccessibleText>
                    <AccessibleText variant="caption" className="text-text-secondary">
                        {searchMode === 'local' ? t('nutrition.foodDatabaseScreen.localDesc') : t('nutrition.foodDatabaseScreen.onlineDesc')}
                    </AccessibleText>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/nutrition/add-custom-food')}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons name="add-circle" size={28} color="#f97316" />
                </TouchableOpacity>
            </View>

            {/* Search Mode Toggle */}
            <View className="px-4 pt-4 pb-2">
                <View className="flex-row rounded-xl p-1 border" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.8)', borderColor: Colors[theme].border }}>
                    <TouchableOpacity
                        onPress={() => setSearchMode('local')}
                        className={`flex-1 py-2 rounded-lg items-center ${searchMode === 'local' ? (isDark ? 'bg-gray-700' : 'bg-white shadow-sm') : ''}`}
                    >
                        <AccessibleText weight="bold" className={searchMode === 'local' ? (isDark ? 'text-white' : 'text-gray-900') : 'text-gray-400'}>{t('nutrition.foodDatabaseScreen.local')}</AccessibleText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setSearchMode('online')}
                        className={`flex-1 py-2 rounded-lg items-center ${searchMode === 'online' ? 'bg-blue-600' : ''}`}
                    >
                        <View className="flex-row items-center gap-2">
                            <AccessibleText weight="bold" className={searchMode === 'online' ? 'text-white' : 'text-gray-400'}>{t('nutrition.foodDatabaseScreen.online')}</AccessibleText>
                            <Ionicons name="globe-outline" size={14} color={searchMode === 'online' ? 'white' : '#9ca3af'} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar & Scan Button */}
            <View className="p-4 flex-row gap-3">
                <View
                    className="flex-1 rounded-xl border overflow-hidden"
                    style={{ backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)', borderColor: Colors[theme].border }}
                >
                    <View className="flex-row items-center p-3.5">
                        <Ionicons name="search" size={20} color={Colors[theme].textMuted} />
                        <TextInput
                            className="flex-1 ml-3 text-base"
                            style={{ color: Colors[theme].text }}
                            placeholder={searchMode === 'online' ? t('nutrition.foodDatabaseScreen.searchPlaceholderOnline') : t('nutrition.foodDatabaseScreen.searchPlaceholderLocal')}
                            placeholderTextColor={Colors[theme].textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus={searchMode === 'online'}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} className="ml-2">
                                <Ionicons name="close-circle" size={20} color={Colors[theme].textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        if (!checkPermission('barcodeScanner')) {
                            setPaywallVisible(true);
                            return;
                        }
                        router.push({
                            pathname: '/nutrition/scan-barcode',
                            params: { mealType }
                        });
                    }}
                    className="w-12 justify-center items-center rounded-xl border"
                    style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)', borderColor: Colors[theme].border }}
                >
                    <Ionicons name="barcode-outline" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
            </View>

            {/* Category Tabs (Only for Local) */}
            {searchMode === 'local' && (
                <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ flexGrow: 0 }}
                    >
                        <View className="flex-row gap-2">
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    onPress={() => setSelectedCategory(category)}
                                    activeOpacity={0.7}
                                >
                                    <View
                                        style={{
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            borderRadius: 999,
                                            borderWidth: 1,
                                            backgroundColor: selectedCategory === category ? '#f97316' : (isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.8)'),
                                            borderColor: selectedCategory === category ? '#fb923c' : Colors[theme].border
                                        }}
                                    >
                                        <AccessibleText
                                            weight="semibold"
                                            className={`text-xs ${selectedCategory === category ? 'text-white' : (isDark ? 'text-gray-400' : 'text-gray-600')}`}
                                        >
                                            {getCategoryLabel(category)}
                                        </AccessibleText>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            )}

            {/* Loading State */}
            {isSearching && searchMode === 'online' && (
                <View className="py-10 items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <AccessibleText className="text-text-secondary mt-4">{t('nutrition.foodDatabaseScreen.searchingOnline')}</AccessibleText>
                </View>
            )}

            {/* Food List */}
            <FlatList
                data={displayedFoods}
                keyExtractor={(item) => item.id}
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleSelectFood(item)}
                        className="mb-3"
                        activeOpacity={0.7}
                    >
                        <Card variant={isDark ? "glass" : "outline"} className="p-4">
                            <View className="flex-row justify-between items-start mb-3">
                                {item.image && (
                                    <Image
                                        source={{ uri: item.image }}
                                        className="w-12 h-12 rounded-lg mr-3 bg-gray-700"
                                        resizeMode="cover"
                                    />
                                )}
                                <View className="flex-1 mr-3">
                                    <AccessibleText weight="bold" className="text-text text-base mb-1">{item.name}</AccessibleText>
                                    <View className="flex-row flex-wrap gap-2 mb-1">
                                        {item.brand && (
                                            <View className="bg-blue-500/20 self-start px-2 py-0.5 rounded-md">
                                                <AccessibleText weight="bold" className="text-blue-400 text-xs">{item.brand}</AccessibleText>
                                            </View>
                                        )}
                                        {item.isGeneric && (
                                            <View className="bg-green-500/20 self-start px-2 py-0.5 rounded-md">
                                                <AccessibleText weight="bold" className="text-green-400 text-xs">{t('nutrition.foodDatabaseScreen.generic')}</AccessibleText>
                                            </View>
                                        )}
                                        {item.budgetLevel && (
                                            <View className="bg-purple-500/20 self-start px-2 py-0.5 rounded-md">
                                                <AccessibleText weight="bold" className="text-purple-400 text-xs">
                                                    {t(`nutrition.foodDatabaseScreen.${item.budgetLevel}`)}
                                                </AccessibleText>
                                            </View>
                                        )}
                                    </View>
                                    <AccessibleText variant="caption" className="text-text-secondary">{t('nutrition.foodDatabaseScreen.portion')}: {item.servingSize}</AccessibleText>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    {searchMode === 'local' && (
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(item.id);
                                            }}
                                            className="w-9 h-9 items-center justify-center"
                                        >
                                            <Ionicons
                                                name={isFavorite(item.id) ? 'star' : 'star-outline'}
                                                size={22}
                                                color={isFavorite(item.id) ? '#fbbf24' : Colors[theme].textMuted}
                                            />
                                        </TouchableOpacity>
                                    )}
                                    <View className="bg-orange-500/20 px-2.5 py-1 rounded-lg">
                                        <AccessibleText weight="bold" className="text-orange-400 text-xs">
                                            {item.calories}
                                        </AccessibleText>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row justify-between rounded-xl p-3 border" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(249, 250, 251, 0.8)', borderColor: Colors[theme].border }}>
                                <View className="items-center flex-1">
                                    <AccessibleText variant="caption" className="text-text-secondary mb-1">{t('nutrition.protein')}</AccessibleText>
                                    <AccessibleText weight="bold" className="text-blue-400 text-sm">{item.protein}g</AccessibleText>
                                </View>
                                <View className="w-px" style={{ backgroundColor: Colors[theme].border }} />
                                <View className="items-center flex-1">
                                    <AccessibleText variant="caption" className="text-text-secondary mb-1">{t('nutrition.carbs')}</AccessibleText>
                                    <AccessibleText weight="bold" className="text-green-400 text-sm">{item.carbs}g</AccessibleText>
                                </View>
                                <View className="w-px" style={{ backgroundColor: Colors[theme].border }} />
                                <View className="items-center flex-1">
                                    <AccessibleText variant="caption" className="text-text-secondary mb-1">{t('nutrition.fats')}</AccessibleText>
                                    <AccessibleText weight="bold" className="text-yellow-400 text-sm">{item.fats}g</AccessibleText>
                                </View>
                            </View>
                        </Card>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View className="py-20 items-center">
                        <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.8)' }}>
                            <Ionicons name={searchMode === 'online' ? "globe-outline" : "search"} size={36} color={Colors[theme].textMuted} />
                        </View>
                        <AccessibleText weight="medium" className="text-text-secondary text-base">
                            {searchMode === 'online' && !searchQuery
                                ? t('nutrition.foodDatabaseScreen.writeToSearchOnline')
                                : t('nutrition.foodDatabaseScreen.noFoodsFound')}
                        </AccessibleText>
                        <AccessibleText variant="caption" className="text-text-muted mt-2">
                            {searchMode === 'online'
                                ? t('nutrition.foodDatabaseScreen.searchByBrand')
                                : t('nutrition.foodDatabaseScreen.tryAnotherTerm')}
                        </AccessibleText>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            <PaywallModal
                visible={paywallVisible}
                onClose={() => setPaywallVisible(false)}
                triggerFeature="Barcode Scanner"
                requiredTier="PRO"
            />
        </ScreenWrapper>
    );
}

