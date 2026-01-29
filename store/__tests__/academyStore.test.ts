import { useAcademyStore } from '../academyStore';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        auth: {
            getUser: jest.fn(),
        },
    },
}));

describe('academyStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAcademyStore.setState({
            courses: [],
            lessons: [],
            progress: [],
            loading: false,
        });
    });

    it('should fetch courses successfully', async () => {
        const mockCourses = [
            { id: '1', title: 'Course 1', category: 'nutrition' },
            { id: '2', title: 'Course 2', category: 'training' },
        ];

        (supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockCourses, error: null }),
            }),
        });

        await useAcademyStore.getState().fetchCourses();

        expect(useAcademyStore.getState().courses).toEqual(mockCourses);
        expect(useAcademyStore.getState().loading).toBe(false);
    });

    it('should fetch course details successfully', async () => {
        const courseId = 'course-1';
        const mockLessons = [{ id: 'l1', course_id: courseId, title: 'Lesson 1' }];
        const mockProgress = [{ id: 'p1', course_id: courseId, lesson_id: 'l1', completed: true }];

        // Mock the Promise.all calls
        (supabase.from as jest.Mock).mockImplementation((table) => {
            if (table === 'academy_lessons') {
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue({ data: mockLessons, error: null }),
                        }),
                    }),
                };
            }
            if (table === 'academy_progress') {
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({ data: mockProgress, error: null }),
                    }),
                };
            }
            return {};
        });

        const result = await useAcademyStore.getState().fetchCourseDetails(courseId);

        expect(result.lessons).toEqual(mockLessons);
        expect(result.progress).toEqual(mockProgress);
        expect(useAcademyStore.getState().lessons).toContainEqual(mockLessons[0]);
        expect(useAcademyStore.getState().progress).toContainEqual(mockProgress[0]);
    });

    it('should calculate course progress correctly', () => {
        const courseId = 'course-1';
        useAcademyStore.setState({
            lessons: [
                { id: 'l1', course_id: courseId } as any,
                { id: 'l2', course_id: courseId } as any,
            ],
            progress: [
                { course_id: courseId, lesson_id: 'l1', completed: true } as any,
            ],
        });

        const progress = useAcademyStore.getState().getCourseProgress(courseId);
        expect(progress).toBe(50);
    });

    it('should return 0 progress if no lessons', () => {
        const progress = useAcademyStore.getState().getCourseProgress('non-existent');
        expect(progress).toBe(0);
    });
});
