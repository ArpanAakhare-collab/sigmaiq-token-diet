import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Monitoring webhooks endpoint removed. SigmaIQ is exclusively Token-Diet." }, { status: 404 });
}
