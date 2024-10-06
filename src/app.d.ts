// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface rssApiResponse {
			date: string | null,
			title: string | null
		}
		interface XmlResult {
			rss: {
				channel: {
					item: XmlItem[];
				};
			};
		}
		interface Platform {
			env: {
				COUNTER: DurableObjectNamespace;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

interface XmlItem {
  title: { _text: string };
  pubDate: { _text?: string };
  description: { _cdata?: string };
}

export {};
