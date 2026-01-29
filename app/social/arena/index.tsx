import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function ArenaDashboard() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const [activeTab, setActiveTab] = useState<'wagers' | 'leaderboard'>('wagers');

    const leaderboard = [
        { id: '1', name: 'Martin G.', xp: 15400, rank: 1, trend: 'up' },
        { id: '2', name: 'Alex R.', xp: 14200, rank: 2, trend: 'down' },
        { id: '3', name: 'Sofia L.', xp: 12800, rank: 3, trend: 'stable' },
    ];

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1 px-6">
                <View className="flex-row items-center justify-between py-4">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <AccessibleText weight="black" className="text-text text-xl uppercase tracking-widest">
                        The Arena
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
                            Wagers
                        </AccessibleText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('leaderboard')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'leaderboard' ? 'bg-primary/10' : ''}`}
                    >
                        <AccessibleText weight={activeTab === 'leaderboard' ? 'bold' : 'medium'} className={activeTab === 'leaderboard' ? 'text-primary' : 'text-text-secondary'}>
                            Leaderboard
                        </AccessibleText>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    {activeTab === 'wagers' ? (
                        <View>
                            <Card variant="glass" className="mb-6 border-primary/30 overflow-hidden">
                                <LinearGradient
                                    colors={[colors.primary + '20', 'transparent']}
                                    className="p-6"
                                >
                                    <View className="flex-row justify-between items-center mb-4">
                                        <View className="bg-primary/20 p-2 rounded-full">
                                            <Ionicons name="flame" size={24} color={colors.primary} />
                                        </View>
                                        <View className="bg-white/10 px-3 py-1 rounded-full">
                                            <AccessibleText weight="bold" className="text-white text-[10px]">ACTIVE</AccessibleText>
                                        </View>
                                    </View>
                                    <AccessibleText weight="black" className="text-white text-xl uppercase mb-1">Consistency King</AccessibleText>
                                    <AccessibleText className="text-text-secondary text-sm mb-4">5 entrenamientos esta semana</AccessibleText>
                                    <View className="flex-row justify-between items-end">
                                        <View>
                                            <AccessibleText className="text-text-secondary text-[10px] uppercase tracking-widest">STAKE</AccessibleText>
                                            <AccessibleText weight="bold" className="text-warning">Cena pagada 🍕</AccessibleText>
                                        </View>
                                        <TouchableOpacity className="bg-primary px-4 py-2 rounded-lg">
                                            <AccessibleText weight="bold" className="text-black text-xs">DETALLES</AccessibleText>
                                        </TouchableOpacity>
                                    </View>
                                </LinearGradient>
                            </Card>

                            <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4 ml-1">
                                Retos Globales
                            </AccessibleText>
                            <Card variant="glass" className="p-4 mb-4 border-white/5">
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 bg-secondary/20 rounded-xl items-center justify-center mr-4">
                                        <Ionicons name="trophy" size={24} color={colors.secondary} />
                                    </View>
                                    <View className="flex-1">
                                        <AccessibleText weight="bold" className="text-text">Mambo 10k Volume</AccessibleText>
                                        <AccessibleText className="text-text-secondary text-xs">Mueve 10,000kg en un día</AccessibleText>
                                    </View>
                                    <View className="items-end">
                                        <AccessibleText weight="bold" className="text-secondary">+500 XP</AccessibleText>
                                    </View>
                                </View>
                            </Card>
                        </View>
                    ) : (
                        <View>
                            {leaderboard.map((user) => (
                                <View key={user.id} className="flex-row items-center mb-4 bg-surface-highlight/20 p-4 rounded-2xl border border-white/5">
                                    <AccessibleText weight="black" className={`text-lg mr-4 ${user.rank === 1 ? 'text-warning' : 'text-text-secondary'}`}>
                                        #{user.rank}
                                    </AccessibleText>
                                    <View className="w-10 h-10 rounded-full bg-surface-highlight items-center justify-center mr-3 border border-white/10">
                                        <Ionicons name="person" size={20} color={colors.textMuted} />
                                    </View>
                                    <View className="flex-1">
                                        <AccessibleText weight="bold" className="text-text">{user.name}</AccessibleText>
                                        <AccessibleText className="text-text-secondary text-xs">{user.xp} XP</AccessibleText>
                                    </View>
                                    <Ionicons
                                        name={user.trend === 'up' ? 'trending-up' : user.trend === 'down' ? 'trending-down' : 'remove'}
                                        size={20}
                                        color={user.trend === 'up' ? '#22c55e' : user.trend === 'down' ? '#ef4444' : colors.textMuted}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
