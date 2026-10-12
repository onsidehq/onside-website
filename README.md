# onside.hq – Website

Gebaut mit purem HTML, CSS und JavaScript (plus GSAP für das Einblenden beim
Scrollen). Kein Baukasten, nichts muss umgewandelt werden: Was im Ordner liegt, ist die Seite.

## Die Seiten

| Datei | Was drauf ist |
|-------|---------------|
| `index.html` | Startseite: Hero, Projekt-Teaser, Laufband, Leistungen, Wer sind wir, Warum onside, Kontakt |
| `projekte.html` | Übersicht aller Projekte |
| `berlin-night-run.html` | Projektseite Night Run – zugleich die Vorlage für jedes weitere Projekt |
| `leistungen.html` | Die drei Leistungen ausführlich + Ablauf einer Zusammenarbeit |
| `ueber-uns.html` | Wer sind wir?, Geschichte, Warum onside |
| `kontakt.html` | Formular und Kontaktwege |
| `impressum.html`, `datenschutz.html` | Rechtliches |
| `404.html` | Erscheint, wenn jemand eine Adresse aufruft, die es nicht gibt |

## Struktur

```
├── index.html, projekte.html, …   ← die Seiten (siehe oben)
├── css/
│   └── styles.css      ← alles Visuelle. Farben stehen ganz oben als Variablen.
├── js/
│   ├── config.js       ← eure Einstellungen (Formular-Key). Die eine Datei zum Eintragen.
│   ├── visuals.js      ← alles, was gezeichnet und animiert wird
│   ├── script.js       ← Bedienung: Menü, Carousel, Laufband, Formular
│   ├── gsap.min.js, ScrollTrigger.min.js   ← Animationsbibliothek, lokal
├── fonts/              ← selbst gehostete Schriften (nicht löschen)
├── assets/             ← eure Bilder (siehe BILDER.md)
├── favicon.ico, favicon-512.png, apple-touch-icon.png   ← müssen ganz oben im Ordner liegen
├── robots.txt, sitemap.xml   ← helfen Suchmaschinen, alle Seiten zu finden
├── BILDER.md           ← welches Foto wo auf der Seite liegt
└── README.md
```

Navigation und Footer stehen in jeder HTML-Datei gleich. Wenn ihr dort etwas
ändert (z. B. einen neuen Menüpunkt), muss das in allen neun HTML-Dateien
passieren – jeweils in der Navigationsleiste, im Vollbild-Menü und im Footer.

## Kontaktformular scharf schalten

Das Formular verschickt Anfragen über den Dienst Web3Forms an eure Mailadresse.
Dafür braucht es einmalig einen "Access Key":

1. [web3forms.com](https://web3forms.com) öffnen und eure Mailadresse eintragen
2. Ihr bekommt per Mail einen Access Key
3. `js/config.js` öffnen und den Key statt `DEIN-ACCESS-KEY-HIER` eintragen
   (die Anführungszeichen davor und dahinter bleiben stehen), speichern, hochladen

Der Key gilt dann für das Formular auf der Startseite und auf der Kontaktseite.
Solange er fehlt, zeigt das Formular beim Absenden einen Hinweis mit eurer
Mailadresse. Ein Klick darauf öffnet eine Mail, in der das schon Geschriebene steht.

## Bilder

Überall, wo ein Foto fehlt, läuft eine Animation. Sobald die passende Datei im
Ordner `assets/` liegt, ersetzt das Foto die Animation von selbst – am Code
muss nichts geändert werden. Welche Datei wohin gehört, steht in `BILDER.md`.

## Die Animationen

Alles wird live im Browser gezeichnet, es gibt keine Videos.

- **Hintergrund (ganze Seite):** das Punktfeld "Crowd & Beat". Es reagiert auf
  die Maus, und jeder Klick oder jedes Tippen schickt eine Welle los.
- **Szenen:** in jeder Fläche, in der später ein Foto liegt (Lichtspuren, Route,
  Balken, Lichter …), auf den Leistungskarten und in der Taktiktafel bei
  "Warum onside?".
- **Handgezeichnete Striche:** unter bzw. um einzelne Wörter in Überschriften.

Anpassen:

- Tempo und Stärke: `SETTINGS` ganz oben in `js/visuals.js`
  (`bpm` = Takt, `spacing` = Dichte der Punkte, `calm` = Stärke des Hintergrunds
  unterhalb des Heros).
- Eine Szene irgendwo einsetzen: `<canvas data-scene="trails"></canvas>` in ein
  Element mit der Klasse `viz`. Verfügbar: `trails`, `route`, `eq`, `crowd`,
  `bokeh`, `rings`, `focus`, `network`, `orbits`, `signal`, `contour`, `offside`.
  Mit `data-seed="7"` (beliebige Zahl) bekommt man eine andere Variante.
- Einen Strich unter ein Wort setzen:
  `<span class="scribble" data-scribble="underline">Wort</span>`
  (oder `data-scribble="circle"` für einen Kringel).

Wer am Gerät "Bewegung reduzieren" eingeschaltet hat, sieht Standbilder statt
Animationen. Auf schwächeren Geräten schalten die Animationen automatisch auf
eine niedrigere Bildrate, damit die Seite flüssig bleibt.

## Was zuerst anpassen

1. **Farben:** `css/styles.css` ganz oben. Für die Akzentfarbe `--accent` **und**
   `--accent-rgb` gemeinsam ändern, für die Textfarben `--text`, `--text-soft`,
   `--text-muted`.
2. **Texte:** direkt in der jeweiligen HTML-Datei ändern.
3. **Eckdaten Night Run:** in `berlin-night-run.html` im Abschnitt "Eckdaten".
   Die Namen der Stopps auf der gezeichneten Route stehen dort im Attribut
   `data-labels` (aktuell "Start | Stopp 1 | Stopp 2 | Stopp 3 | Afterparty").

## Ein neues Projekt anlegen

1. `berlin-night-run.html` kopieren und umbenennen (z. B. `mein-projekt.html`)
2. Ganz oben in der neuen Datei (im `<head>`) Titel, Beschreibung, `canonical`
   und `og:url` auf das neue Projekt ändern – sonst steht dort weiter "Night Run"
3. Texte austauschen, Bildpfade auf einen neuen Ordner unter `assets/projects/` zeigen lassen
4. In `projekte.html` eine Projekt-Karte kopieren und auf die neue Seite verlinken
5. In `sitemap.xml` eine Zeile für die neue Seite ergänzen

## Lokal ansehen

`index.html` per Doppelklick im Browser öffnen. Für eine Vorschau mit
automatischem Neuladen:

1. VS Code installieren: https://code.visualstudio.com
2. Erweiterung "Live Server" installieren
3. Rechtsklick auf `index.html` → "Open with Live Server"

## Online stellen (onsidehq.de)

Die Seite liegt bei **Cloudflare Pages** und wird direkt aus dem
GitHub-Repository veröffentlicht: Alles, was ihr dort hochladet, ist kurz darauf online. Beim Hochladen
die Ordnerstruktur beibehalten (also `css/`, `js/`, `fonts/`, `assets/` als
Ordner, nicht die Dateien einzeln ins Hauptverzeichnis).

## Weiterlernen

- HTML/CSS-Grundlagen: [freeCodeCamp – Responsive Web Design](https://www.freecodecamp.org/learn/2022/responsive-web-design/)
- Scroll-Animationen: [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- Nachschlagewerk: [MDN Web Docs](https://developer.mozilla.org/de/)
