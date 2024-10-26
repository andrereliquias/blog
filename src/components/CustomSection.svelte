<script lang="ts">
	import { page } from '$app/stores';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	let canGoBack = $state(false);
	if (typeof window !== 'undefined') {
		canGoBack = window.history.length > 1 && $page.url.pathname !== '/';
	}

	function goBack() {
		history.back();
	}

	import { afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';

	let previousPage: string = $state(base);

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
	});
</script>

<section class="flex flex-col gap-5">
	{#if canGoBack && previousPage}
		<button onclick={goBack} class="w-fit text-blue-600 hover:text-blue-800 hover:underline"
			>← go back</button
		>
	{/if}

	{@render children?.()}
</section>
