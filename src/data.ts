import type { Question, RawTopic, Topic } from './types'

export const EXAM_SIZE = 60
export const PASS_MARK = 40 // official: 40 or more correct out of 60
export const EXAM_TIME_MS = 2 * 60 * 60 * 1000 // official: 2 hours

let cache: { topics: Topic[]; questions: Question[] } | null = null

/** Load and normalise the question bank once. */
export async function loadBank(): Promise<{ topics: Topic[]; questions: Question[] }> {
  if (cache) return cache
  const res = await fetch(`${import.meta.env.BASE_URL}questions.json`)
  const raw: RawTopic[] = await res.json()
  const topics: Topic[] = raw.map((t, ti) => ({
    index: ti,
    title: t.Title,
    required: t.RequiredAnswers,
    questions: t.Questions.map((q, qi) => ({
      id: `${ti}-${qi}`,
      topicIndex: ti,
      topic: t.Title,
      text: q.Question,
      choices: q.Choices,
      answer: q.Answer,
      image: q.Image,
    })),
  }))
  const questions = topics.flatMap((t) => t.questions)
  cache = { topics, questions }
  return cache
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** A question paired with a (possibly shuffled) display order for its choices. */
export interface QuizItem {
  q: Question
  order: number[] // order[displayIndex] = original choice index
}

export function toItems(questions: readonly Question[], shuffleChoices: boolean): QuizItem[] {
  return questions.map((q) => {
    const idx = q.choices.map((_, i) => i)
    return { q, order: shuffleChoices ? shuffle(idx) : idx }
  })
}

/** The display index that holds the correct answer for an item. */
export function correctDisplayIndex(item: QuizItem): number {
  return item.order.indexOf(item.q.answer)
}

/**
 * Build a 60-question mock paper the way the real exam does it: from each topic,
 * draw `required` questions — one from each consecutive block of ten — so every
 * topic is represented in its true proportion.
 */
export function generateExam(topics: Topic[]): Question[] {
  const paper: Question[] = []
  for (const topic of topics) {
    const blocks = topic.required // topic has required*10 questions
    for (let b = 0; b < blocks; b++) {
      const group = topic.questions.slice(b * 10, b * 10 + 10)
      const pick = group[Math.floor(Math.random() * group.length)]
      if (pick) paper.push(pick)
    }
  }
  return shuffle(paper)
}
