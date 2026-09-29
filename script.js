/* ==========================================================================
   ONSIDE — Basis-JavaScript
   Zwei Dinge passieren hier:
   1) Scroll-Reveal-Animationen mit GSAP + ScrollTrigger
   2) Kleinkram (aktuelles Jahr im Footer)
   ========================================================================== */

// Aktuelles Jahr automatisch in den Footer schreiben
document.getElementById('year').textContent = new Date().getFullYear();

// GSAP-Plugin registrieren
gsap.registerPlugin(ScrollTrigger);

// Jedes Element mit der Klasse .reveal blendet sich ein,
// sobald es zu ~85% im sichtbaren Bereich ist.
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
      // toggleActions: onEnter, onLeave, onEnterBack, onLeaveBack
      toggleActions: 'play none none none',
    },
  });
});

// Bildergalerie: Klick auf ein Bild öffnet es groß in der Lightbox.
// Funktioniert schon jetzt mit den Platzhaltern (zeigt dann halt den
// Platzhalter groß) — sobald du echte <img>-Tags in die .gallery-item
// einsetzt, zeigt die Lightbox automatisch das richtige Foto an.
const lightbox = document.getElementById('lightbox');
const lightboxInner = lightbox ? lightbox.querySelector('.lightbox__inner') : null;

document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    if (!lightbox || !lightboxInner) return;
    const img = item.querySelector('img');
    lightboxInner.innerHTML = img
      ? `<img src="${img.getAttribute('src')}" alt="${img.getAttribute('alt') || ''}">`
      : item.querySelector('.gallery-item__ph').outerHTML;
    lightbox.classList.add('is-open');
  });
});

if (lightbox) {
  lightbox.addEventListener('click', () => lightbox.classList.remove('is-open'));
}

/* ---------------------------------------------------------------------
   Nächste Lern-Schritte, wenn du hier weiterbauen willst:

   - Mobile-Menü: aktuell wird .nav__links bei schmalen Screens per CSS
     ausgeblendet. Baue einen Burger-Button, der die Klasse "open" auf
     .nav__links togglet, und steuere das Ein-/Ausklappen über CSS.

   - Video statt Verlauf im Hero: lege eine komprimierte .mp4 in einen
     /assets-Ordner, entferne den Kommentar um <video class="hero__video">
     in index.html und setze den src-Pfad. Gleiches Prinzip für die
     .moment-Sections und den .project__cover.

   - Echte Fotos in die Galerie: in index.html jeden
     <div class="gallery-item__ph">...</div> löschen und durch
     <img src="assets/projects/berlin-night-run/01.jpg" alt="..."> ersetzen.
     Die Lightbox (oben in dieser Datei) funktioniert dann automatisch mit.

   - Eigene Farben: ändere die Variablen ganz oben in css/styles.css
     (--accent ist die wichtigste).
--------------------------------------------------------------------- */
