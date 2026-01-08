import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useWeightStore, BodyMeasurements } from '@/store/weightStore';
import { useUIStore } from '@/store/uiStore';
import { MeasurementInput } from '@/components/MeasurementInput';
import { MEASUREMENT_INSTRUCTIONS } from '@/utils/measurementInstructions';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';

export default function LogWeightScreen() {
    const router = useRouter();
    const { logWeight } = useWeightStore();
    const { showToast } = useUIStore();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const [weight, setWeight] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [note, setNote] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [showMeasurements, setShowMeasurements] = useState(false);

    // Measurements state
    const [measurements, setMeasurements] = useState<Partial<BodyMeasurements>>({});

    const updateMeasurement = (key: keyof BodyMeasurements, value: number | undefined) => {
        setMeasurements(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const showMeasurementInfo = (key: keyof BodyMeasurements) => {
        const instruction = MEASUREMENT_INSTRUCTIONS[key];
        if (instruction) {
            Alert.alert('Cómo medir', instruction, [{ text: 'Entendido' }]);
        }
    };

    const handleSave = () => {
        if (!weight) {
            showToast('Por favor ingresa tu peso para poder registrarlo.', 'warning');
            return;
        }

        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum <= 0 || weightNum > 300) {
            showToast('El peso ingresado no parece ser válido. Revisa el número.', 'error');
            return;
        }

        // Filter out undefined measurements
        const filteredMeasurements = Object.fromEntries(
            Object.entries(measurements).filter(([_, value]) => value !== undefined)
        ) as Partial<BodyMeasurements>;

        logWeight({
            date: date.toISOString().split('T')[0],
            weight: weightNum,
            measurements: Object.keys(filteredMeasurements).length > 0 ? filteredMeasurements : undefined,
            note: note.trim() || undefined,
            photoUri: photoUri || undefined,
        });

        showToast('¡Registro guardado exitosamente!', 'success');
        router.back();
    };

    const pickImage = async (useCamera: boolean) => {
        let result;

        if (useCamera) {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                showToast('Necesitamos acceso a la cámara para tomar la foto.', 'info');
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.7,
            });
        } else {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                showToast('Necesitamos acceso a la galería para seleccionar la foto.', 'info');
                return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.7,
            });
        }

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    return (
        <ScreenWrapper bg="bg-background" safeArea={true}>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-border/10">
                <TouchableOpacity onPress={() => router.back()}>
                    <AccessibleText className="text-text-muted text-lg">Cancelar</AccessibleText>
                </TouchableOpacity>
                <AccessibleText weight="bold" className="text-text text-xl">Registrar Peso</AccessibleText>
                <TouchableOpacity onPress={handleSave}>
                    <AccessibleText weight="bold" className="text-primary text-lg">Guardar</AccessibleText>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Date Picker */}
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                    className="mb-4">
                    <Card variant="glass" className="p-4 flex-row justify-between items-center">
                        <AccessibleText weight="bold" className="text-text">Fecha</AccessibleText>
                        <AccessibleText className="text-text-secondary">{date.toLocaleDateString()}</AccessibleText>
                    </Card>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDate(selectedDate);
                        }}
                    />
                )}

                {/* Weight Input */}
                <Card variant="glass" className="p-6 mb-4 items-center">
                    <AccessibleText className="text-text-secondary mb-2">Peso Actual (kg)</AccessibleText>
                    <View className="flex-row items-end">
                        <TextInput
                            className="text-text text-5xl font-bold text-center w-32"
                            style={{ color: colors.text }}
                            placeholder="0.0"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="decimal-pad"
                            value={weight}
                            onChangeText={setWeight}
                            autoFocus
                        />
                        <AccessibleText className="text-text-muted text-xl mb-2 ml-2">kg</AccessibleText>
                    </View>
                </Card>

                {/* Photo Section */}
                <Card variant="glass" className="p-4 mb-4">
                    <AccessibleText weight="bold" className="text-text mb-4">Foto de Progreso (Opcional)</AccessibleText>

                    {photoUri ? (
                        <View>
                            <Image
                                source={{ uri: photoUri }}
                                className="w-full h-64 rounded-lg mb-3 bg-surface-highlight"
                                resizeMode="contain"
                            />
                            <TouchableOpacity
                                onPress={() => setPhotoUri(null)}
                                className="bg-error/10 p-3 rounded-lg border border-error/50">
                                <AccessibleText weight="bold" className="text-error text-center">Eliminar Foto</AccessibleText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => pickImage(true)}
                                className="flex-1 bg-surface-highlight p-4 rounded-lg items-center justify-center border border-border/10 active:bg-surface">
                                <Ionicons name="camera" size={24} color={colors.primary} />
                                <AccessibleText weight="bold" className="text-text-secondary mt-2">Cámara</AccessibleText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => pickImage(false)}
                                className="flex-1 bg-surface-highlight p-4 rounded-lg items-center justify-center border border-border/10 active:bg-surface">
                                <Ionicons name="images" size={24} color={colors.primary} />
                                <AccessibleText weight="bold" className="text-text-secondary mt-2">Galería</AccessibleText>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card>

                {/* Measurements Section */}
                <Card variant="glass" className="mb-4">
                    <TouchableOpacity
                        onPress={() => setShowMeasurements(!showMeasurements)}
                        className="p-4 flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Ionicons name="body" size={20} color={colors.primary} />
                            <AccessibleText weight="bold" className="text-text ml-2">Medidas</AccessibleText>
                        </View>
                        <Ionicons
                            name={showMeasurements ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={colors.textMuted}
                        />
                    </TouchableOpacity>

                    {showMeasurements && (
                        <View className="px-4 pb-4">
                            <MeasurementInput
                                label="Cintura"
                                value={measurements.waist}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('waist', v)}
                                onPressInfo={() => showMeasurementInfo('waist')}
                            />
                            <MeasurementInput
                                label="Grasa Corporal"
                                value={measurements.bodyFat}
                                unit="%"
                                onChangeValue={(v) => updateMeasurement('bodyFat', v)}
                                onPressInfo={() => showMeasurementInfo('bodyFat')}
                            />
                            <MeasurementInput
                                label="Masa Corporal Magra"
                                value={measurements.leanMass}
                                unit="kg"
                                onChangeValue={(v) => updateMeasurement('leanMass', v)}
                                onPressInfo={() => showMeasurementInfo('leanMass')}
                            />
                            <MeasurementInput
                                label="Cuello"
                                value={measurements.neck}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('neck', v)}
                                onPressInfo={() => showMeasurementInfo('neck')}
                            />
                            <MeasurementInput
                                label="Hombro"
                                value={measurements.shoulders}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('shoulders', v)}
                                onPressInfo={() => showMeasurementInfo('shoulders')}
                            />
                            <MeasurementInput
                                label="Pecho"
                                value={measurements.chest}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('chest', v)}
                                onPressInfo={() => showMeasurementInfo('chest')}
                            />
                            <MeasurementInput
                                label="Bíceps Izquierdo"
                                value={measurements.bicepsLeft}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('bicepsLeft', v)}
                                onPressInfo={() => showMeasurementInfo('bicepsLeft')}
                            />
                            <MeasurementInput
                                label="Bíceps Derecho"
                                value={measurements.bicepsRight}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('bicepsRight', v)}
                                onPressInfo={() => showMeasurementInfo('bicepsRight')}
                            />
                            <MeasurementInput
                                label="Antebrazo Izquierdo"
                                value={measurements.forearmLeft}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('forearmLeft', v)}
                                onPressInfo={() => showMeasurementInfo('forearmLeft')}
                            />
                            <MeasurementInput
                                label="Antebrazo Derecho"
                                value={measurements.forearmRight}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('forearmRight', v)}
                                onPressInfo={() => showMeasurementInfo('forearmRight')}
                            />
                            <MeasurementInput
                                label="Abdomen"
                                value={measurements.abdomen}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('abdomen', v)}
                                onPressInfo={() => showMeasurementInfo('abdomen')}
                            />
                            <MeasurementInput
                                label="Caderas"
                                value={measurements.hips}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('hips', v)}
                                onPressInfo={() => showMeasurementInfo('hips')}
                            />
                            <MeasurementInput
                                label="Muslo Izquierdo"
                                value={measurements.thighLeft}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('thighLeft', v)}
                                onPressInfo={() => showMeasurementInfo('thighLeft')}
                            />
                            <MeasurementInput
                                label="Muslo Derecho"
                                value={measurements.thighRight}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('thighRight', v)}
                                onPressInfo={() => showMeasurementInfo('thighRight')}
                            />
                            <MeasurementInput
                                label="Gemelo Izquierdo"
                                value={measurements.calfLeft}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('calfLeft', v)}
                                onPressInfo={() => showMeasurementInfo('calfLeft')}
                            />
                            <MeasurementInput
                                label="Gemelo Derecho"
                                value={measurements.calfRight}
                                unit="cm"
                                onChangeValue={(v) => updateMeasurement('calfRight', v)}
                                onPressInfo={() => showMeasurementInfo('calfRight')}
                            />
                        </View>
                    )}
                </Card>

                {/* Notes */}
                <Card variant="glass" className="p-4 mb-8">
                    <AccessibleText weight="bold" className="text-text mb-2">Notas</AccessibleText>
                    <TextInput
                        className="bg-surface-highlight text-text p-3 rounded-lg min-h-[100px]"
                        style={{ color: colors.text, textAlignVertical: 'top' }}
                        placeholder="¿Cómo te sientes hoy?"
                        placeholderTextColor={colors.textMuted}
                        multiline
                        value={note}
                        onChangeText={setNote}
                    />
                </Card>
            </ScrollView>
        </ScreenWrapper>
    );
}
