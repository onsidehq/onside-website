/* ==========================================================================
   onside.hq — JavaScript (Bedienung)
   Was hier passiert:
   1) Einblenden beim Scrollen, Überschriften Wort für Wort
   2) Nav: Menü-Button + Vollbild-Menü
   3) Laufband-Ticker (zwei Zeilen, gegenläufig)
   4) Lichtfleck auf Karten, der der Maus folgt
   5) Kontaktformular
   6) Startbildschirm: Fotos, die ruhig überblenden (Liste in js/config.js)
   7) Projektseite: Regler "Der Plan dahinter"
   8) Direkte Links ohne Umleitung (nur online)

   Alles, was gezeichnet und animiert wird (Hintergrund, Szenen, Striche),
   steht in js/visuals.js. Eure Einstellungen stehen in js/config.js.

   Jeder Teil läuft für sich: Fehlt auf einer Seite ein Element (z. B. der
   Regler auf der Kontaktseite), wird der Teil einfach übersprungen.
   ========================================================================== */

// Meldung an das Sicherheitsnetz im <head>: Das Skript ist gestartet.
window.__onsideReady = true;
// Hat das Laden so lange gedauert, dass das Sicherheitsnetz schon alles
// sichtbar gemacht hat (sehr langsames Netz)? Dann bleibt es dabei —
// nachträglich wieder ausblenden und animieren würde nur flackern.
const lateStart = document.documentElement.classList.contains('no-anim');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Aktuelles Jahr automatisch in den Footer schreiben
document.querySelectorAll('[data-year], #year').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

/* ---------------------------------------------------------------------
   1) Einblenden beim Scrollen
   - Elemente mit der Klasse "reveal" blenden ein und rutschen nach oben.
   - Überschriften mit data-split kommen Wort für Wort von unten herein.
   Die Bewegung selbst steht im CSS (Abschnitt 18). Hier wird nur beobachtet,
   wann etwas ins Bild kommt, und dann die Klasse "is-in" gesetzt. Dafür
   braucht es keine Bibliothek: Das kann jeder Browser selbst.
--------------------------------------------------------------------- */

// Zerlegt eine Überschrift in einzelne Wörter. Jedes Wort bekommt eine
// "Maske" (.w), hinter der es hervorkommt (.w__i). Zeilenumbrüche (<br>)
// bleiben, andere Elemente (z. B. ein Wort mit Strich darunter) zählen als
// ein Stück.
function splitWords(el) {
  const units = [];
  const makeUnit = () => {
    const mask = document.createElement('span');
    const inner = document.createElement('span');
    mask.className = 'w';
    inner.className = 'w__i';
    inner.style.setProperty('--i', units.length);
    mask.appendChild(inner);
    units.push(inner);
    return { mask, inner };
  };

  // Getrennt wird nur an normalen Leerzeichen. Ein geschütztes Leerzeichen
  // (&nbsp;) hält zwei Wörter bewusst zusammen, z. B. "Marketing &".
  const GAP = /([ \t\n\r]+)/;
  const ONLY_GAP = /^[ \t\n\r]+$/;

  const splitText = (text, className) => {
    const frag = document.createDocumentFragment();
    text.split(GAP).forEach((part) => {
      if (!part) return;
      if (ONLY_GAP.test(part)) {
        frag.appendChild(document.createTextNode(' '));
        return;
      }
      const unit = makeUnit();
      unit.inner.textContent = part;
      if (className) unit.inner.classList.add(className);
      frag.appendChild(unit.mask);
    });
    return frag;
  };

  Array.from(el.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      el.replaceChild(splitText(node.textContent), node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('dim')) {
      // gedämpfter Satzteil (<span class="dim">): Wörter einzeln, Farbe bleibt
      el.replaceChild(splitText(node.textContent, 'dim'), node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      const unit = makeUnit();
      el.insertBefore(unit.mask, node);
      unit.inner.appendChild(node);
    }
  });
  return units;
}

// Überschrift ist fertig eingeblendet: Maske öffnen und den
// handgezeichneten Strich in js/visuals.js starten lassen
function markRevealed(el) {
  el.classList.add('is-revealed');
  el.dispatchEvent(new CustomEvent('onside:revealed'));
}

function showEverything() {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
  document.querySelectorAll('[data-split]').forEach((el) => {
    el.classList.add('is-split', 'is-in');
    markRevealed(el);
  });
}

