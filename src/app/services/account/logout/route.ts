import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    cookieStore.delete("access_token");

    return new Response(null, { status: 200 });
  }

  const res = await fetch("http://localhost:5000/Authentication/Logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  return new Response(null, { status: 200 });
}
