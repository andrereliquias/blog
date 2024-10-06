<script lang="ts">
	import '../app.css';
	import Header from './Header.svelte';
</script>

<div class="flex flex-col mx-auto w-72 md:w-5/12 text-base gap-y-8 text-justify my-10">
	<Header />

	<main>
		<slot />
	</main>

	<!-- <footer>
		<p>this is the footer</p>
	</footer> -->
</div>
