import { exportAsImage, shareReport } from '../exportUtils';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { Alert } from 'react-native';

jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn(),
    },
}));


jest.mock('expo-sharing', () => ({
    isAvailableAsync: jest.fn(),
    shareAsync: jest.fn(),
}));

jest.mock('react-native-view-shot', () => ({
    captureRef: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('exportUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('exportAsImage', () => {
        it('should capture ref and share if sharing is available', async () => {
            (captureRef as jest.Mock).mockResolvedValue('file://test.png');
            (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);

            const mockRef = {};
            await exportAsImage(mockRef, 'test-image');

            expect(captureRef).toHaveBeenCalledWith(mockRef, expect.objectContaining({ format: 'png' }));
            expect(Sharing.shareAsync).toHaveBeenCalledWith('file://test.png', expect.any(Object));
        });

        it('should alert if sharing is not available', async () => {
            (captureRef as jest.Mock).mockResolvedValue('file://test.png');
            (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

            const mockRef = {};
            await exportAsImage(mockRef, 'test-image');

            expect(Alert.alert).toHaveBeenCalledWith('Error', expect.stringContaining('no está disponible'));
        });

        it('should handle errors during capture', async () => {
            (captureRef as jest.Mock).mockRejectedValue(new Error('Capture failed'));

            const mockRef = {};
            await exportAsImage(mockRef, 'test-image');

            expect(Alert.alert).toHaveBeenCalledWith('Error', expect.stringContaining('No se pudo exportar'));
        });
    });

    describe('shareReport', () => {
        it('should show alert with share option if sharing is available', async () => {
            (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);

            await shareReport('Test Title', 'Test Message');

            expect(Alert.alert).toHaveBeenCalledWith(
                'Test Title',
                expect.stringContaining('Test Message'),
                expect.arrayContaining([
                    expect.objectContaining({ text: 'Compartir' })
                ])
            );
        });

        it('should do nothing if sharing is not available', async () => {
            (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

            await shareReport('Test Title', 'Test Message');

            expect(Alert.alert).not.toHaveBeenCalled();
        });
    });
});
