<script lang="ts">
	import '../app.css';
	import Header from './Header.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let isFullScreen = $state(false);

	onMount(() => {
		const url = $page.url;
		isFullScreen =
			(url.searchParams.get('full') && Number(url.searchParams.get('full')) === 1) || false;
	});
</script>

<!-- <div class="flex flex-col mx-auto w-72 md:w-5/12 text-base gap-y-8 text-justify my-10"> -->
<div class="flex flex-col h-screen">
	<!-- {#if !isFullScreen}
		<Header />
	{/if} -->

	<!-- remover a class do main -->
	<main class="flex items-center justify-center h-screen w-full"> 
		<!-- {@render children?.()} -->
		<div>

			<div class="text-center">
				<!-- <h1>find</h1> -->
				<p>find@minari.xyz</p>
			</div>

		</div>


	</main>

	<!-- <footer>
		<p>this is the footer</p>
	</footer> -->
</div>
