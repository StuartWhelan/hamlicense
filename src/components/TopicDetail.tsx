import { useMemo, useState } from 'react'
import type { Topic } from '../types'
import { toItems } from '../data'
import { LearnSession } from './LearnSession'
import { PracticeRunner } from './PracticeRunner'
import { useAppState } from '../storage'
import { topicMastery } from '../selectors'

interface Props {
  topic: Topic
  onExit: () => void
}

type Mode = 'menu' | 'learn' | 'test'

export function TopicDetail({ topic, onExit }: Props) {
  const state = useAppState()
  const [mode, setMode] = useState<Mode>('menu')
  const [showNotes, setShowNotes] = useState(false)

  // Build the session's items ONCE per mode entry. Recomputing on every render
  // (e.g. when the store updates after answering) would re-shuffle the choices
  // mid-question and mislabel a correct answer.
  const sessionItems = useMemo(
    () => (mode === 'menu' ? [] : toItems(topic.questions, mode === 'test')),
    [topic, mode],
  )

  if (mode === 'learn') {
    return <LearnSession items={sessionItems} title={topic.title} onExit={() => setMode('menu')} />
  }
  if (mode === 'test') {
    return (
      <PracticeRunner items={sessionItems} title={topic.title} onExit={() => setMode('menu')} />
    )
  }

  const m = topicMastery(topic.questions.length ? [topic] : [], state)[0]
  const pct = m ? Math.round(m.pct * 100) : 0

  return (
    <div className="screen">
      <header className="runbar">
        <button className="link" onClick={onExit}>
          ‹ Topics
        </button>
        <span className="runtitle">
          {topic.index + 1}. {topic.title}
        </span>
        <span />
      </header>

      <div className="topichero">
        <div className="thstat">
          <strong>{topic.questions.length}</strong> questions
        </div>
        <div className="thstat">
          <strong>{pct}%</strong> known
        </div>
        <div className="thstat">
          <strong>{m?.known ?? 0}</strong> mastered
        </div>
      </div>

      {topic.notes && (
        <section className="notes">
          <button className="notestoggle" onClick={() => setShowNotes((s) => !s)}>
            <span>📖 Read first — study notes</span>
            <span className="chev">{showNotes ? '▲' : '▼'}</span>
          </button>
          {showNotes && (
            <div className="notesbody">
              {topic.notes.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              <p className="notesrc">Source: NZART Block Course Study Notes.</p>
            </div>
          )}
        </section>
      )}

      <div className="modechoice">
        <button className="modecard learn" onClick={() => setMode('learn')}>
          <span className="micon">🧠</span>
          <span className="mlabel">Learn</span>
          <span className="mdesc">Flip through cards with answers &amp; explanations. No scoring.</span>
        </button>
        <button className="modecard test" onClick={() => setMode('test')}>
          <span className="micon">✍️</span>
          <span className="mlabel">Test</span>
          <span className="mdesc">Quiz yourself with instant feedback. Misses go to Review.</span>
        </button>
      </div>
    </div>
  )
}
