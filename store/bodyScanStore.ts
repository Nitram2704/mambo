import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { BodyScanResult } from '@/utils/bodyScanService';

export interface BodyScan {
    id: string;
    photo_url: string;
    front_photo_url?: string;
    side_photo_url?: string;
    back_photo_url?: string;
    metrics: BodyScanResult['metrics'];
    insights: BodyScanResult['insights'];
    analysis_json: BodyScanResult;
    created_at: string;
}

interface BodyScanState {
    scans: BodyScan[];
    loading: boolean;
    fetchScans: () => Promise<void>;
    saveScan: (data: {
        photo_url: string;
        front_photo_url?: string;
        side_photo_url?: string;
        back_photo_url?: string;
        result: BodyScanResult;
    }) => Promise<void>;
}

export const useBodyScanStore = create<BodyScanState>((set, get) => ({
    scans: [],
    loading: false,
    fetchScans: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('body_scans')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) set({ scans: data as BodyScan[] });
        } catch (error) {
            console.error('Error fetching body scans:', error);
        } finally {
            set({ loading: false });
        }
    },
    saveScan: async ({ photo_url, front_photo_url, side_photo_url, back_photo_url, result }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('body_scans')
                .insert({
                    user_id: user.id,
                    photo_url,
                    front_photo_url,
                    side_photo_url,
                    back_photo_url,
                    metrics: result.metrics,
                    insights: result.insights,
                    analysis_json: result,
                });

            if (error) throw error;
            await get().fetchScans();
        } catch (error) {
            console.error('Error saving body scan:', error);
            throw error;
        }
    }
}));
