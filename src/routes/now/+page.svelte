<script>
	import CustomSection from '$components/CustomSection.svelte';
	import { format } from 'date-fns';

	import { onMount } from 'svelte';

	let tracks = [];
	let movies = [];

	async function fetchData() {
		try {
			const resSongs = await fetch('/api/rss-feed/songs');
			tracks = await resSongs.json();
			tracks = tracks.slice(0, 10);
		} catch (err) {
			console.error('Erro ao buscar músicas:', err);
		}

		try {
			const resMovies = await fetch('/api/rss-feed/movies');
			movies = await resMovies.json();
			movies = movies.slice(0, 10);
		} catch (err) {
			console.error('Erro ao buscar filmes:', err);
		}
	}

	function startPooling() {
		fetchData(); // Buscar dados inicialmente
		// Configurar o intervalo de atualização
		return setInterval(fetchData, 10000);
	}

	onMount(() => {
		const intervalId = startPooling();
		// Limpar o intervalo quando o componente for destruído
		return () => clearInterval(intervalId);
	});
</script>

<CustomSection>
	<div>
		<h1 class="font-bold">now</h1>
		<span>Last update: {format(new Date('2024-09-27T04:24:11.200Z'), 'yyyy-MM-dd hh:mm a')}.</span>

		<p class="mt-2">
			This is my now page. Don't you know what that is? Look at
			<a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer">nownownow</a>.
		</p>
	</div>

	<hr />

	<div>
		<h2 class="font-bold">currently</h2>
		<span>
			<ul class="list-disc list-outside md:list-inside">
				<li>Living in São Carlos, SP, Brazil</li>
				<li>
					Cooking new things at <a
						href="https://www.greatpeople.com.br/"
						target="_blank"
						rel="noopener noreferrer">Great People</a
					>
					+
					<a href="https://gptw.com.br/" target="_blank" rel="noopener noreferrer">GPTW</a> ecosystem
				</li>
				<li>Studying (quite a lot)</li>
				<li>Building this site using SvelteKit + TailwindCSS (without much progress though)</li>
				<li>Trying to find time to go back to the gym and run</li>
				<li>
					[?] <a
						href="https://www.instagram.com/p/C67eF4ZNLCM/?img_index=2"
						target="_blank"
						rel="noopener noreferrer">electric soul</a
					>
				</li>
			</ul>
		</span>
	</div>

	<hr />

	<div>
		<h2 class="font-bold">songs</h2>
		<p class="italic text-sm pb-2">
			data provided by <a href="https://www.last.fm/" target="_blank" rel="noopener noreferrer"
				>last.fm</a
			>
			- special thanks to
			<a href="https://github.com/xiffy" target="_blank" rel="noopener noreferrer">@xiffy</a>
		</p>
		{#if tracks.length > 0}
			<ul class="flex flex-col gap-4 md:gap-0">
				{#each tracks as track}
					<li class="flex justify-between flex-wrap">
						<p>
							{!!track.date
								? format(new Date(track.date).toISOString(), 'yyyy-MM-dd hh:mm a')
								: 'Last track'}
						</p>
						<span>{track.title}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p>Loading...</p>
		{/if}
	</div>

	<hr />

	<div>
		<h2 class="font-bold">movies</h2>
		<p class="italic text-sm pb-2">
			data provided by <a href="https://letterboxd.com/" target="_blank" rel="noopener noreferrer"
				>letterboxd.com</a
			>
		</p>
		{#if movies.length > 0}
			<ul class="flex flex-col gap-4 md:gap-0">
				{#each movies as movie}
					<li class="flex justify-between flex-wrap">
						<p>
							{!!movie.date
								? format(new Date(movie.date).toISOString(), 'yyyy-MM-dd hh:mm a')
								: 'Playing at the moment'}
						</p>
						<span>{movie.title}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p>Loading...</p>
		{/if}
	</div>

	<hr />

	<div>
		<h2 class="font-bold">books</h2>
		<p>Still in progress...</p>
	</div>
</CustomSection>
