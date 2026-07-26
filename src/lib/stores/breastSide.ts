import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const KEY = 'baby-tracker:last-side';

export type Side = 'L' | 'R';

function load(): Side {
	if (!browser) return 'L';
	const raw = localStorage.getItem(KEY);
	return raw === 'L' || raw === 'R' ? raw : 'L';
}

export const lastSide = writable<Side>(load());

lastSide.subscribe((value) => {
	if (browser) localStorage.setItem(KEY, value);
});

export function toggleSide() {
	lastSide.update((side) => (side === 'L' ? 'R' : 'L'));
}
