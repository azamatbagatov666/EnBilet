import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { AuthenticateResponse } from "@/src/models/AuthenticateResponse";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;



  const backendRes = await fetch(
    "http://localhost:5000/Authentication/Login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Username: username,
        Password: password,
      }),
    }
  );

  if (!backendRes.ok) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const data: AuthenticateResponse = await backendRes.json();

const cookieStore = await cookies();

  cookieStore.set("token", data.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({
    id: data.id,
    username: data.username,
  });
}
