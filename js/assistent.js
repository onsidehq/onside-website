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
  // Englische Seiten (unter /en/): Chat auf Englisch, Antworten aus THEMEN_EN
  const EN = (document.documentElement.lang || '').startsWith('en');
  const tr = (de, en) => (EN ? en : de);

  const KONTAKT = {
    mail: 'team@onsidehq.de',
    telefon: '+49 178 8519859',
    telefonLink: 'tel:+491788519859',
    instagram: 'https://instagram.com/onside.hq',
  };

  // Knöpfe, die unter einer Antwort erscheinen können
  // (Links mit / am Anfang, damit sie auch von den englischen Seiten unter /en/ stimmen)
  const KNOEPFE = {
    mail: { text: tr('Mail schreiben', 'Send an email'), link: 'mailto:' + KONTAKT.mail },
    anrufen: { text: tr('Anrufen', 'Call us'), link: KONTAKT.telefonLink },
    insta: { text: 'Instagram', link: KONTAKT.instagram, extern: true },
    anfrage: { text: tr('Projekt anfragen', 'Start a project'), link: tr('/kontakt', '/en/contact') },
    leistungen: { text: tr('Leistungen ansehen', 'See services'), link: tr('/leistungen', '/en/services') },
    projekte: { text: tr('Projekte ansehen', 'See projects'), link: tr('/projekte', '/en/projects') },
    nightrun: { text: tr('Zum Night Run', 'Night Run (German)'), link: '/berlin-night-run' },
    dagen: { text: tr('Zu Dagen', 'Dagen (German)'), link: '/dagen-yachtcharter' },
    snowside: { text: tr('Zu SNOWSIDE', 'See SNOWSIDE'), link: tr('/snowside', '/en/snowside') },
    team: { text: tr('Wer wir sind', 'About us (German)'), link: '/ueber-uns' },
    galerie: { text: tr('Zur Galerie', 'See gallery'), link: '/galerie' },
  };

  const THEMEN_DE = [
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

  // Dieselben Themen auf Englisch (für die Seiten unter /en/)
  const THEMEN_EN = [
    {
      woerter: ['hello', 'hi', 'hey', 'good morning', 'servus'],
      antwort: 'Hey! Great to have you here. Ask me anything about onside.hq or tap one of the topics below.',
      vorschlaege: true,
    },
    {
      woerter: ['fit our brand', 'our brand', 'brand identity', 'identity', 'brand values', 'values'],
      antwort: 'We always start with your brand, not with our ideas: what does it stand for, who do you want to reach, what should people remember? From that we build a concept that makes its identity visible and tangible, in the schedule, the partners and the content.',
      knoepfe: ['anfrage', 'leistungen'],
    },
    {
      woerter: ['how much', 'project cost', 'cost', 'price', 'pricing', 'budget', 'expensive', 'euro', '€', 'money', 'pay', 'fee', 'rate'],
      antwort: 'We don’t have a fixed price list, because a content package is something different from an event with partners and an afterparty. After a short call you get a concrete quote. If you already know your budget, tell us right away so we know what’s possible.',
      knoepfe: ['anfrage', 'anrufen'],
    },
    {
      woerter: ['lead time', 'how long', 'how fast', 'timeline', 'short notice', 'deadline', 'weeks', 'months'],
      antwort: 'It depends on the project: content for your channels is quicker than an event with a venue, partners and permits. We put the Berlin Night Run together in a few weeks. The earlier you get in touch, the more room there is.',
      knoepfe: ['anfrage'],
    },
    {
      woerter: ['process', 'work together', 'collaboration', 'steps', 'how does it work', 'first call'],
      antwort: 'In four steps: 1. We get to know you in a short call. 2. We come back with a concept including schedule, budget and timeline. 3. We make it happen and you always talk to us directly. 4. Afterwards we keep telling the story with content.',
      knoepfe: ['anfrage', 'leistungen'],
    },
    {
      woerter: ['services', 'what do you do', 'what do you offer', 'offer', 'agency'],
      antwort: 'We do three things, individually or together: event management (idea, planning, venue, partners, on-site execution), marketing & brand strategy (positioning, campaigns, sponsorship, communication for Gen Z) and social media (photo, video, reels, editing, channel management).',
      knoepfe: ['leistungen', 'anfrage'],
    },
    {
      woerter: ['event', 'party', 'launch', 'pop-up', 'popup', 'festival', 'community night', 'venue', 'company party'],
      antwort: 'Events are our core: we develop the concept, plan the schedule and venue, bring in the right partners and are there on the day. We come from sport, but we do launch events, pop-ups, parties and community nights just as well, ideally formats people can join in.',
      knoepfe: ['anfrage', 'nightrun'],
    },
    {
      woerter: ['social', 'instagram', 'tiktok', 'content', 'reel', 'video', 'photo', 'film', 'editing', 'channel', 'posts', 'youtube'],
      antwort: 'We produce photos, videos and reels, edit everything ourselves and can manage your channels too. One example: for Dagen Yachtcharter we shot reels in Corfu that got over 270,000 views in total.',
      knoepfe: ['dagen', 'anfrage'],
    },
    {
      woerter: ['brand', 'branding', 'strategy', 'positioning', 'campaign', 'marketing', 'target group', 'audience', 'gen z'],
      antwort: 'Marketing & brand strategy is about what your brand stands for and how it lands with a young audience: positioning, brand identity, campaign and activation concepts, partnerships and communication for Gen Z.',
      knoepfe: ['leistungen', 'anfrage'],
    },
    {
      woerter: ['only one', 'individually', 'book', 'just social', 'just content', 'just an event', 'combine'],
      antwort: 'Sure. Events, brand strategy and social media are available individually or together. It works best when everything plays together, but it’s your call.',
      knoepfe: ['anfrage'],
    },
    {
      woerter: ['sponsor', 'partner'],
      antwort: 'Partner management is part of what we do: we find the right partners, reach out and handle the arrangements. Red Bull, HEJ Natural and several Berlin bars were part of the Night Run, for example. Want to become a SNOWSIDE partner yourself? Just drop us a line.',
      knoepfe: ['mail', 'snowside'],
    },
    {
      woerter: ['where are you', 'location', 'based', 'potsdam', 'innsbruck', 'berlin', 'austria', 'germany', 'tyrol', 'office', 'address'],
      antwort: 'We are based in Potsdam and Innsbruck, with Berlin right on our doorstep. For the right project we will travel anywhere.',
      knoepfe: ['team'],
    },
    {
      woerter: ['project', 'reference', 'example', 'so far', 'clients', 'portfolio', 'work'],
      antwort: 'So far: the Berlin Night Run, our own event with a DJ, afterparty and partners, and reels for Dagen Yachtcharter in Corfu. Right now we are planning SNOWSIDE, a creator ski week in Tyrol in March 2027.',
      knoepfe: ['projekte', 'galerie'],
    },
    {
      woerter: ['night run', 'nightrun', 'run', 'running', 'red bull', 'redbull', 'hej'],
      antwort: 'The Berlin Night Run was our first own event: a run through Berlin at night with a DJ on a cargo bike, food and drinks, stops at bars and an afterparty. Red Bull and HEJ Natural were part of it.',
      knoepfe: ['nightrun'],
    },
    {
      woerter: ['dagen', 'yacht', 'sail', 'boat', 'corfu', 'greece'],
      antwort: 'For Dagen Yachtcharter we spent a week on a sailing boat around Corfu in September 2026 and produced reels and stories. The result: over 270,000 views, around 130 times more than their reels before.',
      knoepfe: ['dagen'],
    },
    {
      woerter: ['snowside', 'ski', 'snowboard', 'snow', 'winter', 'chalet', 'march 2027', 'ski week'],
      antwort: 'SNOWSIDE is our creator ski week: one week in March 2027 in Tyrol with 8–10 selected creators, a chalet and plenty of adventure. We are currently looking for partners and creators.',
      knoepfe: ['snowside'],
    },
    {
      woerter: ['creator', 'influencer', 'apply', 'join', 'take part', 'participate'],
      antwort: 'Want to come to Tyrol as a creator? You’re a good fit if you are between 20 and 27, from Germany, Austria or Switzerland, into action, travel or sidequests, film yourself and ski confidently. Applications go through Instagram: comment on our SNOWSIDE post and send us a DM.',
      knoepfe: ['insta', 'snowside'],
    },
    {
      woerter: ['who are you', 'team', 'founder', 'malte', 'julian', 'about you', 'behind'],
      antwort: 'Malte and Julian are behind onside.hq. We come from sport, organise events and produce the content ourselves. You always talk to the two of us directly.',
      knoepfe: ['team'],
    },
    {
      woerter: ['contact', 'mail', 'e-mail', 'email', 'phone', 'call', 'number', 'reach', 'whatsapp', 'talk', 'meeting'],
      antwort: 'The quickest way to reach us is by email at ' + KONTAKT.mail + ' or by phone at ' + KONTAKT.telefon + '. On Instagram we are @onside.hq.',
      knoepfe: ['mail', 'anrufen', 'insta'],
    },
    {
      woerter: ['reply', 'respond', 'get back', 'answer'],
      antwort: 'We get back to you within 48 hours, usually sooner.',
      knoepfe: ['anfrage', 'mail'],
    },
    {
      woerter: ['job', 'internship', 'intern', 'work for you', 'freelance', 'freelancer', 'photographer', 'videographer'],
      antwort: 'Great that you’re keen! Send us a short email with a few sentences about yourself and links to your work.',
      knoepfe: ['mail'],
    },
    {
      woerter: ['thanks', 'thank you', 'great', 'perfect', 'cool', 'nice'],
      antwort: 'You’re welcome! If anything else comes up, just ask.',
    },
  ];

  const THEMEN = EN ? THEMEN_EN : THEMEN_DE;
  const WEISS_NICHT = tr('Das kann ich dir hier leider nicht sicher beantworten. Schreib uns am besten kurz oder ruf an, dann klären wir das direkt.', 'I can’t answer that reliably here, sorry. Best to drop us a line or give us a call and we’ll sort it out directly.');
  const BEGRUESSUNG = tr('Hey! Ich bin der digitale Assistent von onside.hq, also kein Mensch: Manche Antworten schreibt eine KI. Frag mich alles zu Events, Content, unseren Projekten oder SNOWSIDE. Bitte gib hier keine persönlichen Daten ein.', 'Hey! I’m the digital assistant of onside.hq, so not a human: some answers are written by an AI. Ask me anything about events, content, our projects or SNOWSIDE. Please don’t enter any personal data here.');
  const VORSCHLAEGE = EN ? ['What do you do?', 'How much does a project cost?', 'How does it work?', 'SNOWSIDE', 'Contact'] : ['Was macht ihr?', 'Was kostet ein Projekt?', 'Wie läuft das ab?', 'SNOWSIDE', 'Kontakt'];

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
  toggle.setAttribute('aria-label', tr('Du hast noch Fragen? Chat öffnen', 'Any questions? Open chat'));
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" class="assistent__icon-chat"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" fill="currentColor"/></svg>'
    + '<svg viewBox="0 0 24 24" aria-hidden="true" class="assistent__icon-close"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'
    + '<span class="assistent__toggle-text">' + tr('Du hast noch Fragen?', 'Any questions?') + '</span>';

  const panel = el('section', 'assistent__panel');
  panel.id = 'assistentPanel';
  panel.hidden = true;
  panel.setAttribute('aria-label', tr('Assistent von onside.hq', 'onside.hq assistant'));

  const head = el('header', 'assistent__head');
  const title = el('div', 'assistent__title');
  title.append(el('strong', '', tr('onside Assistent', 'onside assistant')), el('span', '', tr('KI-gestützt · alles Weitere direkt mit uns', 'AI-powered · for everything else, talk to us')));
  const close = el('button', 'assistent__close');
  close.type = 'button';
  close.setAttribute('aria-label', tr('Chat schließen', 'Close chat'));
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  head.append(title, close);

  const log = el('div', 'assistent__log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');

  const form = el('form', 'assistent__form');
  const input = el('textarea', 'assistent__input');
  input.rows = 1;
  input.placeholder = tr('Deine Frage …', 'Your question …');
  input.setAttribute('aria-label', tr('Deine Frage', 'Your question'));
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
  send.setAttribute('aria-label', tr('Senden', 'Send'));
  send.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  form.append(input, send);

  const foot = el('p', 'assistent__foot');
  foot.innerHTML = tr('Lieber direkt?', 'Prefer to talk directly?') + ' <a href="mailto:' + KONTAKT.mail + '">' + KONTAKT.mail + '</a> · <a href="' + KONTAKT.telefonLink + '">' + KONTAKT.telefon + '</a>';

  panel.append(head, log, form, foot);
  wrap.append(panel, toggle);
  document.body.appendChild(wrap);

  const verlauf = [];
  const scrollDown = () => { log.scrollTop = log.scrollHeight; };

  function nachricht(text, wer, knoepfe, vorschlaege, vonKi) {
    const m = el('div', 'assistent__msg assistent__msg--' + wer);
    text.split(/\n{2,}/).forEach((absatz) => m.append(el('p', '', absatz)));
    if (vonKi) m.append(el('span', 'assistent__ki', tr('KI-Antwort · ohne Gewähr', 'AI answer · no guarantee')));
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
          body: JSON.stringify({ frage: text, verlauf: verlauf.slice(-10), seite: document.title, sprache: EN ? 'en' : 'de' }),
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
    toggle.setAttribute('aria-label', offen ? tr('Chat schließen', 'Close chat') : tr('Du hast noch Fragen? Chat öffnen', 'Any questions? Open chat'));
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
