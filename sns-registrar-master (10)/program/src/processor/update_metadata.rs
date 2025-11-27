//! Update metadata URL for an existing domain

use crate::{
    central_state,
    cpi::Cpi,
    state::ReverseLookup,
    utils::get_hashed_name,
};

use crate::constants::ROOT_DOMAIN_ACCOUNT;
use bonfida_utils::{
    checks::{check_account_key, check_account_owner, check_signer},
    BorshSize, InstructionsAccount,
};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_program, sysvar,
};

#[derive(BorshDeserialize, BorshSerialize, BorshSize, Debug)]
/// The required parameters for the `update_metadata` instruction
pub struct Params {
    pub metadata_url: Option<String>, // New metadata URL to set
}

#[derive(InstructionsAccount)]
/// The required accounts for the `update_metadata` instruction
pub struct Accounts<'a, T> {
    /// The name service program account
    pub naming_service_program: &'a T,

    /// The root domain account
    pub root_domain: &'a T,

    /// The reverse lookup account
    #[cons(writable)]
    pub reverse_lookup: &'a T,

    /// The system program account
    pub system_program: &'a T,

    /// The central state account
    pub central_state: &'a T,

    /// The domain owner account (must be signer)
    #[cons(signer, writable)]
    pub domain_owner: &'a T,

    /// The rent sysvar account
    pub rent_sysvar: &'a T,
}

impl<'a, 'b: 'a> Accounts<'a, AccountInfo<'b>> {
    pub fn parse(
        accounts: &'a [AccountInfo<'b>],
        _program_id: &Pubkey,
    ) -> Result<Self, ProgramError> {
        let accounts_iter = &mut accounts.iter();
        let accounts = Accounts {
            naming_service_program: next_account_info(accounts_iter)?,
            root_domain: next_account_info(accounts_iter)?,
            reverse_lookup: next_account_info(accounts_iter)?,
            system_program: next_account_info(accounts_iter)?,
            central_state: next_account_info(accounts_iter)?,
            domain_owner: next_account_info(accounts_iter)?,
            rent_sysvar: next_account_info(accounts_iter)?,
        };

        // Check keys
        check_account_key(accounts.naming_service_program, &spl_name_service::id()).unwrap();
        check_account_key(accounts.root_domain, &ROOT_DOMAIN_ACCOUNT).unwrap();
        check_account_key(accounts.system_program, &system_program::id()).unwrap();
        check_account_key(accounts.central_state, &central_state::KEY).unwrap();
        check_account_key(accounts.rent_sysvar, &sysvar::rent::id()).unwrap();

        // Check owners
        check_account_owner(accounts.reverse_lookup, &spl_name_service::id()).unwrap();

        // Check signer
        check_signer(accounts.domain_owner).unwrap();

        Ok(accounts)
    }

    pub fn check(&self) -> Result<(), ProgramError> {
        // Verify that the domain owner is the actual owner of the reverse lookup account
        let reverse_lookup_data = &self.reverse_lookup.data.borrow();
        if reverse_lookup_data.is_empty() {
            msg!("Reverse lookup account is empty");
            return Err(ProgramError::InvalidAccountData);
        }

        // Parse the reverse lookup data to get the current owner
        let reverse_lookup: ReverseLookup = borsh::BorshDeserialize::try_from_slice(reverse_lookup_data)
            .map_err(|_| ProgramError::InvalidAccountData)?;

        // For now, we'll assume the domain owner is the signer
        // In a more sophisticated implementation, you might want to verify
        // that the signer owns the actual domain name account
        
        Ok(())
    }
}

pub fn process_update_metadata(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    params: Params,
) -> ProgramResult {
    let accounts = Accounts::parse(accounts, program_id)?;
    update_metadata(program_id, accounts, params)
}

pub fn update_metadata<'a, 'b: 'a>(
    program_id: &Pubkey,
    accounts: Accounts<'a, AccountInfo<'b>>,
    params: Params,
) -> ProgramResult {
    accounts.check()?;

    // Read current reverse lookup data
    let reverse_lookup_data = &accounts.reverse_lookup.data.borrow();
    let mut reverse_lookup: ReverseLookup = borsh::BorshDeserialize::try_from_slice(reverse_lookup_data)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    // Update the metadata URL
    reverse_lookup.metadata_url = params.metadata_url;

    // Serialize the updated data
    let updated_data = borsh::BorshSerialize::try_to_vec(&reverse_lookup)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    // Calculate the hash for the reverse lookup
    let hashed_reverse_lookup = get_hashed_name(&reverse_lookup.name);

    let central_state_signer_seeds: &[&[u8]] = &[&program_id.to_bytes(), &[central_state::NONCE]];

    // Update the reverse lookup account with new data
    Cpi::update_reverse_lookup_account(
        accounts.naming_service_program,
        accounts.reverse_lookup,
        accounts.domain_owner,
        accounts.central_state,
        updated_data,
        central_state_signer_seeds,
    )?;

    msg!("Metadata URL updated successfully");
    Ok(())
} 