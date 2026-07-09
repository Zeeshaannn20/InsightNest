import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect paths based on role
  const isAdminPath = pathname.startsWith("/admin");
  const isInstructorPath = pathname.startsWith("/instructor");
  const isStudentPath = pathname.startsWith("/dashboard") || pathname.startsWith("/course/");
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (!user && (isAdminPath || isInstructorPath || isStudentPath)) {
    // Unauthenticated user trying to access protected routes
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    // Fetch user profile to get role and active status
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile?.is_active && !isAuthPage) {
      // Pending user trying to access anything other than login
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (profile?.is_active) {
      const role = profile.role;

      // Role-based redirects
      if (isAdminPath && role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = role === "instructor" ? "/instructor" : "/dashboard";
        return NextResponse.redirect(url);
      }

      if (isInstructorPath && role !== "instructor" && role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }

      if (isAuthPage) {
        // Redirect logged in active users away from auth pages
        const url = request.nextUrl.clone();
        if (role === "admin") url.pathname = "/admin";
        else if (role === "instructor") url.pathname = "/instructor";
        else url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
