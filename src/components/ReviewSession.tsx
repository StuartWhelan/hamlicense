import { useMemo, useState } from 'react'
import type { Question, Topic } from '../types'
import { toItems } from '../data'
import { PracticeRunner } from './PracticeRunner'
import { dueCardIds, starredIds, useAppState } from '../storage'

interface Props {
  topics: Topic[]
  onExit: () => void
}

export function ReviewSession({ topics, onExit }: Props) {
  const state = useAppState()
  const [started, setStarted] = useState<Question[] | null>(null)

  const byId = useMemo(() => {
    const m = new Map<string, Question>()
    topics.forEach((t) => t.questions.forEach((q) => m.set(q.id, q)))
    return m
  }, [topics])

  const dueQuestions = useMemo(
    () => dueCardIds(Date.now()).map((id) => byId.get(id)).filter((q): q is Question => !!q),
    [byId, state.cards],
  )

  // Fallback pool: anything the user last got wrong, even without a card yet.
  const weakQuestions = useMemo(
    () =>
      Object.entries(state.stats)
        .filter(([, s]) => s.lastCorrect === false)
        .map(([id]) => byId.get(id))
        .filter((q): q is Question => !!q),
    [byId, state.stats],
  )

  const starQuestions = useMemo(
    () => starredIds().map((id) => byId.get(id)).filter((q): q is Question => !!q),
    [byId, state.starred],
  )

  // Stable shuffle for the session — recomputing on each store update (grading a
  // card) would re-shuffle the current question's choices mid-answer.
  const startedItems = useMemo(() => (started ? toItems(started, true) : null), [started])

  if (started && startedItems) {
    return (
      <PracticeRunner items={startedItems} title="Review" grading onExit={() => setStarted(null)} />
    )
  }

  return (
    <div className="screen center">
      <header className="runbar full">
        <button className="link" onClick={onExit}>
          ‹ Home
        </button>
        <span className="runtitle">Review</span>
        <span />
      </header>
      <div className="reviewhub">
        <div className="ricon">🔁</div>
        <p className="big">{dueQuestions.length} cards due</p>
        <p className="muted">
          Spaced repetition resurfaces questions right before you'd forget them. Grade each answer
          and the schedule adapts.
        </p>
        <div className="btnstack">
          <button
            className="btn primary"
            disabled={dueQuestions.length === 0}
            onClick={() => setStarted(dueQuestions.slice(0, 30))}
          >
            Review {Math.min(30, dueQuestions.length)} due
          </button>
          {weakQuestions.length > 0 && (
            <button className="btn" onClick={() => setStarted(weakQuestions.slice(0, 30))}>
              Drill {Math.min(30, weakQuestions.length)} weak questions
            </button>
          )}
          {starQuestions.length > 0 && (
            <button className="btn" onClick={() => setStarted(starQuestions.slice(0, 30))}>
              ★ Review {Math.min(30, starQuestions.length)} starred
            </button>
          )}
        </div>
        {dueQuestions.length === 0 && weakQuestions.length === 0 && starQuestions.length === 0 && (
          <p className="muted small">
            Nothing to review yet. Take a mock exam or study a topic — questions you miss are added
            here automatically.
          </p>
        )}
      </div>
    </div>
  )
}
