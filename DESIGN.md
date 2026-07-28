# DESIGN.md — Sistema de diseño

> El `design.md` que `Spec - Nodo 2 Territorio (v2 - Figma)` §5 y
> `Spec - Nodo 3 Metodo` §5 citan como fuente de la paleta, las tres
> familias tipográficas y el criterio de forma. **Nunca existió** — las dos
> specs lo dieron por escrito. Este archivo salda esa deuda.
>
> Iniciado 2026-07-27. Hoy cubre **responsive** y la **paleta y tipografía
> de Método**, confirmadas contra Figma por MCP el 2026-07-28.
>
> **Todo valor de acá salió de una medición o de una decisión explícita del
> usuario.** Lo que no, dice `PENDIENTE` y no se implementa.

---

## 1 · La regla base: 1440 mide, móvil decide

Los frames de `IMAGENES/frames figma/` están a **1440px de ancho exacto**,
así que la escala es **1:1** — 1px del PNG es 1px a 1440 de viewport, sin
conversión.

Pero el `Plan de Desarrollo` §4 declara **"diseño responsivo, mobile-first"**
como requisito mínimo del proyecto, y §5 insiste: *"cada mecánica compleja
necesita su propia variante mobile-first, no una adaptación tardía del
diseño de escritorio"*. El `Spec - Nodo 3` §2 agrega que el lector está
*"probablemente en celular"*.

**Los dos conviven así** (decisión del usuario, 2026-07-27):

- **1440 es la fuente de las medidas** — proporciones, jerarquía, ritmo
  vertical, escala tipográfica. De ahí salen los números.
- **Móvil manda en las decisiones** — cuando una medida de 1440 no funciona
  en pantalla chica, gana móvil. Ninguna mecánica se resuelve reescalando el
  layout de escritorio.

Un valor de layout es legítimo solo si sale de una de estas tres fuentes:

1. **Medido en un frame de Figma** — el caso normal.
2. **Derivado por la fórmula** (§2) desde un valor medido.
3. **Decidido explícitamente con el usuario** y anotado en §9.

Un `max-width: 38rem` elegido a ojo no es ninguna de las tres.

---

## 2 · La fórmula

```
clamp( piso, slope, techo )

slope = (valor_figma / 1440) × 100 vw,  SIEMPRE redondeado hacia arriba
techo = valor_figma × 4/3               (lo alcanza a 1920 y ahí congela)
piso  = 2.7 × valor_figma^0.57          (mínimo 16px prosa · 11px etiquetas)
```

| Figma a 1440 | Piso (celular) | Slope | Techo (a 1920) |
|---|---|---|---|
| 128px | 43px | `8.89vw` | 170.67px |
| 96px | 36px | `6.67vw` | 128px |
| 85px | 33px | `5.91vw` | 113.33px |
| 48px | 25px | `3.34vw` | 64px |
| 32px | 19px | `2.23vw` | 42.67px |
| 26px | 17px | `1.81vw` | 34.67px |
| 24px | 17px | `1.67vw` | 32px |
| 20px | 15px | `1.39vw` | 26.67px |
| 18px | 14px | `1.25vw` | 24px |
| 16px | 13px | `1.12vw` | 21.33px |
| 12px | 11px | `0.84vw` | 16px |
| 11px | 11px | `0.77vw` | 14.67px |

### El slope

**Redondeo siempre hacia arriba** (decisión del usuario; hoy Método lo hace
y Territorio no). Garantiza que la curva alcance el valor de Figma **en o
antes** de 1440, nunca después, así que a 1440 el `clamp()` devuelve el
literal del dato sin arrastre de punto flotante.

### El techo

**Se alcanza a 1920 y ahí congela** (decisión del usuario). Como el slope se
calculó desde 1440, `slope × 1920 / 100` da exactamente `valor × 4/3` — el
sistema cierra solo, sin un segundo número que mantener. Por encima de 1920
nada crece: crecen los márgenes.

### El piso

**No sale de Figma** — no hay frame de móvil, y el usuario decidió
(2026-07-28) calcularlo priorizando legibilidad y corregirlo después contra
el sitio real. La curva es una potencia ajustada a cinco anclas, y cumple
tres condiciones que los pisos anteriores violaban:

