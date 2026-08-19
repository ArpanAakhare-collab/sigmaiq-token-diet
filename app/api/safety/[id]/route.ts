import { NextResponse } from "next/server";

export async function DELETE() {
  return NextResponse.json({ error: "Safety detail endpoint removed. SigmaIQ is exclusively Token-Diet." }, { status: 404 });
}
