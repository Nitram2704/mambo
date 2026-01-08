import { formatTime } from '../time';

describe('time utils', () => {
    describe('formatTime', () => {
        it('should format seconds to M:SS when less than an hour', () => {
            expect(formatTime(0)).toBe('0:00');
            expect(formatTime(5)).toBe('0:05');
            expect(formatTime(59)).toBe('0:59');
            expect(formatTime(65)).toBe('1:05');
            expect(formatTime(600)).toBe('10:00');
        });

        it('should format seconds to H:MM:SS when more than an hour', () => {
            expect(formatTime(3600)).toBe('1:00:00');
            expect(formatTime(3665)).toBe('1:01:05');
            expect(formatTime(7322)).toBe('2:02:02');
        });
    });
});
