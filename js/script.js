/* ==========================================================================
   onside.hq — JavaScript
   Was hier passiert:
   1) Hero-Animation: "Crowd & Beat" — Punktraster + Taktwellen (Canvas)
   2) Scroll-Reveal-Animationen mit GSAP + ScrollTrigger
   3) Nav: Menü-Button + Vollbild-Overlay
   4) Bilder-Carousel (Projekte -> Berlin Night Run)
   5) Laufband-Ticker (zwei Zeilen, gegenläufig)
   6) Kleinkram (aktuelles Jahr im Footer, Sprachauswahl-UI)
   7) Kontaktformular
   ========================================================================== */

// Aktuelles Jahr automatisch in den Footer schreiben
document.getElementById('year').textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------------
   1) HERO-ANIMATION — "Crowd & Beat"

   Das Punktraster über die ganze Fläche ist das Publikum. Im Takt werden
   Wellen losgeschickt, die sich kreisförmig ausbreiten. Erreicht eine Welle
   einen Punkt, hebt er sich an, wird größer und leuchtet in der Akzentfarbe
   auf — wie eine Welle, die durch ein Stadion läuft. Treffen zwei Wellen auf
   denselben Punkt, addiert sich der Ausschlag.

   Nichts davon ist Bild oder Video: läuft live im Browser und sieht jedes
   Mal anders aus. Zum Anpassen reichen die Werte in SETTINGS.
--------------------------------------------------------------------- */
const SETTINGS = {
  spacing: 30,       // Abstand der Punkte im Raster (kleiner = dichteres Publikum)
  dotSize: 1.5,      // Grundgröße eines Punktes
  bpm: 96,           // Takt, in dem neue Wellen starten
  waveSpeed: 430,    // Ausbreitung in Pixeln pro Sekunde
  waveWidth: 95,     // Dicke der Wellenfront (größer = weicher)
  grow: 3.2,         // wie stark ein getroffener Punkt wächst
  lift: 9,           // wie weit ein getroffener Punkt weggeschoben wird
  showFronts: true,  // die Wellenfront zusätzlich als feiner Ring
};

const canvas = document.getElementById('heroCanvas');

