import { Platform } from 'react-native';
import { HealthService, HealthData } from './healthService';
import { useSleepStore, SleepLog } from '@/store/sleepStore';
import { getLocalDateString } from './dateUtils';

export class HealthSyncService {
    /**
     * Sync sleep data from HealthKit/Health Connect for the last N days
     */
    static async syncSleepData(days: number = 7): Promise<{ success: boolean; count: number }> {
        try {
            const hasPermission = await HealthService.requestPermissions();
            if (!hasPermission) {
                console.log('Health permissions denied');
                return { success: false, count: 0 };
            }

            const sleepStore = useSleepStore.getState();
            let syncCount = 0;

            // Iterate through the last N days
            for (let i = 0; i < days; i++) {
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() - i);
                const dateStr = getLocalDateString(targetDate);

                // Skip if we already have a manual log for this day (optional, or merge)
                // For now, we'll only sync if no log exists or if it's a "synced" log
                const existingLog = sleepStore.sleepLogs[dateStr];
                if (existingLog && !existingLog.id.startsWith('sync-')) {
                    continue;
                }


                // Fetch data for this specific day
                const startOfDay = new Date(targetDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(targetDate);
                endOfDay.setHours(23, 59, 59, 999);

                const healthData = await HealthService.getDataForRange(startOfDay, endOfDay);
                if (healthData.sleepMinutes > 0) {
                    // Estimate bedtime and wake time based on duration
                    // Assume wake time is around 7 AM
                    const wakeTime = new Date(targetDate);
                    wakeTime.setHours(7, 0, 0, 0);
                    const bedTime = new Date(wakeTime.getTime() - healthData.sleepMinutes * 60000);

                    sleepStore.logSleep({
                        date: dateStr,
                        bedTime: bedTime,
                        wakeTime: wakeTime,
                        quality: 3, // Default quality for synced data
                        notes: 'Sincronizado desde Salud',
                        tags: ['refreshed'],
                    });
                    syncCount++;
                }
            }

            return { success: true, count: syncCount };
        } catch (error) {
            console.error('Error in HealthSyncService.syncSleepData:', error);
            return { success: false, count: 0 };
        }
    }

    /**
     * Sync steps and other metrics (future expansion)
     */
    static async syncActivityData(): Promise<boolean> {
        // Implementation for steps, etc.
        return true;
    }
}
