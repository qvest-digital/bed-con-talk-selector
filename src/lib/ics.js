/** Baut eine iCalendar-Datei (Europe/Berlin) aus den gewählten Talks. */
export function buildIcs(talks) {
  const stamp = toIcsLocal(new Date().toISOString().slice(0, 19))

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BED-Con Talk Selector//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Mein Programm – BED-Con 2026',
    ...BERLIN_VTIMEZONE,
  ]

  for (const talk of talks) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:bedcon-2026-${talk.id}@bed-con.org`,
      `DTSTAMP:${stamp}Z`,
      `DTSTART;TZID=Europe/Berlin:${toIcsLocal(talk.start)}`,
      `DTEND;TZID=Europe/Berlin:${toIcsLocal(talk.end)}`,
      foldLine(`SUMMARY:${escapeText(talk.title)}`),
      foldLine(`LOCATION:${escapeText(talk.roomName)}`),
      foldLine(`DESCRIPTION:${escapeText(descriptionFor(talk))}`),
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

const BERLIN_VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Berlin',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
]

function descriptionFor(talk) {
  const speakers = talk.speakers.length ? `${talk.speakers.join(', ')}\n\n` : ''
  return `${speakers}${talk.description}`
}

function toIcsLocal(isoLocal) {
  return `${isoLocal.slice(0, 10).replace(/-/g, '')}T${isoLocal.slice(11, 19).replace(/:/g, '')}`
}

function escapeText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * iCalendar erlaubt max. 75 Oktette pro Zeile. Gefaltet wird konservativ
 * nach 68 Zeichen, damit auch mehrbyte-Zeichen (Umlaute) sicher passen.
 */
function foldLine(line) {
  const limit = 68
  if (line.length <= limit) return line
  const parts = [line.slice(0, limit)]
  let rest = line.slice(limit)
  while (rest.length > limit - 1) {
    parts.push(` ${rest.slice(0, limit - 1)}`)
    rest = rest.slice(limit - 1)
  }
  if (rest) parts.push(` ${rest}`)
  return parts.join('\r\n')
}
