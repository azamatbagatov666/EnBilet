import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
  
    const body = await request.json();

    const res = await fetch("http://localhost:5000/AddEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,

      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText },
        { status: res.status }
      );
    }

    const data = await res.json().catch(() => null);

    return NextResponse.json(data ?? { success: true });
  
}
