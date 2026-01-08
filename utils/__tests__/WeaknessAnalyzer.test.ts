import { analyzeWeaknesses } from '../WeaknessAnalyzer';
import { useAnalyticsStore } from '@/store/analyticsStore';

// Mock the store
jest.mock('@/store/analyticsStore', () => ({
    useAnalyticsStore: {
        getState: jest.fn(),
    },
}));

describe('WeaknessAnalyzer', () => {
    const mockGetMuscleBalance = jest.fn();
    const mockGetNutritionalAdherence = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useAnalyticsStore.getState as jest.Mock).mockReturnValue({
            getMuscleBalance: mockGetMuscleBalance,
            getNutritionalAdherence: mockGetNutritionalAdherence,
        });
    });

    it('should identify push imbalance (too much push)', () => {
        mockGetMuscleBalance.mockReturnValue([
            { muscle: 'Pecho', volume: 200 },
            { muscle: 'Espalda', volume: 100 }, // Ratio 2.0 > 1.3
            { muscle: 'Piernas', volume: 100 }, // Add legs to avoid "Skipped Leg Day"
        ]);
        mockGetNutritionalAdherence.mockReturnValue(100);

        const insights = analyzeWeaknesses();
        expect(insights).toHaveLength(1);
        expect(insights[0].type).toBe('balance');
        expect(insights[0].title).toBe('Desbalance de Empuje');
    });

    it('should identify pull imbalance (too much pull)', () => {
        mockGetMuscleBalance.mockReturnValue([
            { muscle: 'Pecho', volume: 50 },
            { muscle: 'Espalda', volume: 100 }, // Ratio 0.5 < 0.7
            { muscle: 'Piernas', volume: 100 }, // Add legs to avoid "Skipped Leg Day"
        ]);
        mockGetNutritionalAdherence.mockReturnValue(100);

        const insights = analyzeWeaknesses();
        expect(insights).toHaveLength(1);
        expect(insights[0].title).toBe('Desbalance de Tracción');
    });

    it('should identify skipped leg day', () => {
        mockGetMuscleBalance.mockReturnValue([
            { muscle: 'Pecho', volume: 100 },
            { muscle: 'Espalda', volume: 100 },
            { muscle: 'Piernas', volume: 10 }, // 10 / 210 = 0.04 < 0.2
        ]);
        mockGetNutritionalAdherence.mockReturnValue(100);

        const insights = analyzeWeaknesses();
        expect(insights).toContainEqual(expect.objectContaining({
            title: 'Día de Pierna Olvidado'
        }));
    });

    it('should identify low nutritional adherence', () => {
        mockGetMuscleBalance.mockReturnValue([
            { muscle: 'Pecho', volume: 100 },
            { muscle: 'Espalda', volume: 100 },
            { muscle: 'Piernas', volume: 100 },
        ]);
        mockGetNutritionalAdherence.mockReturnValue(50); // < 70

        const insights = analyzeWeaknesses();
        expect(insights).toContainEqual(expect.objectContaining({
            title: 'Adherencia Nutricional Baja'
        }));
    });
});
