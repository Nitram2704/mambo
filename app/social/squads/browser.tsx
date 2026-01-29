import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

export default function SquadBrowserScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const [searchQuery, setSearchQuery] = useState('');

    const squads = [
        { id: '1', name: 'CrossFit Spain', members: 450, xp: 89000, privacy: 'public' },
        { id: '2', name: 'Elite Lifters', members: 120, xp: 45000, privacy: 'private' },
        { id: '3', name: 'Mambo Warriors', members: 128, xp: 15400, privacy: 'public' },
        { id: '4', name: 'Morning Grinders', members: 85, xp: 12000, privacy: 'public' },
    ];

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1 px-6">
                <View className="flex-row items-center justify-between py-4">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <AccessibleText weight="black" className="text-text text-xl uppercase tracking-widest">
                        Explorar Squads
                    </AccessibleText>
                    <TouchableOpacity
                        onPress={() => router.push('/social/squads/create')}
                        className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center border border-primary/20"
                    >
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-surface-highlight/30 flex-row items-center px-4 py-3 rounded-2xl border border-white/5 mb-6">
                    <Ionicons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Buscar Squads..."
                        placeholderTextColor={colors.textMuted}
                        className="flex-1 ml-3 text-white text-base"
                    />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4 ml-1">
                        Squads Recomendados
                    </AccessibleText>

                    {squads.map((squad) => (
                        <TouchableOpacity
                            key={squad.id}
                            onPress={() => router.push({ pathname: '/social/squads/[id]', params: { id: squad.id } })}
                            className="mb-4"
                        >
                            <Card variant="glass" className="p-4 flex-row items-center border-white/5">
                                <View className="w-14 h-14 bg-surface-highlight rounded-2xl items-center justify-center mr-4 border border-white/10">
                                    <Ionicons
                                        name={squad.privacy === 'private' ? 'lock-closed' : 'people'}
                                        size={24}
                                        color={squad.privacy === 'private' ? colors.textMuted : colors.primary}
                                    />
                                </View>
                                <View className="flex-1">
                                    <AccessibleText weight="bold" className="text-text text-lg">{squad.name}</AccessibleText>
                                    <View className="flex-row items-center mt-1">
                                        <AccessibleText className="text-text-secondary text-xs">{squad.members} Miembros</AccessibleText>
                                        <View className="w-1 h-1 bg-white/20 rounded-full mx-2" />
                                        <AccessibleText weight="bold" className="text-primary text-xs">{squad.xp} XP</AccessibleText>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                            </Card>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
