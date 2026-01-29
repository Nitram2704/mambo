import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface QuizComponentProps {
    questions: Question[];
    onComplete: (score: number) => void;
    onCancel: () => void;
}

export function QuizComponent({ questions, onComplete, onCancel }: QuizComponentProps) {
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];

    const handleNext = () => {
        if (selectedOption === null) return;

        const isCorrect = selectedOption === currentQuestion.correctAnswer;
        const newScore = isCorrect ? score + 1 : score;
        setScore(newScore);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            setShowResult(true);
        }
    };

    const finalScorePercentage = Math.round((score / questions.length) * 100);

    if (showResult) {
        return (
            <View className="flex-1 justify-center p-6">
                <Card variant="glass" className="p-8 items-center">
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${finalScorePercentage >= 70 ? 'bg-success/20' : 'bg-error/20'
                        }`}>
                        <Ionicons
                            name={finalScorePercentage >= 70 ? 'trophy' : 'alert-circle'}
                            size={40}
                            color={finalScorePercentage >= 70 ? colors.success : colors.error}
                        />
                    </View>

                    <AccessibleText weight="bold" className="text-text text-2xl text-center">
                        {finalScorePercentage >= 70 ? '¡Excelente Trabajo!' : 'Sigue Intentando'}
                    </AccessibleText>

                    <AccessibleText className="text-text-secondary text-center mt-2 mb-8">
                        Has obtenido un {finalScorePercentage}% de aciertos.
                    </AccessibleText>

                    <View className="w-full gap-3">
                        <TouchableOpacity
                            onPress={() => onComplete(finalScorePercentage)}
                            className="bg-primary py-4 rounded-2xl items-center"
                        >
                            <AccessibleText weight="bold" className="text-white">Finalizar</AccessibleText>
                        </TouchableOpacity>

                        {finalScorePercentage < 70 && (
                            <TouchableOpacity
                                onPress={onCancel}
                                className="bg-surface-highlight py-4 rounded-2xl items-center"
                            >
                                <AccessibleText weight="bold" className="text-text">Repasar Lección</AccessibleText>
                            </TouchableOpacity>
                        )}
                    </View>
                </Card>
            </View>
        );
    }

    return (
        <View className="flex-1 p-6">
            {/* Progress */}
            <View className="flex-row justify-between items-center mb-8">
                <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest">
                    Pregunta {currentQuestionIndex + 1} de {questions.length}
                </AccessibleText>
                <TouchableOpacity onPress={onCancel}>
                    <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
            </View>

            <View className="h-2 bg-surface-highlight rounded-full overflow-hidden mb-10">
                <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
            </View>

            {/* Question */}
            <Animated.View
                key={currentQuestionIndex}
                entering={FadeInRight}
                exiting={FadeOutLeft}
                className="flex-1"
            >
                <AccessibleText weight="bold" className="text-text text-2xl mb-8">
                    {currentQuestion.question}
                </AccessibleText>

                <View className="gap-3">
                    {currentQuestion.options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedOption(index)}
                            className={`p-5 rounded-2xl border ${selectedOption === index
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-surface-highlight/50 border-border/10'
                                }`}
                        >
                            <View className="flex-row items-center">
                                <View className={`w-6 h-6 rounded-full border items-center justify-center mr-4 ${selectedOption === index ? 'border-primary bg-primary' : 'border-border'
                                    }`}>
                                    {selectedOption === index && <Ionicons name="checkmark" size={14} color="#fff" />}
                                </View>
                                <AccessibleText className={`flex-1 ${selectedOption === index ? 'text-primary font-bold' : 'text-text'}`}>
                                    {option}
                                </AccessibleText>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </Animated.View>

            {/* Next Button */}
            <TouchableOpacity
                onPress={handleNext}
                disabled={selectedOption === null}
                className={`py-4 rounded-2xl items-center mb-6 ${selectedOption === null ? 'bg-surface-highlight opacity-50' : 'bg-primary'
                    }`}
            >
                <AccessibleText weight="bold" className="text-white text-lg">
                    {currentQuestionIndex === questions.length - 1 ? 'Finalizar Quiz' : 'Siguiente'}
                </AccessibleText>
            </TouchableOpacity>
        </View>
    );
}
