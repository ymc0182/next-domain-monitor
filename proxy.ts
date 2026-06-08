import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'false') {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token'); 

    if (!token && pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/test-email'],
};