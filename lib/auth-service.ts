import { SignUpCredentials, UserCredentials } from './types'
import { createClient } from '@/utils/supabase/client'

export const signUp = async ({ email, password, name }: SignUpCredentials) => {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export const signIn = async ({ email, password }: UserCredentials) => {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

export const signOut = async () => {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return true
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return user
} 