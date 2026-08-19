import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Alerts endpoint removed. SigmaIQ is exclusively Token-Diet." }, { status: 404 });
}
