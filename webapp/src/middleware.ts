// // src/middleware.ts
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  // Allow auth pages and public API routes
  if (isAuthPage) {
    if (token) {
      // Redirect to dashboard if already logged in
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect API routes
  if (isApiRoute && !request.nextUrl.pathname.startsWith('/api/auth')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', token.id as string);
    requestHeaders.set('x-user-role', token.role as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  // Protect dashboard routes
  if (!token && !isAuthPage) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cases/:path*',
    '/documents/:path*',
    '/calendar/:path*',
    '/api/:path*',
    '/auth/:path*'
  ]
};
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { jwtVerify } from 'jose';

// const JWT_SECRET = new TextEncoder().encode(
//   process.env.NEXTAUTH_SECRET || 'your-secret-key'
// );

// export async function middleware(request: NextRequest) {
//   // Skip auth for public routes
//   if (request.nextUrl.pathname.startsWith('/api/auth')) {
//     return NextResponse.next();
//   }

//   // Get token from cookie or header
//   const token = request.cookies.get('next-auth.session-token')?.value || 
//                 request.cookies.get('__Secure-next-auth.session-token')?.value ||
//                 request.headers.get('authorization')?.replace('Bearer ', '');

//   if (!token) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     // Verify JWT token
//     const { payload } = await jwtVerify(token, JWT_SECRET);
    
//     if (!payload.sub) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     // Add user ID to request headers
//     const requestHeaders = new Headers(request.headers);
//     requestHeaders.set('x-user-id', payload.sub as string);
//     requestHeaders.set('x-user-email', payload.email as string || '');

//     return NextResponse.next({
//       request: {
//         headers: requestHeaders
//       }
//     });
//   } catch (error) {
//     console.error('Auth middleware error:', error);
//     return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
//   }
// }

// export const config = {
//   matcher: [
//     '/api/cases/:path*',
//     '/api/ai/:path*'
//   ]
// };