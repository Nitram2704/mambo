import { useAlarmStore } from '../alarmStore';
import * as Notifications from 'expo-notifications';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
    cancelAllScheduledNotificationsAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
}));

describe('alarmStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAlarmStore.setState({
            alarms: [],
        });
    });

    it('should add an alarm successfully', async () => {
        const newAlarm = {
            time: '08:00',
            enabled: true,
            days: [1, 2, 3, 4, 5],
            label: 'Work',
            sound: 'default',
            smartWake: true,
            smartWakeWindow: 20,
            sunriseEffect: true,
        };

        await useAlarmStore.getState().addAlarm(newAlarm);

        expect(useAlarmStore.getState().alarms).toHaveLength(1);
        expect(useAlarmStore.getState().alarms[0].time).toBe('08:00');
        expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should update an alarm successfully', async () => {
        const alarm = {
            id: 'a1',
            time: '07:00',
            enabled: true,
            days: [0, 6],
            label: 'Weekend',
            sound: 'default',
            smartWake: false,
            smartWakeWindow: 0,
            sunriseEffect: false,
        };
        useAlarmStore.setState({ alarms: [alarm] });

        await useAlarmStore.getState().updateAlarm('a1', { time: '09:00' });

        expect(useAlarmStore.getState().alarms[0].time).toBe('09:00');
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should toggle an alarm successfully', async () => {
        const alarm = {
            id: 'a1',
            time: '07:00',
            enabled: true,
            days: [0, 6],
            label: 'Weekend',
            sound: 'default',
            smartWake: false,
            smartWakeWindow: 0,
            sunriseEffect: false,
        };
        useAlarmStore.setState({ alarms: [alarm] });

        await useAlarmStore.getState().toggleAlarm('a1');

        expect(useAlarmStore.getState().alarms[0].enabled).toBe(false);

        await useAlarmStore.getState().toggleAlarm('a1');
        expect(useAlarmStore.getState().alarms[0].enabled).toBe(true);
    });

    it('should schedule notifications correctly for each day', async () => {
        const alarm = {
            id: 'a1',
            time: '07:00',
            enabled: true,
            days: [1, 3], // Mon, Wed
            label: 'Test',
            sound: 'default',
            smartWake: false,
            smartWakeWindow: 0,
            sunriseEffect: false,
        };
        useAlarmStore.setState({ alarms: [alarm] });

        await useAlarmStore.getState().scheduleAlarms();

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
            trigger: expect.objectContaining({ weekday: 2 }), // Mon (1+1)
        }));
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
            trigger: expect.objectContaining({ weekday: 4 }), // Wed (3+1)
        }));
    });

    it('should schedule sunrise effect notifications if enabled', async () => {
        const alarm = {
            id: 'a1',
            time: '07:00',
            enabled: true,
            days: [1],
            label: 'Test',
            sound: 'default',
            smartWake: false,
            smartWakeWindow: 0,
            sunriseEffect: true,
        };
        useAlarmStore.setState({ alarms: [alarm] });

        await useAlarmStore.getState().scheduleAlarms();

        // 1 for main alarm, 1 for sunrise
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.objectContaining({ title: 'Efecto Amanecer' }),
            trigger: expect.objectContaining({ hour: 6, minute: 45 }),
        }));
    });
});
