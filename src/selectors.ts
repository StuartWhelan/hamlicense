import { EXAM_SIZE, PASS_MARK } from './data'
import type { Topic } from './types'
import type { AppState } from './storage'

export interface TopicMastery {
  index: number
  title: string
  required: number
  known: number // questions currently answered correctly (last attempt)
  seen: number
  total: number
  pct: number // known / total
}

/** A question is "known" when the most recent attempt was correct. */
export function topicMastery(topics: Topic[], state: AppState): TopicMastery[] {
  return topics.map((t) => {
    let known = 0
    let seen = 0
    for (const q of t.questions) {
      const s = state.stats[q.id]
      if (!s || s.seen === 0) continue
      seen++
      if (s.lastCorrect) known++
    }
    return {
      index: t.index,
      title: t.title,
      required: t.required,
      known,
      seen,
      total: t.questions.length,
      pct: t.questions.length ? known / t.questions.length : 0,
    }
  })
}

export interface Readiness {
  expectedScore: number // predicted correct out of 60
  pct: number
  ready: boolean
  label: string
}

/**
 * Predict an exam score by weighting each topic's mastery by how many of its
 * questions the real exam draws (`required`). Sum of required == 60.
 */
export function readiness(mastery: TopicMastery[]): Readiness {
  const expected = mastery.reduce((sum, m) => sum + m.required * m.pct, 0)
  const rounded = Math.round(expected)
  const pct = Math.round((rounded / EXAM_SIZE) * 100)
  let label: string
  if (rounded >= PASS_MARK + 6) label = 'Exam ready'
  else if (rounded >= PASS_MARK) label = 'Borderline — keep drilling'
  else label = 'Not ready yet'
  return { expectedScore: rounded, pct, ready: rounded >= PASS_MARK, label }
}
