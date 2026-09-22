<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import DayTabs from './components/DayTabs.vue'
import MyProgramPanel from './components/MyProgramPanel.vue'
import ProgramGrid from './components/ProgramGrid.vue'
import SearchBar from './components/SearchBar.vue'
import { useProgramData } from './composables/useProgramData.js'
import { useMyProgram } from './composables/useMyProgram.js'
import { talkMatches } from './lib/search.js'
import { formatDay } from './lib/format.js'

const { days, isLoading, error, reload } = useProgramData()
const {
  selection,
  loadedFromLink,
  byDay,
  selectedTalks,
  count,
  totalMinutes,
  shareUrl,
  toggle,
  remove,
  clear,
} = useMyProgram(days)

const query = ref('')
const activeDayId = ref('')

watch(days, (value) => {
  if (value.length && !value.some((day) => day.id === activeDayId.value)) {
    activeDayId.value = value[0].id
  }
})

const isSearching = computed(() => query.value.trim().length > 0)

/** Bei aktiver Suche wird über beide Tage hinweg gesucht. */
const visibleDays = computed(() => {
  if (!isSearching.value) return days.value.filter((day) => day.id === activeDayId.value)
  return days.value.filter((day) =>
    talksOf(day).some((talk) => talkMatches(talk, query.value.trim())),
  )
})

function talksOf(day) {
  return day.slots.flatMap((slot) =>
    slot.entries.flatMap((entry) => (entry.isBreak ? [] : entry.talks)),
  )
}

const allTalks = computed(() => days.value.flatMap(talksOf))

const resultCount = computed(
  () => allTalks.value.filter((talk) => talkMatches(talk, query.value.trim())).length,
)

const selectedCounts = computed(() =>
  Object.fromEntries(
    days.value.map((day) => [
      day.id,
      selectedTalks.value.filter((talk) => talk.dayId === day.id).length,
    ]),
  ),
)

const toast = ref('')
let toastTimer

function notify(message) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 3500)
}

onBeforeUnmount(() => clearTimeout(toastTimer))

function entryLabel(entry) {
  return entry.isShortTalkBlock
    ? `Short-Talk-Block ${entry.roomName}`
    : entry.talks[0].title
}

function handleToggle({ entry, slot }) {
  const result = toggle(entry, slot)
  if (result.action === 'replaced') {
    notify(`„${entryLabel(entry)}“ ersetzt „${entryLabel(result.replaced)}“.`)
  } else if (result.action === 'added') {
    notify(`„${entryLabel(entry)}“ hinzugefügt.`)
  } else {
    notify(`„${entryLabel(entry)}“ entfernt.`)
  }
}

function handleRemove(entry) {
  remove(entry)
  notify(`„${entryLabel(entry)}“ entfernt.`)
}

function handleClear() {
  clear()
  notify('Auswahl zurückgesetzt.')
}
</script>

<template>
  <AppHeader :talk-count="allTalks.length" />

  <main class="layout">
    <MyProgramPanel
      class="layout__aside"
      :by-day="byDay"
      :selected-talks="selectedTalks"
      :count="count"
      :total-minutes="totalMinutes"
      :share-url="shareUrl"
      @remove="handleRemove"
      @clear="handleClear"
      @notify="notify"
    />

    <section class="layout__main panel-card" aria-labelledby="program-heading">
      <header class="program__head">
        <div>
          <p class="eyebrow">Programm</p>
          <h2 id="program-heading">Talks der BED-Con 2026</h2>
        </div>

        <SearchBar
          v-model="query"
          :result-count="resultCount"
          :total-count="allTalks.length"
        />

        <DayTabs
          v-if="days.length"
          v-model="activeDayId"
          :days="days"
          :selected-counts="selectedCounts"
        />

        <p v-if="isSearching" class="program__hint">
          Suchergebnisse aus beiden Tagen. Tag-Auswahl wirkt wieder, sobald die Suche leer ist.
        </p>
        <p v-else-if="loadedFromLink" class="program__hint">
          Auswahl aus geteiltem Link übernommen.
        </p>
      </header>

      <p v-if="isLoading" class="program__state">Programm wird von Sessionize geladen …</p>

      <div v-else-if="error" class="program__error">
        <p><strong>Das Programm konnte nicht geladen werden.</strong></p>
        <p>{{ error }}</p>
        <button type="button" class="site-button site-button--primary" @click="reload">
          Erneut versuchen
        </button>
      </div>

      <p v-else-if="isSearching && !visibleDays.length" class="program__state">
        Kein Talk passt zu „{{ query.trim() }}“.
      </p>

      <div v-else class="program__days">
        <section v-for="day in visibleDays" :key="day.id" class="program__day">
          <h3 v-if="isSearching || visibleDays.length > 1" class="program__day-title">
            {{ formatDay(day.id) }}
          </h3>

          <ProgramGrid
            :day="day"
            :query="query"
            :selection="selection"
            @toggle="handleToggle"
          />
        </section>
      </div>
    </section>
  </main>

  <footer class="page-footer">
    <p>
      Programmdaten: Sessionize-API der
      <a href="https://bed-con.org/2026/programm">BED-Con 2026</a>. Inoffizielles Hilfsmittel, die
      Auswahl liegt nur in diesem Browser.
    </p>
  </footer>

  <div class="toast" role="status" aria-live="polite">
    <p v-if="toast" class="toast__body">{{ toast }}</p>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 350px minmax(0, 1fr);
  align-items: start;
  gap: 24px;
  max-width: 1360px;
  margin: 0 auto;
  padding: 24px 28px 48px;
}

.layout__aside {
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}

.layout__main {
  padding: 22px 24px 28px;
}

.program__head {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.program__head h2 {
  margin: 4px 0 0;
  color: var(--slate-700);
}

.program__hint {
  margin: 0;
  color: var(--slate-500);
  font-size: 12.5px;
}

.program__state {
  color: var(--slate-700);
}

.program__error {
  padding: 16px 18px;
  border: 1px solid rgba(255, 149, 0, 0.3);
  border-left: 4px solid var(--bed-orange);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.72);
}

.program__error p {
  margin: 0 0 10px;
  color: var(--slate-700);
}

.program__days {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.program__day-title {
  margin: 0 0 12px;
  color: var(--slate-500);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.page-footer {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 28px 40px;
  color: var(--slate-500);
  font-size: 12px;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.toast__body {
  margin: 0;
  padding: 11px 18px;
  border-radius: 999px;
  background: var(--slate-800);
  color: #fff;
  font-size: 13px;
  box-shadow: 0 12px 28px rgba(39, 72, 91, 0.28);
}

@media (max-width: 1080px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
    padding: 20px 18px 40px;
  }

  .layout__aside {
    position: static;
    max-height: none;
  }
}

@media (max-width: 640px) {
  .layout__main {
    padding: 18px 16px 22px;
  }

  .page-footer {
    padding: 0 18px 32px;
  }
}
</style>
