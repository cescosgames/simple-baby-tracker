<script lang="ts">
	import { scale, fade } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import { logFeed, logPee, logPoop, deleteEntry } from '$lib/stores/entries';
	import { showToast } from '$lib/stores/toast';
	import { formatTimeDisplay } from '$lib/date';
	import PoopPicker from './PoopPicker.svelte';
	import type { DiaperColor } from '$lib/types';

	type Zone = 'pee' | 'feed' | 'poop';

	const DWELL_MS = 600;
	const CONFIRM_MS = 220; // how long the success pop shows before the popup closes
	const ZONE_THRESHOLD = 56; // px of horizontal drag needed to leave the Feed zone
	const ZONE_HYSTERESIS = 20; // px of slack required to re-enter Feed, so hovering near the boundary doesn't reset the dwell ring
	const zones: Zone[] = ['pee', 'feed', 'poop'];
	const labels: Record<Zone, string> = { pee: 'PEE', feed: 'FEED', poop: 'POOP' };
	const circumference = 2 * Math.PI * 36;

	let held = $state(false);
	let zone = $state<Zone>('feed');
	let progress = $state(0);
	let success = $state(false);
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
		success = false;
		held = true;
		startDwell();
	}

	function handlePointerMove(e: PointerEvent) {
		if (!held) return;
		const dx = e.clientX - startX;
		const nextZone = resolveZone(dx, zone);
		if (nextZone !== zone) {
			zone = nextZone;
			startDwell();
		}
	}

	// Hysteresis prevents a thumb hovering near a zone boundary from repeatedly
	// crossing it and resetting the dwell ring back to 0 every frame.
	function resolveZone(dx: number, current: Zone): Zone {
		if (current === 'feed') {
			if (dx < -ZONE_THRESHOLD) return 'pee';
			if (dx > ZONE_THRESHOLD) return 'poop';
			return 'feed';
		}
		if (current === 'pee') {
			return dx > -(ZONE_THRESHOLD - ZONE_HYSTERESIS) ? 'feed' : 'pee';
		}
		return dx < ZONE_THRESHOLD - ZONE_HYSTERESIS ? 'feed' : 'poop';
	}

	function handlePointerEnd() {
		if (!fired) cancelDwell();
		held = false;
	}

	function fire() {
		fired = true;
		cancelDwell();
		progress = 1;
		success = true;
		navigator.vibrate?.(15);

		setTimeout(() => {
			held = false;
			success = false;
			if (zone === 'poop') {
				pickerOpen = true;
			} else if (zone === 'feed') {
				const entry = logFeed('normal');
				showToast(`Feed logged ${formatTimeDisplay(entry.time)}`, () => deleteEntry(entry));
			} else {
				const entry = logPee();
				showToast(`Pee logged ${formatTimeDisplay(entry.time)}`, () => deleteEntry(entry));
			}
		}, CONFIRM_MS);
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
	<div
		class="fixed inset-x-0 z-30 flex justify-center px-6"
		style="bottom: calc(env(safe-area-inset-bottom) + 8.5rem)"
		in:scale={{ duration: 260, start: 0.7, easing: elasticOut }}
		out:fade={{ duration: 120 }}
	>
		<div class="flex items-center gap-4 rounded-full bg-baby-card/90 px-5 py-5 shadow-lg">
			{#each zones as z (z)}
				<div
					class="relative flex h-20 w-20 items-center justify-center rounded-full text-xs font-bold tracking-widest transition-all duration-150 {zone ===
					z
						? success
							? 'scale-125 bg-baby-mint text-baby-ink'
							: 'scale-110 bg-baby-ink text-baby-cream'
						: 'scale-90 text-baby-ink/40'}"
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
	class="fixed left-1/2 z-40 flex h-20 w-20 -translate-x-1/2 touch-none items-center justify-center rounded-full bg-baby-ink text-4xl font-light text-baby-cream shadow-lg transition-transform duration-150 select-none {held
		? 'scale-110 shadow-2xl'
		: 'scale-100'}"
	style="bottom: calc(env(safe-area-inset-bottom) + 2rem)"
>
	+
</button>

{#if pickerOpen}
	<PoopPicker onselect={handlePoopSelect} onclose={handlePoopClose} />
{/if}