try {
  if (!reducedMotion && !lateStart && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        el.classList.add('is-in');
        if (el.hasAttribute('data-split')) {
          const words = el.querySelectorAll('.w__i').length;
          setTimeout(() => markRevealed(el), 950 + words * 50);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px' }); // "oben bei 88 % der Bildschirmhöhe"

    document.querySelectorAll('[data-split]').forEach((el) => {
      splitWords(el);
      el.classList.add('is-split');
      io.observe(el);
    });

    document.querySelectorAll('.reveal').forEach((el, index) => {
      el.style.setProperty('--d', ((index % 3) * 0.1) + 's'); // leichte Staffelung
      io.observe(el);
    });

    // Leichter Versatz beim Scrollen auf dem Projekt-Titelbild
    document.querySelectorAll('.project__cover-bg').forEach((bg) => {
      const section = bg.closest('.project__cover');
      if (!section) return;
      let visible = false;
      let queued = false;
      const update = () => {
        queued = false;
        const r = section.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight + r.height)));
        bg.style.transform = 'translate3d(0,' + (p * 8).toFixed(2) + '%,0)';
      };
      const onScroll = () => {
        if (visible && !queued) {
          queued = true;
          requestAnimationFrame(update);
        }
      };
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) onScroll();
      }).observe(section);
      window.addEventListener('scroll', onScroll, { passive: true });
    });
  } else {
    showEverything();
  }
} catch (err) {
  showEverything();
  console.warn('onside.hq: Einblenden beim Scrollen konnte nicht starten —', err);
}

/* ---------------------------------------------------------------------
   2) Nav — Menü-Button + Vollbild-Menü
   Der Button sitzt fest neben dem Logo und wird beim Öffnen zum X.
   Die Leiste liegt über dem Menü, damit Logo und Button sichtbar bleiben.
--------------------------------------------------------------------- */
const navBurger = document.getElementById('navBurger');
const menuOverlay = document.getElementById('menuOverlay');

function setMenu(open) {
  const wasOpen = menuOverlay.classList.contains('is-open');
  menuOverlay.classList.toggle('is-open', open);
  navBurger.classList.toggle('is-open', open);
  navBurger.setAttribute('aria-expanded', String(open));
  navBurger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  document.body.classList.toggle('menu-open', open);
  document.documentElement.classList.toggle('menu-open', open); // sperrt das Scrollen dahinter

  // Solange das Menü offen ist, ist die Seite dahinter für Tastatur und
  // Screenreader gesperrt — sonst wandert die Tab-Taste durch Unsichtbares.
  document.querySelectorAll('main, .footer, .skip-link').forEach((el) => {
    el.inert = open;
  });
  // Wer das Menü mit der Tastatur schließt, landet wieder auf dem Menü-Button.
  if (wasOpen && !open && menuOverlay.contains(document.activeElement)) navBurger.focus();
}

if (navBurger && menuOverlay) {
  navBurger.addEventListener('click', () => setMenu(!menuOverlay.classList.contains('is-open')));
  menuOverlay.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
  // wird das Fenster breit gezogen, während das Menü offen ist: schließen
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && menuOverlay.classList.contains('is-open')) setMenu(false);
  });
}

/* ---------------------------------------------------------------------
   3) Laufband
   Ein Durchlauf ist ein .next__group (gefülltes Wort + Outline-Wort).
   Das Skript misst dessen echte Breite in Pixeln, hängt so viele Kopien an,
   dass die Zeile immer über den ganzen Bildschirm reicht, und schiebt sie
   dann exakt um einen Durchlauf weiter — danach springt sie unsichtbar an
   den Anfang zurück.

   Warum nicht per CSS mit translateX(-50 %)? Der Browser rechnet die 50 %
   beim Start der Animation einmal in Pixel um — zu dem Zeitpunkt sind die
   Kopien noch gar nicht angehängt. Die Zeilen liefen dadurch mit halber
   Strecke und halbem Tempo und sprangen mitten im Wort zurück.

   Ändert sich die Breite (Schrift fertig geladen, Handy gedreht, Fenster
   gezogen), wird neu gemessen und an derselben Stelle weitergelaufen.
   Außerhalb des Bildschirms pausiert das Band.
--------------------------------------------------------------------- */
const MARQUEE = {
  // Tempo in Schriftgrößen pro Sekunde — wirkt dadurch auf Handy und
  // Desktop gleich lebendig. Höher = schneller.
  speed: { left: 1.5, right: 1.2 },
  // Wo die erste Raute sitzt, wenn das Band ins Bild kommt
  // (0 = linker Rand, 1 = rechter Rand) — so starten die Zeilen versetzt.
  markAt: { left: 0.35, right: 0.7 },
};

