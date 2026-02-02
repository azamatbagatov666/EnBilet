import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("http://localhost:5000/getCities", {
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
