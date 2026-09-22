<script setup>
defineProps({
  talkCount: { type: Number, default: 0 },
})
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <div class="app-header__brand">
        <span class="app-header__logo" aria-hidden="true">BED</span>
        <span class="app-header__wordmark">
          <strong>Berlin Expert Days</strong>
          <span>23. &amp; 24. September 2026 · Berlin</span>
        </span>
      </div>

      <nav class="app-header__nav" aria-label="Weiterführende Links">
        <a class="site-button site-button--small" href="https://bed-con.org/2026/programm">
          Offizielles Programm
        </a>
        <a class="site-button site-button--small" href="https://bed-con.org/2026/tickets">
          Tickets
        </a>
      </nav>
    </div>

    <div class="app-header__title">
      <p class="eyebrow">Talk-Selector</p>
      <h1>Mein Programm</h1>
      <p class="app-header__lead">
        Talks suchen, Slot auswählen, eigenes Programm zusammenstellen. Die Auswahl bleibt in
        diesem Browser gespeichert – {{ talkCount }} Talks stehen zur Wahl.
      </p>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(
    180deg,
    rgba(189, 204, 212, 0.42) 0%,
    rgba(238, 245, 248, 0.9) 38%,
    rgba(246, 250, 252, 0.98) 100%
  );
  border-bottom: 1px solid rgba(126, 163, 186, 0.12);
}

.app-header__inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: 1360px;
  margin: 0 auto;
  padding: 22px 28px 0;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.app-header__logo {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px solid var(--bed-orange);
  color: var(--bed-orange);
  font-weight: 700;
  font-size: 17px;
  letter-spacing: 0.02em;
  background: rgba(255, 255, 255, 0.72);
}

.app-header__wordmark {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.app-header__wordmark strong {
  color: var(--slate-400);
  font-size: 19px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.app-header__wordmark span {
  color: var(--slate-700);
  font-size: 12.5px;
}

.app-header__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.app-header__title {
  max-width: 1360px;
  margin: 0 auto;
  padding: 18px 28px 26px;
}

.app-header__title h1 {
  margin: 6px 0 8px;
}

.app-header__lead {
  margin: 0;
  max-width: 62ch;
  color: var(--slate-700);
}

@media (max-width: 640px) {
  .app-header__inner,
  .app-header__title {
    padding-left: 18px;
    padding-right: 18px;
  }
}
</style>
