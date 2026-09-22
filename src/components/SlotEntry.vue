<script setup>
import { ref } from 'vue'
import HighlightText from './HighlightText.vue'
import { formatDuration } from '../lib/format.js'

const props = defineProps({
  entry: { type: Object, required: true },
  query: { type: String, default: '' },
  selected: { type: Boolean, default: false },
  /** Name des Raums, der in diesem Slot bereits gewählt ist (falls ein anderer). */
  occupiedBy: { type: String, default: '' },
})

const emit = defineEmits(['toggle'])

const openDescriptions = ref(new Set())

function toggleDescription(talkId) {
  const next = new Set(openDescriptions.value)
  next.has(talkId) ? next.delete(talkId) : next.add(talkId)
  openDescriptions.value = next
}
</script>

<template>
  <article class="entry" :class="{ 'entry--selected': props.selected }">
    <div class="entry__head">
      <span class="entry__time">{{ props.entry.startTime }} – {{ props.entry.endTime }}</span>
      <span class="entry__room">{{ props.entry.roomName }}</span>
      <span v-if="props.entry.isShortTalkBlock" class="entry__badge">
        {{ props.entry.talks.length }} Short Talks
      </span>
    </div>

    <ul class="entry__talks">
      <li v-for="talk in props.entry.talks" :key="talk.id" class="talk">
        <p v-if="props.entry.isShortTalkBlock" class="talk__time">
          {{ talk.startTime }} – {{ talk.endTime }}
        </p>

        <h4 class="talk__title">
          <HighlightText :text="talk.title" :query="props.query" />
        </h4>

        <p v-if="talk.speakers.length" class="talk__speakers">
          <HighlightText :text="talk.speakers.join(', ')" :query="props.query" />
        </p>

        <p v-if="openDescriptions.has(talk.id)" class="talk__description">
          <HighlightText :text="talk.description" :query="props.query" />
        </p>

        <button
          v-if="talk.description"
          type="button"
          class="talk__more"
          :aria-expanded="openDescriptions.has(talk.id)"
          @click="toggleDescription(talk.id)"
        >
          {{ openDescriptions.has(talk.id) ? 'Beschreibung ausblenden' : 'Beschreibung anzeigen' }}
        </button>
      </li>
    </ul>

    <footer class="entry__foot">
      <button
        type="button"
        class="site-button site-button--small"
        :class="{ 'site-button--primary': !props.selected }"
        @click="emit('toggle')"
      >
        <template v-if="props.selected">✓ Ausgewählt – entfernen</template>
        <template v-else-if="props.entry.isShortTalkBlock">Slot übernehmen</template>
        <template v-else>Hinzufügen</template>
      </button>

      <span class="entry__meta">
        {{ formatDuration(props.entry.talks.reduce((sum, talk) => sum + talk.duration, 0)) }}
      </span>

      <span v-if="!props.selected && props.occupiedBy" class="entry__conflict">
        ersetzt {{ props.occupiedBy }}
      </span>
    </footer>
  </article>
</template>

<style scoped>
.entry {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 14px 16px 12px;
  border: 1px solid var(--line);
  border-left: 3px solid rgba(126, 163, 186, 0.34);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 8px 18px rgba(83, 110, 128, 0.06);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.entry:hover {
  background: var(--surface-strong);
  box-shadow: 0 12px 26px rgba(83, 110, 128, 0.12);
}

.entry--selected {
  border-color: rgba(255, 149, 0, 0.32);
  border-left-color: var(--bed-orange);
  background: linear-gradient(180deg, rgba(255, 149, 0, 0.07), rgba(255, 255, 255, 0.86));
}

.entry__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  font-size: 12px;
}

.entry__time {
  color: var(--bed-orange-dark);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.entry__room {
  color: var(--slate-500);
}

.entry__badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(126, 163, 186, 0.16);
  color: var(--slate-700);
  font-size: 11px;
  font-weight: 700;
}

.entry__talks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 1;
}

.entry__talks .talk + .talk {
  padding-top: 12px;
  border-top: 1px dashed var(--line-strong);
}

.talk__time {
  margin: 0 0 3px;
  color: var(--slate-500);
  font-size: 11.5px;
  font-weight: 700;
}

.talk__title {
  margin: 0;
  color: var(--slate-800);
  font-size: 15px;
  line-height: 1.3;
}

.talk__speakers {
  margin: 4px 0 0;
  color: var(--slate-700);
  font-size: 12.5px;
}

.talk__description {
  margin: 8px 0 0;
  color: var(--text);
  font-size: 13px;
  white-space: pre-line;
}

.talk__more {
  margin-top: 6px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.talk__more:hover {
  color: var(--bed-orange-dark);
}

.entry__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin-top: auto;
  padding-top: 4px;
}

.entry__meta {
  color: var(--slate-500);
  font-size: 11.5px;
}

.entry__conflict {
  color: var(--bed-orange-dark);
  font-size: 11.5px;
  font-weight: 700;
}
</style>
