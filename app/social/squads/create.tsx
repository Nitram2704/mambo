import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function CreateSquadScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name) {
            Alert.alert(t('common.error'), t('social.squads.nameRequired') || 'Por favor, introduce un nombre para el Squad');
            return;
        }

        setLoading(true);
        try {
            // Mock creation logic for now
            setTimeout(() => {
                setLoading(false);
                Alert.alert(t('common.success'), t('social.squads.createSuccess') || 'Squad creado correctamente', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }, 1500);
        } catch (error) {
            setLoading(false);
            Alert.alert(t('common.error'), t('social.squads.createError') || 'No se pudo crear el Squad');
        }
    };

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1 px-6">
                <View className="flex-row items-center justify-between py-4">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h1" weight="black" className="text-text tracking-tighter">
                        {t('social.squads.create')}
                    </AccessibleText>
                    <View className="w-10" />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <View className="items-center my-8">
                        <TouchableOpacity className="w-24 h-24 bg-primary/10 rounded-3xl border-2 border-dashed border-primary/30 items-center justify-center">
                            <Ionicons name="camera" size={32} color={colors.primary} />
                            <AccessibleText weight="bold" className="text-primary text-[10px] mt-1">BANNER</AccessibleText>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-6">
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 ml-1">
                            {t('social.squads.nameLabel') || 'Nombre del Squad'}
                        </AccessibleText>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Ej: Mambo Warriors"
                            placeholderTextColor={colors.textMuted}
                            className="bg-surface-highlight/30 p-4 rounded-2xl text-white text-base border border-white/5"
                        />
                    </View>

                    <View className="mb-6">
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 ml-1">
                            {t('social.squads.descriptionLabel') || 'Descripción'}
                        </AccessibleText>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder={t('social.squads.descriptionPlaceholder') || '¿De qué trata este equipo?'}
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={3}
                            className="bg-surface-highlight/30 p-4 rounded-2xl text-white text-base border border-white/5 min-h-[100px]"
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="mb-8">
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-3 ml-1">
                            {t('social.squads.privacyLabel') || 'Privacidad'}
                        </AccessibleText>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setPrivacy('public')}
                                className={`flex-1 p-4 rounded-2xl border ${privacy === 'public' ? 'bg-primary/10 border-primary' : 'bg-surface-highlight/30 border-white/5'}`}
                            >
                                <Ionicons name="earth" size={24} color={privacy === 'public' ? colors.primary : colors.textMuted} />
                                <AccessibleText weight="bold" className={`mt-2 ${privacy === 'public' ? 'text-primary' : 'text-text'}`}>{t('social.squads.public') || 'Público'}</AccessibleText>
                                <AccessibleText className="text-text-secondary text-[10px] mt-1">{t('social.squads.publicDesc') || 'Cualquiera puede unirse'}</AccessibleText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setPrivacy('private')}
                                className={`flex-1 p-4 rounded-2xl border ${privacy === 'private' ? 'bg-primary/10 border-primary' : 'bg-surface-highlight/30 border-white/5'}`}
                            >
                                <Ionicons name="lock-closed" size={24} color={privacy === 'private' ? colors.primary : colors.textMuted} />
                                <AccessibleText weight="bold" className={`mt-2 ${privacy === 'private' ? 'text-primary' : 'text-text'}`}>{t('social.squads.private') || 'Privado'}</AccessibleText>
                                <AccessibleText className="text-text-secondary text-[10px] mt-1">{t('social.squads.privateDesc') || 'Solo por invitación'}</AccessibleText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                <View className="py-6">
                    <TouchableOpacity onPress={handleCreate} disabled={loading}>
                        <LinearGradient
                            colors={Colors.gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className={`py-4 rounded-2xl items-center shadow-lg shadow-primary/20 ${loading ? 'opacity-50' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="black" />
                            ) : (
                                <AccessibleText weight="black" className="text-black text-lg uppercase tracking-wider">
                                    {t('social.squads.createButton') || 'Crear Wolfpack'}
                                </AccessibleText>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
}
