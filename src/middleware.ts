import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");


    if (!token && request.nextUrl.pathname.startsWith('/account/')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  else if (token && request.nextUrl.pathname == "/account") {
    return NextResponse.redirect(new URL('/', request.url))

  }

  return NextResponse.next();
}


