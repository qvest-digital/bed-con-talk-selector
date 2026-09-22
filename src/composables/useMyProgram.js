import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'bedcon-2026-my-program'

/**
 * Verwaltet die eigene Auswahl. Gespeichert wird bewusst nur
 * `Slot -> Raum`; Titel, Zeiten und Beschreibungen kommen immer frisch
 * aus dem Sessionize-Programm. Pro Slot ist genau eine Auswahl möglich,
 * weil die Talks eines Slots parallel laufen.
 */
export function useMyProgram(days) {
  const selection = ref(readSelection())
  const loadedFromLink = ref(Boolean(readSelectionFromLocation()))

  watch(
    selection,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* z. B. privater Modus – Auswahl bleibt dann nur für die Sitzung */
      }
    },
    { deep: true, immediate: true },
  )

  const selectedEntries = computed(() =>
    days.value.flatMap((day) =>
      day.slots
        .flatMap((slot) => slot.entries)
        .filter((entry) => selection.value[entry.slotKey] === entry.roomId),
    ),
  )

  const byDay = computed(() =>
    days.value
      .map((day) => ({
        day,
        entries: selectedEntries.value.filter((entry) => entry.dayId === day.id),
      }))
      .filter((group) => group.entries.length > 0),
  )

  const selectedTalks = computed(() =>
    selectedEntries.value
      .flatMap((entry) => entry.talks)
      .sort((a, b) => a.start.localeCompare(b.start)),
  )

  const count = computed(() => selectedTalks.value.length)

  const totalMinutes = computed(() =>
    selectedTalks.value.reduce((sum, talk) => sum + talk.duration, 0),
  )

  const shareUrl = computed(() => {
    const items = Object.entries(selection.value).map(
      ([slotKey, roomId]) => `${slotKey.replace(/[-|:]/g, '')}-${roomId}`,
    )
    const base = `${location.origin}${location.pathname}`
    return items.length ? `${base}#p=${items.join('.')}` : base
  })

  function isSelected(entry) {
    return selection.value[entry.slotKey] === entry.roomId
  }

  function selectedRoomIn(slot) {
    return selection.value[slot.key] ?? null
  }

  /** Wählt einen Slot-Eintrag aus bzw. ab und meldet, was passiert ist. */
  function toggle(entry, slot) {
    if (isSelected(entry)) {
      const next = { ...selection.value }
      delete next[entry.slotKey]
      selection.value = next
      return { action: 'removed', entry }
    }

    const previousRoomId = selection.value[entry.slotKey]
    const replaced = previousRoomId
      ? slot?.entries.find((candidate) => candidate.roomId === previousRoomId)
      : null

    selection.value = { ...selection.value, [entry.slotKey]: entry.roomId }
    return { action: replaced ? 'replaced' : 'added', entry, replaced }
  }

  function remove(entry) {
    const next = { ...selection.value }
    delete next[entry.slotKey]
    selection.value = next
  }

  function clear() {
    selection.value = {}
  }

  return {
    selection,
    loadedFromLink,
    byDay,
    selectedEntries,
    selectedTalks,
    count,
    totalMinutes,
    shareUrl,
    isSelected,
    selectedRoomIn,
    toggle,
    remove,
    clear,
  }
}

function readSelection() {
  return readSelectionFromLocation() ?? readSelectionFromStorage()
}

function readSelectionFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/** Liest eine geteilte Auswahl aus `#p=202609231140-80307.…`. */
function readSelectionFromLocation() {
  const match = /[#&]p=([^&]+)/.exec(location.hash)
  if (!match) return null

  const selection = {}
  for (const item of decodeURIComponent(match[1]).split('.')) {
    const parsed = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})-(\d+)$/.exec(item)
    if (!parsed) continue
    const [, year, month, day, hour, minute, roomId] = parsed
    selection[`${year}-${month}-${day}|${hour}:${minute}`] = Number(roomId)
  }
  return Object.keys(selection).length ? selection : null
}
