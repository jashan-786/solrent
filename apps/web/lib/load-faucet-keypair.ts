import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

export type LoadFaucetKeypairResult =
    | { ok: true; keypair: Keypair }
    | { ok: false; message: string };

function normalizeEnv(raw: string): string {
    let s = raw.trim();
    if (
        (s.startsWith('"') && s.endsWith('"')) ||
        (s.startsWith("'") && s.endsWith("'"))
    ) {
        s = s.slice(1, -1).trim();
    }
    return s;
}

function tryKeypairFromBytes(secretBytes: Uint8Array): LoadFaucetKeypairResult {
    try {
        return { ok: true, keypair: Keypair.fromSecretKey(secretBytes) };
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return { ok: false, message: `Invalid secret key bytes: ${msg}` };
    }
}

export function loadFaucetKeypairFromEnv(): LoadFaucetKeypairResult {
    const raw = process.env.SOLANA_FAUCET_SECRET_KEY;
    if (!raw) {
        return {
            ok: false,
            message:
                "SOLANA_FAUCET_SECRET_KEY is not set. Use contents of a Solana keypair JSON (array of 64 bytes), base58 secret, or hex.",
        };
    }

    const s = normalizeEnv(raw);

    if (s.startsWith("[")) {
        try {
            const arr = JSON.parse(s) as unknown;
            if (!Array.isArray(arr) || arr.some((n) => typeof n !== "number")) {
                return { ok: false, message: "JSON key must be an array of numbers (Solana keypair file format)." };
            }
            if (arr.length !== 64) {
                return {
                    ok: false,
                    message: `JSON key array must be 64 bytes (got ${arr.length}). Paste the full id.json array.`,
                };
            }
            return tryKeypairFromBytes(Uint8Array.from(arr));
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return { ok: false, message: `Could not parse JSON keypair: ${msg}` };
        }
    }

    if (/^[0-9a-fA-F]{128}$/.test(s)) {
        const bytes = new Uint8Array(64);
        for (let i = 0; i < 64; i++) {
            bytes[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
        }
        return tryKeypairFromBytes(bytes);
    }

    try {
        const b64 = Buffer.from(s, "base64");
        if (b64.length === 64) {
            return tryKeypairFromBytes(new Uint8Array(b64));
        }
    } catch {
        
    }

    try {
        const decoded = bs58.decode(s);
        if (decoded.length === 32) {
            return {
                ok: false,
                message:
                    "Key decodes to 32 bytes (typical for a public address). Use the wallet secret/private key or the full 64-byte secret from id.json — not the pubkey.",
            };
        }
        if (decoded.length !== 64) {
            return {
                ok: false,
                message: `After base58 decode, expected 64 secret bytes, got ${decoded.length}. Check SOLANA_FAUCET_SECRET_KEY.`,
            };
        }
        return tryKeypairFromBytes(decoded);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return {
            ok: false,
            message: `Could not decode key (base58): ${msg}. Use id.json contents, hex (128 chars), or base64 of 64 bytes.`,
        };
    }
}
