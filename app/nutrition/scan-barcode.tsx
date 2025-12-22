import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFoodByBarcode } from '@/utils/openFoodFactsService';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

export default function ScanBarcodeScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const params = useLocalSearchParams<{ mealType?: string }>();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!permission) {
        // Camera permissions are still loading.
        return <View style={{ flex: 1, backgroundColor: Colors[theme].background }} />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: Colors[theme].background }}>
                <Text className="text-center mb-4 text-lg" style={{ color: Colors[theme].text }}>
                    {t('nutrition.scanBarcode.permissionNote')}
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">{t('nutrition.scanBarcode.grantPermission')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4"
                >
                    <Text style={{ color: Colors[theme].textSecondary }}>{t('common.cancel')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned || loading) return;

        setScanned(true);
        setLoading(true);

        try {
            // Vibrate or sound could be added here
            const food = await getFoodByBarcode(data);

            if (food) {
                // Navigate to log meal with found food
                const displayName = food.brand ? `${food.name} (${food.brand})` : food.name;

                router.replace({
                    pathname: '/nutrition/log-meal',
                    params: {
                        selectedFoodName: displayName,
                        selectedFoodCalories: food.calories.toString(),
                        selectedFoodProtein: food.protein.toString(),
                        selectedFoodCarbs: food.carbs.toString(),
                        selectedFoodFats: food.fats.toString(),
                        mealType: params.mealType,
                    }
                });
            } else {
                Alert.alert(
                    t('nutrition.scanBarcode.productNotFound'),
                    t('nutrition.scanBarcode.productNotFoundNote'),
                    [
                        {
                            text: t('common.cancel'),
                            style: "cancel",
                            onPress: () => {
                                setScanned(false);
                                setLoading(false);
                            }
                        },
                        {
                            text: t('nutrition.scanBarcode.addManually'),
                            onPress: () => {
                                router.replace({
                                    pathname: '/nutrition/add-custom-food',
                                    params: { mealType: params.mealType }
                                });
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error(error);
            setScanned(false);
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="flex-row items-center justify-between p-4 z-10">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center bg-black/50 rounded-full"
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">{t('nutrition.scanBarcode.title')}</Text>
                    <View className="w-10" />
                </View>

                <View className="flex-1 overflow-hidden rounded-3xl mx-4 mb-4 relative">
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr", "ean13", "ean8", "upc_e", "upc_a"],
                        }}
                    />

                    {/* Overlay Guide */}
                    <View className="flex-1 justify-center items-center">
                        <View className="w-64 h-64 border-2 border-white/50 rounded-3xl bg-transparent" />
                        <Text className="text-white/80 mt-4 bg-black/50 px-4 py-2 rounded-full text-sm">
                            {t('nutrition.scanBarcode.aimAtBarcode')}
                        </Text>
                    </View>

                    {loading && (
                        <View className="absolute inset-0 bg-black/70 justify-center items-center">
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text className="text-white mt-4 font-bold">{t('nutrition.scanBarcode.searchingProduct')}</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
