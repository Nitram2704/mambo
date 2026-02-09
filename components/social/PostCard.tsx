import React from 'react';
import { View, Image, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { Post } from '@/types/social';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PostCardProps {
    post: Post;
    onLike: () => void;
    onComment: () => void;
    onUserPress: () => void;
}

export function PostCard({ post, onLike, onComment, onUserPress }: PostCardProps) {
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const isWorkout = post.type === 'workout';

    const handleShare = async () => {
        try {
            const message = post.workout_data
                ? `¡He completado ${post.workout_data.workout_name} en Mambo! 🔥 ${post.workout_data.volume}kg movidos.`
                : `${post.content || 'Mira mi progreso en Mambo!'}`;

            await Share.share({
                message,
                url: post.media_url || undefined,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <Animated.View entering={FadeInDown.springify()} className="mb-4">
            <Card variant="glass" className="p-0 overflow-hidden border-white/5">
                {/* Header */}
                <View className="flex-row items-center p-4">
                    <TouchableOpacity onPress={onUserPress} className="flex-row items-center flex-1">
                        <View className="w-10 h-10 rounded-full bg-surface-highlight items-center justify-center overflow-hidden border border-white/10">
                            {post.user?.avatar_url ? (
                                <Image source={{ uri: post.user.avatar_url }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={20} color={colors.textMuted} />
                            )}
                        </View>
                        <View className="ml-3">
                            <AccessibleText weight="bold" className="text-text text-sm">
                                {post.user?.full_name || 'Usuario Mambo'}
                            </AccessibleText>
                            <AccessibleText className="text-text-secondary text-xs">
                                {new Date(post.created_at).toLocaleDateString()}
                            </AccessibleText>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {post.content && (
                    <View className="px-4 pb-3">
                        <AccessibleText className="text-text text-base leading-6">
                            {post.content}
                        </AccessibleText>
                    </View>
                )}

                {/* Media / Workout Data */}
                {isWorkout && post.workout_data ? (
                    <View className="mx-4 mb-4 rounded-3xl overflow-hidden shadow-2xl">
                        <LinearGradient
                            colors={['#1a1a2e', '#16213e']}
                            className="p-6 border border-white/10"
                        >
                            <View className="flex-row items-center justify-between mb-6">
                                <View className="flex-row items-center">
                                    <View className="bg-primary/20 p-3 rounded-2xl mr-4 border border-primary/30">
                                        <Ionicons name="fitness" size={24} color={colors.primary} />
                                    </View>
                                    <View>
                                        <AccessibleText weight="bold" className="text-primary text-[10px] uppercase tracking-[3px]">
                                            Work It Out
                                        </AccessibleText>
                                        <AccessibleText weight="black" className="text-text text-xl">
                                            {post.workout_data.workout_name}
                                        </AccessibleText>
                                    </View>
                                </View>
                                <View className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                    <AccessibleText weight="bold" className="text-text-secondary text-[10px]">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </AccessibleText>
                                </View>
                            </View>

                            <View className="flex-row justify-around bg-white/5 py-4 rounded-2xl border border-white/5">
                                <View className="items-center">
                                    <AccessibleText weight="black" className="text-text text-2xl">
                                        {Math.floor(post.workout_data.duration / 60)}
                                    </AccessibleText>
                                    <AccessibleText weight="bold" className="text-text-secondary text-[8px] uppercase tracking-widest mt-1">
                                        Minutos
                                    </AccessibleText>
                                </View>
                                <View className="w-[1px] h-8 bg-white/10 my-auto" />
                                <View className="items-center">
                                    <AccessibleText weight="black" className="text-primary text-2xl">
                                        {post.workout_data.volume}
                                    </AccessibleText>
                                    <AccessibleText weight="bold" className="text-text-secondary text-[8px] uppercase tracking-widest mt-1">
                                        KG Totales
                                    </AccessibleText>
                                </View>
                                <View className="w-[1px] h-8 bg-white/10 my-auto" />
                                <View className="items-center">
                                    <View className="flex-row items-center">
                                        <AccessibleText weight="black" className="text-text text-2xl mr-1">
                                            {post.workout_data.pr_count}
                                        </AccessibleText>
                                        {post.workout_data.pr_count > 0 && <Ionicons name="trophy" size={16} color="#fbbf24" />}
                                    </View>
                                    <AccessibleText weight="bold" className="text-text-secondary text-[8px] uppercase tracking-widest mt-1">
                                        Personal Records
                                    </AccessibleText>
                                </View>
                            </View>

                            <View className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
                                <LinearGradient
                                    colors={[colors.primary, '#60a5fa']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    className="h-full w-[85%]"
                                />
                            </View>
                        </LinearGradient>
                    </View>
                ) : post.media_url ? (
                    <Image
                        source={{ uri: post.media_url }}
                        className="w-full h-64 bg-surface-highlight"
                        resizeMode="cover"
                    />
                ) : null}

                {/* Actions */}
                <View className="flex-row items-center justify-between px-4 py-3 border-t border-white/5">
                    <View className="flex-row gap-6">
                        <TouchableOpacity
                            onPress={onLike}
                            className="flex-row items-center active:scale-95"
                        >
                            <Ionicons
                                name={post.user_has_liked ? "heart" : "heart-outline"}
                                size={24}
                                color={post.user_has_liked ? colors.error : colors.text}
                            />
                            {post.likes_count ? (
                                <AccessibleText weight="bold" className="text-text ml-2">
                                    {post.likes_count}
                                </AccessibleText>
                            ) : null}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onComment}
                            className="flex-row items-center active:scale-95"
                        >
                            <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
                            {post.comments_count ? (
                                <AccessibleText weight="bold" className="text-text ml-2">
                                    {post.comments_count}
                                </AccessibleText>
                            ) : null}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleShare}
                            className="active:scale-95"
                        >
                            <Ionicons name="share-social-outline" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        </Animated.View>
    );
}
