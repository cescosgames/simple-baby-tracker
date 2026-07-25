<script lang="ts">
	import type { DiaperColor } from '$lib/types';

	interface Props {
		onselect: (color: DiaperColor) => void;
		onclose: () => void;
	}

	let { onselect, onclose }: Props = $props();

	const swatches: { color: DiaperColor; class: string; urgent?: boolean }[] = [
		{ color: 'yellow', class: 'bg-yellow-400' },
		{ color: 'green', class: 'bg-green-600' },
		{ color: 'brown', class: 'bg-amber-800' },
		{ color: 'orange', class: 'bg-orange-500' },
		{ color: 'black', class: 'bg-neutral-900' },
		{ color: 'red', class: 'bg-red-600', urgent: true },
		{ color: 'white', class: 'bg-white border border-neutral-300', urgent: true }
	];
</script>

<div
	class="fixed inset-0 z-50 flex flex-col justify-end bg-black/50"
	role="button"
	tabindex="0"
	onclick={onclose}
	onkeydown={(e) => e.key === 'Escape' && onclose()}
>
	<div
		class="rounded-t-3xl bg-baby-cream p-6 pb-10"
		role="presentation"
		onclick={(e) => e.stopPropagation()}
	>
		<p class="mb-5 text-center text-lg font-medium text-baby-ink">Color?</p>
		<div class="grid grid-cols-4 gap-4">
			{#each swatches as swatch (swatch.color)}
				<button
					aria-label={swatch.color}
					class="aspect-square w-full rounded-full {swatch.class} {swatch.urgent
						? 'ring-4 ring-offset-2 ring-red-400 animate-pulse'
						: ''}"
					onclick={() => onselect(swatch.color)}
				></button>
			{/each}
		</div>
	</div>
</div>
