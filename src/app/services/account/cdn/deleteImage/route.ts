import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const body = await request.json();

  
  const res = await fetch("http://localhost:5000/delete-image", {
    method: "POST",
    
    headers: {
        "Content-Type": "application/json",

      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),

  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to delete the image" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
