import { error } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		// Usar o token cacheado para consultar a API do Bluesky
		const { username } = await request.json();
		const response = await fetch(
			`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${username}&filter=posts_no_replies&includePins=true&limit=100`
		);

		const result = await response.json();

		if (response.status === 400) {
			return new Response(JSON.stringify(result), {
				headers: {
					'Content-Type': 'application/json'
				},
				status: 400
			});
		}

		const posts = result.feed.map((item) => ({
			text: item.post.record.text,
			date: item.post.record.createdAt,
			author: item.post.author.handle
		}));

		posts.sort((a, b) => new Date(b.date) - new Date(a.date));

		const toProcess = posts.map((p) => p.text);

		const res = await fetch('http://ec2-3-88-114-124.compute-1.amazonaws.com:8080/classify', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic Zm9vYmFyOjIwMTgxMTkwMTAwMUFCQw=='
			},
			body: JSON.stringify({ texts: toProcess })
		});

		const resultProcessed = await res.text();
		const resultProcessedParsed = JSON.parse(resultProcessed);

		const final = [];

		const sumOfAll = {
			hateSpeech: 0,
			notHateSpeech: 0
		};

		for (let index = 0; index < posts.length; index++) {
			const post = posts[index];

			const processedPost = resultProcessedParsed.find((p) => p.text === post.text);
			if (processedPost.is_hate_speech) {
				sumOfAll.hateSpeech += 1;
			} else {
				sumOfAll.notHateSpeech += 1;
			}
			const combined = { ...post, ...processedPost };
			final.push(combined);
		}
		const formatDate = (date) => {
			return date.toISOString().split('T')[0];
		};

		const startDate = new Date(posts[posts.length - 1].date);
		const endDate = new Date(posts[0].date);

		const countsByDay = {};
		for (
			let date = new Date(startDate);
			date <= new Date(endDate);
			date.setDate(date.getDate() + 1)
		) {
			const formattedDate = formatDate(new Date(date));
			countsByDay[formattedDate] = { true: 0, false: 0 };
		}

		const formattedEndDate = formatDate(endDate);
		if (!countsByDay[formattedEndDate]) {
			countsByDay[formattedEndDate] = { true: 0, false: 0 };
		}

		// Contar os casos de is_hate_speech para cada dia
		posts.forEach((item) => {
			const day = formatDate(new Date(item.date));
			const processedPost = resultProcessedParsed.find((p) => p.text === item.text);
			if (processedPost.is_hate_speech) {
				countsByDay[day].true += 1;
			} else {
				countsByDay[day].false += 1;
			}
		});

		const transformCounts = (counts) => {
			return Object.entries(counts).map(([date, values]) => ({
				date,
				value: values.true,
				baseline: values.false
			}));
		};
		const transformedData = transformCounts(countsByDay);

		const finalResponse = {
			texts: final,
			graph: {
				sum: sumOfAll,
				byTime: transformedData
			}
		};

		return new Response(JSON.stringify(finalResponse), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'max-age=10'
			}
		});
	} catch (err) {
		console.error('Erro ao analisar discurso de ódio', err);
		throw error(500, 'Erro ao analisar discurso de ódio');
	}
}