1. **Comprime más lo grande que lo chico.** 128px baja a 43 (×0.34); 12px
   baja solo a 11 (×0.92). Un título tiene margen para encoger; una etiqueta
   ya está contra el mínimo de legibilidad.
2. **Nunca invierte la jerarquía.** La función es monótona: si A es mayor
   que B a 1440, lo sigue siendo en celular.
3. **Mismo tamaño de Figma → mismo piso.** Antes no era así: cinco elementos
   del "tier 48px" de Método tenían pisos de 28, 28, 28, **20** y 28.

**Conserva el contraste de escala**, que `Spec - Nodo 2` §5 declara *"la
firma visual del sitio"*: en desktop el rango va de 11 a 128px (11.6:1) y en
celular de 11 a 43px (3.9:1). Comprimido, pero sigue siendo un salto.

**Verificado en pantalla** a 390px y a 359px sobre Método: ningún desborde
real, ninguna prosa bajo 19px, medida de lectura de 33–36 caracteres. Ningún
valor necesitó recorte por los mínimos duros — la curva sola ya los respeta,
señal de que las anclas están bien puestas.

### Cuidado con `vw` y la barra de scroll

A una ventana de 1440, Chrome reporta `innerWidth` 1440 pero el ancho de
layout es **1425** (15px de barra). `vw` resuelve contra 1440, así que la
tipografía da el valor correcto — pero `100vw` desborda. **Para anchos de
columna, `min()` con techo en px, nunca `vw` puro.**

---

## 3 · Cascada y breakpoints

**El tier base, sin `@media`, es el diseño de Figma a 1440.** Invierte la
convención anterior, que declaraba *"laptop 1024–1439 (tier base, sin
@media)"*.

```
≤ 359px        móvil chico    escalonado
360 – 767px    móvil          escalonado
768 – 1023px   tablet         escalonado
1024 – 1439px  laptop         cae solo de la curva, sin bloque propio
1440px         BASE           el diseño de Figma, sin @media
≥ 1920px       grandes        acá congela el techo (§2)
```

Decisión del usuario (2026-07-28): se conservan los cinco cortes que el
sitio ya usaba y se agrega el de 359px, que Método tenía suelto para el
Diagrama 02.

**Dos reglas que se siguen de esto:**

- **1024–1439 no lleva bloque propio.** Con `clamp()` anclado a 1440 ese
  rango sale solo de la curva. Si un nodo necesita un bloque ahí, su fórmula
  está mal, no falta un breakpoint.
- **Ningún `@media (min-width: 1440px)`. Se escribe `1441px`.** Un query que
  dispara *en* 1440 sobrescribe el diseño exactamente en el ancho donde el
  diseño es ley. **Verificado en vivo:** a 1440 de ventana `.method` ya
  computa `padding-left: 64px`, que es el override de desktop, no el base.

**Cuidado:** los cortes de 767 y 1023 están también en `script.js`, que los
usa para decidir el modo del Catálogo y el radio de la órbita del Umbral.
Moverlos obliga a tocar JS — por eso se conservan.

---

## 4 · Layout de página

Confirmado por MCP sobre el frame de Método (`236:3`):

| | Valor |
|---|---|
| Margen lateral | **105px** |
| Ancho de columna | **1234px** |
| Margen derecho resultante | ~101px |
| Filete de acento de cita | cuelga a **100px**, 5px fuera de la columna |

El escaneo por tinta de cinco frames independientes había dado un mínimo de
99–110px, consistente con 105.

```css
--page-margin: clamp(24px, 7.3vw, 140px);   /* 105px a 1440 */
--page-col:    min(100% - 2 * var(--page-margin), 1645px);  /* 1234px a 1440 */
```

El piso de 24px en móvil es decisión de legibilidad, no de Figma.

---

## 5 · Tipografía

**Tres familias** (decisión del usuario, 2026-07-27, confirmando
`Plan de Desarrollo` §2 como verdad definitiva):

