export type PostType = 'workout' | 'manual';

export interface WorkoutData {
    duration: number; // seconds
    volume: number; // kg
    pr_count: number;
    workout_name: string;
    intensity: number; // 1-10
}

export interface Post {
    id: string;
    user_id: string;
    type: PostType;
    content: string | null;
    media_url: string | null;
    workout_data: WorkoutData | null;
    created_at: string;
    user?: {
        id: string;
        full_name: string;
        avatar_url: string | null;
    };
    likes_count?: number;
    comments_count?: number;
    user_has_liked?: boolean;
}

export interface Comment {
    id: string;
    user_id: string;
    post_id: string;
    content: string;
    created_at: string;
    user?: {
        id: string;
        full_name: string;
        avatar_url: string | null;
    };
}
