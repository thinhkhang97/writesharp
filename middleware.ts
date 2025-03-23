import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          // This is needed because we're setting cookies on the request object in middleware
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // This is needed because we're setting cookies on the response object in middleware
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          // This is needed because we're deleting cookies on the request object in middleware
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // This is needed because we're deleting cookies on the response object in middleware
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  
  // Auth condition for protected routes
  const authPaths = ['/dashboard']
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  if (isAuthPath && !session) {
    // If accessing a protected route without being authenticated, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Auth condition for auth routes
  const authRoutes = ['/auth/login', '/auth/signup']
  const isAuthRoute = authRoutes.includes(request.nextUrl.pathname)
  
  if (isAuthRoute && session) {
    // If accessing auth routes while already authenticated, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.ico$).*)',
  ],
} 