import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT remove this getUser() call.
  // This refreshes the session and makes sure that a valid session is set.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Define route flags
  const isLoginPage = url.pathname === '/login'
  const isRegisterPage = url.pathname === '/register'
  const isAuthCallback = url.pathname.startsWith('/auth')
  const isPublicRoute = isLoginPage || isRegisterPage || isAuthCallback
  
  const isStaticFile =
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('/api/') ||
    url.pathname.includes('.')

  // Routing checks:
  if (!user && !isPublicRoute && !isStaticFile) {
    // Redirect unauthenticated users to login page
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (isLoginPage || isRegisterPage)) {
    // Redirect authenticated users to dashboard if they hit login/register
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
