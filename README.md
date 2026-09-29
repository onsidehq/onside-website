# Onside — Website-Grundgerüst

Startpunkt für eure Website, gebaut mit purem HTML/CSS/JS + GSAP (alles kostenlos).
Gedacht zum Weiterlernen — nicht als fertiges Produkt.

## Struktur

```
onsidehq-website/
├── index.html      ← Seiteninhalt & Struktur (Hero, Services, Moments, Projekte, Kontakt)
├── css/
│   └── styles.css  ← Alles Visuelle. Farben stehen ganz oben als Variablen.
├── js/
│   └── script.js   ← Scroll-Animationen (GSAP) + Bildergalerie-Lightbox
└── README.md
```

Es gibt (noch) keinen `assets/`-Ordner — den legst du selbst an, sobald du
deine Fotos/Videos vom Night Run hast (siehe "Was zuerst anpassen" unten).

## Lokal ansehen

Keine Installation nötig. Einfach `index.html` per Doppelklick im Browser öffnen,
oder für eine saubere lokale Vorschau mit Live-Reload:

1. VS Code installieren (falls noch nicht vorhanden): https://code.visualstudio.com
2. Erweiterung "Live Server" installieren (im VS Code Marketplace)
3. Rechtsklick auf `index.html` → "Open with Live Server"

Jede Änderung an den Dateien ist dann sofort im Browser sichtbar.

## Was zuerst anpassen

1. **Farbe:** `css/styles.css` → `--accent` ganz oben auf eure Markenfarbe setzen
2. **Texte:** in `index.html` die Platzhalter-Texte durch eure finalen ersetzen
3. **Hero-Video:** eigenes Video (z. B. Night-Run-Footage) in einen neuen `assets/`-Ordner
   legen, dann in `index.html` den auskommentierten `<video class="hero__video">`-Tag
   aktivieren und den `src` anpassen
4. **Bildergalerie (Projekte → Berlin Night Run):** in `index.html` im Abschnitt
   `<section id="projekte">` jeden Platzhalter
   `<div class="gallery-item__ph"><span>Bild 1</span></div>` löschen und durch
   `<img src="assets/projects/berlin-night-run/01.jpg" alt="Berlin Night Run">`
   ersetzen (Nummer/Dateiname anpassen). Die Lightbox (Klick = groß anzeigen)
   funktioniert dann automatisch mit den echten Fotos.
5. **Moment-Sections (die großen Bild-Breaks zwischen den Abschnitten):**
   entweder in `css/styles.css` bei `.moment__bg` die `background`-Zeile durch
   `background: url('../assets/moments/01.jpg') center/cover;` ersetzen, oder
   das auskommentierte `<video class="moment__video">` in `index.html` aktivieren.

## Kostenlos deployen (Domain: onsidehq.de)

Empfehlung: **Cloudflare Pages** — kostenlos, kein Limit für so ein Projekt, schnell.

1. Kostenlosen GitHub-Account anlegen (falls noch nicht vorhanden) und dieses
   Projekt als Repository hochladen (Anleitung: [docs.github.com/de/get-started](https://docs.github.com/de))
2. Auf [pages.cloudflare.com](https://pages.cloudflare.com) mit dem GitHub-Account einloggen
3. "Create a project" → Repository auswählen → Deploy (keine Build-Einstellungen nötig,
   da reines HTML/CSS/JS)
4. Unter "Custom domains" in Cloudflare Pages `onsidehq.de` hinzufügen und die
   angezeigten DNS-Einträge bei eurem Domain-Anbieter eintragen

Alternative: **GitHub Pages** — funktioniert genauso einfach, direkt aus den
Repository-Einstellungen aktivierbar.

## Weiterlernen

- HTML/CSS-Grundlagen: [freeCodeCamp – Responsive Web Design](https://www.freecodecamp.org/learn/2022/responsive-web-design/)
- Scroll-Animationen vertiefen: [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- Allgemeines Nachschlagewerk: [MDN Web Docs](https://developer.mozilla.org/de/)
