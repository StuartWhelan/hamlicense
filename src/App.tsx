import { useEffect, useMemo, useState } from 'react'
import type { Topic } from './types'
import { generateExam, loadBank, toItems } from './data'
import { Home } from './components/Home'
import { ExamRunner } from './components/ExamRunner'
import { StudyTopics } from './components/StudyTopics'
import { ReviewSession } from './components/ReviewSession'
import { ProgressView } from './components/ProgressView'

type View = 'home' | 'exam' | 'study' | 'review' | 'progress'

export default function App() {
  const [topics, setTopics] = useState<Topic[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('home')
  const [examNonce, setExamNonce] = useState(0)

  useEffect(() => {
    loadBank()
      .then((b) => setTopics(b.topics))
      .catch((e) => setError(String(e)))
  }, [])

  // A fresh, uniquely-sampled exam paper each time the exam view is (re)entered.
  const examItems = useMemo(
    () => (topics ? toItems(generateExam(topics), true) : []),
    [topics, examNonce],
  )

  if (error) {
    return (
      <div className="screen center">
        <p>Could not load question bank.</p>
        <p className="muted small">{error}</p>
      </div>
    )
  }
  if (!topics) {
    return (
      <div className="screen center">
        <div className="spinner" />
        <p className="muted">Loading question bank…</p>
      </div>
    )
  }

  switch (view) {
    case 'exam':
      return (
        <ExamRunner
          key={examNonce}
          items={examItems}
          onExit={() => {
            setExamNonce((n) => n + 1) // regenerate paper for next attempt
            setView('home')
          }}
        />
      )
    case 'study':
      return <StudyTopics topics={topics} onExit={() => setView('home')} />
    case 'review':
      return <ReviewSession topics={topics} onExit={() => setView('home')} />
    case 'progress':
      return <ProgressView topics={topics} onExit={() => setView('home')} />
    default:
      return <Home topics={topics} go={setView} />
  }
}
