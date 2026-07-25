<script lang="ts">
	import { page } from '$app/state';

	let isHistory = $derived(page.url.pathname.startsWith('/history'));
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-30 flex h-20 items-center justify-around bg-white/90 px-10 pt-2 shadow-[0_-2px_12px_rgba(63,61,86,0.08)]"
	style="padding-bottom: max(0.5rem, env(safe-area-inset-bottom))"
>
	<a
		href="/"
		class="flex flex-col items-center gap-1 rounded-2xl px-5 py-1.5 text-xs font-medium transition-colors {!isHistory
			? 'bg-baby-lavender/60 text-baby-ink'
			: 'text-baby-ink/40'}"
	>
		<svg
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M3 10.5 12 3l9 7.5" />
			<path d="M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5" />
		</svg>
		Home
	</a>

	<div class="w-16 shrink-0"></div>

	<a
		href="/history"
		class="flex flex-col items-center gap-1 rounded-2xl px-5 py-1.5 text-xs font-medium transition-colors {isHistory
			? 'bg-baby-lavender/60 text-baby-ink'
			: 'text-baby-ink/40'}"
	>
		<svg
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<path d="M5 20V13M12 20V7M19 20V11" />
		</svg>
		History
	</a>
</nav>
