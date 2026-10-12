# Bilder

Alle Bilder liegen im Ordner `assets/`. Zum Austauschen müsst ihr am Code meist
nichts ändern: Eine neue Datei mit genau demselben Namen am selben Ort ersetzt die
alte. Fehlt eine Datei, läuft an ihrer Stelle eine Animation.

## Startbildschirm (Startseite ganz oben)

Die Fotos, die dort nacheinander mit Blitz erscheinen, stehen als Liste in
`js/config.js` unter `startbild` – mit Bildunterschrift und Bildausschnitt.
`breit` gilt für Laptop und Tablet, `handy` fürs Handy. Ein Foto tauschen oder
ergänzen: in der Liste den Dateipfad und den Text ändern.

Das erste Foto steht zusätzlich in `index.html` (Abschnitt HERO): `01.jpg` für
breite Bildschirme (`data-src`), `hoch-01.jpg` fürs Handy (`data-srcset`). Es
lädt direkt nach dem ersten Aufbau der Seite, damit Überschrift und Buttons
sofort stehen.

## Night Run (`assets/projects/berlin-night-run/`)

| Datei | Wo auf der Seite | Format | Motiv |
|-------|------------------|--------|-------|
| `cover.jpg` | Projekt-Kasten auf der Startseite, Projekte-Übersicht, oben auf der Projektseite, Startbildschirm | quer 3:2 | Läufer bei Nacht mit Lichtspuren (aus „Bild4“) |
| `01.jpg` | Startbildschirm (erstes Foto), Carousel Startseite, großes Galeriebild, Regler auf der Projektseite | quer 3:2 | Die Laufgruppe unterwegs (aus „Bild3“) |
| `02.jpg` | Startbildschirm, Carousel + Galerie | quer 3:2 | Trinkpause (aus „Bild7“) |
| `03.jpg` | Startbildschirm, Carousel + Galerie | quer 3:2 | Der DJ am Pult (aus „Bild6“) |
| `04.jpg` | Startbildschirm, Carousel + Galerie | quer 3:2 | Die Crowd (aus „Bild 11“) |
| `05.jpg` | Startbildschirm, Carousel + Galerie | quer 3:2 | Anstoßen am Abend (aus „Bild9“) |
| `06.jpg` | Startbildschirm (Handy), Galerie | hoch 4:5 | DJ auf dem Lastenrad (aus „Bild10“) |
| `07.jpg` | Startbildschirm (Handy), Galerie | hoch 4:5 | Hände am DJ-Pult (aus „Bild12“) |
| `08.jpg` | Startbildschirm (Handy), Galerie | hoch 4:5 | Erfrischung unterwegs (aus „Bild2“) |
| `09.jpg` | Startbildschirm (Handy), Galerie | hoch 4:5 | Getränkespender (aus „Bild13“) |
| `10.jpg` | Galerie | hoch 4:5 | Becher (aus „Bild5“) |
| `11.jpg` | Startbildschirm (Handy), Galerie | hoch 4:5 | Stimmung vor der Bar (aus „Bild1“) |
| `12.jpg` | Startbildschirm, Galerie | quer 3:2 | Drinks an der Straßenecke (aus „Bild8“) |
| `13.jpg` | Startbildschirm, Galerie | quer 3:2 | Gute Laune bei Nacht (aus „Bild 14“) |
| `hoch-01.jpg`, `hoch-cover.jpg`, `hoch-13.jpg` | Startbildschirm am Handy | hoch 4:5 | Hochformat-Ausschnitte von 01, cover und 13 (laden am Handy schneller) |
| `plan.jpg` | Regler „Der Plan dahinter“ auf der Projektseite | quer 3:2 | Planskizze, aus `01.jpg` erzeugt |

`plan.jpg` passt nur zu `01.jpg`: Die Linien zeichnen genau die Personen auf
diesem Foto nach. Wer `01.jpg` austauscht, braucht auch eine neue Planskizze.

## Leistungen

Die Bilder zu den drei Leistungen (Startseite und Leistungen-Seite) sind keine
Fotos, sondern kleine, gebaute Arbeitsproben aus HTML und CSS: ein Ablaufplan,
ein Brand-Board und ein Handy mit Redaktionsplan. Sie laden sofort und passen
zu jedem Projekt. Die Texte darin stehen direkt in `index.html` und
`leistungen.html` (Suche nach `vg-`), das Aussehen in `css/styles.css` bei `.vg`.

## Team (`assets/team/`)

| Datei | Wo auf der Seite | Format |
|-------|------------------|--------|
| `julian.jpg` | Gründerkarte Julian (Startseite und „Wer sind wir?“) | quadratisch 1:1 |
| `malte.jpg` | Gründerkarte Malte | quadratisch 1:1 |

## Vorschaubilder beim Teilen

| Datei | Wofür |
|-------|-------|
| `assets/og-image.jpg` | Vorschau, wenn ein Link zur Seite bei WhatsApp, Instagram oder LinkedIn geteilt wird (1200 × 630 px): Night-Run-Foto mit „We build what people want to be part of.“ |
| `assets/og-night-run.jpg` | Vorschau für den Link zur Night-Run-Seite (1200 × 630 px) |

## Ein Foto austauschen

- Neue Datei mit demselben Namen hochladen, sie ersetzt die alte. Das Format aus
  der Tabelle beibehalten (quer, hoch oder quadratisch), sonst schneidet die Seite
  mehr ab als nötig.
- Mindestens 1800 px breit bei Querformat, 1080 px bei Hochformat und Team-Fotos.
- Das Wichtige gehört in die Bildmitte. Je nach Bildschirm schneidet die Seite
  oben und unten oder links und rechts etwas ab: Das Carousel zeigt die Bilder
  am Handy im Hochformat (4:5), das große Galeriebild ist sehr breit.
- Titelbild: In `index.html`, `projekte.html` und `berlin-night-run.html` steht
  beim Titelbild `object-position: 34% 50%`. Das rückt den Ausschnitt am Handy
  etwas nach links, weil der Läufer im aktuellen Foto links der Mitte ist. Bei
  einem neuen Titelbild mit mittigem Motiv dort `50% 50%` eintragen.
- Ein zusätzliches Galeriebild: in `berlin-night-run.html` im Abschnitt „Galerie“
  ein Feld kopieren und die Dateinummer anpassen. Hochformat-Felder tragen die
  Klasse `case-gallery__item--tall`.
- Browser speichern Fotos bis zu einer Woche zwischen. Ein ausgetauschtes Foto
  kann also bei Besuchern, die schon mal da waren, etwas später erscheinen.

## Worauf es ankommt

- Dateinamen exakt so schreiben, alles klein, Endung `.jpg`. Also nicht `01.JPG`,
  nicht `01.jpeg` und kein `.heic` vom iPhone (umbenennen reicht nicht, das Foto
  muss als JPG exportiert werden). Der Server nimmt Groß- und Kleinschreibung genau.
- Die Ordner genau so verschachteln wie oben.

## Vor dem Hochladen komprimieren

Fotos direkt aus der Kamera sind schnell 5–20 MB groß, das macht die Seite
langsam. Vorher durch [squoosh.app](https://squoosh.app) schicken (kostenlos,
läuft im Browser) und auf grob 150–400 KB pro Bild bringen. Bei diesen Größen
sieht man keinen Qualitätsunterschied. Alle Fotos oben sind bereits so
aufbereitet, Standortdaten sind entfernt.
