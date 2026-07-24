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
  explanation?: string // AI-generated study explanation of why the answer is correct
}
export interface Topic {
  index: number
  title: string
  required: number
  questions: Question[]
  notes?: string // reading notes from the NZART study book
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
