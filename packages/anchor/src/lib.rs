use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Approve};
use anchor_spl::associated_token::AssociatedToken;
// Use the Anchor re-export for the Program ID
use anchor_spl::metadata::Metadata as Metaplex;

use anchor_spl::metadata::{
    create_metadata_accounts_v3, 
    CreateMetadataAccountsV3, 
    mpl_token_metadata::types::DataV2,
    create_master_edition_v3,
    CreateMasterEditionV3,
    
};



declare_id!("FkrwjubsyZtMnyHAiop31wSUAEcdRnb3VpvADtMfw8Nw");

#[error_code]
pub enum CustomError {
    #[msg("Auto-pay is disabled for this lease")]
    AutoPayDisabled,

    #[msg("Lease is not active")]
    LeaseNotActive,
}

#[program]
pub mod contract_solrent {
    use super::*;

    pub fn initialize_lease(
        ctx: Context<InitializeLease>, 
        unit_id: u64, 
        rent_amount: u64, 
        due_day: u8,
        start_date: i64,
        end_date: i64
    ) -> Result<()> {
        let lease = &mut ctx.accounts.lease;
        lease.landlord = *ctx.accounts.landlord.key;
        lease.tenant = *ctx.accounts.tenant.key;
        lease.unit_id = unit_id;
        lease.rent_amount = rent_amount;
        lease.due_day = due_day;
        lease.start_date = start_date;
        lease.end_date = end_date;
        
        
        let clock = Clock::get()?;
        lease.next_due_timestamp = start_date; 
        
        lease.status = 0; 
        lease.auto_pay_enabled = true;
        lease.bump = ctx.bumps.lease;
        
        msg!("Lease initialized: {}", unit_id);
        Ok(())
    }

