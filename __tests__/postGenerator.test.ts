import { generateWorkoutPost } from '../utils/social/postGenerator';
import { GeminiService } from '../utils/GeminiService';

// Mock GeminiService
jest.mock('../utils/GeminiService', () => ({
    GeminiService: {
        chat: jest.fn().mockResolvedValue({ response: 'Test AI Caption' })
    }
}));

describe('generateWorkoutPost', () => {
    const mockWorkout = {
        routineName: 'Push Day',
        durationSeconds: 3600,
        exercises: [
            {
                sets: [
                    { weight: 100, reps: 10, isPR: true },
                    { weight: 100, reps: 10, isPR: false }
                ]
            }
        ]
    };

    it('should correctly calculate workout stats', async () => {
        const result = await generateWorkoutPost(mockWorkout);

        expect(result.workout_data.volume).toBe(2000); // (100*10) + (100*10)
        expect(result.workout_data.duration).toBe(3600);
        expect(result.workout_data.pr_count).toBe(1);
        expect(result.workout_data.workout_name).toBe('Push Day');
    });

    it('should call Gemini for a caption', async () => {
        const result = await generateWorkoutPost(mockWorkout);
        expect(GeminiService.chat).toHaveBeenCalled();
        expect(result.content).toBe('Test AI Caption');
    });

    it('should use fallback caption if Gemini fails', async () => {
        (GeminiService.chat as jest.Mock).mockRejectedValueOnce(new Error('AI Fail'));
        const result = await generateWorkoutPost(mockWorkout);
        expect(result.content).toContain('2000kg'); // Fallback logic
    });
});
