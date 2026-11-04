import { NextRequest, NextResponse } from 'next/server';

const publicPages = new Set(['/TEST','/TEST/','/TEST/inquiry','/TEST/privacy','/TEST/terms','/TEST/review']);
export function proxy(request: NextRequest) {
  if (process.env.BLUEPEACE_PUBLIC_DEMO !== 'true') return NextResponse.next();
  const path=request.nextUrl.pathname;
  if (path === '/') {
    const response=NextResponse.redirect(new URL('/TEST',request.url));
    response.headers.set('X-Robots-Tag','noindex, nofollow');
    return response;
  }
  if (path.startsWith('/api/') || path.startsWith('/admin') || path.startsWith('/instructor')) {
    return new NextResponse('Not found',{status:404,headers:{'X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store'}});
  }
  const asset=path.startsWith('/_next/') || /^\/[a-zA-Z0-9._-]+\.(?:jpg|jpeg|png|webp|svg|ico|woff2?)$/.test(path)
    || /^\/review\/[a-z0-9-]+\.jpg$/.test(path);
  if (!publicPages.has(path) && !asset) return new NextResponse('Not found',{status:404,headers:{'X-Robots-Tag':'noindex, nofollow'}});
  const response=NextResponse.next();
  response.headers.set('X-Robots-Tag','noindex, nofollow');
  if (publicPages.has(path) || path.startsWith('/review/')) response.headers.set('Cache-Control','no-store');
  return response;
}

export const config={matcher:'/:path*'};
