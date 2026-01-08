import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/use-app-theme';

interface MeasurementInputProps {
    label: string;
    value?: number;
    unit: string;
    onChangeValue: (value: number | undefined) => void;
    isPremium?: boolean;
    isLocked?: boolean;
    onPressInfo?: () => void;
}

export function MeasurementInput({
    label,
    value,
    unit,
    onChangeValue,
    isPremium = false,
    isLocked = false,
    onPressInfo,
}: MeasurementInputProps) {
    const { theme } = useAppTheme();
    const [inputValue, setInputValue] = React.useState(value?.toString() || '');

    React.useEffect(() => {
        setInputValue(value?.toString() || '');
    }, [value]);

    const handleChange = (text: string) => {
        setInputValue(text);
        const numValue = parseFloat(text);
        if (text === '' || text === '-') {
            onChangeValue(undefined);
        } else if (!isNaN(numValue) && numValue >= 0) {
            onChangeValue(numValue);
        }
    };

    return (
        <View className="flex-row items-center justify-between py-3 border-b border-border">
            <View className="flex-row items-center flex-1">
                <Text className="text-text text-base">{label}</Text>
                {onPressInfo && (
                    <TouchableOpacity onPress={onPressInfo} className="ml-2">
                        <Ionicons
                            name="help-circle-outline"
                            size={18}
                            color={Colors[theme].primary}
                        />
                    </TouchableOpacity>
                )}
                {isPremium && (
                    <Ionicons
                        name="lock-closed"
                        size={14}
                        color={Colors[theme].textMuted}
                        style={{ marginLeft: 6 }}
                    />
                )}
            </View>

            {isLocked ? (
                <View className="flex-row items-center">
                    <Text className="text-text-muted text-base mr-2">-</Text>
                    <Ionicons name="lock-closed" size={18} color={Colors[theme].textMuted} />
                </View>
            ) : (
                <View className="flex-row items-center">
                    <TextInput
                        value={inputValue}
                        onChangeText={handleChange}
                        placeholder="-"
                        placeholderTextColor={Colors[theme].textMuted}
                        keyboardType="decimal-pad"
                        className="text-text text-base text-right min-w-[60px] mr-2"
                        maxLength={6}
                    />
                    <Text className="text-text-secondary text-sm w-12">{unit}</Text>
                </View>
            )}
        </View>
    );
}
