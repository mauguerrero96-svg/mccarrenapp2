import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    // Create Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
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

    // Get User
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // --- PUBLIC ROUTES ---
    // Allow access to login, signup, public api, etc.
    if (
        pathname.startsWith("/auth") ||
        pathname.startsWith("/_next") ||
        pathname.includes("/api/") || // Allow API access (handled by RLS/API logic)
        pathname === "/login" ||
        pathname === "/signup"
    ) {
        return supabaseResponse;
    }

    // 1. Unauthenticated Users
    if (!user) {
        // Allow access to landing page (root)
        if (pathname === "/") {
            return supabaseResponse;
        }

        // Redirect to login if trying to access protected routes
        if (
            pathname.startsWith("/dashboard") ||
            // pathname.startsWith("/admin") || // TEMPORARY BYPASS
            pathname.startsWith("/developer") ||
            pathname.startsWith("/organizer")
        ) {
            const url = request.nextUrl.clone();
            url.pathname = "/auth/login";
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    } else {
        // Authenticated users on root -> redirect to specific dashboard based on role
        if (pathname === "/") {
            const url = request.nextUrl.clone();
            const userRole = user?.user_metadata?.user_role || "player";

            if (userRole === 'admin' || userRole === 'organizer') {
                url.pathname = "/admin";
            } else if (userRole === 'developer') {
                url.pathname = "/developer";
            } else {
                url.pathname = "/dashboard";
            }
            return NextResponse.redirect(url);
        }
    }

    // 2. Authenticated Users - Role Check
    const userRole = user?.user_metadata?.user_role || "player";

    // Developer Access
    if (pathname.startsWith("/developer")) {
        if (userRole !== "developer") {
            // Not allowed, redirect to dashboard
            const url = request.nextUrl.clone();
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
    }

    // Admin Access
    if (pathname.startsWith("/admin") || pathname.startsWith("/organizer")) {
        // TEMPORARY BYPASS: Allow everyone
        return supabaseResponse;

        /* 
        // Allow 'admin', 'developer', and 'organizer' (if legacy role exists)
        if (!["admin", "developer", "organizer"].includes(userRole)) {
            const url = request.nextUrl.clone();
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
        */
    }

    // Player Access (Dashboard)
    // All authenticated users can access /dashboard.

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
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
