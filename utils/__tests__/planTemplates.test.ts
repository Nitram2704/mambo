import {
    getWorkoutTemplate,
    listWorkoutTemplates,
    filterTemplates,
    WORKOUT_TEMPLATES
} from '../planTemplates';

describe('planTemplates utils', () => {
    describe('getWorkoutTemplate', () => {
        it('should return the correct template for a valid ID', () => {
            const template = getWorkoutTemplate('beginner_hypertrophy_3d');
            expect(template).toBeDefined();
            expect(template?.id).toBe('beginner_hypertrophy_3d');
            expect(template?.name).toBe('Hipertrofia Principiante');
        });

        it('should return null for an invalid ID', () => {
            const template = getWorkoutTemplate('invalid_id');
            expect(template).toBeNull();
        });
    });

    describe('listWorkoutTemplates', () => {
        it('should return a list of all templates with summary info', () => {
            const templates = listWorkoutTemplates();
            const totalTemplates = Object.keys(WORKOUT_TEMPLATES).length;

            expect(templates).toHaveLength(totalTemplates);
            expect(templates[0]).toHaveProperty('id');
            expect(templates[0]).toHaveProperty('name');
            expect(templates[0]).toHaveProperty('description');
            expect(templates[0]).toHaveProperty('goal');
            expect(templates[0]).toHaveProperty('level');
            expect(templates[0]).toHaveProperty('daysPerWeek');
            // Should not contain full details like 'days'
            expect(templates[0]).not.toHaveProperty('days');
        });
    });

    describe('filterTemplates', () => {
        it('should return all templates when no filters are provided', () => {
            const templates = filterTemplates();
            expect(templates).toHaveLength(Object.keys(WORKOUT_TEMPLATES).length);
        });

        it('should filter by goal', () => {
            const hypertrophyTemplates = filterTemplates('hypertrophy');
            expect(hypertrophyTemplates.length).toBeGreaterThan(0);
            hypertrophyTemplates.forEach(t => {
                expect(t.goal).toBe('hypertrophy');
            });
        });

        it('should filter by level', () => {
            const beginnerTemplates = filterTemplates(undefined, 'beginner');
            expect(beginnerTemplates.length).toBeGreaterThan(0);
            beginnerTemplates.forEach(t => {
                expect(t.level).toBe('beginner');
            });
        });

        it('should filter by both goal and level', () => {
            const templates = filterTemplates('strength', 'intermediate');
            expect(templates.length).toBeGreaterThan(0);
            templates.forEach(t => {
                expect(t.goal).toBe('strength');
                expect(t.level).toBe('intermediate');
            });
        });

        it('should return empty array if no matches found', () => {
            // Assuming there's no 'endurance' plan for 'advanced' level in the current data
            // Let's check a combination that likely doesn't exist or verify data first.
            // Actually, let's use a made-up level
            const templates = filterTemplates('hypertrophy', 'super_advanced' as any);
            expect(templates).toHaveLength(0);
        });

        it('should handle "all" as a filter value', () => {
            const templates = filterTemplates('all', 'all');
            expect(templates).toHaveLength(Object.keys(WORKOUT_TEMPLATES).length);
        });
    });
});
