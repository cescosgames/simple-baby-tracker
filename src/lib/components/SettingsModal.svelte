<script lang="ts">
	import { APP_VERSION } from '$lib/version';
	import { needRefresh, offlineReady, updateServiceWorker } from '$lib/pwa';
	import { exportBackup, importBackup } from '$lib/stores/entries';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let fileInput = $state<HTMLInputElement>();
	let status = $state('');

	function handleExport() {
		const blob = new Blob([exportBackup()], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		const stamp = new Date().toISOString().slice(0, 10);
		a.href = url;
		a.download = `baby-tracker-backup-${stamp}.json`;
		a.click();
		URL.revokeObjectURL(url);
		status = 'Backup file saved.';
	}

	async function handleImportFile(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		try {
			importBackup(await file.text());
			status = 'Backup restored.';
		} catch {
			status = "Couldn't read that file — is it a Baby Tracker backup?";
		}
		(e.target as HTMLInputElement).value = '';
	}
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
			<p class="text-xs font-semibold tracking-wide text-baby-ink/50 uppercase">Backup</p>
			<p class="text-xs text-baby-ink/60">
				Entries live only on this device. Export a backup before reinstalling the app or switching
				phones, just in case.
			</p>
			<div class="flex gap-2">
				<button
					class="flex-1 rounded-xl bg-baby-card/60 px-4 py-3 text-sm font-medium text-baby-ink"
					onclick={handleExport}
				>
					Export backup
				</button>
				<button
					class="flex-1 rounded-xl bg-baby-card/60 px-4 py-3 text-sm font-medium text-baby-ink"
					onclick={() => fileInput?.click()}
				>
					Restore backup
				</button>
				<input
					bind:this={fileInput}
					type="file"
					accept="application/json"
					class="hidden"
					onchange={handleImportFile}
				/>
			</div>
			{#if status}
				<p class="text-xs text-baby-ink/60">{status}</p>
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
