import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
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
                    <View className="mx-4 mb-4 rounded-2xl overflow-hidden">
                        <LinearGradient
                            colors={[colors.primary + '20', colors.primary + '05']}
                            className="p-4 border border-primary/20"
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View className="bg-primary/20 p-2 rounded-full mr-3">
                                        <Ionicons name="trophy" size={20} color={colors.primary} />
                                    </View>
                                    <View>
                                        <AccessibleText weight="bold" className="text-primary text-xs uppercase tracking-widest">
                                            Entrenamiento Completado
                                        </AccessibleText>
                                        <AccessibleText weight="black" className="text-text text-lg">
                                            {post.workout_data.workout_name}
                                        </AccessibleText>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row justify-between">
                                <View className="items-center flex-1">
                                    <AccessibleText weight="bold" className="text-text text-xl">
                                        {Math.floor(post.workout_data.duration / 60)}m
                                    </AccessibleText>
                                    <AccessibleText className="text-text-secondary text-[10px] uppercase tracking-widest">
                                        Tiempo
                                    </AccessibleText>
                                </View>
                                <View className="w-px bg-white/10" />
                                <View className="items-center flex-1">
                                    <AccessibleText weight="bold" className="text-text text-xl">
                                        {post.workout_data.volume}kg
                                    </AccessibleText>
                                    <AccessibleText className="text-text-secondary text-[10px] uppercase tracking-widest">
                                        Volumen
                                    </AccessibleText>
                                </View>
                                <View className="w-px bg-white/10" />
                                <View className="items-center flex-1">
                                    <AccessibleText weight="bold" className="text-text text-xl">
                                        {post.workout_data.pr_count}
                                    </AccessibleText>
                                    <AccessibleText className="text-text-secondary text-[10px] uppercase tracking-widest">
                                        PRs
                                    </AccessibleText>
                                </View>
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

                        <TouchableOpacity className="active:scale-95">
                            <Ionicons name="paper-plane-outline" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        </Animated.View>
    );
}
