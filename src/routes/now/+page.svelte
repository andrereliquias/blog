<script lang="ts">
	import CustomSection from '$components/CustomSection.svelte';
	import { format } from 'date-fns';

	import { onMount } from 'svelte';

	let tracks = $state({
		loading: true,
		data: [] as App.rssApiResponse[],
		error: false
	});
	let movies = $state({
		loading: true,
		data: [] as App.rssApiResponse[],
		error: false
	});
	let books = $state({
		loading: true,
		data: [] as App.rssApiResponse[],
		error: false
	});

	async function fetchData() {
		try {
			const resSongs = await fetch('/api/rss-feed/songs');
			if (resSongs.status !== 200) {
				tracks.error = true;
				return;
			}

			tracks.data = await resSongs.json();
		} catch (err) {
			console.error('Erro ao buscar músicas:', err);
			tracks.error = true;
		} finally {
			tracks.loading = false;
		}

		try {
			const resMovies = await fetch('/api/rss-feed/movies');
			if (resMovies.status !== 200) {
				movies.error = true;
				return;
			}

			movies.data = await resMovies.json();
		} catch (err) {
			console.error('Erro ao buscar filmes:', err);
			movies.error = true;
		} finally {
			movies.loading = false;
		}

		try {
			const resBooks = await fetch('/api/rss-feed/books');
			if (resBooks.status !== 200) {
				books.error = true;
				return;
			}

			books.data = await resBooks.json();
		} catch (err) {
			console.error('Erro ao buscar livros:', err);
			books.error = true;
		} finally {
			books.loading = false;
		}
	}

	function startPooling() {
		fetchData(); // Buscar dados inicialmente
		// Configurar o intervalo de atualização
		return setInterval(fetchData, 100000);
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
		<span>Last update: {format(new Date('2025-04-16T02:59:30.458Z'), 'yyyy-MM-dd hh:mm a')}.</span>

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
				<li>Surviving</li>
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
		{#if tracks.loading}
			<p>Loading...</p>
		{:else if tracks.error}
			<p>Something went wrong</p>
		{:else if tracks.data.length > 0}
			<ul class="flex flex-col gap-4 md:gap-0">
				{#each tracks.data as track}
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
			<p>Nothing to show</p>
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
		{#if movies.loading}
			<p>Loading...</p>
		{:else if movies.error}
			<p>Something went wrong</p>
		{:else if movies.data.length > 0}
			<ul class="flex flex-col gap-4 md:gap-0">
				{#each movies.data as movie}
					<li class="flex justify-between flex-wrap">
						<p>
							{!!movie.date
								? format(new Date(movie.date).toISOString(), 'yyyy-MM-dd hh:mm a')
								: 'Last'}
						</p>
						<span>{movie.title}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p>Nothing to show</p>
		{/if}
	</div>

	<hr />

	<div>
		<h2 class="font-bold">books</h2>
		<p class="italic text-sm pb-2">
			data provided by <a
				href="https://www.goodreads.com/"
				target="_blank"
				rel="noopener noreferrer">goodreads.com</a
			>
		</p>
		{#if books.loading}
			<p>Loading...</p>
		{:else if books.error}
			<p>Something went wrong</p>
		{:else if books.data.length > 0}
			<ul class="flex flex-col gap-4 md:gap-1">
				{#each books.data as book}
					<li class="flex justify-between flex-wrap">
						<p>
							{!!book.date
								? format(new Date(book.date).toISOString(), 'yyyy-MM-dd hh:mm a')
								: 'Last'}
						</p>
						<span>{book.title}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p>Nothing to show</p>
		{/if}
	</div></CustomSection
>
