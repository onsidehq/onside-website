# Bilder

Alle Bilder liegen im Ordner `assets/`. Zum Austauschen müsst ihr am Code meist
nichts ändern: Eine neue Datei mit genau demselben Namen am selben Ort ersetzt die
alte. Fehlt eine Datei, läuft an ihrer Stelle eine Animation.

**Grundregel:** Jedes Foto steht höchstens zweimal auf der ganzen Website und nie
zweimal auf derselben Seite. Wer neue Fotos einbaut, hält es am besten genauso.

## Startbildschirm (Startseite ganz oben)

Die Fotos, die dort nacheinander ruhig ineinander überblenden, stehen als Liste
in `js/config.js` unter `startbild`, mit Bildunterschrift und Bildausschnitt.
`breit` gilt für Bildschirme im Querformat (Laptop, Tablet quer), `handy` für
Bildschirme im Hochformat (Handy, Tablet hochkant). Ein Foto tauschen oder
ergänzen: in der Liste den Dateipfad und den Text ändern.

Das erste Foto steht zusätzlich in `index.html` (im Kopf und im Abschnitt HERO),
damit es sofort lädt: `start-quer-1.jpg` für Querformat, `start-hoch-1.jpg` für
Hochformat.

Auf dem Startbildschirm liegt der Text links unten. Gute Fotos dafür haben das
Wichtige in der Mitte oder rechts und in der oberen Hälfte.

## Night Run (`assets/projects/berlin-night-run/`)

Alle Fotos stammen vom Shooting beim Berlin Night Run (Ordner „Bilder Basti“).
In der letzten Spalte steht das Original, aus dem der Ausschnitt gemacht ist.

| Datei | Wo auf der Seite | Format | Motiv | Original |
|-------|------------------|--------|-------|----------|
| `cover.jpg` | Projekt-Kasten auf der Startseite, ganz oben auf der Projektseite | quer 3:2 | Läufer bei Nacht mit Lichtspuren | – |
| `01.jpg` | Projekte-Übersicht, Regler „Der Plan dahinter“ auf der Projektseite | quer 3:2 | Die Laufgruppe unterwegs | – |
| `hoch-01.jpg`, `hoch-cover.jpg` | dieselben Stellen wie `01.jpg` und `cover.jpg`, aber am Handy | hoch 4:5 | Hochformat-Ausschnitte (laden am Handy schneller) | – |
| `plan.jpg` | Regler „Der Plan dahinter“ auf der Projektseite | quer 3:2 | Planskizze, aus `01.jpg` erzeugt | – |
| `start-quer-1.jpg` | Startbildschirm quer, erstes Foto | quer 3:2 | Gute Laune auf der Strecke | DSC05668 |
| `start-quer-2.jpg` | Startbildschirm quer | quer 3:2 | Durch den Kiez | DSC05531 |
| `start-quer-3.jpg` | Startbildschirm quer | quer 3:2 | Quer durch Berlin | DSC05576 |
| `start-quer-4.jpg` | Startbildschirm quer | quer 3:2 | Rein in die Nacht (etwas aufgehellt) | DSC06523 |
| `start-quer-5.jpg` | Startbildschirm quer | quer 3:2 | Alle Lichter an (etwas aufgehellt) | DSC06089 |
| `start-hoch-1.jpg` | Startbildschirm hochkant, erstes Foto | hoch 4:5 | Gute Laune auf der Strecke | DSC05658 |
| `start-hoch-2.jpg` | Startbildschirm hochkant | hoch 4:5 | Volle Energie | DSC05534 |
| `start-hoch-3.jpg` | Startbildschirm hochkant | hoch 4:5 | Hier kommt die Crowd | DSC05697 |
| `start-hoch-4.jpg` | Startbildschirm hochkant | hoch 4:5 | Warm-up vor dem Start | DSC05433 |
| `start-hoch-5.jpg` | Startbildschirm hochkant | hoch 4:5 | Snackpause mit HEJ Natural | DSC06846 |
| `galerie-01.jpg` | Galerie, breites Bild oben | quer 3:2 | Treffpunkt unter der Brücke | DSC05594 |
| `galerie-02.jpg` | Galerie | hoch 4:5 | Malte gibt das Briefing vor dem Start | DSC05412 |
| `galerie-03.jpg` | Galerie | hoch 4:5 | Red-Bull-Dosen zwischen Laufschuhen | DSC05390 |
| `galerie-04.jpg` | Galerie | hoch 4:5 | Die Gruppe läuft durch den Kiez | DSC05712 |
| `galerie-05.jpg` | Galerie | quer 3:2 | Drei Läufer mit Red Bull vor dem Start | DSC05339 |
| `galerie-06.jpg` | Galerie | quer 3:2 | Das Red-Bull-Lastenrad mit DJ | DSC05687 |
| `galerie-07.jpg` | Galerie | hoch 4:5 | Tempo an der Graffitiwand | DSC05624 |
| `galerie-08.jpg` | Galerie | hoch 4:5 | Verpflegung an einer Station | DSC05785 |
| `galerie-09.jpg` | Galerie | hoch 4:5 | Zwischenstopp vor einer Bar | DSC05806 |
| `galerie-10.jpg` | Galerie | quer 3:2 | Die Kamera läuft mit | DSC05820 |
| `galerie-11.jpg` | Galerie | quer 3:2 | Malte mit dem Megafon im Ziel | DSC06726 |
| `galerie-12.jpg` | Galerie | hoch 4:5 | Läuferin mit Reflektoren in der Nacht | DSC06039 |
| `galerie-13.jpg` | Galerie | hoch 4:5 | Malte mit den Riegeln von HEJ Natural | DSC06841 |
| `galerie-14.jpg` | Galerie | hoch 4:5 | Afterparty mit Sonnenbrillen | DSC06472 |
| `galerie-15.jpg` | Galerie, breites Bild unten | quer 3:2 | Gruppenfoto am Ende der Nacht | DSC06716 |

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
| `malte.jpg` | Gründerkarte Malte (Startseite und „Wer sind wir?“): Malte mit Megafon beim Night Run (DSC06699) | quadratisch 1:1 |

