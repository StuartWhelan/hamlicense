import { useSyncExternalStore } from 'react'
import type { ExamResult } from './types'
import { type Card, type Grade, newCard, schedule, isDue } from './srs'

const KEY = 'nzart-study-v1'

export interface QStat {
  seen: number
  correct: number
  wrong: number
  lastCorrect: boolean | null
}

export interface AppState {
  version: number
  stats: Record<string, QStat>
  cards: Record<string, Card>
  exams: ExamResult[]
}

function empty(): AppState {
  return { version: 1, stats: {}, cards: {}, exams: [] }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as AppState
    return { ...empty(), ...parsed }
  } catch {
    return empty()
  }
}

let state: AppState = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full / unavailable — app still works in-memory */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** React binding — re-renders on any state change. */
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state)
}

// ---- mutations ----

export function recordAnswer(qid: string, correct: boolean) {
  const s = state.stats[qid] ?? { seen: 0, correct: 0, wrong: 0, lastCorrect: null }
  state.stats = {
    ...state.stats,
    [qid]: {
      seen: s.seen + 1,
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
      lastCorrect: correct,
    },
  }
  persist()
}

export function gradeCard(qid: string, grade: Grade, now: number) {
  const existing = state.cards[qid] ?? newCard(now)
  state.cards = { ...state.cards, [qid]: schedule(existing, grade, now) }
  persist()
}

/** Ensure a card exists for a question (called when it first enters review). */
export function ensureCard(qid: string, now: number) {
  if (!state.cards[qid]) {
    state.cards = { ...state.cards, [qid]: newCard(now) }
    persist()
  }
}

export function addExam(result: ExamResult) {
  state.exams = [result, ...state.exams].slice(0, 50)
  persist()
}

export function resetAll() {
  state = empty()
  persist()
}

// ---- selectors ----

/** Question ids that are due for spaced review right now. */
export function dueCardIds(now: number): string[] {
  return Object.entries(state.cards)
    .filter(([, c]) => isDue(c, now))
    .map(([id]) => id)
}

/** Cards created plus questions answered wrong that have no card yet. */
export function cardCount(): number {
  return Object.keys(state.cards).length
}
