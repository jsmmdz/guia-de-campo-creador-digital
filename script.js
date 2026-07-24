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
  // el catálogo usa scroll-jacking con pin (setupEnhanced) en TODOS los
  // breakpoints por defecto — a pedido explícito, el input sigue siendo
  // 100% scroll vertical incluso en touch (el pin no exige swipe
  // horizontal, solo traduce scroll vertical normal en desplazamiento
  // horizontal visual). El modo simple (setupSimple, stack vertical sin
  // pin) queda como fallback de motionOK=false (?static=1) — no como
  // rama de mobile/tablet. Antes esto se cortaba por mobileMQ (≤1023px)
  // porque el pin podía chocar con el gesto nativo de "volver atrás"
  // deslizando desde el borde en navegadores móviles — riesgo conocido,
  // aceptado a pedido del usuario; probar ese gesto específicamente en
  // dispositivos reales antes de dar esto por cerrado.
  const mobileMQ = window.matchMedia("(max-width: 1023px)");
  let catalogSimple = !motionOK;

  // conexión de datos realmente limitada (ahorro de datos activado por el
  // usuario, o red 2G): se usa más abajo para saltar initGalaxy/
  // initAsciiText (WebGL puro decorativo, sin efecto en el contenido) y
  // reusar el mismo fallback gracioso que ya existe para cuando el CDN
  // falla — texto real + gradient/sweep de CSS, sin estado nuevo que
  // mantener. SOLO señales de conexión, nunca de hardware: una primera
  // versión también chequeaba deviceMemory/hardwareConcurrency <= 4, y eso
  // apagaba las animaciones en casi cualquier celular de gama media (la
  // mayoría reporta exactamente 4GB / 4 núcleos) — contradice la decisión
  // de producto "el sitio anima siempre" (ver CLAUDE.md). navigator.
  // connection no existe en Safari/iOS; ahí queda simplemente en false.
  const conn = navigator.connection;
  const isConstrained = !!(
    conn && (conn.saveData || ["slow-2g", "2g"].includes(conn.effectiveType))
  );

  // interactividad de puntero (mouse/touch) de galaxy y del texto ASCII —
  // decisión explícita del usuario: en móvil/tablet (mismo corte que
  // mobileMQ, ≤1023px) quedaba pesada. El efecto visual (fondo animado,
  // texto ASCII con onda) se mantiene igual ahí; sale solo la parte que
  // reacciona al dedo/mouse (repulsión de estrellas, rotación/hue del
  // texto). En laptop+ sigue reaccionando como antes.
  const pointerFxOK = !mobileMQ.matches;

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
    if (!ctn) return Promise.resolve(null);
    return import("https://esm.sh/ogl@1.0.11")
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

