import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export const readFileAsBase64 = async (uri: string): Promise<string> => {
    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
                const base64 = base64data.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } else {
        return await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
        });
    }
};
