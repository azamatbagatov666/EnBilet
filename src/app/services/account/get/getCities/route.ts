import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { error } from "console";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const res = await fetch("http://localhost:5000/getCities", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}