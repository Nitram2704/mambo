import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export interface CoachClient {
    coach_id: string;
    client_id: string;
    status: 'pending' | 'active' | 'terminated';
    created_at: string;
    client?: {
        name: string;
        email: string;
        avatar_url?: string;
    };
}

interface CoachState {
    clients: CoachClient[];
    myCoach: any | null;
    loading: boolean;

    fetchClients: () => Promise<void>;
    fetchMyCoach: () => Promise<void>;
    requestCoach: (coachEmail: string) => Promise<void>;
    acceptClient: (clientId: string) => Promise<void>;
    assignPlanToClient: (clientId: string, planId: string) => Promise<void>;
    sendFeedbackToClient: (clientId: string, workoutId: string, feedback: string) => Promise<void>;
    fetchClientDetails: (clientId: string) => Promise<any>;
    fetchClientStats: (clientId: string) => Promise<any>;
}

export const useCoachStore = create<CoachState>()(
    persist(
        (set, get) => ({
            clients: [],
            myCoach: null,
            loading: false,

            fetchClients: async () => {
                set({ loading: true });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data, error } = await supabase
                        .from('coach_clients')
                        .select('*, profiles!client_id(name, email)')
                        .eq('coach_id', user.id);

                    if (error) throw error;
                    set({ clients: data as any[] });
                } catch (error) {
                    console.error('Error fetching clients:', error);
                } finally {
                    set({ loading: false });
                }
            },

            fetchMyCoach: async () => {
                set({ loading: true });
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data, error } = await supabase
                        .from('coach_clients')
                        .select('*, profiles!coach_id(name, email)')
                        .eq('client_id', user.id)
                        .eq('status', 'active')
                        .single();

                    if (error && error.code !== 'PGRST116') throw error;
                    set({ myCoach: data });
                } catch (error) {
                    console.error('Error fetching coach:', error);
                } finally {
                    set({ loading: false });
                }
            },

            requestCoach: async (coachEmail: string) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    // Find coach by email
                    const { data: coach, error: coachError } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('email', coachEmail)
                        .maybeSingle();

                    if (coachError) throw coachError;
                    if (!coach) {
                        throw new Error('Coach not found');
                    }

                    const { error } = await supabase
                        .from('coach_clients')
                        .insert({ coach_id: coach.id, client_id: user.id, status: 'pending' });

                    if (error) throw error;
                } catch (error) {
                    console.error('Error requesting coach:', error);
                }
            },

            acceptClient: async (clientId: string) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { error } = await supabase
                        .from('coach_clients')
                        .update({ status: 'active' })
                        .eq('coach_id', user.id)
                        .eq('client_id', clientId);

                    if (error) throw error;
                    await get().fetchClients();
                } catch (error) {
                    console.error('Error accepting client:', error);
                }
            },

            assignPlanToClient: async (clientId: string, planId: string) => {
                console.log(`Assigning plan ${planId} to client ${clientId}`);
            },

            sendFeedbackToClient: async (clientId: string, workoutId: string, feedback: string) => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { error } = await supabase
                        .from('workout_feedback')
                        .insert({
                            coach_id: user.id,
                            client_id: clientId,
                            workout_id: workoutId,
                            content: feedback
                        });

                    if (error) throw error;
                } catch (error) {
                    console.error('Error sending feedback:', error);
                }
            },

            fetchClientDetails: async (clientId: string) => {
                try {
                    const [profileRes, workoutsRes, feedbackRes] = await Promise.all([
                        supabase.from('profiles').select('*').eq('id', clientId).single(),
                        supabase.from('workouts').select('*').eq('profile_id', clientId).order('created_at', { ascending: false }).limit(10),
                        supabase.from('workout_feedback').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(5)
                    ]);

                    if (profileRes.error) throw profileRes.error;

                    return {
                        profile: profileRes.data,
                        workouts: workoutsRes.data || [],
                        feedback: feedbackRes.data || []
                    };
                } catch (error) {
                    console.error('Error fetching client details:', error);
                    return null;
                }
            },

            fetchClientStats: async (clientId: string) => {
                try {
                    // Placeholder for complex stats logic
                    return {
                        consistency: 85,
                        streak: 12,
                        totalWorkouts: 45
                    };
                } catch (error) {
                    console.error('Error fetching client stats:', error);
                    return null;
                }
            }
        }),
        {
            name: 'coach-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
