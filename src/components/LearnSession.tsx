import { useState } from 'react'
import type { QuizItem } from '../data'
import { QuestionCard } from './QuestionCard'
import { isStarred, toggleStar, useAppState } from '../storage'

interface Props {
  items: QuizItem[]
  title: string
  onExit: () => void
}

/** Flashcard-style study: read the question, reveal the answer + explanation, move on. No scoring. */
export function LearnSession({ items, title, onExit }: Props) {
  useAppState() // re-render on star changes
  const [i, setI] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const item = items[i]
  const atEnd = i + 1 >= items.length

  function next() {
    if (atEnd) onExit()
    else {
      setI(i + 1)
      setRevealed(false)
    }
  }
  function prev() {
    if (i > 0) {
      setI(i - 1)
      setRevealed(false)
    }
  }

  return (
    <div className="screen">
      <header className="runbar">
        <button className="link" onClick={onExit}>
          ✕ Exit
        </button>
        <span className="runtitle">Learn · {title}</span>
        <span className="counter">
          {i + 1} / {items.length}
        </span>
      </header>
      <div className="progressline">
        <span style={{ width: `${((i + (revealed ? 1 : 0)) / items.length) * 100}%` }} />
      </div>

      <QuestionCard
        item={item}
        selected={null}
        reveal={revealed}
        hideChoices
        onSelect={() => {}}
        starred={isStarred(item.q.id)}
        onToggleStar={() => toggleStar(item.q.id)}
      />

      {!revealed ? (
        <button className="btn primary wide" onClick={() => setRevealed(true)}>
          Reveal answer
        </button>
      ) : (
        <div className="navrow">
          <button className="btn" disabled={i === 0} onClick={prev}>
            ‹ Prev
          </button>
          <button className="btn primary" onClick={next}>
            {atEnd ? 'Finish' : 'Next ›'}
          </button>
        </div>
      )}
    </div>
  )
}
