import { error } from '@sveltejs/kit';
import { xml2js } from 'xml-js';
import * as cheerio from 'cheerio';

export async function GET() {
	const url =
		'https://www.goodreads.com/user/updates_rss/182567568?key=o_LMs5a9C_YEm3hcU0G5l9DbjrmsbLb_Cg9o-WpF9vmcNWWv';

	try {
		const res = await fetch(url);
		const xmlText = await res.text();

		// Convertendo XML para JSON
		const result = xml2js(xmlText, { compact: true }) as App.XmlResult;
		const items: App.rssApiResponse[] = result.rss.channel.item
			? result.rss.channel.item.map((item) => {
					// Extrair texto limpo do CDATA usando cheerio
					const descriptionCdata = item.description?._cdata || '';
					const titleCdata = item.title?._cdata || '';

					const $desc = cheerio.load(descriptionCdata);
					const $title = cheerio.load(titleCdata);

					// Remover HTML e manter apenas texto puro
					const descriptionText = $desc.text().replace(/\s+/g, ' ').trim();
					const titleText = $title.text().replace(/\s+/g, ' ').trim();

					// Texto combinado para priorizar descrição
					const combinedText = descriptionText || titleText;

					// Substituir partes específicas do texto HTML por texto limpo
					const finalText = combinedText.replace(/<.*?>/g, ''); // Remove quaisquer tags restantes

					return {
						title: finalText || null,
						date: item.pubDate?._text ? new Date(item.pubDate._text).toISOString() : null
					};
				})
			: [];

		return new Response(JSON.stringify(items.slice(0, 10)), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'max-age=99'
			}
		});
	} catch (err) {
		console.error('Erro ao buscar o feed RSS - books', err);
		throw error(500, 'Erro ao buscar o feed RSS');
	}
}
