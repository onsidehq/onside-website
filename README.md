# onside.hq — Website-Grundgerüst

Startpunkt für eure Website, gebaut mit purem HTML/CSS/JS + GSAP (alles kostenlos).
Gedacht zum Weiterlernen — nicht als fertiges Produkt.

## Struktur

```
onsidehq-website/
├── index.html      ← Seiteninhalt & Struktur (Hero, Projekte, Wer sind wir, Leistungen, Kontakt)
├── css/
│   └── styles.css  ← Alles Visuelle. Farben stehen ganz oben als Variablen.
├── BILDER.md       ← Übersicht aller Bilder, die noch fehlen
├── fonts/          ← selbst gehostete Schriften (nicht löschen)
├── impressum.html  ← Pflichtangaben
├── datenschutz.html ← Datenschutzerklärung
├── js/
│   ├── script.js
│   ├── gsap.min.js        ← Animationsbibliothek, lokal
│   └── ScrollTrigger.min.js   ← Hero-Animation (Crowd & Beat), Scroll-Animationen, Nav/Burger-Menü, Carousel, Laufband
├── favicon.ico, favicon-512.png, apple-touch-icon.png  ← Browser-Tab-Icon (müssen im Repo-Root liegen!)
└── README.md
```

Es gibt (noch) keinen `assets/`-Ordner — den legst du selbst an, sobald du
deine Fotos/Videos vom Night Run hast (siehe "Was zuerst anpassen" unten).

## Was neu ist in diesem Update

- **Keine externen Verbindungen mehr:** Schriften (Space Grotesk, Inter) und die
  Animationsbibliothek GSAP liegen jetzt im Projekt statt bei Google bzw. einem
  CDN. Beim Seitenaufruf geht dadurch keine IP-Adresse der Besucher nach außen —
  in Deutschland ein echtes Abmahnrisiko weniger. Nebenbei lädt die Seite schneller.
- **Kontaktformular** statt nur Mail-Link, inklusive Einwilligungs-Häkchen,
  Spam-Falle und Rückmeldung ohne Seitenwechsel. Muss noch mit einem Access Key
  scharf geschaltet werden (Anleitung steht als Kommentar in `index.html`).
- **Instagram** (@onside.hq) im Footer, im Kontaktbereich und im Impressum verlinkt.
- **Impressum und Datenschutz** mit den echten Daten gefüllt.

## Wo welche Bilder hinkommen

Lege dafür einen Ordner `assets/` an. In `index.html` steht an jeder Stelle ein
Kommentar (BILD 1 bis BILD 8) mit genau dieser Info:

| # | Datei | Wo auf der Seite |
|---|-------|------------------|
| 1 | `assets/projects/berlin-night-run/cover.jpg` | Großes Titelbild über "Night Run" |
| 2-6 | `assets/projects/berlin-night-run/01.jpg` … `05.jpg` | Die fünf Carousel-Bilder |
| 7 | `assets/team/julian.jpg` | Gründerkarte Julian |
| 8 | `assets/team/malte.jpg` | Gründerkarte Malte |
| 9 | `assets/og-image.jpg` | Vorschaubild beim Teilen des Links (1200 × 630 px) |

Am Code muss dafür nichts geändert werden: Liegt die Datei mit genau diesem
Namen im Repo, erscheint das Foto automatisch über dem Platzhalter. Details und
Stolperfallen (Dateinamen, Komprimieren) stehen in `BILDER.md`.

Die großflächigen Bild-Breaks zwischen den Abschnitten gibt es nicht mehr —
an ihrer Stelle stehen jetzt das Laufband und die Animation im Hero.

## Lokal ansehen

Keine Installation nötig. Einfach `index.html` per Doppelklick im Browser öffnen,
oder für eine saubere lokale Vorschau mit Live-Reload:

1. VS Code installieren (falls noch nicht vorhanden): https://code.visualstudio.com
2. Erweiterung "Live Server" installieren (im VS Code Marketplace)
3. Rechtsklick auf `index.html` → "Open with Live Server"

Jede Änderung an den Dateien ist dann sofort im Browser sichtbar.

## Was zuerst anpassen

1. **Farbe:** `css/styles.css` → `--accent` **und** `--accent-rgb` ganz oben
   gemeinsam auf eure Markenfarbe setzen (die Hero-Animation liest `--accent-rgb`).
2. **Hero-Animation:** `js/script.js` ganz oben bei `SETTINGS` —
   `spacing` (wie dicht das Publikum steht), `bpm` (Takt der Wellen),
   `waveSpeed` (Tempo der Welle), `waveWidth` (wie weich die Front ist),
   `grow` + `lift` (wie heftig die Punkte reagieren).
3. **Bilder:** siehe Tabelle oben.
4. **Texte:** in `index.html` direkt im Text ändern.

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
