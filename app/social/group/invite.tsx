import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useSocialStore } from '@/store/socialStore';

export default function GroupInvite() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { id: groupId } = useLocalSearchParams<{ id: string }>();

    const { searchUsers, inviteMember, loading: socialLoading } = useSocialStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [invitingIds, setInvitingIds] = useState<string[]>([]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const results = await searchUsers(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert(t('common.error'), 'Error al buscar usuarios');
        } finally {
            setIsSearching(false);
        }
    };

    const handleInvite = async (profileId: string) => {
        if (!groupId) return;

        setInvitingIds(prev => [...prev, profileId]);
        try {
            await inviteMember(groupId, profileId);
            Alert.alert(t('common.success'), 'Invitación enviada');
        } catch (error) {
            console.error('Invite error:', error);
            Alert.alert(t('common.error'), 'Error al enviar invitación');
        } finally {
            setInvitingIds(prev => prev.filter(id => id !== profileId));
        }
    };

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1 px-6">
                {/* Header */}
                <View className="flex-row items-center justify-between py-4 mb-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/5 rounded-full items-center justify-center"
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h1" weight="black" className="text-text tracking-tighter">
                        {t('social.groups.inviteTitle')}
                    </AccessibleText>
                    <View className="w-10" />
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-surface-highlight/30 rounded-2xl px-4 py-3 mb-8 border border-white/5">
                    <Ionicons name="search" size={20} color={colors.textMuted} className="mr-3" />
                    <TextInput
                        placeholder={t('social.groups.searchPlaceholder')}
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        className="flex-1 text-white text-base"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {isSearching ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <TouchableOpacity onPress={handleSearch} className="bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20">
                            <AccessibleText weight="bold" className="text-primary text-xs">
                                {t('common.search').toUpperCase()}
                            </AccessibleText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results List */}
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={() => (
                        !isSearching && searchQuery ? (
                            <View className="items-center py-20 bg-surface-highlight/10 rounded-3xl border border-dashed border-white/5">
                                <Ionicons name="person-outline" size={48} color={colors.textMuted} className="mb-4" />
                                <AccessibleText className="text-text-secondary text-center px-10">
                                    No encontramos a nadie con ese nombre o email.
                                </AccessibleText>
                            </View>
                        ) : null
                    )}
                    renderItem={({ item }) => (
                        <Card variant="glass" className="mb-4 flex-row items-center p-4 border-white/5">
                            <View className="w-12 h-12 rounded-full bg-surface-highlight items-center justify-center mr-4 border border-white/10">
                                {item.avatar_url ? (
                                    <Image source={{ uri: item.avatar_url }} className="w-full h-full rounded-full" />
                                ) : (
                                    <Ionicons name="person" size={24} color={colors.primary} />
                                )}
                            </View>
                            <View className="flex-1">
                                <AccessibleText weight="bold" className="text-text text-lg">
                                    {item.name}
                                </AccessibleText>
                                <AccessibleText className="text-text-secondary text-xs">
                                    {item.email}
                                </AccessibleText>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleInvite(item.id)}
                                disabled={invitingIds.includes(item.id)}
                                className={`overflow-hidden rounded-xl ${invitingIds.includes(item.id) ? 'bg-white/10' : 'shadow-glow'}`}
                            >
                                <LinearGradient
                                    colors={invitingIds.includes(item.id) ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)'] : Colors.gradients.primary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="px-4 py-2"
                                >
                                    {invitingIds.includes(item.id) ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <AccessibleText weight="black" className="text-black text-xs uppercase">
                                            {t('social.groups.invite')}
                                        </AccessibleText>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Card>
                    )}
                />
            </View>
        </ScreenWrapper>
    );
}
