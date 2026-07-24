import type { Topic } from '../types'
import { dueCardIds, useAppState } from '../storage'
import { readiness, topicMastery } from '../selectors'

interface Props {
  topics: Topic[]
  go: (view: 'exam' | 'study' | 'review' | 'progress') => void
}

export function Home({ topics, go }: Props) {
  const state = useAppState()
  const mastery = topicMastery(topics, state)
  const r = readiness(mastery)
  const due = dueCardIds(Date.now()).length
  const attempted = state.exams.length

  return (
    <div className="screen home">
      <header className="apphead">
        <img className="logo" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
        <div>
          <h1>Ham Study</h1>
          <p className="sub">NZART General Amateur Operator's Certificate</p>
        </div>
      </header>

      <section className={`readiness ${r.ready ? 'ready' : ''}`}>
        <div className="rlabel">{r.label}</div>
        <div className="rgauge">
          <div className="rfill" style={{ width: `${Math.min(100, r.pct)}%` }} />
        </div>
        <div className="rmeta">
          Predicted score <strong>{r.expectedScore}/60</strong> · pass is 40
        </div>
      </section>

      <div className="tiles">
        <button className="tile accent" onClick={() => go('exam')}>
          <span className="ticon">📝</span>
          <span className="tlabel">Mock Exam</span>
          <span className="tdesc">60 questions · 2 hours</span>
        </button>
        <button className="tile" onClick={() => go('study')}>
          <span className="ticon">📚</span>
          <span className="tlabel">Study by Topic</span>
          <span className="tdesc">30 topics · 600 questions</span>
        </button>
        <button className="tile" onClick={() => go('review')}>
          <span className="ticon">🔁</span>
          <span className="tlabel">Review</span>
          <span className="tdesc">{due > 0 ? `${due} due now` : 'Spaced repetition'}</span>
          {due > 0 && <span className="badge">{due}</span>}
        </button>
        <button className="tile" onClick={() => go('progress')}>
          <span className="ticon">📊</span>
          <span className="tlabel">Progress</span>
          <span className="tdesc">{attempted > 0 ? `${attempted} exams taken` : 'Track mastery'}</span>
        </button>
      </div>

      <p className="disclaimer">
        Question bank © NZART, used per the public-domain examination pool. This is an unofficial
        study aid.
      </p>
    </div>
  )
}
