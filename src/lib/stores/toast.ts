import { writable } from 'svelte/store';

export interface ToastState {
	message: string;
	undo: () => void;
}

export const toast = writable<ToastState | null>(null);

let hideTimer: ReturnType<typeof setTimeout> | undefined;

export function showToast(message: string, undo: () => void) {
	clearTimeout(hideTimer);
	toast.set({ message, undo });
	hideTimer = setTimeout(() => toast.set(null), 5000);
}

export function dismissToast() {
	clearTimeout(hideTimer);
	toast.set(null);
}
