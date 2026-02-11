import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { AuthenticateResponse } from "@/src/models/AuthenticateResponse";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  const backendRes = await fetch("http://localhost:5000/Authentication/Login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Username: username,
      Password: password,
    }),
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const data: AuthenticateResponse = await backendRes.json();

  const cookieStore = await cookies();

  cookieStore.set("access_token", data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  cookieStore.set("session", "1", {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("refresh_token", data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/services/account/user",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({
    id: data.id,
    username: data.username,
  });
}
