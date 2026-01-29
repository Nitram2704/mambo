import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useSocialStore, SocialPost, PostComment } from '@/store/socialStore';

export default function PostDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const { fetchPostDetails, fetchComments, addComment, toggleLike } = useSocialStore();

    const [post, setPost] = useState<SocialPost | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            loadPostData();
        }
    }, [id]);

    const loadPostData = async () => {
        setLoading(true);
        const [postData, commentsData] = await Promise.all([
            fetchPostDetails(id!),
            fetchComments(id!)
        ]);
        setPost(postData);
        setComments(commentsData);
        setLoading(false);
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !id) return;

        setIsSubmitting(true);
        try {
            await addComment(id, commentText.trim());
            setCommentText('');
            // Reload comments
            const updatedComments = await fetchComments(id);
            setComments(updatedComments);
        } catch (error) {
            Alert.alert(t('common.error'), 'Error al añadir comentario');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleLike = async () => {
        if (!post) return;
        await toggleLike(post.id);
        // Update local state for immediate feedback
        setPost(prev => prev ? {
            ...prev,
            has_liked: !prev.has_liked,
            likes_count: prev.has_liked ? (prev.likes_count || 1) - 1 : (prev.likes_count || 0) + 1
        } : null);
    };

    if (loading) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    if (!post) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="flex-1 items-center justify-center p-6">
                    <AccessibleText className="text-text-secondary text-center">
                        No se pudo encontrar la publicación.
                    </AccessibleText>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-4 bg-primary px-6 py-2 rounded-xl"
                    >
                        <AccessibleText weight="bold" className="text-white">Volver</AccessibleText>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper safeArea={true}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h2" weight="bold" className="text-text text-xl">
                        Publicación
                    </AccessibleText>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    {/* Post Content */}
                    <Card variant="glass" className="mb-6 p-4">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                                {post.profile?.avatar_url ? (
                                    <Image source={{ uri: post.profile.avatar_url }} className="w-full h-full rounded-full" />
                                ) : (
                                    <Ionicons name="person" size={20} color={colors.primary} />
                                )}
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
                            <View className="w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-white/5">
                                <Image source={{ uri: post.media_url }} className="w-full h-full" resizeMode="cover" />
                            </View>
                        )}

                        <AccessibleText className="text-text text-base mb-4 leading-6">{post.caption}</AccessibleText>

                        <View className="flex-row items-center pt-4 border-t border-white/5">
                            <TouchableOpacity
                                onPress={handleToggleLike}
                                className="flex-row items-center mr-6"
                            >
                                <Ionicons name={post.has_liked ? "heart" : "heart-outline"} size={24} color={post.has_liked ? "#ef4444" : colors.textMuted} />
                                <AccessibleText weight="bold" className={`ml-2 ${post.has_liked ? 'text-red-500' : 'text-text-secondary'}`}>
                                    {post.likes_count || 0}
                                </AccessibleText>
                            </TouchableOpacity>
                            <View className="flex-row items-center">
                                <Ionicons name="chatbubble-outline" size={22} color={colors.textMuted} />
                                <AccessibleText weight="bold" className="text-text-secondary ml-2">
                                    {comments.length}
                                </AccessibleText>
                            </View>
                        </View>
                    </Card>

                    {/* Comments Section */}
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4">
                        COMENTARIOS
                    </AccessibleText>

                    {comments.length === 0 ? (
                        <View className="py-10 items-center">
                            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} className="mb-2" />
                            <AccessibleText className="text-text-secondary">Sé el primero en comentar</AccessibleText>
                        </View>
                    ) : (
                        comments.map((comment) => (
                            <View key={comment.id} className="flex-row mb-6">
                                <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                                    {comment.profile?.avatar_url ? (
                                        <Image source={{ uri: comment.profile.avatar_url }} className="w-full h-full rounded-full" />
                                    ) : (
                                        <Ionicons name="person" size={16} color={colors.primary} />
                                    )}
                                </View>
                                <View className="flex-1 bg-white/5 p-3 rounded-2xl">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <AccessibleText weight="bold" className="text-text text-sm">{comment.profile?.name}</AccessibleText>
                                        <AccessibleText className="text-text-secondary text-[10px]">
                                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </AccessibleText>
                                    </View>
                                    <AccessibleText className="text-text-secondary text-sm">{comment.content}</AccessibleText>
                                </View>
                            </View>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>

                {/* Comment Input */}
                <View className="p-4 bg-[#1a1a2e] border-t border-white/5">
                    <View className="flex-row items-center bg-white/5 rounded-2xl px-4 py-2">
                        <TextInput
                            placeholder="Escribe un comentario..."
                            placeholderTextColor={colors.textMuted}
                            value={commentText}
                            onChangeText={setCommentText}
                            className="flex-1 text-white text-sm py-2"
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleAddComment}
                            disabled={isSubmitting || !commentText.trim()}
                            className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${commentText.trim() ? 'bg-primary' : 'bg-white/10'}`}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons name="send" size={18} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}
