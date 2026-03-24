import { cookies } from "next/headers";

export async function POST() {
  const isProd = process.env.NODE_ENV === "production";

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return new Response(null, { status: 401 });
  }

  const res = await fetch("http://localhost:5000/Authentication/Refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return new Response(null, { status: 401 });

  const data = await res.json();

  cookieStore.set("access_token", data.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  cookieStore.set("session", "1", {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  cookieStore.set("refresh_token", data.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/services/account/user",
    maxAge: 60 * 60 * 24 * 7,
  });

  return new Response(null, { status: 200 });
}