    pub fn approve_delegate(
        ctx: Context<ApproveDelegate>,
        _unit_id: u64,
        amount: u64,
    ) -> Result<()> {

        let delegate_account = &mut ctx.accounts.delegate;
    delegate_account.lease = ctx.accounts.lease.key();
    delegate_account.bump = ctx.bumps.delegate; 

        token::approve(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Approve {
                    to: ctx.accounts.tenant_ata.to_account_info(),
                    delegate: ctx.accounts.delegate.to_account_info(), 
                    authority: ctx.accounts.tenant.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

   
    pub fn pay_manually(
        ctx: Context<PayManually>,
        unit_id: u64,
        amount: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let lease = &mut ctx.accounts.lease;

        
        require!(lease.rent_amount == amount, CustomError::LeaseNotActive);

       
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.tenant_ata.to_account_info(),
                    to: ctx.accounts.landlord_ata.to_account_info(),
                    authority: ctx.accounts.tenant.to_account_info(), 
                },
            ),
            amount,
        )?;

        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.nft_token_account.to_account_info(),
                    authority: ctx.accounts.tenant.to_account_info(),
                },
            ),
            1,
        )?;

        let data_v2 = DataV2 {
            name: format!("SolRent Receipt #{}", unit_id),
            symbol: "RENT".to_string(),
            uri: "https://your-arweave-link.json".to_string(),
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };

        let cpi_accounts = CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            mint_authority: ctx.accounts.tenant.to_account_info(),
            payer: ctx.accounts.tenant.to_account_info(),
            update_authority: ctx.accounts.tenant.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };

        create_metadata_accounts_v3(
            CpiContext::new(ctx.accounts.token_metadata_program.to_account_info(), cpi_accounts),
            data_v2,
            true,
            true,
            None
        )?;

        let master_edition_cpi_accounts = CreateMasterEditionV3 {
            edition: ctx.accounts.master_edition.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            update_authority: ctx.accounts.tenant.to_account_info(),
            mint_authority: ctx.accounts.tenant.to_account_info(),
            payer: ctx.accounts.tenant.to_account_info(),
            metadata: ctx.accounts.metadata.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };

        create_master_edition_v3(
            CpiContext::new(ctx.accounts.token_metadata_program.to_account_info(), master_edition_cpi_accounts),
            Some(0),
        )?;

        
        lease.next_due_timestamp = lease.next_due_timestamp.checked_add(2592000).unwrap();

        Ok(())
    }

   
    pub fn execute_payment(
        ctx: Context<ExecutePayment>,
        unit_id: u64,
        amount: u64,
    ) -> Result<()> {

   let clock = Clock::get()?;
    let lease = &mut ctx.accounts.lease;

    

      require!(
        clock.unix_timestamp >= lease.next_due_timestamp, 
        CustomError::LeaseNotActive 
    );
      require!(lease.rent_amount == amount, CustomError::LeaseNotActive);


        let lease_key = lease.key();
    let unit_bytes = unit_id.to_le_bytes();

    let seeds = &[
        b"delegate",
        lease_key.as_ref(),
        &unit_bytes,
        &[ctx.accounts.delegate.bump], 
    ];

    let signer_seeds = &[&seeds[..]];

        token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.tenant_ata.to_account_info(), 
                to: ctx.accounts.landlord_ata.to_account_info(), 
                authority: ctx.accounts.delegate.to_account_info(), 
            },
            signer_seeds,
        ),
        amount,
    )?;

    token::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.nft_token_account.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        ),
        1,
    )?;

    let data_v2 = DataV2 {
        name: format!("SolRent Receipt #{}", unit_id),
        symbol: "RENT".to_string(),
        uri: "https://your-arweave-link.json".to_string(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    let cpi_accounts = CreateMetadataAccountsV3 {
        metadata: ctx.accounts.metadata.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        mint_authority: ctx.accounts.payer.to_account_info(),
        payer: ctx.accounts.payer.to_account_info(),
        update_authority: ctx.accounts.payer.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };

    create_metadata_accounts_v3(
        CpiContext::new(ctx.accounts.token_metadata_program.to_account_info(), cpi_accounts),
        data_v2,
        true,
        true,
        None
    )?;

    let master_edition_cpi_accounts = CreateMasterEditionV3 {
    edition: ctx.accounts.master_edition.to_account_info(),
    mint: ctx.accounts.mint.to_account_info(),
    update_authority: ctx.accounts.payer.to_account_info(),
    mint_authority: ctx.accounts.payer.to_account_info(),
    payer: ctx.accounts.payer.to_account_info(),
    metadata: ctx.accounts.metadata.to_account_info(),
    token_program: ctx.accounts.token_program.to_account_info(),
    system_program: ctx.accounts.system_program.to_account_info(),
    rent: ctx.accounts.rent.to_account_info(),
};

create_master_edition_v3(
    CpiContext::new(ctx.accounts.token_metadata_program.to_account_info(), master_edition_cpi_accounts),
    Some(0), 
)?;

    lease.next_due_timestamp = lease.next_due_timestamp.checked_add(2592000).unwrap();


Ok(())
    }

        pub fn mint_receipt_nft(ctx: Context<MintReceiptNFT>, unit_id: u64) -> Result<()> {

  
    let data_v2 = DataV2 {
        name: format!("SolRent Receipt #{}", unit_id),
        symbol: "RENT".to_string(),
        uri: "https://your-arweave-link.json".to_string(), 
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    let cpi_accounts = CreateMetadataAccountsV3 {
        metadata: ctx.accounts.metadata.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        mint_authority: ctx.accounts.payer.to_account_info(),
        payer: ctx.accounts.payer.to_account_info(),
        update_authority: ctx.accounts.payer.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };

    create_metadata_accounts_v3(
        CpiContext::new(ctx.accounts.token_metadata_program.to_account_info(), cpi_accounts),
        data_v2,
        true, 
        true, 
        None 
    )?;

    Ok(())
}


}

#[derive(Accounts)]
#[instruction(unit_id: u64)]
pub struct InitializeLease<'info> {
    #[account(mut)]
    pub landlord: Signer<'info>,

    pub tenant: SystemAccount<'info>,

    #[account(
        init,
        payer = landlord,
        seeds = [b"lease", landlord.key().as_ref(), tenant.key().as_ref(), &unit_id.to_le_bytes()],
        bump,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1 + 32 + 32 + 32 + 1 + 1 + 1 + 8
    )]
    pub lease: Account<'info, Lease>,

    #[account(
        init,
        payer = landlord,
        seeds = [b"vault", landlord.key().as_ref(), &unit_id.to_le_bytes()],
        bump,
        space = 8 + 32 + 32 + 1
    )]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(unit_id: u64)]
