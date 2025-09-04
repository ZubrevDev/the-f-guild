import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Временно отключаем middleware для демо
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/dm/:path*', '/player/:path*']
}