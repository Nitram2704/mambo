import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, RefreshControl, Image, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useSocialStore } from '@/store/socialStore';
import { useCoachStore } from '@/store/coachStore';
import { useUserProfileStore } from '@/store/userProfileStore';

type SocialTab = 'feed' | 'groups' | 'coaching';

export default function SocialHub() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const [activeTab, setActiveTab] = useState<SocialTab>('feed');

    const { profile } = useUserProfileStore();
    const { feed, fetchFeed, groups, fetchGroups, createPost, uploadMedia, toggleLike, loading: socialLoading } = useSocialStore();
    const { clients, fetchClients, myCoach, fetchMyCoach, loading: coachLoading } = useCoachStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [caption, setCaption] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [isWorkoutProof, setIsWorkoutProof] = useState(false);

    useEffect(() => {
        if (activeTab === 'feed') fetchFeed();
        if (activeTab === 'groups') fetchGroups();
        if (activeTab === 'coaching') {
            if (profile?.role === 'coach') fetchClients();
            else fetchMyCoach();
        }
    }, [activeTab]);

    const onRefresh = () => {
        if (activeTab === 'feed') fetchFeed();
        if (activeTab === 'groups') fetchGroups();
        if (activeTab === 'coaching') {
            if (profile?.role === 'coach') fetchClients();
            else fetchMyCoach();
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleCreatePost = async () => {
        if (!caption && !selectedImage) return;

        setIsPosting(true);
        try {
            let mediaUrl = undefined;
            if (selectedImage) {
                mediaUrl = await uploadMedia(selectedImage);
                if (!mediaUrl) {
                    Alert.alert(t('common.error'), 'Error al subir la imagen');
                    setIsPosting(false);
                    return;
                }
            }

            await createPost(caption, mediaUrl, isWorkoutProof);
            setShowCreateModal(false);
            setCaption('');
            setSelectedImage(null);
            setIsWorkoutProof(false);
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert(t('common.error'), 'Error al crear la publicación');
        } finally {
            setIsPosting(false);
        }
    };

    const TabButton = ({ id, label, icon }: { id: SocialTab, label: string, icon: keyof typeof Ionicons.glyphMap }) => (
        <TouchableOpacity
            onPress={() => setActiveTab(id)}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl ${activeTab === id ? 'bg-primary/10' : ''}`}
        >
            <Ionicons
                name={icon}
                size={20}
                color={activeTab === id ? Colors[theme].primary : Colors[theme].textMuted}
                className="mr-2"
            />
            <AccessibleText
                weight={activeTab === id ? 'bold' : 'medium'}
                className={activeTab === id ? 'text-primary' : 'text-text-secondary'}
            >
                {label}
            </AccessibleText>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 py-4">
                    <AccessibleText variant="h1" weight="bold" className="text-text text-3xl">
                        {t('social.title')}
                    </AccessibleText>
                </View>

                {/* Tabs */}
                <View className="px-6 mb-4">
                    <View className="flex-row bg-white/5 p-1 rounded-2xl">
                        <TabButton id="feed" label={t('social.tabs.feed')} icon="list" />
                        <TabButton id="groups" label={t('social.tabs.groups')} icon="people" />
                        <TabButton id="coaching" label={t('social.tabs.coaching')} icon="fitness" />
                    </View>
                </View>

                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={socialLoading || coachLoading} onRefresh={onRefresh} tintColor={Colors[theme].primary} />
                    }
                >
                    {activeTab === 'feed' && (
                        <View className="pb-10">
                            {feed.map((post) => (
                                <Card key={post.id} variant="glass" className="mb-4 p-4">
                                    <View className="flex-row items-center mb-3">
                                        <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                                            <Ionicons name="person" size={20} color={Colors[theme].primary} />
                                        </View>
                                        <View>
                                            <View className="flex-row items-center">
                                                <AccessibleText weight="bold" className="text-text">{post.profile?.name || 'Usuario'}</AccessibleText>
                                                {post.is_proof && (
                                                    <View className="ml-2 bg-green-500/20 px-2 py-0.5 rounded-full flex-row items-center">
                                                        <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
                                                        <AccessibleText weight="bold" className="text-green-500 text-[10px] ml-1">PROOVED</AccessibleText>
                                                    </View>
                                                )}
                                            </View>
                                            <AccessibleText className="text-text-secondary text-xs">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </AccessibleText>
                                        </View>
                                    </View>

                                    {post.media_url && (
                                        <View className="w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-white/5">
                                            <Image source={{ uri: post.media_url }} className="w-full h-full" resizeMode="cover" />
                                        </View>
                                    )}

                                    <AccessibleText className="text-text mb-2">{post.caption}</AccessibleText>

                                    <View className="flex-row items-center mt-2 pt-3 border-t border-white/5">
                                        <TouchableOpacity
                                            onPress={() => toggleLike(post.id)}
                                            className="flex-row items-center mr-6"
                                        >
                                            <Ionicons name={post.has_liked ? "heart" : "heart-outline"} size={22} color={post.has_liked ? "#ef4444" : Colors[theme].textMuted} />
                                            <AccessibleText className={`ml-1 ${post.has_liked ? 'text-red-500' : 'text-text-secondary'}`}>
                                                {post.likes_count || 0}
                                            </AccessibleText>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="flex-row items-center">
                                            <Ionicons name="chatbubble-outline" size={20} color={Colors[theme].textMuted} />
                                            <AccessibleText className="text-text-secondary ml-1">
                                                {post.comments_count || 0}
                                            </AccessibleText>
                                        </TouchableOpacity>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    )}

                    {activeTab === 'groups' && (
                        <View className="pb-10">
                            <View className="flex-row justify-between items-center mb-4">
                                <AccessibleText weight="bold" className="text-text text-xl">
                                    {t('social.groups.title')}
                                </AccessibleText>
                                <TouchableOpacity
                                    onPress={() => router.push('/social/group/create')}
                                    className="bg-primary px-4 py-2 rounded-xl"
                                >
                                    <AccessibleText weight="bold" className="text-white text-sm">
                                        {t('social.groups.create')}
                                    </AccessibleText>
                                </TouchableOpacity>
                            </View>

                            {groups.length === 0 ? (
                                <Card variant="glass" className="items-center py-10">
                                    <Ionicons name="people-outline" size={48} color={Colors[theme].textMuted} className="mb-4" />
                                    <AccessibleText className="text-text-secondary text-center">
                                        {t('social.groups.empty')}
                                    </AccessibleText>
                                </Card>
                            ) : (
                                groups.map((group) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        onPress={() => router.push({ pathname: '/social/group/[id]', params: { id: group.id } })}
                                    >
                                        <Card variant="glass" className="mb-4 flex-row items-center p-4">
                                            <View className="w-12 h-12 rounded-2xl bg-secondary/20 items-center justify-center mr-4">
                                                <Ionicons
                                                    name={group.type === 'couple' ? 'heart' : 'people'}
                                                    size={24}
                                                    color={Colors[theme].secondary}
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <AccessibleText weight="bold" className="text-text text-lg">{group.name}</AccessibleText>
                                                <AccessibleText className="text-text-secondary text-sm">
                                                    {t(`social.groups.types.${group.type}`)}
                                                </AccessibleText>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color={Colors[theme].textMuted} />
                                        </Card>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    )}

                    {activeTab === 'coaching' && (
                        <View className="pb-10">
                            {profile?.role === 'coach' ? (
                                <>
                                    <AccessibleText weight="bold" className="text-text text-xl mb-4">
                                        {t('social.coaching.clients')}
                                    </AccessibleText>
                                    {clients.map((client) => (
                                        <TouchableOpacity
                                            key={client.client_id}
                                            onPress={() => router.push({ pathname: '/social/coach/[id]', params: { id: client.client_id } })}
                                        >
                                            <Card variant="glass" className="mb-4 flex-row items-center p-4">
                                                <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-4">
                                                    <Ionicons name="person" size={24} color={Colors[theme].primary} />
                                                </View>
                                                <View className="flex-1">
                                                    <AccessibleText weight="bold" className="text-text">{client.client?.name || 'Cliente'}</AccessibleText>
                                                    <AccessibleText className="text-text-secondary text-sm">{client.status}</AccessibleText>
                                                </View>
                                                <TouchableOpacity className="p-2">
                                                    <Ionicons name="chatbubbles-outline" size={24} color={Colors[theme].primary} />
                                                </TouchableOpacity>
                                            </Card>
                                        </TouchableOpacity>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <AccessibleText weight="bold" className="text-text text-xl mb-4">
                                        {t('social.coaching.title')}
                                    </AccessibleText>
                                    {myCoach ? (
                                        <Card variant="glass" className="p-4 flex-row items-center">
                                            <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mr-4">
                                                <Ionicons name="person" size={32} color={Colors[theme].primary} />
                                            </View>
                                            <View className="flex-1">
                                                <AccessibleText weight="bold" className="text-text text-lg">{myCoach.profiles?.name || 'Tu Coach'}</AccessibleText>
                                                <AccessibleText className="text-text-secondary">{myCoach.profiles?.email}</AccessibleText>
                                            </View>
                                            <TouchableOpacity className="bg-primary/10 p-3 rounded-full">
                                                <Ionicons name="chatbubbles" size={24} color={Colors[theme].primary} />
                                            </TouchableOpacity>
                                        </Card>
                                    ) : (
                                        <Card variant="glass" className="items-center py-10">
                                            <Ionicons name="fitness-outline" size={48} color={Colors[theme].textMuted} className="mb-4" />
                                            <AccessibleText className="text-text-secondary text-center mb-6">
                                                {t('social.coaching.noCoach')}
                                            </AccessibleText>
                                            <TouchableOpacity
                                                onPress={() => router.push('/social/coach/request')}
                                                className="bg-primary px-6 py-3 rounded-2xl"
                                            >
                                                <AccessibleText weight="bold" className="text-white">
                                                    {t('social.coaching.request')}
                                                </AccessibleText>
                                            </TouchableOpacity>
                                        </Card>
                                    )}
                                </>
                            )}
                        </View>
                    )}
                </ScrollView>

                {/* Floating Action Button for Feed */}
                {activeTab === 'feed' && (
                    <TouchableOpacity
                        onPress={() => setShowCreateModal(true)}
                        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/30"
                    >
                        <Ionicons name="add" size={32} color="white" />
                    </TouchableOpacity>
                )}

                {/* Create Post Modal */}
                <Modal
                    visible={showCreateModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowCreateModal(false)}
                >
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-[#1a1a2e] rounded-t-[40px] h-[80%] p-8 border-t border-blue-500/20">
                            <View className="flex-row justify-between items-center mb-6">
                                <AccessibleText variant="h2" weight="bold" className="text-white">
                                    {t('social.feed.createPost')}
                                </AccessibleText>
                                <TouchableOpacity
                                    onPress={() => setShowCreateModal(false)}
                                    className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                                <TouchableOpacity
                                    onPress={pickImage}
                                    className="w-full aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/10 items-center justify-center mb-6 overflow-hidden"
                                >
                                    {selectedImage ? (
                                        <Image source={{ uri: selectedImage }} className="w-full h-full" />
                                    ) : (
                                        <>
                                            <Ionicons name="camera-outline" size={48} color={Colors[theme].textMuted} />
                                            <AccessibleText className="text-text-secondary mt-2">
                                                {t('social.feed.addPhoto')}
                                            </AccessibleText>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TextInput
                                    placeholder={t('social.feed.captionPlaceholder')}
                                    placeholderTextColor={Colors[theme].textMuted}
                                    multiline
                                    value={caption}
                                    onChangeText={setCaption}
                                    className="bg-white/5 p-4 rounded-2xl text-white text-base min-h-[100px] mb-6"
                                    textAlignVertical="top"
                                />

                                <TouchableOpacity
                                    onPress={() => setIsWorkoutProof(!isWorkoutProof)}
                                    className={`flex-row items-center p-4 rounded-2xl border ${isWorkoutProof ? 'bg-green-500/10 border-green-500/50' : 'bg-white/5 border-transparent'}`}
                                >
                                    <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${isWorkoutProof ? 'bg-green-500' : 'bg-white/10'}`}>
                                        {isWorkoutProof && <Ionicons name="checkmark" size={16} color="white" />}
                                    </View>
                                    <View className="flex-1">
                                        <AccessibleText weight="bold" className={isWorkoutProof ? 'text-green-500' : 'text-text'}>
                                            {t('social.feed.workoutProof')}
                                        </AccessibleText>
                                        <AccessibleText className="text-text-secondary text-xs">
                                            {t('social.feed.workoutProofDesc')}
                                        </AccessibleText>
                                    </View>
                                </TouchableOpacity>
                            </ScrollView>

                            <TouchableOpacity
                                onPress={handleCreatePost}
                                disabled={isPosting || (!caption && !selectedImage)}
                                className="mt-4"
                            >
                                <LinearGradient
                                    colors={['#3b82f6', '#60a5fa']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className={`rounded-2xl py-4 items-center shadow-lg shadow-blue-500/30 ${isPosting || (!caption && !selectedImage) ? 'opacity-50' : ''}`}
                                >
                                    {isPosting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <AccessibleText weight="bold" className="text-white text-lg">
                                            {t('social.feed.post')}
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
