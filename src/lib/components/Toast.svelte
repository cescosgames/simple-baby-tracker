<script lang="ts">
	import { toast, dismissToast } from '$lib/stores/toast';
</script>

{#if $toast}
	<div
		class="fixed inset-x-4 bottom-28 z-50 flex items-center justify-between gap-4 rounded-2xl bg-baby-ink px-5 py-4 text-baby-cream shadow-lg"
	>
		<span class="text-base">{$toast.message}</span>
		<button
			class="shrink-0 text-base font-semibold text-baby-sky active:opacity-60"
			onclick={() => {
				$toast?.undo();
				dismissToast();
			}}
		>
			Undo
		</button>
	</div>
{/if}
