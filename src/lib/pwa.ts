import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { useRegisterSW } from 'virtual:pwa-register/svelte';

const sw = browser
	? useRegisterSW()
	: { needRefresh: writable(false), offlineReady: writable(false), updateServiceWorker: async () => {} };

export const needRefresh = sw.needRefresh;
export const offlineReady = sw.offlineReady;
export const updateServiceWorker = sw.updateServiceWorker;
