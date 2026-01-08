import {
    getMondayOfWeek,
    getDayOfWeekMondayBased,
    isSunday,
    getOptimalWorkoutDays,
    generateSmartSchedule
} from '../scheduleUtils';

describe('scheduleUtils', () => {
    describe('getMondayOfWeek', () => {
        it('should return Monday for a Wednesday', () => {
            const wednesday = new Date('2023-10-11T12:00:00'); // Oct 11, 2023 is a Wednesday
            const monday = getMondayOfWeek(wednesday);
            expect(monday.getDate()).toBe(9); // Oct 9 is Monday
            expect(monday.getDay()).toBe(1); // 1 = Monday
        });

        it('should return Monday for a Sunday', () => {
            const sunday = new Date('2023-10-15T12:00:00'); // Oct 15 is Sunday
            const monday = getMondayOfWeek(sunday);
            expect(monday.getDate()).toBe(9); // Previous Monday is Oct 9
        });

        it('should return same day if it is Monday', () => {
            const monday = new Date('2023-10-09T12:00:00');
            const result = getMondayOfWeek(monday);
            expect(result.getDate()).toBe(9);
        });
    });

    describe('getDayOfWeekMondayBased', () => {
        it('should return 0 for Monday', () => {
            const monday = new Date('2023-10-09T12:00:00');
            expect(getDayOfWeekMondayBased(monday)).toBe(0);
        });

        it('should return 6 for Sunday', () => {
            const sunday = new Date('2023-10-15T12:00:00');
            expect(getDayOfWeekMondayBased(sunday)).toBe(6);
        });
    });

    describe('isSunday', () => {
        it('should return true for Sunday', () => {
            expect(isSunday(new Date('2023-10-15T12:00:00'))).toBe(true);
        });

        it('should return false for Monday', () => {
            expect(isSunday(new Date('2023-10-09T12:00:00'))).toBe(false);
        });
    });

    describe('getOptimalWorkoutDays', () => {
        it('should return Mon, Wed, Fri for 3 days', () => {
            expect(getOptimalWorkoutDays(3)).toEqual([0, 2, 4]);
        });

        it('should return Mon-Fri for 5 days', () => {
            expect(getOptimalWorkoutDays(5)).toEqual([0, 1, 2, 3, 4]);
        });
    });

    describe('generateSmartSchedule', () => {
        it('should generate schedule for 3 days/week', () => {
            const config = {
                routineIds: ['A', 'B', 'C'],
                daysPerWeek: 3,
                weeksToSchedule: 1
            };

            // Mock date to be a Monday (Oct 9, 2023)
            const mockDate = new Date(2023, 9, 9, 12, 0, 0);
            jest.useFakeTimers().setSystemTime(mockDate);

            const schedule = generateSmartSchedule(config);

            expect(schedule).toHaveLength(3);
            expect(schedule[0].routineId).toBe('A');
            expect(schedule[1].routineId).toBe('B');
            expect(schedule[2].routineId).toBe('C');

            // Verify dates: Mon, Wed, Fri
            expect(schedule[0].date.getDay()).toBe(1); // Mon
            expect(schedule[1].date.getDay()).toBe(3); // Wed
            expect(schedule[2].date.getDay()).toBe(5); // Fri

            jest.useRealTimers();
        });

        it('should skip past days in current week', () => {
            const config = {
                routineIds: ['A', 'B', 'C'],
                daysPerWeek: 3, // Mon (0), Wed (2), Fri (4)
                weeksToSchedule: 1
            };

            // Mock date to be Wednesday (Oct 11, 2023)
            const mockDate = new Date(2023, 9, 11, 12, 0, 0);
            jest.useFakeTimers().setSystemTime(mockDate);

            const schedule = generateSmartSchedule(config);

            // Should skip Monday (0), keep Wed (2, today) and Fri (4)
            expect(schedule).toHaveLength(2);
            // Routine IDs should be assigned in order of the schedule, 
            // but since Monday was skipped, Wed gets the first routine 'A'
            expect(schedule[0].routineId).toBe('A');
            expect(schedule[1].routineId).toBe('B');

            jest.useRealTimers();
        });
    });
});
