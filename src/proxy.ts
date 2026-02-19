import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session");


    if (!token && request.nextUrl.pathname.startsWith('/account/')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  else if (token && request.nextUrl.pathname == "/account") {
    return NextResponse.redirect(new URL('/', request.url))

  }

  return NextResponse.next();
}


