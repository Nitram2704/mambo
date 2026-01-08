import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export interface SocialGroup {
    id: string;
    name: string;
    description: string;
    type: 'couple' | 'friends' | 'community';
    created_by: string;
    created_at: string;
}

export interface GroupMember {
    group_id: string;
    profile_id: string;
    role: 'admin' | 'member';
    joined_at: string;
    profile?: {
        name: string;
        avatar_url?: string;
    };
}

export interface Wager {
    id: string;
    group_id: string;
    title: string;
    stake: string;
    type: 'consistency' | 'weight' | 'volume';
    goal: number;
    status: 'active' | 'completed' | 'cancelled';
    winner_id?: string;
    end_date: string;
    created_at: string;
}

export interface SocialPost {
    id: string;
    profile_id: string;
    workout_id?: string;
    media_url?: string;
    caption?: string;
    is_proof?: boolean;
    likes_count?: number;
    comments_count?: number;
    has_liked?: boolean;
    created_at: string;
    profile?: {
        name: string;
        avatar_url?: string;
    };
}

interface SocialState {
    groups: SocialGroup[];
    activeGroup: SocialGroup | null;
    members: GroupMember[];
    wagers: Wager[];
    feed: SocialPost[];
    loading: boolean;

    fetchGroups: () => Promise<void>;
    fetchGroupDetails: (groupId: string) => Promise<void>;
    createGroup: (name: string, type: SocialGroup['type'], description?: string) => Promise<string | null>;
    joinGroup: (groupId: string) => Promise<void>;
    createWager: (groupId: string, title: string, stake: string, endDate: Date, type: Wager['type'], goal: number) => Promise<void>;
    resolveWager: (wagerId: string, winnerId: string) => Promise<void>;
    fetchFeed: () => Promise<void>;
    postWorkoutProof: (workoutId: string, mediaUrl: string, caption: string) => Promise<void>;
    createPost: (caption: string, mediaUrl?: string, isWorkoutProof?: boolean) => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
    uploadMedia: (uri: string) => Promise<string | null>;
    searchUsers: (query: string) => Promise<any[]>;
    inviteMember: (groupId: string, profileId: string) => Promise<void>;
}

