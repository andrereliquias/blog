<script>
	import { page } from '$app/stores';

	let canGoBack = false;
	if (typeof window !== 'undefined') {
		canGoBack = window.history.length > 1 && $page.url.pathname !== '/';
	}

	function goBack() {
		history.back();
	}

	import { goto, afterNavigate } from '$app/navigation';
	import { base } from '$app/paths';

	let previousPage = base;

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname || previousPage;
	});
</script>

<section class="flex flex-col gap-5">
	{#if canGoBack && previousPage}
		<button on:click={goBack} class="w-fit text-blue-600 hover:text-blue-800 hover:underline"
			>← go back</button
		>
	{/if}

	<slot />
</section>