Im HTML steht `malte.jpg?v=2`. Die Zahl sorgt dafür, dass Browser ein neues Foto
sofort laden statt das alte aus dem Zwischenspeicher. Wer das Foto wieder
austauscht, erhöht sie in `index.html` und `ueber-uns.html` auf `?v=3`.

## Vorschaubilder beim Teilen

| Datei | Wofür |
|-------|-------|
| `assets/og-image.jpg` | Vorschau, wenn ein Link zur Seite bei WhatsApp, Instagram oder LinkedIn geteilt wird (1200 × 630 px): Night-Run-Foto mit „We build what people want to be part of.“ |
| `assets/og-night-run.jpg` | Vorschau für den Link zur Night-Run-Seite (1200 × 630 px) |

## Bildausschnitt: Was vom Foto zu sehen ist

Je nach Bildschirm schneidet die Seite oben und unten oder links und rechts etwas
ab. Damit das Wichtige im Bild bleibt, ist an diesen Stellen ein Ausschnitt
gesetzt:

- **Startbildschirm:** `ausschnitt` in `js/config.js`
- **Titelbild, Projekte-Übersicht, breite Galeriebilder:** `object-position` direkt
  beim Bild im HTML

Beides funktioniert gleich: erste Zahl links/rechts (0% = ganz links, 100% = ganz
rechts), zweite Zahl oben/unten (0% = ganz oben). `50% 50%` ist die Mitte. Sitzt
das Motiv in einem neuen Foto woanders, hier die Zahlen anpassen.

## Ein Foto austauschen

- Neue Datei mit demselben Namen hochladen, sie ersetzt die alte. Das Format aus
  der Tabelle beibehalten (quer, hoch oder quadratisch), sonst schneidet die Seite
  mehr ab als nötig.
- Mindestens 1800 px breit bei Querformat, 1080 px bei Hochformat und Team-Fotos.
- Das Wichtige gehört möglichst in die Bildmitte, beim Startbildschirm eher in die
  obere Hälfte: Unten steht dort der Text.
- Ein zusätzliches Galeriebild: in `berlin-night-run.html` im Abschnitt „Galerie“
  ein Feld kopieren und den Dateinamen anpassen. Hochformat-Felder tragen die
  Klasse `case-gallery__item--tall`, breite Felder `case-gallery__item--wide`.
  Querformate stehen immer zu zweit, Hochformate zu dritt. Das dritte
  Hochformat einer Gruppe trägt zusätzlich `case-gallery__item--solo`: Am Handy
  stehen Hochformate zu zweit, dieses eine geht dort über die ganze Breite.
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
