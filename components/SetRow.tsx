import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Icon } from './ui/Icon';
import { Card } from './ui/Card';
import { WorkoutSet } from '@/store/activeWorkoutStore';
import { Colors } from '@/constants/Colors';

interface SetRowProps {
    set: WorkoutSet;
    index: number;
    onUpdate: (values: { weight: number; reps: number; rir: number }) => void;
    onToggle: () => void;
    onTypeChange?: (type: WorkoutSet['type']) => void;
    onOpenCalc?: (weight: number) => void;
    previousSet?: { weight: number; reps: number };
    show1RM?: boolean;
}

const SET_TYPES = [
    { key: 'warmup', label: 'Calentamiento', color: Colors.warning },
    { key: 'normal', label: 'Normal', color: Colors.primary },
    { key: 'dropset', label: 'Drop Set', color: Colors.error },
    { key: 'failure', label: 'Al Fallo', color: Colors.secondary },
    { key: 'rest_pause', label: 'Rest-Pause', color: Colors.success },
] as const;

export default function SetRow({ set, index, onUpdate, onToggle, onTypeChange, onOpenCalc, previousSet, show1RM }: SetRowProps) {
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
        <View className="mb-1.5">
            <Card
                variant={set.completed ? 'default' : 'glass'}
                className={`p-3 border ${set.completed ? 'bg-success/20 border-success/30' : 'border-white/5'}`}
            >
                <View className="flex-row items-center">
                    {/* Set Number */}
                    <View className="w-10 items-center">
                        <Text className={`font-black text-sm ${set.completed ? 'text-success' : 'text-text-secondary'}`}>
                            {index + 1}
                        </Text>
                        {previousSet && (
                            <Text className="text-[10px] text-text-muted font-bold mt-0.5">
                                {previousSet.weight}x{previousSet.reps}
                            </Text>
                        )}
                    </View>

                    {/* Set Type Selector */}
                    <TouchableOpacity
                        onPress={() => setShowTypeSelector(!showTypeSelector)}
                        className="w-8 h-8 rounded-lg items-center justify-center mr-2 border border-white/5"
                        style={{ backgroundColor: currentType.color + '20' }}
                    >
                        <Text className="text-[10px] font-black" style={{ color: currentType.color }}>
                            {currentType.label.slice(0, 1).toUpperCase()}
                        </Text>
                    </TouchableOpacity>

                    {/* Weight Input */}
                    <View className="flex-1 px-1">
                        <TextInput
                            className={`text-text p-2 rounded-xl text-center font-black text-base ${set.completed
                                ? 'bg-success/10 border-transparent'
                                : 'bg-surface-highlight/50 border border-white/5 focus:border-primary/50'
                                }`}
                            placeholder={previousSet ? previousSet.weight.toString() : "-"}
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="decimal-pad"
                            value={weight}
                            onChangeText={setWeight}
                            onBlur={handleBlur}
                            editable={!set.completed}
                            selectTextOnFocus
                        />
                    </View>

                    {/* Reps Input */}
                    <View className="flex-1 px-1">
                        <TextInput
                            className={`text-text p-2 rounded-xl text-center font-black text-base ${set.completed
                                ? 'bg-success/10 border-transparent'
                                : 'bg-surface-highlight/50 border border-white/5 focus:border-primary/50'
                                }`}
                            placeholder={previousSet ? previousSet.reps.toString() : "-"}
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="number-pad"
                            value={reps}
                            onChangeText={setReps}
                            onBlur={handleBlur}
                            editable={!set.completed}
                            selectTextOnFocus
                        />
                    </View>

                    {/* RIR Input */}
                    <View className="flex-1 px-1 relative">
                        <TextInput
                            className={`text-text p-2 rounded-xl text-center font-black text-base ${set.completed
                                ? 'bg-success/10 border-transparent'
                                : 'bg-surface-highlight/50 border border-white/5 focus:border-primary/50'
                                }`}
                            placeholder="-"
                            placeholderTextColor={Colors.textMuted}
                            keyboardType="decimal-pad"
                            value={rir}
                            onChangeText={setRir}
                            onBlur={handleBlur}
                            editable={!set.completed}
                            selectTextOnFocus
                        />
                        {!set.completed && (
                            <View className="absolute top-1 right-1">
                                <Icon name="flash" size={10} variant="warning" />
                            </View>
                        )}
                    </View>

                    {/* 1RM Estimate (Small Badge) */}
                    {show1RM && !set.completed && parseFloat(weight) > 0 && parseInt(reps) > 0 && (
                        <View className="absolute -top-2 right-14 bg-accent px-1.5 py-0.5 rounded-md z-10">
                            <Text className="text-[8px] font-black text-white uppercase">
                                1RM: {Math.round(parseFloat(weight) * (1 + parseInt(reps) / 30))}
                            </Text>
                        </View>
                    )}

                    {/* Plate Calculator Button */}
                    {onOpenCalc && !set.completed && (
                        <TouchableOpacity
                            onPress={() => onOpenCalc(parseFloat(weight) || 0)}
                            className="w-8 h-8 rounded-lg items-center justify-center bg-primary/20 border border-primary/30 ml-1"
                        >
                            <Icon name="calculator-outline" size={16} variant="primary" />
                        </TouchableOpacity>
                    )}

                    {/* Check Button */}
                    <TouchableOpacity
                        onPress={handleToggle}
                        disabled={!isReady && !set.completed}
                        className={`w-10 h-10 rounded-xl items-center justify-center ml-2 shadow-sm ${set.completed
                            ? 'bg-success shadow-success/20'
                            : isReady
                                ? 'bg-primary shadow-primary/20 active:bg-primary/80'
                                : 'bg-surface-highlight/50 border border-white/5'
                            }`}
                    >
                        <Icon
                            name={set.completed ? "checkmark-sharp" : "checkmark-outline"}
                            size={20}
                            color={set.completed ? 'white' : isReady ? 'white' : Colors.textMuted}
                        />
                    </TouchableOpacity>
                </View>
            </Card>

            {/* Type Selector */}
            {showTypeSelector && (
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
                            >
                                <Text className="text-[10px] font-black uppercase tracking-widest text-center" style={{ color: type.color }}>
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>
            )}
        </View>
    );
}

