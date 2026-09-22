<script setup>
import { ref } from 'vue'
import { formatDay, formatDuration } from '../lib/format.js'
import { buildIcs } from '../lib/ics.js'
import { copyText, downloadFile } from '../lib/download.js'

const props = defineProps({
  byDay: { type: Array, required: true },
  selectedTalks: { type: Array, required: true },
  count: { type: Number, default: 0 },
  totalMinutes: { type: Number, default: 0 },
  shareUrl: { type: String, default: '' },
})

const emit = defineEmits(['remove', 'clear', 'notify'])

const openDescriptions = ref(new Set())

function toggleDescription(talkId) {
  const next = new Set(openDescriptions.value)
  next.has(talkId) ? next.delete(talkId) : next.add(talkId)
  openDescriptions.value = next
}

function exportIcs() {
  downloadFile('bed-con-2026-mein-programm.ics', buildIcs(props.selectedTalks), 'text/calendar')
  emit('notify', 'Kalenderdatei heruntergeladen.')
}

function exportJson() {
  const payload = props.selectedTalks.map((talk) => ({
    title: talk.title,
    description: talk.description,
    start: talk.start,
    end: talk.end,
    room: talk.roomName,
    speakers: talk.speakers,
  }))
  downloadFile(
    'bed-con-2026-mein-programm.json',
    JSON.stringify(payload, null, 2),
    'application/json',
  )
  emit('notify', 'JSON heruntergeladen.')
}

async function shareLink() {
  const copied = await copyText(props.shareUrl)
  emit(
    'notify',
    copied ? 'Link zur Auswahl kopiert.' : 'Kopieren nicht möglich – Link steht in der Adresszeile.',
  )
  if (!copied) location.hash = props.shareUrl.split('#')[1] ?? ''
}

function print() {
  window.print()
}

function confirmClear() {
  if (props.count === 0) return
  if (window.confirm('Die komplette Auswahl löschen?')) emit('clear')
}
</script>

<template>
  <aside class="my-program panel-card" aria-labelledby="my-program-heading">
    <header class="my-program__head">
      <p class="eyebrow">Meine Auswahl</p>
      <h2 id="my-program-heading">Mein Programm</h2>
      <p class="my-program__summary">
        <strong>{{ props.count }}</strong>
        {{ props.count === 1 ? 'Talk' : 'Talks' }}
        <template v-if="props.totalMinutes">· {{ formatDuration(props.totalMinutes) }}</template>
      </p>
    </header>

    <p v-if="!props.count" class="my-program__empty">
      Noch nichts ausgewählt. Rechts einen Slot auswählen – der Talk erscheint dann hier mit
      Titel, Zeit, Raum und Beschreibung.
    </p>

    <div v-else class="my-program__days">
      <section v-for="group in props.byDay" :key="group.day.id" class="my-program__day">
        <h3 class="my-program__day-title">{{ formatDay(group.day.id) }}</h3>

        <ol class="my-program__list">
          <li v-for="entry in group.entries" :key="entry.key" class="picked">
            <div class="picked__head">
              <span class="picked__time">{{ entry.startTime }} – {{ entry.endTime }}</span>
              <button
                type="button"
                class="picked__remove"
                :title="`${entry.roomName} aus meinem Programm entfernen`"
                @click="emit('remove', entry)"
              >
                <span class="sr-only">Entfernen</span>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <p class="picked__room">{{ entry.roomName }}</p>

            <div v-for="talk in entry.talks" :key="talk.id" class="picked__talk">
              <p v-if="entry.isShortTalkBlock" class="picked__talk-time">
                {{ talk.startTime }} – {{ talk.endTime }}
              </p>
              <h4 class="picked__title">{{ talk.title }}</h4>
              <p v-if="talk.speakers.length" class="picked__speakers">
                {{ talk.speakers.join(', ') }}
              </p>
              <p v-if="openDescriptions.has(talk.id)" class="picked__description">
                {{ talk.description }}
              </p>
              <button
                v-if="talk.description"
                type="button"
                class="picked__more"
                :aria-expanded="openDescriptions.has(talk.id)"
                @click="toggleDescription(talk.id)"
              >
                {{ openDescriptions.has(talk.id) ? 'weniger' : 'Beschreibung' }}
              </button>
            </div>
          </li>
        </ol>
      </section>
    </div>

    <footer v-if="props.count" class="my-program__actions">
      <button type="button" class="site-button site-button--small" @click="exportIcs">
        Kalender (.ics)
      </button>
      <button type="button" class="site-button site-button--small" @click="exportJson">
        JSON
      </button>
      <button type="button" class="site-button site-button--small" @click="shareLink">
        Link kopieren
      </button>
      <button type="button" class="site-button site-button--small" @click="print">
        Drucken
      </button>
      <button
        type="button"
        class="site-button site-button--small site-button--ghost"
        @click="confirmClear"
      >
        Zurücksetzen
      </button>
    </footer>
  </aside>
</template>

<style scoped>
.my-program {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 22px 18px;
}

.my-program__head h2 {
  margin: 4px 0 6px;
  color: var(--slate-700);
}

.my-program__summary {
  margin: 0;
  color: var(--slate-700);
  font-size: 13px;
}

.my-program__summary strong {
  color: var(--bed-orange-dark);
  font-size: 15px;
}

.my-program__empty {
  margin: 0;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-left: 4px solid var(--bed-orange);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.72);
  color: var(--slate-700);
  line-height: 1.5;
}

.my-program__days {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.my-program__day-title {
  margin: 0 0 8px;
  color: var(--slate-500);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.my-program__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.picked {
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-left: 3px solid var(--bed-orange);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.82);
}

.picked__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.picked__time {
  color: var(--bed-orange-dark);
  font-size: 12px;
  font-weight: 700;
}

.picked__remove {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  color: var(--slate-700);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}

.picked__remove:hover {
  border-color: rgba(255, 149, 0, 0.5);
  color: var(--bed-orange-dark);
}

.picked__room {
  margin: 2px 0 8px;
  color: var(--slate-500);
  font-size: 12px;
}

.picked__talk + .picked__talk {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--line-strong);
}

.picked__talk-time {
  margin: 0 0 2px;
  color: var(--slate-500);
  font-size: 11.5px;
  font-weight: 700;
}

.picked__title {
  margin: 0;
  color: var(--slate-800);
  font-size: 14px;
  line-height: 1.3;
}

.picked__speakers {
  margin: 3px 0 0;
  color: var(--slate-700);
  font-size: 12px;
}

.picked__description {
  margin: 7px 0 0;
  color: var(--text);
  font-size: 12.5px;
  white-space: pre-line;
}

.picked__more {
  margin-top: 5px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--slate-500);
  font-size: 11.5px;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.my-program__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 4px;
  border-top: 1px solid var(--line);
}
</style>
