import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { AcademyCourse } from '@/store/academyStore';
import { LinearGradient } from 'expo-linear-gradient';

interface CourseCardProps {
    course: AcademyCourse;
    progress: number;
    onPress: () => void;
}

export function CourseCard({ course, progress, onPress }: CourseCardProps) {
    const { theme, isDark } = useAppTheme();
    const colors = Colors[theme];

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'nutrition': return '#3b82f6';
            case 'training': return '#ef4444';
            case 'recovery': return '#10b981';
            case 'mindset': return '#8b5cf6';
            default: return colors.primary;
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'Principiante';
            case 'intermediate': return 'Intermedio';
            case 'advanced': return 'Avanzado';
            default: return difficulty;
        }
    };

    const categoryColor = getCategoryColor(course.category);

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="mb-4 active:scale-95">
            <Card variant="glass" className="overflow-hidden p-0">
                <View className="flex-row">
                    {/* Thumbnail */}
                    <View className="w-32 h-32 bg-surface-highlight">
                        {course.thumbnail_url ? (
                            <Image
                                source={{ uri: course.thumbnail_url }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-full items-center justify-center" style={{ backgroundColor: categoryColor + '20' }}>
                                <Ionicons name="school" size={40} color={categoryColor} />
                            </View>
                        )}
                        {course.is_premium && (
                            <View className="absolute top-2 right-2 bg-secondary px-2 py-0.5 rounded-full shadow-sm">
                                <AccessibleText weight="bold" className="text-white text-[8px] uppercase">Elite</AccessibleText>
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <View className="flex-1 p-4 justify-between">
                        <View>
                            <View className="flex-row justify-between items-start">
                                <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase tracking-widest" style={{ color: categoryColor }}>
                                    {course.category}
                                </AccessibleText>
                                <View className="flex-row items-center">
                                    <Ionicons name="flash" size={10} color={colors.warning} />
                                    <AccessibleText weight="bold" className="text-warning text-[10px] ml-0.5">{course.xp_reward} XP</AccessibleText>
                                </View>
                            </View>
                            <AccessibleText weight="bold" className="text-text text-lg mt-1" numberOfLines={1}>
                                {course.title}
                            </AccessibleText>
                            <AccessibleText className="text-text-secondary text-xs mt-1" numberOfLines={2}>
                                {course.description}
                            </AccessibleText>
                        </View>

                        <View className="flex-row items-center justify-between mt-2">
                            <View className="flex-row items-center">
                                <Ionicons name="stats-chart" size={12} color={colors.textMuted} />
                                <AccessibleText className="text-text-muted text-[10px] ml-1">
                                    {getDifficultyLabel(course.difficulty)}
                                </AccessibleText>
                            </View>

                            <View className="flex-row items-center">
                                <AccessibleText weight="bold" className="text-text text-[10px] mr-2">{progress}%</AccessibleText>
                                <View className="w-16 h-1.5 bg-surface-highlight rounded-full overflow-hidden">
                                    <View
                                        className="h-full rounded-full"
                                        style={{ width: `${progress}%`, backgroundColor: categoryColor }}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
}
