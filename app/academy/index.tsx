import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useAcademyStore } from '@/store/academyStore';
import { CourseCard } from '@/components/academy/CourseCard';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const CATEGORIES = [
    { id: 'all', label: 'Todos', icon: 'apps' },
    { id: 'training', label: 'Entrenamiento', icon: 'barbell' },
    { id: 'nutrition', label: 'Nutrición', icon: 'restaurant' },
    { id: 'recovery', label: 'Recuperación', icon: 'bed' },
    { id: 'mindset', label: 'Mentalidad', icon: 'brain' },
];

export default function AcademyScreen() {
    const router = useRouter();
    const { theme, isDark } = useAppTheme();
    const colors = Colors[theme];
    const { courses, loading, fetchCourses, getCourseProgress } = useAcademyStore();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCourses();
        setRefreshing(false);
    };

    const filteredCourses = selectedCategory === 'all'
        ? courses
        : courses.filter(c => c.category === selectedCategory);

    return (
        <ScreenWrapper safeArea={true}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Header */}
                <View className="px-6 pt-4 pb-6">
                    <View className="flex-row justify-between items-center mb-2">
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest">
                            Plataforma Educativa
                        </AccessibleText>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <AccessibleText weight="bold" className="text-text text-4xl font-black">
                        The Academy
                    </AccessibleText>
                    <AccessibleText className="text-text-secondary mt-2">
                        Aprende la ciencia detrás de tu transformación.
                    </AccessibleText>
                </View>

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-6 mb-6"
                    contentContainerStyle={{ paddingRight: 40 }}
                >
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setSelectedCategory(cat.id)}
                            className={`mr-3 px-4 py-2.5 rounded-2xl flex-row items-center border active:scale-95 ${selectedCategory === cat.id
                                ? 'bg-primary border-primary'
                                : 'bg-surface-highlight/50 border-border/10'
                                }`}
                        >
                            <Ionicons
                                name={cat.icon as any}
                                size={16}
                                color={selectedCategory === cat.id ? '#fff' : colors.textSecondary}
                            />
                            <AccessibleText
                                weight="bold"
                                className={`ml-2 text-sm ${selectedCategory === cat.id ? 'text-white' : 'text-text-secondary'}`}
                            >
                                {cat.label}
                            </AccessibleText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Courses List */}
                <View className="px-6 pb-10">
                    {loading && !refreshing ? (
                        <View className="py-20 items-center">
                            <ActivityIndicator size="large" color={colors.primary} />
                            <AccessibleText className="text-text-secondary mt-4">Cargando cursos...</AccessibleText>
                        </View>
                    ) : filteredCourses.length > 0 ? (
                        filteredCourses.map((course, index) => (
                            <Animated.View key={course.id} entering={FadeInDown.delay(index * 100).springify()}>
                                <CourseCard
                                    course={course}
                                    progress={getCourseProgress(course.id)}
                                    onPress={() => router.push(`/academy/${course.id}`)}
                                />
                            </Animated.View>
                        ))
                    ) : (
                        <View className="py-20 items-center bg-surface-highlight/20 rounded-3xl border border-dashed border-border/20">
                            <Ionicons name="search" size={48} color={colors.textMuted} />
                            <AccessibleText weight="bold" className="text-text-secondary mt-4">No hay cursos disponibles</AccessibleText>
                            <AccessibleText className="text-text-muted text-center px-10 mt-2">
                                Estamos trabajando en nuevo contenido para esta categoría.
                            </AccessibleText>
                        </View>
                    )}
                </View>

                {/* Featured Section */}
                <View className="px-6 mb-10">
                    <LinearGradient
                        colors={isDark ? ['#1e40af', '#4338ca'] : ['#3b82f6', '#6366f1']}
                        className="p-6 rounded-3xl"
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="bg-white/20 p-2 rounded-xl">
                                <Ionicons name="trophy" size={24} color="#fff" />
                            </View>
                            <View className="bg-white/20 px-3 py-1 rounded-full">
                                <AccessibleText weight="bold" className="text-white text-[10px] uppercase">Próximamente</AccessibleText>
                            </View>
                        </View>
                        <AccessibleText weight="bold" className="text-white text-xl">
                            Certificaciones Mambo
                        </AccessibleText>
                        <AccessibleText className="text-white/80 text-sm mt-2">
                            Completa rutas de aprendizaje y obtén insignias exclusivas para tu perfil.
                        </AccessibleText>
                    </LinearGradient>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
