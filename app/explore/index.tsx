import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

export default function ExploreScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const categories = [
        { id: 'exercises', title: 'Ejercicios', icon: 'barbell-outline', color: '#3b82f6', description: 'Biblioteca completa con técnica y videos' },
        { id: 'routines', title: 'Rutinas', icon: 'list-outline', color: '#10b981', description: 'Planes predefinidos para todos los niveles' },
        { id: 'academy', title: 'Academia', icon: 'school-outline', color: '#f59e0b', description: 'Aprende sobre nutrición y entrenamiento' },
        { id: 'challenges', title: 'Desafíos', icon: 'trophy-outline', color: '#8b5cf6', description: 'Únete a retos de la comunidad' },
    ];

    return (
        <ScreenWrapper bg="bg-background" safeArea={true}>
            <View className="p-4 border-b border-border/10 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 p-2 bg-surface-highlight rounded-full"
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <AccessibleText weight="bold" className="text-text text-2xl">Explorar</AccessibleText>
                    <AccessibleText className="text-text-secondary text-sm">Descubre contenido para potenciar tu entrenamiento</AccessibleText>
                </View>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Search Bar Placeholder */}
                <TouchableOpacity
                    className="bg-surface-highlight p-4 rounded-2xl mb-6 flex-row items-center border border-border/10"
                    activeOpacity={0.7}
                >
                    <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                    <AccessibleText className="text-text-muted ml-3">Buscar ejercicios, rutinas...</AccessibleText>
                </TouchableOpacity>

                {/* Categories Grid */}
                <View className="flex-row flex-wrap justify-between mb-6">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            className="w-[48%] mb-4"
                            activeOpacity={0.8}
                        >
                            <Card variant="glass" className="p-4 h-40 justify-between">
                                <View className="bg-surface-highlight w-12 h-12 rounded-2xl items-center justify-center">
                                    <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                                </View>
                                <View>
                                    <AccessibleText weight="bold" className="text-text text-lg">{cat.title}</AccessibleText>
                                    <AccessibleText className="text-text-muted text-[10px]" numberOfLines={2}>{cat.description}</AccessibleText>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Featured Section */}
                <AccessibleText weight="bold" className="text-text text-xl mb-4">Destacado</AccessibleText>

                <TouchableOpacity className="mb-6" activeOpacity={0.9}>
                    <Card variant="glass" className="overflow-hidden p-0">
                        <View className="bg-primary/20 h-40 items-center justify-center">
                            <Ionicons name="sparkles" size={48} color={colors.primary} />
                        </View>
                        <View className="p-4">
                            <AccessibleText weight="bold" className="text-text text-lg">Guía de Hipertrofia 2024</AccessibleText>
                            <AccessibleText className="text-text-secondary text-sm">Todo lo que necesitas saber para maximizar tus ganancias.</AccessibleText>
                        </View>
                    </Card>
                </TouchableOpacity>

                <View className="h-20" />
            </ScrollView>
        </ScreenWrapper>
    );
}
