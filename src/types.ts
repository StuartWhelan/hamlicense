// Raw shape as stored in public/questions.json (from the NZART public-domain bank)
export interface RawQuestion {
  Question: string
  Answer: number // 0-indexed into Choices
  Choices: string[]
  Image?: string // filename in /diagrams
}
export interface RawTopic {
  Title: string
  RequiredAnswers: number // number drawn into a 60-question exam paper
  Questions: RawQuestion[]
}

// Normalised model used throughout the app
export interface Question {
  id: string // `${topicIndex}-${questionIndex}`
  topicIndex: number
  topic: string
  text: string
  choices: string[]
  answer: number
  image?: string
}
export interface Topic {
  index: number
  title: string
  required: number
  questions: Question[]
}

export type QuizMode = 'exam' | 'practice' | 'review'

export interface ExamResult {
  date: number
  score: number // number correct
  total: number
  passed: boolean
  durationMs: number
  perTopic: { topic: string; correct: number; total: number }[]
}
