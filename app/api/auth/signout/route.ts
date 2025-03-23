import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Clear all Supabase cookies
  const cookieNames = [
    'sb-access-token',
    'sb-refresh-token',
    'sb-auth-token',
    'supabase-auth-token'
  ]
  
  // Delete all possible Supabase auth cookies
  cookieNames.forEach(name => {
    cookies().delete(name)
  })
  
  // Redirect to homepage
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
} 