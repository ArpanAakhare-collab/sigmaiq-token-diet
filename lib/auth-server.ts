import { NextRequest } from "next/server";
import { requireAuthenticatedUser, AuthenticatedUser } from "@/lib/server/auth";

export type { AuthenticatedUser };

export async function verifyAuthToken(req: NextRequest): Promise<AuthenticatedUser> {
  return requireAuthenticatedUser(req);
}
