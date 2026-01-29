import React, { useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Image, Dimensions, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useSocialStore } from '@/store/socialStore';
import { useUserProfileStore } from '@/store/userProfileStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function GroupDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();

    const { activeGroup, members, wagers, fetchGroupDetails, searchUsers, inviteMember, createWager, fetchGroupPosts, fetchGroupMemberProgress, resolveWager, loading } = useSocialStore();

    const [showInviteModal, setShowInviteModal] = React.useState(false);
    const [showWagerModal, setShowWagerModal] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [isInviting, setIsInviting] = React.useState<string | null>(null);
    const [groupPosts, setGroupPosts] = React.useState<any[]>([]);
    const [memberProgress, setMemberProgress] = React.useState<Record<string, number>>({});

    // Wager form state
    const [wagerTitle, setWagerTitle] = React.useState('');
    const [wagerStake, setWagerStake] = React.useState('');
    const [wagerType, setWagerType] = React.useState<'consistency' | 'weight' | 'volume'>('consistency');
    const [wagerGoal, setWagerGoal] = React.useState('');
    const [isCreatingWager, setIsCreatingWager] = React.useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    useEffect(() => {
        if (id) {
            fetchGroupDetails(id);
            loadGroupData();
        }
    }, [id]);

    const loadGroupData = async () => {
        if (!id) return;
        const [posts, progress] = await Promise.all([
            fetchGroupPosts(id),
            fetchGroupMemberProgress(id)
        ]);
        setGroupPosts(posts);
        setMemberProgress(progress);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const results = await searchUsers(query);
        setSearchResults(results.filter(r => !members.some(m => m.profile_id === r.id)));
        setIsSearching(false);
    };

    const handleInvite = async (profileId: string) => {
        if (!id) return;
        setIsInviting(profileId);
        try {
            await inviteMember(id, profileId);
            Alert.alert(t('common.success'), t('social.groups.inviteSuccess'));
            setSearchResults(prev => prev.filter(r => r.id !== profileId));
        } catch (error) {
            Alert.alert(t('common.error'), t('social.groups.inviteError'));
        } finally {
            setIsInviting(null);
        }
    };

    const handleCreateWager = async () => {
        if (!id || !wagerTitle || !wagerStake || !wagerGoal) return;
        setIsCreatingWager(true);
        try {
            // Default end date to 7 days from now
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7);

            await createWager(id, wagerTitle, wagerStake, endDate, wagerType, parseFloat(wagerGoal));
            setShowWagerModal(false);
            setWagerTitle('');
            setWagerStake('');
            setWagerGoal('');
            Alert.alert(t('common.success'), t('social.wagers.createSuccess'));
        } catch (error) {
            Alert.alert(t('common.error'), t('social.wagers.createError'));
        } finally {
            setIsCreatingWager(false);
        }
    };

    const handleResolveWager = async (wagerId: string, winnerId: string) => {
        Alert.alert(
            t('social.wagers.resolveTitle'),
            t('social.wagers.resolveConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('social.wagers.resolveAction'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await useSocialStore.getState().resolveWager(wagerId, winnerId);
                            Alert.alert(t('common.success'), t('social.wagers.resolveSuccess'));
                        } catch (error) {
                            Alert.alert(t('common.error'), t('social.wagers.resolveError'));
                        }
                    }
                }
            ]
        );
    };

    if (!activeGroup || loading) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="flex-1 items-center justify-center">
                    <AccessibleText>Cargando...</AccessibleText>
                </View>
            </ScreenWrapper>
        );
    }


    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
                        >
                            <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                        </TouchableOpacity>
                        <View>
                            <AccessibleText variant="h2" weight="bold" className="text-text text-xl">
                                {activeGroup.name}
                            </AccessibleText>
                            <AccessibleText className="text-text-secondary text-xs">
                                {t(`social.groups.types.${activeGroup.type}`)}
                            </AccessibleText>
                        </View>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
                        <Ionicons name="settings-outline" size={22} color={Colors[theme].text} />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    {/* Progress Section */}
                    <View className="flex-row justify-between items-center mb-4 mt-2">
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest">
                            PROGRESO SEMANAL
                        </AccessibleText>
                        <TouchableOpacity
                            onPress={() => setShowInviteModal(true)}
                            className="flex-row items-center"
                        >
                            <Ionicons name="person-add-outline" size={16} color={Colors[theme].primary} className="mr-1" />
                            <AccessibleText weight="bold" className="text-primary text-xs">
                                {t('social.groups.invite')}
                            </AccessibleText>
                        </TouchableOpacity>
                    </View>
                    <Card variant="glass" className="mb-6 p-4">
                        {members.map((member, index) => {
                            const progress = memberProgress[member.profile_id] || 0;
                            const goal = 5; // Default goal
                            const percentage = Math.min((progress / goal) * 100, 100);

                            return (
                                <View key={member.profile_id} className="mb-4 last:mb-0">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <View className="flex-row items-center">
                                            <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-2">
                                                {member.profile?.avatar_url ? (
                                                    <Image source={{ uri: member.profile.avatar_url }} className="w-full h-full rounded-full" />
                                                ) : (
                                                    <AccessibleText weight="bold" className="text-primary text-xs">
                                                        {member.profile?.name?.charAt(0) || 'U'}
                                                    </AccessibleText>
                                                )}
                                            </View>
                                            <AccessibleText weight="medium" className="text-text">{member.profile?.name}</AccessibleText>
                                        </View>
                                        <AccessibleText weight="bold" className="text-primary">{progress}/{goal}</AccessibleText>
                                    </View>
                                    <View className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <LinearGradient
                                            colors={[Colors[theme].primary, Colors[theme].secondary]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{ width: `${percentage}%`, height: '100%', borderRadius: 4 }}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                    </Card>

                    {/* Wager Section */}
                    <View className="flex-row justify-between items-center mb-4">
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest">
                            {t('social.wagers.title')}
                        </AccessibleText>
                        <TouchableOpacity
                            onPress={() => setShowWagerModal(true)}
                            className="bg-primary/10 px-3 py-1 rounded-full"
                        >
                            <AccessibleText weight="bold" className="text-primary text-xs">+ {t('common.add')}</AccessibleText>
                        </TouchableOpacity>
                    </View>

                    {wagers.length === 0 ? (
                        <Card variant="glass" className="mb-6 p-6 items-center border-dashed border-white/10">
                            <Ionicons name="trophy-outline" size={32} color={Colors[theme].textMuted} className="mb-2" />
                            <AccessibleText className="text-text-secondary text-center text-xs">No hay retos activos.</AccessibleText>
                        </Card>
                    ) : (
                        wagers.map((wager) => (
                            <Card key={wager.id} variant="glass" className="mb-4 p-4">
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="flex-1">
                                        <View className="flex-row items-center">
                                            <Ionicons name="trophy" size={16} color={wager.status === 'active' ? Colors[theme].warning : Colors[theme].textMuted} className="mr-2" />
                                            <AccessibleText weight="bold" className="text-text text-base">{wager.title}</AccessibleText>
                                        </View>
                                        <AccessibleText className="text-text-secondary text-xs mt-1">{wager.stake}</AccessibleText>
                                    </View>
                                    <View className={`px-2 py-1 rounded-full ${wager.status === 'active' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                                        <AccessibleText weight="bold" className={`text-[10px] ${wager.status === 'active' ? 'text-green-500' : 'text-blue-500'}`}>
                                            {wager.status === 'active' ? 'ACTIVO' : 'COMPLETADO'}
                                        </AccessibleText>
                                    </View>
                                </View>

                                {wager.status === 'active' && (
                                    <View className="mt-3 pt-3 border-t border-white/5">
                                        <AccessibleText weight="bold" className="text-text-secondary text-[10px] mb-2 uppercase tracking-tighter">RESOLVER (SELECCIONAR GANADOR):</AccessibleText>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View className="flex-row gap-2">
                                                {members.map((member) => (
                                                    <TouchableOpacity
                                                        key={member.profile_id}
                                                        onPress={() => handleResolveWager(wager.id, member.profile_id)}
                                                        className="bg-white/5 px-3 py-1.5 rounded-lg flex-row items-center"
                                                    >
                                                        <View className="w-5 h-5 rounded-full bg-primary/20 items-center justify-center mr-2">
                                                            <AccessibleText weight="bold" className="text-primary text-[8px]">
                                                                {member.profile?.name?.charAt(0)}
                                                            </AccessibleText>
                                                        </View>
                                                        <AccessibleText className="text-text text-[10px]">{member.profile?.name}</AccessibleText>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                )}

                                {wager.status === 'completed' && wager.winner_id && (
                                    <View className="mt-2 flex-row items-center bg-yellow-500/10 p-2 rounded-lg">
                                        <Ionicons name="ribbon" size={16} color="#fbbf24" className="mr-2" />
                                        <AccessibleText className="text-yellow-500 text-xs font-bold">
                                            Ganador: {members.find(m => m.profile_id === wager.winner_id)?.profile?.name || 'Usuario'}
                                        </AccessibleText>
                                    </View>
                                )}
                            </Card>
                        ))
                    )}

                    {/* Proof Gallery */}
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4">
                        GALERÍA DE PRUEBAS
                    </AccessibleText>
                    <View className="flex-row flex-wrap gap-2 pb-10">
                        {groupPosts.length === 0 ? (
                            <View className="w-full py-10 items-center">
                                <Ionicons name="images-outline" size={32} color={Colors[theme].textMuted} className="mb-2" />
                                <AccessibleText className="text-text-secondary text-xs">No hay pruebas compartidas aún</AccessibleText>
                            </View>
                        ) : (
                            groupPosts.map((post) => (
                                <TouchableOpacity
                                    key={post.id}
                                    onPress={() => router.push({ pathname: '/social/post/[id]' as any, params: { id: post.id } })}
                                    style={{ width: (width - 48 - 16) / 3 }}
                                    className="aspect-square bg-white/5 rounded-xl overflow-hidden"
                                >
                                    <Image
                                        source={{ uri: post.media_url }}
                                        className="w-full h-full"
                                    />
                                    <View className="absolute bottom-1 right-1 bg-black/50 px-1 rounded">
                                        <AccessibleText className="text-white text-[8px]">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </AccessibleText>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* Invite Member Modal */}
                <Modal
                    visible={showInviteModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowInviteModal(false)}
                >
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-[#1a1a2e] rounded-t-[40px] h-[80%] p-8 border-t border-blue-500/20">
                            <View className="flex-row justify-between items-center mb-6">
                                <AccessibleText className="text-white text-2xl font-bold">
                                    {t('social.groups.invite')}
                                </AccessibleText>
                                <TouchableOpacity
                                    onPress={() => setShowInviteModal(false)}
                                    className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            <View className="bg-white/5 flex-row items-center px-4 py-3 rounded-2xl mb-6">
                                <Ionicons name="search" size={20} color={Colors[theme].textMuted} className="mr-3" />
                                <TextInput
                                    placeholder={t('social.groups.searchPlaceholder')}
                                    placeholderTextColor={Colors[theme].textMuted}
                                    value={searchQuery}
                                    onChangeText={handleSearch}
                                    className="flex-1 text-white text-base"
                                    autoCapitalize="none"
                                />
                                {isSearching && <ActivityIndicator size="small" color={Colors[theme].primary} />}
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                {searchResults.map((user) => (
                                    <View key={user.id} className="flex-row items-center justify-between py-4 border-b border-white/5">
                                        <View className="flex-row items-center">
                                            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                                                <AccessibleText weight="bold" className="text-primary">
                                                    {user.name?.charAt(0) || 'U'}
                                                </AccessibleText>
                                            </View>
                                            <AccessibleText weight="medium" className="text-text">{user.name}</AccessibleText>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleInvite(user.id)}
                                            disabled={isInviting === user.id}
                                            className="bg-primary/10 px-4 py-2 rounded-xl"
                                        >
                                            {isInviting === user.id ? (
                                                <ActivityIndicator size="small" color={Colors[theme].primary} />
                                            ) : (
                                                <AccessibleText weight="bold" className="text-primary text-sm">
                                                    {t('social.groups.invite')}
                                                </AccessibleText>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
                                    <AccessibleText className="text-text-secondary text-center py-10">
                                        No se encontraron usuarios
                                    </AccessibleText>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Create Wager Modal */}
                <Modal
                    visible={showWagerModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowWagerModal(false)}
                >
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-[#1a1a2e] rounded-t-[40px] h-[70%] p-8 border-t border-blue-500/20">
                            <View className="flex-row justify-between items-center mb-6">
                                <AccessibleText className="text-white text-2xl font-bold">
                                    {t('social.wagers.createTitle')}
                                </AccessibleText>
                                <TouchableOpacity
                                    onPress={() => setShowWagerModal(false)}
                                    className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 px-1">
                                    TIPO DE RETO
                                </AccessibleText>
                                <View className="mb-6">
                                    <TouchableOpacity
                                        onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex-row items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10"
                                    >
                                        <View className="flex-row items-center">
                                            <Ionicons
                                                name={wagerType === 'consistency' ? 'calendar' : wagerType === 'weight' ? 'scale' : 'barbell'}
                                                size={20}
                                                color={Colors[theme].warning}
                                                className="mr-3"
                                            />
                                            <AccessibleText className="text-white text-base">
                                                {t(`social.wagers.types.${wagerType}`)}
                                            </AccessibleText>
                                        </View>
                                        <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color={Colors[theme].textMuted} />
                                    </TouchableOpacity>

                                    {isDropdownOpen && (
                                        <View className="bg-[#1a1a2e] border border-white/10 rounded-2xl mt-2 overflow-hidden">
                                            {(['consistency', 'weight', 'volume'] as const).map((type) => (
                                                <TouchableOpacity
                                                    key={type}
                                                    onPress={() => {
                                                        setWagerType(type);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`flex-row items-center p-4 border-b border-white/5 last:border-0 ${wagerType === type ? 'bg-white/5' : ''}`}
                                                >
                                                    <Ionicons
                                                        name={type === 'consistency' ? 'calendar' : type === 'weight' ? 'scale' : 'barbell'}
                                                        size={20}
                                                        color={wagerType === type ? Colors[theme].warning : Colors[theme].textMuted}
                                                        className="mr-3"
                                                    />
                                                    <AccessibleText className={`text-base ${wagerType === type ? 'text-warning font-bold' : 'text-text-secondary'}`}>
                                                        {t(`social.wagers.types.${type}`)}
                                                    </AccessibleText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 px-1">
                                    TÍTULO DEL RETO
                                </AccessibleText>
                                <TextInput
                                    placeholder={t('social.wagers.titlePlaceholder')}
                                    placeholderTextColor={Colors[theme].textMuted}
                                    value={wagerTitle}
                                    onChangeText={setWagerTitle}
                                    className="bg-white/5 p-4 rounded-2xl text-white text-base mb-6"
                                />

                                <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 px-1">
                                    META (EJ: 5 DÍAS, 2KG, 10T)
                                </AccessibleText>
                                <TextInput
                                    placeholder="0"
                                    placeholderTextColor={Colors[theme].textMuted}
                                    value={wagerGoal}
                                    onChangeText={setWagerGoal}
                                    keyboardType="numeric"
                                    className="bg-white/5 p-4 rounded-2xl text-white text-base mb-6"
                                />

                                <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 px-1">
                                    PREMIO / CASTIGO
                                </AccessibleText>
                                <TextInput
                                    placeholder={t('social.wagers.stakePlaceholder')}
                                    placeholderTextColor={Colors[theme].textMuted}
                                    value={wagerStake}
                                    onChangeText={setWagerStake}
                                    className="bg-white/5 p-4 rounded-2xl text-white text-base mb-6"
                                />

                                <AccessibleText className="text-text-secondary text-sm italic px-1">
                                    * El reto durará 7 días a partir de hoy.
                                </AccessibleText>
                            </ScrollView>

                            <TouchableOpacity
                                onPress={handleCreateWager}
                                disabled={isCreatingWager || !wagerTitle || !wagerStake}
                                className="mt-4"
                            >
                                <LinearGradient
                                    colors={['#f59e0b', '#fbbf24']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className={`rounded-2xl py-4 items-center shadow-lg shadow-warning/30 ${isCreatingWager || !wagerTitle || !wagerStake ? 'opacity-50' : ''}`}
                                >
                                    {isCreatingWager ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <AccessibleText className="text-white text-lg font-bold">
                                            {t('social.wagers.createButton')}
                                        </AccessibleText>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScreenWrapper>
    );
}
