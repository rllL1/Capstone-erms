import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If no user and trying to access protected route, redirect to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user exists, check their profile (teachers/admins in profiles, students in students)
  if (user) {
    // First try to get profile from profiles table (teacher/admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();

    // If not in profiles, check students table
    let userRole = profile?.role;
    let userStatus = profile?.status;

    if (!profile) {
      const { data: student } = await supabase
        .from('students')
        .select('status')
        .eq('user_id', user.id)
        .single();
      
      if (student) {
        userRole = 'student';
        userStatus = student.status;
      }
    }

    // If user is archived, sign them out and redirect to login
    if (userStatus === 'archived') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'archived');
      
      // Clear the session
      await supabase.auth.signOut();
      
      return NextResponse.redirect(url);
    }

    // If on login page and authenticated, redirect to appropriate dashboard
    if (pathname === '/login' || pathname === '/') {
      const url = request.nextUrl.clone();
      if (userRole === 'admin') {
        url.pathname = '/admin/dashboard';
      } else if (userRole === 'student') {
        url.pathname = '/student/dashboard';
      } else {
        url.pathname = '/teacher/dashboard';
      }
      return NextResponse.redirect(url);
    }

    // Role-based route protection
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = userRole === 'student' ? '/student/dashboard' : '/teacher/dashboard';
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/teacher') && userRole !== 'teacher') {
      const url = request.nextUrl.clone();
      url.pathname = userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/student') && userRole !== 'student') {
      const url = request.nextUrl.clone();
      url.pathname = userRole === 'admin' ? '/admin/dashboard' : '/teacher/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
