import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useAcademyStore } from '@/store/academyStore';
import { QuizComponent } from '@/components/academy/QuizComponent';
import { supabase } from '@/lib/supabase';

export default function QuizScreen() {
    const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { lessons, completeLesson } = useAcademyStore();

    const lesson = lessons.find(l => l.id === lessonId);
    const [quizData, setQuizData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (lessonId) {
            fetchQuiz();
        }
    }, [lessonId]);

    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('academy_quizzes')
                .select('*')
                .eq('lesson_id', lessonId)
                .single();

            if (error) throw error;
            setQuizData(data);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            // If no quiz found, just complete the lesson
            await completeLesson(lessonId, lesson?.course_id || '');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (score: number) => {
        if (lesson) {
            await completeLesson(lesson.id, lesson.course_id, score);
            router.back();
        }
    };

    if (loading) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AccessibleText className="text-text-secondary mt-4">Preparando cuestionario...</AccessibleText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper safeArea={true}>
            {quizData ? (
                <QuizComponent
                    questions={quizData.questions}
                    onComplete={handleComplete}
                    onCancel={() => router.back()}
                />
            ) : (
                <View className="flex-1 items-center justify-center p-6">
                    <AccessibleText className="text-text-secondary">No hay cuestionario para esta lección.</AccessibleText>
                    <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-6 py-3 rounded-2xl">
                        <AccessibleText weight="bold" className="text-white">Volver</AccessibleText>
                    </TouchableOpacity>
                </View>
            )}
        </ScreenWrapper>
    );
}
