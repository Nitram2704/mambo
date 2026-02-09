import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useSocialStore } from '@/store/socialStore';
import { useUserProfileStore } from '@/store/userProfileStore';

export default function SquadDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { activeGroup, members, loading, fetchGroupDetails, joinGroup } = useSocialStore();
    const { profile: currentUser } = useUserProfileStore();

    useEffect(() => {
        if (id) fetchGroupDetails(id);
    }, [id]);

    const isMember = members.some(m => m.profile_id === currentUser?.id);
    const [joinLoading, setJoinLoading] = useState(false);

    const handleJoin = async () => {
        if (!id) return;
        setJoinLoading(true);
        try {
            await joinGroup(id);
            await fetchGroupDetails(id);
        } catch (error) {
            console.error('Error joining group:', error);
        } finally {
            setJoinLoading(false);
        }
    };

    const isAdmin = members.some(m => m.profile_id === currentUser?.id && m.role === 'admin');

    if (loading || !activeGroup) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper safeArea={true}>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Header / Banner */}
                <View className="h-64 bg-surface-highlight relative">
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        className="absolute inset-0 z-10"
                    />
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-4 left-4 z-20 w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/10"
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>

                    <View className="absolute bottom-6 left-6 z-20 right-6">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <AccessibleText weight="black" className="text-white text-3xl uppercase tracking-tighter">
                                    {activeGroup.name}
                                </AccessibleText>
                                <View className="flex-row items-center mt-1">
                                    <View className="bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30 mr-2">
                                        <AccessibleText weight="bold" className="text-primary text-[10px]">{activeGroup.type.toUpperCase()}</AccessibleText>
                                    </View>
                                    <AccessibleText className="text-white/60 text-xs">{members.length} Miembros</AccessibleText>
                                </View>
                            </View>
                            {!isMember && (
                                <TouchableOpacity
                                    onPress={handleJoin}
                                    disabled={joinLoading}
                                    className="bg-primary px-6 py-2.5 rounded-xl shadow-glow"
                                >
                                    {joinLoading ? (
                                        <ActivityIndicator color="black" size="small" />
                                    ) : (
                                        <AccessibleText weight="black" className="text-black text-sm uppercase">Unirse</AccessibleText>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                <View className="px-6 py-6">
                    {/* Stats Row */}
                    <View className="flex-row gap-4 mb-8">
                        <Card variant="glass" className="flex-1 p-4 items-center border-white/5">
                            <AccessibleText weight="black" className="text-primary text-xl">0</AccessibleText>
                            <AccessibleText className="text-text-secondary text-[10px] uppercase tracking-widest">SQUAD XP</AccessibleText>
                        </Card>
                        <Card variant="glass" className="flex-1 p-4 items-center border-white/5">
                            <AccessibleText weight="black" className="text-warning text-xl">0</AccessibleText>
                            <AccessibleText className="text-text-secondary text-[10px] uppercase tracking-widest">WINS</AccessibleText>
                        </Card>
                    </View>

                    {/* Description */}
                    <View className="mb-8">
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-3">Sobre el Squad</AccessibleText>
                        <AccessibleText className="text-text text-base leading-6">
                            {activeGroup.description || 'Sin descripción.'}
                        </AccessibleText>
                    </View>

                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <View>
                                <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest">Miembros</AccessibleText>
                                <AccessibleText weight="bold" className="text-primary text-[10px] mt-0.5">{members.length} TOTAL</AccessibleText>
                            </View>
                            <View className="flex-row gap-3">
                                {isAdmin && (
                                    <TouchableOpacity
                                        onPress={() => router.push({ pathname: '/social/group/invite', params: { id } })}
                                        className="bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 flex-row items-center"
                                    >
                                        <Ionicons name="person-add" size={14} color={colors.primary} />
                                        <AccessibleText weight="bold" className="text-primary text-xs ml-1.5">Invitar</AccessibleText>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity>
                                    <AccessibleText weight="bold" className="text-text-secondary text-xs">Ver todos</AccessibleText>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {members.map((member) => (
                            <View key={member.profile_id} className="flex-row items-center mb-4 bg-surface-highlight/20 p-3 rounded-2xl border border-white/5">
                                <View className="w-10 h-10 rounded-full bg-surface-highlight items-center justify-center mr-3 border border-white/10">
                                    {member.profile?.avatar_url ? (
                                        <Image source={{ uri: member.profile.avatar_url }} className="w-full h-full rounded-full" />
                                    ) : (
                                        <Ionicons name="person" size={20} color={colors.textMuted} />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <AccessibleText weight="bold" className="text-text">{member.profile?.name || 'Usuario'}</AccessibleText>
                                    <AccessibleText className="text-text-secondary text-xs">{member.role.toUpperCase()}</AccessibleText>
                                </View>
                                {member.role === 'admin' && (
                                    <View className="bg-secondary/20 px-2 py-0.5 rounded-full">
                                        <AccessibleText weight="bold" className="text-secondary text-[8px]">ADMIN</AccessibleText>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Squad Feed Placeholder */}
                    <View>
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4">Actividad Reciente</AccessibleText>
                        <Card variant="glass" className="py-12 items-center border-dashed border-white/10">
                            <Ionicons name="flash-outline" size={32} color={colors.textMuted} className="mb-2" />
                            <AccessibleText className="text-text-secondary text-center">Únete para ver la actividad del Squad</AccessibleText>
                        </Card>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
