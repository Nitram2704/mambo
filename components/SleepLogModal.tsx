import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSleepStore, SleepQuality, SleepTag, formatSleepDuration } from '@/store/sleepStore';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Card } from '@/components/ui/Card';

interface SleepLogModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function SleepLogModal({ visible, onClose }: SleepLogModalProps) {
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const { logSleep } = useSleepStore();

    const [date, setDate] = useState(new Date());
    const [bedTime, setBedTime] = useState(new Date());
    const [wakeTime, setWakeTime] = useState(new Date());
    const [quality, setQuality] = useState<SleepQuality>(3);
    const [notes, setNotes] = useState('');
    const [selectedTags, setSelectedTags] = useState<SleepTag[]>([]);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showBedTimePicker, setShowBedTimePicker] = useState(false);
    const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

    const tags: SleepTag[] = ['restless', 'dreams', 'interrupted', 'refreshed'];

    const toggleTag = (tag: SleepTag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const calculateDuration = (): number => {
        let duration = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60);
        if (duration < 0) duration += 24 * 60;
        return Math.round(duration);
    };

    const handleSave = () => {
        const duration = calculateDuration();

        if (duration <= 0 || duration > 24 * 60) {
            Alert.alert(t('common.error'), t('sleep.errorDuration'));
            return;
        }

        logSleep({
            date: date.toISOString().split('T')[0],
            bedTime,
            wakeTime,
            quality,
            notes: notes.trim() || undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
        });

        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View
                    className="h-[90%] rounded-t-[40px] overflow-hidden"
                    style={{ backgroundColor: Colors[theme].background }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-6 border-b" style={{ borderBottomColor: Colors[theme].border }}>
                        <TouchableOpacity onPress={onClose}>
                            <Text className="text-lg" style={{ color: Colors[theme].textSecondary }}>{t('sleep.cancel')}</Text>
                        </TouchableOpacity>
                        <Text className="text-xl font-bold" style={{ color: Colors[theme].text }}>{t('sleep.logSleep')}</Text>
                        <TouchableOpacity onPress={handleSave}>
                            <Text className="text-lg font-bold" style={{ color: Colors[theme].primary }}>{t('sleep.save')}</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 p-6">
                        {/* Date */}
                        <Card variant="glass" className="p-4 mb-4">
                            <Text className="text-text font-bold text-lg mb-3">{t('sleep.date')}</Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="p-3 rounded-lg border bg-surface-highlight border-border">
                                <Text className="text-text text-center text-lg">
                                    {date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(Platform.OS === 'ios');
                                        if (selectedDate) setDate(selectedDate);
                                    }}
                                />
                            )}
                        </Card>

                        {/* Sleep Times */}
                        <Card variant="glass" className="p-4 mb-4">
                            <Text className="text-text font-bold text-lg mb-3">{t('sleep.times')}</Text>

                            <View className="mb-3">
                                <Text className="text-text-secondary text-sm mb-2">{t('sleep.bedTime')}</Text>
                                <TouchableOpacity
                                    onPress={() => setShowBedTimePicker(true)}
                                    className="p-3 rounded-lg border bg-surface-highlight border-border flex-row items-center justify-between">
                                    <Ionicons name="moon" size={20} color={Colors[theme].primary} />
                                    <Text className="text-text text-lg font-bold">
                                        {bedTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <View style={{ width: 20 }} />
                                </TouchableOpacity>
                                {showBedTimePicker && (
                                    <DateTimePicker
                                        value={bedTime}
                                        mode="time"
                                        display="default"
                                        onChange={(event, selectedTime) => {
                                            setShowBedTimePicker(Platform.OS === 'ios');
                                            if (selectedTime) setBedTime(selectedTime);
                                        }}
                                    />
                                )}
                            </View>

                            <View>
                                <Text className="text-text-secondary text-sm mb-2">{t('sleep.wakeTime')}</Text>
                                <TouchableOpacity
                                    onPress={() => setShowWakeTimePicker(true)}
                                    className="p-3 rounded-lg border bg-surface-highlight border-border flex-row items-center justify-between">
                                    <Ionicons name="sunny" size={20} color="#fbbf24" />
                                    <Text className="text-text text-lg font-bold">
                                        {wakeTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <View style={{ width: 20 }} />
                                </TouchableOpacity>
                                {showWakeTimePicker && (
                                    <DateTimePicker
                                        value={wakeTime}
                                        mode="time"
                                        display="default"
                                        onChange={(event, selectedTime) => {
                                            setShowWakeTimePicker(Platform.OS === 'ios');
                                            if (selectedTime) setWakeTime(selectedTime);
                                        }}
                                    />
                                )}
                            </View>

                            {/* Duration Preview */}
                            <View className="mt-3 p-3 rounded-lg border bg-primary/10 border-primary/50">
                                <Text className="text-primary text-center">
                                    {t('sleep.duration')}: {formatSleepDuration(calculateDuration())}
                                </Text>
                            </View>
                        </Card>

                        {/* Quality Rating */}
                        <Card variant="glass" className="p-4 mb-4">
                            <Text className="text-text font-bold text-lg mb-3">{t('sleep.qualityTitle')}</Text>
                            <View className="flex-row justify-between">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setQuality(star as SleepQuality)}
                                        className="p-2">
                                        <Ionicons
                                            name={quality >= star ? 'star' : 'star-outline'}
                                            size={40}
                                            color={quality >= star ? '#fbbf24' : Colors[theme].textMuted}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text className="text-text-secondary text-center mt-2">
                                {t(`sleep.qualities.${quality}`)}
                            </Text>
                        </Card>

                        {/* Tags */}
                        <Card variant="glass" className="p-4 mb-4">
                            <Text className="text-text font-bold text-lg mb-3">{t('sleep.features')}</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <TouchableOpacity
                                        key={tag}
                                        onPress={() => toggleTag(tag)}
                                        className={`px-4 py-2 rounded-full border ${selectedTags.includes(tag) ? 'bg-primary border-primary' : 'bg-surface-highlight border-border'}`}>
                                        <Text className={`${selectedTags.includes(tag) ? 'text-white' : 'text-text-secondary'}`}>
                                            {t(`sleep.tags.${tag}`)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Card>

                        {/* Notes */}
                        <Card variant="glass" className="p-4 mb-8">
                            <Text className="text-text font-bold text-lg mb-3">{t('sleep.notes')}</Text>
                            <TextInput
                                className="p-3 rounded-lg border text-base bg-surface-highlight border-border text-text"
                                placeholder={t('sleep.notesPlaceholder')}
                                placeholderTextColor={Colors[theme].textMuted}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </Card>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
