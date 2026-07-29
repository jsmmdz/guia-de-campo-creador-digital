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

  // Referencia a la instancia de Lenis, si se monta (ver initLenis) — el
  // acordeón de Voces la necesita para compensar el salto de scroll al
  // cerrar una fila por su propia API (lenis.scrollTo), no con
  // window.scrollBy, o el ajuste pelea con el suavizado y se ve como un
  // tirón (Ruta Técnica - Nodo 4 Voces.md, §Acordeón).
  let lenisInstance = null;

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

    // Selector acotado a #threshold A PROPÓSITO (ver error #26 en
    // CLAUDE.md): `data-reveal` no es exclusivo del Nodo 0 — el Nodo 3
    // (Método) lo usa en sus 35 bloques, con su propia armadura CSS y su
    // propio IntersectionObserver. Con el selector global, este `from`
    // agarraba los 39 del sitio y los mataba: GSAP fija el valor FINAL de
    // un `from` en su primer tick, no al crearlo, y para ese tick
    // initMethod() ya puso body.method-js — o sea que la armadura ya
    // reportaba opacity:0. El tween terminaba animando 0→0 y dejando
    // style="opacity:0" inline y permanente. Un estilo inline le gana a
    // la clase .is-in, así que ni el observer ni ningún respaldo podían
    // revelar nada. Cualquier nodo nuevo que use data-reveal necesita su
    // propio selector acotado, nunca uno global.
    gsap.from("#threshold [data-reveal]", { opacity: 0, y: 24, duration: 0.9, ease: "power2.out", stagger: 0.12 });
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

  /* ============================================================
     TERRITORIO — Nodo 2
     Función propia (no código suelto en el nivel del IIFE, a diferencia
     del Catálogo) para no chocar nombres con sus const de arriba
     (hudReg, etc.) — ver Ruta Técnica §Frontend. 5 ScrollTrigger
     pineados independientes (uno por tramo), nunca un mega-timeline: en
     Umbral hay una sola "página" por tramo, acá hay hasta 9 compitiendo
     por estar reveladas o no según dónde esté el scroll, así que cada
     página necesita su propio estado leíble por progreso, no una
     secuencia de tweens encadenados. gsap.matchMedia() no aplica —el pin
     va en TODOS los breakpoints mientras motionOK, igual que ya decidió
     el Catálogo (catalogSimple depende de motionOK, nunca de mobileMQ).
     ============================================================ */
  function initTerritory() {
    const territory = document.querySelector(".territory");
    if (!territory) return;

    const PAGE_SCROLL = 650; // px de scroll por página — palanca única del ritmo de lectura
    const HOLD = 0.8; // 0..HOLD: página activa queda opaca; HOLD..1: crossfade compartido con la siguiente

    const stints = Array.from(territory.querySelectorAll(".territory__stint")).map((el) => ({
      el,
      id: el.dataset.stint,
      isLevel: el.classList.contains("territory__stint--level"),
      pages: Array.from(el.querySelectorAll(".territory__page")).map((pageEl) => ({ el: pageEl, revealTl: null })),
      st: null,
    }));
    const levelStints = stints.filter((s) => s.isLevel);
    const LEVEL_LABELS = { suelo: "Suelo", ladera: "Ladera", cima: "Cima" };

    if (!motionOK) return; // ?static=1: CSS ya deja todo en flujo normal, sin pin ni reveal — ver styles.css

    /* ---------- reveal letra/palabra por página, timelines pausadas ----------
       Se arman UNA sola vez al montar; applyStintProgress() más abajo solo
       LEE .progress(x) — nunca .play()/.restart() — así el resultado es
       una función pura de dónde está el scroll, sin importar si el
       usuario llegó rápido, lento, o volviendo hacia atrás (ver "estados
       de borde": páginas atrás siempre en su estado final, nunca a medio
       revelar). */
    stints.forEach((stint) => {
      stint.pages.forEach((page) => {
        const el = page.el;
        // ficha técnica / comparativa: lectura de instrumento, no prosa —
        // pedido explícito del usuario, NO comparte el efecto blur del
        // resto del scrollytelling. Entra/sale por scroll normal (sube
        // desde abajo, se va hacia arriba), nunca se desenfoca.
        page.isCard = el.classList.contains("territory__card");
        if (el.classList.contains("territory__zigzag")) {
          const letters = splitBlurText(el, { by: "letters", direction: "bottom", distance: 20, blur: 8 });
          page.revealTl = gsap.timeline({ paused: true }).to(letters, { y: 0, filter: "blur(0px)", duration: 0.32, stagger: 0.022, ease: "power2.out" });
        } else if (
          el.classList.contains("territory__emphasis") ||
          el.classList.contains("territory__closing-line") ||
          el.classList.contains("territory__outro") ||
          el.classList.contains("territory__stint-title") ||
          el.classList.contains("territory__level-name")
        ) {
          const letters = splitBlurText(el, { by: "letters", direction: "bottom", distance: 24, blur: 12 });
          page.revealTl = gsap.timeline({ paused: true }).to(letters, { y: 0, filter: "blur(0px)", duration: 0.38, stagger: 0.028, ease: "power2.out" });
        } else if (el.classList.contains("territory__note")) {
          const body = el.querySelector(".territory__note-body");
          const words = body ? splitBlurText(body, { by: "words", direction: "bottom", distance: 16, blur: 6 }) : [];
          page.revealTl = gsap.timeline({ paused: true });
          if (words.length) page.revealTl.to(words, { y: 0, filter: "blur(0px)", duration: 0.26, stagger: 0.045, ease: "power2.out" });
          const callout = el.querySelector(".territory__callout");
          if (callout) {
            gsap.set(callout, { autoAlpha: 0, x: -12 });
            page.revealTl.to(callout, { autoAlpha: 1, x: 0, duration: 0.28, ease: "back.out(1.4)" }, words.length ? ">0.18" : 0);
          }
        } else if (el.classList.contains("territory__card")) {
          const panels = Array.from(el.querySelectorAll(".territory__card-panel"));
          gsap.set(panels, { autoAlpha: 0, y: 16, scale: 0.97, transformOrigin: "50% 50%" });
          page.revealTl = gsap.timeline({ paused: true });
          panels.forEach((panel, i) => {
            page.revealTl.to(panel, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: "power2.out" }, i * 0.06);
          });
        }
      });
    });

    /* ---------- crossfade + reveal, función pura de (idx, localT) ---------- */
    function applyStintProgress(stint, activeFloat) {
      const max = stint.pages.length - 1;
      const clamped = gsap.utils.clamp(0, max, activeFloat);
      const idx = Math.min(max, Math.floor(clamped));
      const nextIdx = Math.min(max, idx + 1);
      const localT = clamped - idx;
      const isLast = idx === nextIdx;
      const fadeT = gsap.utils.clamp(0, 1, (localT - HOLD) / (1 - HOLD));
      const outEase = gsap.parseEase("power1.in");
      const inEase = gsap.parseEase("power2.out");
      const blurAmt = fadeT > 0 && fadeT < 1 ? +(Math.sin(fadeT * Math.PI) * 3).toFixed(2) : 0;

      stint.pages.forEach((page, i) => {
        const el = page.el;
        const CARD_TRAVEL = 64; // px — "aparece desde abajo, se va hacia arriba", scroll normal, sin blur
        if (i === idx) {
          if (isLast) {
            gsap.set(el, { autoAlpha: 1, y: 0, filter: "blur(0px)", zIndex: 3 });
          } else if (page.isCard) {
            const outT = outEase(fadeT);
            gsap.set(el, { autoAlpha: 1 - outT, y: -outT * CARD_TRAVEL, filter: "blur(0px)", zIndex: 3 });
          } else {
            const outT = outEase(fadeT);
            gsap.set(el, { autoAlpha: 1 - outT, y: 0, filter: `blur(${blurAmt}px)`, zIndex: 3 });
          }
        } else if (i === nextIdx && !isLast) {
          const inT = inEase(fadeT);
          if (page.isCard) {
            gsap.set(el, { autoAlpha: inT, y: (1 - inT) * CARD_TRAVEL, filter: "blur(0px)", zIndex: 2 });
          } else {
            gsap.set(el, { autoAlpha: inT, y: (1 - inT) * 12, filter: `blur(${blurAmt}px)`, zIndex: 2 });
          }
        } else {
          gsap.set(el, { autoAlpha: 0 });
        }

        if (!page.revealTl) return;
        // El reveal cuelga del MISMO fadeT que la entrada de opacidad —
        // no de idx en sí. Bug real encontrado en verificación en
        // navegador: activeFloat nunca supera `max`, así que la ÚLTIMA
        // página de un tramo solo es "idx" en el instante final exacto
        // (localT=0 ahí) — con progress(localT/0.5) esa página se
        // quedaba SIEMPRE sin revelar (permanentemente blureada), porque
        // pasa toda su vida visual como "nextIdx" entrando, nunca como
        // "idx" con localT>0. Acá revela DURANTE su propia entrada
        // (i===nextIdx, con fadeT) y queda fija en 1 apenas se vuelve la
        // página activa (i===idx) — cubre tanto páginas intermedias como
        // la última página de cada tramo.
        if (i < idx) page.revealTl.progress(1);
        else if (i === idx) page.revealTl.progress(1);
        else if (i === nextIdx && !isLast) page.revealTl.progress(gsap.utils.clamp(0, 1, fadeT / 0.6));
        else page.revealTl.progress(0);
      });
    }

    /* ---------- HUD: swap de texto tipo "instrumento leyendo dato" ----------
       Evento discreto (cruce de umbral onEnter/onEnterBack), nunca ligado
       al progreso continuo del scrub — mismo criterio que ya usa el
       Catálogo (setInCatalog) para su propio swap de hud__reg, solo que
       acá con un micro-glitch de 120ms en vez de corte seco, porque hay
       múltiples niveles consecutivos (el swap solo sirve de referencia
       si se nota que "cambió el dato"). */
    const hudReg = document.querySelector(".hud__reg");
    const defaultRegText = hudReg ? hudReg.textContent : "";
    let hudGlitchTl = null;
    function glitchHudText(text) {
      if (!hudReg) return;
      if (hudGlitchTl) hudGlitchTl.kill();
      hudGlitchTl = gsap.timeline()
        .to(hudReg, { opacity: 0.3, x: -2, duration: 0.02 })
        .to(hudReg, { x: 2, duration: 0.02 })
        .to(hudReg, { x: 0, duration: 0.02 })
        .call(() => { hudReg.textContent = text; })
        .to(hudReg, { opacity: 1, duration: 0.08, ease: "power2.out" });
    }

    /* ---------- indicador de altitud (Fase 1) ----------
       Progreso GLOBAL derivado de los 3 ScrollTrigger de nivel ya
       creados — no es un ScrollTrigger nuevo, es una lectura compuesta,
       así que solo se recalcula dentro del onUpdate de esos 3 tramos
       (nunca durante intro/cierre, que no tienen altitud real). */
    const dotEl = territory.querySelector(".territory__altitude-dot");
    const tickEls = Array.from(territory.querySelectorAll(".territory__altitude-tick"));

    function computeAltitudeProgress() {
      let levelsBelow = 0;
      levelStints.forEach((lvl, i) => {
        if (!lvl.st) return;
        if (lvl.st.progress >= 1) levelsBelow = i + 1;
        else if (lvl.st.isActive) levelsBelow = i + lvl.st.progress;
      });
      return gsap.utils.clamp(0, 1, levelsBelow / levelStints.length);
    }

    function updateAltitudeUI() {
      const p = computeAltitudeProgress();
      if (dotEl) gsap.set(dotEl, { top: (1 - p) * 100 + "%" });
      tickEls.forEach((tick) => {
        const t = Number(tick.dataset.tick); // 0/1/2 = Suelo/Ladera/Cima
        const reached = p >= t / levelStints.length - 0.001;
        tick.classList.toggle("is-reached", reached);
      });
    }

    function pulseDot() {
      if (!dotEl) return;
      gsap.fromTo(dotEl, { scale: 1 }, { scale: 1.6, duration: 0.13, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "50% 50%" });
    }

    /* ---------- marquesina "TERRITORIO." ----------
       Única pieza del nodo que NO cuelga del scroll — loop infinito por
       velocidad constante (no duración fija), pausado/reanudado con el
       onEnter/onLeave del propio tramo Intro (mismo criterio de ahorro
       de frame budget que setThresholdVisible en el Umbral). */
    const marqueeTrack = territory.querySelector(".territory__marquee-track");
    let marqueeTween = null;
    if (marqueeTrack) {
      const trackWidth = marqueeTrack.getBoundingClientRect().width;
      const SPEED = 60; // px/s
      marqueeTween = gsap.to(marqueeTrack, {
        xPercent: -50,
        duration: (trackWidth / 2) / SPEED,
        ease: "none",
        repeat: -1,
        paused: true,
      });
    }

    /* ---------- creación de los 5 ScrollTrigger, uno por tramo ----------
       pin:true en todos + pinSpacing por defecto encadena los tramos sin
       huecos ni cálculo manual de offsets: cada pin inserta un spacer
       exacto de su propio rango, así el siguiente arranca justo donde
       terminó el anterior. TERRITORY_PAGE_SCROLL es una constante en
       píxeles (no derivada de innerWidth como el rail del Catálogo), así
       que no hace falta invalidateOnRefresh acá. */
    stints.forEach((stint) => {
      const n = stint.pages.length;
      if (n < 2) { applyStintProgress(stint, 0); return; }

      stint.st = ScrollTrigger.create({
        trigger: stint.el,
        start: "top top",
        end: "+=" + (n - 1) * PAGE_SCROLL,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          applyStintProgress(stint, self.progress * (n - 1));
          if (stint.isLevel) updateAltitudeUI();
        },
        onEnter: () => onStintEnter(stint),
        onEnterBack: () => onStintEnter(stint),
        onLeave: () => onStintLeave(stint),
        onLeaveBack: () => onStintLeave(stint),
      });
      applyStintProgress(stint, 0); // default pre-refresh; el primer refresh real de ScrollTrigger corrige con el scroll restaurado
    });

    function onStintEnter(stint) {
      if (stint.id === "intro" && marqueeTween) marqueeTween.resume();
      if (!stint.isLevel) return;
      document.body.classList.add("territory-ascent");
      glitchHudText("Nivel " + (levelStints.indexOf(stint) + 1) + "/" + levelStints.length + " — " + LEVEL_LABELS[stint.id]);
      updateAltitudeUI();
      pulseDot();
    }
    function onStintLeave(stint) {
      if (stint.id === "intro" && marqueeTween) marqueeTween.pause();
      if (!stint.isLevel) return;
      const isFirstLevel = levelStints.indexOf(stint) === 0;
      const isLastLevel = levelStints.indexOf(stint) === levelStints.length - 1;
      // solo se sale del rango de ascenso al dejar Suelo hacia atrás (a
      // Intro) o Cima hacia adelante (a Cierre) — entre niveles queda activo
      if ((isFirstLevel && stint.st.direction < 0) || (isLastLevel && stint.st.direction > 0)) {
        document.body.classList.remove("territory-ascent");
        glitchHudText(defaultRegText);
      }
    }

    /* ---------- resize: solo el ancho del track de la marquesina cambia con el viewport ----------
       ScrollTrigger ya refresca solo con su propio listener de resize —
       el rango de scroll de cada tramo es px fijo, no depende del ancho. */
    let territoryResizeTimer = null;
    window.addEventListener("resize", () => {
      if (!marqueeTrack) return;
      clearTimeout(territoryResizeTimer);
      territoryResizeTimer = setTimeout(() => {
        const w = marqueeTrack.getBoundingClientRect().width;
        if (marqueeTween) marqueeTween.duration((w / 2) / 60);
      }, 250);
    });
  }

  /* Fondo "Background Lines" del Nodo 3 — paths y paleta copiados
     verbatim del prototipo aislado (PRUEBAS/Prototipo - Aceternity
     Background Lines/script.js), que a su vez los copió verbatim de la
     pestaña "Manual" de ui.aceternity.com/components/background-lines.
     Paleta alineada a los tokens de este sitio (--signal/--signal-hi/
     --t-accent en vez del arcoíris original de Aceternity) — decisión
     confirmada con el usuario comparando ambas en el nodo real (ver
     docs/nodo-3-metodo.md). El último color del arcoíris original era
     --t-ink (#f2f1ec, casi blanco, el mismo tono del texto): sustituido
     por --signal-hi para no poner una línea casi del color del texto
     detrás del texto. */
  const METHOD_BG_PATHS = [
    "M720 450C720 450 742.459 440.315 755.249 425.626C768.039 410.937 778.88 418.741 789.478 401.499C800.076 384.258 817.06 389.269 826.741 380.436C836.423 371.603 851.957 364.826 863.182 356.242C874.408 347.657 877.993 342.678 898.867 333.214C919.741 323.75 923.618 319.88 934.875 310.177C946.133 300.474 960.784 300.837 970.584 287.701C980.384 274.564 993.538 273.334 1004.85 263.087C1016.15 252.84 1026.42 250.801 1038.22 242.1C1050.02 233.399 1065.19 230.418 1074.63 215.721C1084.07 201.024 1085.49 209.128 1112.65 194.884C1139.8 180.64 1132.49 178.205 1146.43 170.636C1160.37 163.066 1168.97 158.613 1181.46 147.982C1193.95 137.35 1191.16 131.382 1217.55 125.645C1243.93 119.907 1234.19 118.899 1254.53 100.846C1274.86 82.7922 1275.12 92.8914 1290.37 76.09C1305.62 59.2886 1313.91 62.1868 1323.19 56.7536C1332.48 51.3204 1347.93 42.8082 1361.95 32.1468C1375.96 21.4855 1374.06 25.168 1397.08 10.1863C1420.09 -4.79534 1421.41 -3.16992 1431.52 -15.0078",
    "M720 450C720 450 741.044 435.759 753.062 410.636C765.079 385.514 770.541 386.148 782.73 370.489C794.918 354.83 799.378 353.188 811.338 332.597C823.298 312.005 825.578 306.419 843.707 295.493C861.837 284.568 856.194 273.248 877.376 256.48C898.558 239.713 887.536 227.843 909.648 214.958C931.759 202.073 925.133 188.092 941.063 177.621C956.994 167.151 952.171 154.663 971.197 135.041C990.222 115.418 990.785 109.375 999.488 96.1291C1008.19 82.8827 1011.4 82.2181 1032.65 61.8861C1053.9 41.5541 1045.74 48.0281 1064.01 19.5798C1082.29 -8.86844 1077.21 -3.89415 1093.7 -19.66C1110.18 -35.4258 1105.91 -46.1146 1127.68 -60.2834C1149.46 -74.4523 1144.37 -72.1024 1154.18 -97.6802C1163.99 -123.258 1165.6 -111.332 1186.21 -135.809C1206.81 -160.285 1203.29 -160.861 1220.31 -177.633C1237.33 -194.406 1236.97 -204.408 1250.42 -214.196",
    "M720 450C720 450 712.336 437.768 690.248 407.156C668.161 376.544 672.543 394.253 665.951 365.784C659.358 337.316 647.903 347.461 636.929 323.197C625.956 298.933 626.831 303.639 609.939 281.01C593.048 258.381 598.7 255.282 582.342 242.504C565.985 229.726 566.053 217.66 559.169 197.116C552.284 176.572 549.348 171.846 529.347 156.529C509.345 141.211 522.053 134.054 505.192 115.653C488.33 97.2527 482.671 82.5627 473.599 70.7833C464.527 59.0039 464.784 50.2169 447 32.0721C429.215 13.9272 436.29 0.858563 423.534 -12.6868C410.777 -26.2322 407.424 -44.0808 394.364 -56.4916C381.303 -68.9024 373.709 -72.6804 365.591 -96.1992C357.473 -119.718 358.364 -111.509 338.222 -136.495C318.08 -161.481 322.797 -149.499 315.32 -181.761C307.843 -214.023 294.563 -202.561 285.795 -223.25C277.026 -243.94 275.199 -244.055 258.602 -263.871",
    "M720 450C720 450 738.983 448.651 790.209 446.852C841.436 445.052 816.31 441.421 861.866 437.296C907.422 433.172 886.273 437.037 930.656 436.651C975.04 436.264 951.399 432.343 1001.57 425.74C1051.73 419.138 1020.72 425.208 1072.85 424.127C1124.97 423.047 1114.39 420.097 1140.02 414.426C1165.65 408.754 1173.1 412.143 1214.55 411.063C1256.01 409.983 1242.78 406.182 1285.56 401.536C1328.35 396.889 1304.66 400.796 1354.41 399.573C1404.16 398.35 1381.34 394.315 1428.34 389.376C1475.35 384.438 1445.96 386.509 1497.93 385.313C1549.9 384.117 1534.63 382.499 1567.23 381.48",
    "M720 450C720 450 696.366 458.841 682.407 472.967C668.448 487.093 673.23 487.471 647.919 492.882C622.608 498.293 636.85 499.899 609.016 512.944C581.182 525.989 596.778 528.494 571.937 533.778C547.095 539.062 551.762 548.656 536.862 556.816C521.962 564.975 515.626 563.279 497.589 575.159C479.552 587.04 484.343 590.435 461.111 598.728C437.879 607.021 442.512 605.226 423.603 618.397C404.694 631.569 402.411 629.541 390.805 641.555C379.2 653.568 369.754 658.175 353.238 663.929C336.722 669.683 330.161 674.689 312.831 684.116C295.5 693.543 288.711 698.815 278.229 704.041C267.747 709.267 258.395 712.506 240.378 726.65C222.361 740.795 230.097 738.379 203.447 745.613C176.797 752.847 193.747 752.523 166.401 767.148C139.056 781.774 151.342 783.641 130.156 791.074C108.97 798.507 116.461 802.688 96.0974 808.817C75.7334 814.946 83.8553 819.505 59.4513 830.576C35.0473 841.648 48.2548 847.874 21.8337 853.886C-4.58739 859.898 10.5966 869.102 -16.396 874.524",
    "M720 450C720 450 695.644 482.465 682.699 506.197C669.755 529.929 671.059 521.996 643.673 556.974C616.286 591.951 625.698 590.8 606.938 615.255C588.178 639.71 592.715 642.351 569.76 665.92C546.805 689.49 557.014 687.498 538.136 722.318C519.258 757.137 520.671 760.818 503.256 774.428C485.841 788.038 491.288 790.063 463.484 831.358C435.681 872.653 437.554 867.001 425.147 885.248C412.74 903.495 411.451 911.175 389.505 934.331C367.559 957.486 375.779 966.276 352.213 990.918C328.647 1015.56 341.908 1008.07 316.804 1047.24C291.699 1086.42 301.938 1060.92 276.644 1100.23C251.349 1139.54 259.792 1138.78 243.151 1153.64",
    "M719.974 450C719.974 450 765.293 459.346 789.305 476.402C813.318 493.459 825.526 487.104 865.093 495.586C904.659 504.068 908.361 510.231 943.918 523.51C979.475 536.789 963.13 535.277 1009.79 547.428C1056.45 559.579 1062.34 555.797 1089.82 568.96C1117.31 582.124 1133.96 582.816 1159.12 592.861C1184.28 602.906 1182.84 603.359 1233.48 614.514C1284.12 625.67 1254.63 632.207 1306.33 644.465C1358.04 656.723 1359.27 656.568 1378.67 670.21C1398.07 683.852 1406.16 676.466 1456.34 692.827C1506.51 709.188 1497.73 708.471 1527.54 715.212",
    "M720 450C720 450 727.941 430.821 734.406 379.251C740.87 327.681 742.857 359.402 757.864 309.798C772.871 260.194 761.947 271.093 772.992 244.308C784.036 217.524 777.105 200.533 786.808 175.699C796.511 150.864 797.141 144.333 808.694 107.307C820.247 70.2821 812.404 88.4169 819.202 37.1016C826 -14.2137 829.525 -0.990829 839.341 -30.3874C849.157 -59.784 844.404 -61.5924 855.042 -98.7516C865.68 -135.911 862.018 -144.559 876.924 -167.488C891.83 -190.418 886.075 -213.535 892.87 -237.945C899.664 -262.355 903.01 -255.031 909.701 -305.588C916.393 -356.144 917.232 -330.612 925.531 -374.777",
    "M720 450C720 450 722.468 499.363 726.104 520.449C729.739 541.535 730.644 550.025 738.836 589.07C747.028 628.115 743.766 639.319 746.146 659.812C748.526 680.306 754.006 693.598 757.006 732.469C760.007 771.34 760.322 765.244 763.893 805.195C767.465 845.146 769.92 822.227 773.398 868.469C776.875 914.71 776.207 901.365 778.233 940.19C780.259 979.015 782.53 990.477 787.977 1010.39C793.424 1030.3 791.788 1060.01 797.243 1082.24C802.698 1104.47 801.758 1130.29 808.181 1149.64C814.604 1168.99 813.135 1171.5 818.026 1225.28C822.918 1279.06 820.269 1267.92 822.905 1293.75",
    "M720 450C720 450 737.033 492.46 757.251 515.772C777.468 539.084 768.146 548.687 785.517 570.846C802.887 593.005 814.782 609.698 824.589 634.112C834.395 658.525 838.791 656.702 855.55 695.611C872.31 734.519 875.197 724.854 890.204 764.253C905.21 803.653 899.844 790.872 919.927 820.763C940.01 850.654 939.071 862.583 954.382 886.946C969.693 911.309 968.683 909.254 993.997 945.221C1019.31 981.187 1006.67 964.436 1023.49 1007.61C1040.32 1050.79 1046.15 1038.25 1059.01 1073.05C1071.88 1107.86 1081.39 1096.19 1089.45 1131.96C1097.51 1167.73 1106.52 1162.12 1125.77 1196.89",
    "M720 450C720 450 687.302 455.326 670.489 467.898C653.676 480.47 653.159 476.959 626.58 485.127C600.002 493.295 599.626 495.362 577.94 503.841C556.254 512.319 556.35 507.426 533.958 517.44C511.566 527.454 505.82 526.441 486.464 539.172C467.108 551.904 461.312 546.36 439.357 553.508C417.402 560.657 406.993 567.736 389.393 572.603C371.794 577.47 371.139 583.76 344.54 587.931C317.941 592.102 327.375 593.682 299.411 607.275C271.447 620.868 283.617 615.022 249.868 622.622C216.119 630.223 227.07 630.86 203.77 638.635C180.47 646.41 168.948 652.487 156.407 657.28C143.866 662.073 132.426 669.534 110.894 675.555C89.3615 681.575 90.3234 680.232 61.1669 689.897C32.0105 699.562 34.3696 702.021 15.9011 709.789C-2.56738 717.558 2.38861 719.841 -29.9494 729.462C-62.2873 739.083 -52.5552 738.225 -77.4307 744.286",
    "M720 450C720 450 743.97 465.061 754.884 490.648C765.798 516.235 781.032 501.34 791.376 525.115C801.72 548.889 808.417 538.333 829.306 564.807C850.195 591.281 852.336 582.531 865.086 601.843C877.835 621.155 874.512 621.773 902.383 643.857C930.255 665.94 921.885 655.976 938.025 681.74C954.164 707.505 959.384 709.719 977.273 720.525C995.162 731.33 994.233 731.096 1015.92 757.676C1037.61 784.257 1025.74 768.848 1047.82 795.343C1069.91 821.837 1065.95 815.45 1085.93 834.73C1105.91 854.009 1110.53 848.089 1124.97 869.759C1139.4 891.428 1140.57 881.585 1158.53 911.499C1176.5 941.414 1184.96 933.829 1194.53 948.792C1204.09 963.755 1221.35 973.711 1232.08 986.224C1242.8 998.738 1257.34 1015.61 1269.99 1026.53C1282.63 1037.45 1293.81 1040.91 1307.21 1064.56",
    "M720 450C720 450 718.24 412.717 716.359 397.31C714.478 381.902 713.988 362.237 710.785 344.829C707.582 327.42 708.407 322.274 701.686 292.106C694.965 261.937 699.926 270.857 694.84 240.765C689.753 210.674 693.055 217.076 689.674 184.902C686.293 152.728 686.041 149.091 682.676 133.657C679.311 118.223 682.23 106.005 681.826 80.8297C681.423 55.6545 677.891 60.196 675.66 30.0226C673.429 -0.150848 672.665 -7.94842 668.592 -26.771C664.52 -45.5935 664.724 -43.0755 661.034 -78.7766C657.343 -114.478 658.509 -103.181 653.867 -133.45C649.226 -163.719 650.748 -150.38 647.052 -182.682C643.357 -214.984 646.125 -214.921 645.216 -238.402C644.307 -261.883 640.872 -253.4 637.237 -291.706C633.602 -330.012 634.146 -309.868 630.717 -343.769C627.288 -377.669 628.008 -370.682 626.514 -394.844",
    "M720 450C720 450 730.384 481.55 739.215 507.557C748.047 533.564 751.618 537.619 766.222 562.033C780.825 586.447 774.187 582.307 787.606 618.195C801.025 654.082 793.116 653.536 809.138 678.315C825.16 703.095 815.485 717.073 829.898 735.518C844.311 753.964 845.351 773.196 852.197 786.599C859.042 800.001 862.876 805.65 872.809 845.974C882.742 886.297 885.179 874.677 894.963 903.246C904.747 931.816 911.787 924.243 921.827 961.809C931.867 999.374 927.557 998.784 940.377 1013.59C953.197 1028.4 948.555 1055.77 966.147 1070.54C983.739 1085.31 975.539 1105.69 988.65 1125.69C1001.76 1145.69 1001.82 1141.59 1007.54 1184.37C1013.27 1227.15 1018.98 1198.8 1029.67 1241.58",
    "M720 450C720 450 684.591 447.135 657.288 439.014C629.985 430.894 618.318 435.733 600.698 431.723C583.077 427.714 566.975 425.639 537.839 423.315C508.704 420.991 501.987 418.958 476.29 413.658C450.592 408.359 460.205 410.268 416.97 408.927C373.736 407.586 396.443 401.379 359.262 396.612C322.081 391.844 327.081 393.286 300.224 391.917C273.368 390.547 264.902 385.49 241.279 382.114C217.655 378.739 205.497 378.95 181.98 377.253C158.464 375.556 150.084 369.938 117.474 366.078C84.8644 362.218 81.5401 361.501 58.8734 358.545C36.2067 355.59 33.6442 351.938 -3.92281 346.728C-41.4898 341.519 -18.6466 345.082 -61.4654 341.179C-104.284 337.275 -102.32 338.048 -121.821 332.369",
    "M720 450C720 450 714.384 428.193 708.622 410.693C702.86 393.193 705.531 397.066 703.397 372.66C701.264 348.254 697.8 345.181 691.079 330.466C684.357 315.751 686.929 312.356 683.352 292.664C679.776 272.973 679.079 273.949 674.646 255.07C670.213 236.192 670.622 244.371 665.271 214.561C659.921 184.751 659.864 200.13 653.352 172.377C646.841 144.623 647.767 151.954 644.123 136.021C640.48 120.088 638.183 107.491 636.127 96.8178C634.072 86.1443 632.548 77.5871 626.743 54.0492C620.938 30.5112 622.818 28.9757 618.613 16.577C614.407 4.17831 615.555 -13.1527 608.752 -24.5691C601.95 -35.9855 603.375 -51.0511 599.526 -60.1492C595.678 -69.2472 593.676 -79.3623 587.865 -100.431C582.053 -121.5 584.628 -117.913 578.882 -139.408C573.137 -160.903 576.516 -161.693 571.966 -182.241C567.416 -202.789 567.42 -198.681 562.834 -218.28C558.248 -237.879 555.335 -240.47 552.072 -260.968C548.808 -281.466 547.605 -280.956 541.772 -296.427C535.94 -311.898 537.352 -315.211 535.128 -336.018C532.905 -356.826 531.15 -360.702 524.129 -377.124",
    "M720 450C720 450 711.433 430.82 707.745 409.428C704.056 388.035 704.937 381.711 697.503 370.916C690.069 360.121 691.274 359.999 685.371 334.109C679.469 308.22 677.496 323.883 671.24 294.303C664.984 264.724 667.608 284.849 662.065 258.116C656.522 231.383 656.357 229.024 647.442 216.172C638.527 203.319 640.134 192.925 635.555 178.727C630.976 164.529 630.575 150.179 624.994 139.987C619.413 129.794 615.849 112.779 612.251 103.074C608.654 93.3696 606.942 85.6729 603.041 63.0758C599.14 40.4787 595.242 36.9267 589.533 23.8967C583.823 10.8666 581.18 -2.12401 576.96 -14.8333C572.739 -27.5425 572.696 -37.7703 568.334 -51.3441C563.972 -64.9179 562.14 -67.2124 556.992 -93.299C551.844 -119.386 550.685 -109.743 544.056 -129.801C537.428 -149.859 534.97 -151.977 531.034 -170.076C527.099 -188.175 522.979 -185.119 519.996 -207.061C517.012 -229.004 511.045 -224.126 507.478 -247.077C503.912 -270.029 501.417 -271.033 495.534 -287C489.651 -302.968 491.488 -300.977 484.68 -326.317C477.872 -351.657 476.704 -348.494 472.792 -363.258",
    "M720 450C720 450 723.524 466.673 728.513 497.319C733.503 527.964 731.894 519.823 740.001 542.706C748.108 565.589 744.225 560.598 748.996 588.365C753.766 616.131 756.585 602.096 761.881 636.194C767.178 670.293 768.155 649.089 771.853 679.845C775.551 710.6 775.965 703.738 781.753 724.555C787.54 745.372 787.248 758.418 791.422 773.79C795.596 789.162 798.173 807.631 804.056 819.914C809.938 832.197 806.864 843.07 811.518 865.275C816.171 887.48 816.551 892.1 822.737 912.643C828.922 933.185 830.255 942.089 833.153 956.603C836.052 971.117 839.475 969.242 846.83 1003.98C854.185 1038.71 850.193 1028.86 854.119 1048.67C858.045 1068.48 857.963 1074.39 863.202 1094.94C868.44 1115.49 867.891 1108.03 874.497 1138.67C881.102 1169.31 880.502 1170.72 887.307 1186.56C894.111 1202.4 890.388 1209.75 896.507 1231.25C902.627 1252.76 902.54 1245.39 906.742 1279.23",
    "M720 450C720 450 698.654 436.893 669.785 424.902C640.916 412.91 634.741 410.601 615.568 402.586C596.396 394.571 594.829 395.346 568.66 378.206C542.492 361.067 547.454 359.714 514.087 348.978C480.721 338.242 479.79 334.731 467.646 329.846C455.502 324.96 448.63 312.156 416.039 303.755C383.448 295.354 391.682 293.73 365.021 280.975C338.36 268.219 328.715 267.114 309.809 252.575C290.903 238.036 277.185 246.984 259.529 230.958C241.873 214.931 240.502 224.403 211.912 206.241C183.323 188.078 193.288 190.89 157.03 181.714C120.772 172.538 127.621 170.109 108.253 154.714C88.8857 139.319 75.4927 138.974 56.9647 132.314C38.4366 125.654 33.8997 118.704 4.77584 106.7C-24.348 94.6959 -19.1326 90.266 -46.165 81.9082",
    "M720 450C720 450 711.596 475.85 701.025 516.114C690.455 556.378 697.124 559.466 689.441 579.079C681.758 598.693 679.099 597.524 675.382 642.732C671.665 687.94 663.4 677.024 657.844 700.179C652.288 723.333 651.086 724.914 636.904 764.536C622.723 804.158 631.218 802.853 625.414 827.056C619.611 851.259 613.734 856.28 605.94 892.262C598.146 928.244 595.403 924.314 588.884 957.785C582.364 991.255 583.079 991.176 575.561 1022.63C568.044 1054.08 566.807 1058.45 558.142 1084.32C549.476 1110.2 553.961 1129.13 542.367 1149.25C530.772 1169.37 538.268 1180.37 530.338 1207.27C522.407 1234.17 520.826 1245.53 512.156 1274.2",
    "M720 450C720 450 730.571 424.312 761.424 411.44C792.277 398.569 772.385 393.283 804.069 377.232C835.752 361.182 829.975 361.373 848.987 342.782C867.999 324.192 877.583 330.096 890.892 303.897C904.201 277.698 910.277 282.253 937.396 264.293C964.514 246.333 949.357 246.834 978.7 230.438C1008.04 214.042 990.424 217.952 1021.51 193.853C1052.6 169.753 1054.28 184.725 1065.97 158.075C1077.65 131.425 1087.76 139.068 1111.12 120.345C1134.49 101.622 1124.9 104.858 1151.67 86.3162C1178.43 67.7741 1167.09 66.2676 1197.53 47.2606C1227.96 28.2536 1225.78 23.2186 1239.27 12.9649C1252.76 2.7112 1269.32 -9.47929 1282.88 -28.5587C1296.44 -47.6381 1305.81 -41.3853 1323.82 -62.7027C1341.83 -84.0202 1340.32 -82.3794 1368.98 -98.9326",
  ];
  const METHOD_BG_COLORS = [
    "#8f8dc4", "#5c58c9", "#1b19a8", "#141295", "#3634c2",
    "#8f8dc4", "#5c58c9", "#1b19a8", "#141295", "#3634c2",
    "#c9803d", "#8f8dc4", "#5c58c9", "#1b19a8", "#141295",
    "#3634c2", "#8f8dc4", "#5c58c9", "#c9803d", "#1b19a8",
    "#3d3ae0",
  ];
  // Pico de opacidad de cada trazo: 0.55, no 1 como el prototipo/original
  // de Aceternity. Con blanco/texto (--t-ink #f2f1ec) sobre --depth
  // (#050507), un trazo del color más claro de la paleta (#8f8dc4) a
  // opacidad 1 mezclado sobre --depth deja ~2.7:1 de contraste contra el
  // texto si cae justo debajo — por debajo del mínimo. Recalculado a
  // 0.55 sube ese peor caso a >=4.5:1 (AA, texto normal), verificado a
  // mano con la fórmula de luminancia relativa de WCAG para el color más
  // claro de esta paleta. Ver CLAUDE.md error #25: no alcanza con "que se
  // vea sutil", hay que calcular el contraste real.
  const METHOD_BG_PEAK_OPACITY = 0.55;

  /* ============================================================
     NODO 3 · MÉTODO
     Sin GSAP/ScrollTrigger/pin (Spec §4) — el marquee es CSS puro, el
     reveal de entrada por bloque va con un único IntersectionObserver
     binario (una sola vez por bloque, sin progreso fraccional: no hace
     falta acá porque el reveal es entró/no entró, no un porcentaje —
     ver CLAUDE.md error #5), y motionOK/mobileMQ son los mismos que ya
     usa el resto del sitio, no variables propias. El fondo animado sí usa
     GSAP (initMethodBackground) — autorizado explícitamente: la regla del
     nodo prohíbe la MECÁNICA de scroll-jacking (pin/scrub/progreso
     fraccional/frame por frame/position:fixed), no la librería. El fondo
     corre en loop autónomo, nunca atado al scroll — el único uso de
     ScrollTrigger acá es onEnter/onLeave para pausar/reanudar el loop
     según si #method está en pantalla (mismo mecanismo que
     setThresholdVisible en el Nodo 0), sin pin ni scrub.
     ============================================================ */
  function initMethod() {
    const method = document.querySelector(".method");
    if (!method) return;

    initMethodBackground(method);

    if (motionOK) {
      // confirma que el script corrió antes de ocultar nada para animar
      // — mismo patrón que body.enhanced (error #8 del CLAUDE.md)
      document.body.classList.add("method-js");
      initMethodMarquee(method);
      initMethodReveal(method);
    }

    /* Fondo "Background Lines": ahora vive en un contenedor
       position:sticky (ver .method__bg en styles.css) que se queda
       clavado al viewport durante todo el scroll de Método, pedido
       explícito del usuario. Con el contenedor del tamaño real del
       viewport (100svh, igual que el propio prototipo aislado:
       ".bg-lines { height:20rem; @media(min-width:768){height:100vh} }"),
       ya no hace falta estirar ni tilear el SVG — un solo viewBox nativo
       "0 0 1440 900" con preserveAspectRatio="xMidYMid slice" (escala
       UNIFORME, recorta sobrante, nunca deforma — a diferencia de "none",
       que fue justo lo que el usuario reportó como "desproporcionado y
       alargado" en el intento anterior). 3 copias superpuestas de cada
       path (el prototipo original traía 2, "duplicate for more paths";
       subido a pedido explícito del usuario — "aumenta la cantidad de
       líneas"): con el fondo ahora fijo en pantalla durante todo el
       recorrido, más copias suben la probabilidad de que algo esté
       visible en cualquier instante dado. duration también al azar por
       trazo (antes fija en 10 para todos) — variar solo delay/repeatDelay
       desincroniza CUÁNDO arranca cada cometa pero no A QUÉ VELOCIDAD
       viaja; sin esto se sentía un único ritmo de fondo pese al desfase.

       Esto NO es scroll-jacking del contenido (Spec Método §4): los 12
       bloques de texto siguen en flujo normal, pasan una sola vez a la
       velocidad que decida quien navega — lo único clavado es esta capa
       decorativa (pointer-events:none), y se libera sola en el borde
       inferior real de .method vía CSS puro, sin pin ni scrub de GSAP.

       Contención de rendimiento (mismo patrón que Galaxy en el Nodo 0,
       ver docs/nodo-0-umbral.md): (a) móvil/tablet (mobileMQ, ≤1023px)
       usa la mitad de los paths; (b) el loop arranca en pausa y solo
       corre mientras #method esté realmente en pantalla (ScrollTrigger
       onEnter/onLeave más abajo, sin pin ni scrub — instrucción explícita
       del usuario de reusar ese patrón, ya usado en setThresholdVisible
       del Nodo 0). */
    function initMethodBackground(root) {
      const container = root.querySelector(".method__bg");
      if (!container || typeof gsap === "undefined") return;

      const SVG_NS = "http://www.w3.org/2000/svg";
      const paths = mobileMQ.matches
        ? METHOD_BG_PATHS.filter((_, i) => i % 2 === 0)
        : METHOD_BG_PATHS;

      const svg = document.createElementNS(SVG_NS, "svg");
      svg.setAttribute("viewBox", "0 0 1440 900");
      svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
      svg.setAttribute("fill", "none");
      svg.setAttribute("aria-hidden", "true");

      // 3 copias superpuestas de cada path (antes 2) — más líneas a pedido
      // del usuario. duration variable por trazo (7-15s, antes fijo en 10
      // para todos): con delay/repeatDelay ya al azar pero la MISMA
      // duración, todos los cometas viajaban a la misma velocidad relativa
      // y se notaba un ritmo único de fondo — variar también la duración
      // desincroniza la velocidad, no solo el arranque.
      const COPIES = 3;
      const tweens = [];
      for (let copy = 0; copy < COPIES; copy++) {
        paths.forEach((d, idx) => {
          const path = document.createElementNS(SVG_NS, "path");
          path.setAttribute("d", d);
          path.setAttribute("stroke", METHOD_BG_COLORS[idx % METHOD_BG_COLORS.length]);
          path.setAttribute("stroke-width", "2.3");
          path.setAttribute("stroke-linecap", "round");
          svg.appendChild(path);

          if (motionOK) {
            // delay/repeatDelay/duration al azar, calculados una sola vez
            // al montar (igual que el prototipo) — no se recalculan en
            // cada vuelta del loop.
            const delay = Math.floor(Math.random() * 10);
            const repeatDelay = Math.floor(Math.random() * 10 + 2);
            const duration = 7 + Math.random() * 8; // 7-15s, antes fijo en 10
            gsap.set(path, { strokeDashoffset: 800, opacity: 0, "--dash-head": 50 });
            const tween = gsap.to(path, {
              keyframes: {
                "0%": { strokeDashoffset: 800, "--dash-head": 50, opacity: 0 },
                "33%": { opacity: METHOD_BG_PEAK_OPACITY },
                "66%": { opacity: METHOD_BG_PEAK_OPACITY },
                "100%": { strokeDashoffset: 0, "--dash-head": 20, opacity: 0 },
              },
              duration,
              ease: "none",
              delay,
              repeat: -1,
              repeatDelay,
              paused: true, // arranca pausado: #method no está en pantalla al cargar, ScrollTrigger lo reanuda si corresponde
            });
            tweens.push(tween);
          } else {
            // ?static=1: quieto y visible, sin animar (pedido explícito) —
            // trazo completo a la opacidad de reposo, sin tween.
            gsap.set(path, { strokeDashoffset: 0, "--dash-head": 20, opacity: METHOD_BG_PEAK_OPACITY * 0.7 });
          }
        });
      }

      container.appendChild(svg);

      if (motionOK && tweens.length) {
        ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => tweens.forEach((t) => t.play()),
          onEnterBack: () => tweens.forEach((t) => t.play()),
          onLeave: () => tweens.forEach((t) => t.pause()),
          onLeaveBack: () => tweens.forEach((t) => t.pause()),
        });
      }
    }

    /* Marquee — repeticiones calculadas por ancho real, no un número
       fijo (Spec §4: "se calcula por ancho real, no con un número fijo
       de repeticiones"). El HTML trae 8 <span> fijos por riel como
       respaldo estático (?static=1 / JS caído); acá, con motion activo,
       se mide el ancho real de un ítem ya con la fuente cargada (mismo
       cuidado que error #9: medir antes de que cargue la fuente da un
       ancho falso) y se reconstruyen los rieles con la cantidad exacta
       que hace falta para cubrir el viewport. Recalcula en resize
       (debounced). */
    function initMethodMarquee(root) {
      const tracks = Array.from(root.querySelectorAll(".method__marquee-track"));
      if (!tracks.length) return;

      const firstSpan = tracks[0].querySelector("span");
      const TEXT = firstSpan ? firstSpan.textContent : "EL MÉTODO.";
      let resizeTimer = null;

      function measureItemWidth() {
        const probe = document.createElement("span");
        probe.textContent = TEXT;
        probe.style.position = "absolute";
        probe.style.visibility = "hidden";
        tracks[0].appendChild(probe);
        const w = probe.offsetWidth;
        tracks[0].removeChild(probe);
        return w || 1;
      }

      function build() {
        const itemWidth = measureItemWidth();
        // +2 de margen: un riel que apenas cubre el viewport en el frame
        // inicial deja de cubrirlo a mitad del loop (traslada -50%).
        const count = Math.max(8, Math.ceil(window.innerWidth / itemWidth) + 2);
        const html = ("<span>" + TEXT + "</span>").repeat(count);
        tracks.forEach((track) => { track.innerHTML = html; });
      }

      if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
      else build();

      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(build, 200);
      });
    }

    /* Reveal de entrada: opacidad 0→1 + traslado vertical corto, una
       sola vez por bloque, vía un único IntersectionObserver que hace
       unobserve() tras revelar. threshold:0.15 + rootMargin negativo
       abajo: el bloque tiene que entrar un poco más que "rozar" el
       borde inferior antes de dispararse.

       Estado de borde — recarga con scroll restaurado a mitad del nodo:
       un bloque que ya quedó por encima del viewport cuenta como
       revelado sin animar (se detecta antes de observar). */
    function initMethodReveal(root) {
      const els = Array.from(root.querySelectorAll("[data-reveal]"));
      if (!els.length) return;

      const io = new IntersectionObserver(onIntersect, {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      });

      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom <= 0) el.classList.add("is-in", "no-anim");
        else io.observe(el);
      });

      function onIntersect(entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target);
        });
      }

      function reveal(el) {
        el.classList.add("is-in");
        io.unobserve(el);
      }

      /* Red de seguridad, NO la causa del bug de "Método no se ve nada"
         — esa fue el `gsap.from("[data-reveal]")` global del Nodo 0
         dejando opacity:0 inline (error #26 en CLAUDE.md), y contra un
         estilo inline este respaldo tampoco habría servido. Se queda
         igual porque cuesta un listener pasivo y cubre el caso de que
         el callback del observer se demore o se suprima.

         Criterio idéntico al del observer a propósito (mismo 0.15 de
         threshold, mismo rootMargin de -10% abajo): si revelara antes o
         después que él, el nodo tendría dos reveals con timing distinto
         según cuál se adelante. Ojo — en una pestaña oculta NINGUNO de
         los dos dispara: el navegador no corre el ciclo de render, así
         que IntersectionObserver no emite y no hay scroll que escuchar.
         Eso no es un bug, y medir el reveal en una pestaña en segundo
         plano da un falso negativo (ese falso negativo fue justo lo que
         mandó la primera investigación por el camino equivocado). */
      let fallbackTimer = null;
      function yaVisible(el) {
        const rect = el.getBoundingClientRect();
        if (!rect.height) return false;
        const limite = window.innerHeight * 0.9; // rootMargin "0px 0px -10% 0px"
        const visible = Math.min(rect.bottom, limite) - Math.max(rect.top, 0);
        return visible / rect.height >= 0.15; // threshold: 0.15
      }
      function fallbackCheck() {
        els.forEach((el) => {
          if (!el.classList.contains("is-in") && yaVisible(el)) reveal(el);
        });
      }
      window.addEventListener(
        "scroll",
        () => {
          clearTimeout(fallbackTimer);
          fallbackTimer = setTimeout(fallbackCheck, 150);
        },
        { passive: true }
      );
    }
  }

  /* ============================================================
     LENIS — scroll suave global
     Única pieza de Método que no es de un nodo puntual: sincroniza TODO
     el sitio con ScrollTrigger, que ya gobierna el pin del Catálogo y
     los 5 pines de Territorio (ver Ruta Técnica de Método en el vault).
     Antes de dar esto por cerrado, verificar en navegador real que
     ninguno de los dos perdió sincronía, y que el scrub de los frames
     WebP de los blobs del Catálogo no se desincroniza. Si algo se
     desincroniza, la salida documentada NO es pelearse con la
     sincronización — es bajar Lenis a alcance parcial (montarlo solo
     desde #method hacia abajo con `new Lenis({ wrapper, content })`) y
     aceptar el cambio de tacto a mitad del sitio.
     ============================================================ */
  function initLenis() {
    if (!motionOK) return; // ?static=1: scroll nativo, sin inercia
    if (typeof window.Lenis === "undefined") return; // CDN caído: scroll nativo, sin estado de error visible

    const lenis = new Lenis({ smoothWheel: true, syncTouch: false });
    lenisInstance = lenis; // expuesta para que el acordeón de Voces compense scroll al cerrar
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ============================================================
     NODO 4 · VOCES
     Sin GSAP, sin ScrollTrigger, sin pin, sin scroll-jacking (Spec §6,
     regla dura de este nodo, no por omisión) — el segundo nodo del
     sitio, junto con Método, que no pinea nada. Los únicos mecanismos:
     el marquee (CSS @keyframes puro, igual que initMethod), el reveal
     de entrada por bloque (IntersectionObserver binario, una sola vez,
     mismo patrón que initMethod) y el acordeón (altura medida por
     scrollHeight + transición CSS interrumpible) — primer <button>
     interactivo real del sitio. Lenis (initLenis, más arriba) solo
     aporta scroll suave heredado; este nodo no lo monta aparte.

     Merge desde el prototipo aislado en PRUEBAS/Prototipo - Nodo 4
     Voces (alta fidelidad)/, ya construido, auditado y comparado
     contra el frame real de Figma antes de integrar acá.
     ============================================================ */
  function initVoices() {
    const root = document.querySelector(".voices");
    if (!root) return;

    function initMarquee(scopeRoot) {
      const tracks = Array.prototype.slice.call(scopeRoot.querySelectorAll(".voices__marquee-track"));
      if (!tracks.length) return;

      const firstSpan = tracks[0].querySelector("span");
      const TEXT = firstSpan ? firstSpan.textContent : "VOCES.";
      let resizeTimer = null;

      function measureItemWidth() {
        const probe = document.createElement("span");
        probe.textContent = TEXT;
        probe.style.position = "absolute";
        probe.style.visibility = "hidden";
        tracks[0].appendChild(probe);
        const w = probe.offsetWidth;
        tracks[0].removeChild(probe);
        return w || 1;
      }

      function build() {
        const itemWidth = measureItemWidth();
        const count = Math.max(8, Math.ceil(window.innerWidth / itemWidth) + 2);
        let html = "";
        for (let i = 0; i < count; i++) html += "<span>" + TEXT + "</span>";
        tracks.forEach((track) => { track.innerHTML = html; });
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(build);
      } else {
        build();
      }

      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(build, 200);
      });
    }

    function initReveal(scopeRoot) {
      const els = Array.prototype.slice.call(scopeRoot.querySelectorAll("[data-reveal]"));
      if (!els.length) return;

      const io = new IntersectionObserver(onIntersect, {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      });

      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom <= 0) {
          el.classList.add("is-in", "no-anim");
        } else {
          io.observe(el);
        }
      });

      function onIntersect(entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }
    }

    function syncRowHiddenState(container) {
      if (!container) return;
      const rows = Array.prototype.slice.call(container.querySelectorAll(".voices__row"));
      rows.forEach((row) => {
        const toggle = row.querySelector(".voices__row-toggle");
        const body = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
        if (body) body.hidden = !row.classList.contains("is-open");
      });
    }

    function clearPendingTransition(body) {
      if (body._voicesEndHandler) {
        body.removeEventListener("transitionend", body._voicesEndHandler);
        body._voicesEndHandler = null;
      }
    }

    function expandRow(row, toggle, body) {
      // Revertir `hidden` ANTES de medir/animar — con `hidden` puesto el
      // elemento es display:none (sin layout), scrollHeight daría 0.
      body.hidden = false;

      // Altura REAL actual en pantalla (0 si venía colapsada, o un valor
      // intermedio si se interrumpió un cierre en curso) — nunca el
      // valor lógico, para que un doble click rápido arranque en la
      // dirección nueva desde donde está (Spec §4.4).
      const current = body.getBoundingClientRect().height;
      clearPendingTransition(body);
      body.style.height = current + "px";
      void body.offsetHeight; // fuerza reflow antes de cambiar el destino

      row.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");

      const target = body.scrollHeight;
      requestAnimationFrame(() => { body.style.height = target + "px"; });

      const onEnd = (e) => {
        if (e.target !== body || e.propertyName !== "height") return;
        body.removeEventListener("transitionend", onEnd);
        body._voicesEndHandler = null;
        if (row.classList.contains("is-open")) body.style.height = "auto";
      };
      body.addEventListener("transitionend", onEnd);
      body._voicesEndHandler = onEnd;
    }

    function collapseRow(row, toggle, body) {
      // Spec §4.3: si la fila arranca por encima del viewport, colapsarla
      // empuja todo el contenido de abajo hacia arriba y el lector pierde
      // su punto de lectura — se compensa el scroll por el mismo delta
      // que se recoge, vía lenisInstance.scrollTo si Lenis está montado.
      const rectBefore = row.getBoundingClientRect();
      const current = body.getBoundingClientRect().height;

      clearPendingTransition(body);
      body.style.height = current + "px";
      void body.offsetHeight;

      row.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      body.style.height = "0px";

      const onEnd = (e) => {
        if (e.target !== body || e.propertyName !== "height") return;
        body.removeEventListener("transitionend", onEnd);
        body._voicesEndHandler = null;
        // Recién ahora, con la transición ya terminada, se saca del árbol
        // de accesibilidad — nunca antes (cortaría la transición visual).
        body.hidden = true;
      };
      body.addEventListener("transitionend", onEnd);
      body._voicesEndHandler = onEnd;

      if (rectBefore.top < 0) {
        const delta = current; // el destino siempre es 0: el delta es la altura completa que tenía
        if (lenisInstance) {
          const currentScroll = window.scrollY || window.pageYOffset;
          lenisInstance.scrollTo(currentScroll - delta, { immediate: true });
        } else {
          window.scrollBy(0, -delta);
        }
      }
    }

    function initAccordion(container) {
      if (!container) return;
      // Un solo listener de click DELEGADO por perfil (no uno por fila).
      container.addEventListener("click", (event) => {
        const toggle = event.target.closest(".voices__row-toggle");
        if (!toggle || !container.contains(toggle)) return;

        const body = document.getElementById(toggle.getAttribute("aria-controls"));
        const row = toggle.closest(".voices__row");
        if (!body || !row) return;

        const expanded = toggle.getAttribute("aria-expanded") === "true";
        if (expanded) collapseRow(row, toggle, body);
        else expandRow(row, toggle, body);
      });
    }

    if (motionOK) {
      // Confirma que el script corrió antes de ocultar nada para animar —
      // mismo patrón que body.method-js / body.enhanced.
      document.body.classList.add("voices-js");
      initMarquee(root);
      initReveal(root);

      initAccordion(root.querySelector("[data-melisa-accordion]"));
      initAccordion(root.querySelector("[data-juandavid-accordion]"));
      initAccordion(root.querySelector("[data-junior-accordion]"));

      // Estado inicial: las 11 filas arrancan colapsadas, hay que
      // sacarlas del árbol de accesibilidad desde el primer render.
      syncRowHiddenState(root.querySelector("[data-melisa-accordion]"));
      syncRowHiddenState(root.querySelector("[data-juandavid-accordion]"));
      syncRowHiddenState(root.querySelector("[data-junior-accordion]"));
    } else {
      // ?static=1 con JS disponible: la armadura CSS no aplica, las 11
      // filas quedan expandidas en flujo normal sin necesidad de click —
      // pero el HTML trae aria-expanded="false" fijo, se corrige a
      // "true" para que el botón no anuncie "colapsado" sobre contenido
      // ya visible.
      const staticToggles = Array.prototype.slice.call(root.querySelectorAll(".voices__row-toggle"));
      staticToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", "true"));
    }
    // Sin JS o con ?static=1: sin body.voices-js, la armadura CSS no
    // aplica y las 11 filas quedan abiertas y visibles en flujo normal
    // (Spec §4.4).
  }

  /* ============================================================
     NODO 5 · RUTAS
     Sin GSAP, sin ScrollTrigger, sin pin, sin scroll-jacking (Spec §6,
     regla dura de este nodo). Los mecanismos: el marquee (CSS
     @keyframes puro, igual que Método/Voces), el reveal de entrada
     por bloque (IntersectionObserver binario, una sola vez), el
     combinador (radiogroup con roving tabindex + fundido corto de la
     tarjeta) y el fondo de 3.14 (WebGL autónomo por tiempo, pausado/
     reanudado por un IntersectionObserver plano — nunca por scroll,
     la única librería que este nodo tiene prohibida por nombre).

     Distinción clave frente a Voces (Spec §4.5): acá "JS corrió" y
     "el movimiento está activo" son dos señales separadas.
       body.routes-js      → el combinador quedó armado (arma la ficha
                              técnica de respaldo fuera de pantalla).
                              Se pone SIEMPRE que el script corre, con
                              o sin ?static=1 — el combinador es
                              interacción, no animación, y sigue
                              funcionando en los dos casos.
       body.routes-motion  → controla marquee, reveals de entrada y
                              el fundido de la tarjeta. Solo si NO hay
                              ?static=1.

     Merge desde el prototipo aislado en PRUEBAS/Prototipo - Nodo 5
     Rutas (alta fidelidad)/, ya construido, auditado (responsive,
     accesibilidad/contraste, guardrails de motion) y comparado contra
     el frame real de Figma antes de integrar acá.
     ============================================================ */
  function initRoutes() {
    const root = document.querySelector(".routes");
    if (!root) return;

    function initMarquee(scopeRoot) {
      const tracks = Array.prototype.slice.call(scopeRoot.querySelectorAll(".routes__marquee-track"));
      if (!tracks.length) return;

      const firstSpan = tracks[0].querySelector("span");
      const TEXT = firstSpan ? firstSpan.textContent : "RUTAS.";
      let resizeTimer = null;

      function measureItemWidth() {
        const probe = document.createElement("span");
        probe.textContent = TEXT;
        probe.style.position = "absolute";
        probe.style.visibility = "hidden";
        tracks[0].appendChild(probe);
        const w = probe.offsetWidth;
        tracks[0].removeChild(probe);
        return w || 1;
      }

      function build() {
        const itemWidth = measureItemWidth();
        const count = Math.max(8, Math.ceil(window.innerWidth / itemWidth) + 2);
        let html = "";
        for (let i = 0; i < count; i++) html += "<span>" + TEXT + "</span>";
        tracks.forEach((track) => { track.innerHTML = html; });
      }

      if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
      else build();

      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(build, 200);
      });
    }

    function initReveal(scopeRoot) {
      const els = Array.prototype.slice.call(scopeRoot.querySelectorAll("[data-reveal]"));
      if (!els.length) return;

      const io = new IntersectionObserver(onIntersect, {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      });

      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom <= 0) el.classList.add("is-in", "no-anim");
        else io.observe(el);
      });

      function onIntersect(entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }
    }

    function initCombinator(scopeRoot) {
      const combinator = scopeRoot.querySelector("[data-combinator]");
      const matrix = scopeRoot.querySelector("[data-routes-matrix]");
      if (!combinator || !matrix) return;

      const cardEl = combinator.querySelector("[data-card]");
      const eyebrowEl = combinator.querySelector("[data-card-eyebrow]");
      const horizonEl = combinator.querySelector("[data-card-horizon]");
      const roleEl = combinator.querySelector("[data-card-role]");
      const descEl = combinator.querySelector("[data-card-desc]");
      const futureBtn = combinator.querySelector("[data-future-btn]");
      const lineaGroup = combinator.querySelector('[data-chip-row="linea"]');
      const discGroup = combinator.querySelector('[data-chip-row="disciplina"]');

      // 3.11: la ficha técnica es la fuente de datos — un objeto
      // { linea: { disciplina: { hoy:{role,desc}, futuro:{role,desc} } } },
      // leído una sola vez del DOM, nunca duplicado a mano acá.
      function buildDataMap() {
        const map = {};
        const tables = Array.prototype.slice.call(matrix.querySelectorAll(".routes__matrix-table"));
        tables.forEach((table) => {
          const linea = table.dataset.linea;
          map[linea] = {};
          const rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
          rows.forEach((row) => {
            const disciplina = row.dataset.disciplina;
            const cells = row.querySelectorAll("td");
            map[linea][disciplina] = {
              hoy: { role: cells[0].dataset.role, desc: cells[0].dataset.desc },
              futuro: { role: cells[1].dataset.role, desc: cells[1].dataset.desc },
            };
          });
        });
        return map;
      }
      const dataMap = buildDataMap();

      function buildLabelMap(groupEl, dataAttr) {
        const map = {};
        Array.prototype.slice.call(groupEl.querySelectorAll('[role="radio"]')).forEach((chip) => {
          map[chip.dataset[dataAttr]] = chip.textContent.trim();
        });
        return map;
      }
      const lineaLabels = buildLabelMap(lineaGroup, "linea");
      const discLabels = buildLabelMap(discGroup, "disciplina");

      // Arranca resuelto con el default del HTML (LENGUAJE × SOFTWARE
      // DEV, estado HOY) — Spec §4.1.
      let currentLinea = lineaGroup.querySelector('[aria-checked="true"]').dataset.linea;
      let currentDisciplina = discGroup.querySelector('[aria-checked="true"]').dataset.disciplina;
      let currentState = cardEl.dataset.state || "hoy";
      let renderToken = 0;

      function render(animate) {
        const token = ++renderToken;
        const combo = dataMap[currentLinea][currentDisciplina];
        const stateData = combo ? combo[currentState] : null;
        const lineaLabel = lineaLabels[currentLinea];
        const discLabel = discLabels[currentDisciplina];
        const horizonText = currentState === "hoy" ? "A DÍA DE HOY" : "EN 2031";

        function apply() {
          eyebrowEl.textContent = lineaLabel + " × " + discLabel;
          horizonEl.textContent = horizonText;
          if (stateData) {
            roleEl.textContent = stateData.role;
            descEl.textContent = stateData.desc;
          } else {
            roleEl.textContent = "Todavía no hay una lectura para esta combinación";
            descEl.textContent = "Elige otra línea o disciplina — esta cruza no tiene destino curado por ahora.";
          }
          cardEl.dataset.state = currentState;
          futureBtn.setAttribute("aria-pressed", currentState === "futuro" ? "true" : "false");
        }

        if (!animate || !motionOK) { apply(); return; }

        cardEl.classList.add("is-swapping");
        window.setTimeout(() => {
          // Un cambio más nuevo ya superó a este — se descarta en vez
          // de pisar el resultado más reciente (Spec §4.5: doble
          // presión rápida / cambio de chip a mitad de fundido).
          if (token !== renderToken) return;
          apply();
          cardEl.classList.remove("is-swapping");
        }, 190);
      }

      function selectChip(groupEl, chip) {
        Array.prototype.slice.call(groupEl.querySelectorAll('[role="radio"]')).forEach((c) => {
          const checked = c === chip;
          c.setAttribute("aria-checked", checked ? "true" : "false");
          c.tabIndex = checked ? 0 : -1;
        });
      }

      function onChipChosen(kind, chip) {
        if (kind === "linea") currentLinea = chip.dataset.linea;
        else currentDisciplina = chip.dataset.disciplina;
        // Cambiar de línea o disciplina siempre vuelve la tarjeta a
        // HOY (Spec §4.2/§3.10).
        currentState = "hoy";
        render(true);
      }

      function wireChipGroup(groupEl, kind) {
        groupEl.addEventListener("click", (event) => {
          const chip = event.target.closest('[role="radio"]');
          if (!chip || !groupEl.contains(chip)) return;
          if (chip.getAttribute("aria-checked") === "true") return;
          selectChip(groupEl, chip);
          onChipChosen(kind, chip);
        });

        groupEl.addEventListener("keydown", (event) => {
          const chips = Array.prototype.slice.call(groupEl.querySelectorAll('[role="radio"]'));
          const currentIndex = chips.findIndex((c) => c.getAttribute("aria-checked") === "true");
          let nextIndex = null;
          if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % chips.length;
          else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + chips.length) % chips.length;
          else return;
          event.preventDefault();
          const chip = chips[nextIndex];
          chip.focus();
          selectChip(groupEl, chip);
          onChipChosen(kind, chip);
        });
      }

      wireChipGroup(lineaGroup, "linea");
      wireChipGroup(discGroup, "disciplina");

      futureBtn.addEventListener("click", () => {
        currentState = currentState === "hoy" ? "futuro" : "hoy";
        render(true);
      });

      // Primer render: sincroniza el DOM con la misma fuente de datos
      // que usará cada cambio posterior.
      render(false);

      // Combinador armado: la ficha técnica de respaldo sale de
      // pantalla (CSS, ver body.routes-js [data-combinator].is-ready).
      combinator.classList.add("is-ready");
    }

    /* ---------- 3.14: fondo (FloatingLines, WebGL) ----------
       Portado desde reactbits.dev/backgrounds/floating-lines — misma
       lógica comentada y reutilizable en RECURSOS/componentes/
       floating-lines.js (fuera del repo; el source crudo original
       queda en RECURSOS/docs/FONDO RUTAS.md). Carga Three.js por
       import() dinámico desde esm.sh, mismo patrón exacto que
       initGalaxy()/initAsciiText() de Umbral (misma versión pineada,
       0.160.0 — así el navegador reutiliza la descarga si el lector
       ya pasó por Umbral en esta sesión).

       Paleta: linesGradient usa --r-accent/--r-ink-marquee (Spec
       §5.3) en vez del rosa/azul del demo de reactbits — el shader
       original solo cae en ese rosa/azul cuando NO se le pasa
       linesGradient (ver background_color() en el fragment shader);
       pasándolo, lo evita por completo. Guardrails §6: "no introducir
       colores fuera de §5.3, no crear un acento propio de Rutas" —
       por eso ninguno nuevo, solo los dos lavanda que el nodo ya usa.

       Interactividad: decisión del usuario 2026-07-29, "reactivo al
       mouse pero solo en PC y laptop" — pointerFxOK (definida arriba,
       = !mobileMQ.matches) es exactamente esa condición y ya la usan
       Galaxy y ASCIIText para lo mismo, así que se reusa tal cual en
       vez de inventar un segundo criterio. El loop de tiempo completo
       también se congela en móvil/tablet después del primer frame —
       mismo criterio que animateGalaxy, no solo el mouse: es el
       shader más caro por píxel del sitio (tres grupos de líneas en
       loop, cada uno con trig por iteración) sobre un canvas de un
       viewport entero.

       El contenedor (.routes__field-sticky) tiene pointer-events:none
       heredado de .routes__field — por eso el listener va en
       `document`, no en el contenedor (mismo motivo que initGalaxy),
       con las coordenadas acotadas a los límites del contenedor antes
       de mapearlas a la textura (mismo cuidado que dejó anotado el
       error #11 del ASCII text: sin acotar, un shader pensado para
       pantalla completa extrapola raro apenas el cursor sale de la
       franja sticky). */
    function initRoutesField(ctn) {
      if (!ctn) return Promise.resolve(null);
      return import("https://esm.sh/three@0.160.0")
        .then(({ Clock, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer }) => {
          const vertexShader = `
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

          const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);

  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;

  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  vec3 gradientColor;

  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);

    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];

    gradientColor = mix(c1, c2, f);
  }

  return gradientColor * 0.5;
}

  float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;

  float x_offset   = offset;
  float x_movement = time * 0.1;
  float amp        = sin(offset + time * 0.2) * 0.3;
  float y          = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;

  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);

  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive
      );
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);

      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.1;
    }
  }

  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

          // valores elegidos para este sitio — no universales, se
          // tantearon a ojo sobre el nodo real (mismo criterio que ya
          // deja anotado galaxy.js para su propio cfg).
          const cfg = {
            linesGradient: ["#c1c1ff", "#e1dfff"],
            lineCount: 5,
            lineDistance: 6,
            animationSpeed: 0.4,
            bendRadius: 6,
            bendStrength: -1.2,
            mouseDamping: 0.06,
            parallaxStrength: 0.12,
          };

          function hexToVec3(hex) {
            const v = hex.replace("#", "");
            return new Vector3(
              parseInt(v.slice(0, 2), 16) / 255,
              parseInt(v.slice(2, 4), 16) / 255,
              parseInt(v.slice(4, 6), 16) / 255
            );
          }

          const scene = new Scene();
          const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
          camera.position.z = 1;

          const renderer = new WebGLRenderer({ antialias: true, alpha: true });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.domElement.style.width = "100%";
          renderer.domElement.style.height = "100%";
          ctn.appendChild(renderer.domElement);

          const uniforms = {
            iTime: { value: 0 },
            iResolution: { value: new Vector3(1, 1, 1) },
            animationSpeed: { value: cfg.animationSpeed },

            enableTop: { value: true },
            enableMiddle: { value: true },
            enableBottom: { value: true },

            topLineCount: { value: cfg.lineCount },
            middleLineCount: { value: cfg.lineCount },
            bottomLineCount: { value: cfg.lineCount },

            topLineDistance: { value: cfg.lineDistance * 0.01 },
            middleLineDistance: { value: cfg.lineDistance * 0.01 },
            bottomLineDistance: { value: cfg.lineDistance * 0.01 },

            topWavePosition: { value: new Vector3(10.0, 0.5, -0.4) },
            middleWavePosition: { value: new Vector3(5.0, 0.0, 0.2) },
            bottomWavePosition: { value: new Vector3(2.0, -0.7, -1) },

            iMouse: { value: new Vector2(-1000, -1000) },
            interactive: { value: pointerFxOK },
            bendRadius: { value: cfg.bendRadius },
            bendStrength: { value: cfg.bendStrength },
            bendInfluence: { value: 0 },

            parallax: { value: pointerFxOK },
            parallaxStrength: { value: cfg.parallaxStrength },
            parallaxOffset: { value: new Vector2(0, 0) },

            lineGradient: {
              value: Array.from({ length: 8 }, () => new Vector3(1, 1, 1)),
            },
            lineGradientCount: { value: cfg.linesGradient.length },
          };
          cfg.linesGradient.forEach((hex, i) => {
            const c = hexToVec3(hex);
            uniforms.lineGradient.value[i].set(c.x, c.y, c.z);
          });

          const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
          const mesh = new Mesh(new PlaneGeometry(2, 2), material);
          scene.add(mesh);

          function resize() {
            const width = ctn.clientWidth || 1;
            const height = ctn.clientHeight || 1;
            renderer.setSize(width, height, false);
            uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
          }
          let fieldResizeTimer = null;
          window.addEventListener("resize", () => {
            clearTimeout(fieldResizeTimer);
            fieldResizeTimer = setTimeout(resize, 200);
          });
          resize();

          const targetMouse = new Vector2(-1000, -1000);
          const currentMouse = new Vector2(-1000, -1000);
          let targetInfluence = 0;
          let currentInfluence = 0;
          const targetParallax = new Vector2(0, 0);
          const currentParallax = new Vector2(0, 0);

          // en móvil/tablet, un frame y queda quieto — mismo criterio
          // (y misma condición, !mobileMQ.matches) que animateGalaxy.
          const animateField = !mobileMQ.matches;
          const clock = new Clock();
          let rafId = null;
          function update() {
            rafId = animateField ? requestAnimationFrame(update) : null;
            uniforms.iTime.value = clock.getElapsedTime();

            if (pointerFxOK) {
              currentMouse.lerp(targetMouse, cfg.mouseDamping);
              uniforms.iMouse.value.copy(currentMouse);
              currentInfluence += (targetInfluence - currentInfluence) * cfg.mouseDamping;
              uniforms.bendInfluence.value = currentInfluence;
              currentParallax.lerp(targetParallax, cfg.mouseDamping);
              uniforms.parallaxOffset.value.copy(currentParallax);
            }

            renderer.render(scene, camera);
          }
          rafId = requestAnimationFrame(update);

          if (pointerFxOK) {
            document.addEventListener("mousemove", (e) => {
              const rect = renderer.domElement.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
              targetInfluence = inside ? 1.0 : 0.0;
              if (!inside) return;
              const dpr = renderer.getPixelRatio();
              targetMouse.set(x * dpr, (rect.height - y) * dpr);
              targetParallax.set(
                ((x - rect.width / 2) / rect.width) * cfg.parallaxStrength,
                -((y - rect.height / 2) / rect.height) * cfg.parallaxStrength
              );
            });
          }

          return {
            pause() {
              if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
              }
            },
            resume() {
              if (animateField && rafId === null) rafId = requestAnimationFrame(update);
            },
          };
        })
        .catch(() => {
          // sin conexión al CDN de Three.js: .routes__field queda vacío,
          // el negro plano de .routes de fondo — el nodo ya está
          // diseñado para verse completo y correcto sin él (Spec §3.14).
          return null;
        });
    }

    // El combinador se arma SIEMPRE que el script corre — es
    // interacción, no animación, y sigue funcionando con ?static=1
    // (Spec §4.5, a diferencia del acordeón de Voces).
    document.body.classList.add("routes-js");
    initCombinator(root);

    if (motionOK) {
      document.body.classList.add("routes-motion");
      initMarquee(root);
      initReveal(root);

      // fondo: mismo criterio que Galaxy/ASCIIText en Umbral — se
      // salta en conexión limitada (isConstrained), y se pausa/reanuda
      // con la visibilidad de .routes en vez de dejarlo renderizando
      // para siempre una vez que el lector ya se fue de Rutas.
      if (!isConstrained) {
        const fieldCtn = root.querySelector(".routes__field-sticky");
        let fieldHandle = null;
        let fieldVisible = false;
        initRoutesField(fieldCtn).then((handle) => {
          fieldHandle = handle;
          if (handle && !fieldVisible) handle.pause();
        });
        const fieldObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              fieldVisible = entry.isIntersecting;
              if (fieldHandle) fieldVisible ? fieldHandle.resume() : fieldHandle.pause();
            });
          },
          { threshold: 0 }
        );
        fieldObserver.observe(root);
      }
    }
    // Sin JS: sin body.routes-js, la armadura CSS no aplica y la
    // ficha técnica de las 30 combinaciones queda visible de corrido,
    // con el combinador (sin listeners) simplemente inerte (Spec §4.5).
  }

  initTerritory();
  initMethod();
  initVoices();
  initRoutes();
  initLenis();
})();
