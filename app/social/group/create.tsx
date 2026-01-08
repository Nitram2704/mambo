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
import { useSocialStore } from '@/store/socialStore';

export default function CreateGroup() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const { createGroup } = useSocialStore();

    const [name, setName] = useState('');
    const [type, setType] = useState<'couple' | 'friends' | 'community'>('friends');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Por favor ingresa un nombre para el grupo');
            return;
        }

        setLoading(true);
        const groupId = await createGroup(name, type, description);
        setLoading(false);

        if (groupId) {
            router.replace({ pathname: '/social/group/[id]', params: { id: groupId } });
        } else {
            Alert.alert('Error', 'No se pudo crear el grupo');
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
                        {t('social.groups.create')}
                    </AccessibleText>
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    <Card variant="glass" className="p-6">
                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2">
                            NOMBRE DEL GRUPO
                        </AccessibleText>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Ej: Los Guerreros"
                            placeholderTextColor={Colors[theme].textMuted}
                            className="bg-white/5 p-4 rounded-2xl text-text mb-6 border border-white/10"
                        />

                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2">
                            TIPO DE GRUPO
                        </AccessibleText>
                        <View className="flex-row gap-2 mb-6">
                            {(['couple', 'friends', 'community'] as const).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setType(t)}
                                    className={`flex-1 py-3 rounded-2xl border ${type === t ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}
                                >
                                    <AccessibleText
                                        weight="bold"
                                        className={`text-center text-xs ${type === t ? 'text-primary' : 'text-text-secondary'}`}
                                    >
                                        {t.toUpperCase()}
                                    </AccessibleText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2">
                            DESCRIPCIÓN (OPCIONAL)
                        </AccessibleText>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            placeholder="¿De qué trata este grupo?"
                            placeholderTextColor={Colors[theme].textMuted}
                            multiline
                            numberOfLines={3}
                            className="bg-white/5 p-4 rounded-2xl text-text mb-8 border border-white/10 h-24"
                            textAlignVertical="top"
                        />

                        <Button
                            onPress={handleCreate}
                            variant="primary"
                            label={t('social.groups.create')}
                            loading={loading}
                        />
                    </Card>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
