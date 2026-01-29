import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface AcademyCourse {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    category: 'nutrition' | 'training' | 'recovery' | 'mindset';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    xp_reward: number;
    is_premium: boolean;
    created_at: string;
    updated_at: string;
}

export interface AcademyLesson {
    id: string;
    course_id: string;
    title: string;
    content: string;
    video_url?: string;
    duration_minutes: number;
    order_index: number;
    created_at: string;
    updated_at: string;
}

export interface AcademyQuiz {
    id: string;
    lesson_id: string;
    questions: {
        question: string;
        options: string[];
        correctAnswer: number;
    }[];
    passing_score: number;
}

export interface AcademyProgress {
    id: string;
    user_id: string;
    lesson_id: string;
    course_id: string;
    completed: boolean;
    quiz_score?: number;
    completed_at?: string;
}

interface AcademyState {
    courses: AcademyCourse[];
    lessons: AcademyLesson[];
    progress: AcademyProgress[];
    loading: boolean;

    fetchCourses: () => Promise<void>;
    fetchCourseDetails: (courseId: string) => Promise<{ lessons: AcademyLesson[]; progress: AcademyProgress[] }>;
    completeLesson: (lessonId: string, courseId: string, quizScore?: number) => Promise<void>;
    getCourseProgress: (courseId: string) => number;
}

export const useAcademyStore = create<AcademyState>((set, get) => ({
    courses: [],
    lessons: [],
    progress: [],
    loading: false,

    fetchCourses: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase
                .from('academy_courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) set({ courses: data as AcademyCourse[] });
        } catch (error) {
            console.error('Error fetching academy courses:', error);
        } finally {
            set({ loading: false });
        }
    },

    fetchCourseDetails: async (courseId: string) => {
        set({ loading: true });
        try {
            const [lessonsRes, progressRes] = await Promise.all([
                supabase
                    .from('academy_lessons')
                    .select('*')
                    .eq('course_id', courseId)
                    .order('order_index', { ascending: true }),
                supabase
                    .from('academy_progress')
                    .select('*')
                    .eq('course_id', courseId)
            ]);

            if (lessonsRes.error) throw lessonsRes.error;
            if (progressRes.error) throw progressRes.error;

            const lessons = (lessonsRes.data || []) as AcademyLesson[];
            const progress = (progressRes.data || []) as AcademyProgress[];

            set(state => ({
                lessons: [...state.lessons.filter(l => l.course_id !== courseId), ...lessons],
                progress: [...state.progress.filter(p => p.course_id !== courseId), ...progress]
            }));

            return { lessons, progress };
        } catch (error) {
            console.error('Error fetching course details:', error);
            return { lessons: [], progress: [] };
        } finally {
            set({ loading: false });
        }
    },

    completeLesson: async (lessonId, courseId, quizScore) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('academy_progress')
                .upsert({
                    user_id: user.id,
                    lesson_id: lessonId,
                    course_id: courseId,
                    completed: true,
                    quiz_score: quizScore,
                    completed_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,lesson_id'
                });

            if (error) throw error;

            // Refresh progress
            await get().fetchCourseDetails(courseId);
        } catch (error) {
            console.error('Error completing lesson:', error);
            throw error;
        }
    },

    getCourseProgress: (courseId: string) => {
        const { lessons, progress } = get();
        const courseLessons = lessons.filter(l => l.course_id === courseId);
        if (courseLessons.length === 0) return 0;

        const completedLessons = progress.filter(p => p.course_id === courseId && p.completed);
        return Math.round((completedLessons.length / courseLessons.length) * 100);
    }
}));
