import React from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Stack } from 'expo-router';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const features = [
        {
            icon: 'barbell' as const,
            title: 'Entrenamientos Personalizados',
            description: 'Rutinas adaptadas a tus objetivos'
        },
        {
            icon: 'nutrition' as const,
            title: 'Plan Nutricional',
            description: 'Alcanza tus metas con la dieta perfecta'
        },
        {
            icon: 'analytics' as const,
            title: 'Seguimiento Completo',
            description: 'Monitorea tu progreso en tiempo real'
        },
        {
            icon: 'chatbubbles' as const,
            title: 'Coach IA 24/7',
            description: 'Asistente personal siempre disponible'
        }
    ];

    return (
        <View className="flex-1">
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={theme === 'dark' ? ['#09090b', '#18181b'] : ['#ffffff', '#f4f4f5']}
                className="flex-1"
            >
                <SafeAreaView className="flex-1">
                    {/* Logo Section */}
                    <Animated.View
                        entering={FadeInUp.delay(200).springify()}
                        className="items-center pt-12 pb-8"
                    >
                        <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center mb-6 shadow-glow rotate-3">
                            <Ionicons name="fitness" size={56} color="black" />
                        </View>
                        <AccessibleText weight="black" className="text-text text-5xl tracking-tighter">MAMBO</AccessibleText>
                        <AccessibleText weight="bold" className="text-primary text-xl tracking-widest uppercase -mt-1">FITNESS</AccessibleText>
                        <AccessibleText className="text-text-secondary text-base mt-4 font-medium">Tu coach personal de bolsillo</AccessibleText>
                    </Animated.View>

                    {/* Features Grid */}
                    <View className="flex-1 px-6 py-4 justify-center">
                        {features.map((feature, index) => (
                            <Animated.View
                                key={index}
                                entering={FadeInDown.delay(400 + index * 100).springify()}
                                className="flex-row items-center mb-6 bg-surface/40 backdrop-blur-md rounded-2xl p-5 border border-white/5"
                            >
                                <View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center mr-4">
                                    <Ionicons name={feature.icon} size={24} color={colors.primary} />
                                </View>
                                <View className="flex-1">
                                    <AccessibleText weight="bold" className="text-text text-lg">{feature.title}</AccessibleText>
                                    <AccessibleText className="text-text-secondary text-sm mt-0.5 font-medium">{feature.description}</AccessibleText>
                                </View>
                            </Animated.View>
                        ))}
                    </View>

                    {/* CTA Buttons */}
                    <Animated.View
                        entering={FadeInUp.delay(800).springify()}
                        className="px-6 pb-8"
                    >
                        <TouchableOpacity
                            onPress={() => router.push('/register')}
                            className="mb-4 shadow-glow animate-pulse"
                        >
                            <LinearGradient
                                colors={Colors.gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-2xl py-5 items-center"
                            >
                                <AccessibleText weight="black" className="text-black text-lg uppercase tracking-wider">Comenzar Ahora</AccessibleText>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/auth')}
                            className="bg-surface/50 backdrop-blur-md rounded-2xl py-5 items-center border border-white/10"
                        >
                            <AccessibleText weight="bold" className="text-text text-lg">Ya tengo cuenta</AccessibleText>
                        </TouchableOpacity>

                        <AccessibleText className="text-text-muted text-xs text-center mt-6 font-medium">
                            Al continuar, aceptas nuestros Términos y Condiciones
                        </AccessibleText>
                    </Animated.View>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
}
