/* ==========================================================================
   ONSIDE — Basis-JavaScript
   Was hier passiert:
   1) Scroll-Reveal-Animationen mit GSAP + ScrollTrigger
   2) Leichter Parallax-Effekt auf den großen Hintergrundbildern
   3) Nav: Scroll-Status (Links ausblenden -> Burger einblenden) + Menü-Overlay
   4) Bilder-Carousel (Projekte -> Berlin Night Run)
   5) Marquee-Ticker ("Das nächste Projekt entsteht schon")
   6) Cursor-Dot (nur Desktop mit Maus)
   7) Kleinkram (aktuelles Jahr im Footer, Sprachauswahl-UI)
   ========================================================================== */

// Aktuelles Jahr automatisch in den Footer schreiben
document.getElementById('year').textContent = new Date().getFullYear();

// GSAP kommt von cdnjs — falls das CDN mal nicht erreichbar ist (langsames Netz,
// Ad-/Script-Blocker), soll der Rest der Seite (Nav, Burger, Carousel, Marquee)
// trotzdem ganz normal funktionieren. Deshalb alles GSAP-Spezifische hier
// absichern, statt die ganze Datei davon abhängig zu machen.
const gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

if (gsapReady) {
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------------------
     1) Scroll-Reveal
     Jedes Element mit der Klasse .reveal blendet sich ein,
     sobald es zu ~85% im sichtbaren Bereich ist.
  --------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');

  revealElements.forEach((el, index) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: (index % 3) * 0.1, // leichte Staffelung, wenn mehrere Elemente gleichzeitig auftauchen
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  /* ---------------------------------------------------------------------
     2) Parallax auf den großformatigen Hintergründen (Hero + Moment-Sections).
     Die Hintergrundelemente sind im CSS bewusst etwas größer als ihr Container
     (top:-10%/-12%, height:120%/124%), damit beim Verschieben keine Lücke entsteht.
  --------------------------------------------------------------------- */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.utils.toArray('.hero__bg, .hero__video, .moment__bg').forEach((bg) => {
      const section = bg.closest('.hero, .moment');
      if (!section) return;
      gsap.to(bg, {
        yPercent: 12,
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
  // Fallback ohne GSAP: .reveal-Elemente trotzdem sichtbar machen,
  // sonst blieben sie dauerhaft unsichtbar (opacity:0 ist ihr CSS-Startzustand).
  document.querySelectorAll('.reveal').forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  console.warn('onside.hq: GSAP konnte nicht geladen werden — Scroll-Animationen sind deaktiviert, der Rest der Seite läuft normal weiter.');
}

/* ---------------------------------------------------------------------
   3) Nav — Scroll-Status + Burger + Vollbild-Menü
--------------------------------------------------------------------- */
const nav = document.getElementById('nav');
const navBurger = document.getElementById('navBurger');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');

function updateNavState() {
  if (window.scrollY > 120) {
    nav.classList.add('nav--compact');
  } else {
    nav.classList.remove('nav--compact');
  }
}
updateNavState();
window.addEventListener('scroll', updateNavState, { passive: true });

function openMenu() {
  menuOverlay.classList.add('is-open');
  navBurger.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  menuOverlay.classList.remove('is-open');
  navBurger.setAttribute('aria-expanded', 'false');
}

if (navBurger && menuOverlay) {
  navBurger.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  menuOverlay.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
  // Mit Escape schließen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ---------------------------------------------------------------------
   Sprachauswahl — aktuell nur optisch (DE aktiv, EN zeigt einen Hinweis).
   Für eine echte Übersetzung müssten alle Texte in zwei Sprachen vorliegen
   und per JS getauscht werden — sag Bescheid, wenn du das als Nächstes willst.
--------------------------------------------------------------------- */
document.querySelectorAll('.lang-switch__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.lang-switch');
    group.querySelectorAll('.lang-switch__btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    if (btn.dataset.lang === 'en') {
      showToast('English version coming soon 🇬🇧');
    }
  });
});

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.background = 'rgba(20,20,20,0.95)';
    toast.style.border = '1px solid rgba(255,255,255,0.12)';
    toast.style.color = '#f5f5f5';
    toast.style.padding = '0.8rem 1.4rem';
    toast.style.borderRadius = '999px';
    toast.style.fontSize = '0.85rem';
    toast.style.zIndex = '500';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.pointerEvents = 'none';
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
   Pfeile + Punkte, plus einfache Swipe-Unterstützung auf Touch-Geräten.
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
  const dots = Array.from(dotsWrap.querySelectorAll('.carousel__dot'));

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    update();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Swipe (Touch)
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) {
      diff < 0 ? goTo(current + 1) : goTo(current - 1);
    }
  }, { passive: true });

  update();
}

/* ---------------------------------------------------------------------
   5) Marquee — Track-Inhalt einmal duplizieren, damit die Endlos-Schleife
   (CSS-Animation läuft bis -50%) nahtlos aussieht, egal wie viele
   Wiederholungen im HTML stehen.
--------------------------------------------------------------------- */
const marqueeTrack = document.getElementById('marqueeTrack');
if (marqueeTrack) {
  marqueeTrack.innerHTML += marqueeTrack.innerHTML;
}

/* ---------------------------------------------------------------------
   6) Cursor-Dot — nur auf Geräten mit echter Maus (kein Touch-Only).
--------------------------------------------------------------------- */
const cursorDot = document.getElementById('cursorDot');
if (cursorDot && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.body.classList.add('has-cursor-dot');

  window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;
  });

  document.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => cursorDot.classList.add('is-hovering'));
    el.addEventListener('mouseleave', () => cursorDot.classList.remove('is-hovering'));
  });
}

/* ---------------------------------------------------------------------
   Nächste Lern-Schritte, wenn du hier weiterbauen willst:

   - Mobile-Menü: läuft jetzt über .menu-overlay (Burger-Button erscheint
     auf Mobile immer, auf Desktop erst beim Scrollen).

   - Video statt Verlauf im Hero: lege eine komprimierte .mp4 unter
     assets/hero.mp4 ab (optional assets/hero-poster.jpg als Vorschaubild) —
     läuft dann automatisch, siehe <video class="hero__video"> in index.html.
     Gleiches Prinzip für die .moment-Sections und den .project__cover.

   - Echte Fotos im Carousel: in index.html jeden
     <div class="gallery-item__ph">...</div> löschen und durch
     <img src="assets/projects/berlin-night-run/01.jpg" alt="..."> ersetzen.

   - Eigene Farben: ändere die Variablen ganz oben in css/styles.css
     (--accent ist die wichtigste).
--------------------------------------------------------------------- */
