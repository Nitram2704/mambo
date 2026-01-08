import { useAnalyticsStore } from '@/store/analyticsStore';

export interface WeaknessInsight {
    type: 'balance' | 'volume' | 'consistency';
    title: string;
    description: string;
    recommendation: string;
    severity: 'low' | 'medium' | 'high';
}

export const analyzeWeaknesses = (): WeaknessInsight[] => {
    const { getMuscleBalance, getNutritionalAdherence } = useAnalyticsStore.getState();
    const muscleBalance = getMuscleBalance();
    const adherence = getNutritionalAdherence(7);
    const insights: WeaknessInsight[] = [];

    // 1. Muscle Balance Analysis (Push vs Pull)
    const pushGroups = ['Pecho', 'Hombros', 'Tríceps'];
    const pullGroups = ['Espalda', 'Bíceps'];
    const legsGroups = ['Piernas', 'Glúteos', 'Cuádriceps', 'Isquios', 'Pantorrillas'];

    const pushVolume = muscleBalance
        .filter(m => pushGroups.includes(m.muscle))
        .reduce((sum, m) => sum + m.volume, 0);

    const pullVolume = muscleBalance
        .filter(m => pullGroups.includes(m.muscle))
        .reduce((sum, m) => sum + m.volume, 0);

    const legsVolume = muscleBalance
        .filter(m => legsGroups.includes(m.muscle))
        .reduce((sum, m) => sum + m.volume, 0);

    if (pushVolume > 0 && pullVolume > 0) {
        const ratio = pushVolume / pullVolume;
        if (ratio > 1.4) { // Increased threshold slightly
            insights.push({
                type: 'balance',
                title: 'Desbalance de Empuje',
                description: `Tu volumen de empuje es un ${(ratio * 100 - 100).toFixed(0)}% mayor que el de jale.`,
                recommendation: 'Añade más ejercicios de tracción (remos, dominadas) para proteger la salud de tus hombros.',
                severity: 'medium'
            });
        } else if (ratio < 0.6) { // Decreased threshold slightly
            insights.push({
                type: 'balance',
                title: 'Desbalance de Tracción',
                description: `Tu volumen de jale es significativamente mayor que el de empuje.`,
                recommendation: 'Considera equilibrar con más press de banca o press militar.',
                severity: 'low'
            });
        }
    }

    // 2. Legs Volume Analysis
    const totalVolume = muscleBalance.reduce((sum, m) => sum + m.volume, 0);
    // Only flag if total volume is significant (> 100 units) and legs are underrepresented
    if (totalVolume > 100 && (legsVolume / totalVolume) < 0.2) {
        insights.push({
            type: 'balance',
            title: 'Día de Pierna Olvidado',
            description: 'El volumen de piernas representa menos del 20% de tu entrenamiento total.',
            recommendation: 'No te saltes el día de pierna. La base de un físico fuerte son las piernas.',
            severity: 'high'
        });
    }

    // 3. Nutritional Adherence
    if (adherence < 70) {
        insights.push({
            type: 'consistency',
            title: 'Adherencia Nutricional Baja',
            description: `Tu adherencia a los macros es del ${adherence.toFixed(0)}% esta semana.`,
            recommendation: 'Intenta preparar tus comidas con antelación para evitar decisiones impulsivas.',
            severity: 'medium'
        });
    }

    return insights;
};
