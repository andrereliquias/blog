import { error } from '@sveltejs/kit';

export async function POST({ request }) {
	const externalApiUrl = 'http://ec2-3-88-114-124.compute-1.amazonaws.com:8080/classify';

	const { text } = await request.json();

	try {
		const res = await fetch(externalApiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic Zm9vYmFyOjIwMTgxMTkwMTAwMUFCQw==',
			},
			body: JSON.stringify({ texts: [text] })
		});

		const result = await res.text();
		
		return new Response(JSON.stringify(result), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'max-age=99'
			}
		});
	} catch (err) {
		console.error('Erro ao analisar discurso de ódio', err);
		throw error(500, 'Erro ao analisar discurso de ódio');
	}
}
