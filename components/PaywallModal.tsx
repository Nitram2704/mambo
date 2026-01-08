import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/constants/SubscriptionConfig';
import { Button } from './ui/Button';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { PRODUCT_IDS } from '@/config/revenueCatConfig';

interface PaywallModalProps {
    visible: boolean;
    onClose: () => void;
    triggerFeature: string;
    requiredTier: SubscriptionTier;
    onUpgrade?: (tier: SubscriptionTier) => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
    visible,
    onClose,
    triggerFeature,
    requiredTier,
    onUpgrade
}) => {
    const { theme } = useAppTheme();
    const tierConfig = SUBSCRIPTION_TIERS[requiredTier];
    const { offerings, loading: rcLoading, purchasePackage, restorePurchases } = useRevenueCat();
    const [purchasing, setPurchasing] = useState(false);

    // Get the package for the required tier
    const getPackageForTier = () => {
        if (!offerings) return null;
        const productId = requiredTier === 'PRO' ? PRODUCT_IDS.PRO_MONTHLY : PRODUCT_IDS.ELITE_MONTHLY;
        return offerings.availablePackages.find(pkg => pkg.product.identifier === productId);
    };

    const packageToPurchase = getPackageForTier();

    const handlePurchase = async () => {
        if (!packageToPurchase) {
            Alert.alert('Error', 'No se pudo cargar el producto. Intenta de nuevo.');
            return;
        }

        setPurchasing(true);
        const result = await purchasePackage(packageToPurchase);
        setPurchasing(false);

        if (result.success) {
            Alert.alert('¡Éxito!', `Ahora tienes acceso a ${tierConfig.name}`);
            onClose();
        } else if (result.error && !result.error.userCancelled) {
            Alert.alert('Error', 'No se pudo completar la compra. Intenta de nuevo.');
        }
    };

    const getFeatureIcon = () => {
        switch (triggerFeature) {
            case 'Barcode Scanner': return 'barcode-outline';
            case 'AI Photo Analysis': return 'camera-outline';
            case 'Analyze Technique': return 'videocam-outline';
            case 'RAG Memory': return 'bulb-outline';
            case 'Agent Actions': return 'construct-outline';
            default: return 'lock-closed-outline';
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-black/70 justify-center items-center px-4"
                onPress={onClose}
            >
                <Animated.View
                    entering={SlideInDown.springify()}
                    className="w-full max-w-md"
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <View
                            className="rounded-3xl overflow-hidden"
                            style={{ backgroundColor: Colors[theme].surface }}
                        >
                            {/* Header with Gradient */}
                            <LinearGradient
                                colors={['#3b82f6', '#8b5cf6']}
                                className="p-6 items-center"
                            >
                                <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-4">
                                    <Ionicons name={getFeatureIcon()} size={32} color="#ffffff" />
                                </View>
                                <Text className="text-white text-2xl font-bold text-center mb-2">
                                    Función Premium
                                </Text>
                                <Text className="text-white/80 text-center">
                                    {triggerFeature}
                                </Text>
                            </LinearGradient>

                            {/* Content */}
                            <View className="p-6">
                                <Text
                                    className="text-lg font-semibold mb-4"
                                    style={{ color: Colors[theme].text }}
                                >
                                    Desbloquea con {tierConfig.name}
                                </Text>

                                {/* Features List */}
                                <View className="mb-6 space-y-3">
                                    {tierConfig.features.cvCredits !== 0 && (
                                        <View className="flex-row items-center">
                                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                                            <Text className="ml-3" style={{ color: Colors[theme].textSecondary }}>
                                                {tierConfig.features.cvCredits === -1 ? 'Videos ilimitados' : `${tierConfig.features.cvCredits} videos/mes`}
                                            </Text>
                                        </View>
                                    )}
                                    {tierConfig.features.chatLimit !== 0 && (
                                        <View className="flex-row items-center">
                                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                                            <Text className="ml-3" style={{ color: Colors[theme].textSecondary }}>
                                                {tierConfig.features.chatLimit === -1 ? 'Chat ilimitado' : `${tierConfig.features.chatLimit} mensajes/día`}
                                            </Text>
                                        </View>
                                    )}
                                    {tierConfig.features.agentActions && (
                                        <View className="flex-row items-center">
                                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                                            <Text className="ml-3" style={{ color: Colors[theme].textSecondary }}>
                                                Acciones del Asistente IA
                                            </Text>
                                        </View>
                                    )}
                                    {tierConfig.features.nutritionVision && (
                                        <View className="flex-row items-center">
                                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                                            <Text className="ml-3" style={{ color: Colors[theme].textSecondary }}>
                                                Análisis de Fotos de Comida
                                            </Text>
                                        </View>
                                    )}
                                    {tierConfig.features.ragMemory && (
                                        <View className="flex-row items-center">
                                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                                            <Text className="ml-3" style={{ color: Colors[theme].textSecondary }}>
                                                Memoria de Largo Plazo
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Price */}
                                <View className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: Colors[theme].surfaceHighlight }}>
                                    {rcLoading || !packageToPurchase ? (
                                        <ActivityIndicator size="small" color={Colors[theme].primary} />
                                    ) : (
                                        <>
                                            <Text className="text-center text-3xl font-bold" style={{ color: Colors[theme].text }}>
                                                {packageToPurchase.product.priceString}
                                            </Text>
                                            <Text className="text-center text-xs mt-1" style={{ color: Colors[theme].textMuted }}>
                                                {packageToPurchase.product.subscriptionPeriod}
                                            </Text>
                                        </>
                                    )}
                                </View>

                                <Button
                                    label={purchasing ? 'Procesando...' : `Actualizar a ${tierConfig.name}`}
                                    variant="primary"
                                    onPress={handlePurchase}
                                    disabled={purchasing || rcLoading || !packageToPurchase}
                                    loading={purchasing}
                                />
                                <Button
                                    label="Restaurar Compras"
                                    variant="secondary"
                                    onPress={async () => {
                                        setPurchasing(true);
                                        const result = await restorePurchases();
                                        setPurchasing(false);
                                        if (result.success) {
                                            Alert.alert('¡Éxito!', 'Tus compras han sido restauradas.');
                                            onClose();
                                        } else {
                                            Alert.alert('Error', 'No se encontraron compras para restaurar.');
                                        }
                                    }}
                                    disabled={purchasing}
                                />
                                <Button
                                    label="Cancelar"
                                    variant="ghost"
                                    onPress={onClose}
                                    disabled={purchasing}
                                />
                            </View>
                        </View>

                    </Pressable>
                </Animated.View>
            </Pressable >
        </Modal >
    );
};
