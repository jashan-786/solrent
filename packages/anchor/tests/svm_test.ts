import * as anchor from "@coral-xyz/anchor";
import { Program, Idl } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY, 
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAssociatedTokenAccount, 
  mintTo, 
  ASSOCIATED_TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { 
  getLeasePDA, 
  getVaultPDA, 
  getDelegatePDA, 
  getMetadataPDA, 
  getMasterEditionPDA,
  METAPLEX_PROGRAM_ID
} from "../src/index";
import { expect } from "chai";
import idl from "../idl/contract_solrent.json";

describe("SolRent SVM Integration Test", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = new Program(idl as any, provider);

  const landlord = Keypair.generate();
  const tenant = Keypair.generate();
  const unitId = BigInt(Math.floor(Math.random() * 1000000));
  const rentAmount = new anchor.BN(1000000); 

  let usdcMint: PublicKey;
  let tenantAta: PublicKey;
  let landlordAta: PublicKey;

  before(async () => {
    const solAirdrop = await provider.connection.requestAirdrop(landlord.publicKey, 2 * LAMPORTS_PER_SOL);
    const solAirdrop2 = await provider.connection.requestAirdrop(tenant.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(solAirdrop);
    await provider.connection.confirmTransaction(solAirdrop2);
    
    const payer = (provider.wallet as any).payer;
    usdcMint = await createMint(provider.connection, payer, payer.publicKey, null, 6);
    tenantAta = await createAssociatedTokenAccount(provider.connection, payer, usdcMint, tenant.publicKey);
    landlordAta = await createAssociatedTokenAccount(provider.connection, payer, usdcMint, landlord.publicKey);

    await mintTo(provider.connection, payer, usdcMint, tenantAta, payer, 5000000);
  });

  it("Initialize a Lease Agreement", async () => {
    const [leasePDA] = getLeasePDA(landlord.publicKey, tenant.publicKey, unitId);
    const [vaultPDA] = getVaultPDA(landlord.publicKey, unitId);

    const startDate = Math.floor(Date.now() / 1000) - 100;
    const endDate = startDate + (365 * 24 * 60 * 60);

    await (program.methods as any)
      .initializeLease(
        new anchor.BN(unitId.toString()),
        rentAmount,
        5, 
        new anchor.BN(startDate),
        new anchor.BN(endDate)
      )
      .accounts({
        landlord: landlord.publicKey,
        tenant: tenant.publicKey,
        lease: leasePDA,
        vault: vaultPDA,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([landlord])
      .rpc();

    const leaseAccount = await (program.account as any).lease.fetch(leasePDA);
    expect(leaseAccount.landlord.toBase58()).to.equal(landlord.publicKey.toBase58());
    expect(leaseAccount.rentAmount.toString()).to.equal(rentAmount.toString());
  });

  it("Approve Autopay Delegate", async () => {
    const [leasePDA] = getLeasePDA(landlord.publicKey, tenant.publicKey, unitId);
    const [delegatePDA] = getDelegatePDA(leasePDA, unitId);

    await (program.methods as any)
      .approveDelegate(new anchor.BN(unitId.toString()), rentAmount)
      .accounts({
        payer: tenant.publicKey,
        landlord: landlord.publicKey,
        tenant: tenant.publicKey,
        tenantAta: tenantAta,
        delegate: delegatePDA,
        lease: leasePDA,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([tenant])
      .rpc();

    const delegateAccount = await (program.account as any).permissionedDelegate.fetch(delegatePDA);
    expect(delegateAccount.lease.toBase58()).to.equal(leasePDA.toBase58());
  });

  it("Execute Manual Rent Payment & Mint Receipt NFT", async () => {
    const [leasePDA] = getLeasePDA(landlord.publicKey, tenant.publicKey, unitId);
    const [delegatePDA] = getDelegatePDA(leasePDA, unitId);

    const nftMint = Keypair.generate();
    const [nftTokenAccount] = PublicKey.findProgramAddressSync(
      [tenant.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), nftMint.publicKey.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const [metadataPDA] = getMetadataPDA(nftMint.publicKey);
    const [masterEditionPDA] = getMasterEditionPDA(nftMint.publicKey);

    await (program.methods as any)
      .executePayment(new anchor.BN(unitId.toString()), rentAmount)
      .accounts({
        payer: tenant.publicKey,
        landlord: landlord.publicKey,
        tenant: tenant.publicKey,
        landlordAta: landlordAta,
        tenantAta: tenantAta,
        lease: leasePDA,
        delegate: delegatePDA,
        mint: nftMint.publicKey,
        nftTokenAccount: nftTokenAccount,
        metadata: metadataPDA,
        masterEdition: masterEditionPDA,
        tokenMetadataProgram: METAPLEX_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as any)
      .signers([tenant, nftMint])
      .rpc();

    const landlordBalance = await provider.connection.getTokenAccountBalance(landlordAta);
    expect(Number(landlordBalance.value.amount)).to.be.at.least(Number(rentAmount));
    
    const nftBalance = await provider.connection.getTokenAccountBalance(nftTokenAccount);
    expect(nftBalance.value.amount).to.equal("1");
  });
});
