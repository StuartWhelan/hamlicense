import { useState } from 'react'
import type { Topic } from '../types'
import { TopicDetail } from './TopicDetail'
import { useAppState } from '../storage'
import { topicMastery } from '../selectors'

interface Props {
  topics: Topic[]
  onExit: () => void
}

export function StudyTopics({ topics, onExit }: Props) {
  const state = useAppState()
  const [active, setActive] = useState<Topic | null>(null)
  const mastery = topicMastery(topics, state)

  if (active) {
    return <TopicDetail topic={active} onExit={() => setActive(null)} />
  }

  return (
    <div className="screen">
      <header className="runbar">
        <button className="link" onClick={onExit}>
          ‹ Home
        </button>
        <span className="runtitle">Study by Topic</span>
        <span />
      </header>
      <ul className="topiclist">
        {topics.map((t) => {
          const m = mastery[t.index]
          const pct = Math.round(m.pct * 100)
          return (
            <li key={t.index}>
              <button className="topicrow" onClick={() => setActive(t)}>
                <span className="tnum">{t.index + 1}</span>
                <span className="tinfo">
                  <span className="tt">{t.title}</span>
                  <span className="tmeta">
                    {t.questions.length} questions · {m.known} known
                  </span>
                </span>
                <span className="tbar">
                  <span className="tbarfill" style={{ width: `${pct}%` }} />
                </span>
                <span className="tpct">{pct}%</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
