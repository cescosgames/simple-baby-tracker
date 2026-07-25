<script lang="ts">
	import { entries } from '$lib/stores/entries';
	import { formatTimeDisplay } from '$lib/date';
	import type { Entry } from '$lib/types';
	import EditEntryModal from './EditEntryModal.svelte';

	const LIMIT = 10;

	let selected = $state<Entry | null>(null);

	let rows = $derived($entries.slice(0, LIMIT));

	function typeLabel(e: Entry): string {
		if (e.kind === 'feed') return 'Feed';
		return e.subtype === 'poop' ? 'Poop' : 'Pee';
	}

	function detail(e: Entry): string {
		if (e.kind === 'feed') return e.quality;
		return e.subtype === 'poop' ? (e.color ?? '—') : '—';
	}
</script>

<div class="flex-1 overflow-y-auto px-4 pt-2 pb-36">
	<p class="mb-2 px-1 text-xs font-medium tracking-wide text-baby-ink/50 uppercase">
		Last {LIMIT} entries
	</p>
	<div class="overflow-hidden rounded-2xl bg-white/60 shadow-sm">
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr class="text-left text-xs uppercase tracking-wide text-baby-ink/50">
					<th class="px-4 py-3 font-medium">Time</th>
					<th class="px-4 py-3 font-medium">Type</th>
					<th class="px-4 py-3 font-medium">Detail</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as entry (entry.id)}
					<tr
						class="cursor-pointer border-t border-baby-ink/10 {entry.kind === 'diaper' &&
						entry.urgent
							? 'bg-baby-blush/30'
							: ''}"
						role="button"
						tabindex="0"
						onclick={() => (selected = entry)}
						onkeydown={(e) => e.key === 'Enter' && (selected = entry)}
					>
						<td class="px-4 py-3 text-baby-ink/80">{formatTimeDisplay(entry.time)}</td>
						<td class="px-4 py-3 font-medium text-baby-ink">{typeLabel(entry)}</td>
						<td class="px-4 py-3 capitalize text-baby-ink/80">{detail(entry)}</td>
					</tr>
				{/each}
				{#if rows.length === 0}
					<tr>
						<td colspan="3" class="py-10 text-center text-baby-ink/40"
							>Nothing logged yet — you've got this.</td
						>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

{#if selected}
	<EditEntryModal entry={selected} onclose={() => (selected = null)} />
{/if}
