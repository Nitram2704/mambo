import { Accelerometer } from 'expo-sensors';

let subscription: { remove: () => void } | null = null;
let lastMagnitude = 0;
let movementHistory: number[] = [];
const HISTORY_LIMIT = 50; // Keep last 50 readings

export const startMonitoring = (callback: (movement: number) => void) => {
    Accelerometer.setUpdateInterval(100); // 10Hz is enough for sleep tracking

    subscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        // Calculate variance/change from last reading
        const delta = Math.abs(magnitude - lastMagnitude);
        lastMagnitude = magnitude;

        // Add to history for smoothing
        movementHistory.push(delta);
        if (movementHistory.length > HISTORY_LIMIT) {
            movementHistory.shift();
        }

        // Calculate average movement in the window
        const avgMovement = movementHistory.reduce((a, b) => a + b, 0) / movementHistory.length;
        callback(avgMovement);
    });
};

export const stopMonitoring = () => {
    if (subscription) {
        subscription.remove();
        subscription = null;
    }
    movementHistory = [];
};
