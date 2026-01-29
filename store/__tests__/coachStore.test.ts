import { useCoachStore } from '../coachStore';
import { supabase } from '@/lib/supabase';

// Mock React Native
jest.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: jest.fn(),
    },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        auth: {
            getUser: jest.fn(),
        },
    },
}));

describe('coachStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCoachStore.setState({
            clients: [],
            myCoach: null,
            loading: false,
        });
    });

    it('should have initial state', () => {
        expect(useCoachStore.getState().clients).toEqual([]);
        expect(useCoachStore.getState().loading).toBe(false);
    });

    it('should fetch clients successfully', async () => {
        const mockUser = { id: 'coach-1' };
        const mockClients = [
            { client_id: 'c1', profiles: { name: 'Client 1', email: 'c1@test.com' } },
        ];

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
        (supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: mockClients, error: null }),
            }),
        });

        await useCoachStore.getState().fetchClients();

        const clients = useCoachStore.getState().clients as any[];
        expect(clients).toHaveLength(1);
        expect(clients[0].profiles.name).toBe('Client 1');
    });

    it('should fetch my coach successfully', async () => {
        const mockUser = { id: 'client-1' };
        const mockCoach = { coach_id: 'coach-1', profiles: { name: 'Coach 1' } };

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
        (supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: mockCoach, error: null }),
                    }),
                }),
            }),
        });

        await useCoachStore.getState().fetchMyCoach();

        expect(useCoachStore.getState().myCoach).toEqual(mockCoach);
    });

    it('should request a coach successfully', async () => {
        const mockUser = { id: 'client-1' };
        const mockCoachProfile = { id: 'coach-1' };

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });

        // Mock finding coach by email
        (supabase.from as jest.Mock).mockImplementation((table) => {
            if (table === 'profiles') {
                return {
                    select: jest.fn().mockReturnValue({
                        eq: jest.fn().mockReturnValue({
                            maybeSingle: jest.fn().mockResolvedValue({ data: mockCoachProfile, error: null }),
                        }),
                    }),
                };
            }
            if (table === 'coach_clients') {
                return {
                    insert: jest.fn().mockResolvedValue({ error: null }),
                };
            }
            return {};
        });

        await useCoachStore.getState().requestCoach('coach@test.com');

        expect(supabase.from).toHaveBeenCalledWith('coach_clients');
    });

    it('should accept a client successfully', async () => {
        const mockUser = { id: 'coach-1' };
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });

        const updateMock = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
            }),
        });
        (supabase.from as jest.Mock).mockReturnValue({
            update: updateMock,
        });

        const fetchClientsSpy = jest.spyOn(useCoachStore.getState(), 'fetchClients').mockResolvedValue(undefined);

        await useCoachStore.getState().acceptClient('client-1');

        expect(updateMock).toHaveBeenCalled();
        expect(fetchClientsSpy).toHaveBeenCalled();
    });
});