| Familia | Para qué |
|---|---|
| **Gantari** | Marquee, enunciado del término, teaser de tarjeta |
| **Fraunces** | Serif de storytelling — apertura, definición, citas |
| **Plus Jakarta Sans** | Registro técnico y prosa: aterrizaje, bisagra, remate, etiquetas, chips, atribuciones |

**Sin monoespaciada** — decisión del usuario, **migrada el 2026-07-28**. Los
18 usos de `--f-mono` (IBM Plex Mono) y `--t-f-mono` (Martian Mono) pasaron
a `--f-sans`: coordenadas del HUD, registro de placa del Catálogo, eyebrows
y sellos de Territorio, flechas y atribución de Método, y las siete
etiquetas de Voces. Ambos tokens se eliminaron y Martian Mono salió del
`<link>`.

El registro técnico ahora se marca con **uppercase + tracking amplio**, no
con el ancho fijo de la mono.

> **Excepción — IBM Plex Mono sobrevive, pero no como tipografía.** El
> efecto ASCII de "Digital" (Nodo 0) es una **grilla**: depende del ancho
> fijo de carácter. `initAsciiText()` pide la fuente por nombre desde
> `script.js` y `CanvasTxt` no declara cadena de respaldo, así que sin el
> `<link>` caería a la sans por defecto y la grilla se desalinearía — el
> mismo desfase que ya documenta el comentario de `initAsciiText()`. Se
> conserva acotada a los dos pesos que el script carga (400 y 600), y
> **ningún selector de CSS la usa**. Verificado: `i` y `M` miden ambos 24px
> a 40px de tamaño.

**El Umbral y el Catálogo migran de Archivo al trío.** `Plan de Desarrollo`
§2 lo dejaba *"pendiente de confirmación explícita antes de tocar código ya
construido en Nodo 0/1"*; esta es la confirmación.

**Regla que no se toca** (`Spec - Nodo 2` §5): *"no normalizar hacia un
tamaño intermedio — el salto entre el titular enorme y la caption diminuta
pero espaciada es la firma visual del sitio; achatarlo lo desarma"*.

### Escala de Método, confirmada por MCP

| Bloque | Familia y corte | Tamaño | Interlineado |
|---|---|---|---|
| Marquee `EL MÉTODO.` | Gantari Bold Italic | 128px | normal |
| Apertura narrativa | Fraunces SemiBold Italic | 48px | **normal** (≈59.5px) |
| "No lo leíste…" / "Eso tiene nombre técnico:" | Fraunces SemiBold Italic | 96px | normal |
| `INVESTIGACIÓN-CREACIÓN.` | Gantari Bold Italic, uppercase | **85px** | normal |
| Bloque de definición | Fraunces **Italic** (regular) | 48px | **52.8px** |
| La inversión | Plus Jakarta SemiBold Italic | 48px | normal |
| `EMERGE DE ÉL` | **Plus Jakarta** SemiBold Italic | 96px | normal |
| Aterrizaje (prosa) | Plus Jakarta Medium | 32px | **52.8px** |
| Pregunta bisagra | Plus Jakarta SemiBold | 48px | 52.8px |
| Etiqueta `DIAGRAMA 01` | Plus Jakarta Bold, tracking 1.98px | **32px** | 13.2px |
| Etiquetas `SECUENCIA A/B` | Plus Jakarta Bold, tracking 1.98px | 20px | 13.2px |
| Chips del diagrama | Plus Jakarta SemiBold, tracking 1.98px | 16px | 13.2px |
| Eyebrow `CRITERIO N` | Plus Jakarta Medium, tracking 2px | **11px** | 16px |
| Término de criterio | Plus Jakarta SemiBold | 24px | 32px |
| Teaser de Makro | **Gantari** Regular | 18px | 28.8px |
| Cita destacada | Fraunces Italic | 48px | **52.8px** |
| Atribución | Plus Jakarta Regular, tracking 1.1px, uppercase | 12px | 13.2px |
| Remate | Plus Jakarta Medium Italic | 48px | normal |

