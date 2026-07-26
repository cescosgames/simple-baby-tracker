<script lang="ts">
	import { lastSide, toggleSide } from '$lib/stores/breastSide';
</script>

<button
	onclick={toggleSide}
	class="fixed right-4 z-30 flex items-center gap-2 rounded-full bg-baby-card/90 px-4 py-2 text-sm font-medium text-baby-ink shadow-lg active:scale-95"
	style="bottom: calc(5.5rem + env(safe-area-inset-bottom))"
>
	Last fed with
	<span class="rounded-full bg-baby-sky px-2.5 py-0.5 font-semibold">{$lastSide}</span>
</button>
