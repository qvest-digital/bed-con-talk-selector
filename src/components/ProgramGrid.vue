<script setup>
import { computed } from 'vue'
import SlotEntry from './SlotEntry.vue'
import { talkMatches } from '../lib/search.js'

const props = defineProps({
  day: { type: Object, required: true },
  query: { type: String, default: '' },
  selection: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['toggle'])

const isSearching = computed(() => props.query.trim().length > 0)

/** Slots mit den zur Suche passenden Einträgen; leere Slots fallen weg. */
const visibleSlots = computed(() =>
  props.day.slots
    .map((slot) => ({
      slot,
      entries: slot.entries.filter(
        (entry) =>
          !entry.isBreak && entry.talks.some((talk) => talkMatches(talk, props.query.trim())),
      ),
    }))
    .filter(({ slot, entries }) =>
      isSearching.value ? entries.length > 0 : entries.length > 0 || slot.isBreak,
    ),
)

function entryFor(entries, roomId) {
  return entries.find((entry) => entry.roomId === roomId)
}

function occupiedBy(slot, entry) {
  const selectedRoomId = props.selection[slot.key]
  if (!selectedRoomId || selectedRoomId === entry.roomId) return ''
  return slot.entries.find((candidate) => candidate.roomId === selectedRoomId)?.roomName ?? ''
}
</script>

<template>
  <div class="grid" :style="{ '--room-count': props.day.rooms.length }">
    <div v-if="!isSearching" class="grid__row grid__row--head">
      <div class="grid__rail" aria-hidden="true"></div>
      <div class="grid__cells">
        <div v-for="room in props.day.rooms" :key="room.id" class="grid__room">
          {{ room.name }}
        </div>
      </div>
    </div>

    <div v-for="{ slot, entries } in visibleSlots" :key="slot.key" class="grid__row">
      <div class="grid__rail">
        <span class="grid__rail-start">{{ slot.startTime }}</span>
        <span class="grid__rail-end">{{ slot.endTime }}</span>
      </div>

      <div class="grid__cells" :class="{ 'grid__cells--full': slot.isBreak }">
        <div v-if="slot.isBreak" class="grid__break">
          <span class="grid__break-title">{{ slot.entries[0].talks[0].title }}</span>
          <span class="grid__break-time">{{ slot.startTime }} – {{ slot.endTime }}</span>
        </div>

        <template v-else>
          <div v-for="room in props.day.rooms" :key="room.id" class="grid__cell">
            <SlotEntry
              v-if="entryFor(entries, room.id)"
              :entry="entryFor(entries, room.id)"
              :query="props.query"
              :selected="props.selection[slot.key] === room.id"
              :occupied-by="occupiedBy(slot, entryFor(entries, room.id))"
              @toggle="emit('toggle', { entry: entryFor(entries, room.id), slot })"
            />
          </div>
        </template>
      </div>
    </div>

    <p v-if="!visibleSlots.length" class="grid__empty">
      Keine Talks an diesem Tag passen zur Suche.
    </p>
  </div>
</template>

<style scoped>
.grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grid__row {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 12px;
}

.grid__row--head {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 6px 0;
  background: linear-gradient(180deg, rgba(240, 246, 250, 0.96), rgba(240, 246, 250, 0.82));
  backdrop-filter: blur(4px);
}

.grid__cells {
  display: grid;
  grid-template-columns: repeat(var(--room-count, 3), minmax(0, 1fr));
  gap: 12px;
}

.grid__cells--full {
  grid-template-columns: minmax(0, 1fr);
}

.grid__room {
  padding: 0 4px;
  color: var(--slate-700);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.grid__rail {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 14px;
  color: var(--slate-500);
  font-size: 12px;
  line-height: 1.35;
  white-space: nowrap;
}

.grid__rail-start {
  color: var(--slate-800);
  font-weight: 700;
}

.grid__break {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 16px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.5);
  color: var(--slate-700);
}

.grid__break-title {
  font-weight: 700;
}

.grid__break-time {
  font-size: 12px;
}

.grid__empty {
  margin: 8px 0;
  color: var(--slate-700);
}

@media (max-width: 900px) {
  .grid__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }

  .grid__row--head {
    display: none;
  }

  .grid__cells {
    grid-template-columns: minmax(0, 1fr);
  }

  .grid__rail {
    flex-direction: row;
    align-items: baseline;
    gap: 6px;
    padding-top: 6px;
  }

  .grid__rail-end::before {
    content: "– ";
  }
}
</style>
