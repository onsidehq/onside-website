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

  /* Startbildschirm: Diese Fotos erscheinen nacheinander, jedes mit einem Blitz.
     - "bild": Pfad zur Datei
     - "text": die Bildunterschrift unten rechts
     - "ausschnitt": welcher Teil des Fotos zu sehen ist (links/rechts, oben/unten),
       "50% 50%" ist die Mitte. Kleinere erste Zahl = weiter links.
     "breit" gilt für Laptop und Tablet (Querformat-Fotos), "handy" fürs Handy
     (Hochformat-Fotos passen dort am besten; die Dateien "hoch-..." sind
     Hochformat-Ausschnitte der Querformat-Fotos und laden am Handy schneller).
     Das erste Foto jeder Liste steht zusätzlich in index.html, damit es sofort
     lädt. Wer es tauscht, tauscht es an beiden Stellen. */
  startbild: {
    breit: [
      { bild: 'assets/projects/berlin-night-run/01.jpg', text: 'Alle laufen los', ausschnitt: '50% 40%' },
      { bild: 'assets/projects/berlin-night-run/cover.jpg', text: 'Durch die Berliner Nacht', ausschnitt: '34% 50%' },
      { bild: 'assets/projects/berlin-night-run/03.jpg', text: 'Der DJ fährt mit', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/02.jpg', text: 'Kurz durchatmen', ausschnitt: '50% 45%' },
      { bild: 'assets/projects/berlin-night-run/04.jpg', text: 'Die Crowd', ausschnitt: '50% 45%' },
      { bild: 'assets/projects/berlin-night-run/05.jpg', text: 'Afterparty', ausschnitt: '40% 50%' },
      { bild: 'assets/projects/berlin-night-run/12.jpg', text: 'Drinks an der Ecke', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/13.jpg', text: 'Noch lange nicht vorbei', ausschnitt: '50% 50%' },
    ],
    handy: [
      { bild: 'assets/projects/berlin-night-run/hoch-01.jpg', text: 'Alle laufen los', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/06.jpg', text: 'DJ auf dem Lastenrad', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/hoch-cover.jpg', text: 'Durch die Berliner Nacht', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/08.jpg', text: 'Erfrischung unterwegs', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/09.jpg', text: 'Getränke-Stopp', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/11.jpg', text: 'Afterparty', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/hoch-13.jpg', text: 'Noch lange nicht vorbei', ausschnitt: '50% 50%' },
      { bild: 'assets/projects/berlin-night-run/07.jpg', text: 'Am Pult', ausschnitt: '50% 50%' },
    ],
    sekunden: 3.4,   // wie lange jedes Foto stehen bleibt
  },
};
