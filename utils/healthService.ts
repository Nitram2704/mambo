import { Platform } from 'react-native';

export interface HealthData {
    steps: number;
    sleepMinutes: number;
    hrv?: number;
    restingHeartRate?: number;
}

export class HealthService {
    static async requestPermissions(): Promise<boolean> {
        return false;
    }

    static async getDataForRange(startDate: Date, endDate: Date): Promise<HealthData> {
        return {
            steps: 0,
            sleepMinutes: 0,
        };
    }

    static async getTodayData(): Promise<HealthData> {
        return {
            steps: 0,
            sleepMinutes: 0,
        };
    }
}
