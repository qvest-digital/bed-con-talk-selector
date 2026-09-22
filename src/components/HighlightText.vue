<script setup>
import { computed } from 'vue'
import { highlightParts } from '../lib/search.js'

const props = defineProps({
  text: { type: String, required: true },
  query: { type: String, default: '' },
})

const parts = computed(() => highlightParts(props.text, props.query))
</script>

<template>
  <span
    ><template v-for="(part, index) in parts" :key="index"
      ><mark v-if="part.match">{{ part.text }}</mark
      ><template v-else>{{ part.text }}</template></template
    ></span
  >
</template>

<style scoped>
mark {
  padding: 0 1px;
  border-radius: 3px;
  background: rgba(255, 149, 0, 0.28);
  color: inherit;
}
</style>
