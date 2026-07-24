import type { Topic } from '../types'
import { resetAll, useAppState } from '../storage'
import { readiness, topicMastery } from '../selectors'

interface Props {
  topics: Topic[]
  onExit: () => void
}

function when(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export function ProgressView({ topics, onExit }: Props) {
  const state = useAppState()
  const mastery = topicMastery(topics, state)
  const r = readiness(mastery)
  const totalKnown = mastery.reduce((s, m) => s + m.known, 0)
  const totalQ = mastery.reduce((s, m) => s + m.total, 0)

  return (
    <div className="screen">
      <header className="runbar">
        <button className="link" onClick={onExit}>
          ‹ Home
        </button>
        <span className="runtitle">Progress</span>
        <span />
      </header>

      <section className="statrow">
        <div className="stat">
          <div className="statnum">{r.expectedScore}/60</div>
          <div className="statlbl">Predicted</div>
        </div>
        <div className="stat">
          <div className="statnum">{totalKnown}</div>
          <div className="statlbl">of {totalQ} known</div>
        </div>
        <div className="stat">
          <div className="statnum">{state.exams.length}</div>
          <div className="statlbl">Exams</div>
        </div>
      </section>

      <h3 className="sectiontitle">Topic mastery</h3>
      <ul className="masterylist">
        {mastery.map((m) => {
          const pct = Math.round(m.pct * 100)
          const cls = pct >= 80 ? 'good' : pct >= 40 ? 'mid' : 'bad'
          return (
            <li key={m.index} className="masteryrow">
              <span className="mtitle">{m.title}</span>
              <span className="mbar">
                <span className={`mfill ${cls}`} style={{ width: `${pct}%` }} />
              </span>
              <span className="mpct">{pct}%</span>
            </li>
          )
        })}
      </ul>

      {state.exams.length > 0 && (
        <>
          <h3 className="sectiontitle">Exam history</h3>
          <ul className="examhist">
            {state.exams.map((e, i) => (
              <li key={i} className={`histrow ${e.passed ? 'pass' : 'fail'}`}>
                <span className="hdate">{when(e.date)}</span>
                <span className="hscore">
                  {e.score}/{e.total}
                </span>
                <span className="hpill">{e.passed ? 'PASS' : 'fail'}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <button
        className="btn danger wide"
        onClick={() => {
          if (confirm('Reset all study progress? This cannot be undone.')) resetAll()
        }}
      >
        Reset all progress
      </button>
    </div>
  )
}
