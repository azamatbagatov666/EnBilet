import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
  
  const res = await fetch("http://localhost:5000/getEvents", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
