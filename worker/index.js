// Worker für onsidehq.de: liefert die statischen Seiten aus und
// beantwortet /api/assistent (KI-Chat). Die Logik steckt in
// functions/api/assistent.js und wird auch von Cloudflare Pages genutzt.
import { onRequestPost } from '../functions/api/assistent.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/assistent') {
      if (request.method === 'POST') return onRequestPost({ request, env });
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
    }
    return env.ASSETS.fetch(request);
  },
};
