import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  const res = await fetch(
    `http://localhost:5000/getVenues?city=${city}`,
  );
console.log(city)
  return NextResponse.json(await res.json());
}
