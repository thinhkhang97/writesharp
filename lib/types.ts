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
  ideas: Array<{
    text: string
    order: number
  }>
  status: 'In Progress' | 'Feedback Ready'
  created_at: string
  updated_at: string
} 