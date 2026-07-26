<script lang="ts">
	import EntryTable from '$lib/components/EntryTable.svelte';
	import LastSideToggle from '$lib/components/LastSideToggle.svelte';
</script>

<main class="relative flex h-dvh w-full flex-col bg-baby-cream">
	<div
		class="px-4 pb-2 text-center"
		style="padding-top: max(1.5rem, env(safe-area-inset-top))"
	>
		<h1 class="text-lg font-semibold text-baby-ink">Baby Tracker</h1>
	</div>

	<EntryTable />
</main>

<LastSideToggle />
