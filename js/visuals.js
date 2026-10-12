/* ==========================================================================
   onside.hq — Visuals
   Alles, was auf der Seite gezeichnet und animiert wird. Nichts davon ist
   Bild oder Video: Es läuft live im Browser und sieht jedes Mal etwas
   anders aus.

   1) Grundlagen: Takt, Farben, Hilfsfunktionen, ein gemeinsamer Taktgeber
   2) Hintergrund der ganzen Seite: "Crowd & Beat" (Punktfeld + Taktwellen)
   3) Szenen: kleine Animationen in den Flächen, in denen später Fotos liegen
      (im HTML:  <canvas data-scene="trails"></canvas>)
   4) Handgezeichnete Striche (im HTML:  <span data-scribble="underline">)

   Zum Anpassen reichen meistens die Werte in SETTINGS direkt hier drunter.
   ========================================================================== */
(function () {
  'use strict';

  const SETTINGS = {
    bpm: 96,           // Takt der ganzen Seite — Wellen, Ringe und Balken laufen danach
    spacing: 30,       // Abstand der Punkte im Hintergrund (kleiner = dichteres Publikum)
    dotSize: 1.5,      // Grundgröße eines Punktes
    waveSpeed: 430,    // Ausbreitung einer Welle in Pixeln pro Sekunde
    waveWidth: 95,     // Dicke der Wellenfront (größer = weicher)
    grow: 3.2,         // wie stark ein getroffener Punkt wächst
    lift: 9,           // wie weit ein getroffener Punkt weggeschoben wird
    showFronts: true,  // die Wellenfront zusätzlich als feiner Ring
    calm: 0.36,        // Stärke des Hintergrunds unterhalb des Heros (0 = aus, 1 = wie im Hero)
  };

  /* ---------------------------------------------------------------------
     1) Grundlagen
  --------------------------------------------------------------------- */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rootStyle = getComputedStyle(document.documentElement);
  const ACCENT = (rootStyle.getPropertyValue('--accent-rgb') || '63, 213, 255').trim();
  const CREAM = (rootStyle.getPropertyValue('--cream-rgb') || '247, 242, 232').trim();

  const BEAT = 60 / SETTINGS.bpm;   // Sekunden pro Schlag
  const TAU = Math.PI * 2;

  const rgba = (rgb, a) => 'rgba(' + rgb + ', ' + (a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3) + ')';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  // 1 genau auf dem Schlag, klingt bis zum nächsten ab
  const beatPulse = (t, every) => Math.pow(1 - ((t / (BEAT * (every || 1))) % 1), 3);
  // Beschriftungen in Großbuchstaben mit etwas Luft zwischen den Zeichen
  const track = (text) => text.toUpperCase().split('').join('\u200A'); // \u200A = sehr schmales Leerzeichen
  const labelFont = (px) => '600 ' + px + 'px Inter, system-ui, sans-serif';

  // Zufallszahlen mit festem Startwert: dieselbe Szene sieht nach jedem
  // Neuladen und nach jeder Größenänderung gleich aufgebaut aus.
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Ein gemeinsamer Taktgeber für alle Animationen. Jede Animation meldet
     sich an, solange sie im Bild ist, und wieder ab, wenn sie rausscrollt.
     Ist nichts zu sehen (oder der Tab im Hintergrund), läuft gar nichts. */
  const ticker = {
    items: new Set(),
    raf: null,
    add(item) {
      this.items.add(item);
      this.wake();
    },
    remove(item) {
      this.items.delete(item);
    },
    wake() {
      if (this.raf === null && this.items.size && !document.hidden) {
        this.raf = requestAnimationFrame(tick);
      }
    },
  };

  /* Selbstregulierung: Kommt das Gerät mit der vollen Bildrate nicht mit
     (älteres Handy, Stromsparmodus), schalten die Animationen eine Stufe
     herunter: 60 -> 30 -> 15 Bilder pro Sekunde. So bleibt die Seite flüssig
     bedienbar, statt zu ruckeln. Läuft es danach eine Weile rund, wird die
     höhere Stufe noch einmal probiert. */
  const RATES = [60, 30, 15];
  const governor = { level: 0, slow: 0, lastTick: 0, since: 0, drops: 0 };

  function govern(timestamp) {
    const dt = timestamp - governor.lastTick;
    governor.lastTick = timestamp;
    if (!(dt > 0) || dt > 250 || timestamp < 2500) return; // Pausen und den Seitenstart nicht mitzählen
    // Gemessen wird der Abstand zwischen zwei Bildern des Browsers. Liegt er
    // immer wieder deutlich über dem Soll, ist das Gerät überfordert.
    const limit = governor.level === 0 ? 25 : 48;
    governor.slow = dt > limit ? governor.slow + 1 : Math.max(0, governor.slow - 0.5);
    if (governor.slow > 20 && governor.level < RATES.length - 1) {
      governor.level++;
      governor.drops++;
      governor.slow = 0;
      governor.since = timestamp;
    } else if (governor.level > 0 && governor.drops < 3 && governor.slow === 0 && timestamp - governor.since > 12000) {
      governor.level--;
      governor.since = timestamp;
    }
  }

  function tick(timestamp) {
    ticker.raf = null;
    govern(timestamp);
    const now = timestamp / 1000;
    const cap = RATES[governor.level];
    ticker.items.forEach((item) => {
      // Zielrate: normalerweise 60 Bilder pro Sekunde (auch auf 120-Hz-Displays),
      // bei ruhigen Animationen oder überfordertem Gerät weniger
      const fps = Math.min(item.fps || 60, cap);
      if (item.last && now - item.last < 1 / fps - 0.004) return;
      item.last = now;
      try {
        item.draw(now);
      } catch (err) {
        ticker.items.delete(item);
        console.warn('onside.hq: eine Animation wurde gestoppt —', err);
      }
    });
    ticker.wake();
  }

  /* Weiche Lichtscheiben und Lichthöfe als fertige kleine Bilder: einmal
     malen, danach nur noch stempeln. Das ist viel billiger, als in jedem
     Bild neue Farbverläufe zu berechnen. */
  const spriteCache = {};
  function sprite(kind, rgb) {
    const key = kind + rgb;
    if (spriteCache[key]) return spriteCache[key];
    const size = 160;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const g = c.getContext('2d');
    const r = size / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    if (kind === 'disc') {
      // unscharfes Licht wie im Foto: innen blass, zum Rand hin etwas heller
      grad.addColorStop(0, rgba(rgb, 0.36));
      grad.addColorStop(0.82, rgba(rgb, 0.64));
      grad.addColorStop(0.95, rgba(rgb, 1));
      grad.addColorStop(1, rgba(rgb, 0));
    } else {
      // Lichthof: in der Mitte hell, nach außen auslaufend
      grad.addColorStop(0, rgba(rgb, 1));
      grad.addColorStop(0.35, rgba(rgb, 0.42));
      grad.addColorStop(1, rgba(rgb, 0));
    }
    g.fillStyle = grad;
    g.beginPath();
    g.arc(r, r, r, 0, TAU);
    g.fill();
    spriteCache[key] = c;
    return c;
  }
  // stempelt ein solches Bildchen mit Mittelpunkt (x, y) und Radius r
  function stamp(ctx, kind, rgb, x, y, r, alpha) {
    if (alpha <= 0.003) return;
    const before = ctx.globalAlpha; // blendet die Szene gerade ein oder aus, gilt das auch hier
    ctx.globalAlpha = before * (alpha > 1 ? 1 : alpha);
    ctx.drawImage(sprite(kind, rgb), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = before;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (ticker.raf !== null) cancelAnimationFrame(ticker.raf);
      ticker.raf = null;
    } else {
      ticker.wake();
    }
  });

  /* Das Punktfeld wird an zwei Stellen gebraucht (Seitenhintergrund und die
     kleine Szene "crowd"), deshalb steht das Zeichnen hier einmal.

     Für jeden Punkt einzeln eine Farbe zu setzen wäre zu langsam (tausende
     Punkte pro Bild). Stattdessen werden die Helligkeiten in feste Stufen
     einsortiert und pro Stufe alle Punkte auf einmal gemalt. */
  function makeCrowd() {
    const LEVELS = 18;
    const creamStyle = [];
    const accentStyle = [];
    const bucketCream = [];
    const bucketAccent = [];
    for (let i = 0; i <= LEVELS; i++) {
      creamStyle.push(rgba(CREAM, i / LEVELS));
      accentStyle.push(rgba(ACCENT, i / LEVELS));
      bucketCream.push([]);
      bucketAccent.push([]);
    }

    function build(width, height, step, size, rnd) {
      const cols = Math.ceil(width / step) + 1;
      const rows = Math.ceil(height / step) + 1;
      const dots = [];
      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          dots.push({
            // leichte Unregelmäßigkeit, damit es nach Menge aussieht und nicht nach Tabelle
            x: ix * step + (rnd() - 0.5) * step * 0.55,
            y: iy * step + (rnd() - 0.5) * step * 0.55,
            base: 0.09 + rnd() * 0.17,          // Grundhelligkeit
            size: size * (0.7 + rnd() * 0.7),
            phase: rnd() * TAU,                 // fürs ruhige Atmen zwischen den Wellen
          });
        }
      }
      return dots;
    }

    /* o: { t, sigma, maxRadius, grow, lift, dim, power, pointer, fronts } */
    function render(ctx, dots, waves, o) {
      const twoSigmaSq = 2 * o.sigma * o.sigma;
      const reach = o.sigma * 2.2;

      // die Wellenfront selbst, ganz dezent
      if (o.fronts) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = 1;
        for (let j = 0; j < waves.length; j++) {
          const w = waves[j];
          if (!(w.r > 0)) continue; // negativer Radius würde das Zeichnen abbrechen
          const fade = 1 - w.r / o.maxRadius;
          if (fade <= 0.02) continue;
          ctx.strokeStyle = rgba(ACCENT, 0.07 * fade * o.power);
          ctx.beginPath();
          ctx.arc(w.x, w.y, w.r, 0, TAU);
          ctx.stroke();
        }
      }

      for (let i = 0; i <= LEVELS; i++) {
        bucketCream[i].length = 0;
        bucketAccent[i].length = 0;
      }

      const p = o.pointer;
      const pr2 = p ? p.radius * p.radius : 0;
      const waveCount = waves.length;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let energy = 0;
        let pushX = 0;
        let pushY = 0;

        for (let j = 0; j < waveCount; j++) {
          const w = waves[j];
          const dx = d.x - w.x;
          const dy = d.y - w.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const offset = dist - w.r;
          if (offset > reach || offset < -reach) continue;

          // je näher der Punkt an der Wellenfront, desto stärker der Ausschlag
          const fade = 1 - w.r / o.maxRadius;
          if (fade <= 0) continue;
          const e = Math.exp(-(offset * offset) / twoSigmaSq) * w.strength * fade;
          energy += e;
          if (dist > 0.001) {
            pushX += (dx / dist) * e;
            pushY += (dy / dist) * e;
          }
        }
        energy *= o.power;

        // ruhiges Atmen, damit das Feld zwischen zwei Wellen nicht tot wirkt
        const breathe = 0.5 + 0.5 * Math.sin(o.t * 1.1 + d.phase);
        const baseAlpha = d.base * (0.75 + breathe * 0.45) * o.dim;

        if (energy >= 0.03) {
          const e = energy > 1 ? 1 : energy;
          const size = d.size + e * o.grow;
          const lvl = (Math.min(0.95, baseAlpha + e * 0.8) * LEVELS) | 0;
          bucketAccent[lvl].push(
            d.x + pushX * o.lift * o.power - size / 2,
            d.y + pushY * o.lift * o.power - size / 2,
            size
          );
          continue;
        }

        // Punkte in der Nähe des Mauszeigers hellen sich auf
        if (p) {
          const dx = d.x - p.x;
          const dy = d.y - p.y;
          const dd = dx * dx + dy * dy;
          if (dd < pr2) {
            const q = 1 - dd / pr2;
            const glow = q * q;
            const size = d.size + glow * 2.4;
            const lvl = (Math.min(0.9, baseAlpha + glow * 0.7) * LEVELS) | 0;
            if (lvl > 0) bucketCream[lvl].push(d.x - size / 2, d.y - size / 2, size);
            continue;
          }
        }

        const lvl = (baseAlpha * LEVELS) | 0;
        if (lvl > 0) bucketCream[lvl].push(d.x, d.y, d.size);
      }

      // pro Helligkeitsstufe einmal die Farbe setzen, dann alles auf einmal malen
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 1; i <= LEVELS; i++) {
        const arr = bucketCream[i];
        if (arr.length) {
          ctx.fillStyle = creamStyle[i];
          for (let k = 0; k < arr.length; k += 3) ctx.fillRect(arr[k], arr[k + 1], arr[k + 2], arr[k + 2]);
        }
        const acc = bucketAccent[i];
        if (acc.length) {
          ctx.fillStyle = accentStyle[i];
          for (let k = 0; k < acc.length; k += 3) ctx.fillRect(acc[k], acc[k + 1], acc[k + 2], acc[k + 2]);
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    return { build, render };
  }

  /* ---------------------------------------------------------------------
     2) HINTERGRUND DER GANZEN SEITE — "Crowd & Beat"

     Das Punktraster über die ganze Fläche ist das Publikum. Im Takt werden
     Wellen losgeschickt, die sich kreisförmig ausbreiten. Erreicht eine
     Welle einen Punkt, hebt er sich an, wird größer und leuchtet in der
     Akzentfarbe auf — wie eine Welle, die durch ein Stadion läuft.

     Im Hero der Startseite läuft das in voller Stärke, darunter und auf den
     Unterseiten ruhiger (SETTINGS.calm), damit die Texte lesbar bleiben.
     Der Mauszeiger hellt die Punkte um sich herum auf, und jeder Klick bzw.
     jedes Tippen schickt eine eigene Welle los.
  --------------------------------------------------------------------- */
  function initAmbient() {
    const canvas = document.getElementById('ambient');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const crowd = makeCrowd();

    let width = 0;
    let height = 0;
    let dots = [];
    let waves = [];
    let maxRadius = 0;
    let beatIndex = Math.floor(performance.now() / 1000 / BEAT);

    // Wie kräftig das Feld ist, hängt von der Stelle ab:
    // Hero der Startseite = volle Stärke, Kopf einer Unterseite = mittel,
    // darunter = ruhig. Auf Seiten mit viel Lesetext (Impressum, Datenschutz)
    // und auf dem Handy, wo Text die ganze Breite füllt, noch etwas ruhiger.
    const hero = document.querySelector('.hero');
    const legal = document.body.dataset.page === 'legal';
    const narrow = () => window.innerWidth < 700;
    const calmLevel = () => (legal ? 0.14 : SETTINGS.calm * (narrow() ? 0.55 : 1));
    const topLevel = () => (hero ? 1 : legal ? 0.14 : narrow() ? 0.4 : 0.55);
    let level = topLevel();
    let targetLevel = level;
    const pointer = { x: 0, y: 0, radius: 150, active: false };

    function measureLevel() {
      const span = (hero ? hero.offsetHeight : window.innerHeight * 0.6) * 0.85;
      const p = clamp(window.scrollY / Math.max(1, span), 0, 1);
      targetLevel = lerp(topLevel(), calmLevel(), p);
    }

    function resize(force) {
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w < 1 || h < 1) return;
      // Die Fläche ist im CSS so hoch wie der Bildschirm bei eingefahrener
      // Adressleiste (100lvh). Ihre Größe ändert sich auf dem Handy beim
      // Scrollen deshalb nicht — nur beim Drehen oder wenn ein Fenster
      // gezogen wird. Dann wird das Feld passend neu aufgebaut.
      if (!force && w === width && h === height) return;
      // Auf großen, hochauflösenden Bildschirmen etwas gröber rechnen: Die Punkte
      // sind so klein, dass man es nicht sieht, es spart aber viel Rechenarbeit.
      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (w * h * dpr * dpr > 3.2e6) dpr = Math.max(1, Math.sqrt(3.2e6 / (w * h)));
      width = w;
      height = h;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maxRadius = Math.hypot(width, height) + SETTINGS.waveWidth;
      // auf sehr breiten Screens etwas luftiger, damit die Punktzahl im Rahmen bleibt
      const step = Math.max(SETTINGS.spacing, Math.round(width / 52));
      dots = crowd.build(width, height, step, SETTINGS.dotSize, Math.random);
    }

    function spawn(t0, x, y, strength, speed) {
      waves.push({ x, y, t0, strength, speed, r: 0 });
      if (waves.length > 9) waves.shift();
    }

    function beat(t0) {
      // unterhalb des Heros startet nur jeder zweite Schlag eine Welle
      if (level < 0.6 && beatIndex % 2 !== 0) return;
      // Ursprung irgendwo auf der Fläche, etwas zur Mitte hin gewichtet
      const bias = () => 0.5 + (Math.random() - 0.5) * 1.5;
      // jeder vierte Schlag ist der betonte — stärkere, schnellere Welle
      const downbeat = beatIndex % 4 === 0;
      spawn(
        t0,
        bias() * width,
        bias() * height,
        downbeat ? 1.15 + Math.random() * 0.3 : 0.6 + Math.random() * 0.35,
        downbeat ? SETTINGS.waveSpeed * 1.25 : SETTINGS.waveSpeed
      );
    }

    function paint(t) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      crowd.render(ctx, dots, waves, {
        t,
        sigma: SETTINGS.waveWidth,
        maxRadius,
        grow: SETTINGS.grow,
        lift: SETTINGS.lift,
        dim: 0.45 + 0.55 * level,
        power: 0.3 + 0.7 * level,
        pointer: pointer.active ? pointer : null,
        fronts: SETTINGS.showFronts,
      });
    }

    const item = {
      fps: 60,
      draw(now) {
        // nach einer Pause (Tab im Hintergrund) nicht alle Schläge auf einmal nachholen
        if (now - beatIndex * BEAT > BEAT * 4) beatIndex = Math.floor(now / BEAT);
        while ((beatIndex + 1) * BEAT <= now) {
          beatIndex++;
          beat(beatIndex * BEAT);
        }

        // Wellen fortschreiben, ausgelaufene entfernen
        for (let i = waves.length - 1; i >= 0; i--) {
          waves[i].r = (now - waves[i].t0) * waves[i].speed;
          if (waves[i].r > maxRadius) waves.splice(i, 1);
        }

        level += (targetLevel - level) * 0.08;
        item.fps = level > 0.6 ? 60 : 30;   // ruhiger Bereich: halbe Bildrate reicht
        paint(now);
      },
    };

    // Ruhiges Standbild (wenn "Bewegung reduzieren" eingeschaltet ist):
    // zwei stehende Wellen, keine Bewegung.
    function paintStill() {
      level = 0.6;
      waves = [
        { x: width * 0.32, y: height * 0.38, strength: 1, r: width * 0.22 },
        { x: width * 0.74, y: height * 0.66, strength: 0.8, r: width * 0.3 },
      ];
      paint(0);
    }

    resize(true);
    measureLevel();
    level = targetLevel;

    if (reducedMotion) {
      paintStill();
    } else {
      ticker.add(item);
      window.addEventListener('scroll', measureLevel, { passive: true });

      window.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
      }, { passive: true });
      document.documentElement.addEventListener('mouseleave', () => { pointer.active = false; });

      // Klick oder Tippen: eine Welle genau von dieser Stelle
      window.addEventListener('pointerdown', (e) => {
        spawn(performance.now() / 1000, e.clientX, e.clientY, 1.1, SETTINGS.waveSpeed * 1.15);
      }, { passive: true });
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize(false);
        measureLevel();
        if (reducedMotion) paintStill();
      }, 200);
    });
  }

  /* ---------------------------------------------------------------------
     3) SZENEN
     Jede Szene ist eine Funktion, die für eine Fläche (Breite, Höhe) einmal
     alles vorbereitet und dann eine Zeichenfunktion zurückgibt. Die bekommt
     nur die Zeit t in Sekunden — dadurch lässt sich jede Szene jederzeit
     anhalten, fortsetzen oder als Standbild zeigen.

     Im HTML:  <canvas data-scene="NAME" data-seed="ZAHL"></canvas>
     data-seed ist der Startwert für den Zufall: andere Zahl = andere Variante.
  --------------------------------------------------------------------- */
  const SCENES = {};

  /* --- trails: Lichtspuren durch die Nacht (Night Run) ------------------ */
  SCENES.trails = function (w, h, rnd, data, canvas) {
    // Der Hintergrund steht fest und liegt deshalb als CSS unter der Zeichnung —
    // so muss er nicht in jedem Bild neu gemalt werden.
    canvas.style.background =
      'radial-gradient(circle at 24% 20%, ' + rgba(ACCENT, 0.13) + ', ' + rgba(ACCENT, 0) + ' 72%), #050607';

    // Hochformat (Handy): Die Spuren richten sich dann nach der Höhe, sonst
    // wären sie auf der schmalen Fläche zu kurz und zu wenige.
    const L = Math.max(w, h * 0.9);
    const count = Math.round(clamp(h / 13, 14, 56));
    const streaks = [];
    for (let i = 0; i < count; i++) {
      const z = Math.pow(rnd(), 1.4); // Tiefe: 0 = weit weg, 1 = ganz nah
      streaks.push({
        z,
        dir: rnd() < 0.24 ? -1 : 1,
        y0: (0.06 + rnd() * 0.88) * h,
        speed: L * lerp(0.05, 0.26, z) * (0.8 + rnd() * 0.4),
        len: L * lerp(0.08, 0.36, z) * (0.7 + rnd() * 0.6),
        width: lerp(0.6, 2.3, z),
        alpha: lerp(0.28, 1, z),
        accent: rnd() < 0.68,
        phase: rnd(),
        a1: Math.min(h, w) * lerp(0.02, 0.07, z) * (0.5 + rnd()),
        k1: TAU / (L * (0.7 + rnd() * 0.9)),
        p1: rnd() * TAU,
        a2: Math.min(h, w) * 0.015 * (0.5 + rnd()),
        k2: TAU / (L * (0.22 + rnd() * 0.2)),
        p2: rnd() * TAU,
      });
    }
    streaks.sort((a, b) => a.z - b.z); // die fernen zuerst zeichnen

    // unscharfe Lichter im Hintergrund, wie Stadtlichter bei offener Blende
    const lights = [];
    const lightCount = Math.round(clamp((w * h) / 60000, 4, 12));
    for (let i = 0; i < lightCount; i++) {
      lights.push({
        x: rnd() * w,
        y: rnd() * h,
        r: Math.min(w, h) * (0.04 + rnd() * 0.12),
        a: 0.03 + rnd() * 0.045,
        accent: rnd() < 0.72,
        p: rnd() * TAU,
        s: 0.05 + rnd() * 0.1,
      });
    }

    const SEG = 12;

    return function (ctx, t) {
      ctx.globalCompositeOperation = 'lighter';
      for (const l of lights) {
        const x = l.x + Math.sin(t * l.s + l.p) * w * 0.03;
        const y = l.y + Math.cos(t * l.s * 0.8 + l.p) * h * 0.04;
        stamp(ctx, 'disc', l.accent ? ACCENT : CREAM, x, y, l.r, l.a * 1.25);
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const s of streaks) {
        const span = w + s.len;
        const prog = (s.phase + (t * s.speed) / span) % 1;
        const hx = s.dir > 0 ? prog * span : w - prog * span; // Kopf der Lichtspur
        const tx = hx - s.dir * s.len;                        // ihr Ende
        const yAt = (x) =>
          s.y0 + s.a1 * Math.sin(x * s.k1 + s.p1 + t * 0.12) + s.a2 * Math.sin(x * s.k2 + s.p2);
        const hy = yAt(hx);
        const rgb = s.accent ? ACCENT : CREAM;

        const grad = ctx.createLinearGradient(tx, yAt(tx), hx, hy);
        grad.addColorStop(0, rgba(rgb, 0));
        grad.addColorStop(0.75, rgba(rgb, s.alpha * 0.55));
        grad.addColorStop(1, rgba(rgb, s.alpha));

        ctx.beginPath();
        for (let i = 0; i <= SEG; i++) {
          const x = tx + ((hx - tx) * i) / SEG;
          if (i) ctx.lineTo(x, yAt(x));
          else ctx.moveTo(x, yAt(x));
        }
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 0.16;           // weicher Schein
        ctx.lineWidth = s.width * 3.4;
        ctx.stroke();
        ctx.globalAlpha = 1;              // heller Kern
        ctx.lineWidth = s.width;
        ctx.stroke();

        ctx.fillStyle = rgba(rgb, s.alpha);
        ctx.beginPath();
        ctx.arc(hx, hy, s.width * 0.9, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  };

  /* --- route: eine Strecke zeichnet sich, Punkt für Punkt ---------------- */
  SCENES.route = function (w, h, rnd, data, canvas) {
    canvas.style.background = '#060707';
    const labels = (data.labels || 'Start|01|02|03|Ziel').split('|');
    const small = w < 520;
    const padX = small ? 30 : Math.max(52, w * 0.07);

    // Stützpunkte im Zickzack von links nach rechts
    const pts = [];
    const cnt = 6;
    const swing = Math.min(h, w * 0.62); // im Hochformat nicht zu steil werden
    for (let i = 0; i < cnt; i++) {
      const side = i % 2 ? 1 : -1;
      pts.push([lerp(padX, w - padX, i / (cnt - 1)), h * 0.5 + side * swing * (0.1 + rnd() * 0.15)]);
    }

    // daraus eine weiche Kurve (Catmull-Rom), als Punktliste mit Streckenlänge
    const path = [];
    const STEPS = 36;
    for (let i = 0; i < cnt - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(cnt - 1, i + 2)];
      for (let j = 0; j < STEPS; j++) {
        const u = j / STEPS;
        const u2 = u * u;
        const u3 = u2 * u;
        const cr = (a, b, c, d) =>
          0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        path.push({ x: cr(p0[0], p1[0], p2[0], p3[0]), y: cr(p0[1], p1[1], p2[1], p3[1]), d: 0 });
      }
    }
    path.push({ x: pts[cnt - 1][0], y: pts[cnt - 1][1], d: 0 });
    for (let i = 1; i < path.length; i++) {
      path[i].d = path[i - 1].d + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    }
    const total = path[path.length - 1].d;

    // Position auf der Strecke bei Anteil f (0 = Start, 1 = Ziel)
    function at(f) {
      const target = clamp(f, 0, 1) * total;
      let lo = 0;
      let hi = path.length - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (path[mid].d <= target) lo = mid;
        else hi = mid;
      }
      const a = path[lo];
      const b = path[hi];
      const u = b.d > a.d ? (target - a.d) / (b.d - a.d) : 0;
      return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), i: lo };
    }

    const stops = labels.map((label, i) => {
      const f = i / (labels.length - 1);
      const p = at(f);
      return { f, x: p.x, y: p.y, label: track(label), lx: p.x, ly: p.y - 20 };
    });

    const T = 11; // Sekunden pro Durchlauf
    const fontPx = small ? 9 : 10.5;

    // Wohin mit der Beschriftung? Für jeden Punkt werden mehrere Plätze probiert
    // (darüber, darunter, die vier Ecken — erst nah, dann etwas weiter weg) und
    // der genommen, der genug Abstand zur Strecke und zu den anderen Texten hat.
    let placed = false;
    function placeLabels(ctx) {
      const taken = []; // schon vergebene Textkästchen
      stops.forEach((s) => {
        const tw = ctx.measureText(s.label).width;
        const th = fontPx * 0.7;
        const side = 13 + tw / 2;
        const far = side + 8;
        const spots = [
          [0, -20], [0, 21], [side, 15], [side, -14], [-side, 15], [-side, -14],
          // etwas weiter weg, falls es rund um den Punkt eng ist
          [far, 27], [far, -25], [-far, 27], [-far, -25], [0, -33], [0, 34],
        ];
        let bestScore = -Infinity;
        let bestBox = null;
        spots.forEach((spot, k) => {
          const cx = s.x + spot[0];
          const cy = s.y + spot[1];
          const box = [cx - tw / 2, cy - th, cx + tw / 2, cy + th];
          if (box[0] < 6 || box[2] > w - 6 || box[1] < 6 || box[3] > h - 6) return; // würde aus der Fläche ragen
          let dist = Infinity;
          for (let j = 0; j < path.length; j++) {
            const dx = path[j].x < box[0] ? box[0] - path[j].x : path[j].x > box[2] ? path[j].x - box[2] : 0;
            const dy = path[j].y < box[1] ? box[1] - path[j].y : path[j].y > box[3] ? path[j].y - box[3] : 0;
            const d = Math.hypot(dx, dy);
            if (d < dist) dist = d;
          }
          // "weit genug weg" reicht — bei Gleichstand gewinnt der frühere Platz
          let score = Math.min(dist, 11) - k * 0.01;
          // nicht in eine andere Beschriftung hineinschreiben
          if (taken.some((b) => box[0] < b[2] + 3 && box[2] > b[0] - 3 && box[1] < b[3] + 2 && box[3] > b[1] - 2)) score -= 100;
          if (score > bestScore) {
            bestScore = score;
            bestBox = box;
            s.lx = cx;
            s.ly = cy;
          }
        });
        if (bestBox) taken.push(bestBox);
      });
      placed = true;
    }
    // die Schrift lädt manchmal erst nach dem ersten Bild -> dann neu ausmessen
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { placed = false; });

    function trace(ctx, upTo) {
      const end = at(upTo);
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i <= end.i; i++) ctx.lineTo(path[i].x, path[i].y);
      ctx.lineTo(end.x, end.y);
      return end;
    }

    const draw = function (ctx, t) {
      // angedeuteter Stadtplan: zwei Scharen feiner Linien
      ctx.strokeStyle = rgba(CREAM, 0.04);
      ctx.lineWidth = 1;
      ctx.beginPath();
      const gap = small ? 44 : 60;
      for (let x = -h * 0.25; x < w + gap; x += gap) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h * 0.22, h);
      }
      for (let y = 0; y < h + w * 0.1; y += gap) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y - w * 0.09);
      }
      ctx.stroke();

      const u = (t % T) / T;
      const prog = easeInOut(clamp(u / 0.72, 0, 1));
      const fade = u > 0.93 ? (1 - u) / 0.07 : u < 0.03 ? u / 0.03 : 1; // am Ende weich ausblenden

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // die ganze Strecke gestrichelt
      ctx.setLineDash([2, 7]);
      ctx.strokeStyle = rgba(CREAM, 0.32);
      ctx.lineWidth = 1.5;
      trace(ctx, 1);
      ctx.stroke();
      ctx.setLineDash([]);

      // der schon gelaufene Teil
      const head = trace(ctx, prog);
      ctx.strokeStyle = rgba(ACCENT, 0.2 * fade);
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.strokeStyle = rgba(ACCENT, fade);
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // die Stopps
      ctx.font = labelFont(fontPx);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      if (!placed) placeLabels(ctx);
      stops.forEach((s) => {
        const since = prog - s.f;
        const passed = since >= -0.001;
        if (passed && since < 0.12) {
          const q = since / 0.12;
          ctx.strokeStyle = rgba(ACCENT, (1 - q) * 0.8 * fade);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 7 + q * 24, 0, TAU);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, 6, 0, TAU);
        ctx.fillStyle = '#060707';
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = passed ? rgba(ACCENT, Math.max(0.5, fade)) : rgba(CREAM, 0.5);
        ctx.stroke();
        if (passed) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, 2.6, 0, TAU);
          ctx.fillStyle = rgba(ACCENT, Math.max(0.5, fade));
          ctx.fill();
        }

        ctx.fillStyle = rgba(CREAM, passed ? 0.95 : 0.5);
        ctx.fillText(s.label, s.lx, s.ly);
      });

      // der Läufer
      if (fade > 0) {
        stamp(ctx, 'glow', ACCENT, head.x, head.y, 22, 0.6 * fade);
        ctx.fillStyle = rgba(CREAM, fade);
        ctx.beginPath();
        ctx.arc(head.x, head.y, 3.6, 0, TAU);
        ctx.fill();
      }
    };
    draw.still = T * 0.5;
    return draw;
  };

  /* --- eq: Balken im Takt (der DJ) ------------------------------------- */
  SCENES.eq = function (w, h, rnd, data, canvas) {
    canvas.style.background =
      'radial-gradient(circle at 50% 62%, ' + rgba(ACCENT, 0.12) + ', ' + rgba(ACCENT, 0) + ' 62%), #060606';
    const count = Math.round(clamp(w / 15, 18, 64));
    const gap = w / count;
    const bw = Math.max(2, gap * 0.52);
    const base = h * 0.62;
    const maxH = h * 0.44;
    const mid = count * (0.4 + rnd() * 0.2);
    const bars = [];
    for (let i = 0; i < count; i++) {
      bars.push({
        p1: rnd() * TAU,
        p2: rnd() * TAU,
        s1: 1.4 + rnd() * 1.6,
        s2: 0.6 + rnd() * 0.9,
        shape: 0.32 + 0.68 * Math.exp(-Math.pow((i - mid) / (count * 0.3), 2)),
      });
    }
    let up = null;
    let down = null;

    return function (ctx, t) {
      if (!up) {
        up = ctx.createLinearGradient(0, base, 0, base - maxH);
        up.addColorStop(0, rgba(ACCENT, 0.35));
        up.addColorStop(1, rgba(ACCENT, 1));
        down = ctx.createLinearGradient(0, base, 0, base + maxH * 0.5);
        down.addColorStop(0, rgba(ACCENT, 0.22));
        down.addColorStop(1, rgba(ACCENT, 0));
      }

      const pulse = beatPulse(t);
      for (let i = 0; i < count; i++) {
        const b = bars[i];
        const v = 0.5 + 0.5 * Math.sin(t * b.s1 + b.p1);
        const v2 = 0.5 + 0.5 * Math.sin(t * b.s2 + b.p2 + i * 0.35);
        const level = clamp(b.shape * (0.2 + 0.5 * v * v2 + 0.4 * pulse * (0.45 + 0.55 * v)), 0.04, 1);
        const bh = level * maxH;
        const x = i * gap + (gap - bw) / 2;
        ctx.fillStyle = up;
        ctx.fillRect(x, base - bh, bw, bh);
        ctx.fillStyle = down;
        ctx.fillRect(x, base + 3, bw, bh * 0.45);
        ctx.fillStyle = rgba(CREAM, 0.85);
        ctx.fillRect(x, base - bh - 5, bw, 1.5);
      }
    };
  };

  /* --- crowd: das Punktfeld im Kleinen ---------------------------------- */
  SCENES.crowd = function (w, h, rnd) {
    const crowd = makeCrowd();
    const step = clamp(Math.sqrt((w * h) / 560), 14, 30);
    const dots = crowd.build(w, h, step, 1.6, rnd);
    const seed = rnd() * 100;
    const hash = (n) => {
      const x = Math.sin(n * 127.1 + seed) * 43758.5453;
      return x - Math.floor(x);
    };
    const big = Math.max(w, h);
    const maxRadius = Math.hypot(w, h) + big * 0.1;
    const every = BEAT * 2;

    return function (ctx, t) {
      // Woher die Wellen kommen, steht für jeden Schlag fest (aus seiner Nummer
      // berechnet) — so braucht die Szene kein Gedächtnis.
      const k = Math.floor(t / every);
      const waves = [];
      for (let j = k; j > k - 3; j--) {
        waves.push({
          x: (0.15 + 0.7 * hash(j)) * w,
          y: (0.15 + 0.7 * hash(j + 0.5)) * h,
          r: (t - j * every) * big * 0.5,
          strength: j % 2 === 0 ? 1.15 : 0.75,
        });
      }
      crowd.render(ctx, dots, waves, {
        t,
        sigma: big * 0.085,
        maxRadius,
        grow: 3.4,
        lift: 8,
        dim: 1,
        power: 1,
        pointer: null,
        fronts: true,
      });
    };
  };

  /* --- bokeh: Lichter und Lichtkegel (Afterparty) ---------------------- */
  SCENES.bokeh = function (w, h, rnd) {
    const m = Math.min(w, h);
    const count = Math.round(clamp((w * h) / 14000, 14, 34));
    const lights = [];
    for (let i = 0; i < count; i++) {
      lights.push({
        x: rnd() * w,
        y: rnd() * h,
        r: m * (0.035 + Math.pow(rnd(), 2) * 0.17),
        a: 0.05 + rnd() * 0.11,
        accent: rnd() < 0.62,
        p: rnd() * TAU,
        s: 0.08 + rnd() * 0.16,
        onBeat: rnd() < 0.4,
      });
    }
    const beams = [0.2, 0.5, 0.82].map((fx, i) => ({
      x: w * (fx + (rnd() - 0.5) * 0.1),
      p: rnd() * TAU,
      s: 0.25 + rnd() * 0.25,
      spread: 0.1 + rnd() * 0.06,
      accent: i !== 1,
    }));

    return function (ctx, t) {
      ctx.globalCompositeOperation = 'lighter';

      // Lichtkegel, die von oben durch den Raum schwenken
      const len = h * 1.3;
      for (const b of beams) {
        const ang = Math.PI / 2 + Math.sin(t * b.s + b.p) * 0.42;
        const rgb = b.accent ? ACCENT : CREAM;
        const al = 0.1 + 0.07 * beatPulse(t, 2);
        const g = ctx.createLinearGradient(b.x, 0, b.x + Math.cos(ang) * len, Math.sin(ang) * len);
        g.addColorStop(0, rgba(rgb, al));
        g.addColorStop(1, rgba(rgb, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(b.x, -6);
        ctx.lineTo(b.x + Math.cos(ang - b.spread) * len, Math.sin(ang - b.spread) * len);
        ctx.lineTo(b.x + Math.cos(ang + b.spread) * len, Math.sin(ang + b.spread) * len);
        ctx.closePath();
        ctx.fill();
      }

      const pulse = beatPulse(t);
      for (const l of lights) {
        const x = l.x + Math.sin(t * l.s + l.p) * w * 0.04;
        const y = l.y + Math.cos(t * l.s * 0.8 + l.p) * h * 0.05;
        const flicker = 0.72 + 0.28 * Math.sin(t * 1.7 + l.p) + (l.onBeat ? 0.5 * pulse : 0);
        stamp(ctx, 'disc', l.accent ? ACCENT : CREAM, x, y, l.r, l.a * flicker * 1.7);
      }
      ctx.globalCompositeOperation = 'source-over';
    };
  };

  /* --- rings: Ringe im Takt, das Publikum drumherum (Event) ------------ */
  SCENES.rings = function (w, h, rnd) {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.46;
    const tiny = R < 60; // die kleine Fassung auf den Karten der Startseite
    const circles = tiny
      ? [{ r: 0.5, n: 7 }, { r: 0.86, n: 11 }]
      : [{ r: 0.34, n: 10 }, { r: 0.58, n: 16 }, { r: 0.82, n: 24 }];
    circles.forEach((c, i) => {
      c.dir = i % 2 ? -1 : 1;
      c.off = rnd() * TAU;
    });
    const cycle = BEAT * 2;      // alle zwei Schläge löst sich ein Ring
    const life = 3;              // ... und braucht drei solcher Takte bis zum Rand
    const dotR = tiny ? 1.25 : 2;

    return function (ctx, t) {
      // die Ringe
      const rings = [];
      for (let k = 0; k < life; k++) {
        const ph = (t / (cycle * life) + k / life) % 1;
        rings.push({ r: easeOut(ph) * R * 1.04, a: Math.pow(1 - ph, 1.5) });
      }
      ctx.lineWidth = tiny ? 1.1 : 1.5;
      for (const ring of rings) {
        ctx.strokeStyle = rgba(ACCENT, ring.a * 0.9);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0.1, ring.r), 0, TAU);
        ctx.stroke();
      }

      // das Publikum auf Kreisen — jeder Punkt hüpft, wenn ein Ring ihn erreicht
      for (const c of circles) {
        const rc = c.r * R;
        ctx.strokeStyle = rgba(CREAM, 0.08);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rc, 0, TAU);
        ctx.stroke();

        let bump = 0;
        for (const ring of rings) {
          const q = (ring.r - rc) / (R * 0.1);
          bump = Math.max(bump, Math.exp(-q * q) * ring.a);
        }
        const rr = rc + bump * R * 0.06;
        ctx.fillStyle = bump > 0.22 ? rgba(ACCENT, 0.55 + 0.45 * bump) : rgba(CREAM, 0.55);
        for (let i = 0; i < c.n; i++) {
          const a = c.off + (i / c.n) * TAU + t * 0.07 * c.dir;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, dotR * (1 + bump * 1.2), 0, TAU);
          ctx.fill();
        }
      }

      // die Mitte: von hier geht alles aus
      const pulse = beatPulse(t, 2);
      const core = (tiny ? 2.6 : 5) * (1 + 0.45 * pulse);
      if (!tiny) stamp(ctx, 'glow', ACCENT, cx, cy, core * 5.5, 0.4 + 0.3 * pulse);
      ctx.fillStyle = rgba(ACCENT, 1);
      ctx.beginPath();
      ctx.arc(cx, cy, core, 0, TAU);
      ctx.fill();
    };
  };

  /* --- focus: aus verstreuten Strichen wird eine klare Form (Marke) ---- */
  SCENES.focus = function (w, h, rnd) {
    const m = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const S = m * 0.3; // halbe Diagonale der Raute
    const perEdge = Math.round(clamp(m / 26, 3, 11));
    const corners = [[cx, cy - S], [cx + S, cy], [cx, cy + S], [cx - S, cy]];
    const segLen = ((Math.SQRT2 * S) / perEdge) * 0.62;
    const segs = [];
    for (let e = 0; e < 4; e++) {
      const a = corners[e];
      const b = corners[(e + 1) % 4];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      for (let i = 0; i < perEdge; i++) {
        const f = (i + 0.5) / perEdge;
        segs.push({
          tx: lerp(a[0], b[0], f),
          ty: lerp(a[1], b[1], f),
          ta: ang,
          sx: cx + (rnd() - 0.5) * (m < 130 ? w * 0.82 : w * 0.86),
          sy: cy + (rnd() - 0.5) * (m < 130 ? h * 0.82 : h * 0.82),
          sa: ang + (rnd() - 0.5) * Math.PI * 1.6,
          spin: (rnd() - 0.5) * 0.5,
          delay: rnd() * 0.34,
          wob: rnd() * TAU,
          ws: 0.3 + rnd() * 0.5,
        });
      }
    }
    const T = 8;
    const lw = m < 130 ? 1.3 : 1.9;

    const draw = function (ctx, t) {
      const u = (t % T) / T;
      // 0–0.08 verstreut · 0.08–0.32 ordnet sich · 0.32–0.80 Form steht · danach löst sie sich
      let g;
      if (u < 0.08) g = 0;
      else if (u < 0.32) g = (u - 0.08) / 0.24;
      else if (u < 0.8) g = 1;
      else g = 1 - (u - 0.8) / 0.2;

      ctx.lineCap = 'round';
      ctx.lineWidth = lw;
      for (const s of segs) {
        const e = easeInOut(clamp((g - s.delay) / 0.66, 0, 1));
        const drift = (1 - e) * m * 0.018;
        const x = lerp(s.sx + Math.sin(t * s.ws + s.wob) * drift, s.tx, e);
        const y = lerp(s.sy + Math.cos(t * s.ws * 0.8 + s.wob) * drift, s.ty, e);
        const ang = lerp(s.sa + t * s.spin, s.ta, e);
        const dx = (Math.cos(ang) * segLen) / 2;
        const dy = (Math.sin(ang) * segLen) / 2;
        ctx.beginPath();
        ctx.moveTo(x - dx, y - dy);
        ctx.lineTo(x + dx, y + dy);
        ctx.strokeStyle = e < 0.5 ? rgba(CREAM, 0.5 - e * 0.5) : rgba(ACCENT, e);
        ctx.stroke();
      }

      // steht die Form, erscheint in der Mitte die gefüllte Raute
      const core = u >= 0.32 && u < 0.8 ? Math.min(1, (u - 0.32) / 0.05) * Math.min(1, (0.8 - u) / 0.05) : 0;
      if (core > 0) {
        const r = S * 0.3 * (0.9 + 0.12 * beatPulse(t, 2)) * (0.7 + 0.3 * core);
        ctx.fillStyle = rgba(ACCENT, core);
        ctx.beginPath();
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r, cy);
        ctx.lineTo(cx, cy + r);
        ctx.lineTo(cx - r, cy);
        ctx.closePath();
        ctx.fill();
      }
    };
    draw.still = T * 0.55;
    return draw;
  };

  /* --- network: ein Impuls wandert von Knoten zu Knoten (Social) ------- */
  SCENES.network = function (w, h, rnd) {
    const m = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const tiny = m < 130;
    const N = Math.round(clamp(Math.sqrt(w * h) / 15, 8, 30));
    const nodes = [{ x: cx, y: cy, d: 0, parent: -1, p: 0 }];
    const rx = w * 0.43;
    const ry = h * 0.41;
    for (let i = 1; i < N; i++) {
      const rr = Math.sqrt(i / (N - 1)) * (0.84 + rnd() * 0.16);
      const a = i * 2.39996 + rnd() * 0.5; // goldener Winkel: gleichmäßig verteilt
      nodes.push({ x: cx + Math.cos(a) * rx * rr, y: cy + Math.sin(a) * ry * rr, d: 0, parent: 0, p: rnd() * TAU });
    }
    // jeder Knoten hängt am nächsten, der vor ihm liegt (also näher an der Mitte)
    let maxD = 0;
    for (let i = 1; i < N; i++) {
      let best = 0;
      let bestDist = Infinity;
      for (let j = 0; j < i; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < bestDist) {
          bestDist = dist;
          best = j;
        }
      }
      nodes[i].parent = best;
      nodes[i].d = nodes[best].d + 1;
      maxD = Math.max(maxD, nodes[i].d);
    }
    // ein paar Querverbindungen, damit es nach Netz aussieht
    const extra = [];
    for (let i = 1; i < N; i++) {
      let best = -1;
      let bestDist = m * 0.36;
      for (let j = 1; j < N; j++) {
        if (j === i || j === nodes[i].parent || nodes[j].parent === i) continue;
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < bestDist) {
          bestDist = dist;
          best = j;
        }
      }
      if (best > i) extra.push([i, best]);
    }

    const hop = 0.5; // Sekunden von einem Knoten zum nächsten
    const T = Math.max(BEAT * 8, (maxD + 3.2) * hop);
    const nodeR = tiny ? 1.5 : 2.4;
    const pos = nodes.map(() => [0, 0]);

    const draw = function (ctx, t) {
      const front = (t % T) / hop; // wie weit der Impuls gerade ist (in Schritten)
      const sway = m * 0.012;
      for (let i = 0; i < N; i++) {
        pos[i][0] = nodes[i].x + Math.sin(t * 0.5 + nodes[i].p) * sway;
        pos[i][1] = nodes[i].y + Math.cos(t * 0.4 + nodes[i].p) * sway;
      }

      ctx.lineCap = 'round';
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(CREAM, 0.1);
      ctx.beginPath();
      for (const pair of extra) {
        ctx.moveTo(pos[pair[0]][0], pos[pair[0]][1]);
        ctx.lineTo(pos[pair[1]][0], pos[pair[1]][1]);
      }
      ctx.stroke();

      for (let i = 1; i < N; i++) {
        const a = pos[nodes[i].parent];
        const b = pos[i];
        ctx.strokeStyle = rgba(CREAM, 0.2);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();

        // der Impuls läuft diese Verbindung entlang
        const f = clamp(front - nodes[nodes[i].parent].d, 0, 1);
        const after = clamp(1 - (front - nodes[i].d) / 2.4, 0, 1);
        if (f > 0 && after > 0) {
          const x = lerp(a[0], b[0], f);
          const y = lerp(a[1], b[1], f);
          ctx.strokeStyle = rgba(ACCENT, 0.85 * after);
          ctx.lineWidth = tiny ? 1.1 : 1.5;
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(x, y);
          ctx.stroke();
          if (f < 1) {
            ctx.fillStyle = rgba(CREAM, 1);
            ctx.beginPath();
            ctx.arc(x, y, tiny ? 1.4 : 2.2, 0, TAU);
            ctx.fill();
          }
        }
      }

      for (let i = 0; i < N; i++) {
        const reached = front >= nodes[i].d;
        const glow = i === 0 ? Math.max(0.35, clamp(1 - front / 2.4, 0, 1)) : reached ? clamp(1 - (front - nodes[i].d) / 2.4, 0, 1) : 0;
        const r = nodeR * (i === 0 ? 1.7 : 1) * (1 + glow * 0.9);
        if (glow > 0.3 && !tiny) stamp(ctx, 'glow', ACCENT, pos[i][0], pos[i][1], r * 5.5, 0.38 * glow);
        ctx.fillStyle = glow > 0.05 ? rgba(ACCENT, 0.5 + 0.5 * glow) : rgba(CREAM, 0.6);
        ctx.beginPath();
        ctx.arc(pos[i][0], pos[i][1], r, 0, TAU);
        ctx.fill();
      }
    };
    draw.still = hop * Math.min(maxD, 2.6);
    return draw;
  };

  /* --- orbits: zwei, die umeinander kreisen (Wer sind wir) ------------- */
  SCENES.orbits = function (w, h, rnd, data, canvas) {
    canvas.style.background =
      'radial-gradient(circle at 50% 50%, ' + rgba(ACCENT, 0.1) + ', ' + rgba(ACCENT, 0) + ' 62%), #060606';
    const m = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const a = m * 0.3;
    const b = m * 0.17;
    const P = 9; // Sekunden pro Umlauf
    const stars = [];
    for (let i = 0; i < 46; i++) {
      stars.push({ x: rnd() * w, y: rnd() * h, a: 0.08 + rnd() * 0.26, p: rnd() * TAU, s: 0.6 + rnd() * 1.4 });
    }
    const moons = [];
    for (let i = 0; i < 4; i++) {
      moons.push({ a: m * (0.39 + i * 0.045), b: m * (0.23 + i * 0.035), speed: 0.11 + rnd() * 0.1, p: rnd() * TAU, r: 1.4 + rnd() * 1.2 });
    }
    const bodyR = Math.max(4, m * 0.02);

    return function (ctx, t) {
      for (const s of stars) {
        ctx.fillStyle = rgba(CREAM, s.a * (0.6 + 0.4 * Math.sin(t * s.s + s.p)));
        ctx.fillRect(s.x, s.y, 1.5, 1.5);
      }

      const tilt = -0.42 + Math.sin(t * 0.07) * 0.16; // die Bahn kippt langsam hin und her
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const at = (th, ax, by) => {
        const x = Math.cos(th) * ax;
        const y = Math.sin(th) * by;
        return [cx + x * cosT - y * sinT, cy + x * sinT + y * cosT];
      };

      // die Bahnen
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = rgba(CREAM, 0.16);
      ctx.beginPath();
      ctx.ellipse(cx, cy, a, b, tilt, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const mo of moons) {
        ctx.strokeStyle = rgba(CREAM, 0.05);
        ctx.beginPath();
        ctx.ellipse(cx, cy, mo.a, mo.b, tilt, 0, TAU);
        ctx.stroke();
        const p = at(t * mo.speed + mo.p, mo.a, mo.b);
        ctx.fillStyle = rgba(CREAM, 0.6);
        ctx.beginPath();
        ctx.arc(p[0], p[1], mo.r, 0, TAU);
        ctx.fill();
      }

      const th = (t / P) * TAU;
      const A = at(th, a, b);
      const B = at(th + Math.PI, a, b);

      // die Verbindung zwischen den beiden
      ctx.strokeStyle = rgba(CREAM, 0.14);
      ctx.beginPath();
      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(B[0], B[1]);
      ctx.stroke();

      // Leuchtspuren hinter den beiden
      ctx.lineCap = 'round';
      const TRAIL = 34;
      [[0, ACCENT], [Math.PI, CREAM]].forEach(([shift, rgb]) => {
        for (let i = TRAIL; i > 0; i--) {
          const p0 = at(th + shift - i * 0.045, a, b);
          const p1 = at(th + shift - (i - 1) * 0.045, a, b);
          const q = 1 - i / TRAIL;
          ctx.strokeStyle = rgba(rgb, q * q * 0.9);
          ctx.lineWidth = 1 + q * (bodyR * 0.9);
          ctx.beginPath();
          ctx.moveTo(p0[0], p0[1]);
          ctx.lineTo(p1[0], p1[1]);
          ctx.stroke();
        }
      });

      [[A, ACCENT], [B, CREAM]].forEach(([p, rgb]) => {
        stamp(ctx, 'glow', rgb, p[0], p[1], bodyR * 5.5, 0.5);
        ctx.fillStyle = rgba(rgb, 1);
        ctx.beginPath();
        ctx.arc(p[0], p[1], bodyR, 0, TAU);
        ctx.fill();
      });
    };
  };

  /* --- signal: Nachricht raus, Antwort zurück (Kontakt) ---------------- */
  SCENES.signal = function (w, h) {
    const A = [w * 0.2, h * 0.7];
    const B = [w * 0.8, h * 0.3];
    const D = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
    const T = BEAT * 8;
    const r = Math.max(5, Math.min(w, h) * 0.028);
    const fontPx = w < 420 ? 9 : 10.5;

    const draw = function (ctx, t) {
      const u = (t % T) / T;
      const reply = u >= 0.5;                 // erste Hälfte: du schreibst · zweite: wir antworten
      const v = reply ? (u - 0.5) * 2 : u * 2;
      const from = reply ? B : A;
      const to = reply ? A : B;
      const dir = reply ? ang + Math.PI : ang;
      const rgb = reply ? CREAM : ACCENT;

      ctx.lineWidth = 1;
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = rgba(CREAM, 0.18);
      ctx.beginPath();
      ctx.moveTo(A[0], A[1]);
      ctx.lineTo(B[0], B[1]);
      ctx.stroke();
      ctx.setLineDash([]);

      // drei Bögen, die nacheinander losgehen
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.6;
      for (let k = 0; k < 3; k++) {
        const ph = v * 1.3 - k * 0.14;
        if (ph <= 0 || ph >= 1) continue;
        ctx.strokeStyle = rgba(rgb, Math.sin(ph * Math.PI) * 0.8);
        ctx.beginPath();
        ctx.arc(from[0], from[1], ph * D, dir - 0.5, dir + 0.5);
        ctx.stroke();
      }

      // die Nachricht selbst
      const mp = easeInOut(clamp(v * 1.2, 0, 1));
      const mx = lerp(from[0], to[0], mp);
      const my = lerp(from[1], to[1], mp);
      if (mp < 1) {
        ctx.fillStyle = rgba(rgb, 1);
        ctx.beginPath();
        ctx.arc(mx, my, r * 0.55, 0, TAU);
        ctx.fill();
      }

      // die beiden Enden
      const arrive = clamp((v * 1.2 - 0.9) / 0.3, 0, 1) * clamp((1.2 - v * 1.2) / 0.2 + 1, 0, 1);
      [[A, ACCENT, 'Du', reply], [B, CREAM, 'Wir', !reply]].forEach(([p, c, label, receiving]) => {
        const hit = receiving ? Math.sin(clamp(arrive, 0, 1) * Math.PI) : 0;
        ctx.strokeStyle = rgba(c, 0.35 + 0.4 * hit);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p[0], p[1], r * (2.1 + hit * 0.9), 0, TAU);
        ctx.stroke();
        ctx.fillStyle = rgba(c, 1);
        ctx.beginPath();
        ctx.arc(p[0], p[1], r, 0, TAU);
        ctx.fill();
        ctx.font = labelFont(fontPx);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(CREAM, 0.75);
        ctx.fillText(track(label), p[0], p[1] + (p === A ? r * 2.1 + 16 : -(r * 2.1 + 15)));
      });
    };
    draw.still = T * 0.2;
    return draw;
  };

  /* --- contour: Höhenlinien, bei jedem ein eigenes Muster (Porträts) --- */
  SCENES.contour = function (w, h, rnd, data, canvas) {
    const cx = w * (0.42 + rnd() * 0.16);
    const cy = h * (0.44 + rnd() * 0.14);
    const R = Math.hypot(w, h) * 0.64;
    const rings = 14;
    const M = 90;
    const p = [rnd() * TAU, rnd() * TAU, rnd() * TAU];
    const amp = [0.12 + rnd() * 0.07, 0.06 + rnd() * 0.05, 0.035];
    canvas.style.background =
      'radial-gradient(circle at ' + ((cx / w) * 100).toFixed(1) + '% ' + ((cy / h) * 100).toFixed(1) + '%, ' +
      rgba(ACCENT, 0.13) + ', ' + rgba(ACCENT, 0) + ' 68%), #070707';

    const draw = function (ctx, t) {
      const scan = (t * 0.22) % rings; // ein Ring nach dem anderen leuchtet auf
      for (let j = 1; j <= rings; j++) {
        const base = R * (j / rings);
        ctx.beginPath();
        for (let i = 0; i <= M; i++) {
          const a = (i / M) * TAU;
          const k =
            1 +
            amp[0] * Math.sin(2 * a + p[0] + t * 0.16 + j * 0.3) +
            amp[1] * Math.sin(3 * a - p[1] - t * 0.12 + j * 0.21) +
            amp[2] * Math.sin(5 * a + p[2] + t * 0.09);
          const x = cx + Math.cos(a) * base * k;
          const y = cy + Math.sin(a) * base * k * 0.86;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.closePath();
        const dist = Math.min(Math.abs(j - scan), rings - Math.abs(j - scan));
        const hl = Math.max(0, 1 - dist / 1.7);
        ctx.lineWidth = 1 + hl * 0.5;
        ctx.strokeStyle = rgba(CREAM, 0.09 + 0.13 * (1 - j / rings));
        ctx.stroke();
        if (hl > 0.02) {
          ctx.strokeStyle = rgba(ACCENT, hl * 0.7);
          ctx.stroke();
        }
      }
    };
    return draw;
  };

  /* --- offside: die Taktiktafel hinter dem Namen ----------------------- */
  SCENES.offside = function (w, h) {
    const P = (fx, fy) => [w * fx, h * fy];
    const lineX = w * 0.62;
    const defenders = [P(0.592, 0.2), P(0.62, 0.5), P(0.585, 0.8)];
    const passer = P(0.15, 0.66);
    const A0 = P(0.74, 0.33);   // steht im Abseits
    const A1 = P(0.555, 0.33);  // zurück hinter der Linie
    const A2 = P(0.86, 0.42);   // läuft in den freien Raum
    const C = P(0.52, 0.82);    // Kurve des Passes
    const small = w < 420;
    const r = small ? 4.5 : 5.5;
    const fontPx = small ? 9 : 10.5;
    const T = BEAT * 14;

    const draw = function (ctx, t) {
      const u = t % T;
      const fadeAll = u > T - 0.8 ? (T - u) / 0.8 : u < 0.5 ? u / 0.5 : 1;
      ctx.globalAlpha = fadeAll;
      ctx.lineCap = 'round';

      // Spielfeld, nur angedeutet: links der Mittelkreis, rechts der Strafraum
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(CREAM, 0.13);
      ctx.beginPath();
      ctx.arc(0, h / 2, h * 0.3, -Math.PI / 2, Math.PI / 2);
      ctx.moveTo(w, h * 0.16);
      ctx.lineTo(w * 0.915, h * 0.16);
      ctx.lineTo(w * 0.915, h * 0.84);
      ctx.lineTo(w, h * 0.84);
      ctx.moveTo(w, h * 0.36);
      ctx.lineTo(w * 0.968, h * 0.36);
      ctx.lineTo(w * 0.968, h * 0.64);
      ctx.lineTo(w, h * 0.64);
      ctx.stroke();

      const back = easeInOut(clamp((u - 1.5) / 1.3, 0, 1));    // Rücklauf hinter die Linie
      const played = u >= 3.4;                                 // der Pass ist gespielt
      const run = easeInOut(clamp((u - 3.4) / 1.25, 0, 1));    // Lauf in die Tiefe
      const pass = easeOut(clamp((u - 3.4) / 1.15, 0, 1));
      const ax = played ? lerp(A1[0], A2[0], run) : lerp(A0[0], A1[0], back);
      const ay = played ? lerp(A1[1], A2[1], run) : lerp(A0[1], A1[1], back);
      const onside = played || ax <= lineX;

      // die Abseitslinie
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.3;
      ctx.strokeStyle = onside ? rgba(ACCENT, 0.75) : rgba(CREAM, 0.38);
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Verteidiger: hohle Kreise
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = rgba(CREAM, 0.7);
      defenders.forEach((d, i) => {
        ctx.beginPath();
        ctx.arc(d[0], d[1] + Math.sin(t * 1.3 + i * 2) * 1.5, r, 0, TAU);
        ctx.stroke();
      });

      // Passgeber
      ctx.fillStyle = rgba(CREAM, 0.85);
      ctx.beginPath();
      ctx.arc(passer[0], passer[1], r, 0, TAU);
      ctx.fill();

      // Ball und Passweg (eine gebogene Linie durch die Lücke)
      const bez = (q) => {
        const k = 1 - q;
        return [k * k * passer[0] + 2 * k * q * C[0] + q * q * A2[0], k * k * passer[1] + 2 * k * q * C[1] + q * q * A2[1]];
      };
      let ball = [passer[0] + r + 5, passer[1] - 1];
      if (played) {
        ctx.setLineDash([2, 6]);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = rgba(CREAM, 0.45);
        ctx.beginPath();
        for (let i = 0; i <= 24; i++) {
          const pt = bez((pass * i) / 24);
          if (i) ctx.lineTo(pt[0], pt[1]);
          else ctx.moveTo(pt[0], pt[1]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ball = bez(pass);
        if (pass >= 1) ball = [ax - r - 4, ay + 2];
      }
      ctx.fillStyle = rgba(CREAM, 1);
      ctx.beginPath();
      ctx.arc(ball[0], ball[1], 2.6, 0, TAU);
      ctx.fill();

      // Jubel: Ringe, sobald der Ball angekommen ist
      if (u > 4.6) {
        for (let k = 0; k < 2; k++) {
          const q = (u - 4.6 - k * 0.35) / 1.5;
          if (q <= 0 || q >= 1) continue;
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = rgba(ACCENT, (1 - q) * 0.7);
          ctx.beginPath();
          ctx.arc(ax, ay, r + easeOut(q) * h * 0.42, 0, TAU);
          ctx.stroke();
        }
      }

      // der Angreifer: im Abseits hohl und blinkend, onside gefüllt
      if (onside) {
        stamp(ctx, 'glow', ACCENT, ax, ay, r * 4.5, 0.5);
        ctx.fillStyle = rgba(ACCENT, 1);
        ctx.beginPath();
        ctx.arc(ax, ay, r + 0.5, 0, TAU);
        ctx.fill();
      } else {
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = rgba(ACCENT, 0.45 + 0.45 * Math.abs(Math.sin(t * 5)));
        ctx.beginPath();
        ctx.arc(ax, ay, r, 0, TAU);
        ctx.stroke();
      }

      // Beschriftung neben dem Angreifer — im Abseits rechts von ihm,
      // onside links oben, damit sie keinem Verteidiger in die Quere kommt
      ctx.font = labelFont(fontPx);
      ctx.textBaseline = 'middle';
      const off = clamp(1 - back * 2.2, 0, 1);
      if (off > 0) {
        ctx.textAlign = 'left';
        ctx.fillStyle = rgba(CREAM, 0.7 * off);
        ctx.fillText(track('Abseits'), ax + r + 8, ay);
      }
      const on = clamp((u - 2.5) / 0.4, 0, 1);
      if (on > 0) {
        ctx.textAlign = 'right';
        ctx.fillStyle = rgba(ACCENT, on);
        ctx.fillText(track('Onside'), ax - r - 7, ay - r - 5);
      }
      ctx.globalAlpha = 1;
    };
    draw.still = 5.2;
    return draw;
  };

  /* Szenen an ihre <canvas>-Elemente hängen */
  function initScenes() {
    const canvases = Array.prototype.slice.call(document.querySelectorAll('canvas[data-scene]'));
    if (!canvases.length) return;

    const mounts = new Map();

    canvases.forEach((canvas) => {
      const make = SCENES[canvas.dataset.scene];
      if (!make || !canvas.getContext) return;
      const ctx = canvas.getContext('2d');
      const viz = canvas.closest('.viz');
      const seed = parseInt(canvas.dataset.seed, 10) || 1;
      // ruhige Szenen laufen von vornherein mit 30 Bildern pro Sekunde
      const calm = { contour: 1, bokeh: 1, eq: 1, network: 1, focus: 1, signal: 1 };
      const m = { w: 0, h: 0, dpr: 1, scene: null, visible: false, item: null, fps: calm[canvas.dataset.scene] ? 30 : 60 };

      // Liegt ein echtes Foto darüber, braucht es die Animation nicht mehr.
      const img = viz ? viz.querySelector('img') : null;
      function photoIsThere() {
        return !!(img && img.isConnected && img.complete && img.naturalWidth > 0);
      }
      function retire() {
        if (viz) viz.classList.add('has-photo');
        ticker.remove(m.item);
        canvas.style.display = 'none';
      }
      if (img) {
        if (photoIsThere()) retire();
        else img.addEventListener('load', retire, { once: true });
      }

      function build() {
        const rect = canvas.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        if (w < 8 || h < 8) return false;
        if (w === m.w && h === m.h && m.scene) return true;
        // Auflösung: scharf, aber gedeckelt — große Flächen auf sehr dichten
        // Displays würden sonst unnötig viel Rechenarbeit kosten.
        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        const budget = window.innerWidth < 700 ? 1.1e6 : 2.6e6;
        if (w * h * dpr * dpr > budget) dpr = Math.max(1, Math.sqrt(budget / (w * h)));
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        m.dpr = dpr;
        m.w = w;
        m.h = h;
        m.scene = make(w, h, mulberry32(seed * 7919), canvas.dataset, canvas);
        return true;
      }

      function frame(t) {
        if (!m.scene) return;
        // jedes Bild beginnt mit einer leeren Fläche und sauberen Einstellungen
        ctx.setTransform(m.dpr, 0, 0, m.dpr, 0, 0);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.setLineDash([]);
        ctx.clearRect(0, 0, m.w, m.h);
        m.scene(ctx, t);
      }

      m.item = { draw: frame, fps: m.fps };
      m.still = () => {
        if (build()) frame(m.scene.still || 2.4);
      };
      m.show = () => {
        if (photoIsThere()) return;
        m.visible = true;
        if (!build()) return;
        if (reducedMotion) m.still();
        else ticker.add(m.item);
      };
      m.hide = () => {
        m.visible = false;
        ticker.remove(m.item);
      };
      m.resize = () => {
        if (!m.visible || !build()) return;
        if (reducedMotion) m.still();
      };
      mounts.set(canvas, m);
    });

    // nur zeichnen, was (fast) im Bild ist
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const m = mounts.get(entry.target);
          if (!m) return;
          if (entry.isIntersecting) m.show();
          else m.hide();
        });
      }, { rootMargin: '40px 0px' });
      mounts.forEach((m, canvas) => io.observe(canvas));
    } else {
      mounts.forEach((m) => m.show());
    }

    // ändert sich die Größe (Handy gedreht, Fenster gezogen), neu aufbauen
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const m = mounts.get(entry.target);
          if (m) m.resize();
        });
      });
      mounts.forEach((m, canvas) => ro.observe(canvas));
    }

    // Beschriftungen in den Szenen nachziehen, sobald die Schrift geladen ist
    if (reducedMotion && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => mounts.forEach((m) => { if (m.visible) m.still(); }));
    }
  }

  /* ---------------------------------------------------------------------
     4) HANDGEZEICHNETE STRICHE
     Im HTML:  <span class="scribble" data-scribble="underline">Wort</span>
               <em class="scribble" data-scribble="circle">Wort</em>
     Das Skript misst das Wort, zeichnet einen passenden Strich oder Kringel
     und lässt ihn sich "von Hand" ziehen, sobald das Wort im Bild ist.
     Kein Strich ist exakt wie der andere — wie bei echter Handschrift.
  --------------------------------------------------------------------- */
  function initScribbles() {
    const NS = 'http://www.w3.org/2000/svg';
    const els = document.querySelectorAll('[data-scribble]');
    if (!els.length) return;

    // Punktliste -> weiche Kurve (Catmull-Rom als Bézier-Pfad)
    function smoothPath(pts) {
      let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        d +=
          'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) +
          ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) +
          ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return d;
    }

    els.forEach((el, index) => {
      const type = el.dataset.scribble;
      const svg = document.createElementNS(NS, 'svg');
      const path = document.createElementNS(NS, 'path');
      svg.setAttribute('class', 'scribble__svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.appendChild(path);
      el.appendChild(svg);

      let drawn = false;
      let length = 0;
      let lastW = 0;
      let lastH = 0;

      function layout() {
        const W = el.offsetWidth;
        const H = el.offsetHeight;
        if (!W || !H || (W === lastW && H === lastH)) return;
        lastW = W;
        lastH = H;
        const fs = parseFloat(getComputedStyle(el).fontSize) || 32;
        const rnd = mulberry32(977 + index * 131);
        const j = (amount) => (rnd() - 0.5) * 2 * amount * fs; // kleine Unregelmäßigkeit
        const stroke = clamp(fs * 0.052, 1.8, 4.2);
        let pts;

        if (type === 'circle') {
          // ein Kringel um das Wort, der nicht ganz sauber schließt
          const cx = W / 2;
          const cy = H / 2 + fs * 0.03;
          const rx = W / 2 + fs * 0.26;
          const ry = H / 2 + fs * 0.02;
          pts = [];
          const steps = 30;
          const start = -2.5 + j(0.2) / fs;
          const turns = 1.1;
          for (let i = 0; i <= steps; i++) {
            const q = i / steps;
            const a = start + q * TAU * turns;
            const grow = 1 + q * 0.07 + 0.03 * Math.sin(a * 2 + index);
            pts.push([cx + Math.cos(a) * rx * grow, cy + Math.sin(a) * ry * grow]);
          }
        } else {
          // ein Strich unter dem Wort mit kurzem Rückschwung
          const y = fs * 1.05;
          pts = [
            [-fs * 0.04, y + j(0.02)],
            [W * 0.3, y - fs * 0.035 + j(0.012)],
            [W * 0.66, y + fs * 0.02 + j(0.012)],
            [W + fs * 0.05, y - fs * 0.03 + j(0.015)],
          ];
          if (W > fs * 2.2) {
            pts.push([W * 0.84, y + fs * 0.085 + j(0.01)]);
            pts.push([W * 0.5, y + fs * 0.12 + j(0.012)]);
          }
        }

        // Die Zeichenfläche liegt eng um den Strich — so ragt sie nicht über den
        // Bildschirmrand hinaus (das würde auf dem Handy seitliches Scrollen auslösen).
        const margin = stroke + fs * 0.08;
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        pts.forEach((pt) => {
          minX = Math.min(minX, pt[0]);
          maxX = Math.max(maxX, pt[0]);
          minY = Math.min(minY, pt[1]);
          maxY = Math.max(maxY, pt[1]);
        });
        minX -= margin;
        minY -= margin;
        const boxW = Math.ceil(maxX + margin - minX);
        const boxH = Math.ceil(maxY + margin - minY);
        pts.forEach((pt) => {
          pt[0] -= minX;
          pt[1] -= minY;
        });

        svg.setAttribute('width', boxW);
        svg.setAttribute('height', boxH);
        svg.setAttribute('viewBox', '0 0 ' + boxW + ' ' + boxH);
        svg.style.left = minX + 'px';
        svg.style.top = minY + 'px';
        path.setAttribute('d', smoothPath(pts));
        path.style.strokeWidth = stroke + 'px';
        length = path.getTotalLength();
        path.style.transition = 'none';
        path.style.strokeDasharray = length + ' ' + length;
        path.style.strokeDashoffset = drawn ? '0' : String(length);
      }

      function draw() {
        if (drawn) return;
        layout();
        drawn = true;
        if (reducedMotion) {
          path.style.strokeDashoffset = '0';
          return;
        }
        // zwei Bilder abwarten, damit der Startzustand sicher gezeichnet ist
        requestAnimationFrame(() => requestAnimationFrame(() => {
          path.style.transition = 'stroke-dashoffset ' + Math.round(520 + length * 1.1) + 'ms cubic-bezier(0.65, 0, 0.35, 1)';
          path.style.strokeDashoffset = '0';
        }));
      }

      layout();
      if ('ResizeObserver' in window) new ResizeObserver(layout).observe(el);
      else window.addEventListener('resize', layout);

      // Steht das Wort in einer Überschrift, die Wort für Wort hereinkommt,
      // meldet js/script.js, wann sie fertig ist. Sonst: sobald es im Bild ist.
      const host = el.closest('[data-split]');
      if (reducedMotion || !('IntersectionObserver' in window)) {
        draw();
      } else if (host) {
        host.addEventListener('onside:revealed', () => setTimeout(draw, 80), { once: true });
        // Sollte js/script.js gar nicht laden, kommt das Signal nie — dann
        // zeichnet sich der Strich, sobald das Sicherheitsnetz gegriffen hat.
        setTimeout(() => {
          if (document.documentElement.classList.contains('no-anim')) draw();
        }, 3600);
      } else {
        const io = new IntersectionObserver((entries) => {
          if (!entries[0].isIntersecting) return;
          io.disconnect();
          setTimeout(draw, 650);
        }, { threshold: 0.9 });
        io.observe(el);
      }
    });
  }

  /* ---------------------------------------------------------------------
     Los geht's. Jeder Teil startet für sich — fällt einer aus, laufen die
     anderen weiter.
  --------------------------------------------------------------------- */
  [initAmbient, initScenes, initScribbles].forEach((start) => {
    try {
      start();
    } catch (err) {
      console.warn('onside.hq: ein Teil der Animationen konnte nicht starten —', err);
    }
  });
})();
