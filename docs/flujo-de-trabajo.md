# Flujo de trabajo

> Cómo se trabaja en este repo. Escrito el 2026-07-26, al cerrar la fase de
> limpieza previa al Nodo 5 y a la Bitácora Oculta.

## 1. Qué leer al empezar una sesión

`CLAUDE.md` se carga solo, en cada sesión. Es corto a propósito: índice +
reglas duras. **No leas todo `docs/`** — lee únicamente el archivo del nodo
que vas a tocar, y `docs/errores-corregidos.md` si vas a tocar CSS o JS.

| Vas a tocar… | Lee |
|---|---|
| Un nodo puntual | `docs/nodo-N-*.md` (uno solo) |
| CSS o JS de cualquier nodo | + `docs/errores-corregidos.md` |
| Carga, peso, CDN, assets | `docs/arquitectura.md` |
| La Bitácora Oculta | `docs/bitacora-oculta.md` + el vault |
| Contenido, copy, narrativa | **el vault**, no este repo |

Si terminas leyendo más de dos archivos de `docs/` para una tarea, es señal
de que la tarea abarca demasiado — pártela.

## 2. Fuente de verdad

1. **El vault** (`DOCUMENTOS/Vault - Guía de Campo/`) manda en contenido,
   narrativa, mecánica y nombres. Este repo nunca lo contradice.
2. **`docs/`** manda en decisiones de implementación ya tomadas y en errores
   ya corregidos.
3. **El código** manda sobre ambos en "qué hace hoy": si `docs/` dice algo
   que el código desmiente, gana el código y se corrige el doc en el mismo
   commit.

Cuando el vault, el archivo de Contenido y una captura de Figma se
contradicen, se resuelve explícitamente y se anota la decisión en el doc del
nodo (ver las 7 discrepancias de Voces como ejemplo del formato).

## 3. Antes de hacer commit

Mostrar el mensaje propuesto y el resumen de archivos y cambios, y esperar
confirmación explícita del usuario antes de correr `git commit` — incluso
cuando el usuario ya pidió "haz un commit" en el mismo turno. Nunca
commitear primero y mostrar después.

Checklist antes de proponer el commit:

- [ ] ¿Subiste el `?v=N` de `styles.css` / `script.js` en `index.html`?
      (error #7 — pasa cada vez que se olvida)
- [ ] ¿Verificaste el cambio en un navegador que **realmente compositea**?
      (ver §5)
- [ ] ¿Actualizaste el `docs/` del nodo que tocaste, en el mismo commit?
- [ ] ¿Algún selector nuevo es global cuando debería estar acotado al nodo?
      (error #26 — `[data-reveal]` no es de nadie)

## 4. Documentar mientras se trabaja, no al final

Cada decisión no obvia se escribe en el `docs/nodo-*.md` correspondiente **en
el mismo commit que la implementa**. Cada bug corregido se agrega a la tabla
de `docs/errores-corregidos.md` con las tres columnas: bug, causa, regla.

Lo que NO va en `docs/`: lo que el código ya dice por sí solo, lo que el
vault ya especifica, y el historial de intentos fallidos que ya no informan
ninguna decisión vigente.

Regla de tamaño: si un `docs/nodo-*.md` pasa de ~200 líneas, revisa si hay
historial muerto que se pueda podar.

## 5. Cómo verificar un cambio visual

El navegador embebido del panel de preview **no compositea frames cuando el
panel no está desplegado**: ahí `IntersectionObserver` no dispara, las
transiciones CSS no avanzan y las capturas fallan por timeout. Un reveal que
"no funciona" medido así es un falso negativo, no un bug.

Lo que sí sirve: el Chrome real del usuario (`claude-in-chrome`), sirviendo
el sitio y comparando contra un `git worktree` del último commit estable.
Detalle completo y las dos salidas cuando la pestaña está en segundo plano
(screenshot forzado, `gsap.globalTimeline.time(N)`) en
`docs/errores-corregidos.md`.

**Medir `getComputedStyle` no es verificar.** El bug abierto de Voces (la
cita de Melisa) se dio por no reproducible midiendo estilos en vivo, y el
usuario lo seguía viendo. Para cualquier bug reportado con una captura, la
verificación es otra captura.

## 6. Agentes y paralelismo

- Máximo **5 agentes concurrentes**. Más no acelera y multiplica el costo.
- Un agente por unidad de trabajo aislable (un nodo, una auditoría, un
  breakpoint), nunca varios agentes sobre los mismos archivos.
- El patrón que funcionó en Método y Voces: **construir y auditar el nodo
  aislado en `PRUEBAS/Prototipo - …/`, y recién después integrar al sitio**.
  Al integrar, descartar los andamios del prototipo (su `initLenis()` de
  respaldo, sus `<link>` de fuentes propios) — no arrastrarlos.
- Los agentes reciben la ruta del doc que deben leer, no el contenido pegado.

## 7. Nodos: dónde estamos

Nodos 0 a 4 construidos e integrados. Falta el Nodo 5 y la **Bitácora
Oculta**, que es tarea de Fase 0 del Plan de Producción: se repite igual en
los 5 nodos, así que se resuelve una vez como componente reutilizable, antes
que cualquier asset de nodo suelto.
