import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Keep middleware lightweight and compatible with Next.js middleware runtime.
  // Supabase auth session refresh middleware can break in this environment (e.g. `self` undefined).
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