const marqueeSection = document.querySelector('.next');
const marquees = Array.from(document.querySelectorAll('[data-marquee]')).map((row) => ({
  row,
  group: row.querySelector('.next__group'),
  word: row.querySelector('.next__word'),
  dir: row.classList.contains('next__row--b') ? 'right' : 'left',
  period: 0,
  anim: null,
  started: false,
}));
let marqueeVisible = false;

// Startpunkt (0–1 eines Durchlaufs), bei dem die erste Raute an markAt sitzt
function marqueeStart(m, period, viewport) {
  const mark = m.group.querySelector('.next__mark');
  if (!mark) return 0;
  const markBox = mark.getBoundingClientRect();
  const markCenter = markBox.left + markBox.width / 2 - m.group.getBoundingClientRect().left;
  const shift = ((((markCenter - MARQUEE.markAt[m.dir] * viewport) / period) % 1) + 1) % 1;
  return m.dir === 'left' ? shift : (1 - shift) % 1;
}

function layoutMarquee(m) {
  const { row, group } = m;
  if (!group) return;
  const period = group.getBoundingClientRect().width; // ein Durchlauf inkl. Abstand
  if (period < 1) return;
  const viewport = marqueeSection.clientWidth;

  // genug Kopien, damit auch am Ende eines Durchlaufs rechts nichts leer bleibt
  const needed = 1 + Math.ceil(viewport / period);
  while (row.children.length < needed) {
    const copy = group.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true'); // Screenreader lesen den Satz nur einmal
    row.appendChild(copy);
  }
  while (row.children.length > needed) row.lastElementChild.remove();

  // läuft schon und die Breite ist gleich geblieben -> nichts zu tun
  if (m.started && m.anim && Math.abs(period - m.period) < 0.5) return;

  let progress = marqueeStart(m, period, viewport);
  if (m.anim) {
    if (m.started) {
      const d = m.anim.effect.getTiming().duration;
      progress = ((m.anim.currentTime || 0) % d) / d;
    }
    m.anim.cancel();
    m.anim = null;
  }
  m.period = period;

  const from = m.dir === 'left' ? 0 : -period;
  const to = m.dir === 'left' ? -period : 0;

  if (reducedMotion || typeof row.animate !== 'function') {
    // ruhige Variante: Band steht, aber versetzt
    row.style.transform = `translate3d(${from + (to - from) * progress}px, 0, 0)`;
    return;
  }

  const fontSize = parseFloat(getComputedStyle(m.word || group).fontSize) || 40;
  const duration = (period / (fontSize * MARQUEE.speed[m.dir])) * 1000;
  m.anim = row.animate(
    [{ transform: `translate3d(${from}px, 0, 0)` }, { transform: `translate3d(${to}px, 0, 0)` }],
    { duration, iterations: Infinity, easing: 'linear' }
  );
  m.anim.currentTime = progress * duration;
  if (marqueeVisible) m.started = true;
  else m.anim.pause();
}

let marqueeFrame = null;
function scheduleMarqueeLayout() {
  if (marqueeFrame !== null) return;
  marqueeFrame = requestAnimationFrame(() => {
    marqueeFrame = null;
    marquees.forEach(layoutMarquee);
  });
}

function setMarqueeVisible(visible) {
  marqueeVisible = visible;
  marquees.forEach((m) => {
    if (!m.anim) return;
    if (visible) {
      m.anim.play();
      m.started = true;
    } else {
      m.anim.pause();
    }
  });
}

if (marqueeSection && marquees.length) {
  marquees.forEach(layoutMarquee);

  // neu messen, sobald sich Breiten ändern (Schrift geladen, Drehen, Fenstergröße)
  if ('ResizeObserver' in window) {
    const marqueeResize = new ResizeObserver(scheduleMarqueeLayout);
    marqueeResize.observe(marqueeSection);
    marquees.forEach((m) => m.group && marqueeResize.observe(m.group));
  } else {
    window.addEventListener('resize', scheduleMarqueeLayout);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleMarqueeLayout);

  // nur laufen lassen, wenn das Band (fast) im Bild ist
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => setMarqueeVisible(entries[entries.length - 1].isIntersecting),
      { rootMargin: '200px 0px' }
    ).observe(marqueeSection);
  } else {
    setMarqueeVisible(true);
  }
}

