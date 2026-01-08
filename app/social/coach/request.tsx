import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useCoachStore } from '@/store/coachStore';

export default function RequestCoach() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const { requestCoach } = useCoachStore();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequest = async () => {
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Error', 'Por favor ingresa un email válido');
            return;
        }

        setLoading(true);
        try {
            await requestCoach(email);
            Alert.alert('Solicitud Enviada', 'Tu solicitud ha sido enviada al coach. Te avisaremos cuando sea aceptada.');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar la solicitud. Verifica que el email sea correcto.');
        } finally {
            setLoading(false);
        }
    };

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
                        {t('social.coaching.request')}
                    </AccessibleText>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    <Card variant="glass" className="p-6">
                        <View className="items-center mb-6">
                            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
                                <Ionicons name="fitness" size={40} color={Colors[theme].primary} />
                            </View>
                            <AccessibleText className="text-text-secondary text-center">
                                Ingresa el correo electrónico de tu coach para enviarle una solicitud de vinculación.
                            </AccessibleText>
                        </View>

                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2">
                            {t('social.coaching.coachEmail')}
                        </AccessibleText>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="coach@ejemplo.com"
                            placeholderTextColor={Colors[theme].textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="bg-white/5 p-4 rounded-2xl text-text mb-8 border border-white/10"
                        />

                        <Button
                            onPress={handleRequest}
                            variant="primary"
                            label={t('social.coaching.request')}
                            loading={loading}
                        />
                    </Card>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
