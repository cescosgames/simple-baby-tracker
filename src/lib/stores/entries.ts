import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { Diaper, DiaperColor, Entry, Feed, FeedQuality } from '$lib/types';
import { formatDate, formatTime } from '$lib/date';

const FEEDS_KEY = 'baby-tracker:feeds';
const DIAPERS_KEY = 'baby-tracker:diapers';

function load<T>(key: string): T[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T[]) : [];
	} catch {
		return [];
	}
}

function save<T>(key: string, value: T[]) {
	if (!browser) return;
	localStorage.setItem(key, JSON.stringify(value));
}

export const feeds = writable<Feed[]>(load<Feed>(FEEDS_KEY));
export const diapers = writable<Diaper[]>(load<Diaper>(DIAPERS_KEY));

feeds.subscribe((value) => save(FEEDS_KEY, value));
diapers.subscribe((value) => save(DIAPERS_KEY, value));

export const entries = derived([feeds, diapers], ([$feeds, $diapers]) => {
	const all: Entry[] = [...$feeds, ...$diapers];
	return all.sort((a, b) => b.created.localeCompare(a.created));
});

// Stubbed for future PocketBase wiring: every local write funnels through here
// so switching to real sync later only means giving this a body.
function queueSync(_entry: Entry) {}

function makeId(): string {
	return crypto.randomUUID();
}

export function logFeed(quality: FeedQuality = 'normal', at: Date = new Date()): Feed {
	const feed: Feed = {
		id: makeId(),
		kind: 'feed',
		date: formatDate(at),
		time: formatTime(at),
		quality,
		created: at.toISOString()
	};
	feeds.update((all) => [...all, feed]);
	queueSync(feed);
	return feed;
}

export function logPee(at: Date = new Date()): Diaper {
	const diaper: Diaper = {
		id: makeId(),
		kind: 'diaper',
		date: formatDate(at),
		time: formatTime(at),
		subtype: 'pee',
		color: null,
		urgent: false,
		created: at.toISOString()
	};
	diapers.update((all) => [...all, diaper]);
	queueSync(diaper);
	return diaper;
}

export function logPoop(color: DiaperColor, at: Date = new Date()): Diaper {
	const diaper: Diaper = {
		id: makeId(),
		kind: 'diaper',
		date: formatDate(at),
		time: formatTime(at),
		subtype: 'poop',
		color,
		urgent: color === 'red' || color === 'white',
		created: at.toISOString()
	};
	diapers.update((all) => [...all, diaper]);
	queueSync(diaper);
	return diaper;
}

export function deleteEntry(entry: Entry) {
	if (entry.kind === 'feed') {
		feeds.update((all) => all.filter((f) => f.id !== entry.id));
	} else {
		diapers.update((all) => all.filter((d) => d.id !== entry.id));
	}
}

export function updateFeed(id: string, patch: Partial<Omit<Feed, 'id' | 'kind' | 'created'>>) {
	feeds.update((all) => all.map((f) => (f.id === id ? { ...f, ...patch } : f)));
}

export function updateDiaper(id: string, patch: Partial<Omit<Diaper, 'id' | 'kind' | 'created'>>) {
	diapers.update((all) =>
		all.map((d) => {
			if (d.id !== id) return d;
			const next = { ...d, ...patch };
			if (next.subtype === 'poop' && next.color) {
				next.urgent = next.color === 'red' || next.color === 'white';
			} else {
				next.urgent = false;
			}
			return next;
		})
	);
}

export function exportBackup(): string {
	return JSON.stringify(
		{ exportedAt: new Date().toISOString(), feeds: get(feeds), diapers: get(diapers) },
		null,
		2
	);
}

export function importBackup(json: string) {
	const parsed = JSON.parse(json) as { feeds?: Feed[]; diapers?: Diaper[] };
	if (!Array.isArray(parsed.feeds) || !Array.isArray(parsed.diapers)) {
		throw new Error('Backup file is missing feeds/diapers arrays');
	}
	feeds.set(parsed.feeds);
	diapers.set(parsed.diapers);
}
