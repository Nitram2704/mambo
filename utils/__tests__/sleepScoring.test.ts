import { calculateSleepScore, getChronotype } from '../sleepScoring';

describe('sleepScoring', () => {
    describe('calculateSleepScore', () => {
        const mockGoals = {
            targetHours: 8,
            targetBedtime: '23:00',
            targetWakeTime: '07:00',
            sleepWindowStart: '22:00',
            sleepWindowEnd: '08:00',
        };

        it('should return perfect score for perfect sleep', () => {
            const log = {
                id: '1',
                startTime: new Date('2023-01-01T23:00:00').toISOString(),
                endTime: new Date('2023-01-02T07:00:00').toISOString(),
                bedTime: new Date('2023-01-01T23:00:00').toISOString(),
                wakeTime: new Date('2023-01-02T07:00:00').toISOString(),
                duration: 8 * 60, // 8 hours
                quality: 5,
                mood: 'energetic',
                factors: [],
                notes: '',
            };

            const score = calculateSleepScore(log as any, mockGoals, 0);
            expect(score).toBe(100);
        });

        it('should penalize short duration', () => {
            const log = {
                duration: 4 * 60, // 4 hours (50% of target)
                bedTime: new Date('2023-01-01T23:00:00').toISOString(),
                quality: 5,
            };
            // Duration score: (0.5 / 0.9) * 100 = 55.5
            // Regularity: 100
            // Quality: 100
            // Final: (55.5 * 0.5) + (100 * 0.3) + (100 * 0.2) = 27.7 + 30 + 20 = 77.7
            const score = calculateSleepScore(log as any, mockGoals, 0);
            expect(score).toBeLessThan(100);
            expect(score).toBeGreaterThan(70);
        });

        it('should penalize bad regularity', () => {
            const log = {
                duration: 8 * 60,
                bedTime: new Date('2023-01-01T01:00:00').toISOString(), // 2 hours late
                quality: 5,
            };
            // Diff is 120 mins. Penalty: 120 / 2 = 60. Regularity score: 40.
            // Duration: 100
            // Quality: 100
            // Final: (100 * 0.5) + (40 * 0.3) + (100 * 0.2) = 50 + 12 + 20 = 82
            const score = calculateSleepScore(log as any, mockGoals, 0);
            expect(score).toBe(82);
        });

        it('should penalize noise events', () => {
            const log = {
                duration: 8 * 60,
                bedTime: new Date('2023-01-01T23:00:00').toISOString(),
                quality: 5,
            };
            // Noise events: 5. Penalty: 25. Quality score: 75.
            // Final: 50 + 30 + 15 = 95
            const score = calculateSleepScore(log as any, mockGoals, 5);
            expect(score).toBe(95);
        });
    });

    describe('getChronotype', () => {
        it('should identify Lion (early riser)', () => {
            // 21:00 = 21 * 60 = 1260 minutes
            expect(getChronotype(21 * 60)).toBe('Lion');
        });

        it('should identify Wolf (late riser)', () => {
            // 01:00 = 1 * 60 = 60 minutes
            expect(getChronotype(1 * 60)).toBe('Wolf');
        });

        it('should identify Bear (normal)', () => {
            // 23:00 = 23 * 60 = 1380 minutes
            expect(getChronotype(23 * 60)).toBe('Bear');
        });
    });
});
