import { useSocialStore } from '../socialStore';
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
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn(),
        single: jest.fn(),
        auth: {
            getUser: jest.fn(),
        },
    },
}));

describe('socialStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useSocialStore.setState({
            groups: [],
            activeGroup: null,
            members: [],
            wagers: [],
            feed: [],
            loading: false,
        });
    });

    it('should fetch groups successfully', async () => {
        const mockUser = { id: 'user-1' };
        const mockGroupsData = [
            { social_groups: { id: 'g1', name: 'Group 1' } },
            { social_groups: { id: 'g2', name: 'Group 2' } },
        ];

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
        (supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: mockGroupsData, error: null }),
            }),
        });

        await useSocialStore.getState().fetchGroups();

        expect(useSocialStore.getState().loading).toBe(false);
        expect(useSocialStore.getState().groups).toHaveLength(2);
        expect(useSocialStore.getState().groups[0].name).toBe('Group 1');
    });

    it('should fetch feed successfully', async () => {
        const mockUser = { id: 'user-1' };
        const mockFeedData = [
            { id: 'p1', caption: 'Post 1', post_likes: [{ profile_id: 'user-1' }] },
            { id: 'p2', caption: 'Post 2', post_likes: [] },
        ];

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });
        (supabase.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue({ data: mockFeedData, error: null }),
                }),
            }),
        });

        await useSocialStore.getState().fetchFeed();

        expect(useSocialStore.getState().feed).toHaveLength(2);
        expect(useSocialStore.getState().feed[0].has_liked).toBe(true);
        expect(useSocialStore.getState().feed[1].has_liked).toBe(false);
    });

    it('should create a post successfully', async () => {
        const mockUser = { id: 'user-1' };
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });

        const insertMock = jest.fn().mockResolvedValue({ error: null });
        (supabase.from as jest.Mock).mockReturnValue({
            insert: insertMock,
        });

        // Mock fetchFeed which is called after createPost
        const fetchFeedSpy = jest.spyOn(useSocialStore.getState(), 'fetchFeed').mockResolvedValue(undefined);

        await useSocialStore.getState().createPost('Test caption', 'media-url');

        expect(insertMock).toHaveBeenCalledWith({
            profile_id: 'user-1',
            caption: 'Test caption',
            media_url: 'media-url',
            is_proof: false,
            workout_data: null,
        });
        expect(fetchFeedSpy).toHaveBeenCalled();
    });

    it('should toggle like successfully (like)', async () => {
        const mockUser = { id: 'user-1' };
        const mockPost = { id: 'p1', has_liked: false };
        useSocialStore.setState({ feed: [mockPost as any] });

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });

        const insertMock = jest.fn().mockResolvedValue({ error: null });
        (supabase.from as jest.Mock).mockReturnValue({
            insert: insertMock,
        });

        const fetchFeedSpy = jest.spyOn(useSocialStore.getState(), 'fetchFeed').mockResolvedValue(undefined);

        await useSocialStore.getState().toggleLike('p1');

        expect(insertMock).toHaveBeenCalledWith({ post_id: 'p1', profile_id: 'user-1' });
        expect(fetchFeedSpy).toHaveBeenCalled();
    });

    it('should toggle like successfully (unlike)', async () => {
        const mockUser = { id: 'user-1' };
        const mockPost = { id: 'p1', has_liked: true };
        useSocialStore.setState({ feed: [mockPost as any] });

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: mockUser }, error: null });

        const deleteMock = jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
            }),
        });
        (supabase.from as jest.Mock).mockReturnValue({
            delete: deleteMock,
        });

        const fetchFeedSpy = jest.spyOn(useSocialStore.getState(), 'fetchFeed').mockResolvedValue(undefined);

        await useSocialStore.getState().toggleLike('p1');

        expect(deleteMock).toHaveBeenCalled();
        expect(fetchFeedSpy).toHaveBeenCalled();
    });
});
