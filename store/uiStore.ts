import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
    message: string | null;
    type: ToastType;
    visible: boolean;
    showToast: (message: string, type?: ToastType) => void;
    hideToast: () => void;
}

export const useUIStore = create<ToastState>((set) => ({
    message: null,
    type: 'info',
    visible: false,
    showToast: (message, type = 'info') => {
        set({ message, type, visible: true });
        // Auto-hide after 3 seconds
        setTimeout(() => {
            set({ visible: false });
        }, 3000);
    },
    hideToast: () => set({ visible: false }),
}));