/* ---------------------------------------------------------------------
   4) Lichtfleck auf Karten (alle Elemente mit data-spot)
   Die Mausposition wird als CSS-Variable an die Karte gegeben; den Rest
   macht das CSS. Auf Touch-Geräten gibt es keinen Mauszeiger — dort aus.
--------------------------------------------------------------------- */
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('[data-spot]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - box.left}px`);
      card.style.setProperty('--my', `${e.clientY - box.top}px`);
    });
  });
}

/* ---------------------------------------------------------------------
   5) Kontaktformular
   Schickt die Anfrage an Web3Forms, die daraus eine Mail an euer Postfach
   machen. Läuft ohne Seitenwechsel: Die Rückmeldung erscheint direkt unter
   dem Button. Den Access Key tragt ihr in js/config.js ein.
--------------------------------------------------------------------- */
document.querySelectorAll('[data-contact-form]').forEach((form) => {
  const statusEl = form.querySelector('[data-form-status]');
  const submitBtn = form.querySelector('[data-form-submit]');

  const MAIL = 'team@onsidehq.de';

  const setStatus = (text, kind) => {
    statusEl.textContent = text;
    statusEl.className = 'contact-form__status' + (kind ? ' is-' + kind : '');
  };

  // Die angeklickten Interessen ("Was braucht ihr?") als eine Zeile
  const interests = () => new FormData(form).getAll('interesse').join(', ');

  // Nach dem Absenden erscheint statt der Felder ein Dankeschön. Mit
  // "Noch eine Anfrage" kommt das (leere) Formular zurück.
  const done = document.createElement('div');
  done.className = 'contact-form__done';
  done.innerHTML =
    '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><path d="m15 24.5 6 6 12-12.5"/></svg>' +
    '<p class="contact-form__done-title" tabindex="-1"></p>' +
    '<p class="contact-form__done-text">Wir melden uns innerhalb von 48\u00a0Stunden. Bis dahin findest du uns auf ' +
    '<a href="https://instagram.com/onside.hq" target="_blank" rel="noopener">Instagram</a>.</p>' +
    '<button type="button" class="btn btn--ghost btn--small">Noch eine Anfrage</button>';
  form.appendChild(done);
  const doneTitle = done.querySelector('.contact-form__done-title');
  done.querySelector('button').addEventListener('click', () => {
    form.classList.remove('is-sent');
    setStatus('');
    const first = form.querySelector('.chip input, #cf-name');
    if (first) first.focus();
  });

  // Klappt das Senden nicht, soll nichts verloren gehen: Die Meldung enthält
  // einen Mail-Link, der das schon Geschriebene gleich in die Mail übernimmt.
  const setFailed = (text) => {
    setStatus(text + ' Schreib uns gern direkt an ', 'error');
    const data = new FormData(form);
    const topic = interests() ? 'Interesse: ' + interests() : '';
    const body = [topic, data.get('message'), data.get('name')].filter(Boolean).join('\n\n').slice(0, 1500);
    const link = document.createElement('a');
    link.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Anfrage über onsidehq.de') + '&body=' + encodeURIComponent(body);
    link.textContent = MAIL;
    statusEl.appendChild(link);
    statusEl.appendChild(document.createTextNode('.'));
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Solange in js/config.js noch kein Access Key steht, kann nichts verschickt werden.
    const key = (window.ONSIDE && window.ONSIDE.formKey) || '';
    if (!key || key === 'DEIN-ACCESS-KEY-HIER') {
      setFailed('Das Formular ist gerade nicht erreichbar.');
      return;
    }

    submitBtn.disabled = true;
    setStatus('Wird gesendet …');

    try {
      const data = new FormData(form);
      const payload = {};
      data.forEach((value, name) => {
        if (name !== 'interesse') payload[name] = value;
      });
      // Betreff mit Name und Interessen, damit man im Postfach sofort sieht,
      // worum es geht: "Neue Anfrage von Lea (Event, Social Media)"
      const picked = interests();
      payload.Interesse = picked || 'nicht angegeben';
      payload.subject = 'Neue Anfrage von ' + (String(data.get('name') || '').trim() || 'onsidehq.de') + (picked ? ' (' + picked + ')' : '');
      payload.access_key = key;
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        const firstName = String(data.get('name') || '').trim().split(/\s+/)[0];
        form.reset();
        setStatus('Danke! Deine Anfrage ist da. Wir melden uns innerhalb von 48 Stunden.', 'ok');
        doneTitle.textContent = 'Danke' + (firstName ? ', ' + firstName : '') + '! Deine Anfrage ist da.';
        form.classList.add('is-sent');
        done.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
        doneTitle.focus({ preventScroll: true });
      } else {
        setFailed('Das hat gerade nicht geklappt.');
      }
    } catch (err) {
      setFailed('Keine Verbindung.');
    } finally {
      submitBtn.disabled = false;
    }
  });
});

