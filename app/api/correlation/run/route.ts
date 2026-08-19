import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Correlation endpoint removed. SigmaIQ is exclusively Token-Diet." }, { status: 404 });
}
