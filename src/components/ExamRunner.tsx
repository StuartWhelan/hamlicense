import { useEffect, useMemo, useRef, useState } from 'react'
import type { QuizItem } from '../data'
import { correctDisplayIndex, EXAM_TIME_MS, PASS_MARK } from '../data'
import type { ExamResult } from '../types'
import { QuestionCard } from './QuestionCard'
import { addExam, recordAnswer } from '../storage'

interface Props {
  items: QuizItem[]
  onExit: () => void
}

function fmt(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(sec)}`
}

export function ExamRunner({ items, onExit }: Props) {
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [remaining, setRemaining] = useState(EXAM_TIME_MS)
  const startRef = useRef(Date.now())
  const resultRef = useRef<ExamResult | null>(null)

  // Countdown timer; auto-submits at zero.
  useEffect(() => {
    if (submitted) return
    const t = setInterval(() => {
      const left = EXAM_TIME_MS - (Date.now() - startRef.current)
      setRemaining(left)
      if (left <= 0) doSubmit()
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted])

  const answeredCount = Object.keys(answers).length
  const item = items[i]

  function doSubmit() {
    if (resultRef.current) return
    let score = 0
    const perTopicMap = new Map<string, { correct: number; total: number }>()
    items.forEach((it, idx) => {
      const chosen = answers[idx]
      const ok = chosen !== undefined && chosen === correctDisplayIndex(it)
      if (ok) score++
      recordAnswer(it.q.id, ok)
      const pt = perTopicMap.get(it.q.topic) ?? { correct: 0, total: 0 }
      pt.total++
      if (ok) pt.correct++
      perTopicMap.set(it.q.topic, pt)
    })
    const result: ExamResult = {
      date: Date.now(),
      score,
      total: items.length,
      passed: score >= PASS_MARK,
      durationMs: Date.now() - startRef.current,
      perTopic: [...perTopicMap.entries()].map(([topic, v]) => ({ topic, ...v })),
    }
    resultRef.current = result
    addExam(result)
    setSubmitted(true)
  }

  if (submitted && resultRef.current) {
    return <ExamResults result={resultRef.current} items={items} answers={answers} onExit={onExit} />
  }

  const timeLow = remaining < 5 * 60 * 1000
  return (
    <div className="screen">
      <header className="runbar">
        <button className="link" onClick={onExit}>
          ✕ Quit
        </button>
        <span className={`timer${timeLow ? ' low' : ''}`}>⏱ {fmt(remaining)}</span>
        <span className="counter">
          {i + 1} / {items.length}
        </span>
      </header>
      <div className="progressline">
        <span style={{ width: `${(answeredCount / items.length) * 100}%` }} />
      </div>

      <QuestionCard
        item={item}
        selected={answers[i] ?? null}
        reveal={false}
        onSelect={(di) => setAnswers((a) => ({ ...a, [i]: di }))}
      />

      <div className="navrow">
        <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>
          ‹ Prev
        </button>
        <span className="muted">{answeredCount} answered</span>
        {i + 1 < items.length ? (
          <button className="btn" onClick={() => setI(i + 1)}>
            Next ›
          </button>
        ) : (
          <button className="btn primary" onClick={doSubmit}>
            Submit
          </button>
        )}
      </div>

      {i + 1 === items.length && (
        <button className="btn wide" onClick={doSubmit}>
          Submit exam ({answeredCount}/{items.length} answered)
        </button>
      )}
    </div>
  )
}

function ExamResults({
  result,
  items,
  answers,
  onExit,
}: {
  result: ExamResult
  items: QuizItem[]
  answers: Record<number, number>
  onExit: () => void
}) {
  const [showReview, setShowReview] = useState(false)
  const pct = Math.round((result.score / result.total) * 100)
  const wrong = useMemo(
    () =>
      items
        .map((it, idx) => ({ it, idx }))
        .filter(({ it, idx }) => answers[idx] === undefined || answers[idx] !== correctDisplayIndex(it)),
    [items, answers],
  )

  return (
    <div className="screen">
      <div className={`resulthero ${result.passed ? 'pass' : 'fail'}`}>
        <div className="bigscore">
          {result.score}
          <span className="of">/ {result.total}</span>
        </div>
        <div className="pill">{result.passed ? 'PASS' : 'NOT YET'}</div>
        <p className="muted">
          {pct}% · pass mark is {PASS_MARK}/60 · {fmt(result.durationMs)} taken
        </p>
      </div>

      <h3 className="sectiontitle">By topic</h3>
      <div className="topicgrid">
        {result.perTopic.map((t) => {
          const ok = t.correct === t.total
          return (
            <div key={t.topic} className={`topicchip ${ok ? 'good' : t.correct === 0 ? 'bad' : 'mid'}`}>
              <span className="tname">{t.topic}</span>
              <span className="tscore">
                {t.correct}/{t.total}
              </span>
            </div>
          )
        })}
      </div>

      <div className="btnstack">
        <button className="btn primary" onClick={() => setShowReview((s) => !s)}>
          {showReview ? 'Hide' : 'Review'} {wrong.length} missed
        </button>
        <button className="btn" onClick={onExit}>
          Back to home
        </button>
      </div>

      {showReview &&
        wrong.map(({ it, idx }) => (
          <div key={idx} className="reviewitem">
            <QuestionCard item={it} selected={answers[idx] ?? null} reveal onSelect={() => {}} />
          </div>
        ))}
    </div>
  )
}
