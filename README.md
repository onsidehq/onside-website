# onside.hq — Website-Grundgerüst

Startpunkt für eure Website, gebaut mit purem HTML/CSS/JS + GSAP (alles kostenlos).
Gedacht zum Weiterlernen — nicht als fertiges Produkt.

## Struktur

```
onsidehq-website/
├── index.html      ← Seiteninhalt & Struktur (Hero, Projekte, Wer sind wir, Leistungen, Kontakt)
├── css/
│   └── styles.css  ← Alles Visuelle. Farben stehen ganz oben als Variablen.
├── js/
│   └── script.js   ← Scroll-Animationen, Nav/Burger-Menü, Carousel, Marquee, Cursor-Dot
├── favicon.ico, favicon-512.png, apple-touch-icon.png  ← Browser-Tab-Icon (müssen im Repo-Root liegen!)
└── README.md
```

Es gibt (noch) keinen `assets/`-Ordner — den legst du selbst an, sobald du
deine Fotos/Videos vom Night Run hast (siehe "Was zuerst anpassen" unten).

## Was neu ist in diesem Update

- **Nav:** Menüpunkte jetzt Home / Projekte / Wer sind wir? / Leistungen / Kontakt,
  plus Sprachauswahl DE/EN rechts (aktuell nur optisch — EN zeigt einen Hinweis,
  echte Übersetzung wäre ein eigenes nächstes Projekt).
- **Scroll-Menü:** Sobald du runterscrollst, verschwindet die Nav-Zeile und links
  unter dem Logo erscheint ein Drei-Strich-Button, der ein Vollbild-Menü öffnet.
  Auf dem Handy ist der Button immer sichtbar (vorher gab's dort gar keine Navigation).
- **Hero-Video:** `<video class="hero__video">` ist jetzt aktiv (nicht mehr auskommentiert),
  zeigt aber erstmal nichts, bis du `assets/hero.mp4` hochlädst — bis dahin läuft der
  Verlaufs-Platzhalter einfach weiter.
- **Bildergalerie → Carousel:** Statt dem unregelmäßigen 8er-Grid gibt's jetzt unter
  Night Run ein Carousel mit 5 Bildern, durchklickbar über Pfeile oder die Punkte unten
  (auf dem Handy auch per Wischen).
- **"Proof of Concept"** über "Unsere Projekte" ist raus.
- **"Das nächste Projekt entsteht schon"** läuft jetzt als endlos scrollender
  Text-Ticker (Marquee) statt als stiller Satz.
- **Neue Sektion "Wer sind wir?"** mit kurzem Team-Blurb — Text ist ein erster
  Entwurf, gerne says Bescheid, wenn der anders klingen soll.
- Insgesamt mehr Bewegung: leichter Parallax auf den großen Hintergrundbildern,
  ein Cursor-Punkt, der der Maus folgt (nur Desktop), und alles so gebaut, dass
  die Seite auch normal funktioniert, falls die Animations-Bibliothek (GSAP) mal
  nicht laden sollte.

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
   (z. B. den Team-Text unter "Wer sind wir?")
3. **Hero-Video:** `assets/hero.mp4` (+ optional `assets/hero-poster.jpg` als Vorschaubild)
   in einen neuen `assets/`-Ordner legen — der `<video class="hero__video">`-Tag in
   `index.html` ist schon aktiv und greift automatisch darauf zu
4. **Carousel (Projekte → Berlin Night Run):** in `index.html` im Abschnitt
   `#carouselTrack` jeden Platzhalter
   `<div class="gallery-item__ph"><span>Bild 1</span></div>` löschen und durch
   `<img src="assets/projects/berlin-night-run/01.jpg" alt="Berlin Night Run">`
   ersetzen (Nummer/Dateiname anpassen). Pfeile und Punkte funktionieren danach
   automatisch mit den echten Fotos.
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
