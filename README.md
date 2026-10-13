# onside.hq – Website

Gebaut mit purem HTML, CSS und JavaScript, ganz ohne Bibliotheken. Kein Baukasten,
nichts muss umgewandelt werden: Was im Ordner liegt, ist die Seite.

## Die Seiten

| Datei | Was drauf ist |
|-------|---------------|
| `index.html` | Startseite: Startbildschirm mit Fotos, Projekt-Teaser, Laufband, Leistungen, Wer sind wir, Warum onside, Fragen (FAQ), Kontakt |
| `projekte.html` | Übersicht aller Projekte |
| `berlin-night-run.html` | Projektseite Night Run mit dem Regler „Der Plan dahinter“ – zugleich die Vorlage für jedes weitere Projekt |
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
│   ├── config.js       ← eure Einstellungen: Formular-Key und Fotos des Startbildschirms
│   ├── visuals.js      ← alles, was gezeichnet und animiert wird
│   └── script.js       ← Bedienung: Einblenden, Menü, Laufband, Formular, Startbildschirm, Regler
├── fonts/              ← selbst gehostete Schriften, auf das Nötige verkleinert (nicht löschen)
├── assets/             ← eure Bilder (siehe BILDER.md)
├── favicon.ico, favicon-512.png, apple-touch-icon.png   ← müssen ganz oben im Ordner liegen
├── robots.txt, sitemap.xml   ← helfen Suchmaschinen, alle Seiten zu finden
├── _headers           ← Sicherheits- und Cache-Regeln für Cloudflare (nicht löschen)
├── BILDER.md           ← welches Foto wo auf der Seite liegt
└── README.md
```

Navigation und Footer stehen in jeder HTML-Datei gleich. Wenn ihr dort etwas
ändert (z. B. einen neuen Menüpunkt), muss das in allen neun HTML-Dateien
passieren – jeweils in der Navigationsleiste, im Vollbild-Menü und im Footer.
Der Menüpunkt „FAQ“ springt auf der Startseite zum Abschnitt „Fragen“.

## Kontaktformular

Das Formular verschickt Anfragen über den Dienst Web3Forms an die Mailadresse,
mit der ihr den "Access Key" angelegt habt. Der Key steht bereits in
`js/config.js` und gilt für das Formular auf der Startseite und auf der
Kontaktseite.

- Im Betreff der Mail stehen Name und Auswahl, z. B. "Neue Anfrage von Lea
  (Event, Social Media)". Auf "Antworten" klicken schreibt direkt an die Person.
- Die Auswahl "Was braucht ihr?" steht in beiden HTML-Dateien im Formular
  (Suche nach `class="chip"`). Eine Option ändern: Text in `value="..."` und im
  `<span>` gleich ändern.
- Andere Empfänger-Adresse: auf [web3forms.com](https://web3forms.com) mit der
  neuen Adresse einen neuen Key anlegen und in `js/config.js` austauschen.
- Klappt das Senden einmal nicht, zeigt das Formular einen Mail-Link an
  team@onsidehq.de, in dem das schon Geschriebene steht. Es geht also nichts
  verloren.

Testen: Nach dem Hochladen einmal selbst eine Anfrage schicken. Die erste Mail
von Web3Forms landet manchmal im Spam-Ordner, dann als "Kein Spam" markieren.

## Bilder

Überall, wo ein Foto fehlt, läuft eine Animation. Sobald die passende Datei im
Ordner `assets/` liegt, ersetzt das Foto die Animation von selbst – am Code
muss nichts geändert werden. Welche Datei wohin gehört, steht in `BILDER.md`.

## Der Startbildschirm

Auf der Startseite laufen Fotos vom Night Run nacheinander durch und blenden
ruhig ineinander über. Die Fotos stehen als Liste in `js/config.js` unter
`startbild`:

- `breit` für Bildschirme im Querformat (Dateien `start-quer-....jpg`),
  `handy` für Hochformat wie Handy und Tablet hochkant (`start-hoch-....jpg`)
- pro Foto: Datei, Bildunterschrift, Bildausschnitt
- `sekunden`: wie lange ein Foto stehen bleibt

Das erste Foto steht zusätzlich in `index.html`: im Kopf (zwei Zeilen
`preload`, damit es sofort lädt) und im Abschnitt HERO (`src` beim Bild,
`srcset` beim `<source>` davor). Wer das erste Foto tauscht, ändert es an
allen Stellen.

## Die Animationen

Fast alles wird live im Browser gezeichnet, es gibt keine Videos.

- **Hintergrund der Unterseiten:** das Punktfeld "Crowd & Beat" im Seitenkopf.
  Es reagiert auf die Maus. Weiter unten auf der Seite bleibt es als ruhiges
  Standbild stehen, das schont den Akku. Auf der Startseite gibt es kein
  Punktfeld, dort sind die Fotos der Hintergrund.
- **Szenen:** Flächen, in denen ein Foto fehlt, zeigen eine Animation
  (Lichtspuren, Route, Balken, Lichter …), außerdem die Taktiktafel bei
  "Warum onside?" und die gezeichnete Route auf der Projektseite.
- **Handgezeichnete Striche:** unter bzw. um einzelne Wörter in Überschriften.

Anpassen:

- Tempo und Stärke: `SETTINGS` ganz oben in `js/visuals.js`
  (`bpm` = Takt, `spacing` = Dichte der Punkte, `calm` = Stärke des Hintergrunds
  unterhalb des Seitenkopfs).
- Eine Szene irgendwo einsetzen: `<canvas data-scene="trails"></canvas>` in ein
  Element mit der Klasse `viz`. Verfügbar: `trails`, `route`, `eq`, `crowd`,
  `bokeh`, `rings`, `focus`, `network`, `orbits`, `signal`, `contour`, `offside`.
  Mit `data-seed="7"` (beliebige Zahl) bekommt man eine andere Variante.
- Einen Strich unter ein Wort setzen:
  `<span class="scribble" data-scribble="underline">Wort</span>`
  (oder `data-scribble="circle"` für einen Kringel).

Wer am Gerät "Bewegung reduzieren" eingeschaltet hat, sieht Standbilder statt
Animationen, und der Startbildschirm bleibt beim ersten Foto stehen. Auf schwächeren Geräten schalten die Animationen
automatisch auf eine niedrigere Bildrate, damit die Seite flüssig bleibt.

## Was zuerst anpassen

1. **Farben:** `css/styles.css` ganz oben. Für die Akzentfarbe `--accent` **und**
   `--accent-rgb` gemeinsam ändern, für die Textfarben `--text`, `--text-soft`,
   `--text-muted`.
2. **Texte:** direkt in der jeweiligen HTML-Datei ändern.
3. **Eckdaten Night Run:** in `berlin-night-run.html` im Abschnitt "Eckdaten"
   und auf der Startseite unter dem Projekttext (`project__facts`).
4. **Fragen (FAQ):** direkt in `index.html` im Abschnitt "05 — FRAGEN". Ändert
   ihr eine Antwort, bitte auch oben im `<head>` im Block "FAQPage" ändern (für
   Suchmaschinen).
   Die Namen der Stopps auf der gezeichneten Route stehen in `berlin-night-run.html`
   im Attribut `data-labels` (aktuell "Start | Stopp 1 | Stopp 2 | Stopp 3 | Afterparty").

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

Wer `css/styles.css` oder eine Datei in `js/` ändert, zählt in allen HTML-Dateien
die Versionsnummer hinter dem Dateinamen eins hoch (`styles.css?v=10` → `?v=11`).
Sonst zeigen manche Browser noch einen Tag lang die alte Fassung.

## Weiterlernen

- HTML/CSS-Grundlagen: [freeCodeCamp – Responsive Web Design](https://www.freecodecamp.org/learn/2022/responsive-web-design/)
- Einblenden beim Scrollen: [Intersection Observer (MDN)](https://developer.mozilla.org/de/docs/Web/API/Intersection_Observer_API)
- Nachschlagewerk: [MDN Web Docs](https://developer.mozilla.org/de/)
