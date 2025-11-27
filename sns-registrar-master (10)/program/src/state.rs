use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct ReverseLookup {
    pub name: String,
    pub metadata_url: Option<String>, // New field for metadata URL
}
