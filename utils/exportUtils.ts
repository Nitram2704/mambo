import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

export const exportAsImage = async (viewRef: any, fileName: string) => {
    try {
        const uri = await captureRef(viewRef, {
            format: 'png',
            quality: 0.8,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            await Sharing.shareAsync(uri, {
                dialogTitle: 'Compartir Reporte',
            });
        } else {
            Alert.alert('Error', 'Compartir no está disponible en este dispositivo');
        }
    } catch (error) {
        console.error('Error exporting image:', error);
        Alert.alert('Error', 'No se pudo exportar la imagen');
    }
};

export const shareReport = async (title: string, message: string) => {
    try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
            // For text sharing, we can use the native share
            Alert.alert(title, message + '\n\n¿Deseas compartir este reporte?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Compartir',
                    onPress: () => {
                        // In a real app, you'd format this better or use actual image export
                        console.log('Share report:', message);
                    }
                },
            ]);
        }
    } catch (error) {
        console.error('Error sharing:', error);
    }
};
