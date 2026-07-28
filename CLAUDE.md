# Guía de Campo del Creador Digital — Acto I

Sitio scrollytelling estático (sin build step) para la carrera de Creación
Digital — Universidad El Bosque. HTML/CSS/JS planos: un `index.html`, un
`styles.css`, un `script.js` en un IIFE. GSAP 3.12.5 + ScrollTrigger y Lenis
por CDN, sin bundler ni framework.

Este archivo es **el índice y las reglas duras**. El detalle vive en `docs/`,
y se lee por demanda — no lo leas todo. La fuente de verdad de contenido,
narrativa y mecánica es el vault de Obsidian, fuera de este repo:
`DOCUMENTOS/Vault - Guía de Campo/`.

**Entra siempre por `00 - Indice.md`**, nunca directo a un documento suelto:
dice qué leer según la tarea y resuelve las precedencias cuando dos
documentos se contradicen (el caso de los tres specs de Territorio, entre
otros). Por nodo hay hasta tres archivos —`Spec -`, `Ruta Tecnica -` y
`Contenido -`—; el Nodo 5 (Rutas) hoy solo tiene el de Contenido.

## Reglas duras (aplican siempre, en cualquier nodo)

- **Antes de hacer commit**: mostrar el mensaje propuesto y el resumen de
  archivos/cambios, y esperar confirmación explícita del usuario antes de
  correr `git commit` — incluso cuando el usuario ya pidió "haz un commit"
  en el mismo turno. Nunca commitear primero y mostrar después.
- **`?v=N`**: al editar `styles.css` o `script.js`, subir su versión en
  `index.html`. Se olvida siempre y produce bugs fantasma (error #7).
- **Ningún selector global sin acotar al nodo**: `[data-reveal]` no es de
  nadie. Todo sistema de reveal se acota a su propia sección
  (`#threshold [data-reveal]`, `.method [data-reveal]`). Ignorar esto ya
  dejó dos nodos invisibles en producción (error #26).
- **Motion por defecto**: el sitio anima siempre, **ignora
  `prefers-reduced-motion`** — decisión de producto explícita del usuario.
  Quien quiera la versión calma la pide con `?static=1`.
- **Breakpoints** (fijos, también en el header de `styles.css`): móvil
  ≤767 · tablet 768–1023 · laptop 1024–1439 (tier base, sin `@media`) ·
  desktop 1440–1919 · pantallas grandes ≥1920.
  **Esto describe el código de hoy, no el objetivo.** `DESIGN.md` invierte
  la cascada —1440 pasa a ser el tier base, el ancho de autoría de Figma— y
  manda sobre cualquier valor de layout nuevo. Esta línea se reescribe en el
  commit que implemente la inversión, no antes.
- **Ningún valor de layout inventado a mano**: todo `max-width`, margen o
  spacing sale de una medición del frame de Figma a 1440, o de la fórmula de
  `DESIGN.md` §2, o queda anotado como decisión explícita. Un `38rem`
  elegido a ojo no es ninguna de las tres — así quedó Método midiendo la
  mitad de lo que debía (`DESIGN.md` §8, D-01).
- **Tipografía base**: una sola familia (Archivo) — itálica-black para
  títulos, regular/medium para cuerpo. El spec de Acto I pide explícitamente
  "la misma familia" para títulos y cuerpo (a diferencia del spec de home
  original, que pedía dos familias distintas). Territorio, Método y Voces
  suman familias propias, acotadas a su nodo — ver su `docs/`.
- **Verificar de verdad**: el navegador embebido del panel de preview no
  compositea frames si el panel no está desplegado — ahí un reveal que
  "no funciona" es un falso negativo. Ver `docs/flujo-de-trabajo.md` §5.
- **Sin scroll-jacking desde el Nodo 3 en adelante**: nada de pin, scrub,
  progreso fraccional atado al scroll, secuencias frame por frame, ni
  `position:fixed` dentro del nodo. El contenido pasa una sola vez, hacia
  arriba, a la velocidad que decida quien navega (Spec Método §4).
  **Es una regla sobre la mecánica de scroll, no sobre la librería**: GSAP
  sí puede usarse como motor de animación autónoma —un loop que corre solo,
  independiente del scroll—; lo que no puede es manejar el scroll. El propio
  spec §4 ya prevé "el fondo que se importará más adelante" como uno de los
  elementos animados del nodo. Los reveals de entrada son
  `IntersectionObserver` binario + CSS.

## Dónde está cada cosa

| Archivo | Cuándo leerlo |
|---|---|
| [DESIGN.md](DESIGN.md) | **Antes de tocar cualquier valor de layout, spacing o breakpoint.** El sistema responsive anclado a 1440, la fórmula, el protocolo de medición y las discrepancias abiertas contra Figma |
| [docs/flujo-de-trabajo.md](docs/flujo-de-trabajo.md) | Al empezar cualquier sesión de trabajo real |
| [docs/arquitectura.md](docs/arquitectura.md) | Stack, CDN, estructura de carpetas, peso y carga de assets |
| [docs/errores-corregidos.md](docs/errores-corregidos.md) | Antes de tocar CSS o JS. Los 26 bugs ya resueltos, con su regla |
| [docs/nodo-0-umbral.md](docs/nodo-0-umbral.md) | Galaxy, texto ASCII de "Digital", órbita de íconos, 5 pilares |
| [docs/nodo-1-catalogo.md](docs/nodo-1-catalogo.md) | Scroll-jacking con pin, blobs SVG, secuencias de frames por edge |
| [docs/nodo-2-territorio.md](docs/nodo-2-territorio.md) | 5 ScrollTrigger pineados, fichas técnicas, indicador de altitud |
| [docs/nodo-3-metodo.md](docs/nodo-3-metodo.md) | Marquee CSS, tipografía con datos exactos de Figma, tarjeta Makro |
| [docs/nodo-4-voces.md](docs/nodo-4-voces.md) | Acordeón (primer botón real del sitio), dos entrevistas, Diagramas 01/02 |
| [docs/bitacora-oculta.md](docs/bitacora-oculta.md) | El componente de Fase 0 que todavía no existe |

## Estado de los nodos

| Nodo | Sección | Estado |
|---|---|---|
| 0 — Umbral | `#threshold` | Integrado |
| 1 — Catálogo | `#catalog` | Integrado · copy de las 6 placas todavía provisional |
| 2 — Territorio | `#territory` | Integrado · sin confirmar contra Figma |
| 3 — Método | `#method` | Integrado |
| 4 — Voces | `#voices` | Integrado · un bug visual abierto (cita de Melisa) |
| 5 | — | Sin construir |
| Bitácora Oculta | — | Sin construir. Tarea Fase 0, se repite en los 5 nodos |

## Correr en local

```bash
python -m http.server 4174
```

`http://localhost:4174` — parámetro de depuración: `?static=1` fuerza la
versión sin movimiento.

Para el navegador integrado de Claude Code hay dos configuraciones de
`launch.json`, y usan URL distinta:

- `.claude/launch.json` **de este repo** — server `proyecto-definitivo`,
  puerto 4174, sirve desde la raíz del repo: `http://localhost:4174`.
- `../.claude/launch.json` **de la carpeta padre** — server `home`, puerto
  8137, sirve desde `industrias y creacion/`, así que la URL es
  `http://localhost:8137/PROYECTO%20DEFINITIVO/index.html`, no la raíz.

## Repo

Público en GitHub: `jsmmdz/guia-de-campo-creador-digital`, rama `main`.
