import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/Colors';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/constants/SubscriptionConfig';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useAppTheme } from '@/hooks/use-app-theme';

interface PaywallModalProps {
    visible: boolean;
    onClose: () => void;
    triggerFeature: string;
    requiredTier: SubscriptionTier;
}

export function PaywallModal({ visible, onClose, triggerFeature, requiredTier }: PaywallModalProps) {
    const { theme } = useAppTheme();
    const { setTier } = useSubscriptionStore();
    const tierConfig = SUBSCRIPTION_TIERS[requiredTier];
    const isElite = requiredTier === 'ELITE';

    const handleUpgrade = async () => {
        // Mock upgrade for now
        await setTier(requiredTier);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/80">
                <View className="h-[85%] bg-surface rounded-t-3xl overflow-hidden border-t border-white/10">
                    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                        {/* Header */}
                        <View className="items-center mb-8">
                            <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${isElite ? 'bg-warning/20' : 'bg-secondary/20'}`}>
                                <Icon
                                    name={isElite ? "sparkles" : "star"}
                                    size={32}
                                    color={isElite ? Colors[theme].warning : Colors[theme].secondary}
                                />
                            </View>
                            <Text className="text-text text-2xl font-black text-center mb-2">
                                Desbloquea {triggerFeature}
                            </Text>
                            <Text className="text-text-secondary text-center">
                                Esta función es exclusiva para miembros <Text style={{ color: isElite ? Colors[theme].warning : Colors[theme].secondary, fontWeight: '900' }}>{tierConfig.name.toUpperCase()}</Text>.
                            </Text>
                        </View>

                        {/* Feature Comparison */}
                        <View className="bg-surface-highlight/30 rounded-2xl p-4 mb-8 border border-white/5">
                            <Text className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-4 text-center">
                                LO QUE OBTIENES CON {tierConfig.name.toUpperCase()}
                            </Text>

                            {/* Dynamic Features List based on Tier */}
                            <FeatureRow
                                icon="scan"
                                text="Escáner de Código de Barras"
                                included={true}
                            />
                            <FeatureRow
                                icon="chatbubble-ellipses"
                                text={isElite ? "Chat Ilimitado con Mambo Coach" : "50 Mensajes Diarios con Coach"}
                                included={true}
                            />
                            <FeatureRow
                                icon="videocam"
                                text={isElite ? "Análisis de Video Ilimitado" : "5 Análisis de Video al Mes"}
                                included={true}
                            />
                            <FeatureRow
                                icon="construct"
                                text="Acciones de Agente (Rutinas, Dieta)"
                                included={true}
                            />
                            {isElite && (
                                <FeatureRow
                                    icon="nutrition"
                                    text="IA Nutricionista (Foto a Macros)"
                                    included={true}
                                />
                            )}
                        </View>

                        {/* Pricing */}
                        <View className="items-center mb-8">
                            <Text className="text-text text-4xl font-black">
                                {tierConfig.price}
                            </Text>
                            <Text className="text-text-muted text-xs mt-1">
                                Cancela cuando quieras. Sin compromisos.
                            </Text>
                        </View>

                        {/* Actions */}
                        <Button
                            onPress={handleUpgrade}
                            variant={isElite ? 'primary' : 'secondary'}
                            label={`OBTENER ${tierConfig.name.toUpperCase()}`}
                            size="lg"
                            className="mb-4"
                        />
                        <TouchableOpacity onPress={onClose} className="py-3 items-center">
                            <Text className="text-text-muted font-bold text-sm">Ahora no, gracias</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function FeatureRow({ icon, text, included }: { icon: string; text: string; included: boolean }) {
    const { theme } = useAppTheme();
    return (
        <View className="flex-row items-center mb-3">
            <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${included ? 'bg-success/20' : 'bg-white/5'}`}>
                <Icon name={included ? "checkmark" : "close"} size={12} color={included ? Colors[theme].success : Colors[theme].textMuted} />
            </View>
            <View className="flex-1 flex-row items-center">
                <Icon name={icon as any} size={14} color={Colors[theme].textSecondary} />
                <Text className="text-text ml-2 text-sm font-medium flex-1">{text}</Text>
            </View>
        </View>
    );
}