**Dos interlineados distintos, no uno.** `52.8px` es un valor **absoluto**,
no un ratio: se aplica igual a texto de 48px (ratio 1.1) y de 32px (ratio
1.65). La apertura en cambio usa `normal`. El sitio hoy usa 1.4 y 1.45 en
esos bloques — ambos incorrectos.

Fraunces lleva `font-variation-settings: "SOFT" 0, "WONK" 1` en todos sus
usos.

---

## 6 · Paleta de Método, confirmada por MCP

| Uso | Hex |
|---|---|
| Fondo del nodo | `#000000` (negro puro, no `#050507`) |
| Marquee y término | `#e1dfff` |
| Tinta de cuerpo | `#e4e1ee` |
| Tinta secundaria (cita de Makro) | `#c6c4d8` |
| Tinta apagada (eyebrows, atribución) | `#908fa1` |
| Filete de panel y chip | `#464555` · `#464554` |
| Fondo de chip | `#13131c` |
| Filete de chip | `#ede9e2` |
| Chip `CONOCIMIENTO` — fondo | `#3d3ae0` |
| Chip `CONOCIMIENTO` — filete y tinta | `#c1c1ff` · `#c8c8ff` |
| Filete de acento (cita, definición) | `#c1c1ff` |
| Panel expandido de Makro | `#1f1f28` |

El fondo es **negro puro**, no el `#050507` que el `Spec - Nodo 3` §5
declara. Ver §9, D-13.

---

## 7 · Responsive por elemento

Esto **no lo fija este documento**: `Plan de Desarrollo` §1.3 ya especifica
el comportamiento de cada elemento de contenido, y manda. Se transcribe acá
para no tener que abrir el vault.

| Elemento | Comportamiento en móvil |
|---|---|
| Párrafo narrativo | Ancho de lectura cómodo, **sin variación por breakpoint** |
| Cita destacada | **Ancho completo**, sin perder jerarquía tipográfica |
| Ficha técnica | Tabla → **tarjetas apiladas**: una fila, una tarjeta |
| Secuencia | Conectores horizontales → **columna vertical apilada** |
| Dato clave | **Tipografía fluida**, nunca se corta ni pierde jerarquía |
| Nota de campo | Igual que párrafo narrativo |
| Tarjeta desplegable | Teaser de una línea igual que desktop; al expandir **empuja**, no se superpone |
| Acordeón de perfil | Cabecera apilada: avatar arriba, texto debajo |
| Combinador de rutas | Chips a wrap de 2-3 líneas, **nunca un dropdown** |

**El criterio general:** si el cambio es de *cantidad*, es fluido. Si es de
*estructura* — algo cambia de posición, de eje o de existencia — es
escalonado.

**Medida de lectura: hasta ~77 caracteres.** El `Spec - Nodo 3` §5 decía
~68; Figma pone la prosa en 1234px, que a 32px dan ~77. Gana Figma
(decisión del usuario) y el spec se actualiza. Diagramas, enunciados y cita
pueden exceder — eso el spec ya lo autorizaba.

---

## 8 · Protocolo de medición

Medir a ojo sobre el PNG no sirve: una imagen de 1440×8079 se reescala a
~1/5.8 al leerla. **Hay tres instrumentos, y se cruzan.**

### a · El MCP de Figma — el que da los valores exactos

`get_design_context` sobre el node-id de un frame devuelve tamaños, familias,
interlineados, colores y posiciones literales. **Es la fuente preferente.**

- El node-id se saca con clic derecho sobre el frame → *Copy link to
  selection*. El de la página completa no sirve.
- `get_metadata` **falla siempre** en este entorno (error de parseo de SSE,
  reproducible en tres intentos con nodos distintos). No insistir: ir
  directo a `get_design_context`.
- `get_variable_defs` devuelve `{}` — **el archivo no usa variables de
  Figma**, todo está con estilos directos. No hay tokens que extraer.
- Requiere cargar antes la skill `figma-design-to-code`.

### b · Escanear el frame exportado

`tools/escanear-frame.ps1` recorre el PNG fila por fila y reporta bandas de
tinta y gaps con coordenadas exactas:

