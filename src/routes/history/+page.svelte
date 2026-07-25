<script lang="ts">
	import { fly } from 'svelte/transition';
	import { feeds, diapers } from '$lib/stores/entries';
	import { formatTimeDisplay, formatDateHeader } from '$lib/date';
	import type { Entry } from '$lib/types';
	import EditEntryModal from '$lib/components/EditEntryModal.svelte';

	const categories = ['Feed', 'Pee', 'Poop'] as const;
	type Category = (typeof categories)[number];

	let pageIndex = $state(0);
	let direction = $state(1);
	let selected = $state<Entry | null>(null);

	function go(delta: number) {
		direction = delta;
		pageIndex = (pageIndex + delta + categories.length) % categories.length;
	}

	function byDateDesc(a: Entry, b: Entry) {
		return b.created.localeCompare(a.created);
	}

	function groupByDate(rows: Entry[]) {
		const order: string[] = [];
		const map = new Map<string, Entry[]>();
		for (const e of rows) {
			if (!map.has(e.date)) {
				map.set(e.date, []);
				order.push(e.date);
			}
			map.get(e.date)!.push(e);
		}
		return order.map((date) => ({ date, items: map.get(date)! }));
	}

	let feedGroups = $derived(groupByDate([...$feeds].sort(byDateDesc)));
	let peeGroups = $derived(
		groupByDate([...$diapers].filter((d) => d.subtype === 'pee').sort(byDateDesc))
	);
	let poopGroups = $derived(
		groupByDate([...$diapers].filter((d) => d.subtype === 'poop').sort(byDateDesc))
	);

	let currentGroups = $derived(
		categories[pageIndex] === 'Feed'
			? feedGroups
			: categories[pageIndex] === 'Pee'
				? peeGroups
				: poopGroups
	);

	function detail(e: Entry) {
		if (e.kind === 'feed') return e.quality;
		return e.subtype === 'poop' ? e.color : '—';
	}
</script>

<main class="flex min-h-dvh flex-col bg-baby-cream px-4 pb-10 pt-6 text-baby-ink">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-lg font-semibold">Charts</h1>
		<a href="/" class="rounded-full bg-white/60 px-4 py-2 text-sm font-medium shadow-sm">Home</a>
	</div>

	<div class="mb-6 flex items-center justify-between">
		<button
			aria-label="Previous chart"
			class="flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-xl shadow-sm active:scale-95"
			onclick={() => go(-1)}
		>
			‹
		</button>
		<div class="flex flex-col items-center gap-2">
			<h2 class="text-xl font-semibold tracking-wide">{categories[pageIndex]}</h2>
			<div class="flex gap-1.5">
				{#each categories as c, i (c)}
					<span
						class="h-1.5 w-1.5 rounded-full {i === pageIndex ? 'bg-baby-ink' : 'bg-baby-ink/20'}"
					></span>
				{/each}
			</div>
		</div>
		<button
			aria-label="Next chart"
			class="flex h-11 w-11 items-center justify-center rounded-full bg-white/60 text-xl shadow-sm active:scale-95"
			onclick={() => go(1)}
		>
			›
		</button>
	</div>

	{#key pageIndex}
		<div
			class="flex-1"
			in:fly={{ x: direction * 60, duration: 200 }}
			out:fly={{ x: direction * -60, duration: 150 }}
		>
			{#if currentGroups.length === 0}
				<p class="pt-10 text-center text-baby-ink/40">No {categories[pageIndex].toLowerCase()} entries yet.</p>
			{/if}

			{#each currentGroups as group (group.date)}
				<section class="mb-6">
					<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-baby-ink/50">
						{formatDateHeader(group.date)}
					</h3>
					<div class="overflow-hidden rounded-xl bg-white/70 shadow-sm">
						{#each group.items as entry, i (entry.id)}
							<button
								class="flex w-full items-center gap-4 px-4 py-3 text-left {i > 0
									? 'border-t border-baby-ink/10'
									: ''} {entry.kind === 'diaper' && entry.urgent ? 'bg-baby-blush/30' : ''}"
								onclick={() => (selected = entry)}
							>
								<span class="w-20 shrink-0 text-sm text-baby-ink/70"
									>{formatTimeDisplay(entry.time)}</span
								>
								<span class="flex-1 text-sm capitalize text-baby-ink">{detail(entry)}</span>
								{#if entry.kind === 'diaper' && entry.urgent}
									<span class="rounded-full bg-baby-blush px-2 py-1 text-xs font-semibold">Urgent</span>
								{/if}
							</button>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/key}
</main>

{#if selected}
	<EditEntryModal entry={selected} onclose={() => (selected = null)} />
{/if}
