import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Switch, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { Alarm } from '@/store/alarmStore';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AlarmSettingsModalProps {
    visible: boolean;
    alarm: Alarm | null;
    onClose: () => void;
    onSave: (updates: Partial<Alarm>) => void;
}

const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export function AlarmSettingsModal({ visible, alarm, onClose, onSave }: AlarmSettingsModalProps) {
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const [time, setTime] = useState(new Date());
    const [label, setLabel] = useState('');
    const [days, setDays] = useState<number[]>([]);
    const [smartWake, setSmartWake] = useState(true);
    const [smartWakeWindow, setSmartWakeWindow] = useState(30);
    const [sunriseEffect, setSunriseEffect] = useState(true);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        if (alarm) {
            const [hours, minutes] = alarm.time.split(':').map(Number);
            const date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes);
            setTime(date);
            setLabel(alarm.label);
            setDays(alarm.days);
            setSmartWake(alarm.smartWake);
            setSmartWakeWindow(alarm.smartWakeWindow);
            setSunriseEffect(alarm.sunriseEffect);
        }
    }, [alarm, visible]);

    const handleSave = () => {
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        onSave({
            time: `${hours}:${minutes}`,
            label,
            days,
            smartWake,
            smartWakeWindow,
            sunriseEffect,
        });
        onClose();
    };

    const toggleDay = (dayIndex: number) => {
        if (days.includes(dayIndex)) {
            setDays(days.filter(d => d !== dayIndex));
        } else {
            setDays([...days, dayIndex].sort());
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-surface rounded-t-[40px] p-6 h-[85%]" style={{ backgroundColor: colors.surface }}>
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-8">
                        <TouchableOpacity onPress={onClose}>
                            <AccessibleText className="text-text-secondary">Cancelar</AccessibleText>
                        </TouchableOpacity>
                        <AccessibleText weight="bold" className="text-text text-lg">Configurar Alarma</AccessibleText>
                        <TouchableOpacity onPress={handleSave}>
                            <AccessibleText weight="bold" className="text-primary">Guardar</AccessibleText>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Time Picker */}
                        <TouchableOpacity
                            onPress={() => setShowTimePicker(true)}
                            className="items-center mb-8"
                        >
                            <AccessibleText weight="bold" className="text-text text-6xl font-black">
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </AccessibleText>
                            <AccessibleText className="text-primary mt-2">Cambiar Hora</AccessibleText>
                        </TouchableOpacity>

                        {/* Label */}
                        <View className="mb-6">
                            <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-2 ml-1">
                                Etiqueta
                            </AccessibleText>
                            <TextInput
                                value={label}
                                onChangeText={setLabel}
                                placeholder="Nombre de la alarma"
                                placeholderTextColor={colors.textMuted}
                                className="bg-surface-highlight p-4 rounded-2xl text-text font-bold"
                                style={{ color: colors.text }}
                            />
                        </View>

                        {/* Days */}
                        <View className="mb-8">
                            <AccessibleText weight="bold" className="text-text-secondary text-xs uppercase tracking-widest mb-3 ml-1">
                                Repetir
                            </AccessibleText>
                            <View className="flex-row justify-between">
                                {DAYS.map((day, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => toggleDay(index)}
                                        className={`w-10 h-10 rounded-full items-center justify-center ${days.includes(index) ? 'bg-primary' : 'bg-surface-highlight'
                                            }`}
                                    >
                                        <AccessibleText
                                            weight="bold"
                                            className={days.includes(index) ? 'text-white' : 'text-text-secondary'}
                                        >
                                            {day}
                                        </AccessibleText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Smart Wake */}
                        <Card variant="glass" className="p-5 mb-4">
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-1 mr-4">
                                    <View className="flex-row items-center mb-1">
                                        <Ionicons name="sparkles" size={16} color={colors.primary} className="mr-2" />
                                        <AccessibleText weight="bold" className="text-text ml-2">Smart Wake</AccessibleText>
                                    </View>
                                    <AccessibleText className="text-text-secondary text-xs">
                                        Te despierta en tu fase de sueño más ligero dentro de una ventana de tiempo.
                                    </AccessibleText>
                                </View>
                                <Switch
                                    value={smartWake}
                                    onValueChange={setSmartWake}
                                    trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                                    thumbColor="#fff"
                                />
                            </View>

                            {smartWake && (
                                <View className="mt-2">
                                    <AccessibleText weight="bold" className="text-text-secondary text-[10px] uppercase mb-3">
                                        Ventana de tiempo: {smartWakeWindow} min
                                    </AccessibleText>
                                    <View className="flex-row gap-2">
                                        {[15, 30, 45].map(val => (
                                            <TouchableOpacity
                                                key={val}
                                                onPress={() => setSmartWakeWindow(val)}
                                                className={`flex-1 py-2 rounded-xl items-center border ${smartWakeWindow === val ? 'bg-primary/10 border-primary' : 'bg-surface-highlight border-transparent'
                                                    }`}
                                            >
                                                <AccessibleText weight="bold" className={smartWakeWindow === val ? 'text-primary' : 'text-text-secondary'}>
                                                    {val}m
                                                </AccessibleText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </Card>

                        {/* Sunrise Effect */}
                        <Card variant="glass" className="p-5 mb-8">
                            <View className="flex-row justify-between items-center">
                                <View className="flex-1 mr-4">
                                    <View className="flex-row items-center mb-1">
                                        <Ionicons name="sunny" size={16} color={colors.warning} className="mr-2" />
                                        <AccessibleText weight="bold" className="text-text ml-2">Efecto Amanecer</AccessibleText>
                                    </View>
                                    <AccessibleText className="text-text-secondary text-xs">
                                        Aumenta gradualmente la luz de la pantalla y el sonido 15 min antes.
                                    </AccessibleText>
                                </View>
                                <Switch
                                    value={sunriseEffect}
                                    onValueChange={setSunriseEffect}
                                    trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                                    thumbColor="#fff"
                                />
                            </View>
                        </Card>
                    </ScrollView>
                </View>
            </View>

            {showTimePicker && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                        setShowTimePicker(false);
                        if (date) setTime(date);
                    }}
                />
            )}
        </Modal>
    );
}
