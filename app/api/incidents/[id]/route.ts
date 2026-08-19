import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Incident detail endpoint removed. SigmaIQ is exclusively Token-Diet." }, { status: 404 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Incident detail endpoint removed. SigmaIQ is exclusively Token-Diet." }, { status: 404 });
}
