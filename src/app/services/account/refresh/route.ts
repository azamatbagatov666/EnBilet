import { cookies } from "next/headers";

export async function POST() {
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
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  cookieStore.set("refresh_token", data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

    return new Response(null, { status: 200 });

}