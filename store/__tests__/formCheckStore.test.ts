import { useFormCheckStore } from '../formCheckStore';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        auth: {
            getUser: jest.fn(),
        },
    },
}));

describe('formCheckStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useFormCheckStore.setState({
            formChecks: [],
            loading: false,
        });
    });

    it('should fetch form checks successfully', async () => {
        const mockData = [
            { id: 'fc1', exercise_name: 'Squat', score: 85 },
        ];

        (supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
        });

        await useFormCheckStore.getState().fetchFormChecks();

        expect(useFormCheckStore.getState().formChecks).toHaveLength(1);
        expect(useFormCheckStore.getState().formChecks[0].exercise_name).toBe('Squat');
    });

    it('should save a form check successfully', async () => {
        const mockUser = { id: 'user-1' };
        const mockResult = {
            score: 90,
            feedback: ['Good depth', 'Keep chest up'],
            improvements: [],
            analysis: 'Great form',
        };

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });

        const insertMock = jest.fn().mockResolvedValue({ error: null });
        (supabase.from as jest.Mock).mockReturnValue({
            insert: insertMock,
        });

        const fetchSpy = jest.spyOn(useFormCheckStore.getState(), 'fetchFormChecks').mockResolvedValue(undefined);

        await useFormCheckStore.getState().saveFormCheck({
            exercise_name: 'Deadlift',
            video_url: 'video-url',
            result: mockResult as any,
        });

        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
            exercise_name: 'Deadlift',
            score: 90,
        }));
        expect(fetchSpy).toHaveBeenCalled();
    });

    it('should delete a form check successfully', async () => {
        const deleteMock = jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
        });
        (supabase.from as jest.Mock).mockReturnValue({
            delete: deleteMock,
        });

        const fetchSpy = jest.spyOn(useFormCheckStore.getState(), 'fetchFormChecks').mockResolvedValue(undefined);

        await useFormCheckStore.getState().deleteFormCheck('fc1');

        expect(deleteMock).toHaveBeenCalled();
        expect(fetchSpy).toHaveBeenCalled();
    });
});