```bash
powershell -File tools/escanear-frame.ps1 -Path "../../IMAGENES/frames figma/nodo 3 metodo.png"
```

De la salida se leen **alineación** (`centro ≈ 719` es centrado), **márgenes
y ancho de columna**, **interlineado** (delta entre inicios de bandas
consecutivas de un párrafo) y **ritmo vertical** (los `GAP`).

Tres límites:

- **La tinta subestima la caja.** El sidebearing de la primera letra, y
  sobre todo el voladizo de una itálica, corren el extremo medido. Los `x`
  son **cotas**, no el valor exacto.
- **No sirve sobre fondo a sangre.** El Catálogo devuelve una sola banda del
  alto completo, porque su ilustración va de borde a borde.
- **No todo frame es una página vertical.** El Catálogo son **seis placas de
  1440 × 1053 concatenadas** (8639px de ancho); se corta en vertical, una
  placa por pantalla, antes de medir. El 1053 es la altura de viewport
  contra la que se diseñó.

### c · Medir el sitio renderizado

Viewport al ancho que toque y `getBoundingClientRect` sobre los mismos
bloques. `?static=1` evita que los reveals dejen elementos en `opacity: 0`.

**Para los pisos, que no salen de Figma, este es el único instrumento.** Se
prueban inyectando los valores candidatos por JS a 390px y 359px —sin tocar
el CSS— y midiendo tres cosas: que nada desborde, que ninguna prosa quede
bajo 16px, y la medida de lectura en caracteres.

**Falsos positivos de desborde:** los `span` del marquee reportan `right`
muy por fuera del viewport, y está bien — son una cinta que se desplaza
dentro de un riel con `overflow: hidden`. Un desborde solo cuenta si el
elemento está en flujo normal.

### Lo que este protocolo NO reemplaza

Para un **bug visual reportado con captura**, la verificación sigue siendo
otra captura en Chrome real (`docs/flujo-de-trabajo.md` §5). Medir sirve
para *derivar* el sistema, no para cerrar un bug que el usuario está viendo.

---

## 9 · Discrepancias y pendientes

| | Qué | Estado |
|---|---|---|
| D-01 | Método mide la mitad de ancho que Figma | Confirmada, sin implementar |
| D-02 | Interlineado | **Cerrada por MCP** |
| D-03 | Margen lateral | **Cerrada por MCP: 105px** |
| D-04 | `get_metadata` falla | Cerrada: se usa `get_design_context` |
| D-05 | Pisos de los `clamp()` | Cerrada: §2 |
| D-06 | Juego de breakpoints | Cerrada: §3 |
| D-07 | La mono se elimina | **Cerrada: migrada** |
| D-08 | Medida de lectura a ~77 caracteres | Decidida, falta actualizar el spec |
| D-11 | `.territory__callout` desborda en celular | Bug real, sin tocar |
| D-12 | Tres convenciones de `clamp()` | A corregir al implementar |
| D-13 | El fondo de Método es negro puro, no `#050507` | Nueva |
| D-14 | Son 5 condiciones de Frascati, el sitio tiene 4 | **Falta la quinta** |
| D-15 | La línea `REF:` del Figma no coincide con el vault | Nueva |
| D-16 | `EMERGE DE ÉL` es Plus Jakarta en Figma, Gantari en el spec | Nueva |

### D-01 · Método mide ~la mitad de ancho que en Figma

Los `max-width` de Método (46rem / 42rem / 40rem / 38rem) no salieron de
ninguna medición. Medido a 1440:

| Bloque | Figma | Sitio | Δ |
|---|---|---|---|
| Apertura serif | **1229px** | 736px | −493 |
| Registro medio / pequeño / bisagra | **1159px** | 608px | −551 |
| Cita | 896px (max-width) | 672px | −224 |
| Margen izq. de bloque | **105px** | 64px | −41 |

**Consecuencia medida:** los dos párrafos de apertura rompen en **5 y 4
líneas** en el sitio, donde Figma tiene **3 y 3**. La tipografía coincide
exacto (48px); el problema es solo de contenedor.

### D-07 · La mono se elimina — **cerrada 2026-07-28**

