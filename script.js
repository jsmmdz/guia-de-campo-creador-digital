/* ============================================================
   Guía de Campo del Creador Digital — Acto I
   Instrumento de campo: umbral (radar).
   ============================================================ */

(function () {
  "use strict";

  /* ---------- capacidades: motion + viewport ---------- */

  const params = new URLSearchParams(location.search);
  const staticParam = params.has("static");

  // por decisión de producto, la experiencia anima por defecto para todo el
  // mundo (no se apaga con prefers-reduced-motion) — quien quiera la versión
  // calma puede pedirla explícitamente con ?static=1
  const motionOK = !staticParam;
  // móvil + tablet (táctiles, con gestos de swipe-back) usan el catálogo
  // simple; laptop en adelante usa el scroll-jacking con pin — mismo corte
  // que el breakpoint "tablet" de styles.css (1023px)
  const mobileMQ = window.matchMedia("(max-width: 1023px)");
  let catalogSimple = !motionOK || mobileMQ.matches;

  /* ---------- especímenes (íconos): reservan espacio, aparecen al resolver ---------- */

  document.querySelectorAll(".specimen-chip__frame img").forEach((img) => {
    const reveal = () => {
      img.classList.add("is-loaded");
      img.closest(".specimen-chip__frame").classList.add("is-ready");
    };
    if (img.complete && img.naturalWidth > 0) reveal();
    else img.addEventListener("load", reveal);
  });

  /* ---------- sensor: switch de Cognición Aumentada ---------- */

  const sensor = document.getElementById("sensor");
  if (sensor) {
    sensor.addEventListener("click", () => {
      const on = document.body.classList.toggle("sensor-on");
      sensor.setAttribute("aria-pressed", String(on));
      sensor.querySelector(".sensor__state").textContent = on ? "ON" : "OFF";
    });
  }

  /* ---------- sin GSAP (falla de red): el contenido ya es legible tal cual ---------- */

  if (typeof gsap === "undefined") return;

  // solo ahora, con GSAP confirmado, pasamos al layout animado — si el CDN
  // falla, el body nunca queda con "enhanced" puesto y el contenido sigue
  // legible en su disposición estática
  if (motionOK) document.body.classList.add("enhanced");

  gsap.registerPlugin(ScrollTrigger);
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* ============================================================
     THRESHOLD — Nodo 0
     ============================================================ */

  if (motionOK) {
    const chips = gsap.utils.toArray(".specimen-chip");
    const TILTS = [-8, 6, -5, 8, -7];
    const REV_SECONDS = 80;

    chips.forEach((el, i) => {
      gsap.set(el, { left: 0, top: 0 });
      gsap.set(el.querySelector(".specimen-chip__frame"), { rotation: TILTS[i % TILTS.length] });
    });

    gsap.ticker.add((time) => {
      const narrow = window.innerWidth <= 767;
      // radio a partir del lado corto del viewport: mantiene la órbita casi
      // circular en vez de un óvalo alargado en pantallas anchas
      const base = Math.min(window.innerWidth, window.innerHeight);
      const rx = base * (narrow ? 0.62 : 0.58);
      const ry = base * (narrow ? 0.54 : 0.5);
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const spin = (time * Math.PI * 2) / REV_SECONDS;
      chips.forEach((el, i) => {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / chips.length + spin;
        gsap.set(el, { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
      });
    });

    /* ---------- cometa del cursor sobre el umbral ----------
       réplica del efecto de threejs.paris/tickets: el cursor arrastra una
       cinta luminosa continua (núcleo blanco, medio lavanda, halo azul de
       marca) que se estrecha hacia la cola y se encoge al detenerse, y va
       sembrando chispas que quedan titilando un instante. */
    const trailCanvas = document.querySelector(".threshold__trail");
    if (trailCanvas) {
      const tctx = trailCanvas.getContext("2d");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const TAIL_AGE = 0.55;   // segundos que vive cada punto de la cinta
      const TAIL_MAX = 48;     // puntos máximos de la cinta
      const HEAD_W = 9;        // grosor de la cinta en la cabeza (px)
      let ribbon = [];         // { x, y, t } — trayectoria reciente del cursor
      let sparks = [];         // chispas sueltas que quedan atrás
      let clock = 0;           // reloj propio, alimentado por el ticker
      let wasEmpty = true;

      function resizeTrail() {
        const rect = trailCanvas.getBoundingClientRect();
        trailCanvas.width = Math.max(1, Math.round(rect.width * dpr));
        trailCanvas.height = Math.max(1, Math.round(rect.height * dpr));
        tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resizeTrail();
      window.addEventListener("resize", resizeTrail);

      document.addEventListener("mousemove", (e) => {
        const rect = trailCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

        const prev = ribbon[ribbon.length - 1];
        const dist = prev ? Math.hypot(x - prev.x, y - prev.y) : 0;
        ribbon.push({ x, y, t: clock });
        if (ribbon.length > TAIL_MAX) ribbon.shift();

        // chispas proporcionales a la velocidad, como la lluvia de puntitos
        // que queda tras el cometa en la referencia
        if (prev && dist > 6 && sparks.length < 90) {
          const n = Math.min(3, Math.floor(dist / 18) + 1);
          for (let i = 0; i < n; i++) {
            const back = Math.random();
            sparks.push({
              x: prev.x + (x - prev.x) * back + (Math.random() - 0.5) * 10,
              y: prev.y + (y - prev.y) * back + (Math.random() - 0.5) * 10,
              vx: (Math.random() - 0.5) * 14,
              vy: (Math.random() - 0.5) * 14 - 6,
              born: clock,
              life: 0.5 + Math.random() * 0.7,
              size: 0.8 + Math.random() * 1.6,
            });
          }
        }
      });

      let lastT = null;
      gsap.ticker.add((time) => {
        const dt = lastT === null ? 0 : Math.min(0.05, time - lastT);
        lastT = time;
        clock += dt;

        ribbon = ribbon.filter((p) => clock - p.t < TAIL_AGE);
        sparks = sparks.filter((s) => clock - s.born < s.life);

        // no repintar en vano cuando no hay nada que mostrar
        if (!ribbon.length && !sparks.length) {
          if (!wasEmpty) {
            const r = trailCanvas.getBoundingClientRect();
            tctx.clearRect(0, 0, r.width, r.height);
            wasEmpty = true;
          }
          return;
        }
        wasEmpty = false;

        const rect = trailCanvas.getBoundingClientRect();
        tctx.clearRect(0, 0, rect.width, rect.height);
        tctx.lineCap = "round";
        tctx.lineJoin = "round";

        if (ribbon.length > 1) {
          // tres pasadas sobre la misma trayectoria: halo azul ancho,
          // cuerpo lavanda y núcleo blanco — el grosor y la opacidad
          // crecen de la cola (vieja) a la cabeza (cursor)
          const passes = [
            { w: 3.2, color: [61, 58, 224], a: 0.4 },
            { w: 1.7, color: [155, 160, 255], a: 0.75 },
            { w: 0.8, color: [255, 255, 255], a: 0.95 },
          ];
          passes.forEach((pass) => {
            for (let i = 1; i < ribbon.length; i++) {
              const p0 = ribbon[i - 1];
              const p1 = ribbon[i];
              const prog = i / (ribbon.length - 1);       // 0 cola → 1 cabeza
              const fade = 1 - (clock - p1.t) / TAIL_AGE; // envejecimiento
              tctx.strokeStyle = "rgba(" + pass.color.join(",") + "," + (pass.a * prog * fade).toFixed(3) + ")";
              tctx.lineWidth = Math.max(0.5, HEAD_W * pass.w * prog);
              tctx.beginPath();
              tctx.moveTo(p0.x, p0.y);
              // curva por el punto medio: suaviza los quiebres del sampleo
              tctx.quadraticCurveTo(p0.x, p0.y, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
              tctx.lineTo(p1.x, p1.y);
              tctx.stroke();
            }
          });

          // cabeza: destello sobre la posición actual del cursor
          const head = ribbon[ribbon.length - 1];
          const hg = tctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, HEAD_W * 2.4);
          hg.addColorStop(0, "rgba(255,255,255,0.95)");
          hg.addColorStop(0.35, "rgba(155,160,255,0.55)");
          hg.addColorStop(1, "rgba(61,58,224,0)");
          tctx.fillStyle = hg;
          tctx.beginPath();
          tctx.arc(head.x, head.y, HEAD_W * 2.4, 0, Math.PI * 2);
          tctx.fill();
        }

        sparks.forEach((s) => {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const t = (clock - s.born) / s.life;
          const alpha = (1 - t) * (0.5 + 0.5 * Math.sin((clock - s.born) * 24)); // titilan
          tctx.fillStyle = "rgba(210,215,255," + Math.max(0, alpha).toFixed(3) + ")";
          tctx.beginPath();
          tctx.arc(s.x, s.y, s.size * (1 - t * 0.5), 0, Math.PI * 2);
          tctx.fill();
        });
      });
    }

    document.querySelectorAll(".specimen-chip__frame").forEach((frame, i) => {
      gsap.to(frame, {
        y: "+=" + (6 + (i % 3) * 2),
        rotation: "+=" + (i % 2 === 0 ? 3 : -3),
        duration: 2.8 + (i % 5) * 0.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.3,
      });
    });

    gsap.from("[data-reveal]", { opacity: 0, y: 24, duration: 0.9, ease: "power2.out", stagger: 0.12 });
    gsap.from(".specimen-chip", { opacity: 0, duration: 1.4, ease: "power1.out", stagger: 0.1, delay: 0.3 });

    gsap.set([".threshold__reading", ".threshold__seal"], { autoAlpha: 0 });

    const thresholdTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".threshold",
        start: "top top",
        end: "+=4200",
        pin: true,
        scrub: 1,
      },
    });

    thresholdTl
      .to(".threshold__hero", { autoAlpha: 0, y: -60, duration: 1, ease: "power1.in" })
      .to(".threshold__field, .threshold__sweep", { opacity: 0.32, duration: 1 }, "<");

    thresholdTl.to(".threshold__reading", { autoAlpha: 1, duration: 0.5 });

    const FLIGHTS = [
      { x: -280, y: -170, r: -25 },
      { x: 270, y: -200, r: 20 },
      { x: -240, y: 190, r: -15 },
      { x: 280, y: 150, r: 22 },
      { x: 0, y: -250, r: -18 },
    ];

    document.querySelectorAll(".threshold__fragment").forEach((frag, i) => {
      const emoji = frag.querySelector(".threshold__emoji");
      const f = FLIGHTS[i % FLIGHTS.length];
      thresholdTl.to(frag, { opacity: 1, duration: 0.8, ease: "none" });
      thresholdTl.fromTo(
        emoji,
        { x: f.x, y: f.y, rotation: f.r, scale: 1.9, autoAlpha: 0 },
        { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.8, ease: "power1.out" },
        "<"
      );
      thresholdTl.to({}, { duration: 0.25 });
    });

    thresholdTl.to({}, { duration: 0.5 });
    thresholdTl.to(".threshold__reading", { autoAlpha: 0, y: -40, duration: 0.8 });
    thresholdTl.fromTo(".threshold__seal", { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 1, ease: "power1.out" });
    thresholdTl.to({}, { duration: 0.6 });
  }

  /* ============================================================
     CATALOG — Nodo 1
     ============================================================ */

  const catalog = document.querySelector(".catalog");
  const rail = document.querySelector(".catalog__rail");
  const plates = gsap.utils.toArray(".plate");
  if (!catalog || !rail || !plates.length) return;

  const rootStyle = getComputedStyle(document.documentElement);
  const readVar = (name) => rootStyle.getPropertyValue(name).trim();

  // 8 radios por blob — misma cantidad de puntos en los 6 para poder interpolarse
  const BLOB_RADII = [
    [100, 92, 108, 88, 104, 90, 112, 86],
    [110, 80, 120, 85, 95, 115, 88, 105],
    [95, 120, 85, 110, 100, 125, 90, 98],
    [115, 90, 105, 125, 88, 108, 95, 118],
    [100, 110, 90, 120, 95, 105, 115, 88],
    [105, 95, 115, 90, 120, 100, 88, 112],
  ];

  const SPECIMENS = plates.map((plate, i) => ({
    el: plate,
    n: i + 1,
    name: plate.dataset.name || "",
    color: readVar("--spec-" + (i + 1)),
    deep: readVar("--spec-" + (i + 1) + "-deep"),
    radii: BLOB_RADII[i],
    feed: plate.dataset.feed || null,
  }));

  /* ---------- blobs: paths con la misma estructura de comandos (M + 8×C + Z)
     para poder interpolarse en caliente aunque cambien las coordenadas ---------- */

  function blobPath(radii) {
    const n = radii.length;
    const pts = radii.map((r, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r };
    });
    let d = "M " + pts[0].x.toFixed(2) + "," + pts[0].y.toFixed(2) + " ";
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += "C " + c1x.toFixed(2) + "," + c1y.toFixed(2) + " " + c2x.toFixed(2) + "," + c2y.toFixed(2) + " " + p2.x.toFixed(2) + "," + p2.y.toFixed(2) + " ";
    }
    return d + "Z";
  }

  const blobPaths = SPECIMENS.map((s) => blobPath(s.radii));
  SPECIMENS.forEach((s, i) => {
    const path = s.el.querySelector(".plate__blob-path");
    if (path) path.setAttribute("d", blobPaths[i]);
    s.el.querySelector(".plate__viewport").classList.add("js-ready");
  });

  /* ---------- carga perezosa del feed de video por proximidad + frame-scrubbing ---------- */

  const feedState = new Map(); // idx -> { video, canvas, ctx, ready }

  function ensureFeedLoading(idx) {
    const s = SPECIMENS[idx];
    if (!s || !s.feed || feedState.has(idx)) return;
    const canvas = s.el.querySelector(".plate__canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = "assets/disciplinas/" + s.feed;
    const state = { video, canvas, ctx, ready: false };
    feedState.set(idx, state);

    video.addEventListener("loadeddata", () => {
      state.ready = true;
      canvas.width = video.videoWidth || 600;
      canvas.height = video.videoHeight || 600;
      s.el.querySelector(".plate__viewport").classList.add("has-feed");
    });
    video.addEventListener("error", () => {
      // sin video disponible: el blob se queda como placeholder, nada se rompe.
      // la entrada permanece en el mapa (con ready:false) a propósito, para no
      // reintentar la descarga cada vez que esta tarjeta vuelva a ser vecina.
      state.ready = false;
    });
  }

  function scrubFeed(idx, localProgress) {
    const state = feedState.get(idx);
    if (!state || !state.ready || !state.video.duration) return;
    state.video.currentTime = gsap.utils.clamp(0, state.video.duration - 0.02, localProgress * state.video.duration);
    state.ctx.drawImage(state.video, 0, 0, state.canvas.width, state.canvas.height);
  }

  /* ---------- fondo del campo + registro del HUD ---------- */

  const fieldBg = document.querySelector(".field-bg");
  const hudReg = document.querySelector(".hud__reg");
  const defaultRegText = hudReg ? hudReg.textContent : "";
  let lastIdx = -1;

  function applyProgress(activeFloat) {
    const max = SPECIMENS.length - 1;
    const clamped = gsap.utils.clamp(0, max, activeFloat);
    const idx = Math.min(max, Math.floor(clamped));
    const nextIdx = Math.min(max, idx + 1);
    const localT = clamped - idx;

    const a = SPECIMENS[idx];
    const b = SPECIMENS[nextIdx];
    if (fieldBg) {
      fieldBg.style.setProperty("--field-a", gsap.utils.interpolate(a.color, b.color, localT));
      fieldBg.style.setProperty("--field-b", gsap.utils.interpolate(a.deep, b.deep, localT));
    }

    const morphed = gsap.utils.interpolate(blobPaths[idx], blobPaths[nextIdx], localT);
    SPECIMENS.forEach((s, i) => {
      const p = s.el.querySelector(".plate__blob-path");
      if (!p) return;
      p.setAttribute("d", i === idx || i === nextIdx ? morphed : blobPaths[i]);
    });

    const roundedIdx = Math.round(clamped);
    if (roundedIdx !== lastIdx) {
      lastIdx = roundedIdx;
      ensureFeedLoading(roundedIdx);
      ensureFeedLoading(Math.max(0, roundedIdx - 1));
      ensureFeedLoading(Math.min(max, roundedIdx + 1));
      // solo se refleja en el HUD si de verdad estamos dentro del catálogo:
      // en modo simple, applyProgress ya corre desde el load (ver setupSimple)
      if (hudReg && document.body.classList.contains("in-catalog")) {
        hudReg.textContent = "Espécimen " + (roundedIdx + 1) + "/" + SPECIMENS.length + " — " + SPECIMENS[roundedIdx].name;
      }
    }

    SPECIMENS.forEach((s, i) => {
      const seg = gsap.utils.clamp(0, 1, (clamped - (i - 1)) / 2);
      scrubFeed(i, seg);
    });
  }

  function setInCatalog(active) {
    document.body.classList.toggle("in-catalog", active);
    if (!hudReg) return;
    if (!active) {
      hudReg.textContent = defaultRegText;
    } else if (lastIdx >= 0) {
      hudReg.textContent = "Espécimen " + (lastIdx + 1) + "/" + SPECIMENS.length + " — " + SPECIMENS[lastIdx].name;
    }
  }

  /* ---------- modo mejorado: scroll-jacking vertical -> horizontal con pin ---------- */

  let railTween = null;
  let simpleObserver = null;
  let simpleBoundaryST = null;

  function teardownEnhanced() {
    if (railTween) { railTween.scrollTrigger && railTween.scrollTrigger.kill(); railTween.kill(); railTween = null; }
    gsap.set(rail, { x: 0, clearProps: "x" });
    document.body.classList.remove("catalog-enhanced");
  }

  function teardownSimple() {
    if (simpleObserver) { simpleObserver.disconnect(); simpleObserver = null; }
    if (simpleBoundaryST) { simpleBoundaryST.kill(); simpleBoundaryST = null; }
  }

  function setupEnhanced() {
    document.body.classList.add("catalog-enhanced");
    gsap.set(rail, { x: 0 });

    railTween = gsap.to(rail, {
      x: () => -(plates.length - 1) * window.innerWidth,
      ease: "none",
      scrollTrigger: {
        trigger: catalog,
        start: "top top",
        end: () => "+=" + (plates.length - 1) * window.innerWidth,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onEnter: () => setInCatalog(true),
        onEnterBack: () => setInCatalog(true),
        onLeave: () => setInCatalog(false),
        onLeaveBack: () => setInCatalog(false),
        onUpdate: (self) => applyProgress(self.progress * (plates.length - 1)),
      },
    });
    applyProgress(0);
  }

  function setupSimple() {
    ensureFeedLoading(0);
    simpleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = plates.indexOf(entry.target);
          if (idx === -1) return;
          // el estado in-catalog lo decide únicamente simpleBoundaryST (según
          // scroll vertical de la página); este observer solo detecta CUÁL
          // tarjeta quedó activa dentro del carril horizontal — con root:
          // catalog, su intersección es relativa al propio contenedor y se
          // dispara aunque el catálogo todavía esté fuera del viewport
          applyProgress(idx);
          const s = SPECIMENS[idx];
          const state = feedState.get(idx);
          if (s.feed && state && state.ready && state.video.paused) {
            state.video.loop = true;
            state.video.play().catch(() => {});
          }
        });
      },
      { root: catalog, threshold: 0.6 }
    );
    plates.forEach((p) => simpleObserver.observe(p));

    simpleBoundaryST = ScrollTrigger.create({
      trigger: catalog,
      start: "top center",
      end: "bottom center",
      onEnter: () => setInCatalog(true),
      onLeave: () => setInCatalog(false),
      onEnterBack: () => setInCatalog(true),
      onLeaveBack: () => setInCatalog(false),
    });
  }

  function applyMode() {
    teardownEnhanced();
    teardownSimple();
    if (catalogSimple) setupSimple();
    else setupEnhanced();
    ScrollTrigger.refresh();
  }

  applyMode();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nextSimple = !motionOK || mobileMQ.matches;
      if (nextSimple !== catalogSimple) {
        catalogSimple = nextSimple;
        applyMode();
      }
    }, 250);
  });
})();
