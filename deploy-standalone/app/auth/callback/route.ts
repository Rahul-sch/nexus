import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * OAuth Callback Handler
 *
 * Security Notes:
 * - Supabase Auth uses PKCE (Proof Key for Code Exchange) internally,
 *   which provides stronger protection than traditional CSRF tokens
 * - The 'code' parameter is a one-time authorization code that cannot be reused
 * - Redirect URL validation is enforced by Supabase (must match configured URLs)
 * - Open redirect protection: 'next' parameter is validated to prevent external redirects
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Open Redirect Protection: Validate 'next' parameter
  // Only allow relative paths (starting with /) to prevent external redirects
  const isValidNext = next.startsWith("/") && !next.startsWith("//");
  const safeNext = isValidNext ? next : "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This is expected during SSR and can be safely ignored.
            }
          },
        },
      }
    );

    // Exchange authorization code for session
    // This validates the PKCE challenge and creates the user session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful authentication - redirect to requested page
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    // Log auth error (without exposing sensitive details to user)
    console.error("[Auth Callback] Code exchange failed:", {
      errorCode: error.code,
      errorName: error.name,
      // Do NOT log error.message as it may contain sensitive info
    });
  }

  // URL to redirect to after auth error
  // Preserve error context for debugging (logged server-side above)
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
