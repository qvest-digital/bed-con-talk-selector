import { ref, shallowRef } from 'vue'
import { fetchProgram } from '../lib/sessionize.js'

export function useProgramData() {
  const days = shallowRef([])
  const isLoading = ref(true)
  const error = ref(null)

  async function load() {
    isLoading.value = true
    error.value = null
    try {
      days.value = await fetchProgram()
    } catch (cause) {
      error.value = cause.message || 'Das Programm konnte nicht geladen werden.'
    } finally {
      isLoading.value = false
    }
  }

  load()

  return { days, isLoading, error, reload: load }
}
