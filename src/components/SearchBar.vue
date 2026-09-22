<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  resultCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="search">
    <label class="search__field">
      <span class="sr-only">Talks durchsuchen</span>
      <svg class="search__icon" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M12.8 12.8 17 17" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
      <input
        :value="props.modelValue"
        type="search"
        class="search__input"
        placeholder="Titel, Beschreibung, Speaker oder Raum suchen …"
        @input="emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="props.modelValue"
        type="button"
        class="search__clear"
        @click="emit('update:modelValue', '')"
      >
        <span class="sr-only">Suche zurücksetzen</span>
        <span aria-hidden="true">×</span>
      </button>
    </label>

    <p class="search__status" role="status">
      <template v-if="props.modelValue">
        {{ props.resultCount }} von {{ props.totalCount }} Talks
      </template>
      <template v-else>{{ props.totalCount }} Talks</template>
    </p>
  </div>
</template>

<style scoped>
.search {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
}

.search__field {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 260px;
}

.search__icon {
  position: absolute;
  left: 12px;
  width: 17px;
  height: 17px;
  color: var(--slate-400);
  pointer-events: none;
}

.search__input {
  width: 100%;
  padding: 11px 38px 11px 38px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.86);
  color: var(--text);
  box-shadow: inset 0 1px 2px rgba(83, 110, 128, 0.06);
  appearance: none;
}

.search__input::-webkit-search-cancel-button {
  display: none;
}

.search__input:focus {
  border-color: rgba(255, 149, 0, 0.5);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 149, 0, 0.14);
}

.search__clear {
  position: absolute;
  right: 8px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: rgba(126, 163, 186, 0.16);
  color: var(--slate-700);
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}

.search__status {
  margin: 0;
  color: var(--slate-700);
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
}
</style>
