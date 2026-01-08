import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useCoachStore } from '@/store/coachStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function ClientDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const { fetchClientDetails } = useCoachStore();

    const [clientData, setClientData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadClientDetails();
        }
    }, [id]);

    const loadClientDetails = async () => {
        setLoading(true);
        const data = await fetchClientDetails(id!);
        setClientData(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors[theme].primary} />
                </View>
            </ScreenWrapper>
        );
    }

    if (!clientData) {
        return (
            <ScreenWrapper safeArea={true}>
                <View className="flex-1 items-center justify-center p-6">
                    <AccessibleText className="text-text-secondary text-center">
                        No se pudo cargar la información del cliente.
                    </AccessibleText>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-4 bg-primary px-6 py-2 rounded-xl"
                    >
                        <AccessibleText weight="bold" className="text-white">Volver</AccessibleText>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const { profile, workouts } = clientData;

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/5 rounded-full items-center justify-center mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h2" weight="bold" className="text-text text-xl">
                        Detalles del Cliente
                    </AccessibleText>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    {/* Profile Card */}
                    <Card variant="glass" className="mb-6 p-6 items-center">
                        <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4 border-4 border-primary/10">
                            {profile.avatar_url ? (
                                <Image source={{ uri: profile.avatar_url }} className="w-full h-full rounded-full" />
                            ) : (
                                <Ionicons name="person" size={48} color={Colors[theme].primary} />
                            )}
                        </View>
                        <AccessibleText variant="h3" weight="bold" className="text-text text-xl mb-1">
                            {profile.name}
                        </AccessibleText>
                        <AccessibleText className="text-text-secondary mb-4">
                            {profile.email}
                        </AccessibleText>

                        <View className="flex-row gap-4 w-full">
                            <TouchableOpacity className="flex-1 bg-primary/10 py-3 rounded-2xl items-center">
                                <Ionicons name="chatbubbles-outline" size={20} color={Colors[theme].primary} className="mb-1" />
                                <AccessibleText weight="bold" className="text-primary text-xs">Mensaje</AccessibleText>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-secondary/10 py-3 rounded-2xl items-center">
                                <Ionicons name="calendar-outline" size={20} color={Colors[theme].secondary} className="mb-1" />
                                <AccessibleText weight="bold" className="text-secondary text-xs">Asignar Plan</AccessibleText>
                            </TouchableOpacity>
                        </View>
                    </Card>

                    {/* Stats Summary */}
                    <View className="flex-row gap-4 mb-6">
                        <Card variant="glass" className="flex-1 p-4 items-center">
                            <AccessibleText weight="bold" className="text-primary text-xl">{clientData.stats?.totalWorkouts || workouts.length}</AccessibleText>
                            <AccessibleText className="text-text-secondary text-[10px] uppercase tracking-tighter">Entrenamientos</AccessibleText>
                        </Card>
                        <Card variant="glass" className="flex-1 p-4 items-center">
                            <AccessibleText weight="bold" className="text-secondary text-xl">{clientData.stats?.consistency || 85}%</AccessibleText>
                            <AccessibleText className="text-text-secondary text-[10px] uppercase tracking-tighter">Consistencia</AccessibleText>
                        </Card>
                        <Card variant="glass" className="flex-1 p-4 items-center">
                            <AccessibleText weight="bold" className="text-warning text-xl">{clientData.stats?.streak || 12}</AccessibleText>
                            <AccessibleText className="text-text-secondary text-[10px] uppercase tracking-tighter">Días Racha</AccessibleText>
                        </Card>
                    </View>

                    {/* Feedback Section */}
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4">
                        FEEDBACK RECIENTE
                    </AccessibleText>
                    {clientData.feedback?.length > 0 ? (
                        clientData.feedback.map((f: any) => (
                            <Card key={f.id} variant="glass" className="mb-3 p-4">
                                <AccessibleText className="text-text text-sm mb-2">{f.content}</AccessibleText>
                                <AccessibleText className="text-text-secondary text-[10px]">
                                    {new Date(f.created_at).toLocaleDateString()}
                                </AccessibleText>
                            </Card>
                        ))
                    ) : (
                        <AccessibleText className="text-text-secondary text-center py-4 italic text-xs">
                            No hay feedback reciente.
                        </AccessibleText>
                    )}

                    {/* Recent Workouts */}
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4 mt-4">
                        ENTRENAMIENTOS RECIENTES
                    </AccessibleText>
                    {workouts.length > 0 ? (
                        workouts.map((workout: any) => (
                            <Card key={workout.id} variant="glass" className="mb-3 p-4 flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-4">
                                    <Ionicons name="fitness" size={20} color={Colors[theme].text} />
                                </View>
                                <View className="flex-1">
                                    <AccessibleText weight="bold" className="text-text">{workout.name || 'Entrenamiento'}</AccessibleText>
                                    <AccessibleText className="text-text-secondary text-xs">
                                        {new Date(workout.created_at).toLocaleDateString()}
                                    </AccessibleText>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.prompt(
                                            "Enviar Feedback",
                                            "Escribe tu feedback para este entrenamiento:",
                                            [
                                                { text: "Cancelar", style: "cancel" },
                                                {
                                                    text: "Enviar",
                                                    onPress: async (text?: string) => {
                                                        if (text) {
                                                            await useCoachStore.getState().sendFeedbackToClient(id!, workout.id, text);
                                                            Alert.alert("Éxito", "Feedback enviado correctamente.");
                                                            loadClientDetails();
                                                        }
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                    className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors[theme].primary} />
                                </TouchableOpacity>
                            </Card>
                        ))
                    ) : (
                        <AccessibleText className="text-text-secondary text-center py-6 italic">
                            No hay entrenamientos registrados.
                        </AccessibleText>
                    )}
                    <View className="h-10" />
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
