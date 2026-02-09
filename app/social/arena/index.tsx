import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSocialStore } from '@/store/socialStore';

export default function ArenaDashboard() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { t } = useTranslation();
    const {
        wagers,
        challenges,
        leaderboard,
        loading,
        fetchWagers,
        fetchChallenges,
        fetchLeaderboard
    } = useSocialStore();

    const [activeTab, setActiveTab] = useState<'wagers' | 'leaderboard'>('wagers');

    React.useEffect(() => {
        fetchWagers();
        fetchChallenges();
        fetchLeaderboard();
    }, []);

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1 px-6">
                <View className="flex-row items-center justify-between py-4">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h1" weight="black" className="text-text tracking-tighter">
                        {t('social.arena.title')}
                    </AccessibleText>
                    <View className="w-10" />
                </View>

                {/* Tabs */}
                <View className="flex-row bg-surface/50 p-1 rounded-2xl border border-white/5 mb-6">
                    <TouchableOpacity
                        onPress={() => setActiveTab('wagers')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'wagers' ? 'bg-primary/10' : ''}`}
                    >
                        <AccessibleText weight={activeTab === 'wagers' ? 'bold' : 'medium'} className={activeTab === 'wagers' ? 'text-primary' : 'text-text-secondary'}>
                            {t('social.arena.wagers')}
                        </AccessibleText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('leaderboard')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'leaderboard' ? 'bg-primary/10' : ''}`}
                    >
                        <AccessibleText weight={activeTab === 'leaderboard' ? 'bold' : 'medium'} className={activeTab === 'leaderboard' ? 'text-primary' : 'text-text-secondary'}>
                            {t('social.arena.leaderboard')}
                        </AccessibleText>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    {loading ? (
                        <View className="py-20">
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : activeTab === 'wagers' ? (
                        <View>
                            {wagers.length === 0 ? (
                                <Card variant="glass" className="mb-6 p-10 items-center border-dashed border-white/10">
                                    <Ionicons name="flame-outline" size={32} color={colors.textMuted} className="mb-2" />
                                    <AccessibleText className="text-text-secondary text-center">No hay apuestas activas en tus squads.</AccessibleText>
                                </Card>
                            ) : (
                                wagers.map((wager) => (
                                    <Card key={wager.id} variant="glass" className="mb-4 border-primary/30 overflow-hidden">
                                        <LinearGradient
                                            colors={[colors.primary + '20', 'transparent']}
                                            className="p-6"
                                        >
                                            <View className="flex-row justify-between items-center mb-4">
                                                <View className="bg-primary/20 p-2 rounded-full">
                                                    <Ionicons name="flame" size={24} color={colors.primary} />
                                                </View>
                                                <View className="bg-white/10 px-3 py-1 rounded-full">
                                                    <AccessibleText weight="bold" className="text-white text-[10px]">{wager.status.toUpperCase()}</AccessibleText>
                                                </View>
                                            </View>
                                            <AccessibleText weight="black" className="text-white text-xl uppercase mb-1">{wager.title}</AccessibleText>
                                            <AccessibleText className="text-text-secondary text-sm mb-4">En {wager.social_groups?.name || 'Squad'}</AccessibleText>
                                            <View className="flex-row justify-between items-end">
                                                <View>
                                                    <AccessibleText className="text-text-secondary text-[10px] uppercase tracking-widest">STAKE</AccessibleText>
                                                    <AccessibleText weight="bold" className="text-warning">{wager.stake}</AccessibleText>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => { }} // Could go to wager details
                                                    className="bg-primary px-4 py-2 rounded-lg"
                                                >
                                                    <AccessibleText weight="bold" className="text-black text-xs">{t('social.arena.details')}</AccessibleText>
                                                </TouchableOpacity>
                                            </View>
                                        </LinearGradient>
                                    </Card>
                                ))
                            )}

                            <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4 ml-1">
                                {t('social.arena.globalChallenges')}
                            </AccessibleText>

                            {challenges.length === 0 ? (
                                <Card variant="glass" className="p-10 items-center border-dashed border-white/10">
                                    <AccessibleText className="text-text-secondary text-center italic">No hay retos globales disponibles.</AccessibleText>
                                </Card>
                            ) : (
                                challenges.map((challenge) => (
                                    <Card key={challenge.id} variant="glass" className="mb-4 border-white/5 overflow-hidden">
                                        <LinearGradient
                                            colors={[colors.secondary + '10', 'transparent']}
                                            className="p-4"
                                        >
                                            <View className="flex-row items-center">
                                                <View className="w-14 h-14 bg-secondary/10 rounded-2xl items-center justify-center mr-4 border border-secondary/20">
                                                    <Ionicons name="flash" size={28} color={colors.secondary} />
                                                </View>
                                                <View className="flex-1">
                                                    <AccessibleText weight="black" className="text-white text-base uppercase">{challenge.title}</AccessibleText>
                                                    <AccessibleText className="text-text-secondary text-xs mb-2">{challenge.description}</AccessibleText>
                                                    <View className="flex-row items-center">
                                                        <View className="bg-secondary/20 px-2 py-0.5 rounded-md mr-3">
                                                            <AccessibleText weight="bold" className="text-secondary text-[10px]">+{challenge.reward_xp} XP</AccessibleText>
                                                        </View>
                                                        <AccessibleText className="text-text-muted text-[10px]">Expira en 3 días</AccessibleText>
                                                    </View>
                                                </View>
                                                <TouchableOpacity className="bg-secondary px-3 py-1.5 rounded-lg ml-2">
                                                    <AccessibleText weight="bold" className="text-black text-[10px] uppercase">Participar</AccessibleText>
                                                </TouchableOpacity>
                                            </View>
                                        </LinearGradient>
                                    </Card>
                                ))
                            )}
                        </View>
                    ) : (
                        <View>
                            {leaderboard.length === 0 ? (
                                <AccessibleText className="text-text-muted text-center py-10">No hay usuarios en el ranking aún.</AccessibleText>
                            ) : (
                                leaderboard.map((user, index) => (
                                    <View key={user.id} className="flex-row items-center mb-4 bg-surface-highlight/20 p-4 rounded-2xl border border-white/5">
                                        <AccessibleText weight="black" className={`text-lg mr-4 ${index === 0 ? 'text-warning' : 'text-text-secondary'}`}>
                                            #{index + 1}
                                        </AccessibleText>
                                        <View className="w-10 h-10 rounded-full bg-surface-highlight items-center justify-center mr-3 border border-white/10">
                                            {user.avatar_url ? (
                                                <Image source={{ uri: user.avatar_url }} className="w-full h-full rounded-full" />
                                            ) : (
                                                <Ionicons name="person" size={20} color={colors.textMuted} />
                                            )}
                                        </View>
                                        <View className="flex-1">
                                            <AccessibleText weight="bold" className="text-text">{user.name}</AccessibleText>
                                            <AccessibleText className="text-text-secondary text-xs">{user.xp || 0} XP</AccessibleText>
                                        </View>
                                        {index < 3 && (
                                            <Ionicons
                                                name="medal"
                                                size={20}
                                                color={index === 0 ? colors.warning : index === 1 ? '#e5e7eb' : '#d97706'}
                                            />
                                        )}
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
