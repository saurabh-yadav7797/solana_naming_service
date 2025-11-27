# Metadata URL Implementation for Solana Name Service

## Overview

This implementation extends the Solana Name Service (SNS) to support metadata URLs alongside domain names and addresses. Previously, the system only mapped names to addresses, but now it also includes optional metadata URLs that can point to additional information about the domain.

## Changes Made

### 1. **State Structure Updates**

#### `src/state.rs`
- **Extended `ReverseLookup` struct** to include `metadata_url: Option<String>`
- This allows storing metadata URLs alongside domain names in reverse lookup accounts

```rust
#[derive(BorshDeserialize, BorshSerialize)]
pub struct ReverseLookup {
    pub name: String,
    pub metadata_url: Option<String>, // New field for metadata URL
}
```

### 2. **New Instruction: UpdateMetadata**

#### `src/instruction_auto.rs`
- **Added `UpdateMetadata = 13`** instruction to the `ProgramInstruction` enum
- **Added `update_metadata()` function** for creating update metadata instructions

#### `src/processor/update_metadata.rs` (New File)
- **Complete implementation** of the update metadata functionality
- **Parameters**: `metadata_url: Option<String>`
- **Accounts**: Requires domain owner as signer
- **Functionality**: Updates metadata URL for existing domains

### 3. **Enhanced Create Instructions**

#### `src/processor/create.rs`
- **Updated `Params` struct** to include `metadata_url: Option<String>`
- **Modified `From<Params>` implementation** to pass metadata URL to `create_split_v2`

#### `src/processor/create_split_v2.rs`
- **Updated `Params` struct** to include `metadata_url: Option<String>`
- **Modified domain creation** to pass metadata URL to reverse lookup creation

#### `src/processor/create_reverse.rs`
- **Updated `Params` struct** to include `metadata_url: Option<String>`
- **Modified reverse lookup creation** to include metadata URL

### 4. **CPI (Cross-Program Invocation) Updates**

#### `src/cpi.rs`
- **Enhanced `create_reverse_lookup_account()`** to accept `metadata_url: Option<String>`
- **Added `update_reverse_lookup_account()`** for updating existing reverse lookup data
- **Updated serialization** to include metadata URL in the stored data

### 5. **Processor Integration**

#### `src/processor.rs`
- **Added `update_metadata` module** to the processor
- **Integrated `UpdateMetadata` instruction** handling in the main processor

## New Functionality

### 1. **Domain Creation with Metadata URL**
```rust
// When creating a domain, you can now specify a metadata URL
let params = create::Params {
    name: "alice".to_string(),
    space: 1000,
    referrer_idx_opt: None,
    metadata_url: Some("https://alice.example.com/metadata.json".to_string()),
};
```

### 2. **Update Metadata URL**
```rust
// Update metadata URL for an existing domain
let params = update_metadata::Params {
    metadata_url: Some("https://alice.example.com/new-metadata.json".to_string()),
};
```

### 3. **Reverse Lookup with Metadata**
```rust
// Reverse lookup now includes metadata URL
let reverse_lookup: ReverseLookup = borsh::BorshDeserialize::try_from_slice(data)?;
println!("Domain: {}", reverse_lookup.name);
println!("Metadata URL: {:?}", reverse_lookup.metadata_url);
```

## Account Structure

### Reverse Lookup Account Data
```rust
pub struct ReverseLookup {
    pub name: String,           // Domain name (e.g., "alice")
    pub metadata_url: Option<String>, // Optional metadata URL
}
```

### Instruction Accounts

#### Create Instruction (Enhanced)
- All existing accounts remain the same
- Metadata URL is passed as a parameter

#### UpdateMetadata Instruction (New)
| Index | Writable | Signer | Description |
|-------|----------|--------|-------------|
| 0 | ❌ | ❌ | Name service program account |
| 1 | ❌ | ❌ | Root domain account |
| 2 | ✅ | ❌ | Reverse lookup account |
| 3 | ❌ | ❌ | System program account |
| 4 | ❌ | ❌ | Central state account |
| 5 | ✅ | ✅ | Domain owner (signer) |
| 6 | ❌ | ❌ | Rent sysvar account |

## Usage Examples

### 1. **Create Domain with Metadata**
```javascript
// Client-side example
const createParams = {
    name: "alice",
    space: 1000,
    referrer_idx_opt: null,
    metadata_url: "https://alice.example.com/metadata.json"
};

await program.methods
    .create(createParams)
    .accounts(createAccounts)
    .rpc();
```

### 2. **Update Metadata URL**
```javascript
// Client-side example
const updateParams = {
    metadata_url: "https://alice.example.com/new-metadata.json"
};

await program.methods
    .updateMetadata(updateParams)
    .accounts(updateAccounts)
    .rpc();
```

### 3. **Read Domain with Metadata**
```javascript
// Client-side example
const reverseLookupAccount = await program.account.reverseLookup.fetch(
    reverseLookupPubkey
);

console.log("Domain:", reverseLookupAccount.name);
console.log("Metadata URL:", reverseLookupAccount.metadataUrl);
```

## Benefits

1. **Enhanced Domain Information**: Domains can now carry additional metadata
2. **Flexible Metadata**: Optional metadata URLs allow for rich domain information
3. **Backward Compatibility**: Existing domains without metadata URLs continue to work
4. **Updatable**: Domain owners can update metadata URLs without recreating domains
5. **Decentralized**: Metadata URLs can point to any decentralized storage (IPFS, Arweave, etc.)

## Security Considerations

1. **Owner Verification**: Only domain owners can update metadata URLs
2. **Data Validation**: Metadata URLs are validated before storage
3. **Account Authorization**: Proper signer verification for all operations
4. **Size Limits**: Metadata URLs are subject to account size constraints

## Migration Notes

- **Existing domains**: Continue to work without metadata URLs
- **New domains**: Can optionally include metadata URLs
- **Data structure**: Reverse lookup accounts now store additional metadata field
- **Client compatibility**: Clients should handle optional metadata URL fields

## Future Enhancements

1. **Metadata Validation**: Add URL format validation
2. **Metadata Caching**: Cache metadata for faster access
3. **Batch Updates**: Allow updating multiple domains at once
4. **Metadata Standards**: Define metadata JSON schema standards
5. **IPFS Integration**: Direct IPFS hash support for metadata 