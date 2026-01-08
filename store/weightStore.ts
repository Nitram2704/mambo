import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BodyMeasurements {
    // Basic measurements
    weight?: number; // kg
    waist?: number; // Cintura (cm)

    // Advanced measurements
    bodyFat?: number; // Grasa Corporal (%)
    leanMass?: number; // Masa corporal magra (kg)
    neck?: number; // Cuello (cm)
    shoulders?: number; // Hombro (cm)
    chest?: number; // Pecho (cm)
    bicepsLeft?: number; // Bíceps Izquierdo (cm)
    bicepsRight?: number; // Bíceps Derecho (cm)
    forearmLeft?: number; // Antebrazo Izquierdo (cm)
    forearmRight?: number; // Antebrazo Derecho (cm)
    abdomen?: number; // Abdomen (cm)
    hips?: number; // Caderas (cm)
    thighLeft?: number; // Muslo Izquierdo (cm)
    thighRight?: number; // Muslo Derecho (cm)
    calfLeft?: number; // Gemelo Izquierdo (cm)
    calfRight?: number; // Gemelo Derecha (cm)
}

export interface WeightLog {
    id: string;
    date: string; // YYYY-MM-DD
    weight: number; // kg - kept for backward compatibility
    measurements?: BodyMeasurements; // New field for detailed measurements
    photoUri?: string;
    note?: string;
    createdAt: Date;
}

interface WeightState {
    logs: WeightLog[];

    // Actions
    logWeight: (entry: Omit<WeightLog, 'id' | 'createdAt'>) => void;
    updateMeasurements: (id: string, measurements: Partial<BodyMeasurements>) => void;
    deleteLog: (id: string) => void;

    // Selectors
    getLatestWeight: () => number | null;
    getLatestMeasurement: (measurementType: keyof BodyMeasurements) => number | null;
    getMeasurementHistory: (measurementType: keyof BodyMeasurements) => { date: string; value: number }[];
    getWeightHistory: () => WeightLog[];
    getProgressPhotos: () => WeightLog[];
    clearData: () => void;
}

export const useWeightStore = create<WeightState>()(
    persist(
        (set, get) => ({
            logs: [],

            logWeight: (entry) => {
                set((state) => {
                    const newLog: WeightLog = {
                        ...entry,
                        id: Date.now().toString(),
                        createdAt: new Date(),
                    };

                    // Add new log and sort by date descending
                    const updatedLogs = [...state.logs, newLog].sort((a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    );

                    return { logs: updatedLogs };
                });
            },

            updateMeasurements: (id, measurements) => {
                set((state) => ({
                    logs: state.logs.map(log =>
                        log.id === id
                            ? { ...log, measurements: { ...log.measurements, ...measurements } }
                            : log
                    ),
                }));
            },

            deleteLog: (id) => {
                set((state) => ({
                    logs: state.logs.filter(l => l.id !== id),
                }));
            },

            getLatestWeight: () => {
                const { logs } = get();
                return logs.length > 0 ? logs[0].weight : null;
            },

            getLatestMeasurement: (measurementType) => {
                const { logs } = get();
                for (const log of logs) {
                    if (log.measurements?.[measurementType]) {
                        return log.measurements[measurementType]!;
                    }
                }
                return null;
            },

            getMeasurementHistory: (measurementType) => {
                const { logs } = get();
                return logs
                    .filter(log => log.measurements?.[measurementType] !== undefined)
                    .map(log => ({
                        date: log.date,
                        value: log.measurements![measurementType]!,
                    }));
            },

            getWeightHistory: () => {
                return get().logs;
            },

            getProgressPhotos: () => {
                return get().logs.filter(log => log.photoUri);
            },

            clearData: () => set({ logs: [] }),
        }),
        {
            name: 'weight-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