#define NUM_LAYER ${(mobileMQ.matches ? 2 : 4).toFixed(1)}
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
          // menos estrellas en móvil/tablet (pedido explícito del usuario,
          // "reducir la cantidad") — density más baja = grilla de estrellas
          // más grande/espaciada, además de menos capas (NUM_LAYER, ver
          // fragment shader arriba)
          density: mobileMQ.matches ? 1.6 : 2.5,
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
        // debounce ~200ms, mismo patrón que ya usa el catálogo (resizeTimer,
        // más abajo en el archivo) — sin esto, renderer.setSize() (que
        // redimensiona el framebuffer de WebGL) se ejecuta en cada evento
        // crudo de "resize", y el navegador dispara varios seguidos en
        // mobile (p.ej. al ocultar/mostrar la barra de direcciones al
        // hacer scroll — justo la interacción reportada como lenta).
        let galaxyResizeTimer = null;
        window.addEventListener("resize", () => {
          clearTimeout(galaxyResizeTimer);
          galaxyResizeTimer = setTimeout(resize, 200);
        });
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

        // en móvil/tablet el fondo queda estático tras el primer frame —
        // pedido explícito del usuario ("pausar el movimiento de las
        // estrellas"): a diferencia de pause()/resume() (que solo evitan
        // renderizar cuando el Umbral no se ve), esto elimina el costo por
        // frame también mientras SÍ se ve. El fondo sigue apareciendo
        // (no es isConstrained/CDN caído), solo no se anima ahí.
        const animateGalaxy = !mobileMQ.matches;

        // rafId guardado (en vez de solo llamar requestAnimationFrame "a
        // ciegas") para poder pausar/reanudar el loop desde afuera —ver
        // pause()/resume() más abajo y setThresholdVisible() donde se usan—
        // sin este id, cancelAnimationFrame no tiene qué cancelar y el
        // shader de pantalla completa sigue renderizando a 60fps aunque el
        // Umbral ya haya salido de vista (scrolleado al Catálogo).
        let rafId = null;
        function update(t) {
          rafId = animateGalaxy ? requestAnimationFrame(update) : null;
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
        rafId = requestAnimationFrame(update);

        // el componente original escuchaba mousemove sobre su propio
        // contenedor; acá escuchamos en document (mismo patrón que ya usaba
        // el cometa del cursor que reemplaza) porque el contenido del
        // umbral (hero, z-index más alto) cubre toda el área y absorbería
        // el evento antes de que llegue al fondo. Sin listener en móvil/
        // tablet (pointerFxOK, ver arriba): uMouse/uMouseActiveFactor
        // quedan en sus valores neutros iniciales y la repulsión del
        // shader nunca se activa ahí.
        if (cfg.mouseInteraction && pointerFxOK) {
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

        // handle para pausar/reanudar el loop de render desde afuera (ver
        // setThresholdVisible más abajo) sin apagar el efecto — se sigue
        // "animando siempre" mientras el Umbral está en pantalla, solo deja
        // de gastar CPU/GPU cuando el usuario ya scrolleó a otra sección.
        return {
          pause() {
            if (rafId !== null) {
              cancelAnimationFrame(rafId);
              rafId = null;
            }
          },
          resume() {
            // en móvil/tablet (animateGalaxy=false) nunca reinicia el loop
            // continuo — el fondo queda estático a propósito, ver arriba
            if (animateGalaxy && rafId === null) rafId = requestAnimationFrame(update);
          },
        };
      })
      .catch(() => {
        // sin conexión al CDN de OGL: se queda el radial-gradient + sweep
        // de fondo que ya existían, nada se rompe
        return null;
      });
  }

  /* ---------- ASCIIText: la palabra "Digital" del hero como arte ASCII ----------
     portado desde reactbits.dev/text-animations/ascii-text (Three.js) — misma
     lógica comentada y reutilizable en RECURSOS/ascii-text.js (fuera del
     repo). Carga Three.js por import() dinámico desde CDN, mismo patrón que
     OGL en initGalaxy. El texto real de "Digital" se queda en el DOM como
     respaldo (accesibilidad + CDN caído) y styles.css lo desvanece recién
     cuando la promesa resuelve con éxito (clase is-ready, ver más abajo).

     Cambio deliberado sobre el source original de reactbits (no reintroducir):
     tenía DOS listeners de mousemove independientes con distinto espacio de
     coordenadas (uno en `document` para el hue-rotate, otro en el contenedor
     para la rotación del mesh) — solo daban un ángulo correcto si el
     contenedor ocupaba toda la pantalla desde (0,0). Acá, al vivir dentro
     del título y no detrás de nada con z-index más alto, alcanza un solo
     listener en el contenedor que alimenta ambos efectos. */
  function initAsciiText(ctn) {
    if (!ctn) return Promise.resolve(null);
    // caja de referencia = el wrapper que tiene el tamaño real de "Digital"
    // (el mismo que ocuparía el texto plano, igual a "Creador"). ctn (el
    // propio .ascii-text-container) es MÁS GRANDE que esta caja (ver
    // inset negativo en styles.css) — le da a la cámara margen real de
    // frustum para la rotación/onda. El plano se dimensiona según refEl,
    // no según ctn, así el texto renderiza a tamaño completo y el margen
    // extra queda solo para el movimiento (ver CanvAscii más abajo).
    const refEl = ctn.closest(".threshold__title-digital") || ctn;
    const cfg = {
      text: "DIGITAL",
      // grilla más gruesa = menos celdas que procesar por frame en
      // asciify() (loop de getImageData sobre cols×rows) — 7 iba pesado y
      // trababa. Mobile/tablet (mismo corte que catalogSimple, ≤1023px)
      // sube más todavía: menos CPU disponible y la palabra ya renderiza
      // más chica ahí.
      asciiFontSize: mobileMQ.matches ? 6 : 8,
      textFontSize: 200,
      textColor: "#fdf9f3",
      // relativo a refEl (la caja real de "Digital"), no a ctn (que ahora
      // es más grande a propósito) — 0.98 ya es prácticamente el tamaño
      // completo, igual a "Creador". El margen para rotación/onda ya no
      // sale de achicar el texto: sale del espacio extra entre ctn y
      // refEl (ver inset en styles.css).
      fillRatio: 0.98,
      // reescaladas al tamaño real del plano en px (ver uWaveScale en el
      // vertex shader) — a la escala vieja (unidades de mundo ~20) las
      // amplitudes 0.5/0.15/1.0 eran visibles; a escala de píxeles reales
      // sin reescalar habrían sido menos de 1px, invisibles.
      enableWaves: true,
      rotationRange: 0.15,
      // escuchar el mouse sobre todo el hero (eyebrow + título + query),
      // no solo el <h1> — cuanto más grande el área, menos hace falta
      // precisión de píxel para que se sienta controlado. Cae de nuevo al
      // propio contenedor si por algún motivo no encuentra el hero.
      trackElem: ctn.closest(".threshold__hero") || ctn,
      refEl,
    };

    return import("https://esm.sh/three@0.160.0")
      .then((THREE) => {
        const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;
uniform float uWaveScale;

void main() {
    vUv = uv;
    float time = uTime * 5.;

    float waveFactor = uEnableWaves;

    vec3 transformed = position;

    // las amplitudes 0.5/0.15/1.0 y la frecuencia (usar position.xy tal
    // cual) están calibradas para un plano de referencia de 20 unidades de
    // alto — el tamaño original del port antes de calibrar la cámara a
    // píxeles reales. uWaveScale = planeH real / 20 reescala ambas cosas:
    // la posición se "comprime" de vuelta a la escala de referencia antes
    // de entrar al seno (mismo número de ondas visibles sin importar el
    // tamaño real en px del contenedor) y la amplitud se multiplica por la
    // misma escala (así el desplazamiento es un % consistente del tamaño
    // del plano, no una cantidad fija de unidades que a escala de píxeles
    // reales queda invisible).
    transformed.x += sin(time + position.y / uWaveScale) * 0.5 * uWaveScale * waveFactor;
    transformed.y += cos(time + position.z / uWaveScale) * 0.15 * uWaveScale * waveFactor;
    transformed.z += sin(time + position.x / uWaveScale) * uWaveScale * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

        const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;
uniform float uChroma;

void main() {
    float time = uTime;
    vec2 pos = vUv;

    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01 * uChroma).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01 * uChroma).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01 * uChroma).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

        const mapRange = (n, start, stop, start2, stop2) =>
          ((n - start) / (stop - start)) * (stop2 - start2) + start2;

        class AsciiFilter {
          constructor(renderer, { fontSize, fontFamily, charset, invert } = {}) {
            this.renderer = renderer;
            this.domElement = document.createElement("div");
            this.domElement.style.position = "absolute";
            this.domElement.style.top = "0";
            this.domElement.style.left = "0";
            this.domElement.style.width = "100%";
            this.domElement.style.height = "100%";

            this.pre = document.createElement("pre");
            this.domElement.appendChild(this.pre);

            this.canvas = document.createElement("canvas");
            this.context = this.canvas.getContext("2d");
            this.domElement.appendChild(this.canvas);

            this.deg = 0;
            this.mouse = { x: 0, y: 0 };
            this.center = { x: 0, y: 0 };
            this.invert = invert ?? true;
            this.fontSize = fontSize ?? 12;
            this.fontFamily = fontFamily ?? "'Courier New', monospace";
            this.charset = charset ?? ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

            this.context.webkitImageSmoothingEnabled = false;
            this.context.mozImageSmoothingEnabled = false;
            this.context.msImageSmoothingEnabled = false;
            this.context.imageSmoothingEnabled = false;
          }

          setSize(width, height) {
            this.width = width;
            this.height = height;
            this.renderer.setSize(width, height);
            this.reset();
            this.center = { x: width / 2, y: height / 2 };
          }

          reset() {
            this.pre.style.fontFamily = this.fontFamily;
            this.pre.style.fontSize = `${this.fontSize}px`;

            // medir el ancho de carácter en el DOM real (un span dentro del
            // propio <pre>), NO con measureText() del canvas 2D como hacía
            // el original: las dos mediciones pueden diferir (cara de la
            // fuente aún no cargada para el canvas, CSS heredado que
            // measureText no ve). Si la grilla se calcula con un ancho y el
            // <pre> renderiza con otro, el texto ASCII queda más ancho que
            // el canvas estirado — ese era el "desfase"/fantasma entre las
            // dos capas (medido: grilla a 3.54px/carácter vs mono real a
            // 4.8px → <pre> 36% más ancho que el contenedor).
            const probe = document.createElement("span");
            probe.textContent = "A".repeat(50);
            this.pre.textContent = "";
            this.pre.appendChild(probe);
            const charW = probe.getBoundingClientRect().width / 50 || this.fontSize * 0.6;
            this.pre.removeChild(probe);

            this.cols = Math.floor(this.width / charW);
            this.rows = Math.floor(this.height / this.fontSize);

            this.canvas.width = this.cols;
            this.canvas.height = this.rows;
          }

          render(scene, camera) {
            this.renderer.render(scene, camera);

            const w = this.canvas.width;
            const h = this.canvas.height;
            this.context.clearRect(0, 0, w, h);
            if (this.context && w && h) {
              this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
            }

            this.asciify(this.context, w, h);
            this.hue();
          }

          get dx() {
            return this.mouse.x - this.center.x;
          }

          get dy() {
            return this.mouse.y - this.center.y;
          }

          hue() {
            const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
            this.deg += (deg - this.deg) * 0.075;
            this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
          }

          asciify(ctx, w, h) {
            if (w && h) {
              const imgData = ctx.getImageData(0, 0, w, h).data;
              let str = "";
              for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                  const i = x * 4 + y * 4 * w;
                  const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];

                  if (a === 0) {
                    str += " ";
                    continue;
                  }

                  let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
                  let idx = Math.floor((1 - gray) * (this.charset.length - 1));
                  if (this.invert) idx = this.charset.length - idx - 1;
                  str += this.charset[idx];
                }
                str += "\n";
              }
              this.pre.innerHTML = str;
            }
          }
        }

        class CanvasTxt {
          constructor(txt, { fontSize = 200, fontFamily = "Arial", color = "#fdf9f3" } = {}) {
            this.canvas = document.createElement("canvas");
            this.context = this.canvas.getContext("2d");
            this.txt = txt;
            this.fontSize = fontSize;
            this.fontFamily = fontFamily;
            this.color = color;

            this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
          }

          resize() {
            this.context.font = this.font;
            const metrics = this.context.measureText(this.txt);

            const textWidth = Math.ceil(metrics.width) + 20;
            const textHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + 20;

            this.canvas.width = textWidth;
            this.canvas.height = textHeight;
          }

          render() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = this.color;
            this.context.font = this.font;

            const metrics = this.context.measureText(this.txt);
            const yPos = 10 + metrics.actualBoundingBoxAscent;

            this.context.fillText(this.txt, 10, yPos);
          }

          get width() {
            return this.canvas.width;
          }

          get height() {
            return this.canvas.height;
          }

          get texture() {
            return this.canvas;
          }
        }

        class CanvAscii {
          constructor(
            { text, asciiFontSize, textFontSize, textColor, fillRatio, enableWaves, rotationRange, trackElem, refEl },
            containerElem,
            width,
            height
          ) {
            this.textString = text;
            this.asciiFontSize = asciiFontSize;
            this.textFontSize = textFontSize;
            this.textColor = textColor;
            this.fillRatio = fillRatio;
            // caja de referencia (el tamaño real de "Digital", ver
            // initAsciiText) — el plano se dimensiona según ESTA, no según
            // el contenedor propio (que es más grande a propósito, ver
            // styles.css). Cae al propio contenedor si no se pasó una.
            this.refEl = refEl || containerElem;
            this.container = containerElem;
            // el mouse se escucha en un elemento más amplio que el propio
            // contenedor visual (ver initAsciiText más abajo) — "Digital" es
            // una sola palabra, muy chica, y exigir que el cursor esté
            // pixel-perfecto encima para que reaccione se siente como que no
            // responde. El área de escucha es más grande; el mapeo a
            // rotación sigue acotado a los límites del contenedor visual
            // (ver onMouseMove/updateRotation), así que igual queda saturado
            // y controlado cerca de los bordes, no se dispara sin límite.
            this.trackElem = trackElem || containerElem;
            this.width = width;
            this.height = height;
            this.enableWaves = enableWaves;
            this.rotationRange = rotationRange;

            // cámara de perspectiva con FOV chico y distancia calculada
            // para que el frustum a z=0 mida EXACTO width×height en px
            // (1 unidad de mundo = 1px CSS). Ni el FOV 45 del original
            // (el borde cercano crecía ~35% al rotar y recortaba las
            // letras contra el frustum) ni la ortográfica que se probó
            // después (sin perspectiva la rotación no produce inclinación
            // visible — el hover "no hacía nada"). Con FOV 18 el tilt se
            // ve, pero el crecimiento del borde cercano queda acotado
            // (~8% a rotación máxima), cubierto por el margen de fillRatio.
            this.fov = 18;
            this.camera = new THREE.PerspectiveCamera(this.fov, this.width / this.height, 1, 10000);
            this.camera.position.z = this.cameraDistance(this.height);

            this.scene = new THREE.Scene();
            this.mouse = { x: this.width / 2, y: this.height / 2 };

            this.onMouseMove = this.onMouseMove.bind(this);
          }

          // distancia a la que el frustum vertical mide exactamente h px
          cameraDistance(h) {
            return h / 2 / Math.tan((this.fov * Math.PI) / 360);
          }

          async init() {
            try {
              await document.fonts.load(`600 ${this.textFontSize}px "IBM Plex Mono"`);
              // la cara 400 (la que usa el <pre> del filtro ASCII) también,
              // ANTES de medir la grilla: el original solo cargaba 600/500,
              // el <pre> renderizaba en 400 con la fuente de respaldo y al
              // llegar la mono real cambiaba el ancho de carácter — otra
              // fuente del desfase entre grilla y texto.
              await document.fonts.load(`400 ${this.asciiFontSize}px "IBM Plex Mono"`);
            } catch (e) {
              // sigue con fuente de respaldo si la carga falla
            }
            await document.fonts.ready;

            this.setMesh();
            this.setRenderer();
          }

          setMesh() {
            this.textCanvas = new CanvasTxt(this.textString, {
              fontSize: this.textFontSize,
              fontFamily: "IBM Plex Mono",
              color: this.textColor,
            });
            this.textCanvas.resize();
            this.textCanvas.render();

            this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
            this.texture.minFilter = THREE.NearestFilter;

            // el plano se dimensiona según refEl (la caja real de
            // "Digital", ver constructor) — NO según this.width/height
            // (el propio contenedor, deliberadamente más grande, ver
            // styles.css). Así el texto renderiza a tamaño completo,
            // igual a "Creador", y el espacio de sobra entre refEl y el
            // contenedor queda libre para que la rotación/onda tengan
            // margen sin tocar el borde del frustum. Se estira a AMBAS
            // dimensiones (object-fit: fill, no contain): "DIGITAL" en
            // mono es más ancha por unidad de alto que la palabra en
            // Archivo que reemplaza, así que contain la dejaba más baja
            // que "CREADOR"; el estirado resultante no se nota tras la
            // rasterización ASCII y con eso las alturas sí calzan.
            const refRect = this.refEl.getBoundingClientRect();
            const planeW = refRect.width * this.fillRatio;
            const planeH = refRect.height * this.fillRatio;

            this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
            this.material = new THREE.ShaderMaterial({
              vertexShader,
              fragmentShader,
              transparent: true,
              uniforms: {
                uTime: { value: 0 },
                mouse: { value: 1.0 },
                uTexture: { value: this.texture },
                uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
                // ver nota en el vertex shader — reescala la onda al
                // tamaño real del plano en px (referencia: 20 unidades)
                uWaveScale: { value: planeH / 20 },
                // aberración cromática (separación de canales r/g/b del
                // fragment shader): en desktop es un fringe sutil porque el
                // canvas de asciify() tiene resolución alta (~160×20). En
                // móvil/tablet ese canvas es mucho más chico y encima se
                // downsamplea con imageSmoothingEnabled:false (nearest-
                // neighbor, ver AsciiFilter) — el mismo fringe de un par de
                // píxeles queda una fracción enorme de cada letra y se ve
                // como bloques de color sólidos en vez de texto (reportado
                // por el usuario en un celular real). Se apaga por completo
                // ahí; en laptop+ sigue igual que antes.
                uChroma: { value: mobileMQ.matches ? 0 : 1 },
              },
            });

            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.scene.add(this.mesh);
          }

          setRenderer() {
            this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
            this.renderer.setPixelRatio(1);
            this.renderer.setClearColor(0x000000, 0);

            this.filter = new AsciiFilter(this.renderer, {
              fontFamily: "IBM Plex Mono",
              fontSize: this.asciiFontSize,
              invert: true,
            });

            this.container.appendChild(this.filter.domElement);
            this.setSize(this.width, this.height);

            // sin listener en móvil/tablet (pointerFxOK, ver arriba):
            // this.mouse/filter.mouse quedan centrados (valores iniciales)
            // y updateRotation()/hue() convergen a su estado neutro (sin
            // tilt, sin hue-rotate) ahí — el texto se sigue animando igual
            // (onda + fade).
            if (pointerFxOK) {
              this.trackElem.addEventListener("mousemove", this.onMouseMove);
              this.trackElem.addEventListener("touchmove", this.onMouseMove);
            }
          }

          setSize(w, h) {
            this.width = w;
            this.height = h;

            // recalibrar el frustum a los px reales del contenedor (la
            // distancia depende del alto, ver cameraDistance)
            this.camera.aspect = w / h;
            this.camera.position.z = this.cameraDistance(h);
            this.camera.updateProjectionMatrix();

            this.filter.setSize(w, h);
            this.filter.mouse = { x: w / 2, y: h / 2 };

            this.center = { x: w / 2, y: h / 2 };
          }

          load() {
            this.animate();
          }

          onMouseMove(evt) {
            const e = evt.touches ? evt.touches[0] : evt;
            const bounds = this.container.getBoundingClientRect();
            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;
            this.mouse = { x, y };
            this.filter.mouse = { x, y };
          }

          animate() {
            const animateFrame = () => {
              this.animationFrameId = requestAnimationFrame(animateFrame);
              this.render();
            };
            animateFrame();
          }

          render() {
            const time = new Date().getTime() * 0.001;

            // el texto "DIGITAL" nunca cambia — redibujarlo al canvas y
            // resubir la textura a la GPU en cada frame (como hacía el
            // original) es puro desperdicio. Ya se dibujó una vez en
            // setMesh(); acá no hace falta tocarlo de nuevo.
            this.mesh.material.uniforms.uTime.value = Math.sin(time);

            this.updateRotation();
            this.filter.render(this.scene, this.camera);
          }

          updateRotation() {
            // el original de reactbits asume un contenedor a pantalla completa,
            // donde el mouse casi no sale de sus límites — acá el contenedor es
            // una sola palabra, muy chico, así que el cursor se sale todo el
            // tiempo. Sin clamp, mapRange extrapola sin límite fuera de [0,w]/
            // [0,h] y la rotación se dispara a ángulos absurdos, plegando la
            // malla (con desplazamiento de onda) sobre sí misma — eso es el
            // "se corta"/glitch de colores que se ve en vez del texto.
            const mx = Math.max(0, Math.min(this.width, this.mouse.x));
            const my = Math.max(0, Math.min(this.height, this.mouse.y));
            const range = this.rotationRange;
            const x = mapRange(my, 0, this.height, range, -range);
            const y = mapRange(mx, 0, this.width, -range, range);

            this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
            this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;
          }

          clear() {
            this.scene.traverse((obj) => {
              if (obj.isMesh && typeof obj.material === "object" && obj.material !== null) {
                Object.keys(obj.material).forEach((key) => {
                  const matProp = obj.material[key];
                  if (matProp !== null && typeof matProp === "object" && typeof matProp.dispose === "function") {
                    matProp.dispose();
                  }
                });
                obj.material.dispose();
                obj.geometry.dispose();
              }
            });
            this.scene.clear();
          }

          dispose() {
            cancelAnimationFrame(this.animationFrameId);
            if (this.filter && this.filter.domElement.parentNode) {
              this.container.removeChild(this.filter.domElement);
            }
            this.trackElem.removeEventListener("mousemove", this.onMouseMove);
            this.trackElem.removeEventListener("touchmove", this.onMouseMove);
            this.clear();
            if (this.renderer) {
              this.renderer.dispose();
              this.renderer.forceContextLoss();
            }
          }
        }

        let instance = null;

        async function mount(w, h) {
          instance = new CanvAscii(cfg, ctn, w, h);
          await instance.init();
          instance.load();
        }

        // instance se asigna sincrónicamente como primera línea de mount(),
        // antes del primer await — así que llamar mount() acá Y dejar el
        // ResizeObserver abajo no genera doble montaje (el callback del
        // observer, si llega, ve instance ya asignado). Hace falta esta
        // medición inmediata además del observer: en algunos entornos (visto
        // en preview headless) el primer callback de ResizeObserver puede no
        // llegar nunca — sin este respaldo, el contenedor se queda vacío para
        // siempre aunque ya tenga tamaño real al montar.
        const initialRect = ctn.getBoundingClientRect();
        // el caller usa la resolución de esta promesa para recién ahí
        // desvanecer el texto real y mostrar el contenedor (ver script.js,
        // llamada a initAsciiText) — si resolviera antes de que mount()
        // termine, quedaría un hueco vacío entre "se esconde el texto real"
        // y "aparece el canvas", que es justo lo que se ve si is-ready se
        // agrega apenas carga Three.js en vez de esperar al montaje real.
        const ready =
          initialRect.width > 0 && initialRect.height > 0 ? mount(initialRect.width, initialRect.height) : Promise.resolve();

        const ro = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (!entry) return;
          const { width, height } = entry.contentRect;
          if (width === 0 || height === 0) return;

          if (!instance) {
            mount(width, height);
          } else if (instance.filter) {
            instance.setSize(width, height);
          }
        });
        ro.observe(ctn);

        return ready.then(() => ({ destroy: () => { ro.disconnect(); if (instance) instance.dispose(); } }));
      })
      .catch(() => null);
  }

  /* ---------- BlurText: reveal de texto letra por letra con blur ----------
     Portado desde reactbits.dev/text-animations/blur-text (React +
     motion/react) a vanilla — versión reutilizable con comentarios más
     extensos en RECURSOS/componentes/texto-storytelling.js. Acá NO dispara
     nada por sí sola (a diferencia del original, que usa su propio
     IntersectionObserver): solo separa el texto en spans y los deja en su
     estado "from" (blureado/corrido) — quien la llama decide cómo animar el
     "to". Se usa para enganchar el reveal al thresholdTl con scrub que ya
     pinea el Nodo 0 (ver más abajo), en vez de sumar un segundo mecanismo de
     scroll desacoplado del real (ver error #5 en CLAUDE.md).

     Estructura de DOS niveles (palabra > letra), no una lista plana de
     letras: CSS permite un punto de corte de línea entre dos cajas
     inline-block adyacentes aunque no haya espacio en blanco entre ellas
     (se tratan como unidades atómicas sueltas) — una lista plana de
     `<span class="threshold__letter">` parte palabras a la mitad
     ("complejos" → "co" / "mplejos") apenas el texto ocupa más de una
     línea, que es el caso normal acá. Por eso cada palabra se envuelve
     además en un `<span class="threshold__word">` con white-space:nowrap
     (ver styles.css) — el navegador entonces solo puede partir línea
     ANTES/DESPUÉS de una palabra completa, nunca entre sus letras.

     Deja intactos los nodos que ya son elementos (p.ej. el <span
     class="threshold__emoji"> dentro de cada fragmento de "reading", que ya
     tiene su propio vuelo animado aparte) — solo toca nodos de texto. Los
     espacios en blanco no se envuelven en su propio span: quedan como
     texto plano entre los contenedores de palabra, así el navegador sigue
     partiendo líneas ahí con normalidad. */
  function splitBlurText(el, opts = {}) {
    const {
      by = "letters",
      direction = "bottom",
      distance = 20,
      blur = 8,
      opacity,
      letterClass = "threshold__letter",
      wordClass = "threshold__word",
    } = opts;

    const targets = [];

    // childNodes es una NodeList viva y node.replaceWith() la modifica
    // mientras se recorre — copiar a array antes de iterar.
    Array.from(el.childNodes).forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;

      const chunks = node.textContent.split(/(\s+)/); // alterna palabra/espacio/palabra...
      const frag = document.createDocumentFragment();

      chunks.forEach((chunk) => {
        if (!chunk) return;
        if (/^\s+$/.test(chunk)) {
          frag.appendChild(document.createTextNode(chunk)); // espacio: texto plano, nunca span
          return;
        }

        const wordEl = document.createElement("span");
        wordEl.className = wordClass;

        if (by === "words") {
          wordEl.classList.add(letterClass);
          wordEl.textContent = chunk;
          targets.push(wordEl);
        } else {
          chunk.split("").forEach((ch) => {
            const letterEl = document.createElement("span");
            letterEl.className = letterClass;
            letterEl.textContent = ch;
            wordEl.appendChild(letterEl);
            targets.push(letterEl);
          });
        }

        frag.appendChild(wordEl);
      });

      node.replaceWith(frag);
    });

    const fromVars = { filter: `blur(${blur}px)`, y: direction === "bottom" ? distance : -distance };
    if (typeof opacity === "number") fromVars.opacity = opacity;
    gsap.set(targets, fromVars);

    return targets;
  }

  /* ============================================================
     THRESHOLD — Nodo 0
     ============================================================ */

  if (motionOK) {
    const chips = gsap.utils.toArray(".specimen-chip");
    const TILTS = [-8, 6, -5, 8, -7];
    const REV_SECONDS = 80;

    chips.forEach((el, i) => {
      // xPercent/yPercent centra el chip sobre su propio punto de órbita —
      // sin esto, x/y (abajo) traslada la esquina superior-izquierda del
      // chip al punto calculado, no su centro visual, y el ícono queda
      // permanentemente corrido hacia +x/+y por la mitad de su propio
      // ancho/alto. GSAP compone xPercent/yPercent con el x/y del ticker
      // sin pisarlo, así que no hace falta conocer el tamaño real del frame.
      gsap.set(el, { left: 0, top: 0, xPercent: -50, yPercent: -50 });
      gsap.set(el.querySelector(".specimen-chip__frame"), { rotation: TILTS[i % TILTS.length] });
    });

    // función con nombre (no arrow inline) para poder sacarla/ponerla de
    // gsap.ticker con .remove()/.add() — ver setThresholdVisible más abajo.
    // Antes corría para siempre en cada tick global de GSAP, incluso con
    // el Umbral scrolleado lejos (en el Catálogo, que ya es pesado de por
    // sí) — mismo problema que el loop de render de galaxy más abajo.
    function orbitTick(time) {
      // mismo corte que mobileMQ (≤1023, móvil+tablet, ver arriba): con el
      // centrado de arriba, un factor más chico ahí evita que los íconos
      // pasen la mitad del giro fuera de pantalla (medido: ~34-38% en
      // móvil / ~18-24% en tablet vs ~54%/~45% con el factor viejo),
      // acercándolo al ~29% que ya tenían laptop/desktop/pantallas grandes.
      const narrow = mobileMQ.matches;
      // radio a partir del lado corto del viewport: mantiene la órbita casi
      // circular en vez de un óvalo alargado en pantallas anchas
      const base = Math.min(window.innerWidth, window.innerHeight);
      const rx = base * (narrow ? 0.47 : 0.52);
      const ry = base * (narrow ? 0.40 : 0.45);
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const spin = (time * Math.PI * 2) / REV_SECONDS;
      chips.forEach((el, i) => {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / chips.length + spin;
        gsap.set(el, { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
      });
    }

    /* ---------- galaxy: fondo de estrellas del umbral ----------
       portado desde reactbits.dev/backgrounds/galaxy (OGL/WebGL) a vanilla —
       versión reutilizable con comentarios en RECURSOS/galaxy.js. Reemplaza
       el cometa del cursor (no era definitivo, se retiró a pedido).
       Se salta en isConstrained (ahorro de datos o red 2G — solo señales
       de conexión, ver arriba) — queda el radial-gradient + sweep de CSS
       que .threshold ya tiene de fondo, mismo fallback que si el CDN de
       OGL fallara. */
    let galaxyHandle = null;
    // último estado pedido por setThresholdVisible (ver más abajo) — si el
    // usuario ya scrolleó lejos del Umbral ANTES de que resuelva el
    // import() dinámico de OGL, el handle debe nacer pausado en vez de
    // arrancar a renderizar un fondo que ya nadie ve.
    let thresholdVisible = true;
    if (!isConstrained) {
      initGalaxy(document.querySelector(".threshold__galaxy")).then((handle) => {
        galaxyHandle = handle;
        if (handle && !thresholdVisible) handle.pause();
      });
    }

    /* ---------- ASCIIText: "Digital" del hero como arte ASCII (Three.js) ----------
       ver initAsciiText() más arriba / RECURSOS/ascii-text.js. El texto real
       se desvanece recién cuando la promesa resuelve con éxito. Se salta en
       isConstrained (ver initGalaxy arriba) — el texto real de "Digital"
       ya está en el DOM y se queda visible, mismo camino que si Three.js
       nunca llegara a montar. */
    const titleDigital = document.getElementById("titleDigital");
    if (titleDigital && !isConstrained) {
      initAsciiText(titleDigital.querySelector(".ascii-text-container")).then((handle) => {
        if (handle) titleDigital.classList.add("is-ready");
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

    // pausa/reanuda el ticker de la órbita y el loop de render de galaxy
    // (nunca el efecto en sí, solo el trabajo por frame) según si el Umbral
    // está realmente en pantalla — mismo mecanismo que ya usa el Catálogo
    // (setInCatalog) para su propio scroll-jacking. gsap.ticker.remove() de
    // una función no agregada es un no-op seguro, así que es válido
    // llamarla en cualquier orden/cantidad de veces sin duplicar el tick.
    function setThresholdVisible(visible) {
      thresholdVisible = visible;
      if (galaxyHandle) visible ? galaxyHandle.resume() : galaxyHandle.pause();
      gsap.ticker.remove(orbitTick);
      if (visible) gsap.ticker.add(orbitTick);
    }
    setThresholdVisible(true);

    const thresholdTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".threshold",
        start: "top top",
        end: "+=4200",
        pin: true,
        scrub: 1,
        onEnter: () => setThresholdVisible(true),
        onEnterBack: () => setThresholdVisible(true),
        onLeave: () => setThresholdVisible(false),
        onLeaveBack: () => setThresholdVisible(false),
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
      // letra por letra (BlurText, ver splitBlurText arriba / RECURSOS/
      // componentes/texto-storytelling.js) — no reemplaza el fade de
      // opacidad del fragmento (abajo), se suma: el fragmento sigue yendo
      // de 0.08→1 (el "ghosting" de los 5 fragmentos ya visible desde el
      // arranque de la sección) mientras, en simultáneo, cada letra se
      // desenfoca y asienta desde abajo — por eso NO se le pasa `opacity`
      // acá, la controla el fragmento contenedor.
      const letters = splitBlurText(frag, { by: "letters", direction: "bottom", distance: 20, blur: 8 });
      const f = FLIGHTS[i % FLIGHTS.length];
      thresholdTl.to(frag, { opacity: 1, duration: 0.8, ease: "none" });
      thresholdTl.to(
        letters,
        { y: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.04, ease: "power1.out" },
        "<"
      );
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

  // el blob real ya no vive dentro de cada tarjeta — es un elemento único y
  // fijo en el centro de la pantalla (.catalog__hero) que no se mueve con
  // el rail; solo cambia lo que dibuja adentro. Ver CLAUDE.md.
  const heroEl = document.querySelector(".catalog__hero");
  const heroPath = heroEl ? heroEl.querySelector(".hero-blob__path") : null;
  const heroViewport = heroEl; // el propio .catalog__hero recibe has-feed/js-ready
  const heroCanvas = heroEl ? heroEl.querySelector(".hero-canvas") : null;
  const heroCtx = heroCanvas ? heroCanvas.getContext("2d") : null;
  if (heroPath) heroPath.setAttribute("d", blobPaths[0]);
  if (heroViewport) heroViewport.classList.add("js-ready");

  /* ---------- carga perezosa de transiciones por edge (frame-scrubbing con
     secuencias de WebP con alfa real pre-extraídas vía croma, no
     video.currentTime — técnica portada de RECURSOS/blobsite/index.html:
     sin latencia de seek, scrub fluido en ambas direcciones). Un edge cubre
     el cruce entre la tarjeta i y la i+1; con 6 especímenes hay 5 edges
     posibles. Cada carpeta tiene N frames 0000.webp..NNNN.webp: extraídos
     con ffmpeg (chromakey + -r 12) a partir de los clips con fondo
     verde/azul, y recomprimidos a WebP (recorte cuadrado 720×720 + q95) —
     el PNG crudo pesaba ~192MB para los 5 edges, inviable en datos
     móviles; el recorte a cuadrado coincide con el object-fit:cover real
     de .hero-canvas, no se pierde nada que ya no se recortara en el
     cliente. ---------- */

  // count viene de la extracción real con ffmpeg (62 frames a 12fps en los
  // 5 edges ya producidos con croma limpio — los 5 posibles están cubiertos).
  const EDGE_FEEDS = [
    { dir: "01-02", count: 62 },
    { dir: "02-03", count: 62 },
    { dir: "03-04", count: 62 },
    { dir: "04-05", count: 62 },
    { dir: "05-06", count: 62 },
  ];
  const edgeFeedState = new Map(); // edgeIdx -> { frames: HTMLImageElement[], ready, lastDrawn }

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function ensureEdgeFeedLoading(edgeIdx) {
    const edge = EDGE_FEEDS[edgeIdx];
    if (!edge || !edge.count || edgeFeedState.has(edgeIdx)) return;
    const state = { frames: [], ready: false, lastDrawn: -1 };
    edgeFeedState.set(edgeIdx, state);

    const batchSize = 20;
    const frames = [];
    for (let i = 0; i < edge.count; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, edge.count); j++) {
        batch.push(loadImage("assets/disciplinas/frames/" + edge.dir + "/" + String(j).padStart(4, "0") + ".webp"));
      }
      const loaded = await Promise.all(batch);
      // si el primer frame del edge falla, no hay assets para este edge:
      // el morph de blobs se queda como está, nada se rompe. La entrada
      // permanece en el mapa (ready:false) a propósito, para no reintentar
      // cada vez que este edge vuelva a quedar cerca — mismo patrón que
      // ya usaba el video.
      if (i === 0 && !loaded[0]) return;
      frames.push(...loaded);
    }
    state.frames = frames.filter(Boolean);
    state.ready = state.frames.length > 1;
    // la carga es async y puede terminar bastante después del último evento
    // de scroll (97 frames tardan un momento incluso en local) — si no se
    // vuelve a "empujar" el estado acá, el usuario se queda viendo el blob
    // aunque el edge ya esté listo, hasta el próximo scroll. Re-aplicar con
    // la última posición conocida hace que aparezca apenas termina de cargar.
    if (state.ready) applyProgress(lastActiveFloat);
  }

  function scrubEdgeFeed(edgeIdx, localT) {
    const state = edgeFeedState.get(edgeIdx);
    if (!state || !state.ready) return;
    const total = state.frames.length;
    const frameIdx = Math.round(gsap.utils.clamp(0, total - 1, localT * (total - 1)));
    // el chequeo de frameIdx solo no alcanza: los dos canvases se comparten
    // entre edges vecinos, así que volver a cruzar un edge ya visitado (en
    // reversa) puede caer en el mismo frameIdx que dejó pintado el edge
    // anterior — hay que forzar el redraw también cuando cambió el edge.
    if (edgeIdx === lastPaintedEdge && frameIdx === state.lastDrawn) return;
    lastPaintedEdge = edgeIdx;
    state.lastDrawn = frameIdx;
    if (!heroCtx) return;
    const img = state.frames[frameIdx];
    if (heroCanvas.width !== img.naturalWidth) heroCanvas.width = img.naturalWidth;
    if (heroCanvas.height !== img.naturalHeight) heroCanvas.height = img.naturalHeight;
    // los frames ahora son PNG con alfa real (croma verde/azul recortado) —
    // drawImage no limpia el canvas solo, así que sin este clearRect las
    // zonas transparentes del frame nuevo dejan ver el frame anterior
    // pintado debajo (fantasma), algo que no pasaba con los JPG opacos.
    heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    heroCtx.drawImage(img, 0, 0, heroCanvas.width, heroCanvas.height);
  }

  /* ---------- fondo del campo + registro del HUD ---------- */

  const fieldBg = document.querySelector(".field-bg");
  const hudReg = document.querySelector(".hud__reg");
  const defaultRegText = hudReg ? hudReg.textContent : "";
  let lastIdx = -1;
  let lastEdge = -2;
  let lastActiveFloat = 0;
  let lastPaintedEdge = -2; // qué edge pintó por última vez los canvases compartidos

  function applyProgress(activeFloat) {
    lastActiveFloat = activeFloat;
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

    // el blob es un solo elemento fijo (.catalog__hero) — una sola escritura
    // de path y de color en vez de recorrer las 6 tarjetas.
    const morphed = gsap.utils.interpolate(blobPaths[idx], blobPaths[nextIdx], localT);
    if (heroPath) heroPath.setAttribute("d", morphed);
    if (heroEl) heroEl.style.setProperty("--c", gsap.utils.interpolate(a.color, b.color, localT));

    const roundedIdx = Math.round(clamped);
    if (roundedIdx !== lastIdx) {
      lastIdx = roundedIdx;
      // solo se refleja en el HUD si de verdad estamos dentro del catálogo:
      // en modo simple, applyProgress ya corre desde el load (ver setupSimple)
      if (hudReg && document.body.classList.contains("in-catalog")) {
        hudReg.textContent = "Espécimen " + (roundedIdx + 1) + "/" + SPECIMENS.length + " — " + SPECIMENS[roundedIdx].name;
      }
    }

    // idx es el edge activo (el cruce entre la tarjeta idx y la idx+1) SOLO
    // si ya hay progreso fraccional cruzando hacia la siguiente — localT=0
    // significa "parado justo en la tarjeta idx", sin cruce en curso. Este
    // chequeo es lo que mantiene mobile/tablet sin edges: setupSimple()
    // siempre llama con idx entero (localT siempre 0), así que activeEdge
    // nunca deja de ser -1 ahí, sin necesidad de una rama aparte.
    const activeEdge = idx < max && localT > 0 ? idx : -1;
    if (activeEdge !== lastEdge) {
      lastEdge = activeEdge;
      if (activeEdge !== -1) {
        ensureEdgeFeedLoading(activeEdge);
        ensureEdgeFeedLoading(Math.max(0, activeEdge - 1));
        ensureEdgeFeedLoading(Math.min(max - 1, activeEdge + 1));
      }
    }

    const edgeState = activeEdge !== -1 ? edgeFeedState.get(activeEdge) : null;
    const edgeReady = !!(edgeState && edgeState.ready);
    if (edgeReady) {
      // has-feed es "solo agregar": una vez que una tarjeta mostró video
      // real, se queda así para siempre — el blob es puro placeholder de
      // "todavía no hay footage", no algo a lo que se vuelve al alejarse.
      // Coincide con el flujo del sitio de referencia (el blob de reposo
      // nunca reaparece una vez que hay contenido real).
      if (heroViewport) heroViewport.classList.add("has-feed");
      scrubEdgeFeed(activeEdge, localT);
    }
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
  let simpleBoundaryST = null;

  function teardownEnhanced() {
    if (railTween) { railTween.scrollTrigger && railTween.scrollTrigger.kill(); railTween.kill(); railTween = null; }
    gsap.set(rail, { x: 0, clearProps: "x" });
    document.body.classList.remove("catalog-enhanced");
  }

  function teardownSimple() {
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
    // móvil/tablet: sin swipe horizontal — cada tarjeta es una sección de
    // 100vh apilada verticalmente en el flujo normal de la página
    // (styles.css, .catalog__rail{flex-direction:column} por defecto), así
    // que .catalog mide de forma natural plates.length × 100vh y el scroll
    // vertical de la página NUNCA se detiene. Un solo ScrollTrigger sin
    // pin (a diferencia de setupEnhanced) traduce ese scroll normal en el
    // mismo progreso fraccional continuo que ya usa setupEnhanced —
    // aplyProgress() dispara el mismo camino de ensureEdgeFeedLoading/
    // scrubEdgeFeed en los dos modos, el video de transición funciona
    // igual, solo que scrubeado por scroll vertical en vez de horizontal.
    simpleBoundaryST = ScrollTrigger.create({
      trigger: catalog,
      start: "top top",
      end: "bottom bottom",
      onEnter: () => setInCatalog(true),
      onEnterBack: () => setInCatalog(true),
      onLeave: () => setInCatalog(false),
      onLeaveBack: () => setInCatalog(false),
      onUpdate: (self) => applyProgress(self.progress * (plates.length - 1)),
    });
    applyProgress(0);
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
      const nextSimple = !motionOK;
      if (nextSimple !== catalogSimple) {
        catalogSimple = nextSimple;
        applyMode();
      }
    }, 250);
  });
})();
