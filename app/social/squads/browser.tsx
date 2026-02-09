import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useSocialStore, SocialGroup } from '@/store/socialStore';

export default function SquadBrowserScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { t } = useTranslation();
    const { searchGroups, fetchGroups } = useSocialStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [squads, setSquads] = useState<SocialGroup[]>([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        handleSearch('');
    }, []);

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        setLoading(true);
        const results = await searchGroups(text);
        setSquads(results);
        setLoading(false);
    };

    return (
        <ScreenWrapper safeArea={true}>
            <View className="flex-1 px-6">
                <View className="flex-row items-center justify-between py-4">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-surface-highlight rounded-full items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <AccessibleText variant="h1" weight="black" className="text-text tracking-tighter">
                        {t('social.squads.explore')}
                    </AccessibleText>
                    <TouchableOpacity
                        onPress={() => router.push('/social/squads/create')}
                        className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center border border-primary/20"
                    >
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-surface-highlight/30 flex-row items-center px-4 py-3 rounded-2xl border border-white/5 mb-6">
                    <Ionicons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholder={t('social.squads.search')}
                        placeholderTextColor={colors.textMuted}
                        className="flex-1 ml-3 text-white text-base"
                    />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-4 ml-1">
                        {t('social.squads.recommended')}
                    </AccessibleText>

                    {loading ? (
                        <View className="py-20">
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        squads.map((squad) => (
                            <TouchableOpacity
                                key={squad.id}
                                onPress={() => router.push({ pathname: '/social/squads/[id]', params: { id: squad.id } })}
                                className="mb-4"
                            >
                                <Card variant="glass" className="p-4 flex-row items-center border-white/5">
                                    <View className="w-14 h-14 bg-surface-highlight rounded-2xl items-center justify-center mr-4 border border-white/10">
                                        <Ionicons
                                            name={squad.type === 'community' ? 'people' : squad.type === 'couple' ? 'heart' : 'person'}
                                            size={24}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <AccessibleText weight="bold" className="text-text text-lg">{squad.name}</AccessibleText>
                                        <View className="flex-row items-center mt-1">
                                            <AccessibleText className="text-text-secondary text-xs">{squad.type.toUpperCase()}</AccessibleText>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                </Card>
                            </TouchableOpacity>
                        ))
                    )}

                    {squads.length === 0 && !loading && (
                        <View className="py-10 items-center">
                            <AccessibleText className="text-text-muted italic">No se encontraron squads</AccessibleText>
                        </View>
                    )}
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}
