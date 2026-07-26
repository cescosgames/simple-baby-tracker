<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import AddControl from '$lib/components/AddControl.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import SettingsButton from '$lib/components/SettingsButton.svelte';
	import DebugOverlay from '$lib/components/DebugOverlay.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}

<BottomNav />
<AddControl />
<Toast />
<SettingsButton />
<DebugOverlay />
