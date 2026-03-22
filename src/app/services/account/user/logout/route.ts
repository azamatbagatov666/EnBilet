import { cookies } from "next/headers";

export async function POST() {


  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    try {
    await fetch("http://localhost:5000/Authentication/Logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  }
  catch (err){
          console.error("Backend logout failed:", err);

  }}

  cookieStore.set("access_token", "", {
    path: "/",
    maxAge: 0,
  });

  cookieStore.set("refresh_token", "", {
    path: "/services/account/user",
    maxAge: 0,
  });

  cookieStore.set("session", "", { path: "/", maxAge: 0 });


  return new Response(null, { status: 200 });
}
