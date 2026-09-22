const dayFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortDayFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: 'numeric',
  month: 'numeric',
})

export function formatDay(dayId) {
  return dayFormatter.format(new Date(`${dayId}T12:00:00`))
}

export function formatShortDay(dayId) {
  return shortDayFormatter.format(new Date(`${dayId}T12:00:00`))
}

export function formatTimeRange(startTime, endTime) {
  return `${startTime} – ${endTime}`
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}
