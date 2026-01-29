import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useAcademyStore, AcademyLesson, AcademyProgress } from '@/store/academyStore';
import { Card } from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

export default function CourseDetailsScreen() {
    const { courseId } = useLocalSearchParams<{ courseId: string }>();
    const router = useRouter();
    const { theme, isDark } = useAppTheme();
    const colors = Colors[theme];
    const { courses, fetchCourseDetails, getCourseProgress } = useAcademyStore();

    const [lessons, setLessons] = useState<AcademyLesson[]>([]);
    const [progress, setProgress] = useState<AcademyProgress[]>([]);
    const [loading, setLoading] = useState(true);

    const course = courses.find(c => c.id === courseId);
    const courseProgress = getCourseProgress(courseId);

    useEffect(() => {
        if (courseId) {
            loadDetails();
        }
    }, [courseId]);

    const loadDetails = async () => {
        setLoading(true);
        const details = await fetchCourseDetails(courseId);
        setLessons(details.lessons);
        setProgress(details.progress);
        setLoading(false);
    };

    if (!course) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="flex-1 items-center justify-center p-6">
                    <AccessibleText className="text-text-secondary">Curso no encontrado</AccessibleText>
                    <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-6 py-3 rounded-2xl">
                        <AccessibleText weight="bold" className="text-white">Volver</AccessibleText>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper safeArea={true}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header Image & Back Button */}
                <View className="h-64 bg-surface-highlight relative">
                    {course.thumbnail_url ? (
                        <Image source={{ uri: course.thumbnail_url }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <LinearGradient
                            colors={isDark ? ['#1e293b', '#0f172a'] : ['#f1f5f9', '#e2e8f0']}
                            className="w-full h-full items-center justify-center"
                        >
                            <Ionicons name="school" size={80} color={colors.textMuted} />
                        </LinearGradient>
                    )}

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-4 left-6 w-10 h-10 rounded-full bg-black/40 items-center justify-center"
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Course Info */}
                <View className="px-6 -mt-10">
                    <Card variant="glass" className="p-6">
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="bg-primary/10 px-3 py-1 rounded-full">
                                <AccessibleText weight="bold" className="text-primary text-[10px] uppercase tracking-widest">
                                    {course.category}
                                </AccessibleText>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="flash" size={14} color={colors.warning} />
                                <AccessibleText weight="bold" className="text-warning text-xs ml-1">{course.xp_reward} XP</AccessibleText>
                            </View>
                        </View>

                        <AccessibleText weight="bold" className="text-text text-2xl">
                            {course.title}
                        </AccessibleText>

                        <AccessibleText className="text-text-secondary mt-2 leading-5">
                            {course.description}
                        </AccessibleText>

                        <View className="mt-6">
                            <View className="flex-row justify-between items-center mb-2">
                                <AccessibleText weight="bold" className="text-text text-sm">Progreso del curso</AccessibleText>
                                <AccessibleText weight="bold" className="text-primary text-sm">{courseProgress}%</AccessibleText>
                            </View>
                            <View className="h-2 bg-surface-highlight rounded-full overflow-hidden">
                                <View className="h-full bg-primary rounded-full" style={{ width: `${courseProgress}%` }} />
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Lessons List */}
                <View className="px-6 py-8">
                    <AccessibleText weight="bold" className="text-text text-xl mb-4">
                        Lecciones ({lessons.length})
                    </AccessibleText>

                    {loading ? (
                        <ActivityIndicator size="small" color={colors.primary} className="py-10" />
                    ) : lessons.length > 0 ? (
                        lessons.map((lesson, index) => {
                            const isCompleted = progress.some(p => p.lesson_id === lesson.id && p.completed);
                            const isLocked = index > 0 && !progress.some(p => p.lesson_id === lessons[index - 1].id && p.completed);

                            return (
                                <TouchableOpacity
                                    key={lesson.id}
                                    disabled={isLocked}
                                    onPress={() => router.push(`/academy/lesson/${lesson.id}` as any)}
                                    className={`mb-3 flex-row items-center p-4 rounded-2xl border ${isLocked
                                        ? 'bg-surface-highlight/20 border-border/5 opacity-50'
                                        : isCompleted
                                            ? 'bg-success/5 border-success/20'
                                            : 'bg-surface-highlight/50 border-border/10'
                                        }`}
                                >
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isCompleted ? 'bg-success/20' : 'bg-surface-highlight'
                                        }`}>
                                        {isLocked ? (
                                            <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
                                        ) : isCompleted ? (
                                            <Ionicons name="checkmark" size={20} color={colors.success} />
                                        ) : (
                                            <AccessibleText weight="bold" className="text-text-secondary">{index + 1}</AccessibleText>
                                        )}
                                    </View>

                                    <View className="flex-1">
                                        <AccessibleText weight="bold" className={`text-sm ${isLocked ? 'text-text-muted' : 'text-text'}`}>
                                            {lesson.title}
                                        </AccessibleText>
                                        <View className="flex-row items-center mt-1">
                                            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                                            <AccessibleText className="text-text-muted text-[10px] ml-1">
                                                {lesson.duration_minutes} min
                                            </AccessibleText>
                                            {lesson.video_url && (
                                                <View className="flex-row items-center ml-3">
                                                    <Ionicons name="play-circle-outline" size={12} color={colors.textMuted} />
                                                    <AccessibleText className="text-text-muted text-[10px] ml-1">Video</AccessibleText>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {!isLocked && (
                                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                    )}
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View className="py-10 items-center">
                            <AccessibleText className="text-text-muted">No hay lecciones disponibles aún.</AccessibleText>
                        </View>
                    )}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
