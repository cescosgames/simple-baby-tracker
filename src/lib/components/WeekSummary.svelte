<script lang="ts">
	import { formatDate } from '$lib/date';
	import type { Entry } from '$lib/types';

	interface Props {
		rows: Entry[];
		barClass: string;
	}

	let { rows, barClass }: Props = $props();

	const days = $derived.by(() => {
		const today = new Date();
		const list: { date: Date; key: string }[] = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(today.getDate() - i);
			list.push({ date: d, key: formatDate(d) });
		}
		return list;
	});

	const counts = $derived.by(() => {
		const buckets = new Map<string, { count: number; urgent: boolean }>();
		for (const day of days) buckets.set(day.key, { count: 0, urgent: false });
		for (const e of rows) {
			const bucket = buckets.get(e.date);
			if (!bucket) continue;
			bucket.count += 1;
			if (e.kind === 'diaper' && e.urgent) bucket.urgent = true;
		}
		return days.map((d) => ({ ...d, ...buckets.get(d.key)! }));
	});

	const max = $derived(Math.max(1, ...counts.map((c) => c.count)));

	function weekdayLabel(d: Date) {
		return d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1);
	}

	function isToday(d: Date) {
		return d.toDateString() === new Date().toDateString();
	}
</script>

<div class="mb-6 rounded-2xl bg-baby-card/60 px-4 py-5 shadow-sm">
	<p class="mb-4 text-xs font-semibold tracking-wide text-baby-ink/50 uppercase">Last 7 days</p>
	<div class="flex items-end justify-between gap-2">
		{#each counts as day (day.key)}
			<div class="flex flex-1 flex-col items-center gap-1.5">
				<span class="text-xs font-medium text-baby-ink/70">{day.count}</span>
				<div class="relative flex h-16 w-full items-end justify-center">
					{#if day.urgent}
						<span
							class="absolute -top-1 h-2.5 w-2.5 rounded-full bg-baby-blush ring-2 ring-white"
						></span>
					{/if}
					<div
						class="w-6 rounded-t-[4px] {barClass}"
						style="height: {Math.max(4, (day.count / max) * 100)}%"
					></div>
				</div>
				<span
					class="text-[11px] {isToday(day.date)
						? 'font-semibold text-baby-ink'
						: 'text-baby-ink/40'}"
				>
					{weekdayLabel(day.date)}
				</span>
			</div>
		{/each}
	</div>
</div>
