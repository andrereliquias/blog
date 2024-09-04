<script>
	import CustomSection from '$components/CustomSection.svelte';
	// {new Date().toISOString().slice(0, 10)}
	import { format } from 'date-fns';

	import { onMount } from 'svelte';

	let tracks = [];
	let movies = [];

	onMount(async () => {
		try {
			const resSongs = await fetch('/api/rss-feed/songs');
			tracks = await resSongs.json();
			tracks = tracks.slice(0, 10);
		} catch (err) {
			console.error('Erro ao buscar músicas:', err);
		}

		try {
			const resMusics = await fetch('/api/rss-feed/movies');
			movies = await resMusics.json();
			movies = movies.slice(0, 10);
		} catch (err) {
			console.error('Erro ao buscar músicas:', err);
		}
	});
</script>

<CustomSection>
	<div>
		<h1 class="font-bold">now</h1>
		<span>Last update: {format(new Date('2024-09-04T00:25:27.241Z'), 'yyyy-MM-dd hh:mm a')}.</span>

		<p class="mt-2">
			This is my now page. Don't you know what that is? Look at
			<a href="https://nownownow.com/about">nownownow</a>.
		</p>
	</div>

	<hr />

	<div>
		<h2 class="font-bold">currently</h2>
		<span>
			<ul class="list-disc list-outside md:list-inside">
				<li>Living in São Carlos, SP, Brazil</li>
				<li>
					Cooking things at <a href="https://www.greatpeople.com.br/">Great People</a> +
					<a href="https://gptw.com.br/">GPTW</a> ecosystem
				</li>
				<li>Building this using Sveltekit + TailwindCSS</li>
				<li>Trying to work out at least 4 days a week</li>
				<li>Running every week</li>
				<li>Studying</li>
				<li>Figuring out a reason to [?]</li>
			</ul>
		</span>
	</div>

	<hr />

	<div>
		<h2 class="font-bold">songs</h2>
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
