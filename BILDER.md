# Bilder, die noch fehlen

Alle Bilder kommen in einen Ordner `assets/` im Projekt. Am Code musst du dafür
nichts ändern: Sobald eine Datei mit genau dem richtigen Namen am richtigen Ort
liegt, erscheint sie auf der Seite automatisch über dem Platzhalter. Fehlt sie,
bleibt der Platzhalter stehen.

| # | Datei | Wo auf der Seite | Format / Hinweis |
|---|-------|------------------|------------------|
| 1 | `assets/projects/berlin-night-run/cover.jpg` | Großes Titelbild über "Night Run" | quer, mind. 1600 px breit — das stärkste Bild vom Event |
| 2 | `assets/projects/berlin-night-run/01.jpg` | Carousel, Bild 1 | quer, mind. 1600 px breit |
| 3 | `assets/projects/berlin-night-run/02.jpg` | Carousel, Bild 2 | quer |
| 4 | `assets/projects/berlin-night-run/03.jpg` | Carousel, Bild 3 | quer |
| 5 | `assets/projects/berlin-night-run/04.jpg` | Carousel, Bild 4 | quer |
| 6 | `assets/projects/berlin-night-run/05.jpg` | Carousel, Bild 5 | quer |
| 7 | `assets/team/julian.jpg` | Gründerkarte Julian | Seitenverhältnis 4:3, Gesicht nicht ganz am Rand |
| 8 | `assets/team/malte.jpg` | Gründerkarte Malte | Seitenverhältnis 4:3, am besten gleiche Bildsprache wie Julians Foto |
| 9 | `assets/og-image.jpg` | Vorschaubild beim Teilen des Links (WhatsApp, Instagram, LinkedIn) | genau 1200 × 630 px, Logo/Claim mittig, Rand frei lassen |

## Worauf es ankommt

- Dateinamen exakt so schreiben, alles klein, Endung `.jpg`. Also nicht `01.JPG`,
  nicht `01.jpeg` und kein `.heic` vom iPhone. Der Server nimmt Groß- und
  Kleinschreibung genau.
- Die Ordner genau so verschachteln wie in der Tabelle.

## Vor dem Hochladen komprimieren

Fotos direkt aus der Kamera sind schnell 5–10 MB groß, das macht die Seite
langsam. Vorher durch [squoosh.app](https://squoosh.app) schicken (kostenlos,
läuft im Browser) und auf grob 200–400 KB pro Bild runterdrücken. Qualität
sieht man bei diesen Größen nicht.
