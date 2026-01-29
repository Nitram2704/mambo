import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { HealthSyncService } from '@/utils/healthSyncService';
import { useTranslation } from 'react-i18next';
import { PremiumButton } from '@/components/ui/PremiumButton';

export function HealthSyncCard() {
    const { theme } = useAppTheme();
    const colors = Colors[theme];
    const { t } = useTranslation();
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = await HealthSyncService.syncSleepData(7);
            if (result.success) {
                setLastSync(new Date());
                Alert.alert(
                    t('sleep.sync.success'),
                    t('sleep.sync.successDesc', { count: result.count })
                );
            } else {
                Alert.alert(
                    t('common.error'),
                    t('sleep.sync.permissionDenied')
                );
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('sleep.sync.error'));
        } finally {
            setSyncing(false);
        }
    };

    return (
        <Card variant="glass" className="p-4 border-primary/30">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-primary/10">
                        <Ionicons name="sync" size={22} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                        <AccessibleText weight="medium" className="text-text text-base">
                            {t('sleep.sync.title')}
                        </AccessibleText>
                        <AccessibleText className="text-text-secondary text-xs mt-0.5">
                            {lastSync
                                ? t('sleep.sync.lastSync', { time: lastSync.toLocaleTimeString() })
                                : t('sleep.sync.notSynced')}
                        </AccessibleText>
                    </View>
                </View>
                <PremiumButton
                    label={t('sleep.sync.syncNow')}
                    onPress={handleSync}
                    loading={syncing}
                    size="sm"
                    className="w-32"
                />
            </View>
        </Card>
    );
}
