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