<script lang="ts">
	import { onMount } from 'svelte';

	let lines = $state<string[]>(['measuring…']);

	onMount(() => {
		const probe = document.createElement('div');
		probe.style.paddingBottom = 'env(safe-area-inset-bottom)';
		probe.style.paddingTop = 'env(safe-area-inset-top)';
		probe.style.position = 'fixed';
		probe.style.visibility = 'hidden';
		document.body.appendChild(probe);
		const style = getComputedStyle(probe);
		const safeBottom = style.paddingBottom;
		const safeTop = style.paddingTop;
		probe.remove();

		function measure() {
			const nav = document.querySelector('nav');
			const rect = nav?.getBoundingClientRect();
			lines = [
				`innerHeight: ${window.innerHeight}`,
				`visualViewport.h: ${window.visualViewport?.height}`,
				`docEl.clientHeight: ${document.documentElement.clientHeight}`,
				`body.clientHeight: ${document.body.clientHeight}`,
				`safe-area-inset-bottom: ${safeBottom}`,
				`safe-area-inset-top: ${safeTop}`,
				`nav.top: ${rect?.top}`,
				`nav.bottom: ${rect?.bottom}`,
				`nav.height: ${rect?.height}`
			];
		}

		measure();
		window.visualViewport?.addEventListener('resize', measure);
		window.addEventListener('resize', measure);
	});
</script>

<div
	class="fixed top-24 left-2 z-[999] max-w-[90vw] rounded-lg bg-black/80 p-2 font-mono text-[10px] leading-tight whitespace-pre text-lime-300"
>
	{lines.join('\n')}
</div>
