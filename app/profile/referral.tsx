import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useUserProfileStore } from '@/store/userProfileStore';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

export default function ReferralScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const { profile } = useUserProfileStore();
    const [copied, setCopied] = useState(false);

    const referralCode = profile?.referralCode || 'MAMBO123'; // Fallback for UI demo
    const shareUrl = `https://mambofitness.app/join?code=${referralCode}`;

    const handleCopy = async () => {
        await Clipboard.setStringAsync(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: t('profile.referral.shareMessage', { code: referralCode, url: shareUrl }),
                url: shareUrl,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h1" weight="bold" className="text-text text-2xl">
                        {t('profile.referral.title', 'Invita a un Amigo')}
                    </AccessibleText>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    {/* Hero Card */}
                    <Card variant="glass" className="p-8 items-center mb-8 overflow-hidden">
                        <LinearGradient
                            colors={['#3b82f6', '#8b5cf6']}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4 }}
                        />
                        <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-6">
                            <Ionicons name="gift" size={40} color={Colors[theme].primary} />
                        </View>
                        <AccessibleText variant="h2" weight="bold" className="text-text text-2xl text-center mb-2">
                            {t('profile.referral.heroTitle', 'Gana 1 Mes de PRO Gratis')}
                        </AccessibleText>
                        <AccessibleText className="text-text-secondary text-center mb-8">
                            {t('profile.referral.heroDesc', 'Invita a tus amigos a Mambo. Cuando se registren, ambos obtendrán beneficios exclusivos.')}
                        </AccessibleText>

                        <View className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 flex-row items-center justify-between mb-6">
                            <View>
                                <AccessibleText className="text-text-secondary text-xs uppercase tracking-widest mb-1">
                                    {t('profile.referral.yourCode', 'TU CÓDIGO')}
                                </AccessibleText>
                                <AccessibleText weight="bold" className="text-text text-2xl tracking-widest">
                                    {referralCode}
                                </AccessibleText>
                            </View>
                            <TouchableOpacity
                                onPress={handleCopy}
                                className={`w-12 h-12 rounded-xl items-center justify-center ${copied ? 'bg-green-500/20' : 'bg-primary/20'}`}
                            >
                                <Ionicons
                                    name={copied ? "checkmark" : "copy-outline"}
                                    size={24}
                                    color={copied ? "#22c55e" : Colors[theme].primary}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={handleShare}
                            className="w-full"
                        >
                            <LinearGradient
                                colors={['#3b82f6', '#60a5fa']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-2xl py-4 items-center shadow-lg shadow-blue-500/30"
                            >
                                <AccessibleText weight="bold" className="text-white text-lg">
                                    {t('profile.referral.shareButton', 'Compartir Enlace')}
                                </AccessibleText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Card>

                    {/* How it works */}
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4 px-1">
                        {t('profile.referral.howItWorks', 'CÓMO FUNCIONA')}
                    </AccessibleText>

                    <View className="mb-8">
                        {[
                            { icon: 'share-social', title: 'Comparte tu código', desc: 'Envía tu código único a tus amigos.' },
                            { icon: 'person-add', title: 'Ellos se unen', desc: 'Tus amigos se registran usando tu código.' },
                            { icon: 'sparkles', title: 'Ambos ganan', desc: 'Recibes 1 mes de PRO por cada amigo que se suscriba.' },
                        ].map((step, i) => (
                            <View key={i} className="flex-row items-start mb-6">
                                <View className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4 border border-white/10">
                                    <Ionicons name={step.icon as any} size={20} color={Colors[theme].primary} />
                                </View>
                                <View className="flex-1">
                                    <AccessibleText weight="bold" className="text-text text-base">{step.title}</AccessibleText>
                                    <AccessibleText className="text-text-secondary text-sm">{step.desc}</AccessibleText>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Stats Card */}
                    <Card variant="glass" className="p-6 mb-10">
                        <AccessibleText weight="bold" className="text-text mb-4">
                            {t('profile.referral.statsTitle', 'Tus Referidos')}
                        </AccessibleText>
                        <View className="flex-row justify-between">
                            <View className="items-center flex-1">
                                <AccessibleText weight="bold" className="text-text text-2xl">0</AccessibleText>
                                <AccessibleText className="text-text-secondary text-xs">Invitados</AccessibleText>
                            </View>
                            <View className="w-[1px] h-full bg-white/5" />
                            <View className="items-center flex-1">
                                <AccessibleText weight="bold" className="text-text text-2xl">0</AccessibleText>
                                <AccessibleText className="text-text-secondary text-xs">Completados</AccessibleText>
                            </View>
                            <View className="w-[1px] h-full bg-white/5" />
                            <View className="items-center flex-1">
                                <AccessibleText weight="bold" className="text-text text-2xl">0</AccessibleText>
                                <AccessibleText className="text-text-secondary text-xs">Meses PRO</AccessibleText>
                            </View>
                        </View>
                    </Card>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
