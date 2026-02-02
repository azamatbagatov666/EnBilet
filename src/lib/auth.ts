import { cookies } from "next/headers";

export async function getUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  return { token };
}
