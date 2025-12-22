import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { MINI_LESSONS } from '@/data/miniLessons';
import { useAchievementsStore } from '@/store/achievementsStore';
import { Infographic } from './Infographic';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

interface QuizState {
    currentQuestion: number;
    answers: number[];
    showResults: boolean;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface LessonSection {
    title: string;
    content: string;
    infographic?: string;
}

export const MiniLessonViewer: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme, isDark } = useAppTheme();
    const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
    const { incrementLessonsCompleted, addXp } = useAchievementsStore();

    const [quizState, setQuizState] = useState<QuizState>({
        currentQuestion: 0,
        answers: [],
        showResults: false
    });

    const lessonMetadata = MINI_LESSONS.find(l => l.id === lessonId);

    if (!lessonMetadata) {
        return (
            <ScreenWrapper>
                <View className="flex-1 items-center justify-center">
                    <Text style={{ color: Colors[theme].text }}>{t('common.error')}</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ backgroundColor: Colors[theme].primary }}
                        className="mt-4 px-6 py-3 rounded-xl">
                        <Text className="text-white font-bold">{t('common.back')}</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    // Get translated content
    const title = t(`learn.miniLessons.lessons.${lessonId}.title`);
    const description = t(`learn.miniLessons.lessons.${lessonId}.description`);
    const introduction = t(`learn.miniLessons.lessons.${lessonId}.introduction`);
    const sections = t(`learn.miniLessons.lessons.${lessonId}.sections`, { returnObjects: true }) as LessonSection[];
    const keyTakeaways = t(`learn.miniLessons.lessons.${lessonId}.keyTakeaways`, { returnObjects: true }) as string[];
    const quiz = t(`learn.miniLessons.lessons.${lessonId}.quiz`, { returnObjects: true }) as QuizQuestion[];

    const handleQuizAnswer = (answerIndex: number) => {
        const newAnswers = [...quizState.answers];
        newAnswers[quizState.currentQuestion] = answerIndex;

        if (quizState.currentQuestion < quiz.length - 1) {
            setQuizState({
                ...quizState,
                answers: newAnswers,
                currentQuestion: quizState.currentQuestion + 1
            });
        } else {
            // Quiz completed
            setQuizState({
                ...quizState,
                answers: newAnswers,
                showResults: true
            });

            // Check if all answers are correct
            const allCorrect = quiz.every((q, index) => newAnswers[index] === q.correctAnswer);
            if (allCorrect) {
                incrementLessonsCompleted();
                addXp(15, 'Completed mini-lesson quiz');
                Alert.alert(
                    t('learn.miniLessons.quiz.excellent'),
                    t('learn.miniLessons.quiz.successMessage'),
                    [{ text: t('common.ok') }]
                );
            } else {
                Alert.alert(
                    t('learn.miniLessons.quiz.goodTry'),
                    t('learn.miniLessons.quiz.failMessage'),
                    [{ text: t('common.ok') }]
                );
            }
        }
    };

    const restartQuiz = () => {
        setQuizState({
            currentQuestion: 0,
            answers: [],
            showResults: false
        });
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return isDark ? 'bg-green-500/20' : 'bg-green-100';
            case 'Intermediate': return isDark ? 'bg-yellow-500/20' : 'bg-yellow-100';
            case 'Advanced': return isDark ? 'bg-red-500/20' : 'bg-red-100';
            default: return isDark ? 'bg-gray-500/20' : 'bg-gray-100';
        }
    };

    const getDifficultyTextColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return '#22c55e';
            case 'Intermediate': return '#eab308';
            case 'Advanced': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getDifficultyText = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return t('levels.beginner');
            case 'Intermediate': return t('levels.intermediate');
            case 'Advanced': return t('levels.advanced');
            default: return t('levels.all');
        }
    };

    if (quizState.showResults) {
        const score = quiz.reduce((acc, q, index) => {
            return acc + (quizState.answers[index] === q.correctAnswer ? 1 : 0);
        }, 0);

        return (
            <ScreenWrapper>
                <View className="flex-row items-center justify-between p-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <Text style={{ color: Colors[theme].text }} className="text-xl font-bold">{t('learn.miniLessons.quiz.results')}</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView className="flex-1 p-4">
                    <Card className="p-6 mb-6">
                        <Text style={{ color: Colors[theme].text }} className="text-2xl font-bold text-center mb-4">
                            {title}
                        </Text>
                        <View className="items-center mb-6">
                            <Text className="text-4xl font-bold mb-2" style={{ color: score === quiz.length ? '#22c55e' : '#f59e0b' }}>
                                {score}/{quiz.length}
                            </Text>
                            <Text style={{ color: Colors[theme].textSecondary }}>
                                {score === quiz.length ? t('learn.miniLessons.quiz.excellent') : t('learn.miniLessons.quiz.goodTry')}
                            </Text>
                        </View>

                        {quiz.map((q, index) => (
                            <View key={index} className="mb-4 p-4 rounded-lg" style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
                                <Text style={{ color: Colors[theme].text }} className="font-bold mb-2">
                                    {index + 1}. {q.question}
                                </Text>
                                <Text style={{ color: Colors[theme].textSecondary }} className="mb-2">
                                    {t('learn.miniLessons.quiz.yourAnswer')}: {q.options[quizState.answers[index]]}
                                </Text>
                                <Text className="text-green-400 mb-2">
                                    {t('learn.miniLessons.quiz.correctAnswer')}: {q.options[q.correctAnswer]}
                                </Text>
                                <Text style={{ color: Colors[theme].textSecondary }} className="text-sm italic">
                                    {q.explanation}
                                </Text>
                            </View>
                        ))}

                        <TouchableOpacity
                            onPress={restartQuiz}
                            style={{ backgroundColor: Colors[theme].primary }}
                            className="p-4 rounded-xl items-center mt-4">
                            <Text className="text-white font-bold">{t('learn.miniLessons.quiz.retry')}</Text>
                        </TouchableOpacity>
                    </Card>
                </ScrollView>
            </ScreenWrapper>
        );
    }

    if (quizState.currentQuestion > 0 || quizState.answers.length > 0) {
        // Quiz mode
        const currentQ = quiz[quizState.currentQuestion];

        return (
            <ScreenWrapper>
                <View className="flex-row items-center justify-between p-4">
                    <TouchableOpacity onPress={() => setQuizState({ currentQuestion: 0, answers: [], showResults: false })}>
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <Text style={{ color: Colors[theme].text }} className="text-xl font-bold">
                        {t('learn.miniLessons.quiz.title')} - {quizState.currentQuestion + 1}/{quiz.length}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView className="flex-1 p-4">
                    <Card className="p-6">
                        <Text style={{ color: Colors[theme].text }} className="text-xl font-bold mb-6">
                            {currentQ.question}
                        </Text>

                        {currentQ.options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleQuizAnswer(index)}
                                style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
                                className="p-4 rounded-lg mb-3 border border-transparent active:border-blue-500">
                                <Text style={{ color: Colors[theme].text }} className="text-lg">
                                    {String.fromCharCode(65 + index)}. {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </Card>
                </ScrollView>
            </ScreenWrapper>
        );
    }

    // Lesson content mode
    return (
        <ScreenWrapper>
            <View className="flex-row items-center justify-between p-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                </TouchableOpacity>
                <Text style={{ color: Colors[theme].text }} className="text-xl font-bold">{t('learn.miniLessons.lesson')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1">
                {/* Header */}
                <View className="p-6">
                    <View className="flex-row items-center mb-3">
                        <View className={`px-3 py-1 rounded-full mr-3 ${getDifficultyColor(lessonMetadata.difficulty)}`}>
                            <Text style={{ color: getDifficultyTextColor(lessonMetadata.difficulty) }} className="text-xs font-bold">
                                {getDifficultyText(lessonMetadata.difficulty)}
                            </Text>
                        </View>
                        <Text style={{ color: Colors[theme].textSecondary }} className="text-sm">
                            {lessonMetadata.estimatedTime} {t('learn.miniLessons.readingTime')}
                        </Text>
                    </View>

                    <Text style={{ color: Colors[theme].text }} className="text-2xl font-bold mb-2">
                        {title}
                    </Text>
                    <Text style={{ color: Colors[theme].textSecondary }} className="text-lg">
                        {description}
                    </Text>
                </View>

                {/* Content */}
                <View className="p-6">
                    <Text style={{ color: Colors[theme].text }} className="text-lg mb-6 leading-7">
                        {introduction}
                    </Text>

                    {sections.map((section, index) => (
                        <View key={index} className="mb-8">
                            <Text style={{ color: Colors[theme].text }} className="text-xl font-bold mb-3">
                                {section.title}
                            </Text>
                            <Text style={{ color: Colors[theme].textSecondary }} className="text-base leading-6 mb-4">
                                {section.content}
                            </Text>
                            {section.infographic && <Infographic type={section.infographic} />}
                        </View>
                    ))}

                    {/* Key Takeaways */}
                    <Card className="p-4 mb-8">
                        <Text style={{ color: Colors[theme].text }} className="text-lg font-bold mb-3">{t('learn.miniLessons.keyTakeaways')}</Text>
                        {keyTakeaways.map((takeaway, index) => (
                            <View key={index} className="flex-row items-start mb-2">
                                <Ionicons name="checkmark-circle" size={18} color="#22c55e" className="mr-2" />
                                <Text style={{ color: Colors[theme].textSecondary }} className="flex-1 leading-5">{takeaway}</Text>
                            </View>
                        ))}
                    </Card>

                    {/* Start Quiz Button */}
                    <TouchableOpacity
                        onPress={() => setQuizState({ currentQuestion: 0, answers: [], showResults: false })}
                        style={{ backgroundColor: '#f97316' }}
                        className="p-4 rounded-xl items-center mb-10 shadow-lg shadow-orange-500/30">
                        <Text className="text-white font-bold text-lg">
                            {t('learn.miniLessons.quiz.start')} ({quiz.length} {t('learn.miniLessons.quiz.questions')})
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};