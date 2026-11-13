/* ==========================================================================
   onside.hq — KI für den Chat-Assistenten (Cloudflare Pages Function)
   Adresse: /api/assistent  (wird von Cloudflare Pages automatisch aus diesem
   Ordner gebaut, kein eigener Worker nötig).

   Einrichtung (einmalig, im Cloudflare-Dashboard):
   Workers & Pages -> Projekt onside-website -> Settings -> Variables and Secrets
   -> "Add" -> Typ "Secret", Name ANTHROPIC_API_KEY, Wert = API-Key aus der
   Anthropic Console (console.anthropic.com). Danach einmal neu deployen.

   Ohne Schlüssel antwortet die Funktion mit 503 und der Chat zeigt wie bisher
   die Kontaktwege. Kosten entstehen nur pro Anfrage (Claude Haiku 5.5).
   Das Wissen des Assistenten steht unten in WISSEN: einfach Text anpassen.
   ========================================================================== */

const MODELL = 'claude-haiku-5-5';
const MAX_ZEICHEN = 600;      // längere Fragen werden abgelehnt
const MAX_NACHRICHTEN = 8;    // so viel Chatverlauf geht mit
const ERLAUBTE_HOSTS = ['onsidehq.de', 'www.onsidehq.de'];

const WISSEN = `Du bist der Chat-Assistent auf der Website von onside.hq. Antworte immer auf Deutsch, locker und freundlich, und sprich die Leute mit "du" an. Antworte kurz: höchstens drei Sätze, ohne Aufzählungen, ohne Markdown.

Über onside.hq:
- onside.hq ist eine junge Agentur von Malte und Julian (GbR) mit Basis in Potsdam und Innsbruck, Berlin liegt direkt vor der Tür. Sie kommen aus dem Sport.
- Leistungen, einzeln oder zusammen: Event-Organisation (Idee, Konzept, Ablauf, Location, Partner, Umsetzung vor Ort), Marketing und Markenstrategie (Positionierung, Markenauftritt, Kampagnen, Aktivierungen, Sponsoring) sowie Social Media und Content (Fotos, Videos, Reels, Schnitt, Kanalbetreuung).
- Haltung: Wir denken uns in jede Marke und ihre Ziele rein. Events und Content sollen die Identität der Marke transportieren, nicht nur gut aussehen. Beispiel: Für einen Getränkehersteller haben wir ein Konzept entwickelt, in dem zwei Sorten als Teams gegeneinander antreten.
- Ablauf: 1. kurzes Kennenlernen, 2. Konzept mit Ablauf, Budget und Zeitplan, 3. Umsetzung, man spricht immer direkt mit Malte und Julian, 4. danach wird die Geschichte mit Content weitererzählt.
- Preise: keine feste Preisliste, nach einem kurzen Gespräch gibt es ein konkretes Angebot. Nenne nie Preise oder Zahlen zu Kosten.
- Vorlauf: Content geht schneller als ein Event; der Berlin Night Run stand in wenigen Wochen.

Projekte:
- Berlin Night Run (September 2026): eigenes Event, rund 8 km durch Kreuzberg und Neukölln, Start und Afterparty an der Ciao Ciao Bar, Stopps bei Myxa, Redrum Art Bar und Dietrich Bar, DJ auf dem Lastenrad, Partner Red Bull und HEJ Natural.
- Dagen Yachtcharter (September 2026): eine Woche Segeln rund um Korfu, 10 Reels und tägliche Stories, über 270.000 Views, rund 130-mal so viel wie die Reels davor.
- SNOWSIDE (März 2027, in Planung): Creator Ski Week in Tirol mit 8 bis 10 Creatorn. Gesucht werden Partner und Creator; Creator bewerben sich über Instagram (@onside.hq).

Kontakt: E-Mail team@onsidehq.de, Telefon +49 178 8519859, Instagram @onside.hq, Kontaktformular auf der Seite "Kontakt". Antwort meist innerhalb von 48 Stunden.

Regeln: Erfinde nichts. Wenn du etwas nicht sicher aus diesen Infos weißt, sag das ehrlich und verweise auf die Mail oder das Telefon. Beantworte nur Fragen rund um onside.hq, Events, Marketing und Content; bei anderen Themen lenke freundlich zurück. Gib keine Rechts-, Steuer- oder Finanzberatung. Bitte niemanden um persönliche Daten.`;

const json = (daten, status = 200) =>
  new Response(JSON.stringify(daten), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json({ fehler: 'nicht eingerichtet' }, 503);

  // Nur Anfragen von der eigenen Website (Vorschau-Adressen von Pages und Workers erlaubt)
  const herkunft = request.headers.get('Origin') || '';
  let host = '';
  try { host = new URL(herkunft).hostname; } catch (e) { /* leer */ }
  if (!ERLAUBTE_HOSTS.includes(host) && !host.endsWith('.pages.dev') && !host.endsWith('.workers.dev')) return json({ fehler: 'nicht erlaubt' }, 403);

  let eingabe;
  try { eingabe = await request.json(); } catch (e) { return json({ fehler: 'ungültig' }, 400); }
  const frage = String(eingabe.frage || '').trim();
  if (!frage || frage.length > MAX_ZEICHEN) return json({ fehler: 'ungültig' }, 400);

  // Verlauf in abwechselnde Nachrichten umwandeln, erste muss vom Nutzer sein
  const verlauf = Array.isArray(eingabe.verlauf) ? eingabe.verlauf.slice(-MAX_NACHRICHTEN) : [];
  const messages = [];
  for (const v of verlauf) {
    const role = v && v.wer === 'du' ? 'user' : 'assistant';
    const text = String((v && v.text) || '').slice(0, MAX_ZEICHEN).trim();
    if (!text) continue;
    if (!messages.length && role !== 'user') continue;
    const letzte = messages[messages.length - 1];
    if (letzte && letzte.role === role) letzte.content += '\n' + text;
    else messages.push({ role, content: text });
  }
  // Die aktuelle Frage steht schon als letzte Nutzer-Nachricht im Verlauf; falls nicht, anhängen
  const letzte = messages[messages.length - 1];
  if (!letzte || letzte.role !== 'user') messages.push({ role: 'user', content: frage });

  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2026-10-21',
      },
      body: JSON.stringify({
        model: MODELL,
        max_tokens: 1024,
        output_config: { effort: 'low' },
        system: WISSEN,
        messages,
      }),
    });
  } catch (e) {
    return json({ fehler: 'nicht erreichbar' }, 502);
  }
  if (!r.ok) return json({ fehler: 'KI-Fehler ' + r.status }, 502);

  const antwort = await r.json();
  if (antwort.stop_reason === 'refusal') return json({ fehler: 'keine Antwort' }, 502);
  const text = (antwort.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
  if (!text) return json({ fehler: 'keine Antwort' }, 502);
  return json({ antwort: text });
}

export function onRequest() {
  return json({ fehler: 'nur POST' }, 405);
}
