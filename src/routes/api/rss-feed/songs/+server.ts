import { error } from '@sveltejs/kit';
import { xml2js } from 'xml-js';

export async function GET() {
  const url = 'https://lfm.xiffy.nl/skynx';

  try {
    const res = await fetch(url);
    const xmlText = await res.text();

    // Convertendo XML para JSON
    const result = xml2js(xmlText, { compact: true, spaces: 4 });
    const items = result.rss.channel.item.map(item => ({
      title: item.title._text || null,
      date: item.pubDate?._text ? new Date(item.pubDate?._text).toISOString() : null
    }));

    return new Response(JSON.stringify(items.slice(0, 10)), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=99'
      }
    });
  } catch (err) {
    console.error('Erro ao buscar o feed RSS - songs', err);
    throw error(500, 'Erro ao buscar o feed RSS');
  }
}
