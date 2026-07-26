<script lang="ts">
	import { APP_VERSION } from '$lib/version';
	import { needRefresh, offlineReady, updateServiceWorker } from '$lib/pwa';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();
</script>

<div
	class="fixed inset-0 z-50 flex flex-col justify-end bg-black/50"
	role="button"
	tabindex="0"
	onclick={onclose}
	onkeydown={(e) => e.key === 'Escape' && onclose()}
>
	<div
		class="flex flex-col gap-5 rounded-t-3xl bg-baby-cream p-6 pb-10"
		role="presentation"
		onclick={(e) => e.stopPropagation()}
	>
		<p class="text-lg font-medium text-baby-ink">Settings</p>

		<section class="flex flex-col gap-2">
			<p class="text-xs font-semibold tracking-wide text-baby-ink/50 uppercase">App</p>
			<div class="flex items-center justify-between rounded-xl bg-baby-card/60 px-4 py-3">
				<span class="text-sm text-baby-ink">Version</span>
				<span class="text-sm font-medium text-baby-ink/70">{APP_VERSION}</span>
			</div>

			{#if $needRefresh}
				<button
					class="rounded-xl bg-baby-lavender px-4 py-3 text-left text-sm font-medium text-baby-ink"
					onclick={() => updateServiceWorker(true)}
				>
					Update available — tap to refresh
				</button>
			{:else}
				<div class="rounded-xl bg-baby-card/60 px-4 py-3 text-sm text-baby-ink/70">
					{$offlineReady ? "You're up to date and ready to work offline." : 'Checking for updates…'}
				</div>
			{/if}
		</section>

		<section class="flex flex-col gap-2">
			<p class="text-xs font-semibold tracking-wide text-baby-ink/50 uppercase">Household sync</p>
			<div class="flex flex-col gap-2 rounded-xl bg-baby-card/60 px-4 py-3 opacity-60">
				<p class="text-sm text-baby-ink">Not connected yet</p>
				<p class="text-xs text-baby-ink/60">
					Entries are stored on this device only. Once the household PocketBase server is set up,
					this is where you'll connect to it so everyone's entries stay in sync.
				</p>
				<input
					disabled
					placeholder="Server address (coming soon)"
					class="rounded-lg border border-baby-ink/10 bg-baby-cream px-3 py-2 text-sm text-baby-ink/40"
				/>
			</div>
		</section>

		<button class="rounded-lg bg-baby-lavender py-3 font-medium text-baby-ink" onclick={onclose}>
			Close
		</button>
	</div>
</div>
