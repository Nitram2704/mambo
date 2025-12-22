export interface AlarmConfig {
    targetTime: Date;
    windowMinutes: number;
    threshold: number;
}

/**
 * Determines if the user should be woken up based on current movement and time window.
 */
export function shouldWakeUp(
    currentTime: Date,
    config: AlarmConfig,
    currentMovement: number
): boolean {
    const { targetTime, windowMinutes, threshold } = config;

    // Calculate the start of the wake-up window
    const windowStart = new Date(targetTime.getTime() - windowMinutes * 60 * 1000);

    // If we are before the window, don't wake up
    if (currentTime < windowStart) {
        return false;
    }

    // If we are past the target time, force wake up
    if (currentTime >= targetTime) {
        return true;
    }

    // If we are within the window, wake up if movement exceeds threshold (light sleep)
    if (currentMovement > threshold) {
        console.log(`⏰ Smart Wake Triggered: Movement ${currentMovement.toFixed(4)} > Threshold ${threshold}`);
        return true;
    }

    return false;
}

/**
 * Default threshold for movement detection. 
 * This might need calibration based on device sensitivity.
 */
export const DEFAULT_SLEEP_THRESHOLD = 0.05; 