if (canvas && canvas.getContext) {
  const ctx = canvas.getContext('2d');
  const accentRGB = (getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-rgb') || '63, 213, 255').trim();

  /* Für jeden Punkt einzeln eine Farbe zu setzen wäre viel zu langsam
     (tausende Punkte pro Bild). Stattdessen werden die Helligkeiten in
     feste Stufen einsortiert und pro Stufe alle Punkte auf einmal gemalt. */
  const LEVELS = 18;
  const whiteStyle = [];
  const accentStyle = [];
  const bucketWhite = [];
  const bucketAccent = [];
  for (let i = 0; i <= LEVELS; i++) {
    const a = (i / LEVELS).toFixed(3);
    whiteStyle.push(`rgba(255, 255, 255, ${a})`);
    accentStyle.push(`rgba(${accentRGB}, ${a})`);
    bucketWhite.push([]);
    bucketAccent.push([]);
  }

  let width = 0;
  let height = 0;
  let dots = [];          // das Publikum
  let waves = [];         // laufende Wellen
  let maxRadius = 0;
  let nextBeat = 0;
  let startTime = 0;
  let rafId = null;

  function buildDots() {
    // auf sehr breiten Screens etwas luftiger, damit die Punktzahl im Rahmen bleibt
    const step = Math.max(SETTINGS.spacing, Math.round(width / 52));
    const cols = Math.ceil(width / step) + 1;
    const rows = Math.ceil(height / step) + 1;
    const arr = [];
    for (let iy = 0; iy < rows; iy++) {
      for (let ix = 0; ix < cols; ix++) {
        arr.push({
          // leichte Unregelmäßigkeit, damit es nach Menge aussieht und nicht nach Tabelle
          x: ix * step + (Math.random() - 0.5) * step * 0.55,
          y: iy * step + (Math.random() - 0.5) * step * 0.55,
          base: 0.09 + Math.random() * 0.17,   // Grundhelligkeit
          size: SETTINGS.dotSize * (0.7 + Math.random() * 0.7),
          phase: Math.random() * Math.PI * 2,  // fürs ruhige Atmen zwischen den Wellen
        });
      }
    }
    return arr;
  }

  let beatIndex = 0;

  function spawnWave(t) {
    // Ursprung irgendwo auf der Fläche, etwas zur Mitte hin gewichtet
    const bias = () => 0.5 + (Math.random() - 0.5) * 1.5;
    // jeder vierte Schlag ist der betonte — stärkere, schnellere Welle
    const downbeat = beatIndex % 4 === 0;
    beatIndex++;
    waves.push({
      x: bias() * width,
      y: bias() * height,
      t0: t,
      strength: downbeat ? 1.15 + Math.random() * 0.3 : 0.6 + Math.random() * 0.35,
      speed: downbeat ? SETTINGS.waveSpeed * 1.25 : SETTINGS.waveSpeed,
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    maxRadius = Math.hypot(width, height) + SETTINGS.waveWidth;
    dots = buildDots();
  }

  function render(now) {
    const t = now - startTime;

    // neue Welle im Takt losschicken
    const beatLength = 60 / SETTINGS.bpm;
    while (t >= nextBeat) {
      spawnWave(nextBeat);
      nextBeat += beatLength;
    }

    // Wellen fortschreiben, ausgelaufene entfernen
    for (let i = waves.length - 1; i >= 0; i--) {
      waves[i].r = (t - waves[i].t0) * waves[i].speed;
      if (waves[i].r > maxRadius) waves.splice(i, 1);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // die Wellenfront selbst, ganz dezent
    if (SETTINGS.showFronts) {
      ctx.globalCompositeOperation = 'lighter';
      for (const w of waves) {
        if (!(w.r > 0)) continue; // negativer Radius würde das ganze Skript stoppen
        const fade = Math.max(0, 1 - w.r / maxRadius);
        if (fade <= 0.02) continue;
        ctx.strokeStyle = `rgba(${accentRGB}, ${0.07 * fade})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // das Publikum
    const sigma = SETTINGS.waveWidth;
    const twoSigmaSq = 2 * sigma * sigma;
    const reach = sigma * 2.2;

    for (let i = 0; i <= LEVELS; i++) {
      bucketWhite[i].length = 0;
      bucketAccent[i].length = 0;
    }

    const waveCount = waves.length;
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      let energy = 0;
      let pushX = 0;
      let pushY = 0;

      for (let j = 0; j < waveCount; j++) {
        const w = waves[j];
        const dx = d.x - w.x;
        const dy = d.y - w.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offset = dist - w.r;
        if (offset > reach || offset < -reach) continue;

        // je näher der Punkt an der Wellenfront, desto stärker der Ausschlag
        const fade = 1 - w.r / maxRadius;
        if (fade <= 0) continue;
        const e = Math.exp(-(offset * offset) / twoSigmaSq) * w.strength * fade;
        energy += e;
        if (dist > 0.001) {
          pushX += (dx / dist) * e;
          pushY += (dy / dist) * e;
        }
      }

      // ruhiges Atmen, damit das Feld zwischen zwei Wellen nicht tot wirkt
      const breathe = 0.5 + 0.5 * Math.sin(t * 1.1 + d.phase);
      const baseAlpha = d.base * (0.75 + breathe * 0.45);

      if (energy < 0.03) {
        const lvl = (baseAlpha * LEVELS) | 0;
        if (lvl > 0) bucketWhite[lvl].push(d.x, d.y, d.size);
      } else {
        const e = energy > 1 ? 1 : energy;
        const size = d.size + e * SETTINGS.grow;
        const alpha = Math.min(0.95, baseAlpha + e * 0.8);
        const lvl = (alpha * LEVELS) | 0;
        bucketAccent[lvl].push(
          d.x + pushX * SETTINGS.lift - size / 2,
          d.y + pushY * SETTINGS.lift - size / 2,
          size
        );
      }
    }

    // pro Helligkeitsstufe einmal die Farbe setzen, dann alles auf einmal malen
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i <= LEVELS; i++) {
      const arr = bucketWhite[i];
      if (arr.length) {
        ctx.fillStyle = whiteStyle[i];
        for (let k = 0; k < arr.length; k += 3) ctx.fillRect(arr[k], arr[k + 1], arr[k + 2], arr[k + 2]);
      }
      const acc = bucketAccent[i];
      if (acc.length) {
        ctx.fillStyle = accentStyle[i];
        for (let k = 0; k < acc.length; k += 3) ctx.fillRect(acc[k], acc[k + 1], acc[k + 2], acc[k + 2]);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(timestamp) {
    render(timestamp / 1000);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId === null) rafId = requestAnimationFrame(frame);
  }
  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Ruhiges Standbild (wenn "Bewegung reduzieren" eingeschaltet ist):
  // zwei stehende Wellen, keine Bewegung. t0 ist so gewählt, dass render()
  // bei t = 0 genau die angegebenen Radien ausrechnet.
  function renderStill() {
    const still = (x, y, strength, r) => ({ x, y, strength, speed: SETTINGS.waveSpeed, t0: -r / SETTINGS.waveSpeed });
    waves = [
      still(width * 0.32, height * 0.38, 1, width * 0.22),
      still(width * 0.74, height * 0.66, 0.8, width * 0.3),
    ];
    nextBeat = Infinity;
    render(startTime);
  }

  resize();
  startTime = performance.now() / 1000;

  if (reducedMotion) {
    renderStill();
  } else {
    start();

    // Taktzähler nachziehen, damit nach einer Pause nicht alle Wellen auf einmal starten
    const resume = () => {
      nextBeat = performance.now() / 1000 - startTime;
      start();
    };

    // Im Hintergrund-Tab pausieren
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : resume();
    });

    // Und pausieren, sobald der Hero aus dem Bild gescrollt ist —
    // es bringt nichts, etwas zu berechnen, das niemand sieht.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries[0].isIntersecting ? resume() : stop();
      }, { threshold: 0 }).observe(canvas);
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      if (reducedMotion) renderStill();
    }, 200);
  });
}

/* ---------------------------------------------------------------------
   2) Scroll-Reveal und Parallax (GSAP)
   GSAP kommt von cdnjs — falls das CDN mal nicht erreichbar ist (langsames
   Netz, Ad-/Script-Blocker), soll der Rest der Seite trotzdem laufen.
--------------------------------------------------------------------- */
const gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

if (gsapReady) {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.reveal').forEach((el, index) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: (index % 3) * 0.1, // leichte Staffelung
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  if (!reducedMotion) {
    // Leichter Parallax auf dem Projekt-Titelbild
    gsap.utils.toArray('.project__cover-bg, .project__cover-img').forEach((bg) => {
      const section = bg.closest('.project__cover');
      if (!section) return;
      gsap.to(bg, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }
} else {
  // Fallback ohne GSAP: .reveal-Elemente trotzdem sichtbar machen
  document.querySelectorAll('.reveal').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  console.warn('onside.hq: GSAP konnte nicht geladen werden — Scroll-Animationen sind aus, der Rest läuft normal.');
}

/* ---------------------------------------------------------------------
   3) Nav — Menü-Button + Vollbild-Menü
   Der Button sitzt fest neben dem Logo und wird beim Öffnen zum X.
   Die Leiste liegt über dem Overlay, damit Logo und Button sichtbar bleiben.
--------------------------------------------------------------------- */
const navBurger = document.getElementById('navBurger');
const menuOverlay = document.getElementById('menuOverlay');

function openMenu() {
  menuOverlay.classList.add('is-open');
  navBurger.classList.add('is-open');
  navBurger.setAttribute('aria-expanded', 'true');
  navBurger.setAttribute('aria-label', 'Menü schließen');
  document.body.classList.add('menu-open');
}

function closeMenu() {
  menuOverlay.classList.remove('is-open');
  navBurger.classList.remove('is-open');
  navBurger.setAttribute('aria-expanded', 'false');
  navBurger.setAttribute('aria-label', 'Menü öffnen');
  document.body.classList.remove('menu-open');
}

if (navBurger && menuOverlay) {
  navBurger.addEventListener('click', () => {
    menuOverlay.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  menuOverlay.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ---------------------------------------------------------------------
   Sprachauswahl — aktuell nur optisch (DE aktiv, EN zeigt einen Hinweis).
   Für eine echte Übersetzung müssten alle Texte zweisprachig vorliegen.
--------------------------------------------------------------------- */
document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.lang-switch');
    group.querySelectorAll('.lang-switch__btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    if (btn.dataset.lang === 'en') showToast('English version coming soon');
  });
});

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: 'rgba(20,20,20,0.95)',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#f5f5f5',
      padding: '0.8rem 1.4rem',
      borderRadius: '999px',
      fontSize: '0.85rem',
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
   4) Bilder-Carousel (Projekte -> Berlin Night Run)
   Pfeile + Punkte, plus Wischen auf Touch-Geräten.
--------------------------------------------------------------------- */
const track = document.getElementById('carouselTrack');

if (track) {
  const slides = Array.from(track.querySelectorAll('.carousel__slide'));
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  let current = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Zu Bild ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const carouselDots = Array.from(dotsWrap.querySelectorAll('.carousel__dot'));

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    carouselDots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    update();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) goTo(current + (diff < 0 ? 1 : -1));
  }, { passive: true });

  update();
}

/* ---------------------------------------------------------------------
   5) Laufband
   Ein Durchlauf ist ein .next__group (gefülltes Wort + Outline-Wort).
   Das Skript misst dessen echte Breite in Pixeln, hängt so viele Kopien an,
   dass die Zeile immer über den ganzen Bildschirm reicht, und schiebt sie
   dann exakt um einen Durchlauf weiter — danach springt sie unsichtbar an
   den Anfang zurück.

   Warum nicht mehr per CSS mit translateX(-50 %)? Der Browser rechnet die
   50 % beim Start der Animation einmal in Pixel um — zu dem Zeitpunkt sind
   die Kopien noch gar nicht angehängt. Die Zeilen liefen dadurch mit halber
   Strecke und halbem Tempo, standen am Anfang deckungsgleich übereinander
   und sprangen mitten im Wort zurück. Das war das "Abschneiden".

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
   7) Kontaktformular
   Schickt die Anfrage an Web3Forms, die daraus eine Mail an euer Postfach
   machen. Läuft ohne Seitenwechsel: Rückmeldung erscheint direkt unter dem
   Button. Den Access Key trägst du in index.html ein (siehe Kommentar dort).
--------------------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('formSubmit');

  const setStatus = (text, kind) => {
    statusEl.textContent = text;
    statusEl.className = 'contact-form__status' + (kind ? ' is-' + kind : '');
  };

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const key = contactForm.querySelector('[name="access_key"]').value;
    if (!key || key === 'DEIN-ACCESS-KEY-HIER') {
      setStatus('Das Formular ist noch nicht eingerichtet — Access Key fehlt. Schreib uns so lange direkt per Mail.', 'error');
      return;
    }

    submitBtn.disabled = true;
    setStatus('Wird gesendet …');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        contactForm.reset();
        setStatus('Danke! Deine Anfrage ist da — wir melden uns.', 'ok');
      } else {
        setStatus('Das hat gerade nicht geklappt. Schreib uns gern direkt an onside.hq@gmail.com.', 'error');
      }
    } catch (err) {
      setStatus('Keine Verbindung. Schreib uns gern direkt an onside.hq@gmail.com.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* ---------------------------------------------------------------------
   Wenn du hier weiterbauen willst:

   - Hero-Animation anpassen: die SETTINGS ganz oben in dieser Datei.
     spacing = wie dicht das Publikum steht, bpm = Takt der Wellen,
     waveSpeed = Tempo der Welle, waveWidth = wie weich die Front ist,
     grow/lift = wie heftig die Punkte reagieren.
   - Echte Fotos einsetzen: in index.html stehen an jeder Stelle
     Kommentare mit dem passenden Dateipfad (BILD 1 bis BILD 8).
   - Eigene Farben: die Variablen ganz oben in css/styles.css —
     wichtig: --accent UND --accent-rgb gemeinsam ändern.
--------------------------------------------------------------------- */
