/** Sucht in Titel, Beschreibung, Speaker-Namen und Raum. */
export function talkMatches(talk, query) {
  if (!query) return true
  const haystack = [talk.title, talk.description, talk.roomName, ...talk.speakers]
    .join(' ')
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

/** Zerlegt einen Text für die Trefferhervorhebung in Teile. */
export function highlightParts(text, query) {
  const terms = (query || '')
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 1)

  if (!terms.length) return [{ text, match: false }]

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
  return text
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, match: terms.includes(part.toLowerCase()) }))
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
