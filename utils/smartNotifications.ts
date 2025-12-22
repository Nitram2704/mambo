import * as Notifications from 'expo-notifications';
import { useWeeklyScheduleStore } from '@/store/weeklyScheduleStore';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

/**
 * Configure notification behavior
 */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

/**
 * Schedule a smart notification
 */
async function scheduleNotification(title: string, body: string, trigger: Notifications.NotificationTriggerInput) {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
        console.log('Notification permissions not granted');
        return;
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
        },
        trigger,
    });
}

/**
 * Check workout completion patterns and trigger smart notifications
 */
export async function checkAndTriggerSmartNotifications() {
    const { schedule } = useWeeklyScheduleStore.getState();
    const { workouts } = useWorkoutHistoryStore.getState();

    // Calculate date range (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Get scheduled workouts for the week
    const scheduledWorkouts = schedule.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= sevenDaysAgo && workoutDate <= today;
    });

    // Get completed workouts for the week
    const completedWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.startTime);
        return workoutDate >= sevenDaysAgo && workoutDate <= today;
    });

    const completionRate = scheduledWorkouts.length > 0
        ? completedWorkouts.length / scheduledWorkouts.length
        : 0;

    // Trigger notifications based on patterns
    if (completionRate < 0.5 && scheduledWorkouts.length >= 3) {
        // Missed 2+ workouts
        await scheduleNotification(
            '💪 ¿Todo bien?',
            'Has faltado a varios entrenamientos esta semana. ¿Quieres ajustar tu plan para que sea más realista?',
            {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 5
            } // Trigger in 5 seconds (for testing, adjust as needed)
        );
    } else if (completionRate >= 0.9 && completedWorkouts.length >= 4) {
        // Crushing it!
        const thisWeekVolume = completedWorkouts.reduce((sum, w) => sum + w.volume, 0) / completedWorkouts.length;

        const twoWeeksAgo = new Date(sevenDaysAgo);
        twoWeeksAgo.setDate(sevenDaysAgo.getDate() - 7);

        const previousWeekWorkouts = workouts.filter(w => {
            const workoutDate = new Date(w.startTime);
            return workoutDate >= twoWeeksAgo && workoutDate < sevenDaysAgo;
        });

        const previousWeekVolume = previousWeekWorkouts.reduce((sum, w) => sum + w.volume, 0) / Math.max(previousWeekWorkouts.length, 1);

        const progressionRate = previousWeekVolume > 0 ? thisWeekVolume / previousWeekVolume : 1;

        if (progressionRate >= 1.15) {
            await scheduleNotification(
                '🔥 ¡Imparable!',
                '¡Estás arrasando! Tu volumen ha subido un ' + Math.round((progressionRate - 1) * 100) + '%. Considera subir pesos la próxima semana.',
                {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: 5
                }
            );
        }
    }
}

/**
 * Schedule daily check for smart notifications (call this on app startup)
 */
export async function scheduleDailySmartNotificationCheck() {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily check at 8 PM
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Checking your progress...',
            body: 'This is a background check',
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: 20,
            minute: 0,
            repeats: true,
        },
    });
}
