import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Safety endpoint removed. SigmaIQ is exclusively Token-Diet." }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: "Safety endpoint removed. SigmaIQ is exclusively Token-Diet." }, { status: 404 });
}
