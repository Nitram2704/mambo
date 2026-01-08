import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface ActionCardProps {
    type: string;
    args: any;
    status: 'pending' | 'success' | 'error';
    result?: any;
}

export function ActionCard({ type, args, status, result }: ActionCardProps) {
    const router = useRouter();

    const getIcon = () => {
        switch (type) {
            case 'schedule_workout': return 'calendar';
            case 'log_food': return 'restaurant';
            case 'create_weekly_plan': return 'list';
            case 'skip_workout': return 'bed';
            case 'adjust_weekly_routine': return 'refresh-circle';
            case 'modify_todays_meals': return 'create';
            case 'generate_meal_plan': return 'nutrition';
            case 'adjust_intensity': return 'barbell';
            case 'analyze_recovery': return 'heart';
            case 'substitute_exercise': return 'swap-horizontal';
            default: return 'construct';
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'schedule_workout': return 'Programar Entreno';
            case 'log_food': return 'Registrar Comida';
            case 'create_weekly_plan': return 'Crear Agenda Semanal';
            case 'skip_workout': return 'Saltar Entreno';
            case 'adjust_weekly_routine': return 'Ajustar Rutina Semanal';
            case 'modify_todays_meals': return 'Modificar Comidas';
            case 'generate_meal_plan': return 'Generar Plan Nutricional';
            case 'adjust_intensity': return 'Ajustar Intensidad';
            case 'analyze_recovery': return 'Analizar Recuperación';
            case 'substitute_exercise': return 'Sustituir Ejercicio';
            default: return 'Acción Ejecutada';
        }
    };

    const getGradientColors = (): [string, string] => {
        switch (status) {
            case 'success':
                return ['rgba(34, 197, 94, 0.1)', 'rgba(22, 163, 74, 0.05)'];
            case 'error':
                return ['rgba(239, 68, 68, 0.1)', 'rgba(185, 28, 28, 0.05)'];
            default:
                return ['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.05)'];
        }
    };

    const renderDetails = () => {
        switch (type) {
            case 'schedule_workout':
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-white font-bold text-lg">{args.routineName}</Text>
                        <Text className="text-gray-400">📅 {args.date}</Text>
                    </Animated.View>
                );
            case 'log_food':
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-white font-bold text-lg">{args.foodName}</Text>
                        <Text className="text-gray-400">🔥 {args.calories} kcal • 🍽️ {args.mealType}</Text>
                        {args.protein && <Text className="text-gray-500 text-sm">🥩 {args.protein}g proteína</Text>}
                    </Animated.View>
                );
            case 'create_weekly_plan':
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-white font-bold text-lg">{args.daysPerWeek} días/semana</Text>
                        <Text className="text-gray-400">🎯 Enfoque: {args.focus || 'General'}</Text>
                    </Animated.View>
                );
            case 'skip_workout':
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-white font-bold text-lg">💤 Día de Descanso</Text>
                        <Text className="text-gray-400">📅 {args.date || 'Hoy'}</Text>
                    </Animated.View>
                );
            case 'adjust_weekly_routine':
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-white font-bold text-lg">🔄 Rutina Ajustada</Text>
                        <Text className="text-gray-400">
                            📊 {args.daysPerWeek ? `${args.daysPerWeek} días` : 'Días ajustados'}
                            {args.focus && ` • 🎯 ${args.focus}`}
                        </Text>
                    </Animated.View>
                );
            case 'modify_todays_meals':
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-white font-bold text-lg">🍽️ Comidas Modificadas</Text>
                        <Text className="text-gray-400">
                            📅 {args.date ? new Date(args.date).toLocaleDateString('es-ES') : 'Hoy'}
                            {args.addCalories && ` • ➕ ${args.addCalories} kcal añadidas`}
                        </Text>
                    </Animated.View>
                );
            case 'generate_meal_plan':
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-white font-bold text-lg">📋 Plan Nutricional</Text>
                        <Text className="text-gray-400">
                            🔥 {args.calories} kcal/día
                            {args.dietType && ` • 🍽️ ${args.dietType}`}
                        </Text>
                    </Animated.View>
                );
            case 'adjust_intensity':
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-white font-bold text-lg">💪 Intensidad Ajustada</Text>
                        <Text className="text-gray-400">
                            📈 Factor: {args.factor > 1 ? 'Aumentada' : 'Reducida'}
                            {args.routineId && ' • 🎯 Rutina específica'}
                        </Text>
                    </Animated.View>
                );
            case 'analyze_recovery':
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-white font-bold text-lg">❤️ Análisis de Recuperación</Text>
                        <Text className="text-gray-400">📊 Evaluando sueño y fatiga</Text>
                    </Animated.View>
                );
            case 'substitute_exercise':
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-white font-bold text-lg">🔄 Ejercicio Sustituido</Text>
                        <Text className="text-gray-400">
                            ❌ {args.oldExerciseName} → ✅ {args.newExerciseName}
                        </Text>
                    </Animated.View>
                );
            default:
                return (
                    <Animated.View entering={FadeIn.delay(200)}>
                        <Text className="text-gray-400">{JSON.stringify(args)}</Text>
                    </Animated.View>
                );
        }
    };

    return (
        <Animated.View entering={ZoomIn.delay(100).springify()} className="my-2 rounded-2xl overflow-hidden border border-white/10">
            <LinearGradient
                colors={getGradientColors()}
                className="p-4"
            >
                <View className="flex-row items-center mb-3">
                    <Animated.View
                        entering={ZoomIn.delay(300).springify()}
                        className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${status === 'success' ? 'bg-green-500/20' :
                            status === 'error' ? 'bg-red-500/20' : 'bg-blue-500/20'
                            }`}
                    >
                        <Ionicons
                            name={getIcon()}
                            size={16}
                            color={
                                status === 'success' ? '#4ade80' :
                                    status === 'error' ? '#ef4444' : '#60a5fa'
                            }
                        />
                    </Animated.View>
                    <Text className="text-gray-300 font-medium text-xs uppercase tracking-wider">
                        {getTitle()}
                    </Text>
                    <View className="flex-1" />
                    {status === 'success' && (
                        <Animated.View entering={ZoomIn.delay(500).springify()}>
                            <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                        </Animated.View>
                    )}
                    {status === 'error' && (
                        <Animated.View entering={ZoomIn.delay(500).springify()}>
                            <Ionicons name="close-circle" size={16} color="#ef4444" />
                        </Animated.View>
                    )}
                </View>

                {renderDetails()}

                {status === 'success' && result && (
                    <Animated.View entering={FadeIn.delay(400)} className="mt-3 pt-3 border-t border-white/5 flex-row items-center justify-between">
                        <Text className="text-green-400 text-xs flex-1 mr-2">{typeof result === 'string' ? result : '✅ Acción completada exitosamente'}</Text>

                        {/* Action-specific navigation buttons */}
                        {type === 'schedule_workout' && (
                            <TouchableOpacity
                                onPress={() => router.push('/workout/schedule' as any)}
                                className="bg-green-500/20 px-2 py-1 rounded-lg"
                            >
                                <Text className="text-green-400 text-[10px] font-bold">VER AGENDA</Text>
                            </TouchableOpacity>
                        )}
                        {type === 'generate_meal_plan' && (
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/nutricion' as any)}
                                className="bg-green-500/20 px-2 py-1 rounded-lg"
                            >
                                <Text className="text-green-400 text-[10px] font-bold">VER PLAN</Text>
                            </TouchableOpacity>
                        )}
                        {type === 'substitute_exercise' && (
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)' as any)}
                                className="bg-green-500/20 px-2 py-1 rounded-lg"
                            >
                                <Text className="text-green-400 text-[10px] font-bold">VER RUTINA</Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                )}

                {status === 'error' && result && (
                    <Animated.View entering={FadeIn.delay(400)} className="mt-3 pt-3 border-t border-white/5">
                        <Text className="text-red-400 text-xs">❌ {typeof result === 'string' ? result : 'Error en la acción'}</Text>
                    </Animated.View>
                )}
            </LinearGradient>
        </Animated.View>
    );
}
