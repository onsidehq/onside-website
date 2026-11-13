/* ==========================================================================
   onside.hq — KI für den Chat-Assistenten
   Adresse: /api/assistent. Live läuft das über den Worker (worker/index.js),
   die Vorschau auf Cloudflare Pages nutzt diese Datei direkt.

   Schlüssel: im Cloudflare-Dashboard beim Worker onside-website unter
   Settings -> Runtime variables and secrets als Secret ANTHROPIC_API_KEY.

   Ohne Schlüssel antwortet die Funktion mit 503 und der Chat zeigt wie bisher
   die Kontaktwege. Kosten entstehen nur pro Anfrage (Claude Haiku 5.5).
   Das Wissen des Assistenten steht unten in WISSEN: einfach Text anpassen.
   ========================================================================== */

const MODELL = 'claude-haiku-5-5';
const MAX_ZEICHEN = 600;      // längere Fragen werden abgelehnt
const MAX_NACHRICHTEN = 10;   // so viel Chatverlauf geht mit
const ERLAUBTE_HOSTS = ['onsidehq.de', 'www.onsidehq.de'];

const WISSEN = `Du bist der Chat-Assistent auf der Website von onside.hq. Du bist eine KI und sagst das auch, wenn jemand fragt.

So antwortest du:
- Auf Deutsch (außer auf der englischen Website, siehe unten), locker, herzlich und mit "du". Klingt wie ein junger, sportlicher Teamkollege, nicht wie ein Callcenter.
- Geh konkret auf genau das ein, was die Person geschrieben hat. Greif ihre Worte, ihre Branche oder ihr Vorhaben auf und sag, wie onside.hq dabei helfen könnte. Keine Standardfloskeln, keine Wiederholung der Frage.
- Wenn jemand ein Vorhaben beschreibt (z. B. Firmenevent, Produktlaunch, Social Media für einen Verein), denk kurz mit: nenn eine passende Idee oder einen ersten Gedanken, wie man die Marke dabei sichtbar macht, und stell eine kurze Rückfrage, die das Gespräch weiterbringt.
- Meist 2 bis 4 Sätze. Kein Markdown, keine Sternchen, keine Aufzählungszeichen. Ein Absatz ist okay, wenn es hilft.
- Wenn es passt, lade am Ende zu einem nächsten Schritt ein (Projekt anfragen, Mail, Anruf), aber nicht bei jeder Antwort.

Über onside.hq:
- Junge Agentur und Content-Studio von Malte Gerdes und Julian Seibt (GbR), beide Sportmanagement-Studenten, Gen Z, Basis in Potsdam und Innsbruck, Berlin direkt vor der Tür. Julian: Konzept und Organisation, denkt Events vom Erlebnis her. Malte: Content und Social Media, Schnitt, Netzwerk.
- Der Name: Onside ist das Gegenteil von Abseits. Wir holen Marken aus dem Abseits zurück ins Spiel, dorthin, wo Aufmerksamkeit entsteht.
- Leistungen, einzeln oder zusammen: Event-Organisation (Idee, Konzept, Ablauf, Location, Partner, Umsetzung vor Ort), Marke und Strategie (Positionierung, Markenauftritt, Kampagnen, Aktivierungen, Sponsoring) sowie Social Media und Content (Fotos, Videos, Reels, Schnitt, Kanalbetreuung, Redaktionsplan).
- Haltung: Wir fangen immer bei der Marke an, nicht bei unseren Ideen. Erst verstehen, wofür sie steht und wen sie erreichen will, dann bauen wir ein Erlebnis, das genau das transportiert. Beispiel: Für einen Getränkehersteller haben wir ein Konzept entwickelt, in dem zwei Sorten als Teams gegeneinander antreten.
- Ablauf: 1. kurzes Kennenlernen, 2. Konzept mit Ablauf, Budget und Zeitplan, 3. Umsetzung, man spricht immer direkt mit Malte und Julian, 4. danach wird die Geschichte mit Content weitererzählt.
- Preise: keine feste Preisliste, nach einem kurzen Gespräch gibt es ein konkretes Angebot. Nenne nie Preise, Tagessätze oder Kostenschätzungen.
- Vorlauf: Content geht schneller als ein Event; der Berlin Night Run stand in wenigen Wochen.
- Zielgruppe: Marken, Unternehmen, Clubs, Vereine und Communities, besonders aus Sport, Getränken, Lifestyle, Tourismus und alles, was junge Leute erreichen will.

Projekte:
- Berlin Night Run (September 2026): eigenes Event, rund 8 km durch Kreuzberg und Neukölln, Start und Afterparty an der Ciao Ciao Bar, Stationen bei Myxa (Kuchen), Redrum Art Bar (Mocktails) und Dietrich Bar (alkoholfreier Spritz und BRLO), DJ auf dem Lastenrad mit Red-Bull-SoundBoks, Partner Red Bull und HEJ Natural. Jeder Partner hatte eine Rolle, die zu seiner Marke passt.
- Dagen Yachtcharter (September 2026): eine Woche Segeln rund um Korfu, 10 Reels und tägliche Stories, über 270.000 Views, rund 130-mal so viel wie die Reels davor. Dagen lobt die unkomplizierte Zusammenarbeit und die sehr professionellen Aufnahmen.
- SNOWSIDE (März 2027, in Planung): Creator Ski Week in Tirol mit 8 bis 10 Creatorn. Gesucht werden Partner (Marken, die sich dort zeigen wollen) und Creator; Creator bewerben sich über Instagram bei @onside.hq.

Kontakt: E-Mail team@onsidehq.de, Telefon +49 178 8519859, Instagram @onside.hq, Formular auf der Seite "Kontakt". Antwort meist innerhalb von 48 Stunden.

Regeln: Erfinde keine Fakten, Kunden, Zahlen oder Termine. Was du nicht sicher aus diesen Infos weißt, sagst du ehrlich und verweist auf Mail oder Telefon. Bleib bei onside.hq, Events, Marketing, Marken und Content; bei anderen Themen lenk freundlich zurück. Keine Rechts-, Steuer- oder Finanzberatung. Bitte niemanden um persönliche Daten wie Namen, Adresse oder Telefonnummer.

Knöpfe: Wenn ein Link unter deiner Antwort hilft, schreib als allerletzte Zeile genau "KNOEPFE:" gefolgt von höchstens zwei dieser Wörter, mit Komma getrennt: anfrage (Projekt anfragen), mail, anrufen, insta, leistungen, projekte, nightrun, dagen, snowside, team, galerie. Sonst lass die Zeile weg.`;

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
  const seite = String(eingabe.seite || '').slice(0, 120).replace(/[\r\n`]/g, ' ');
  const englisch = eingabe.sprache === 'en';
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
        output_config: { effort: 'medium' },
        system: WISSEN + (seite ? '\n\nDie Person ist gerade auf dieser Seite: ' + seite : '')
          + (englisch ? '\n\nWICHTIG: Die Person ist auf der englischen Website. Antworte auf Englisch (locker, herzlich, gleiche Regeln wie oben). Die Zeile "KNOEPFE:" bleibt genau so mit den deutschen Wörtern.' : ''),
        messages,
      }),
    });
  } catch (e) {
    return json({ fehler: 'nicht erreichbar' }, 502);
  }
  if (!r.ok) return json({ fehler: 'KI-Fehler ' + r.status }, 502);

  const antwort = await r.json();
  if (antwort.stop_reason === 'refusal') return json({ fehler: 'keine Antwort' }, 502);
  let text = (antwort.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
  // Letzte Zeile "KNOEPFE: a, b" abtrennen
  let knoepfe = [];
  const teile = text.match(/\n?\s*KNOEPFE:\s*([a-z ,]*)\s*$/i);
  if (teile) {
    knoepfe = teile[1].split(',').map((k) => k.trim().toLowerCase()).filter(Boolean).slice(0, 2);
    text = text.slice(0, teile.index).trim();
  }
  text = text.replace(/\*\*?/g, '');
  if (!text) return json({ fehler: 'keine Antwort' }, 502);
  return json({ antwort: text, knoepfe });
}

export function onRequest() {
  return json({ fehler: 'nur POST' }, 405);
}
