/**
 * Laden und Normalisieren des offiziellen BED-Con-Programms.
 *
 * Quelle: Sessionize "GridSmart"-View. Das JSON liefert pro Tag eine
 * Raum-Matrix, in der kurze Talks als eigene Zeitschienen auftauchen
 * (z. B. 11:40, 12:00 und 12:20 im selben Raum). Für die Auswahl werden
 * solche Talks wieder zu einem Slot-Block zusammengefasst.
 */

export const GRID_URL = 'https://sessionize.com/api/v2/ae9h84td/view/GridSmart'

export async function fetchProgram(url = GRID_URL) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Sessionize antwortete mit HTTP ${response.status}`)
  }
  return normalizeProgram(await response.json())
}

export function normalizeProgram(rawDays) {
  return rawDays.map((rawDay, index) => buildDay(rawDay, index))
}

function buildDay(rawDay, index) {
  const id = rawDay.date.slice(0, 10)
  const rooms = rawDay.rooms.map((room) => ({ id: room.id, name: room.name }))

  const talks = rawDay.timeSlots
    .flatMap((timeSlot) => timeSlot.rooms)
    .filter((entry) => entry.session)
    .map((entry) => buildTalk(entry.session, id))
    .sort((a, b) => a.start.localeCompare(b.start) || a.roomName.localeCompare(b.roomName))

  return {
    id,
    index,
    number: index + 1,
    date: id,
    rooms,
    slots: buildSlots(talks, id, rooms),
  }
}

function buildTalk(session, dayId) {
  return {
    id: session.id,
    dayId,
    title: (session.title || '').trim(),
    description: (session.description || '').replace(/\r\n/g, '\n').trim(),
    start: session.startsAt,
    end: session.endsAt,
    startTime: session.startsAt.slice(11, 16),
    endTime: session.endsAt.slice(11, 16),
    duration: minutesBetween(session.startsAt, session.endsAt),
    roomId: session.roomId,
    roomName: session.room,
    speakers: (session.speakers || []).map((speaker) => speaker.name),
    isBreak: Boolean(session.isServiceSession),
    isPlenum: Boolean(session.isPlenumSession),
  }
}

/**
 * Fasst alle Talks eines Tages zu Slots zusammen: Ein Slot ist ein
 * zusammenhängender Zeitblock, in dem parallel Talks laufen. Über die
 * Räume hinweg überlappende Talks landen im selben Slot – damit werden
 * auch die kurzen Talks korrekt dem langen Slot zugeordnet.
 */
function buildSlots(talks, dayId, rooms) {
  const clusters = []

  for (const talk of talks) {
    const current = clusters[clusters.length - 1]
    if (current && talk.start < current.end) {
      current.talks.push(talk)
      if (talk.end > current.end) current.end = talk.end
    } else {
      clusters.push({ start: talk.start, end: talk.end, talks: [talk] })
    }
  }

  return clusters.map((cluster) => buildSlot(cluster, dayId, rooms))
}

function buildSlot(cluster, dayId, rooms) {
  const key = `${dayId}|${cluster.start.slice(11, 16)}`

  const byRoom = new Map()
  for (const talk of cluster.talks) {
    if (!byRoom.has(talk.roomId)) byRoom.set(talk.roomId, [])
    byRoom.get(talk.roomId).push(talk)
  }

  const entries = [...byRoom.entries()]
    .map(([roomId, roomTalks]) => {
      const sorted = [...roomTalks].sort((a, b) => a.start.localeCompare(b.start))
      return {
        key: `${key}|${roomId}`,
        slotKey: key,
        dayId,
        roomId,
        roomName: sorted[0].roomName,
        talks: sorted,
        isShortTalkBlock: sorted.length > 1,
        isBreak: sorted.every((talk) => talk.isBreak),
        start: sorted[0].start,
        end: sorted[sorted.length - 1].end,
        startTime: sorted[0].startTime,
        endTime: sorted[sorted.length - 1].endTime,
      }
    })
    .sort((a, b) => roomOrder(rooms, a.roomId) - roomOrder(rooms, b.roomId))

  return {
    key,
    dayId,
    start: cluster.start,
    end: cluster.end,
    startTime: cluster.start.slice(11, 16),
    endTime: cluster.end.slice(11, 16),
    isBreak: entries.every((entry) => entry.isBreak),
    entries,
  }
}

function roomOrder(rooms, roomId) {
  const index = rooms.findIndex((room) => room.id === roomId)
  return index === -1 ? rooms.length : index
}

function minutesBetween(start, end) {
  return Math.round((new Date(end) - new Date(start)) / 60000)
}
