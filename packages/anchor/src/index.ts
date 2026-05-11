import { Program, Idl, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
export { default as idl } from "../idl/contract_solrent.json";
import idl from "../idl/contract_solrent.json";

export const PROGRAM_ID = new PublicKey("FkrwjubsyZtMnyHAiop31wSUAEcdRnb3VpvADtMfw8Nw");

export function getProgram(provider: AnchorProvider) {
    const program = new Program(idl as Idl, provider);
    return program;
}

export const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const USDC_MINT_DEVNET_DEFAULT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
export const USDC_MINT_MAINNET_1 = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
export const USDC_MINT_MAINNET = new PublicKey("971ntPYNK6riaW9bmiatkQnAxSQsJAQubsjDG8LAMeRK");

export const PYUSD_MINT_FALLBACK = new PublicKey("CXk2CiS3qG9M9Sth55JqWv5YJmBf7pM9s3VfK8uS7qZ");

export type SolanaCluster = "devnet" | "testnet" | "mainnet-beta";

const inferClusterFromRpc = (rpcEndpoint?: string): SolanaCluster | undefined => {
    if (!rpcEndpoint) return undefined;
    const v = rpcEndpoint.toLowerCase();
    if (v.includes("devnet")) return "devnet";
    if (v.includes("testnet")) return "testnet";
    if (v.includes("mainnet")) return "mainnet-beta";
    return undefined;
};

export function getStablecoinMint(
    stablecoin: "USDC" | "PYUSD",
    opts?: { cluster?: SolanaCluster; rpcEndpoint?: string; overrideMint?: string }
) {
    const cluster = opts?.cluster || inferClusterFromRpc(opts?.rpcEndpoint) || "devnet";

    if (opts?.overrideMint) return new PublicKey(opts.overrideMint);

    const devnetUsdcOverride = (typeof process !== "undefined"
        ? (process.env.NEXT_PUBLIC_USDC_DEVNET_MINT || process.env.SOLANA_TEST_USDC_MINT)
        : undefined);

    if (stablecoin === "USDC") {
        if (cluster === "mainnet-beta") return USDC_MINT_MAINNET;
        if (devnetUsdcOverride) return new PublicKey(devnetUsdcOverride);
        return USDC_MINT_DEVNET_DEFAULT;
    }

    if (stablecoin === "PYUSD") {
        return PYUSD_MINT_FALLBACK;
    }

    return USDC_MINT_DEVNET_DEFAULT;
}

export function getStablecoinDecimals(
    stablecoin: "USDC" | "PYUSD",
    mint?: string | PublicKey
) {
    const mintStr = typeof mint === "string" ? mint : mint?.toBase58();

    if (mintStr === "3mY38dGsJrf5cq1UA3ZK6QpkDcprxaRiDq1GRWu74wXT") {
        return 6;
    }

    return 6;
}

const bigintToLeBytes = (value: bigint): Uint8Array => {
    const buf = new Uint8Array(8);
    let v = BigInt(value);
    for (let i = 0; i < 8; i++) {
        buf[i] = Number(v & 0xffn);
        v >>= 8n;
    }
    return buf;
};

export const getLeasePDA = (landlord: PublicKey, tenant: PublicKey, unitId: bigint) => {
    const unitIdBuffer = bigintToLeBytes(unitId);
    return PublicKey.findProgramAddressSync(
        [Buffer.from("lease"), landlord.toBuffer(), tenant.toBuffer(), Buffer.from(unitIdBuffer)],
        PROGRAM_ID
    );
};

export const getVaultPDA = (landlord: PublicKey, unitId: bigint) => {
    const unitIdBuffer = bigintToLeBytes(unitId);
    return PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), landlord.toBuffer(), Buffer.from(unitIdBuffer)],
        PROGRAM_ID
    );
};

export const getDelegatePDA = (leaseKey: PublicKey, unitId: bigint) => {
    const unitIdBuffer = bigintToLeBytes(unitId);
    return PublicKey.findProgramAddressSync(
        [Buffer.from("delegate"), leaseKey.toBuffer(), Buffer.from(unitIdBuffer)],
        PROGRAM_ID
    );
};

export const getMetadataPDA = (mint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        METAPLEX_PROGRAM_ID
    );
};

export const getMasterEditionPDA = (mint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("metadata"), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from("edition")],
        METAPLEX_PROGRAM_ID
    );
};
