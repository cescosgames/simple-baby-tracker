<script lang="ts">
	import { scale, fade } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import type { DiaperColor } from '$lib/types';

	interface Props {
		onselect: (color: DiaperColor) => void;
		onclose: () => void;
	}

	let { onselect, onclose }: Props = $props();

	const CONFIRM_MS = 200;

	let picked = $state<DiaperColor | null>(null);

	interface Swatch {
		color: DiaperColor;
		class: string;
		label: string;
		urgent?: boolean;
	}

	const urgentSwatches: Swatch[] = [
		{ color: 'black', class: 'bg-neutral-900', label: 'Black', urgent: true },
		{ color: 'red', class: 'bg-red-600', label: 'Red', urgent: true },
		{ color: 'white', class: 'bg-white border border-neutral-300', label: 'White', urgent: true }
	];

	const commonSwatches: Swatch[] = [
		{ color: 'brown', class: 'bg-amber-800', label: 'Brown' },
		{ color: 'yellow', class: 'bg-yellow-400', label: 'Yellow' },
		{ color: 'green', class: 'bg-green-600', label: 'Green' },
		{ color: 'orange', class: 'bg-orange-500', label: 'Orange' }
	];

	function pick(color: DiaperColor) {
		if (picked) return;
		picked = color;
		navigator.vibrate?.(15);
		setTimeout(() => onselect(color), CONFIRM_MS);
	}
</script>

{#snippet swatchButton(swatch: Swatch)}
	<button aria-label={swatch.label} class="flex flex-col items-center gap-2" onclick={() => pick(swatch.color)}>
		<span
			class="h-16 w-16 rounded-full transition-transform duration-150 {swatch.class} {picked ===
			swatch.color
				? 'scale-125 ring-4 ring-baby-ink ring-offset-2 ring-offset-white'
				: picked
					? 'opacity-30'
					: swatch.urgent
						? 'ring-4 ring-offset-2 ring-offset-white ring-red-400 animate-pulse'
						: ''}"
		></span>
		<span class="text-[11px] font-medium text-baby-ink/70">{swatch.label}</span>
	</button>
{/snippet}

<div
	class="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-6 pb-28"
	role="button"
	tabindex="0"
	transition:fade={{ duration: 150 }}
	onclick={onclose}
	onkeydown={(e) => e.key === 'Escape' && onclose()}
>
	<div
		class="w-full max-w-sm rounded-3xl bg-white/90 p-6 shadow-lg"
		role="presentation"
		transition:scale={{ duration: 260, start: 0.85, easing: elasticOut }}
		onclick={(e) => e.stopPropagation()}
	>
		<p class="mb-6 text-center text-lg font-semibold text-baby-ink">What color?</p>

		<div class="mb-6 flex justify-center gap-4">
			{#each urgentSwatches as swatch (swatch.color)}
				{@render swatchButton(swatch)}
			{/each}
		</div>

		<div class="flex justify-center gap-4">
			{#each commonSwatches as swatch (swatch.color)}
				{@render swatchButton(swatch)}
			{/each}
		</div>
	</div>
</div>
