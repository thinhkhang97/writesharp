export interface UserCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends UserCredentials {
  name?: string
}

export interface AuthError {
  message: string
}

export interface AiGuide {
  text: string
  order: number
}

export interface Idea {
  text: string
  order: number
  aiGuides?: AiGuide[]
}

export interface Draft {
  id: string
  user_id: string
  title: string
  content: string
  foundation: {
    purpose: string
    audience: string
    topic: string
  }
  ideas: Idea[]
  status: 'In Progress' | 'Feedback Ready'
  created_at: string
  updated_at: string
  evaluation?: SkillEvaluation
}

export interface SkillEvaluation {
  scores: SkillScores
  originality: {
    isOriginal: boolean
    matchPercentage?: number
  }
  timestamp: string
}

export interface SkillScores {
  clarity: number
  logic: number
  expression: number
  structure: number
  grammar: number
}

export interface WriterProfile {
  reasonerScore: number
  polisherScore: number
  level: WriterLevel
  history: {
    timestamp: string
    reasonerScore: number
    polisherScore: number
  }[]
}

export type WriterLevel = 'Beginner' | 'Solid' | 'Advanced' | 'Expert' 