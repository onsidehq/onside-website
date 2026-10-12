/* ==========================================================================
   onside.hq — Einstellungen
   Die eine Datei, in der ihr etwas eintragen oder ändern müsst.
   ========================================================================== */
window.ONSIDE = {
  /* Web3Forms Access Key für das Kontaktformular.
     1. web3forms.com öffnen und eure Mailadresse eintragen
     2. Ihr bekommt per Mail einen "Access Key"
     3. Den Key hier unten statt DEIN-ACCESS-KEY-HIER einsetzen
        (die Anführungszeichen davor und dahinter bleiben stehen)
     Er gilt dann für das Formular auf der Startseite und auf der Kontaktseite. */
  formKey: '62f765b2-361f-467b-a7b5-b3a77a3bfe82',

  /* Startbildschirm: Diese Fotos laufen nacheinander durch und blenden ruhig
     ineinander über.
     - "bild": Pfad zur Datei
     - "text": die Bildunterschrift
     - "ausschnitt": welcher Teil des Fotos zu sehen ist. Erste Zahl links/rechts,
       zweite oben/unten. "50% 50%" ist die Mitte, "30% 50%" etwas weiter links.
       Um genau diesen Punkt zoomt das Foto auch ganz langsam.
     "breit" gilt für Bildschirme im Querformat (Laptop, Tablet quer), dafür
     sind die Dateien "start-quer-..." (3:2). "handy" gilt für Bildschirme im
     Hochformat (Handy, Tablet hochkant), dafür sind die Dateien
     "start-hoch-..." (4:5). Die Nummer im Dateinamen ist das Originalfoto
     (dsc = Ordner BNR BILDER 1, ld = Ordner BNR BILDER 2 bis 5).
     Ein neues Foto bekommt immer einen neuen Dateinamen, dann zeigen auch
     Browser, die die Seite schon kennen, sofort das neue Bild.
     Das erste Foto jeder Liste steht zusätzlich in index.html (Abschnitt HERO),
     damit es sofort lädt. Wer es tauscht, tauscht es an beiden Stellen.
     Bitte keine Fotos nehmen, die auf der Startseite schon woanders stehen
     (cover.jpg ist das Titelbild im Projekt-Kasten). */
  startbild: {
    breit: [
      { bild: 'assets/projects/berlin-night-run/start-quer-dsc5668.jpg', text: 'Gute Laune auf der Strecke', ausschnitt: '50% 40%' },
      { bild: 'assets/projects/berlin-night-run/start-quer-ld3717.jpg', text: 'Malte gibt den Takt vor', ausschnitt: '50% 0%' },
      { bild: 'assets/projects/berlin-night-run/start-quer-ld3921.jpg', text: 'Der DJ fährt mit', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/start-quer-ld5222.jpg', text: 'Rein in die Nacht', ausschnitt: '50% 35%' },
      { bild: 'assets/projects/berlin-night-run/start-quer-dsc6089.jpg', text: 'Alle Lichter an', ausschnitt: '50% 45%' },
    ],
    handy: [
      { bild: 'assets/projects/berlin-night-run/start-hoch-dsc5658.jpg', text: 'Gute Laune auf der Strecke', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/start-hoch-dsc5433.jpg', text: 'Warm-up vor dem Start', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/start-hoch-dsc5534.jpg', text: 'Volle Energie', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/start-hoch-ld3913.jpg', text: 'Der DJ fährt mit', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/start-hoch-dsc6846.jpg', text: 'Snackpause mit HEJ Natural', ausschnitt: '50% 50%' },
    ],
    sekunden: 6,   // wie lange jedes Foto stehen bleibt
  },
};
