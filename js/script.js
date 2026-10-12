/* ==========================================================================
   onside.hq — JavaScript (Bedienung)
   Was hier passiert:
   1) Einblenden beim Scrollen (GSAP + ScrollTrigger), Überschriften Wort für Wort
   2) Nav: Menü-Button + Vollbild-Menü
   3) Sprachauswahl (aktuell nur optisch)
   4) Bilder-Carousel
   5) Laufband-Ticker (zwei Zeilen, gegenläufig)
   6) Lichtfleck auf Karten, der der Maus folgt
   7) Kontaktformular

   Alles, was gezeichnet und animiert wird (Hintergrund, Szenen, Striche),
   steht in js/visuals.js. Eure Einstellungen stehen in js/config.js.

   Jeder Teil läuft für sich: Fehlt auf einer Seite ein Element (z. B. das
   Carousel auf der Kontaktseite), wird der Teil einfach übersprungen.
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
   GSAP liegt lokal im Projekt. Sollte es trotzdem einmal nicht laden,
   wird einfach alles sofort angezeigt.
--------------------------------------------------------------------- */
const gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

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
    mask.appendChild(inner);
    units.push(inner);
    return { mask, inner };
  };

  // Getrennt wird nur an normalen Leerzeichen. Ein geschütztes Leerzeichen
  // (&nbsp;) hält zwei Wörter bewusst zusammen, z. B. "Marketing &".
  const GAP = /([ \t\n\r]+)/;
  const ONLY_GAP = /^[ \t\n\r]+$/;

  Array.from(el.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      node.textContent.split(GAP).forEach((part) => {
        if (!part) return;
        if (ONLY_GAP.test(part)) {
          frag.appendChild(document.createTextNode(' '));
          return;
        }
        const unit = makeUnit();
        unit.inner.textContent = part;
        frag.appendChild(unit.mask);
      });
      el.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
      const unit = makeUnit();
      el.insertBefore(unit.mask, node);
      unit.inner.appendChild(node);
    }
  });
  return units;
}

function showEverything() {
  document.querySelectorAll('.reveal').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  document.querySelectorAll('[data-split]').forEach((el) => {
    el.classList.add('is-split', 'is-revealed');
    el.dispatchEvent(new CustomEvent('onside:revealed'));
  });
}

try {
  if (gsapReady && !reducedMotion && !lateStart) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-split]').forEach((el) => {
      const words = splitWords(el);
      gsap.set(words, { yPercent: 118 });
      el.classList.add('is-split');
      gsap.to(words, {
        yPercent: 0,
        duration: 0.95,
        ease: 'power3.out',
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onComplete() {
          gsap.set(words, { clearProps: 'transform' });
          el.classList.add('is-revealed');
          // Signal für die handgezeichneten Striche in js/visuals.js
          el.dispatchEvent(new CustomEvent('onside:revealed'));
        },
      });
    });

    document.querySelectorAll('.reveal').forEach((el, index) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: (index % 3) * 0.1, // leichte Staffelung
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // Leichter Versatz beim Scrollen auf dem Projekt-Titelbild
    gsap.utils.toArray('.project__cover-bg').forEach((bg) => {
      const section = bg.closest('.project__cover');
      if (!section) return;
      gsap.to(bg, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    // Positionen neu messen, sobald Schrift und Bilder geladen sind
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  } else {
    showEverything();
    if (!gsapReady) {
      console.warn('onside.hq: GSAP konnte nicht geladen werden — Scroll-Animationen sind aus, der Rest läuft normal.');
    }
  }
} catch (err) {
  showEverything();
  console.warn('onside.hq: Scroll-Animationen konnten nicht starten —', err);
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
   3) Sprachauswahl — aktuell nur optisch (DE aktiv, EN zeigt einen Hinweis).
   Für eine echte Übersetzung müssten alle Texte zweisprachig vorliegen.
--------------------------------------------------------------------- */
document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.lang === 'en') {
      showToast('English version coming soon');
      return; // DE bleibt aktiv, solange es keine englische Fassung gibt
    }
    const group = btn.closest('.lang-switch');
    group.querySelectorAll('.lang-switch__btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
  });
});

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.setAttribute('role', 'status');
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: 'rgba(18, 17, 15, 0.96)',
      border: '1px solid rgba(247, 242, 232, 0.16)',
      color: '#f7f2e8',
      padding: '0.8rem 1.4rem',
      borderRadius: '999px',
      fontSize: '0.85rem',
      whiteSpace: 'nowrap',
      zIndex: '500',
      opacity: '0',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      pointerEvents: 'none',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(toast._hideTimeout);
  toast._hideTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2200);
}

