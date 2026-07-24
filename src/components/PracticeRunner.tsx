import { useMemo, useState } from 'react'
import type { QuizItem } from '../data'
import { correctDisplayIndex } from '../data'
import { QuestionCard } from './QuestionCard'
import { ensureCard, gradeCard, isStarred, recordAnswer, toggleStar, useAppState } from '../storage'
import type { Grade } from '../srs'

interface Props {
  items: QuizItem[]
  title: string
  grading?: boolean // review mode: show SM-2 grade buttons
  onExit: () => void
}

/** Immediate-feedback runner used for topic drills and spaced-repetition review. */
export function PracticeRunner({ items, title, grading = false, onExit }: Props) {
  useAppState() // re-render on star changes
  const [i, setI] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  const item = items[i]
  const reveal = selected !== null
  const wasCorrect = useMemo(
    () => (reveal && item ? selected === correctDisplayIndex(item) : false),
    [reveal, selected, item],
  )

  if (!item || done) {
    return (
      <div className="screen center">
        <h1>Session complete</h1>
        <p className="big">
          {correctCount} / {items.length} correct
        </p>
        <button className="btn primary" onClick={onExit}>
          Done
        </button>
      </div>
    )
  }

  function answer(displayIndex: number) {
    if (selected !== null) return
    const ok = displayIndex === correctDisplayIndex(item)
    setSelected(displayIndex)
    if (ok) setCorrectCount((c) => c + 1)
    recordAnswer(item.q.id, ok)
    // In plain practice, a wrong answer enrols the question into spaced review.
    if (!grading && !ok) ensureCard(item.q.id, Date.now())
  }

  function advance() {
    if (i + 1 >= items.length) setDone(true)
    else {
      setI(i + 1)
      setSelected(null)
    }
  }

  function grade(g: Grade) {
    gradeCard(item.q.id, g, Date.now())
    advance()
  }

  return (
    <div className="screen">
      <header className="runbar">
        <button className="link" onClick={onExit}>
          ✕ Exit
        </button>
        <span className="runtitle">{title}</span>
        <span className="counter">
          {i + 1} / {items.length}
        </span>
      </header>
      <div className="progressline">
        <span style={{ width: `${(i / items.length) * 100}%` }} />
      </div>

      <QuestionCard
        item={item}
        selected={selected}
        reveal={reveal}
        onSelect={answer}
        starred={isStarred(item.q.id)}
        onToggleStar={() => toggleStar(item.q.id)}
      />

      {reveal && (
        <div className="feedback">
          <p className={wasCorrect ? 'verdict ok' : 'verdict no'}>
            {wasCorrect ? '✓ Correct' : '✗ Not quite'}
          </p>
          {grading ? (
            <div className="graderow">
              <button className="btn again" onClick={() => grade('again')}>
                Again
              </button>
              <button className="btn good" onClick={() => grade('good')}>
                Good
              </button>
              <button className="btn easy" onClick={() => grade('easy')}>
                Easy
              </button>
            </div>
          ) : (
            <button className="btn primary" onClick={advance}>
              {i + 1 >= items.length ? 'Finish' : 'Next question'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
