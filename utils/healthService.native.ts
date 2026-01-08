import { Platform } from 'react-native';

// Note: These will only work in development builds, not Expo Go
let AppleHealthKit: any = null;

async function loadNativeModules() {
    if (Platform.OS === 'ios' && !AppleHealthKit) {
        try {
            const mod = await import('react-native-health');
            AppleHealthKit = mod.default;
        } catch (e) {
            console.log('AppleHealthKit not available');
        }
    }
    // Health Connect (Android) requires react-native-health-connect which is currently missing
}

export interface HealthData {
    steps: number;
    sleepMinutes: number;
    hrv?: number;
    restingHeartRate?: number;
}

export class HealthService {
    static async requestPermissions(): Promise<boolean> {
        await loadNativeModules();
        if (Platform.OS === 'ios' && AppleHealthKit) {
            const permissions = {
                permissions: {
                    read: [
                        AppleHealthKit.Constants.Permissions.Steps,
                        AppleHealthKit.Constants.Permissions.SleepAnalysis,
                        AppleHealthKit.Constants.Permissions.HeartRateVariability,
                        AppleHealthKit.Constants.Permissions.RestingHeartRate,
                    ],
                },
            };
            return new Promise((resolve) => {
                AppleHealthKit.initHealthKit(permissions, (err: string) => {
                    if (err) resolve(false);
                    else resolve(true);
                });
            });
        }
        // Android Health Connect stub
        return false;
    }

    static async getDataForRange(startDate: Date, endDate: Date): Promise<HealthData> {
        const data: HealthData = {
            steps: 0,
            sleepMinutes: 0,
        };

        try {
            await loadNativeModules();
            if (Platform.OS === 'ios' && AppleHealthKit) {
                const options = {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                };

                return new Promise((resolve) => {
                    AppleHealthKit.getStepCount(options, (err: string, results: any) => {
                        if (!err) data.steps = results.value;

                        AppleHealthKit.getSleepSamples(options, (err: string, results: any) => {
                            if (!err && results.length > 0) {
                                data.sleepMinutes = results.reduce((acc: number, s: any) => {
                                    const start = new Date(s.startDate).getTime();
                                    const end = new Date(s.endDate).getTime();
                                    return acc + (end - start) / (1000 * 60);
                                }, 0);
                            }
                            resolve(data);
                        });
                    });
                });
            }
            // Android Health Connect stub
        } catch (e) {
            console.log('Error fetching health data range:', e);
        }

        return data;
    }

    static async getTodayData(): Promise<HealthData> {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return this.getDataForRange(start, end);
    }
}
