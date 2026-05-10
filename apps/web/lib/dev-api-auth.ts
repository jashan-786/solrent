import type { NextRequest } from "next/server";

type SessionLike = { role?: string | null } | null;

export function isDevApiBypassAuthorized(req: NextRequest): boolean {
    const path = req.nextUrl.pathname;
    if (!path.startsWith("/api/dev/")) {
        return false;
    }

    const secret = process.env.DEV_SETUP_SECRET;
    const auth = req.headers.get("authorization");
    const bearerOk = Boolean(secret && auth === `Bearer ${secret}`);

    if (process.env.NODE_ENV === "production") {
        return bearerOk;
    }

    if (secret) {
        return bearerOk;
    }

    return true;
}

export function canCreateDevTestUsdcMint(req: NextRequest, session: SessionLike): boolean {
    if (session?.role === "LANDLORD") {
        return true;
    }

    const secret = process.env.DEV_SETUP_SECRET;
    const auth = req.headers.get("authorization");
    if (secret && auth === `Bearer ${secret}`) {
        return true;
    }

    if (process.env.NODE_ENV === "production" || secret) {
        return false;
    }

    return !session;
}
