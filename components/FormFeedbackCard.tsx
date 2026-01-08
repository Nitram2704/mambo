import React from 'react';
import { View } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { Card } from './ui/Card';
import { FormCheckResult } from '@/utils/formCheckService';

interface FormFeedbackCardProps {
    result: FormCheckResult;
}

export default function FormFeedbackCard({ result }: FormFeedbackCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <Card className="p-4">
            <View className="items-center mb-4">
                <View className={`w-20 h-20 rounded-full ${getScoreBg(result.score)} items-center justify-center mb-2`}>
                    <ThemedText className="text-white text-2xl font-bold">{result.score}</ThemedText>
                </View>
                <ThemedText className="text-lg font-semibold">Form Score</ThemedText>
            </View>

            <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Feedback</ThemedText>
                {result.feedback.map((item, index) => (
                    <ThemedText key={index} className="text-sm mb-1">• {item}</ThemedText>
                ))}
            </View>

            <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Strengths</ThemedText>
                {result.analysis.strengths.map((item, index) => (
                    <ThemedText key={index} className="text-sm text-green-600 mb-1">✓ {item}</ThemedText>
                ))}
            </View>

            <View className="mb-4">
                <ThemedText className="text-lg font-semibold mb-2">Issues</ThemedText>
                {result.analysis.issues.map((item, index) => (
                    <ThemedText key={index} className="text-sm text-red-600 mb-1">✗ {item}</ThemedText>
                ))}
            </View>

            <View>
                <ThemedText className="text-lg font-semibold mb-2">Corrections</ThemedText>
                {result.analysis.corrections.map((item, index) => (
                    <ThemedText key={index} className="text-sm text-blue-600 mb-1">• {item}</ThemedText>
                ))}
            </View>

            {Object.keys(result.keyPoints).length > 0 && (
                <View className="mt-4">
                    <ThemedText className="text-lg font-semibold mb-2">Key Points</ThemedText>
                    {Object.entries(result.keyPoints).map(([key, value]) => (
                        <ThemedText key={key} className="text-sm mb-1">
                            <ThemedText className="font-medium capitalize">{key}:</ThemedText> {value}
                        </ThemedText>
                    ))}
                </View>
            )}
        </Card>
    );
}