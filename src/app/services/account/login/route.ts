import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string, password: string}> }
) {
    const { username, password } = await params;


  const res = await fetch(
    `http://localhost:5000/Authentication/Login?Username=${username}&Password=${password}`,
  );
console.log(password)
  return NextResponse.json(await res.json());
}



