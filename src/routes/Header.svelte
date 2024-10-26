<script>
	import underConstructionGif from '$lib/assets/under-construction.gif';
</script>

<header class="w-full">
	<nav>
		<ul class="flex gap-x-5 flex-wrap">
			<li>
				<a href="/" class="link">home</a>
			</li>

			<li>
				<a href="/now">/now</a>
			</li>

			<li>
				<a href="/posts">posts</a>
			</li>

			<li>
				<a href="/lists">lists</a>
			</li>

			<li>
				<a href="/projects">projects</a>
			</li>

			<li>
				<a href="/rss">rss</a>
			</li>
		</ul>
	</nav>

	<div class="mt-5">
		<img src={underConstructionGif} alt="Under construction gif" width="459" height="28" />
	</div>
	<div id="app"></div>
</header>
