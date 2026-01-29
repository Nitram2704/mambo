import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Icon } from './ui/Icon';
import { Card } from './ui/Card';
import { WorkoutSet } from '@/types/schema';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { calculateOneRM } from '@/utils/workoutMath';
import { AccessibleText } from './ui/AccessibleText';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface SetRowProps {
    set: WorkoutSet;
    index: number;
    onUpdate: (values: { weight: number; reps: number; rir: number }) => void;
    onToggle: () => void;
    onTypeChange?: (type: WorkoutSet['type']) => void;
    onOpenCalc?: (weight: number) => void;
    previousSet?: { weight: number; reps: number };
    show1RM?: boolean;
    onRemove?: () => void;
}

export default function SetRow({ set, index, onUpdate, onToggle, onTypeChange, onOpenCalc, previousSet, show1RM, onRemove }: SetRowProps) {
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const SET_TYPES = [
        { key: 'warmup', label: 'Calentamiento', color: colors.warning },
        { key: 'normal', label: 'Normal', color: colors.primary },
        { key: 'dropset', label: 'Drop Set', color: colors.error },
        { key: 'failure', label: 'Al Fallo', color: colors.secondary },
        { key: 'rest_pause', label: 'Rest-Pause', color: colors.success },
    ] as const;
    const [weight, setWeight] = useState(set.weight > 0 ? set.weight.toString() : '');
    const [reps, setReps] = useState(set.reps > 0 ? set.reps.toString() : '');
    const [rir, setRir] = useState(set.rir > 0 ? set.rir.toString() : '');
    const [showTypeSelector, setShowTypeSelector] = useState(false);

    useEffect(() => {
        setWeight(set.weight > 0 ? set.weight.toString() : '');
        setReps(set.reps > 0 ? set.reps.toString() : '');
        setRir(set.rir > 0 ? set.rir.toString() : '');
    }, [set.weight, set.reps, set.rir]);

    const handleBlur = () => {
        const newWeight = parseFloat(weight) || 0;
        const newReps = parseInt(reps) || 0;
        const newRir = parseFloat(rir) || 0;

        // Only update if values changed to avoid loop
        if (newWeight !== set.weight || newReps !== set.reps || newRir !== set.rir) {
            onUpdate({
                weight: newWeight,
                reps: newReps,
                rir: newRir,
            });
        }
    };

    // Ready if has values OR has previous values to auto-fill
    const isReady = (parseFloat(weight) > 0 && parseInt(reps) > 0) ||
        (previousSet && !weight && !reps) ||
        set.completed;

    const handleToggle = () => {
        if (set.completed) {
            onToggle();
            return;
        }

        // Auto-fill from previous set if empty
        if (!weight && !reps && previousSet) {
            onUpdate({
                weight: previousSet.weight,
                reps: previousSet.reps,
                rir: 0,
            });
            // Small delay to allow update to propagate before toggling
            setTimeout(onToggle, 50);
            return;
        }

        if (!isReady) {
            Alert.alert('Completa los campos', 'Ingresa peso y repeticiones antes de marcar como completado.');
            return;
        }
        onToggle();
    };

    const currentType = SET_TYPES.find(t => t.key === set.type) || SET_TYPES[1];

    return (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()} className="mb-1.5">
            <Card
                variant={set.completed ? 'solid' : 'glass'}
                className={`p-3 border ${set.completed ? 'bg-success/20 border-success/30' : 'border-white/5'}`}
            >
                <View className="flex-row items-center">
                    {/* Set Number */}
                    <View className="w-10 items-center">
                        <AccessibleText className={`font-black text-sm ${set.completed ? 'text-success' : 'text-text-secondary'}`}>
                            {index + 1}
                        </AccessibleText>
                        {previousSet && (
                            <AccessibleText className="text-[10px] text-text-muted font-bold mt-0.5">
                                {previousSet.weight}x{previousSet.reps}
                            </AccessibleText>
                        )}
                    </View>

                    {/* Set Type Selector */}
                    <TouchableOpacity
                        onPress={() => setShowTypeSelector(!showTypeSelector)}
                        className="w-11 h-11 rounded-xl items-center justify-center mr-2 border border-white/5"
                        style={{ backgroundColor: currentType.color + '20' }}
                        accessibilityRole="button"
                        accessibilityLabel={`Tipo de serie: ${currentType.label}`}
                        accessibilityHint="Toca para cambiar el tipo de serie (calentamiento, drop set, etc.)"
                    >
                        <AccessibleText className="text-xs font-black" style={{ color: currentType.color }}>
                            {currentType.label.slice(0, 1).toUpperCase()}
                        </AccessibleText>
                    </TouchableOpacity>

                    {/* Weight Input */}
                    <View className="flex-1 px-1">
                        <TextInput
                            className={`text-text p-2 rounded-xl text-center font-black text-lg h-11 ${set.completed
                                ? 'bg-success/10 border-transparent'
                                : 'bg-surface-highlight/50 border border-white/5 focus:border-primary/50'
                                }`}
                            placeholder={previousSet ? previousSet.weight.toString() : "-"}
                            placeholderTextColor={colors.textMuted}
                            keyboardType="decimal-pad"
                            value={weight}
                            onChangeText={setWeight}
                            onBlur={handleBlur}
                            editable={!set.completed}
                            selectTextOnFocus
                            accessibilityLabel={`Peso para la serie ${index + 1}`}
                            accessibilityHint="Ingresa el peso en kilogramos"
                        />
                    </View>

                    {/* Reps Input */}
                    <View className="flex-1 px-1">
                        <TextInput
                            className={`text-text p-2 rounded-xl text-center font-black text-lg h-11 ${set.completed
                                ? 'bg-success/10 border-transparent'
                                : 'bg-surface-highlight/50 border border-white/5 focus:border-primary/50'
                                }`}
                            placeholder={previousSet ? previousSet.reps.toString() : "-"}
                            placeholderTextColor={colors.textMuted}
                            keyboardType="number-pad"
                            value={reps}
                            onChangeText={setReps}
                            onBlur={handleBlur}
                            editable={!set.completed}
                            selectTextOnFocus
                            accessibilityLabel={`Repeticiones para la serie ${index + 1}`}
                            accessibilityHint="Ingresa el número de repeticiones realizadas"
                        />
                    </View>

                    {/* RIR Input */}
                    <View className="flex-1 px-1 relative">
                        <TextInput
                            className={`text-text p-2 rounded-xl text-center font-black text-lg h-11 ${set.completed
                                ? 'bg-success/10 border-transparent'
                                : 'bg-surface-highlight/50 border border-white/5 focus:border-primary/50'
                                }`}
                            placeholder="-"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="decimal-pad"
                            value={rir}
                            onChangeText={setRir}
                            onBlur={handleBlur}
                            editable={!set.completed}
                            selectTextOnFocus
                            accessibilityLabel={`RIR para la serie ${index + 1}`}
                            accessibilityHint="Repeticiones en reserva. Cuántas más podrías haber hecho."
                        />
                        {!set.completed && (
                            <View className="absolute top-1 right-1" pointerEvents="none">
                                <Icon name="flash" size={10} variant="warning" />
                            </View>
                        )}
                    </View>

                    {/* 1RM Estimate (Small Badge) */}
                    {show1RM && !set.completed && parseFloat(weight) > 0 && parseInt(reps) > 0 && (
                        <View className="absolute -top-2 right-14 bg-accent px-1.5 py-0.5 rounded-md z-10">
                            <AccessibleText className="text-[8px] font-black text-white uppercase">
                                1RM: {calculateOneRM(parseFloat(weight), parseInt(reps))}
                            </AccessibleText>
                        </View>
                    )}



                    {/* Delete Button */}
                    {onRemove && !set.completed && (
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    'Eliminar Serie',
                                    '¿Estás seguro?',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        { text: 'Eliminar', onPress: onRemove, style: 'destructive' }
                                    ]
                                );
                            }}
                            className="w-11 h-11 rounded-xl items-center justify-center bg-error/20 border border-error/30 ml-1"
                            accessibilityRole="button"
                            accessibilityLabel={`Eliminar serie ${index + 1}`}
                        >
                            <Icon name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    )}
                    {/* Check Button */}
                    <TouchableOpacity
                        onPress={handleToggle}
                        disabled={!isReady && !set.completed}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className={`w-10 h-10 rounded-xl items-center justify-center ml-2 shadow-sm ${set.completed
                            ? 'bg-success shadow-success/20 animate-tada'
                            : isReady
                                ? 'bg-primary shadow-primary/20 active:bg-primary/80'
                                : 'bg-surface-highlight/50 border border-white/5'
                            }`}
                        accessibilityRole="button"
                        accessibilityLabel={set.completed ? "Marcar como no completada" : "Marcar como completada"}
                        accessibilityState={{ checked: set.completed }}
                    >
                        <Icon
                            name={set.completed ? "checkmark-sharp" : "checkmark-outline"}
                            size={20}
                            color={set.completed ? 'white' : isReady ? 'white' : colors.textMuted}
                        />
                    </TouchableOpacity>
                </View>
            </Card >

            {/* Type Selector */}
            {
                showTypeSelector && (
                    <Card variant="glass" className="mt-2 p-2 border-white/10">
                        <View className="flex-row flex-wrap gap-1.5">
                            {SET_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.key}
                                    onPress={() => {
                                        onTypeChange?.(type.key as WorkoutSet['type']);
                                        setShowTypeSelector(false);
                                    }}
                                    className="flex-1 min-w-[30%] p-2 rounded-xl items-center border border-white/5"
                                    style={{ backgroundColor: type.color + '20' }}
                                    accessibilityRole="button"
                                    accessibilityLabel={type.label}
                                >
                                    <AccessibleText className="text-[10px] font-black uppercase tracking-widest text-center" style={{ color: type.color }}>
                                        {type.label}
                                    </AccessibleText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>
                )
            }
        </Animated.View >
    );
}

