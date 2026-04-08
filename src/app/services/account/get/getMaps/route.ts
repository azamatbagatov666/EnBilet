import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const { searchParams } = new URL(request.url);
  const venueID = searchParams.get("venueID");

  const res = await fetch(`http://localhost:5000/getMaps?venueID=${venueID}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch the map" },
      { status: res.status },
    );
  }

  return NextResponse.json(await res.json());
}
