<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-6 text-center text-text font-sans">
    <div class="glow" aria-hidden="true"></div>

    <div class="relative">
      <RouterLink to="/" class="inline-flex items-center gap-2.5">
        <span class="logo-node"></span>
        <span class="font-display text-xl font-bold tracking-tight">DevBrain</span>
      </RouterLink>

      <p class="mx-auto mt-9 flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        <span class="h-1.5 w-1.5 rounded-full bg-iris shadow-[0_0_10px_var(--color-iris)]"></span>
        En construcción
      </p>

      <h1 class="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
        Inicio de sesión<br /><span class="grad-iris">próximamente</span>.
      </h1>
      <p class="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted">
        Estamos construyendo la autenticación de DevBrain. Mientras tanto, vuelve a conocer el producto.
      </p>

      <RouterLink to="/" class="btn-ghost mt-9 inline-flex">← Volver al inicio</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.glow {
  position: absolute;
  width: 560px;
  height: 560px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  filter: blur(90px);
  background: radial-gradient(circle, rgba(123, 123, 255, 0.22), transparent 65%);
  pointer-events: none;
}
.logo-node {
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: var(--color-iris);
  box-shadow: 0 0 12px var(--color-iris), inset 0 0 0 3px var(--color-void);
}
.grad-iris {
  background: linear-gradient(100deg, #9a9bff, var(--color-iris) 55%, #6fdfff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.btn-ghost {
  align-items: center;
  border-radius: 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.16);
  padding: 0.85rem 1.6rem;
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
  transition: border-color 0.18s ease, background 0.18s ease;
}
.btn-ghost:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.04);
}
</style>
