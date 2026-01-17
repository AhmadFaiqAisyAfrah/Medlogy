import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // 1. Check Env Vars (Fail Fast)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error('Supabase credentials missing. Check .env.local for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    const supabase = createServerClient(
        url,
        key,
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

    // 2. Refresh Session
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 3. Protected Routes Logic
    if (
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup') ||
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname.startsWith('/api') ||
        request.nextUrl.pathname === '/'
    ) {
        // If user is authenticated and hitting login/signup OR root, redirect to analysis
        if (user && (
            request.nextUrl.pathname.startsWith('/login') ||
            request.nextUrl.pathname.startsWith('/signup') ||
            request.nextUrl.pathname === '/'
        )) {
            const url = request.nextUrl.clone()
            url.pathname = '/analysis'
            return NextResponse.redirect(url)
        }
        return supabaseResponse
    }

    // Protect all other routes
    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
