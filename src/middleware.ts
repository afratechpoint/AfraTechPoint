import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || ''
  
  // Define subdomains
  const isAdminSubdomain = host.startsWith('admin.')
  
  // If on admin subdomain
  if (isAdminSubdomain) {
    // If accessing root of admin subdomain, go to /admin internally
    if (url.pathname === '/') {
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }
    
    // If accessing anything else on admin subdomain, ensure it's mapped to /admin if not already
    // (Optional: can also protect it from non-admin paths)
  }

  return NextResponse.next()
}

// Only match relevant paths to keep performance high
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
