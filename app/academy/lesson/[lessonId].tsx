import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useAcademyStore, AcademyLesson } from '@/store/academyStore';
import { Video, ResizeMode } from 'expo-av';
import Markdown from 'react-native-markdown-display';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function LessonViewerScreen() {
    const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
    const router = useRouter();
    const { theme, isDark } = useAppTheme();
    const colors = Colors[theme];
    const { lessons, completeLesson } = useAcademyStore();

    const lesson = lessons.find(l => l.id === lessonId);
    const [completing, setCompleting] = useState(false);
    const [hasQuiz, setHasQuiz] = useState(false);

    useEffect(() => {
        if (lessonId) {
            checkQuiz();
        }
    }, [lessonId]);

    const checkQuiz = async () => {
        const { data } = await supabase
            .from('academy_quizzes')
            .select('id')
            .eq('lesson_id', lessonId)
            .single();

        if (data) setHasQuiz(true);
    };

    if (!lesson) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="flex-1 items-center justify-center p-6">
                    <AccessibleText className="text-text-secondary">Lección no encontrada</AccessibleText>
                    <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-6 py-3 rounded-2xl">
                        <AccessibleText weight="bold" className="text-white">Volver</AccessibleText>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const handleComplete = async () => {
        setCompleting(true);
        try {
            await completeLesson(lesson.id, lesson.course_id);
            router.back();
        } catch (error) {
            console.error('Error completing lesson:', error);
        } finally {
            setCompleting(false);
        }
    };

    return (
        <ScreenWrapper safeArea={true}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-border/10">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-surface-highlight items-center justify-center">
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View className="flex-1 px-4">
                    <AccessibleText weight="bold" className="text-text text-center" numberOfLines={1}>
                        {lesson.title}
                    </AccessibleText>
                </View>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Video Player */}
                {lesson.video_url && (
                    <View className="w-full aspect-video bg-black">
                        <Video
                            source={{ uri: lesson.video_url }}
                            style={{ width: '100%', height: '100%' }}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay={false}
                        />
                    </View>
                )}

                {/* Content */}
                <View className="px-6 py-8">
                    <AccessibleText weight="bold" className="text-text text-2xl mb-6">
                        {lesson.title}
                    </AccessibleText>

                    <Markdown
                        style={{
                            body: { color: colors.text, fontSize: 16, lineHeight: 24 },
                            heading1: { color: colors.text, fontWeight: 'bold', marginVertical: 12, fontSize: 24 },
                            heading2: { color: colors.text, fontWeight: 'bold', marginVertical: 10, fontSize: 20 },
                            paragraph: { color: colors.textSecondary, marginVertical: 8, fontSize: 16, lineHeight: 24 },
                            bullet_list: { marginVertical: 8 },
                            ordered_list: { marginVertical: 8 },
                            list_item: { marginVertical: 4 },
                            bullet_list_icon: { color: colors.primary, marginRight: 10 },
                            bullet_list_content: { color: colors.textSecondary, fontSize: 16 },
                            strong: { fontWeight: 'bold', color: colors.text },
                            em: { fontStyle: 'italic' },
                            link: { color: colors.primary },
                            code_inline: { backgroundColor: colors.surfaceHighlight, padding: 4, borderRadius: 4, fontFamily: 'monospace' },
                            hr: { backgroundColor: colors.border, height: 1, marginVertical: 16 },
                        }}
                    >
                        {(lesson.content || 'No hay contenido disponible para esta lección.').replace(/\\n/g, '\n')}
                    </Markdown>

                    {/* Completion Button */}
                    <View className="mt-12 mb-10">
                        <TouchableOpacity
                            onPress={hasQuiz ? () => router.push(`/academy/quiz/${lesson.id}` as any) : handleComplete}
                            disabled={completing}
                            className="bg-primary py-4 rounded-2xl items-center justify-center flex-row"
                        >
                            {completing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name={hasQuiz ? "help-circle" : "checkmark-circle"} size={20} color="#fff" className="mr-2" />
                                    <AccessibleText weight="bold" className="text-white text-lg ml-2">
                                        {hasQuiz ? "Realizar Cuestionario" : "Completar Lección"}
                                    </AccessibleText>
                                </>
                            )}
                        </TouchableOpacity>
                        <AccessibleText className="text-text-muted text-center mt-4 text-xs">
                            {hasQuiz
                                ? "Debes aprobar el cuestionario para completar esta lección."
                                : "Al completar esta lección ganarás puntos de XP para tu perfil."}
                        </AccessibleText>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
