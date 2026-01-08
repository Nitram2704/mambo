import { getLocalDateString, parseLocalDate, formatSpanishDate } from '../dateUtils';

describe('dateUtils', () => {
    describe('getLocalDateString', () => {
        it('should return date string in YYYY-MM-DD format', () => {
            const date = new Date(2023, 0, 15); // Jan 15, 2023
            expect(getLocalDateString(date)).toBe('2023-01-15');
        });

        it('should pad single digit months and days', () => {
            const date = new Date(2023, 8, 5); // Sep 5, 2023
            expect(getLocalDateString(date)).toBe('2023-09-05');
        });
    });

    describe('parseLocalDate', () => {
        it('should parse YYYY-MM-DD string to Date object', () => {
            const dateStr = '2023-05-20';
            const date = parseLocalDate(dateStr);
            expect(date.getFullYear()).toBe(2023);
            expect(date.getMonth()).toBe(4); // May is index 4
            expect(date.getDate()).toBe(20);
        });
    });

    // Note: formatSpanishDate might depend on locale support in the test environment.
    // If it fails due to missing 'es-ES' locale, we might need to mock toLocaleDateString or adjust the test.
    describe('formatSpanishDate', () => {
        it('should format date string to Spanish format', () => {
            const dateStr = '2023-01-01';
            // Expected output might vary slightly depending on Node version/ICU
            // "dom, 1 ene" or "dom., 1 ene."
            const result = formatSpanishDate(dateStr);
            expect(result).toMatch(/dom/i);
            expect(result).toMatch(/1/);
            expect(result).toMatch(/ene/i);
        });
    });
});
