import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ScheduleConfiguratorProps {
    initialSchedule?: {
        type: 'specific_days' | 'interval';
        days?: number[];
        interval?: number;
        startDate?: string;
    };
    onScheduleChange: (schedule: {
        type: 'specific_days' | 'interval';
        days?: number[];
        interval?: number;
        startDate?: string;
    } | null) => void;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

export function ScheduleConfigurator({ initialSchedule, onScheduleChange, enabled, onToggle }: ScheduleConfiguratorProps) {
    const [scheduleType, setScheduleType] = useState<'specific_days' | 'interval'>(initialSchedule?.type || 'specific_days');
    const [selectedDays, setSelectedDays] = useState<number[]>(initialSchedule?.days || []);
    const [intervalDays, setIntervalDays] = useState<string>(initialSchedule?.interval?.toString() || '4');
    const [startDate, setStartDate] = useState(initialSchedule?.startDate ? new Date(initialSchedule.startDate) : new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const weekDays = [
        { id: 1, label: 'L', name: 'Lunes' },
        { id: 2, label: 'M', name: 'Martes' },
        { id: 3, label: 'X', name: 'Miércoles' },
        { id: 4, label: 'J', name: 'Jueves' },
        { id: 5, label: 'V', name: 'Viernes' },
        { id: 6, label: 'S', name: 'Sábado' },
        { id: 0, label: 'D', name: 'Domingo' },
    ];

    useEffect(() => {
        if (enabled) {
            onScheduleChange({
                type: scheduleType,
                days: scheduleType === 'specific_days' ? selectedDays : undefined,
                interval: scheduleType === 'interval' ? parseInt(intervalDays) : undefined,
                startDate: startDate.toISOString().split('T')[0]
            });
        } else {
            onScheduleChange(null);
        }
    }, [enabled, scheduleType, selectedDays, intervalDays, startDate]);

    const toggleDay = (dayId: number) => {
        if (selectedDays.includes(dayId)) {
            setSelectedDays(selectedDays.filter(d => d !== dayId));
        } else {
            setSelectedDays([...selectedDays, dayId].sort());
        }
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || startDate;
        setShowDatePicker(Platform.OS === 'ios');
        setStartDate(currentDate);
    };

    return (
        <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-400 text-sm uppercase font-bold tracking-wider">Programación</Text>
                <TouchableOpacity
                    onPress={() => onToggle(!enabled)}
                    className={`px-3 py-1 rounded-full border ${enabled ? 'bg-blue-500/20 border-blue-500' : 'bg-gray-800 border-gray-600'}`}
                >
                    <Text className={`${enabled ? 'text-blue-400' : 'text-gray-400'} text-xs font-bold`}>
                        {enabled ? 'ACTIVADO' : 'DESACTIVADO'}
                    </Text>
                </TouchableOpacity>
            </View>

            {enabled && (
                <View className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    {/* Type Selector */}
                    <View className="flex-row bg-gray-900 p-1 rounded-lg mb-4">
                        <TouchableOpacity
                            onPress={() => setScheduleType('specific_days')}
                            className={`flex-1 py-2 rounded-md ${scheduleType === 'specific_days' ? 'bg-gray-700' : ''}`}
                        >
                            <Text className={`text-center font-bold ${scheduleType === 'specific_days' ? 'text-white' : 'text-gray-500'}`}>
                                Días Fijos
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setScheduleType('interval')}
                            className={`flex-1 py-2 rounded-md ${scheduleType === 'interval' ? 'bg-gray-700' : ''}`}
                        >
                            <Text className={`text-center font-bold ${scheduleType === 'interval' ? 'text-white' : 'text-gray-500'}`}>
                                Intervalo
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {scheduleType === 'specific_days' ? (
                        <View>
                            <Text className="text-gray-400 text-sm mb-3">Selecciona los días de la semana:</Text>
                            <View className="flex-row justify-between">
                                {weekDays.map((day) => (
                                    <TouchableOpacity
                                        key={day.id}
                                        onPress={() => toggleDay(day.id)}
                                        className={`w-10 h-10 rounded-full items-center justify-center border ${selectedDays.includes(day.id)
                                            ? 'bg-blue-600 border-blue-500'
                                            : 'bg-gray-700 border-gray-600'
                                            }`}
                                    >
                                        <Text className={`font-bold ${selectedDays.includes(day.id) ? 'text-white' : 'text-gray-400'}`}>
                                            {day.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View>
                            <Text className="text-gray-400 text-sm mb-2">Repetir cada:</Text>
                            <View className="flex-row items-center gap-3">
                                <TextInput
                                    className="bg-gray-900 text-white p-3 rounded-lg text-center text-lg border border-gray-600 w-20"
                                    keyboardType="number-pad"
                                    value={intervalDays}
                                    onChangeText={setIntervalDays}
                                    maxLength={2}
                                />
                                <Text className="text-white text-lg">días</Text>
                            </View>
                            <Text className="text-gray-500 text-xs mt-2">
                                Ejemplo: &quot;Cada 4 días&quot; creará una rutina rotativa (Entreno, Descanso, Descanso, Descanso, Entreno...)
                            </Text>

                            <View className="mt-4 pt-4 border-t border-gray-700">
                                <Text className="text-gray-400 text-sm mb-2">Empezar desde:</Text>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                    className="bg-gray-900 p-3 rounded-lg border border-gray-600"
                                >
                                    <Text className="text-white text-center text-lg font-bold">
                                        {startDate.toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={startDate}
                                        mode="date"
                                        is24Hour={true}
                                        display="default"
                                        onChange={onChangeDate}
                                    />
                                )}
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}
