<script lang="ts">
	import { page } from '$app/state';

	let isHistory = $derived(page.url.pathname.startsWith('/history'));
</script>

<nav
	class="fixed inset-x-4 z-30 flex h-16 items-stretch overflow-hidden rounded-full bg-baby-card/75 shadow-[0_4px_24px_rgba(63,61,86,0.18)] backdrop-blur-xl"
	style="bottom: max(0.5rem, calc(env(safe-area-inset-bottom) - 0.75rem))"
>
	<div
		class="absolute inset-y-0 w-1/2 rounded-full bg-baby-lavender/60 transition-transform duration-300 ease-out"
		style="transform: translateX({isHistory ? '100%' : '0'})"
	></div>

	<a
		href="/"
		class="relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors {!isHistory
			? 'text-baby-ink'
			: 'text-baby-ink/40'}"
	>
		<svg
			width="20"
			height="20"
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

	<div class="w-20 shrink-0"></div>

	<a
		href="/history"
		class="relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors {isHistory
			? 'text-baby-ink'
			: 'text-baby-ink/40'}"
	>
		<svg
			width="20"
			height="20"
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
