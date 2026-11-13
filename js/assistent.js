/* ==========================================================================
   onside.hq — Assistent unten rechts
   Ein kleiner Chat, der die häufigsten Fragen beantwortet und bei allem
   anderen auf Mail, Telefon und Instagram verweist.

   So funktioniert es: Getippte Fragen beantwortet die KI (siehe unten).
   Die festen Antworten in THEMEN erscheinen, wenn jemand einen Vorschlag
   antippt oder die KI gerade nicht erreichbar ist. Passt dann auch kein
   Thema, kommt die "Weiß ich nicht"-Antwort mit den Kontaktwegen.

   Antworten ändern: einfach den Text bei "antwort" anpassen.
   Neues Thema: einen Block in THEMEN kopieren, Stichwörter und Antwort ändern.

   Echte KI: KI_ADRESSE zeigt auf den Worker (worker/index.js ruft
   functions/api/assistent.js auf, Claude Haiku 5.5). Dort steht auch das
   Wissen der KI.
   ========================================================================== */
(() => {
  const KI_ADRESSE = '/api/assistent';   // leer lassen = keine KI, nur feste Antworten

  const KONTAKT = {
    mail: 'team@onsidehq.de',
    telefon: '+49 178 8519859',
    telefonLink: 'tel:+491788519859',
    instagram: 'https://instagram.com/onside.hq',
  };

  // Knöpfe, die unter einer Antwort erscheinen können
  const KNOEPFE = {
    mail: { text: 'Mail schreiben', link: 'mailto:' + KONTAKT.mail },
    anrufen: { text: 'Anrufen', link: KONTAKT.telefonLink },
    insta: { text: 'Instagram', link: KONTAKT.instagram, extern: true },
    anfrage: { text: 'Projekt anfragen', link: 'kontakt.html' },
    leistungen: { text: 'Leistungen ansehen', link: 'leistungen.html' },
    projekte: { text: 'Projekte ansehen', link: 'projekte.html' },
    nightrun: { text: 'Zum Night Run', link: 'berlin-night-run.html' },
    dagen: { text: 'Zu Dagen', link: 'dagen-yachtcharter.html' },
    snowside: { text: 'Zu SNOWSIDE', link: 'snowside.html' },
    team: { text: 'Wer wir sind', link: 'ueber-uns.html' },
    galerie: { text: 'Zur Galerie', link: 'galerie.html' },
  };

  const THEMEN = [
    {
      woerter: ['hallo', 'hi', 'hey', 'servus', 'moin', 'guten tag', 'gruss', 'griass'],
      antwort: 'Hey! Schön, dass du da bist. Frag mich einfach, was du über onside.hq wissen willst, oder tipp eins der Themen unten an.',
      vorschlaege: true,
    },
    {
      woerter: ['passt zu', 'zu unserer marke', 'zu uns passt', 'markenidentitat', 'identitat', 'unsere marke', 'markenwerte', 'werte', 'reindenken'],
      antwort: 'Wir fangen immer bei deiner Marke an, nicht bei unseren Ideen: Wofür steht sie, wen willst du erreichen, was soll hängen bleiben? Daraus bauen wir ein Konzept, in dem ihre Identität sichtbar und erlebbar wird, im Ablauf, bei Partnern und im Content.',
      knoepfe: ['anfrage', 'leistungen'],
    },
    {
      woerter: ['kost', 'kostet', 'preis', 'budget', 'teuer', 'euro', '€', 'geld', 'bezahl', 'honorar', 'tagessatz'],
      antwort: 'Eine feste Preisliste gibt es bei uns nicht, weil ein Content-Paket etwas anderes ist als ein Event mit Partnern und Afterparty. Nach einem kurzen Gespräch bekommst du ein konkretes Angebot. Wenn du dein Budget schon kennst, sag es uns gleich, dann wissen wir, was drin ist.',
      knoepfe: ['anfrage', 'anrufen'],
    },
    {
      woerter: ['vorlauf', 'wie lange', 'wie schnell', 'zeitplan', 'kurzfristig', 'frist', 'wochen', 'monate', 'dauer'],
      antwort: 'Kommt aufs Projekt an: Content für deine Kanäle geht schneller als ein Event mit Location, Partnern und Genehmigungen. Den Berlin Night Run haben wir in wenigen Wochen auf die Beine gestellt. Je früher du dich meldest, desto mehr Spielraum bleibt.',
      knoepfe: ['anfrage'],
    },
    {
      woerter: ['ablauf', 'zusammenarbeit', 'prozess', 'schritte', 'wie lauft', 'wie geht', 'vorgehen', 'erstgesprach', 'kennenlernen'],
      antwort: 'In vier Schritten: 1. Kennenlernen in einem kurzen Gespräch. 2. Wir kommen mit einem Konzept samt Ablauf, Budget und Zeitplan zurück. 3. Wir setzen um und du sprichst dabei immer direkt mit uns. 4. Danach erzählen wir die Geschichte mit Content weiter.',
      knoepfe: ['anfrage', 'leistungen'],
    },
    {
      woerter: ['leistung', 'was macht ihr', 'was bietet', 'angebot', 'service', 'agentur', 'was konnt ihr'],
      antwort: 'Wir machen drei Dinge, einzeln oder zusammen: Event-Organisation (Idee, Planung, Location, Partner, Umsetzung vor Ort), Marketing & Markenstrategie (Positionierung, Kampagnen, Sponsoring, Kommunikation für die Gen Z) und Social Media (Foto, Video, Reels, Schnitt, Kanalbetreuung).',
      knoepfe: ['leistungen', 'anfrage'],
    },
    {
      woerter: ['event', 'veranstalt', 'party', 'launch', 'pop-up', 'popup', 'festival', 'community-abend', 'location', 'firmenfeier'],
      antwort: 'Events sind unser Kern: Wir entwickeln das Konzept, planen Ablauf und Location, holen passende Partner dazu und sind vor Ort dabei. Wir kommen aus dem Sport, machen aber genauso Launch-Events, Pop-ups, Partys oder Community-Abende, am liebsten Formate zum Mitmachen.',
      knoepfe: ['anfrage', 'nightrun'],
    },
    {
      woerter: ['social', 'instagram', 'tiktok', 'content', 'reel', 'video', 'foto', 'film', 'schnitt', 'kanal', 'posts', 'youtube'],
      antwort: 'Wir produzieren Fotos, Videos und Reels, schneiden selbst und betreuen auf Wunsch deine Kanäle. Ein Beispiel: Für Dagen Yachtcharter haben wir auf Korfu Reels gedreht, die zusammen über 270.000 Views geholt haben.',
      knoepfe: ['dagen', 'anfrage'],
    },
    {
      woerter: ['marke', 'branding', 'strategie', 'positionierung', 'kampagne', 'marketing', 'zielgruppe', 'gen z', 'genz'],
      antwort: 'Bei Marketing & Markenstrategie geht es darum, wofür deine Marke steht und wie sie bei einer jungen Zielgruppe ankommt: Positionierung, Markenauftritt, Kampagnen- und Aktivierungskonzepte, Partnerschaften und Kommunikation für die Gen Z.',
      knoepfe: ['leistungen', 'anfrage'],
    },
    {
      woerter: ['einzeln', 'buchen', 'nur eine', 'nur social', 'nur content', 'nur event', 'kombinier'],
      antwort: 'Klar, das geht. Event, Markenstrategie und Social Media gibt es einzeln oder zusammen. Am meisten bringt es, wenn alles zusammenspielt, aber das entscheidest du.',
      knoepfe: ['anfrage'],
    },
    {
      woerter: ['sponsor', 'partner'],
      antwort: 'Partnermanagement gehört bei uns dazu: Wir suchen passende Partner, sprechen sie an und kümmern uns um die Absprachen. Beim Night Run waren zum Beispiel Red Bull, HEJ Natural und mehrere Berliner Bars dabei. Du willst selbst Partner bei SNOWSIDE werden? Dann schreib uns kurz.',
      knoepfe: ['mail', 'snowside'],
    },
    {
      woerter: ['wo seid', 'standort', 'sitz', 'potsdam', 'innsbruck', 'berlin', 'osterreich', 'deutschland', 'tirol', 'buro', 'adresse', 'ort'],
      antwort: 'Unsere Basis sind Potsdam und Innsbruck, Berlin liegt direkt vor der Tür. Für das richtige Projekt kommen wir aber auch woandershin.',
      knoepfe: ['team'],
    },
    {
      woerter: ['projekt', 'referenz', 'beispiel', 'bisher', 'kunden', 'portfolio', 'arbeiten'],
      antwort: 'Bisher: den Berlin Night Run, unser eigenes Event mit DJ, Afterparty und Partnern, und Reels für Dagen Yachtcharter auf Korfu. Gerade planen wir SNOWSIDE, eine Creator Ski Week in Tirol im März 2027.',
      knoepfe: ['projekte', 'galerie'],
    },
    {
      woerter: ['night run', 'nightrun', 'lauf', 'laufen', 'red bull', 'redbull', 'hej'],
      antwort: 'Der Berlin Night Run war unser erstes eigenes Event: ein Lauf durch die Berliner Nacht mit DJ auf dem Lastenrad, Verpflegung, Stopps an Bars und Afterparty. Mit dabei waren Red Bull und HEJ Natural.',
      knoepfe: ['nightrun'],
    },
    {
      woerter: ['dagen', 'yacht', 'segel', 'boot', 'korfu', 'griechenland'],
      antwort: 'Für Dagen Yachtcharter waren wir im September 2026 eine Woche auf dem Segelboot rund um Korfu und haben Reels und Stories produziert. Ergebnis: über 270.000 Views, rund 130-mal so viel wie die Reels davor.',
      knoepfe: ['dagen'],
    },
    {
      woerter: ['snowside', 'ski', 'snowboard', 'schnee', 'winter', 'chalet', 'marz 2027', 'ski week'],
      antwort: 'SNOWSIDE ist unsere Creator Ski Week: eine Woche im März 2027 in Tirol mit 8–10 ausgewählten Creatorn, einem Chalet und viel Abenteuer. Wir suchen gerade Partner und Creator.',
      knoepfe: ['snowside'],
    },
    {
      woerter: ['creator', 'influencer', 'bewerb', 'mitfahren', 'mitmachen', 'teilnehmen', 'dabei sein'],
      antwort: 'Du willst als Creator mit nach Tirol? Das passt, wenn du zwischen 20 und 27 bist, aus Deutschland, Österreich oder der Schweiz kommst, auf Action, Travel oder Sidequests stehst, selbst filmst und sicher Ski fährst. Beworben wird über Instagram: Kommentier unseren SNOWSIDE-Post und schreib uns eine DM.',
      knoepfe: ['insta', 'snowside'],
    },
    {
      woerter: ['wer seid', 'team', 'grunder', 'malte', 'julian', 'uber euch', 'wer steckt'],
      antwort: 'Hinter onside.hq stecken Malte und Julian. Wir kommen aus dem Sport, organisieren Events und produzieren den Content dazu selbst. Bei uns sprichst du immer direkt mit uns beiden.',
      knoepfe: ['team'],
    },
    {
      woerter: ['kontakt', 'mail', 'e-mail', 'email', 'telefon', 'anruf', 'nummer', 'erreich', 'whatsapp', 'sprechen', 'termin', 'call'],
      antwort: 'Am schnellsten erreichst du uns per Mail an ' + KONTAKT.mail + ' oder telefonisch unter ' + KONTAKT.telefon + '. Auf Instagram findest du uns unter @onside.hq.',
      knoepfe: ['mail', 'anrufen', 'insta'],
    },
    {
      woerter: ['antwort', 'antwortet', 'meldet ihr', 'ruckmeldung', 'reaktion'],
      antwort: 'Wir melden uns innerhalb von 48 Stunden, meistens schneller.',
      knoepfe: ['anfrage', 'mail'],
    },
    {
      woerter: ['job', 'praktikum', 'praktikant', 'mitarbeit', 'werkstudent', 'freelance', 'freelancer', 'fotograf', 'videograf'],
      antwort: 'Cool, dass du Lust hast! Schick uns eine kurze Mail mit ein paar Sätzen zu dir und Links zu deinen Arbeiten.',
      knoepfe: ['mail'],
    },
    {
      woerter: ['danke', 'merci', 'super', 'top', 'perfekt', 'cool'],
      antwort: 'Gern! Wenn noch was ist, frag einfach.',
    },
  ];

  const WEISS_NICHT = 'Das kann ich dir hier leider nicht sicher beantworten. Schreib uns am besten kurz oder ruf an, dann klären wir das direkt.';
  const BEGRUESSUNG = 'Hey! Ich bin der digitale Assistent von onside.hq, also kein Mensch: Manche Antworten schreibt eine KI. Frag mich alles zu Events, Content, unseren Projekten oder SNOWSIDE. Bitte gib hier keine persönlichen Daten ein.';
  const VORSCHLAEGE = ['Was macht ihr?', 'Was kostet ein Projekt?', 'Wie läuft das ab?', 'SNOWSIDE', 'Kontakt'];

  /* ---------------- ab hier Technik ---------------- */

  const norm = (s) => s.toLowerCase()
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
    .replace(/[^\w€\s-]/g, ' ').replace(/\s+/g, ' ').trim();

  function finde(frage) {
    const f = ' ' + norm(frage) + ' ';
    let best = null;
    let bestScore = 0;
    THEMEN.forEach((t) => {
      let score = 0;
      t.woerter.forEach((w) => {
        const nw = norm(w);
        if (!nw) return;
        // kurze Wörter nur als ganzes Wort zählen (sonst passt "hi" in "nicht")
        const hit = nw.length <= 3 ? new RegExp('(^|\\s)' + nw + '(\\s|$)').test(f) : f.includes(nw);
        if (hit) score += nw.length > 5 ? 2 : 1;
      });
      if (score > bestScore) { best = t; bestScore = score; }
    });
    return best;
  }

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  };

  // Oberfläche bauen
  const wrap = el('div', 'assistent');
  const toggle = el('button', 'assistent__toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'assistentPanel');
  toggle.setAttribute('aria-label', 'Du hast noch Fragen? Chat öffnen');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" class="assistent__icon-chat"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" fill="currentColor"/></svg>'
    + '<svg viewBox="0 0 24 24" aria-hidden="true" class="assistent__icon-close"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'
    + '<span class="assistent__toggle-text">Du hast noch Fragen?</span>';

  const panel = el('section', 'assistent__panel');
  panel.id = 'assistentPanel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Assistent von onside.hq');

  const head = el('header', 'assistent__head');
  const title = el('div', 'assistent__title');
  title.append(el('strong', '', 'onside Assistent'), el('span', '', 'KI-gestützt · alles Weitere direkt mit uns'));
  const close = el('button', 'assistent__close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Chat schließen');
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  head.append(title, close);

  const log = el('div', 'assistent__log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');

  const form = el('form', 'assistent__form');
  const input = el('textarea', 'assistent__input');
  input.rows = 1;
  input.placeholder = 'Deine Frage …';
  input.setAttribute('aria-label', 'Deine Frage');
  input.maxLength = 500;
  input.autocomplete = 'off';
  // Eingabefeld wächst mit dem Text (bis etwa 6 Zeilen, danach scrollt es)
  const passeHoeheAn = () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 150) + 'px';
  };
  input.addEventListener('input', passeHoeheAn);
  // Enter schickt ab, Shift+Enter macht eine neue Zeile
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });
  const send = el('button', 'assistent__send');
  send.type = 'submit';
  send.setAttribute('aria-label', 'Senden');
  send.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  form.append(input, send);

  const foot = el('p', 'assistent__foot');
  foot.innerHTML = 'Lieber direkt? <a href="mailto:' + KONTAKT.mail + '">' + KONTAKT.mail + '</a> · <a href="' + KONTAKT.telefonLink + '">' + KONTAKT.telefon + '</a>';

  panel.append(head, log, form, foot);
  wrap.append(panel, toggle);
  document.body.appendChild(wrap);

  const verlauf = [];
  const scrollDown = () => { log.scrollTop = log.scrollHeight; };

  function nachricht(text, wer, knoepfe, vorschlaege, vonKi) {
    const m = el('div', 'assistent__msg assistent__msg--' + wer);
    text.split(/\n{2,}/).forEach((absatz) => m.append(el('p', '', absatz)));
    if (vonKi) m.append(el('span', 'assistent__ki', 'KI-Antwort · ohne Gewähr'));
    if (knoepfe && knoepfe.length) {
      const row = el('div', 'assistent__actions');
      knoepfe.forEach((k) => {
        const kn = KNOEPFE[k];
        if (!kn) return;
        const a = el('a', 'assistent__action', kn.text);
        a.href = kn.link;
        if (kn.extern) { a.target = '_blank'; a.rel = 'noopener'; }
        row.append(a);
      });
      m.append(row);
    }
    if (vorschlaege) {
      const row = el('div', 'assistent__chips');
      VORSCHLAEGE.forEach((v) => {
        const b = el('button', 'assistent__chip', v);
        b.type = 'button';
        b.addEventListener('click', () => frag(v, true));
        row.append(b);
      });
      m.append(row);
    }
    log.append(m);
    verlauf.push({ wer, text });
    scrollDown();
  }

  function tippt() {
    const t = el('div', 'assistent__msg assistent__msg--bot assistent__typing');
    t.innerHTML = '<span></span><span></span><span></span>';
    log.append(t);
    scrollDown();
    return t;
  }

  // Getippte Fragen beantwortet die KI. Die festen Antworten oben springen ein,
  // wenn ein Vorschlag angetippt wird oder die KI nicht erreichbar ist.
  async function frag(text, vorschlag) {
    text = text.trim();
    if (!text) return;
    nachricht(text, 'du');
    input.value = '';
    passeHoeheAn();
    const t = tippt();
    const thema = finde(text);
    let ki = null;
    if (!vorschlag && KI_ADRESSE) {
      try {
        const r = await fetch(KI_ADRESSE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ frage: text, verlauf: verlauf.slice(-10), seite: document.title }),
        });
        if (r.ok) ki = await r.json();
      } catch (e) { /* dann eben die feste Antwort */ }
    } else {
      await new Promise((r) => setTimeout(r, 450));
    }
    t.remove();
    if (ki && ki.antwort) {
      const knoepfe = (ki.knoepfe || []).filter((k) => KNOEPFE[k]).slice(0, 2);
      nachricht(ki.antwort, 'bot', knoepfe, false, true);
    } else if (thema) nachricht(thema.antwort, 'bot', thema.knoepfe, thema.vorschlaege);
    else nachricht(WEISS_NICHT, 'bot', ['mail', 'anrufen', 'insta']);
  }

  let gestartet = false;
  function auf(offen) {
    panel.hidden = !offen;
    wrap.classList.toggle('is-open', offen);
    toggle.setAttribute('aria-expanded', String(offen));
    toggle.setAttribute('aria-label', offen ? 'Chat schließen' : 'Du hast noch Fragen? Chat öffnen');
    if (offen) {
      if (!gestartet) { nachricht(BEGRUESSUNG, 'bot', null, true); gestartet = true; }
      if (window.matchMedia('(min-width: 721px)').matches) input.focus();
    } else {
      toggle.focus();
    }
  }

  toggle.addEventListener('click', () => auf(panel.hidden));
  close.addEventListener('click', () => auf(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) auf(false); });
  form.addEventListener('submit', (e) => { e.preventDefault(); frag(input.value); });
})();
