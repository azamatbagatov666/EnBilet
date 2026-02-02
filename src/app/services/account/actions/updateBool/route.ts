import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const body = await request.json();

    const res = await fetch("http://localhost:5000/updateBool", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