export const useSocialStore = create<SocialState>()(
    persist(
        (set, get) => ({
            groups: [],
            activeGroup: null,
            members: [],
            wagers: [],
            feed: [],
            loading: false,

            fetchGroups: async () => {
                set({ loading: true });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data, error } = await supabase
                        .from('group_members')
                        .select('social_groups(*)')
                        .eq('profile_id', user.id);

                    if (error) throw error;
                    const groups = (data || [])
                        .map(item => item.social_groups)
                        .filter(Boolean) as unknown as SocialGroup[];
                    set({ groups });
                } catch (error) {
                    console.error('Error fetching groups:', error);
                } finally {
                    set({ loading: false });
                }
            },

            fetchGroupDetails: async (groupId: string) => {
                set({ loading: true });
                try {
                    const [groupRes, membersRes, wagersRes] = await Promise.all([
                        supabase.from('social_groups').select('*').eq('id', groupId).maybeSingle(),
                        supabase.from('group_members').select('*, profiles(name)').eq('group_id', groupId),
                        supabase.from('wagers').select('*').eq('group_id', groupId).order('created_at', { ascending: false })
                    ]);

                    if (groupRes.error) throw groupRes.error;

                    set({
                        activeGroup: groupRes.data as SocialGroup,
                        members: membersRes.data as any[],
                        wagers: wagersRes.data as Wager[]
                    });
                } catch (error) {
                    console.error('Error fetching group details:', error);
                } finally {
                    set({ loading: false });
                }
            },

            createGroup: async (name, type, description) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return null;

                    const { data: group, error: groupError } = await supabase
                        .from('social_groups')
                        .insert({ name, type, description, created_by: user.id })
                        .select()
                        .maybeSingle();

                    if (groupError) throw groupError;

                    const { error: memberError } = await supabase
                        .from('group_members')
                        .insert({ group_id: group.id, profile_id: user.id, role: 'admin' });

                    if (memberError) throw memberError;

                    await get().fetchGroups();
                    return group.id;
                } catch (error) {
                    console.error('Error creating group:', error);
                    return null;
                }
            },

            joinGroup: async (groupId) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { error } = await supabase
                        .from('group_members')
                        .insert({ group_id: groupId, profile_id: user.id, role: 'member' });

                    if (error) throw error;
                    await get().fetchGroups();
                } catch (error) {
                    console.error('Error joining group:', error);
                }
            },

            createWager: async (groupId, title, stake, endDate, type, goal) => {
                try {
                    const { error } = await supabase
                        .from('wagers')
                        .insert({
                            group_id: groupId,
                            title,
                            stake,
                            end_date: endDate.toISOString(),
                            type,
                            goal
                        });

                    if (error) throw error;
                    await get().fetchGroupDetails(groupId);
                } catch (error) {
                    console.error('Error creating wager:', error);
                }
            },

            resolveWager: async (wagerId, winnerId) => {
                try {
                    const { error } = await supabase
                        .from('wagers')
                        .update({ status: 'completed', winner_id: winnerId })
                        .eq('id', wagerId);

                    if (error) throw error;

                    const wager = get().wagers.find(w => w.id === wagerId);
                    if (wager) {
                        await get().fetchGroupDetails(wager.group_id);
                    }
                } catch (error) {
                    console.error('Error resolving wager:', error);
                }
            },

            fetchFeed: async () => {
                set({ loading: true });
                try {
                    const { data: { user } } = await supabase.auth.getUser();

                    const { data, error } = await supabase
                        .from('social_posts')
                        .select('*, profiles!social_posts_profile_id_fkey(name, avatar_url), post_likes!post_likes_post_id_fkey(profile_id)')
                        .order('created_at', { ascending: false })
                        .limit(20);

                    if (error) throw error;

                    const processedFeed = (data || []).map(post => ({
                        ...post,
                        has_liked: post.post_likes?.some((like: any) => like.profile_id === user?.id),
                        likes_count: post.likes_count || 0,
                        comments_count: post.comments_count || 0,
                        is_proof: post.is_proof || false
                    }));

                    set({ feed: processedFeed as SocialPost[] });
                } catch (error) {
                    console.error('Error fetching feed:', error);
                } finally {
                    set({ loading: false });
                }
            },

            postWorkoutProof: async (workoutId, mediaUrl, caption) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { error } = await supabase
                        .from('social_posts')
                        .insert({ profile_id: user.id, workout_id: workoutId, media_url: mediaUrl, caption });

                    if (error) throw error;
                    await get().fetchFeed();
                } catch (error) {
                    console.error('Error posting workout proof:', error);
                }
            },

            createPost: async (caption, mediaUrl, isWorkoutProof = false) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { error } = await supabase
                        .from('social_posts')
                        .insert({
                            profile_id: user.id,
                            caption,
                            media_url: mediaUrl,
                            is_proof: isWorkoutProof
                        });

                    if (error) throw error;
                    await get().fetchFeed();
                } catch (error) {
                    console.error('Error creating post:', error);
                }
            },

            toggleLike: async (postId) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const post = get().feed.find(p => p.id === postId);
                    if (!post) return;

                    if (post.has_liked) {
                        await supabase
                            .from('post_likes')
                            .delete()
                            .eq('post_id', postId)
                            .eq('profile_id', user.id);
                    } else {
                        await supabase
                            .from('post_likes')
                            .insert({ post_id: postId, profile_id: user.id });
                    }

                    await get().fetchFeed();
                } catch (error) {
                    console.error('Error toggling like:', error);
                }
            },

            uploadMedia: async (uri) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return null;

                    const fileName = `${user.id}/${Date.now()}.jpg`;
                    const formData = new FormData();

                    // React Native FormData handling for files
                    const file = {
                        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                        name: fileName,
                        type: 'image/jpeg',
                    } as any;

                    const { data, error } = await supabase.storage
                        .from('social_posts')
                        .upload(fileName, file);

                    if (error) throw error;

                    const { data: { publicUrl } } = supabase.storage
                        .from('social_posts')
                        .getPublicUrl(data.path);

                    return publicUrl;
                } catch (error) {
                    console.error('Error uploading media:', error);
                    return null;
                }
            },

            searchUsers: async (query) => {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('id, name, avatar_url, email')
                        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
                        .limit(10);

                    if (error) throw error;
                    return data || [];
                } catch (error) {
                    console.error('Error searching users:', error);
                    return [];
                }
            },

            inviteMember: async (groupId, profileId) => {
                try {
                    const { error } = await supabase
                        .from('group_members')
                        .insert({ group_id: groupId, profile_id: profileId, role: 'member' });

                    if (error) throw error;
                    await get().fetchGroupDetails(groupId);
                } catch (error) {
                    console.error('Error inviting member:', error);
                    throw error;
                }
            }
        }),
        {
            name: 'social-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
