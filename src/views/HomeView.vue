<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 16)

const navLinks = [
  { label: 'Concepto', href: '#concepto' },
  { label: 'Módulos', href: '#modulos' },
  { label: 'IA', href: '#ia' },
]

// ── Red neuronal viva: posición base + deriva + parallax de mouse ──
const baseNodes = [
  { x: 15, y: 16, c: 'teal', chip: 'AUTH · JWT', id: '#12', ax: 2.6, ay: 2.0, pf: 0.9 },
  { x: 84, y: 11, c: 'iris', ax: 3.2, ay: 2.6, pf: 1.0 },
  { x: 91, y: 50, c: 'amber', chip: 'REPORTES · IA', id: '#41', ax: 2.2, ay: 3.0, pf: 0.85 },
  { x: 73, y: 87, c: 'teal', ax: 2.8, ay: 2.2, pf: 0.95 },
  { x: 21, y: 89, c: 'iris', ax: 3.0, ay: 2.6, pf: 1.0 },
  { x: 7, y: 55, c: 'amber', ax: 2.0, ay: 3.0, pf: 0.9 },
  { x: 49, y: 47, c: 'core', ax: 1.0, ay: 1.2, pf: 0.3 },
]
const edges = [
  [6, 0],
  [6, 1],
  [6, 2],
  [6, 3],
  [6, 4],
  [6, 5],
  [0, 1],
  [2, 3],
  [4, 5],
]
const pts = ref(baseNodes.map((n) => ({ x: n.x, y: n.y })))
const card = ref({ x: 0, y: 0 })

const reduce =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

// objetivo y valor suavizado del cursor (-1..1)
const target = { x: 0, y: 0 }
const smooth = { x: 0, y: 0 }
const MAX_PAR = 4.5 // amplitud del parallax en unidades del viewBox

function onMouse(e) {
  target.x = (e.clientX / window.innerWidth - 0.5) * 2
  target.y = (e.clientY / window.innerHeight - 0.5) * 2
}

let raf = 0
let startT = 0
let io = null

function frame(ts) {
  if (!startT) startT = ts
  const t = (ts - startT) / 1000
  // suavizado (lerp) para un parallax sutil, sin saltos
  smooth.x += (target.x - smooth.x) * 0.06
  smooth.y += (target.y - smooth.y) * 0.06

  pts.value = baseNodes.map((n, i) => ({
    x: n.x + Math.sin(t * 0.5 + i * 1.1) * n.ax + smooth.x * n.pf * MAX_PAR,
    y: n.y + Math.cos(t * 0.42 + i * 1.7) * n.ay + smooth.y * n.pf * MAX_PAR,
  }))

  // la tarjeta flota y se mueve en sentido opuesto (profundidad)
  card.value = {
    x: -smooth.x * 12,
    y: -smooth.y * 9 + Math.sin(t * 0.8) * 6,
  }

  raf = requestAnimationFrame(frame)
}

// ── Typing animado de la consola de IA ──
const queries = [
  {
    q: '¿Por qué usamos PostgreSQL en lugar de MySQL?',
    a: 'Aprobado el 15 mar 2026 por escalabilidad analítica y compatibilidad con modelos de IA. Votaron a favor Jess, Joseph y Vane.',
    refs: ['#25 Migración a PostgreSQL'],
  },
  {
    q: '¿Quién propuso la autenticación y qué se descartó?',
    a: 'La propuso Joseph en feb 2026. La alternativa evaluada y descartada fue OAuth social como único método.',
    refs: ['#12 Auth JWT'],
  },
]
const typedQ = ref(queries.map(() => ''))
const showA = ref(queries.map(() => false))
const consoleEl = ref(null)
let typingStarted = false

function startTyping() {
  if (typingStarted) return
  typingStarted = true

  if (reduce) {
    queries.forEach((q, i) => {
      typedQ.value[i] = q.q
      showA.value[i] = true
    })
    return
  }

  let qi = 0
  const typeNext = () => {
    if (qi >= queries.length) return
    const full = queries[qi].q
    let ci = 0
    const tick = () => {
      ci++
      typedQ.value[qi] = full.slice(0, ci)
      if (ci < full.length) {
        setTimeout(tick, 30 + Math.random() * 45)
      } else {
        setTimeout(() => {
          showA.value[qi] = true
          qi++
          setTimeout(typeNext, 850)
        }, 350)
      }
    }
    tick()
  }
  typeNext()
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('mousemove', onMouse, { passive: true })

  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12 },
  )
  document.querySelectorAll('.reveal, .graph').forEach((el) => io.observe(el))

  if (consoleEl.value) {
    const cio = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startTyping()
          cio.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    cio.observe(consoleEl.value)
  }

  if (!reduce) raf = requestAnimationFrame(frame)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('mousemove', onMouse)
  cancelAnimationFrame(raf)
  io?.disconnect()
})