pub struct ApproveDelegate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>, 


    pub landlord: SystemAccount<'info>,
    pub tenant: SystemAccount<'info>,

    #[account(mut)]
    pub tenant_ata: Account<'info, TokenAccount>,


    #[account(
        init_if_needed,
        payer = payer,
        seeds = [
            b"delegate",
            lease.key().as_ref(),
            &unit_id.to_le_bytes()
        ],
        bump,
        space = 8 + 32 + 32 + 1
    )]
    pub delegate: Account<'info, PermissionedDelegate>,

    

    #[account(
        mut,
        seeds = [b"lease", landlord.key().as_ref(), tenant.key().as_ref(), &unit_id.to_le_bytes()],
        bump
    )]
    pub lease: Account<'info, Lease>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(unit_id: u64)]
pub struct ExecutePayment<'info> {
    #[account(mut)]
    pub payer: Signer<'info>, 

    pub landlord: SystemAccount<'info>,
    pub tenant: SystemAccount<'info>,

    #[account(mut)]
    pub landlord_ata: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub tenant_ata: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [b"lease", landlord.key().as_ref(), tenant.key().as_ref(), &unit_id.to_le_bytes()],
        bump
    )]
    pub lease: Box<Account<'info, Lease>>,

    #[account(seeds = [b"delegate", lease.key().as_ref(), &unit_id.to_le_bytes()], bump)]
    pub delegate: Box<Account<'info, PermissionedDelegate>>,


    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer,
        mint::freeze_authority = payer,
    )]
    pub mint: Box<Account<'info, token::Mint>>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = tenant,
    )]
    pub nft_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: Metaplex PDA
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: Metaplex Master Edition PDA
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metaplex>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
#[derive(Accounts)]
#[instruction(unit_id: u64)]
pub struct MintReceiptNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>, 
    pub tenant: SystemAccount<'info>,
    
    /// CHECK: This is the metadata account for the NFT
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    /// CHECK: This is the master edition account for the NFT
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer,
        mint::freeze_authority = payer,
    )]
    pub mint: Account<'info, token::Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = tenant,
    )]
    pub token_account: Account<'info, TokenAccount>,

    pub token_metadata_program: Program<'info, Metaplex>, 
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct Lease {
    pub landlord: Pubkey,
    pub tenant: Pubkey,
    pub unit_id: u64,
    pub rent_amount: u64,
    pub start_date: i64,
    pub end_date: i64,
    pub due_day: u8,
    pub tenant_ata: Pubkey,
    pub landlord_ata: Pubkey,
    pub vault: Pubkey,
    pub auto_pay_enabled: bool,
    pub status: u8,
    pub bump: u8,
    pub next_due_timestamp: i64,
}

#[account]
pub struct PermissionedDelegate {
    pub lease: Pubkey,
    pub delegate: Pubkey,
    pub bump: u8,
}

#[account]
pub struct Vault {
    pub lease: Pubkey,
    pub token_account: Pubkey,
    pub bump: u8,
}

#[account]
pub struct ReceiptNFT {
    pub lease: Pubkey,
    pub payment_date: i64,
    pub amount: u64,
    pub bump: u8,
}

#[derive(Accounts)]
#[instruction(unit_id: u64)]
pub struct PayManually<'info> {
    #[account(mut)]
    pub tenant: Signer<'info>,

    pub landlord: SystemAccount<'info>,

    #[account(mut)]
    pub landlord_ata: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub tenant_ata: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [b"lease", landlord.key().as_ref(), tenant.key().as_ref(), &unit_id.to_le_bytes()],
        bump
    )]
    pub lease: Box<Account<'info, Lease>>,

    #[account(
        init,
        payer = tenant,
        mint::decimals = 0,
        mint::authority = tenant,
        mint::freeze_authority = tenant,
    )]
    pub mint: Box<Account<'info, token::Mint>>,

    #[account(
        init,
        payer = tenant,
        associated_token::mint = mint,
        associated_token::authority = tenant,
    )]
    pub nft_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: Metaplex PDA
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: Metaplex Master Edition PDA
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, Metaplex>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
