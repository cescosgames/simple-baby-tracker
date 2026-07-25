<script lang="ts">
	import EntryTable from '$lib/components/EntryTable.svelte';
	import AddControl from '$lib/components/AddControl.svelte';
	import Toast from '$lib/components/Toast.svelte';
</script>

<main class="relative flex h-dvh w-full flex-col bg-baby-cream">
	<div class="flex items-center justify-between px-4 pt-4">
		<h1 class="text-lg font-semibold text-baby-ink">Baby Tracker</h1>
		<a
			href="/history"
			class="rounded-full bg-white/60 px-4 py-2 text-sm font-medium text-baby-ink shadow-sm"
		>
			History
		</a>
	</div>

	<EntryTable />

	<AddControl />
</main>

<Toast />