Migrados los 18 usos a `--f-sans`, tokens eliminados, Martian Mono fuera del
`<link>`. Ver §5, incluida la excepción del efecto ASCII.

**Queda una divergencia contra Figma, aceptada:** el frame todavía dibuja en
Martian Mono la línea `REF:` y los corchetes `[ ]` de la tarjeta Makro. La
decisión del usuario prevalece; **hay que actualizar el Figma** para que
coincida.

### D-13 · El fondo es negro puro

El frame usa `#000000`. El `Spec - Nodo 3` §5 declara `#050507`, y el CSS
usa `var(--depth)` = `#050507`. Diferencia mínima pero real; el spec dice
además que *"el contraste del texto está calculado contra ese color"*.

### D-14 · Son cinco condiciones, no cuatro — **el sitio está desactualizado**

Resuelto por el usuario (2026-07-28): el Manual de Frascati exige **cinco**
condiciones y el contenido de Método ya se corrigió. El texto del frame era
el correcto; el error estaba del otro lado.

**Lo que falta cambiar, y no es solo copy:**

| | Hoy | Debe ser |
|---|---|---|
| `.method__cells` | `repeat(4, 1fr)` | 5 columnas |
| Celdas en el HTML | 4 (`ORIGINAL`, `NOVEDOSO`, `SISTEMÁTICO`, `TRANSFERIBLE`) | 5 |
| Móvil ≤767 | 2×2 | replantear con 5 |
| Móvil ≤359 | 1 columna | sigue sirviendo |
| `Spec - Nodo 3` §3.10 y §3.9 | dicen cuatro | actualizar en el vault |

**Falta el nombre de la quinta condición** — no se inventa acá. Cinco
columnas a 1440 dan celdas de ~247px contra los ~297px de hoy, así que
además hay que revisar que el término más largo (`SISTEMÁTICO`) siga
entrando en una línea.

### D-16 · Los dos enunciados grandes no son de la misma familia

`Spec - Nodo 3` §5 pide **Gantari bold itálica uppercase** para los dos
enunciados grandes, nombrándolos: `INVESTIGACIÓN-CREACIÓN.` y `EMERGE DE ÉL`.
El Figma solo cumple con el primero:

| | Spec | Figma |
|---|---|---|
| `INVESTIGACIÓN-CREACIÓN.` | Gantari Bold Italic | Gantari Bold Italic, **85px** |
| `EMERGE DE ÉL` | Gantari Bold Italic | **Plus Jakarta** SemiBold Italic, **96px** |

Distinta familia y distinto tamaño, cuando el spec los declara como el mismo
pico. Además el spec ya registraba que el Figma escribe `EMERGE DE EL` sin
tilde, y sigue así.

### D-15 · La línea de referencia no coincide

El Figma dice `REF: ESTUDIO_CASO_04 // AGENCIA: GREY`. El
`docs/nodo-3-metodo.md` registra `ESTUDIOS_ENSE_04 // ACERBIS - 2023`. Como
la tarjeta está en `PRÓXIMAMENTE` no bloquea, pero hay que resolver cuál es
el dato bueno antes de activarla.

---

## 10 · Secciones sin escribir

Alcance elegido por el usuario: responsive primero.

- **Paleta del resto del sitio** — §6 cubre Método. Faltan Umbral, Catálogo,
  Territorio y Voces, hoy dispersos entre `:root` y los tokens `--t-*`.
- **Criterio de forma** — radio 0, sin sombras, sin degradados, filetes de
  1px. Está en las dos specs; falta consolidarlo acá.
- **Escala de espaciado** — `Spec - Nodo 3` §5 la fija (8/16/24/40/64/96,
  96px alrededor de los picos, 24px entre bloques de registro pequeño,
  respiro de 40–50vh). Falta verificar que aplique a todos los nodos.
- **Motion** — easings y duraciones conviven sin unificar (`power2.out`,
  `power1.out`, `sine.inOut`, `--m-ease-out`, el easing de Lenis). Es el
  encargo de `Brief - Sesion de UX y Acabado Premium` §5.
