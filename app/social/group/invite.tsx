import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useSocialStore } from '@/store/socialStore';

export default function GroupInvite() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
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
            Alert.alert(t('common.error'), t('social.groups.searchError'));
        } finally {
            setIsSearching(false);
        }
    };

    const handleInvite = async (profileId: string) => {
        if (!groupId) return;

        setInvitingIds(prev => [...prev, profileId]);
        try {
            await inviteMember(groupId, profileId);
            Alert.alert(t('common.success'), t('social.groups.inviteSent'));
        } catch (error) {
            console.error('Invite error:', error);
            Alert.alert(t('common.error'), t('social.groups.inviteError'));
        } finally {
            setInvitingIds(prev => prev.filter(id => id !== profileId));
        }
    };

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1 px-6">
                {/* Header */}
                <View className="flex-row items-center py-4 mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h2" weight="bold" className="text-text text-2xl">
                        {t('social.groups.inviteTitle')}
                    </AccessibleText>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white/5 rounded-2xl px-4 py-2 mb-6 border border-white/10">
                    <Ionicons name="search" size={20} color={Colors[theme].textMuted} className="mr-2" />
                    <TextInput
                        placeholder={t('social.groups.searchPlaceholder')}
                        placeholderTextColor={Colors[theme].textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        className="flex-1 text-white text-base py-2"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {isSearching ? (
                        <ActivityIndicator size="small" color={Colors[theme].primary} />
                    ) : (
                        <TouchableOpacity onPress={handleSearch}>
                            <AccessibleText weight="bold" className="text-primary ml-2">
                                {t('common.search')}
                            </AccessibleText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results List */}
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        !isSearching && searchQuery ? (
                            <View className="items-center py-10">
                                <AccessibleText className="text-text-secondary">
                                    {t('social.groups.noUsersFound')}
                                </AccessibleText>
                            </View>
                        ) : null
                    )}
                    renderItem={({ item }) => (
                        <Card variant="glass" className="mb-4 flex-row items-center p-4">
                            <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-4">
                                <Ionicons name="person" size={24} color={Colors[theme].primary} />
                            </View>
                            <View className="flex-1">
                                <AccessibleText weight="bold" className="text-text text-lg">
                                    {item.name}
                                </AccessibleText>
                                <AccessibleText className="text-text-secondary text-sm">
                                    {item.email}
                                </AccessibleText>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleInvite(item.id)}
                                disabled={invitingIds.includes(item.id)}
                                className={`px-4 py-2 rounded-xl ${invitingIds.includes(item.id) ? 'bg-white/10' : 'bg-primary'}`}
                            >
                                {invitingIds.includes(item.id) ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <AccessibleText weight="bold" className="text-white text-sm">
                                        {t('social.groups.invite')}
                                    </AccessibleText>
                                )}
                            </TouchableOpacity>
                        </Card>
                    )}
                />
            </View>
        </ScreenWrapper>
    );
}
