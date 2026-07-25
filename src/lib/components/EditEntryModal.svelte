<script lang="ts">
	import type { Diaper, DiaperColor, Entry, Feed, FeedQuality } from '$lib/types';
	import { updateFeed, updateDiaper, deleteEntry } from '$lib/stores/entries';

	interface Props {
		entry: Entry;
		onclose: () => void;
	}

	let { entry, onclose }: Props = $props();

	let time = $state(entry.time);
	let quality = $state<FeedQuality>(entry.kind === 'feed' ? entry.quality : 'normal');
	let color = $state<DiaperColor | null>(entry.kind === 'diaper' ? entry.color : null);

	const qualities: FeedQuality[] = ['poor', 'normal', 'good'];
	const colors: DiaperColor[] = ['yellow', 'green', 'brown', 'orange', 'black', 'red', 'white'];

	function save() {
		if (entry.kind === 'feed') {
			updateFeed(entry.id, { time, quality });
		} else if (entry.subtype === 'poop') {
			updateDiaper(entry.id, { time, color });
		} else {
			updateDiaper(entry.id, { time });
		}
		onclose();
	}

	function remove() {
		deleteEntry(entry);
		onclose();
	}
</script>

<div
	class="fixed inset-0 z-50 flex flex-col justify-end bg-black/50"
	role="button"
	tabindex="0"
	onclick={onclose}
	onkeydown={(e) => e.key === 'Escape' && onclose()}
>
	<div
		class="flex flex-col gap-5 rounded-t-3xl bg-baby-cream p-6 pb-10"
		role="presentation"
		onclick={(e) => e.stopPropagation()}
	>
		<p class="text-lg font-medium text-baby-ink">
			Edit {entry.kind === 'feed' ? 'feed' : entry.subtype}
		</p>

		<label class="flex flex-col gap-1 text-sm text-baby-ink/60">
			Time
			<input
				type="time"
				bind:value={time}
				class="rounded-lg border border-baby-ink/20 bg-white px-3 py-2 text-base text-baby-ink"
			/>
		</label>

		{#if entry.kind === 'feed'}
			<div class="flex gap-2">
				{#each qualities as q (q)}
					<button
						class="flex-1 rounded-lg border py-2 text-sm capitalize {quality === q
							? 'border-baby-lavender bg-baby-lavender text-baby-ink'
							: 'border-baby-ink/20 text-baby-ink'}"
						onclick={() => (quality = q)}
					>
						{q}
					</button>
				{/each}
			</div>
		{:else if entry.subtype === 'poop'}
			<div class="grid grid-cols-4 gap-3">
				{#each colors as c (c)}
					<button
						aria-label={c}
						class="aspect-square rounded-full border-2 {color === c
							? 'border-baby-ink'
							: 'border-transparent'}"
						style="background-color: {c}"
						onclick={() => (color = c)}
					></button>
				{/each}
			</div>
		{/if}

		<div class="flex gap-3 pt-2">
			<button class="flex-1 rounded-lg bg-baby-blush py-3 font-medium text-baby-ink" onclick={remove}>
				Delete
			</button>
			<button class="flex-1 rounded-lg bg-baby-lavender py-3 font-medium text-baby-ink" onclick={save}>
				Save
			</button>
		</div>
	</div>
</div>
