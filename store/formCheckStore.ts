import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { FormCheckResult } from '@/utils/formCheckService';

export interface FormCheck {
    id: string;
    user_id: string;
    workout_id?: string;
    exercise_name: string;
    video_url: string;
    thumbnail_url?: string;
    analysis_json: FormCheckResult;
    score: number;
    feedback: string[];
    created_at: string;
}

interface FormCheckState {
    formChecks: FormCheck[];
    loading: boolean;
    fetchFormChecks: () => Promise<void>;
    saveFormCheck: (data: {
        workout_id?: string;
        exercise_name: string;
        video_url: string;
        thumbnail_url?: string;
        result: FormCheckResult;
    }) => Promise<void>;
    uploadVideo: (uri: string) => Promise<string>;
    deleteFormCheck: (id: string) => Promise<void>;
}

export const useFormCheckStore = create<FormCheckState>((set, get) => ({
    formChecks: [],
    loading: false,

    fetchFormChecks: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('form_checks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) set({ formChecks: data as FormCheck[] });
        } catch (error) {
            console.error('Error fetching form checks:', error);
        } finally {
            set({ loading: false });
        }
    },

    saveFormCheck: async ({ workout_id, exercise_name, video_url, thumbnail_url, result }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('form_checks')
                .insert({
                    user_id: user.id,
                    workout_id,
                    exercise_name,
                    video_url,
                    thumbnail_url,
                    analysis_json: result,
                    score: result.score,
                    feedback: result.feedback,
                });

            if (error) throw error;
            await get().fetchFormChecks();
        } catch (error) {
            console.error('Error saving form check:', error);
            throw error;
        }
    },

    uploadVideo: async (uri: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const fileName = `${user.id}/${Date.now()}.mp4`;

            // In React Native/Expo, we use FormData for file uploads to Supabase
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: fileName,
                type: 'video/mp4',
            } as any);

            const { data, error } = await supabase.storage
                .from('workout-videos')
                .upload(fileName, formData);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('workout-videos')
                .getPublicUrl(data.path);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading video:', error);
            throw error;
        }
    },

    deleteFormCheck: async (id: string) => {
        try {
            const { error } = await supabase
                .from('form_checks')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await get().fetchFormChecks();
        } catch (error) {
            console.error('Error deleting form check:', error);
            throw error;
        }
    },
}));
