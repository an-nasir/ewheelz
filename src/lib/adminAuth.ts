import { NextRequest, NextResponse } from "next/server";

export function getAdminApiKey(): string | null {
  return process.env.ADMIN_API_KEY?.trim() || null;
}

export function readAdminKey(req: NextRequest): string | null {
  return (
    req.headers.get("x-admin-key") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    req.nextUrl.searchParams.get("key")
  );
}

export function isAdminKeyValid(key: string | null): boolean {
  const expected = getAdminApiKey();
  return Boolean(expected && key && key === expected);
}

export function requireAdmin(req: NextRequest): NextResponse | null {
  if (!getAdminApiKey()) {
    return NextResponse.json(
      { error: "ADMIN_API_KEY is not configured" },
      { status: 503 },
    );
  }

  if (!isAdminKeyValid(readAdminKey(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
