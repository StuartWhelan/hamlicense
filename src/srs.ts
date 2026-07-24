// Lightweight SM-2 spaced-repetition scheduler.
// Grades: 'again' (wrong), 'good' (correct), 'easy' (correct & confident).

export interface Card {
  ease: number // ease factor
  interval: number // days until next review
  reps: number // successful reps in a row
  lapses: number
  due: number // epoch ms
}

const DAY = 24 * 60 * 60 * 1000

export function newCard(now: number): Card {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now }
}

export type Grade = 'again' | 'good' | 'easy'

export function schedule(card: Card, grade: Grade, now: number): Card {
  const c: Card = { ...card }
  if (grade === 'again') {
    c.reps = 0
    c.lapses += 1
    c.ease = Math.max(1.3, c.ease - 0.2)
    c.interval = 0
    c.due = now + 60 * 1000 // resurface in ~1 minute this session
    return c
  }
  // correct
  c.reps += 1
  if (grade === 'easy') c.ease += 0.15
  if (c.reps === 1) c.interval = 1
  else if (c.reps === 2) c.interval = grade === 'easy' ? 6 : 3
  else c.interval = Math.round(c.interval * c.ease * (grade === 'easy' ? 1.3 : 1))
  c.interval = Math.max(1, c.interval)
  c.due = now + c.interval * DAY
  return c
}

/** A card is due for review when its due time has passed. */
export function isDue(card: Card, now: number): boolean {
  return card.due <= now
}
