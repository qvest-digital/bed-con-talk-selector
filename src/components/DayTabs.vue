<script setup>
import { formatShortDay } from '../lib/format.js'

const props = defineProps({
  days: { type: Array, required: true },
  modelValue: { type: String, default: '' },
  selectedCounts: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="day-tabs" role="tablist" aria-label="Konferenztage">
    <button
      v-for="day in props.days"
      :key="day.id"
      type="button"
      role="tab"
      class="day-tabs__button"
      :class="{ 'day-tabs__button--active': day.id === props.modelValue }"
      :aria-selected="day.id === props.modelValue"
      @click="emit('update:modelValue', day.id)"
    >
      <span class="day-tabs__label">Tag {{ day.number }}</span>
      <span class="day-tabs__date">{{ formatShortDay(day.id) }}</span>
      <span v-if="props.selectedCounts[day.id]" class="day-tabs__badge">
        {{ props.selectedCounts[day.id] }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.day-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: fit-content;
  padding: 6px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 10px 24px rgba(83, 110, 128, 0.07);
}

.day-tabs__button {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--slate-500);
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.day-tabs__button:hover {
  background-color: rgba(126, 163, 186, 0.1);
  color: #4f7893;
}

.day-tabs__button--active,
.day-tabs__button--active:hover {
  background-color: rgba(255, 149, 0, 0.1);
  color: var(--bed-orange);
  box-shadow: inset 0 0 0 1px rgba(255, 149, 0, 0.18);
}

.day-tabs__date {
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 400;
}

.day-tabs__badge {
  margin-left: auto;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--bed-orange);
  color: #fff;
  font-size: 11px;
}
</style>
