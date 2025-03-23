import { NextResponse } from 'next/server'
import { createBrowserClient } from '@supabase/ssr'

export async function GET() {
  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }
  
  // Return user information
  return NextResponse.json({
    userId: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata?.name || null
  })
} 