/* ---------------------------------------------------------------------
   6) Startbildschirm
   Die Fotos stehen in js/config.js (startbild). Alle paar Sekunden blendet
   das nächste Foto ruhig über. Läuft nur, solange der Startbildschirm zu
   sehen ist. Wer am Gerät "Bewegung reduzieren" eingestellt hat, sieht ein
   ruhiges Standbild.
--------------------------------------------------------------------- */
(function () {
  const hero = document.querySelector('[data-slides]');
  const nav = document.getElementById('nav');

  // Navigation oben durchsichtig auf dem Foto, beim Scrollen wieder dunkel
  if (hero && nav) {
    const onScroll = () => nav.classList.toggle('nav--over', window.scrollY < 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const cfg = (window.ONSIDE && window.ONSIDE.startbild) || {};
  if (!hero || !Array.isArray(cfg.breit) || !cfg.breit.length) return;

  // Hochformat (Handy, Tablet hochkant) bekommt die Liste "handy"
  const portrait = window.matchMedia('(orientation: portrait)');
  const hasHandy = Array.isArray(cfg.handy) && cfg.handy.length > 0;
  const pickList = () => (portrait.matches && hasHandy ? cfg.handy : cfg.breit);
  const DUR = Math.max(3, cfg.sekunden || 6) * 1000;
  const FADE = 1600; // so lange dauert das Überblenden (wie in css/styles.css)
  const pad = (n) => String(n).padStart(2, '0');

  const stage = hero.querySelector('.hero__stage');
  const countEl = hero.querySelector('.hero__count');
  const capEl = hero.querySelector('.hero__caption');
  const bar = hero.querySelector('.hero__bar i');
  let list = pickList();
  let index = 0;
  let current = stage.querySelector('.hero__img');
  let timer = null;
  let running = false;
  let busy = false;

  const warm = (k) => { const im = new Image(); im.src = list[k % list.length].bild; };

  function label(k) {
    if (countEl) countEl.textContent = pad(k + 1) + ' / ' + pad(list.length);
    if (capEl) capEl.textContent = list[k].text || '';
    if (!bar) return;
    bar.classList.remove('is-running');
    void bar.offsetWidth; // Animation neu starten
    bar.style.setProperty('--dur', DUR + 'ms');
    if (running) bar.classList.add('is-running');
  }

  function show(k) {
    if (busy) return;
    busy = true;
    const slide = list[k];
    const img = document.createElement('img');
    img.className = 'hero__img';
    img.alt = '';
    img.decoding = 'async';
    img.src = slide.bild;
    img.style.setProperty('--pos', slide.ausschnitt || '50% 50%');
    img.style.setProperty('--pos-m', slide.ausschnitt || '50% 50%');
    const go = () => {
      stage.appendChild(img);
      img.classList.add('is-on');
      if (current) {
        const old = current;
        old.classList.remove('is-on', 'is-first');
        old.classList.add('is-off');
        setTimeout(() => old.remove(), FADE + 100);
      }
      current = img;
      index = k;
      label(k);
      warm(k + 1);
      busy = false;
    };
    // erst zeigen, wenn das Foto fertig geladen ist (sonst blendet es ins Leere)
    (img.decode ? img.decode() : Promise.resolve()).then(go, () => { busy = false; });
  }

  function schedule() {
    clearTimeout(timer);
    if (running) timer = setTimeout(() => { show((index + 1) % list.length); schedule(); }, DUR);
  }

  // Bildausschnitte des ersten Fotos ebenfalls aus js/config.js
  current.style.setProperty('--pos', cfg.breit[0].ausschnitt || '50% 50%');
  if (hasHandy) current.style.setProperty('--pos-m', cfg.handy[0].ausschnitt || '50% 50%');
  label(0);

  // Handy gedreht oder Fenster umgestellt: passende Liste von vorn
  portrait.addEventListener('change', () => {
    list = pickList();
    show(0);
    schedule();
  });

  if (reducedMotion) return; // Standbild, kein Durchlaufen

  // das nächste Foto erst vorladen, wenn die Seite fertig ist (das erste hat Vorrang)
  if (document.readyState === 'complete') warm(1);
  else window.addEventListener('load', () => setTimeout(() => warm(1), 400), { once: true });

  let inView = true;
  const sync = () => {
    const should = inView && !document.hidden;
    if (should && !running) {
      running = true;
      label(index);
      schedule();
    } else if (!should && running) {
      running = false;
      clearTimeout(timer);
      if (bar) bar.classList.remove('is-running');
    }
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(hero);
  }
  document.addEventListener('visibilitychange', sync);
  sync();
})();

/* ---------------------------------------------------------------------
   7) Projektseite: Regler "Der Plan dahinter"
   Links das Foto, rechts dieselbe Szene als Planskizze. Die Markierungen
   (Kreis + Beschriftung) hängen an Punkten im Foto und rutschen mit, wenn
   sich der Bildausschnitt ändert. Ein Punkt steht als Anteil der Bildbreite
   und -höhe in NOTES (x: 0.5 = Mitte).
--------------------------------------------------------------------- */
(function () {
  const box = document.querySelector('[data-backstage]');
  if (!box) return;

  const handle = box.querySelector('.backstage__handle');
  const plan = box.querySelector('.backstage__plan');
  const planImg = plan.querySelector('img');
  const svg = box.querySelector('.backstage__marks');
  const small = window.matchMedia('(max-width: 720px)');
  const SVGNS = 'http://www.w3.org/2000/svg';

  const NOTES = [
    { x: 0.721, y: 0.50, rx: 0.03, ry: 0.06, k: '01 · Ziel', t: 'Genau diese Gesichter', lx: 0.078, ly: 0.075,
      handy: { lx: -0.128, ly: -0.27 } },
    { x: 0.638, y: 0.525, rx: 0.03, ry: 0.06, k: '02 · Content', t: 'Momente, die man filmen will', lx: -0.055, ly: 0.15,
      handy: { hide: true } },
    { x: 0.385, y: 0.75, rx: 0.085, ry: 0.11, k: '03 · Sound', t: 'DJ fährt vorneweg', lx: 0.0, ly: -0.37,
      handy: { hide: true } },
  ];

  let x = 100;
  function setX(v, byUser) {
    x = Math.max(0, Math.min(100, v));
    box.style.setProperty('--x', x + '%');
    handle.setAttribute('aria-valuenow', Math.round(x));
    if (byUser) box.classList.add('was-used');
  }

  // Wo landet ein Punkt des Fotos, wenn es den Rahmen per "cover" füllt?
  function mapper() {
    const W = box.clientWidth;
    const H = box.clientHeight;
    const nw = planImg.naturalWidth || 2400;
    const nh = planImg.naturalHeight || 1600;
    const s = Math.max(W / nw, H / nh);
    const dw = nw * s;
    const dh = nh * s;
    const pos = (getComputedStyle(planImg).objectPosition || '50% 50%').split(' ').map((p) => parseFloat(p) / 100);
    const ox = (W - dw) * pos[0];
    const oy = (H - dh) * pos[1];
    return { W, H, dw, dh, pt: (fx, fy) => [ox + fx * dw, oy + fy * dh] };
  }

  const labels = NOTES.map(() => {
    const el = document.createElement('div');
    el.className = 'backstage__note';
    plan.appendChild(el);
    return el;
  });

  function draw(name, attrs) {
    const n = document.createElementNS(SVGNS, name);
    Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    svg.appendChild(n);
  }

  function layout() {
    const m = mapper();
    svg.setAttribute('viewBox', '0 0 ' + m.W + ' ' + m.H);
    svg.textContent = '';
    NOTES.forEach((base, i) => {
      const n = small.matches && base.handy ? Object.assign({}, base, base.handy) : base;
      const el = labels[i];
      el.hidden = !!n.hide;
      if (n.hide) return;
      el.innerHTML = '<span class="backstage__label">' + n.k + '</span><strong>' + n.t + '</strong>';
      const [cx, cy] = m.pt(n.x, n.y);
      const rx = n.rx * m.dw;
      const ry = n.ry * m.dh;
      const ax = cx + n.lx * m.dw;
      const ay = cy + n.ly * m.dh;
      el.style.left = ax + 'px';
      el.style.top = ay + 'px';
      el.style.transform = 'translate(0, -0.55em)';
      // Linie: vom Kreis schräg zum Knick, dann waagerecht bis zur Beschriftung
      const ex = ax - 8;
      const kx = ax - 34;
      const ang = Math.atan2(ay - cy, kx - cx);
      const sx = cx + Math.cos(ang) * rx;
      const sy = cy + Math.sin(ang) * ry;
      draw('ellipse', { cx: cx.toFixed(1), cy: cy.toFixed(1), rx: rx.toFixed(1), ry: ry.toFixed(1) });
      draw('path', { d: 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ' L' + kx.toFixed(1) + ' ' + ay.toFixed(1) + ' L' + ex.toFixed(1) + ' ' + ay.toFixed(1) });
      draw('circle', { cx: ex.toFixed(1), cy: ay.toFixed(1), r: 2.6 });
    });
  }

  // Ziehen mit Maus, Finger oder Stift
  let dragging = false;
  const fromEvent = (e) => {
    const r = box.getBoundingClientRect();
    setX(((e.clientX - r.left) / r.width) * 100, true);
  };
  box.addEventListener('pointerdown', (e) => {
    dragging = true;
    box.classList.add('is-dragging');
    box.setPointerCapture(e.pointerId);
    fromEvent(e);
  });
  box.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
  const end = () => { dragging = false; box.classList.remove('is-dragging'); };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  handle.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 20 : 5;
    if (e.key === 'ArrowLeft') setX(x - step, true);
    else if (e.key === 'ArrowRight') setX(x + step, true);
    else if (e.key === 'Home') setX(0, true);
    else if (e.key === 'End') setX(100, true);
    else return;
    e.preventDefault();
  });

  // Einstieg, sobald der Regler ins Bild kommt: erst das Foto, dann schiebt sich der Plan herein
  function tween(from, to, ms, done) {
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    (function step(now) {
      if (box.classList.contains('was-used')) return;
      const t = Math.min(1, (now - t0) / ms);
      setX(from + (to - from) * ease(t));
      if (t < 1) requestAnimationFrame(step);
      else if (done) done();
    })(t0);
  }

  const rest = () => (small.matches ? 40 : 56);
  if (planImg.complete) layout(); else planImg.addEventListener('load', layout, { once: true });
  window.addEventListener('resize', layout);

  if (reducedMotion || !('IntersectionObserver' in window)) {
    setX(rest());
  } else {
    setX(100);
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      setTimeout(() => tween(100, rest(), 1500, () => setTimeout(() => tween(rest(), rest() + 8, 500, () => tween(rest() + 8, rest(), 600)), 1400)), 300);
    }, { threshold: 0.5 });
    io.observe(box);
  }
})();

