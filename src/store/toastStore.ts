// toastStore — lightweight toast queue for non-blocking error and status notifications.
// Use showToast() instead of Alert.alert() for transient messages.

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number; // ms before auto-dismiss
}

interface ToastState {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (message, type = 'error', duration = 3500) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-4), { id, type, message, duration }],
    }));
  },

  hideToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// Convenience helpers — call from anywhere without hook rules
export const toast = {
  error: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, 'error', duration),
  success: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, 'success', duration),
  info: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, 'info', duration),
  warning: (msg: string, duration?: number) =>
    useToastStore.getState().showToast(msg, 'warning', duration),
};
