import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface AppNotification {
    id: string;
    title: string;
    body: string;
    type: 'social' | 'system' | 'workout' | 'coach';
    data: any;
    is_read: boolean;
    created_at: string;
}

export const notificationService = {
    async registerForPushNotifications() {
        if (Platform.OS === 'web') return null;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return null;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        return token;
    },

    async fetchNotifications() {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data as AppNotification[];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async markAsRead(notificationId: string) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    async markAllAsRead() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    },

    subscribeToNotifications(callback: (notification: AppNotification) => void) {
        return supabase
            .channel('notifications-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    callback(payload.new as AppNotification);
                }
            )
            .subscribe();
    }
};