const modules = [
  {
    tag: 'DECISIONES',
    dot: 'iris',
    title: 'Cada decisión, con su razón',
    desc: 'Registra propuestas, recoge la votación del equipo y guarda el razonamiento completo: alternativas evaluadas, motivo e impacto.',
  },
  {
    tag: 'CONOCIMIENTO',
    dot: 'teal',
    title: 'Historial técnico que se escribe solo',
    desc: 'La evolución del stack y los cambios de arquitectura quedan documentados como un registro vivo que crece con cada decisión.',
  },
  {
    tag: 'TIMELINE',
    dot: 'amber',
    title: 'La línea de tiempo del proyecto',
    desc: 'Recorre cronológicamente cada milestone, migración o cambio de rumbo, con su contexto y sus responsables intactos.',
  },
  {
    tag: 'RIESGO',
    dot: 'rose',
    title: 'Señales antes de que duelan',
    desc: 'Detecta cambios sin justificar, decisiones en conflicto, deuda técnica acumulada y dependencias críticas de una sola persona.',
  },
]

const values = [
  { k: '–80%', t: 'Tiempo de onboarding', d: 'Lo que tomaba semanas se entiende en horas.' },
  { k: '0', t: 'Decisiones huérfanas', d: 'Ninguna queda sin su contexto y su autor.' },
  { k: '100%', t: 'Auditable', d: 'Quién autorizó qué, cuándo y por qué.' },
  { k: '∞', t: 'Memoria que permanece', d: 'El conocimiento no se va con las personas.' },
]
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden bg-void text-text font-sans">
    <div class="grain" aria-hidden="true"></div>

    <!-- ───────────── NAV ───────────── -->
    <header
      class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      :class="scrolled ? 'border-b border-white/10 bg-void/80 backdrop-blur-xl' : 'border-b border-transparent'"
    >
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" class="flex items-center gap-2.5">
          <span class="logo-node"></span>
          <span class="font-display text-lg font-bold tracking-tight">DevBrain</span>
        </a>

        <div class="hidden items-center gap-9 md:flex">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-text"
          >
            {{ link.label }}
          </a>
        </div>

        <RouterLink to="/login" class="btn-primary">Iniciar sesión</RouterLink>
      </nav>
    </header>

    <!-- ───────────── HERO ───────────── -->
    <section id="top" class="relative px-6 pb-24 pt-36 md:pt-44">
      <div class="glow glow-iris breathe"></div>
      <div class="glow glow-teal"></div>

      <div class="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <!-- thesis -->
        <div>
          <span class="eyebrow reveal" style="transition-delay: 0.05s">Memoria de ingeniería</span>

          <h1 class="reveal mt-6 font-display text-[2.7rem] font-bold leading-[1.02] tracking-tight sm:text-6xl" style="transition-delay: 0.15s">
            Tu código recuerda <span class="text-muted">el qué</span>.<br />
            DevBrain recuerda <span class="grad-iris">el porqué</span>.
          </h1>

          <p class="reveal mt-7 max-w-lg text-lg leading-relaxed text-muted" style="transition-delay: 0.28s">
            Cada decisión técnica —contexto, alternativas y responsables— queda registrada y conectada en un grafo
            vivo. Seis meses después, la respuesta sigue ahí.
          </p>

          <div class="reveal mt-9 flex flex-wrap items-center gap-3" style="transition-delay: 0.4s">
            <RouterLink to="/login" class="btn-primary btn-lg">Iniciar sesión →</RouterLink>
          </div>
        </div>

        <!-- signature: red neuronal viva con parallax -->
        <div class="graph relative mx-auto h-[380px] w-full max-w-[460px] sm:h-[460px]">
          <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line
              v-for="(e, i) in edges"
              :key="i"
              :x1="pts[e[0]].x"
              :y1="pts[e[0]].y"
              :x2="pts[e[1]].x"
              :y2="pts[e[1]].y"
              stroke="rgba(123,123,255,0.22)"
              stroke-width="1"
              vector-effect="non-scaling-stroke"
            />
          </svg>

          <!-- nodos -->
          <span
            v-for="(n, i) in baseNodes"
            :key="'n' + i"
            class="node"
            :class="`dot-${n.c}`"
            :style="{ left: pts[i].x + '%', top: pts[i].y + '%', animationDelay: i * 0.4 + 's' }"
          ></span>

          <!-- chips de decisión sobre dos nodos -->
          <template v-for="(n, i) in baseNodes" :key="'c' + i">
            <span v-if="n.chip" class="chip" :style="{ left: pts[i].x + '%', top: pts[i].y + '%' }">
              <em class="font-mono not-italic text-faint">{{ n.id }}</em>{{ n.chip }}
            </span>
          </template>

          <!-- tarjeta de decisión focal (sin participantes) -->
          <article
            class="decision-card"
            :style="{ transform: `translate(calc(-50% + ${card.x}px), calc(-50% + ${card.y}px))` }"
          >
            <header class="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
              <span class="font-mono text-[11px] text-faint">DECISIÓN #25</span>
              <span class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-amber">
                <span class="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_8px_var(--color-amber)]"></span>
                Aprobada
              </span>
            </header>
            <div class="px-4 py-4">
              <h3 class="font-display text-lg font-semibold leading-snug">Migración a PostgreSQL</h3>
              <p class="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">El porqué</p>
              <p class="mt-1 text-[13.5px] leading-relaxed text-muted">
                Escalabilidad para análisis de datos y mayor compatibilidad con modelos de IA.
              </p>
              <div class="mt-4 flex flex-wrap gap-1.5">
                <span v-for="tag in ['Backend', 'Infraestructura', 'Datos']" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ───────────── EL VACÍO ───────────── -->
    <section id="concepto" class="relative px-6 py-28 md:py-36">
      <div class="mx-auto max-w-4xl text-center">
        <span class="eyebrow reveal">El vacío que nadie llena</span>
        <blockquote class="reveal mt-8 font-display text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl">
          «¿Por qué se tomó <span class="grad-iris">esa</span> decisión?»
        </blockquote>
        <p class="reveal mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted">
          Alguien propone migrar de MySQL a PostgreSQL. Se evalúa, se aprueba, se implementa. Seis meses después nadie
          recuerda el motivo. Es la pregunta que ninguna herramienta de tareas responde.
        </p>
      </div>

      <div class="reveal mx-auto mt-14 grid max-w-4xl gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/5 sm:grid-cols-3">
        <div class="bg-void p-6">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-rose">Técnico</p>
          <p class="mt-2 text-sm leading-relaxed text-muted">Errores repetidos, decisiones contradictorias y deuda técnica que nadie ve crecer.</p>
        </div>
        <div class="bg-void p-6">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-rose">Negocio</p>
          <p class="mt-2 text-sm leading-relaxed text-muted">Conocimiento que depende de personas clave y un onboarding eterno.</p>
        </div>
        <div class="bg-void p-6">
          <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-rose">Costo</p>
          <p class="mt-2 text-sm leading-relaxed text-muted">Horas investigando el pasado para volver a decidir lo ya decidido.</p>
        </div>
      </div>
    </section>

    <!-- ───────────── EL CAMBIO ───────────── -->
    <section id="solucion" class="relative px-6 py-28 md:py-36">
      <div class="mx-auto max-w-5xl">
        <span class="eyebrow reveal">El cambio</span>
        <h2 class="reveal mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
          No es otro gestor de tareas. Es la capa de razonamiento sobre el que ya usas.
        </h2>

        <div class="reveal mt-12 grid items-stretch gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/5 md:grid-cols-2">
          <div class="bg-void p-9">
            <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Herramientas actuales</p>
            <p class="mt-3 font-display text-2xl font-semibold text-muted">Registran el <span class="text-text">QUÉ</span> se hizo.</p>
          </div>
          <div class="relative bg-void p-9">
            <span class="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-iris to-transparent"></span>
            <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-iris">DevBrain</p>
            <p class="mt-3 font-display text-2xl font-semibold">Registra el <span class="grad-iris">POR QUÉ</span> se hizo.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────── MÓDULOS ───────────── -->
    <section id="modulos" class="relative px-6 py-28 md:py-36">
      <div class="mx-auto max-w-6xl">
        <span class="eyebrow reveal">Cuatro módulos, una memoria</span>
        <h2 class="reveal mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
          Todo lo que un proyecto decide, en un solo lugar.
        </h2>

        <div class="mt-12 grid gap-4 sm:grid-cols-2">
          <article
            v-for="(m, i) in modules"
            :key="m.tag"
            class="module reveal"
            :style="{ transitionDelay: i * 0.08 + 's' }"
          >
            <div class="flex items-center gap-2.5">
              <span class="node-sm" :class="`dot-${m.dot}`"></span>
              <span class="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">{{ m.tag }}</span>
            </div>
            <h3 class="mt-4 font-display text-xl font-semibold leading-snug">{{ m.title }}</h3>
            <p class="mt-2 text-[15px] leading-relaxed text-muted">{{ m.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ───────────── IA ───────────── -->
    <section id="ia" class="relative px-6 py-28 md:py-36">
      <div class="glow glow-iris-soft"></div>
      <div class="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <span class="eyebrow reveal">DevBrain AI</span>
          <h2 class="reveal mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
            Pregúntale al proyecto.
          </h2>
          <p class="reveal mt-6 max-w-md text-lg leading-relaxed text-muted">
            La IA conoce todo el historial de decisiones y responde con la fuente exacta. Deja de interrumpir a los
            veteranos del equipo.
          </p>
        </div>

        <div ref="consoleEl" class="console reveal" style="transition-delay: 0.1s">
          <div class="flex items-center gap-2 border-b border-white/8 px-5 py-3">
            <span class="h-2.5 w-2.5 rounded-full bg-rose/70"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-amber/70"></span>
            <span class="h-2.5 w-2.5 rounded-full bg-teal/70"></span>
            <span class="ml-2 font-mono text-[11px] text-faint">devbrain · consulta</span>
          </div>

          <div class="space-y-6 p-5 sm:p-6">
            <div v-for="(item, i) in queries" :key="i" class="space-y-3">
              <p class="flex gap-2.5 font-mono text-[13px] text-text">
                <span class="text-iris">›</span>
                <span>{{ typedQ[i] }}<span v-if="!showA[i]" class="caret">▋</span></span>
              </p>
              <Transition name="ans">
                <div v-if="showA[i]" class="space-y-3">
                  <p class="pl-5 text-[14.5px] leading-relaxed text-muted">{{ item.a }}</p>
                  <div class="flex flex-wrap gap-1.5 pl-5">
                    <span v-for="r in item.refs" :key="r" class="ref">{{ r }}</span>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────── VALOR ───────────── -->
    <section class="relative px-6 py-28 md:py-36">
      <div class="mx-auto max-w-6xl">
        <span class="eyebrow reveal">Por qué importa</span>
        <h2 class="reveal mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
          Conocimiento que permanece. Equipos que escalan.
        </h2>

        <div class="reveal mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="v in values" :key="v.t" class="bg-void p-7">
            <p class="font-display text-4xl font-bold tracking-tight grad-iris">{{ v.k }}</p>
            <p class="mt-3 font-semibold">{{ v.t }}</p>
            <p class="mt-1.5 text-sm leading-relaxed text-muted">{{ v.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────── CTA ───────────── -->
    <section id="cta" class="relative px-6 py-32">
      <div class="glow glow-iris breathe"></div>
      <div class="relative mx-auto max-w-3xl text-center">
        <h2 class="reveal font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          No vuelvas a perder<br />una decisión.
        </h2>
        <p class="reveal mx-auto mt-6 max-w-md text-lg leading-relaxed text-muted">
          Entra y empieza a registrar el porqué detrás de cada decisión de tu equipo.
        </p>
        <div class="reveal mt-10 flex justify-center">
          <RouterLink to="/login" class="btn-primary btn-lg">Iniciar sesión →</RouterLink>
        </div>
      </div>
    </section>

    <!-- ───────────── FOOTER ───────────── -->
    <footer class="border-t border-white/8 px-6 py-10">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <a href="#top" class="flex items-center gap-2.5">
          <span class="logo-node"></span>
          <span class="font-display font-bold tracking-tight">DevBrain</span>
        </a>
        <p class="font-mono text-[10px] uppercase tracking-[0.16em] text-faint">Memoria de ingeniería · 2026</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ── grano sutil (textura premium) ── */
.grain {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.4;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

/* ── transiciones de entrada / scroll-reveal ── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.8s cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.reveal.is-in {
  opacity: 1;
  transform: none;
}

/* ── entrada épica del grafo ── */
.graph {
  opacity: 0;
  transform: scale(0.9) rotate(-3deg);
  transition:
    opacity 1.1s ease,
    transform 1.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.graph.is-in {
  opacity: 1;
  transform: none;
}

/* ── revelado de respuesta en la consola ── */
.ans-enter-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
}
.ans-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

/* ── cursor de typing ── */
.caret {
  color: var(--color-iris);
  animation: caret 1s steps(1) infinite;
}
@keyframes caret {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* ── glows ambientales ── */
.glow {
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
  filter: blur(80px);
  z-index: 0;
}
.breathe {
  animation: breathe 7s ease-in-out infinite;
}
@keyframes breathe {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.12);
  }
}
.glow-iris {
  width: 520px;
  height: 520px;
  top: -120px;
  right: -80px;
  background: radial-gradient(circle, rgba(123, 123, 255, 0.28), transparent 65%);
}
.glow-iris-soft {
  width: 480px;
  height: 480px;
  top: 50%;
  left: -120px;
  background: radial-gradient(circle, rgba(123, 123, 255, 0.16), transparent 65%);
}
.glow-teal {
  width: 420px;
  height: 420px;
  bottom: -160px;
  left: -100px;
  background: radial-gradient(circle, rgba(47, 230, 200, 0.14), transparent 65%);
}

/* ── eyebrow ── */
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.eyebrow::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-iris);
  box-shadow: 0 0 10px var(--color-iris);
}

/* ── texto con gradiente iris ── */
.grad-iris {
  background: linear-gradient(100deg, #9a9bff, var(--color-iris) 55%, #6fdfff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ── botones ── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  border-radius: 0.6rem;
  background: var(--color-iris);
  padding: 0.55rem 1.1rem;
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  color: #0a0a1f;
  box-shadow: 0 6px 24px rgba(123, 123, 255, 0.35);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(123, 123, 255, 0.55);
}
.btn-lg {
  padding: 0.85rem 1.6rem;
  font-size: 0.95rem;
}

/* ── logo node ── */
.logo-node {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: var(--color-iris);
  box-shadow: 0 0 12px var(--color-iris), inset 0 0 0 3px var(--color-void);
}

/* ── nodos del grafo (deriva + parallax en JS; aquí el latido de brillo) ── */
.node {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  transform: translate(-50%, -50%);
  animation: pulse-node 3.2s ease-in-out infinite;
}
@keyframes pulse-node {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}
.node-sm {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.dot-iris {
  background: var(--color-iris);
  box-shadow: 0 0 14px 2px color-mix(in srgb, var(--color-iris) 60%, transparent);
}
.dot-teal {
  background: var(--color-teal);
  box-shadow: 0 0 14px 2px color-mix(in srgb, var(--color-teal) 55%, transparent);
}
.dot-amber {
  background: var(--color-amber);
  box-shadow: 0 0 14px 2px color-mix(in srgb, var(--color-amber) 55%, transparent);
}
.dot-rose {
  background: var(--color-rose);
  box-shadow: 0 0 14px 2px color-mix(in srgb, var(--color-rose) 55%, transparent);
}
.dot-core {
  width: 18px;
  height: 18px;
  background: var(--color-iris);
  box-shadow: 0 0 28px 6px color-mix(in srgb, var(--color-iris) 70%, transparent);
}

/* ── chips de decisión flotantes ── */
.chip {
  position: absolute;
  transform: translate(-50%, -160%);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  border-radius: 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(23, 26, 56, 0.7);
  backdrop-filter: blur(8px);
  padding: 0.3rem 0.55rem;
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--color-muted);
}

/* ── tarjeta focal ── */
.decision-card {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(290px, 80%);
  border-radius: 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(23, 26, 56, 0.92), rgba(17, 19, 43, 0.92));
  backdrop-filter: blur(14px);
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(123, 123, 255, 0.08);
}
.border-white\/8 {
  border-color: rgba(255, 255, 255, 0.08);
}
.tag {
  border-radius: 0.35rem;
  border: 1px solid rgba(123, 123, 255, 0.25);
  background: rgba(123, 123, 255, 0.1);
  padding: 0.15rem 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: #a7a8ff;
}

/* ── módulos ── */
.module {
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0));
  padding: 1.75rem;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    opacity 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.module:hover {
  transform: translateY(-4px);
  border-color: rgba(123, 123, 255, 0.35);
  background: linear-gradient(180deg, rgba(123, 123, 255, 0.06), rgba(255, 255, 255, 0));
}

/* ── consola IA ── */
.console {
  border-radius: 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(23, 26, 56, 0.8), rgba(17, 19, 43, 0.65));
  backdrop-filter: blur(14px);
  box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.8);
}
.ref {
  border-radius: 0.4rem;
  border: 1px solid rgba(47, 230, 200, 0.25);
  background: rgba(47, 230, 200, 0.08);
  padding: 0.2rem 0.55rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: #7df0db;
}

@media (max-width: 640px) {
  .chip {
    display: none;
  }
}
</style>