/* ---------------------------------------------------------------------
   8) Direkte Links
   Cloudflare zeigt jede Seite unter ihrer kurzen Adresse (onsidehq.de/kontakt)
   und leitet "kontakt.html" dorthin um. Damit ein Klick nicht erst über diese
   Umleitung läuft, zeigen die Links online gleich auf die kurze Adresse.
   In den HTML-Dateien bleibt "kontakt.html" stehen: So funktionieren die Links
   auch, wenn man die Dateien lokal per Doppelklick öffnet.
--------------------------------------------------------------------- */
if (window.location.protocol === 'https:') {
  document.querySelectorAll('a[href*=".html"]').forEach((link) => {
    const url = new URL(link.getAttribute('href'), window.location.href);
    if (url.origin !== window.location.origin || !/\.html$/.test(url.pathname)) return;
    url.pathname = url.pathname.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
    link.setAttribute('href', url.pathname + url.search + url.hash);
  });
}

/* ---------------------------------------------------------------------
   Wenn du hier weiterbauen willst:

   - Animationen anpassen: die SETTINGS ganz oben in js/visuals.js.
   - Fotos austauschen: welches Foto wo liegt, steht in BILDER.md. Die Fotos
     des Startbildschirms stehen als Liste in js/config.js.
   - Eigene Farben: die Variablen ganz oben in css/styles.css —
     wichtig: --accent UND --accent-rgb gemeinsam ändern.
--------------------------------------------------------------------- */
