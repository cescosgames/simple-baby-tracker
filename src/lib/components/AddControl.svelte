<script lang="ts">
	import { logFeed, logPee, logPoop, deleteEntry } from '$lib/stores/entries';
	import { showToast } from '$lib/stores/toast';
	import { formatTimeDisplay } from '$lib/date';
	import PoopPicker from './PoopPicker.svelte';
	import type { DiaperColor } from '$lib/types';

	type Zone = 'pee' | 'feed' | 'poop';

	const DWELL_MS = 600;
	const ZONE_THRESHOLD = 56; // px of horizontal drag needed to leave the Feed zone
	const zones: Zone[] = ['pee', 'feed', 'poop'];
	const labels: Record<Zone, string> = { pee: 'PEE', feed: 'FEED', poop: 'POOP' };
	const circumference = 2 * Math.PI * 36;

	let held = $state(false);
	let zone = $state<Zone>('feed');
	let progress = $state(0);
	let pickerOpen = $state(false);

	let startX = 0;
	let dwellRaf: number | null = null;
	let dwellStart = 0;
	let fired = false;

	function cancelDwell() {
		if (dwellRaf !== null) cancelAnimationFrame(dwellRaf);
		dwellRaf = null;
		progress = 0;
	}

	function startDwell() {
		cancelDwell();
		dwellStart = performance.now();
		const step = (t: number) => {
			const elapsed = t - dwellStart;
			progress = Math.min(elapsed / DWELL_MS, 1);
			if (progress >= 1) {
				fire();
			} else {
				dwellRaf = requestAnimationFrame(step);
			}
		};
		dwellRaf = requestAnimationFrame(step);
	}

	function handlePointerDown(e: PointerEvent) {
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		startX = e.clientX;
		zone = 'feed';
		fired = false;
		held = true;
		startDwell();
	}

	function handlePointerMove(e: PointerEvent) {
		if (!held) return;
		const dx = e.clientX - startX;
		const nextZone: Zone = dx < -ZONE_THRESHOLD ? 'pee' : dx > ZONE_THRESHOLD ? 'poop' : 'feed';
		if (nextZone !== zone) {
			zone = nextZone;
			startDwell();
		}
	}

	function handlePointerEnd() {
		if (!fired) cancelDwell();
		held = false;
	}

	function fire() {
		fired = true;
		cancelDwell();
		held = false;
		if (zone === 'poop') {
			pickerOpen = true;
			return;
		}
		if (zone === 'feed') {
			const entry = logFeed('normal');
			showToast(`Feed logged ${formatTimeDisplay(entry.time)}`, () => deleteEntry(entry));
		} else {
			const entry = logPee();
			showToast(`Pee logged ${formatTimeDisplay(entry.time)}`, () => deleteEntry(entry));
		}
	}

	function handlePoopSelect(color: DiaperColor) {
		const entry = logPoop(color);
		showToast(`Poop logged ${formatTimeDisplay(entry.time)}`, () => deleteEntry(entry));
		pickerOpen = false;
	}

	function handlePoopClose() {
		pickerOpen = false;
	}
</script>

{#if held}
	<div class="fixed inset-x-0 bottom-28 z-30 flex justify-center px-6">
		<div class="flex items-center gap-4 rounded-full bg-white/90 px-5 py-5 shadow-lg">
			{#each zones as z (z)}
				<div
					class="relative flex h-20 w-20 items-center justify-center rounded-full text-xs font-bold tracking-widest {zone ===
					z
						? 'bg-baby-ink text-baby-cream'
						: 'text-baby-ink/40'}"
				>
					{#if zone === z && progress > 0}
						<svg class="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
							<circle
								cx="40"
								cy="40"
								r="36"
								fill="none"
								stroke="rgba(255,247,214,0.35)"
								stroke-width="5"
							/>
							<circle
								cx="40"
								cy="40"
								r="36"
								fill="none"
								stroke="#fff7d6"
								stroke-width="5"
								stroke-linecap="round"
								stroke-dasharray={circumference}
								stroke-dashoffset={circumference * (1 - progress)}
							/>
						</svg>
					{/if}
					<span class="relative">{labels[z]}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}

<button
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerEnd}
	onpointercancel={handlePointerEnd}
	aria-label="Hold and drag to log feed, pee, or poop"
	class="fixed bottom-6 left-1/2 z-40 flex h-20 w-20 -translate-x-1/2 touch-none items-center justify-center rounded-full bg-baby-ink text-4xl font-light text-baby-cream shadow-lg select-none active:scale-95"
>
	+
</button>

{#if pickerOpen}
	<PoopPicker onselect={handlePoopSelect} onclose={handlePoopClose} />
{/if}