/* ---------------------------------------------------------------------
   4) Bilder-Carousel
   Das Verschieben übernimmt der Browser selbst (scroll-snap im CSS): Auf dem
   Handy folgt das Bild direkt dem Finger. Dieses Skript ergänzt Pfeile,
   Punkte und die Pfeiltasten.
--------------------------------------------------------------------- */
document.querySelectorAll('[data-carousel]').forEach((root) => {
  const viewport = root.querySelector('.carousel__viewport');
  const slides = Array.from(root.querySelectorAll('.carousel__slide'));
  const dotsWrap = root.querySelector('.carousel__dots');
  if (!viewport || !slides.length) return;
  let current = 0;

  // wie weit muss gescrollt werden, damit Bild i vorne steht
  const offsetOf = (i) => slides[i].offsetLeft - slides[0].offsetLeft;

  function goTo(i) {
    const index = ((i % slides.length) + slides.length) % slides.length;
    const left = offsetOf(index);
    try {
      viewport.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
    } catch (err) {
      viewport.scrollLeft = left; // sehr alte Browser
    }
  }

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Zu Bild ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    if (dotsWrap) dotsWrap.appendChild(dot);
    return dot;
  });

  // welches Bild steht gerade vorne? -> Punkte aktualisieren
  function sync() {
    const x = viewport.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((_, i) => {
      const dist = Math.abs(offsetOf(i) - x);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    current = best;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  let syncFrame = null;
  viewport.addEventListener('scroll', () => {
    if (syncFrame !== null) return;
    syncFrame = requestAnimationFrame(() => {
      syncFrame = null;
      sync();
    });
  }, { passive: true });

  const prev = root.querySelector('.carousel__arrow--prev');
  const next = root.querySelector('.carousel__arrow--next');
  if (prev) prev.addEventListener('click', () => goTo(current - 1));
  if (next) next.addEventListener('click', () => goTo(current + 1));

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  // Die hinteren Fotos laden erst, wenn das Carousel ins Bild kommt (spart
  // Datenvolumen) — dann aber alle auf einmal, damit beim Wischen nichts nachlädt.
  if ('IntersectionObserver' in window) {
    const loader = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      loader.disconnect();
      root.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
    }, { rootMargin: '300px 0px' });
    loader.observe(root);
  }

  sync();
});

/* ---------------------------------------------------------------------
   5) Laufband
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
   6) Lichtfleck auf Karten (alle Elemente mit data-spot)
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
   7) Kontaktformular
   Schickt die Anfrage an Web3Forms, die daraus eine Mail an euer Postfach
   machen. Läuft ohne Seitenwechsel: Die Rückmeldung erscheint direkt unter
   dem Button. Den Access Key tragt ihr in js/config.js ein.
--------------------------------------------------------------------- */
document.querySelectorAll('[data-contact-form]').forEach((form) => {
  const statusEl = form.querySelector('[data-form-status]');
  const submitBtn = form.querySelector('[data-form-submit]');

  const MAIL = 'onside.hq@gmail.com';

  const setStatus = (text, kind) => {
    statusEl.textContent = text;
    statusEl.className = 'contact-form__status' + (kind ? ' is-' + kind : '');
  };

  // Klappt das Senden nicht, soll nichts verloren gehen: Die Meldung enthält
  // einen Mail-Link, der das schon Geschriebene gleich in die Mail übernimmt.
  const setFailed = (text) => {
    setStatus(text + ' Schreib uns gern direkt an ', 'error');
    const data = new FormData(form);
    const body = [data.get('message'), data.get('name')].filter(Boolean).join('\n\n').slice(0, 1500);
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
      const payload = Object.fromEntries(new FormData(form));
      payload.access_key = key;
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        form.reset();
        setStatus('Danke! Deine Anfrage ist da – wir melden uns.', 'ok');
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
   Wenn du hier weiterbauen willst:

   - Animationen anpassen: die SETTINGS ganz oben in js/visuals.js.
   - Echte Fotos einsetzen: Im HTML stehen an jeder Stelle Kommentare mit
     dem passenden Dateipfad (BILD 1 bis BILD 8). Liegt die Datei dort,
     ersetzt sie die Animation von selbst.
   - Eigene Farben: die Variablen ganz oben in css/styles.css —
     wichtig: --accent UND --accent-rgb gemeinsam ändern.
--------------------------------------------------------------------- */
