import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

// Helper to safely get Notifications module
const getNotifications = () => {
    if (Constants.appOwnership === 'expo') {
        return null;
    }
    try {
        return require('expo-notifications');
    } catch (e) {
        console.warn('expo-notifications not available:', e);
        return null;
    }
};

// Configure notification handler safely
const Notifications = getNotifications();
if (Notifications) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export async function registerForPushNotificationsAsync() {
    // Check if running in Expo Go
    if (Constants.appOwnership === 'expo') {
        console.log('Push notifications are not supported in Expo Go (SDK 53+). Skipping registration.');
        return;
    }

    const Notifications = getNotifications();
    if (!Notifications) return;

    // Note: In SDK 53+, notifications are restricted in Expo Go on Android
    if (Platform.OS === 'android') {
        try {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        } catch (error) {
            console.log('Error setting notification channel:', error);
            return;
        }
    }

    let finalStatus;
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
    } catch (error) {
        console.log('Error getting push token permissions:', error);
        return;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }

    return finalStatus;
}

export async function scheduleWaterReminder() {
    const Notifications = getNotifications();
    if (!Notifications) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule 4 reminders throughout the day
    const times = [10, 13, 16, 19]; // 10am, 1pm, 4pm, 7pm

    for (const hour of times) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "💧 Hora de hidratarse",
                body: "Recuerda beber agua para alcanzar tu meta diaria.",
            },
            trigger: {
                hour: hour,
                minute: 0,
                repeats: true,
            } as any,
        });
    }

    Alert.alert('Recordatorios Activados', 'Te recordaremos beber agua a las 10:00, 13:00, 16:00 y 19:00');
}

export async function scheduleWorkoutReminder(hour: number, minute: number) {
    const Notifications = getNotifications();
    if (!Notifications) return;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "💪 Hora de entrenar",
            body: "¡Es momento de tu sesión de entrenamiento!",
        },
        trigger: {
            hour,
            minute,
            repeats: true,
        } as any,
    });

    Alert.alert('Recordatorio Activado', `Te recordaremos entrenar a las ${hour}:${minute.toString().padStart(2, '0')}`);
}

export async function cancelAllNotifications() {
    const Notifications = getNotifications();
    if (!Notifications) return;

    await Notifications.cancelAllScheduledNotificationsAsync();
    Alert.alert('Notificaciones Desactivadas', 'Se han cancelado todos los recordatorios');
}
