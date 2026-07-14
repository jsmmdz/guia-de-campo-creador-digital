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

  /* ---------- galaxy: fondo de estrellas (OGL/WebGL) ----------
     portado desde reactbits.dev/backgrounds/galaxy — misma lógica comentada
     y reutilizable en RECURSOS/galaxy.js (fuera del repo). Carga OGL por
     import() dinámico desde CDN para no romper el patrón "un solo script.js
     sin bundler": si el CDN falla, el radial-gradient + sweep de CSS que ya
     tiene .threshold siguen de fondo, nada se rompe. */
  function initGalaxy(ctn) {
    if (!ctn) return;
    import("https://esm.sh/ogl@1.0.11")
      .then(({ Renderer, Program, Mesh, Color, Triangle }) => {
        const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

        const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

        // paleta del sitio (--signal, azul-violeta) en vez del verde por
        // defecto del componente original — saturation venía en 0 (gris
        // puro), sin eso uHueShift no tenía ningún efecto visible
        const cfg = {
          focal: [0.5, 0.5],
          rotation: [1.0, 0.0],
          starSpeed: 0.2,
          density: 2.5,
          hueShift: 0,
          speed: 0.8,
          mouseInteraction: true,
          glowIntensity: 0.3,
          saturation: 0.1,
          mouseRepulsion: true,
          repulsionStrength: 1,
          twinkleIntensity: 0.1,
          rotationSpeed: 0.05,
          autoCenterRepulsion: 0,
          transparent: true,
        };

        const renderer = new Renderer({ alpha: cfg.transparent, premultipliedAlpha: false });
        const gl = renderer.gl;
        if (cfg.transparent) {
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          gl.clearColor(0, 0, 0, 0);
        } else {
          gl.clearColor(0, 0, 0, 1);
        }

        let program;
        function resize() {
          renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
          if (program) {
            program.uniforms.uResolution.value = new Color(
              gl.canvas.width,
              gl.canvas.height,
              gl.canvas.width / gl.canvas.height
            );
          }
        }
        window.addEventListener("resize", resize);
        resize();

        const geometry = new Triangle(gl);
        const smoothMouse = { x: 0.5, y: 0.5 };
        const targetMouse = { x: 0.5, y: 0.5 };
        let smoothActive = 0;
        let targetActive = 0;

        program = new Program(gl, {
          vertex: vertexShader,
          fragment: fragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uResolution: { value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height) },
            uFocal: { value: new Float32Array(cfg.focal) },
            uRotation: { value: new Float32Array(cfg.rotation) },
            uStarSpeed: { value: cfg.starSpeed },
            uDensity: { value: cfg.density },
            uHueShift: { value: cfg.hueShift },
            uSpeed: { value: cfg.speed },
            uMouse: { value: new Float32Array([smoothMouse.x, smoothMouse.y]) },
            uGlowIntensity: { value: cfg.glowIntensity },
            uSaturation: { value: cfg.saturation },
            uMouseRepulsion: { value: cfg.mouseRepulsion },
            uTwinkleIntensity: { value: cfg.twinkleIntensity },
            uRotationSpeed: { value: cfg.rotationSpeed },
            uRepulsionStrength: { value: cfg.repulsionStrength },
            uMouseActiveFactor: { value: 0 },
            uAutoCenterRepulsion: { value: cfg.autoCenterRepulsion },
            uTransparent: { value: cfg.transparent },
          },
        });

        const mesh = new Mesh(gl, { geometry, program });
        ctn.appendChild(gl.canvas);

        function update(t) {
          requestAnimationFrame(update);
          program.uniforms.uTime.value = t * 0.001;
          program.uniforms.uStarSpeed.value = (t * 0.001 * cfg.starSpeed) / 10.0;

          const lerp = 0.05;
          smoothMouse.x += (targetMouse.x - smoothMouse.x) * lerp;
          smoothMouse.y += (targetMouse.y - smoothMouse.y) * lerp;
          smoothActive += (targetActive - smoothActive) * lerp;

          program.uniforms.uMouse.value[0] = smoothMouse.x;
          program.uniforms.uMouse.value[1] = smoothMouse.y;
          program.uniforms.uMouseActiveFactor.value = smoothActive;

          renderer.render({ scene: mesh });
        }
        requestAnimationFrame(update);

        // el componente original escuchaba mousemove sobre su propio
        // contenedor; acá escuchamos en document (mismo patrón que ya usaba
        // el cometa del cursor que reemplaza) porque el contenido del
        // umbral (hero, z-index más alto) cubre toda el área y absorbería
        // el evento antes de que llegue al fondo
        if (cfg.mouseInteraction) {
          document.addEventListener("mousemove", (e) => {
            const rect = ctn.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;
            const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
            targetActive = inside ? 1.0 : 0.0;
            if (inside) {
              targetMouse.x = x;
              targetMouse.y = y;
            }
          });
        }
      })
      .catch(() => {
        // sin conexión al CDN de OGL: se queda el radial-gradient + sweep
        // de fondo que ya existían, nada se rompe
      });
  }

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

    /* ---------- galaxy: fondo de estrellas del umbral ----------
       portado desde reactbits.dev/backgrounds/galaxy (OGL/WebGL) a vanilla —
       versión reutilizable con comentarios en RECURSOS/galaxy.js. Reemplaza
       el cometa del cursor (no era definitivo, se retiró a pedido). */
    initGalaxy(document.querySelector(".threshold__galaxy"));

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
