import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Colors } from '@/constants/Colors';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { AccessibleText } from '@/components/ui/AccessibleText';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { analyzePhysique, BodyScanResult } from '@/utils/bodyScanService';
import { useBodyScanStore } from '@/store/bodyScanStore';
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { BodyScanResults } from '@/components/profile/BodyScanResults';

const { width } = Dimensions.get('window');

export default function BodyScanScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { theme } = useAppTheme();
    const colors = Colors[theme];

    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<BodyScanResult | null>(null);
    const { saveScan } = useBodyScanStore();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setResult(null);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('common.error'), 'Se necesita permiso de cámara');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setAnalyzing(true);
        try {
            // Convert image to base64
            const base64 = await FileSystem.readAsStringAsync(image, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const analysisResult = await analyzePhysique(base64);
            setResult(analysisResult);

            // Upload to Supabase Storage
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const fileName = `${user.id}/${Date.now()}.jpg`;
            const filePath = `body-scans/${fileName}`;

            // In a real app, we'd upload the file. For now, we'll simulate the URL
            // and save the scan. 
            // Note: Supabase upload from base64/uri in React Native requires specific handling.
            // We'll use a placeholder URL for now to demonstrate the flow.
            const photoUrl = `https://placeholder.com/${fileName}`;

            await saveScan({
                photo_url: photoUrl,
                result: analysisResult
            });

        } catch (error) {
            console.error(error);
            Alert.alert(t('common.error'), 'Error al analizar el físico. Inténtalo de nuevo.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <ScreenWrapper>
            <View className="flex-row items-center p-4 border-b border-white/5 bg-background">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-surface/50 p-2 rounded-full border border-white/10">
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <AccessibleText variant="caption" weight="black" className="text-primary uppercase tracking-widest mb-1">
                        AI Analysis
                    </AccessibleText>
                    <AccessibleText variant="h2" weight="black" className="text-text text-3xl tracking-tight">
                        Body Scan
                    </AccessibleText>
                </View>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {!result ? (
                    <View className="items-center py-6">
                        <Card variant="glass" className="w-full aspect-[3/4] items-center justify-center overflow-hidden border-dashed border-2 border-primary/30 bg-surface/30">
                            {image ? (
                                <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <View className="items-center p-8">
                                    <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6 shadow-glow">
                                        <Ionicons name="scan-outline" size={48} color={colors.primary} />
                                    </View>
                                    <AccessibleText weight="black" className="text-center mb-2 text-xl uppercase tracking-tight text-white">
                                        Sube una foto
                                    </AccessibleText>
                                    <AccessibleText variant="caption" className="text-center text-text-secondary leading-6">
                                        Nuestra IA analizará tu composición corporal. Para mejores resultados, usa buena iluminación.
                                    </AccessibleText>
                                </View>
                            )}
                        </Card>

                        <View className="flex-row w-full mt-6 gap-4">
                            <TouchableOpacity
                                onPress={takePhoto}
                                className="flex-1 bg-surface/50 p-4 rounded-2xl items-center flex-row justify-center border border-white/10"
                            >
                                <Ionicons name="camera" size={20} color={colors.primary} className="mr-2" />
                                <AccessibleText weight="bold" className="text-white">Cámara</AccessibleText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={pickImage}
                                className="flex-1 bg-surface/50 p-4 rounded-2xl items-center flex-row justify-center border border-white/10"
                            >
                                <Ionicons name="images" size={20} color={colors.primary} className="mr-2" />
                                <AccessibleText weight="bold" className="text-white">Galería</AccessibleText>
                            </TouchableOpacity>
                        </View>

                        {image && (
                            <View className="w-full mt-8">
                                <Button
                                    label={analyzing ? "Analizando..." : "Analizar Físico"}
                                    onPress={handleAnalyze}
                                    loading={analyzing}
                                    disabled={analyzing}
                                    variant="primary"
                                />
                            </View>
                        )}
                    </View>
                ) : (
                    <BodyScanResults result={result} />
                )}

                <View className="h-10" />
            </ScrollView>
        </ScreenWrapper>
    );
}
