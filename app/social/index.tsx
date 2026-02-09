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

type SocialTab = 'feed' | 'squads' | 'arena' | 'academy';

export default function SocialHub() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const [activeTab, setActiveTab] = useState<SocialTab>('feed');

    const { profile } = useUserProfileStore();
    // TODO: Update store to match new types
    const {
        feed,
        fetchFeed,
        createPost,
        uploadMedia,
        toggleLike,
        loading: socialLoading,
        groups,
        fetchGroups,
        wagers
    } = useSocialStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [caption, setCaption] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        if (activeTab === 'feed') fetchFeed();
        if (activeTab === 'squads') fetchGroups();
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
                            {t('social.hub.subtitle')}
                        </AccessibleText>
                        <AccessibleText variant="h1" weight="black" className="text-text tracking-tighter">
                            {t('social.hub.title')}
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
                        <TabButton id="academy" label="Academy" icon="school" />
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
                                        post={post as unknown as Post}
                                        onLike={() => toggleLike(post.id)}
                                        onComment={() => router.push({ pathname: '/social/post/[id]', params: { id: post.id } })}
                                        onUserPress={() => { }} // Could navigate to profile
                                    />
                                ))
                            )}
                        </View>
                    )}

                    {activeTab === 'squads' && (
                        <View className="pb-24">
                            <View className="flex-row justify-between items-center mb-6">
                                <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest pl-1">
                                    Tus Squads
                                </AccessibleText>
                                <TouchableOpacity onPress={() => router.push('/social/squads/browser')}>
                                    <AccessibleText weight="bold" className="text-primary text-xs">Explorar Todos</AccessibleText>
                                </TouchableOpacity>
                            </View>

                            {groups.length === 0 ? (
                                <Card variant="glass" className="py-12 items-center border-dashed border-white/10">
                                    <Ionicons name="people-outline" size={48} color={colors.textMuted} className="mb-4" />
                                    <AccessibleText weight="bold" className="text-text text-center text-lg">No perteneces a ningún Squad</AccessibleText>
                                    <AccessibleText className="text-text-secondary text-center mt-2 px-10">
                                        Únete a la manada y entrena con otros usuarios.
                                    </AccessibleText>
                                    <TouchableOpacity
                                        onPress={() => router.push('/social/squads/browser')}
                                        className="mt-6 bg-primary/10 px-6 py-2 rounded-xl border border-primary/20"
                                    >
                                        <AccessibleText weight="bold" className="text-primary">Descubrir Squads</AccessibleText>
                                    </TouchableOpacity>
                                </Card>
                            ) : (
                                groups.slice(0, 3).map((group) => (
                                    <TouchableOpacity
                                        key={group.id}
                                        className="mb-4"
                                        onPress={() => router.push({ pathname: '/social/squads/[id]', params: { id: group.id } })}
                                    >
                                        <Card variant="glass" className="p-4 flex-row items-center">
                                            <View className="w-12 h-12 bg-surface-highlight rounded-xl items-center justify-center mr-4 border border-white/10">
                                                <Ionicons name="people" size={24} color={colors.primary} />
                                            </View>
                                            <View className="flex-1">
                                                <AccessibleText weight="bold" className="text-text text-base">{group.name}</AccessibleText>
                                                <AccessibleText className="text-text-secondary text-xs">{group.type.toUpperCase()}</AccessibleText>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                        </Card>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    )}

                    {activeTab === 'arena' && (
                        <View className="pb-24">
                            <View className="flex-row justify-between items-center mb-6">
                                <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest pl-1">
                                    The Arena
                                </AccessibleText>
                                <TouchableOpacity onPress={() => router.push('/social/arena')}>
                                    <AccessibleText weight="bold" className="text-primary text-xs">Ver Dashboard</AccessibleText>
                                </TouchableOpacity>
                            </View>

                            <Card variant="glass" className="mb-6 p-6 border-primary/30">
                                <View className="flex-row items-center mb-4">
                                    <View className="w-12 h-12 bg-warning/20 rounded-xl items-center justify-center mr-4">
                                        <Ionicons name="trophy" size={24} color={colors.warning} />
                                    </View>
                                    <View className="flex-1">
                                        <AccessibleText weight="black" className="text-white text-lg">LIDERAZGO GLOBAL</AccessibleText>
                                        <AccessibleText className="text-text-secondary text-xs">Ves tu posición en el ranking</AccessibleText>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => router.push('/social/arena')}
                                    className="bg-primary py-3 rounded-xl items-center shadow-glow"
                                >
                                    <AccessibleText weight="black" className="text-black uppercase tracking-widest">Entrar a la Arena</AccessibleText>
                                </TouchableOpacity>
                            </Card>

                            <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4 pl-1">
                                Retos Activos
                            </AccessibleText>
                            <Card variant="glass" className="p-10 items-center border-dashed border-white/10">
                                <Ionicons name="flash-outline" size={32} color={colors.textMuted} className="mb-2" />
                                <AccessibleText className="text-text-secondary text-center">No hay retos activos en este momento.</AccessibleText>
                            </Card>
                        </View>
                    )}

                    {activeTab === 'academy' && (
                        <View className="pb-24">
                            <View className="bg-surface-highlight/30 p-6 rounded-3xl mb-6 border border-white/5">
                                <View className="flex-row items-center mb-4">
                                    <View className="w-12 h-12 bg-secondary/20 rounded-xl items-center justify-center mr-4">
                                        <Ionicons name="school" size={24} color={colors.secondary} />
                                    </View>
                                    <View className="flex-1">
                                        <AccessibleText weight="black" className="text-white text-xl uppercase">Mambo Academy</AccessibleText>
                                        <AccessibleText className="text-text-secondary text-sm">Domina tu entrenamiento y nutrición</AccessibleText>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => router.push('/academy')}
                                    className="bg-white/10 py-4 rounded-2xl items-center border border-white/5"
                                >
                                    <AccessibleText weight="black" className="text-white uppercase tracking-widest">Explorar Cursos</AccessibleText>
                                </TouchableOpacity>
                            </View>

                            <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4 pl-1">
                                Recomendado para ti
                            </AccessibleText>
                            <Card variant="glass" className="p-4 mb-4 flex-row items-center">
                                <View className="w-20 h-20 bg-surface-highlight rounded-xl mr-4 overflow-hidden">
                                    <Ionicons name="nutrition" size={32} color={colors.primary} className="m-auto" />
                                </View>
                                <View className="flex-1">
                                    <View className="bg-primary/20 self-start px-2 py-0.5 rounded-full mb-1">
                                        <AccessibleText weight="bold" className="text-primary text-[8px]">NUTRICIÓN</AccessibleText>
                                    </View>
                                    <AccessibleText weight="bold" className="text-text text-base">Fundamentos de Macros</AccessibleText>
                                    <AccessibleText className="text-text-secondary text-xs mt-1">12 Lecciones • 45 min</AccessibleText>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                            </Card>
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
