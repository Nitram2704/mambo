import { calculateOneRM, calculateVolume } from '../workoutMath';

describe('workoutMath', () => {
    describe('calculateOneRM', () => {
        it('should return 0 for invalid inputs', () => {
            expect(calculateOneRM(0, 10)).toBe(0);
            expect(calculateOneRM(100, 0)).toBe(0);
            expect(calculateOneRM(-100, 10)).toBe(0);
        });

        it('should return weight for 1 rep', () => {
            expect(calculateOneRM(100, 1)).toBe(100);
        });

        it('should calculate 1RM correctly using Epley formula', () => {
            // 100 * (1 + 10/30) = 100 * 1.333 = 133.33 -> 133
            expect(calculateOneRM(100, 10)).toBe(133);
            // 60 * (1 + 5/30) = 60 * 1.1666 = 70
            expect(calculateOneRM(60, 5)).toBe(70);
        });
    });

    describe('calculateVolume', () => {
        it('should calculate volume correctly', () => {
            expect(calculateVolume(100, 10)).toBe(1000);
            expect(calculateVolume(50, 12)).toBe(600);
        });
    });
});
