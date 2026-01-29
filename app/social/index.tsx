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
import { useUserProfileStore } from '@/store/userProfileStore';
import { PostCard } from '@/components/social/PostCard';
import { Post } from '@/types/social';

type SocialTab = 'feed' | 'squads' | 'arena';

export default function SocialHub() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const [activeTab, setActiveTab] = useState<SocialTab>('feed');

    const { profile } = useUserProfileStore();
    // TODO: Update store to match new types
    const { feed, fetchFeed, createPost, uploadMedia, toggleLike, loading: socialLoading } = useSocialStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [caption, setCaption] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        if (activeTab === 'feed') fetchFeed();
    }, [activeTab]);

    const onRefresh = () => {
        if (activeTab === 'feed') fetchFeed();
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

            await createPost(caption, mediaUrl, false);
            setShowCreateModal(false);
            setCaption('');
            setSelectedImage(null);
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
                color={activeTab === id ? colors.primary : colors.textMuted}
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
                <View className="px-6 py-4 flex-row justify-between items-center bg-background border-b border-white/5">
                    <View>
                        <AccessibleText variant="caption" weight="black" className="text-primary uppercase tracking-widest mb-1">
                            Mambo Social
                        </AccessibleText>
                        <AccessibleText variant="h1" weight="black" className="text-text text-3xl tracking-tight">
                            The Pulse
                        </AccessibleText>
                    </View>
                    <TouchableOpacity className="w-10 h-10 rounded-full bg-surface-highlight items-center justify-center border border-white/10">
                        <Ionicons name="notifications-outline" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View className="px-6 py-4">
                    <View className="flex-row bg-surface/50 p-1 rounded-2xl border border-white/5">
                        <TabButton id="feed" label="Feed" icon="list" />
                        <TabButton id="squads" label="Squads" icon="people" />
                        <TabButton id="arena" label="Arena" icon="trophy" />
                    </View>
                </View>

                <ScrollView
                    className="flex-1 px-4"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={socialLoading} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    {activeTab === 'feed' && (
                        <View className="pb-24">
                            {/* Stories / Highlights Placeholder */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-4 px-4">
                                <TouchableOpacity className="mr-4 items-center">
                                    <View className="w-16 h-16 rounded-full bg-surface-highlight border-2 border-dashed border-primary items-center justify-center mb-1">
                                        <Ionicons name="add" size={24} color={colors.primary} />
                                    </View>
                                    <AccessibleText className="text-text-secondary text-xs">Tu Historia</AccessibleText>
                                </TouchableOpacity>
                                {[1, 2, 3].map((i) => (
                                    <View key={i} className="mr-4 items-center opacity-50">
                                        <View className="w-16 h-16 rounded-full bg-surface-highlight border border-white/10 mb-1" />
                                        <View className="w-12 h-2 bg-surface-highlight rounded-full" />
                                    </View>
                                ))}
                            </ScrollView>

                            {feed.length === 0 && !socialLoading ? (
                                <View className="items-center py-12">
                                    <View className="w-20 h-20 bg-surface-highlight rounded-full items-center justify-center mb-4">
                                        <Ionicons name="newspaper-outline" size={32} color={colors.textMuted} />
                                    </View>
                                    <AccessibleText weight="bold" className="text-text-secondary text-center">
                                        No hay publicaciones aún
                                    </AccessibleText>
                                    <AccessibleText className="text-text-muted text-center mt-2 px-10">
                                        Sé el primero en compartir tu entrenamiento o únete a un Squad.
                                    </AccessibleText>
                                </View>
                            ) : (
                                feed.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post as unknown as Post} // Temporary cast until store is updated
                                        onLike={() => toggleLike(post.id)}
                                        onComment={() => { }}
                                        onUserPress={() => { }}
                                    />
                                ))
                            )}
                        </View>
                    )}

                    {activeTab === 'squads' && (
                        <View className="items-center py-20">
                            <Ionicons name="construct-outline" size={48} color={colors.primary} />
                            <AccessibleText weight="bold" className="text-text mt-4 text-lg">The Wolfpack</AccessibleText>
                            <AccessibleText className="text-text-secondary mt-2">Próximamente en la Fase 2</AccessibleText>
                        </View>
                    )}

                    {activeTab === 'arena' && (
                        <View className="items-center py-20">
                            <Ionicons name="trophy-outline" size={48} color={colors.warning} />
                            <AccessibleText weight="bold" className="text-text mt-4 text-lg">The Arena</AccessibleText>
                            <AccessibleText className="text-text-secondary mt-2">Próximamente en la Fase 3</AccessibleText>
                        </View>
                    )}
                </ScrollView>

                {/* Floating Action Button for Feed */}
                {activeTab === 'feed' && (
                    <TouchableOpacity
                        onPress={() => setShowCreateModal(true)}
                        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-glow animate-pop"
                    >
                        <Ionicons name="add" size={32} color="black" />
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
                        <View className="bg-surface rounded-t-[32px] h-[85%] p-0 border-t border-white/10">
                            <View className="flex-row justify-between items-center p-6 border-b border-white/5">
                                <AccessibleText variant="h2" weight="bold" className="text-white">
                                    Nuevo Post
                                </AccessibleText>
                                <TouchableOpacity
                                    onPress={() => setShowCreateModal(false)}
                                    className="w-8 h-8 bg-surface-highlight rounded-full items-center justify-center"
                                >
                                    <Ionicons name="close" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-6">
                                <TouchableOpacity
                                    onPress={pickImage}
                                    className="w-full aspect-square bg-surface-highlight/30 rounded-3xl border-2 border-dashed border-white/10 items-center justify-center mb-6 overflow-hidden"
                                >
                                    {selectedImage ? (
                                        <Image source={{ uri: selectedImage }} className="w-full h-full" />
                                    ) : (
                                        <>
                                            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-3">
                                                <Ionicons name="image-outline" size={32} color={colors.primary} />
                                            </View>
                                            <AccessibleText weight="bold" className="text-text">
                                                Añadir Foto
                                            </AccessibleText>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TextInput
                                    placeholder="Comparte tu progreso..."
                                    placeholderTextColor={colors.textMuted}
                                    multiline
                                    value={caption}
                                    onChangeText={setCaption}
                                    className="bg-surface-highlight/30 p-4 rounded-2xl text-white text-base min-h-[120px] mb-6"
                                    textAlignVertical="top"
                                />
                            </ScrollView>

                            <View className="p-6 border-t border-white/5 bg-surface pb-10">
                                <TouchableOpacity
                                    onPress={handleCreatePost}
                                    disabled={isPosting || (!caption && !selectedImage)}
                                    className="shadow-glow"
                                >
                                    <LinearGradient
                                        colors={Colors.gradients.primary}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className={`rounded-2xl py-4 items-center ${isPosting || (!caption && !selectedImage) ? 'opacity-50' : ''}`}
                                    >
                                        {isPosting ? (
                                            <ActivityIndicator color="black" />
                                        ) : (
                                            <AccessibleText weight="black" className="text-black text-lg uppercase tracking-wider">
                                                Publicar
                                            </AccessibleText>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </ScreenWrapper>
    );
}
