# SNS Registrar with Metadata URL Support

A Solana Name Service (SNS) Registrar program with enhanced metadata URL functionality, deployed on Gorbchain.

## 🚀 **Live Deployment**

- **Network**: Gorbchain
- **Program ID**: `CySCGJK9kNNqM2eQSW9hGQ1FCZ51ZHetRfGsTLY1TTe9`
- **RPC Endpoint**: `https://rpc.gorbchain.xyz`
- **WS Endpoint**: `wss://rpc.gorbchain.xyz/ws/`

## 🎯 **Features**

### **Core SNS Functionality**
- ✅ Domain registration and management
- ✅ Reverse lookup (address → domain name)
- ✅ Domain ownership transfer
- ✅ Subdomain support
- ✅ Payment processing with multiple tokens

### **Enhanced Metadata URL Support** ⭐ **NEW**
- ✅ **Metadata URL Storage**: Domains can store optional metadata URLs
- ✅ **Metadata Updates**: Update metadata URLs for existing domains
- ✅ **Backward Compatibility**: Existing domains work unchanged
- ✅ **Rich Domain Information**: Store profile data, business info, NFT metadata

## 📋 **New Instructions**

| Instruction ID | Name | Description |
|---|---|---|
| 13 | `Create` | Create domain with optional metadata URL |
| 14 | `UpdateMetadata` | Update metadata URL for existing domain |

## 🔧 **Installation & Setup**

### **Prerequisites**
- Rust 1.70+
- Solana CLI 1.18+
- Node.js 18+

### **Build Instructions**
```bash
# Clone the repository
git clone <your-repo-url>
cd sns-registrar

# Build the program
cargo build-sbf --features devnet

# Install Node.js dependencies
npm install
```

### **Deployment**
```bash
# Deploy to Gorbchain
node deploy-gorbchain-manual.js
```

## 🧪 **Testing**

### **Run All Tests**
```bash
# Basic functionality test
node test-metadata-functionality.js

# Detailed structure test
node detailed-metadata-test.js

# Real contract interaction test
node real-contract-test.js

# Transaction history
node transaction-history.js

# Domain operations
node domain-operations.js
```

## 📊 **Usage Examples**

### **Register Domain with Metadata**
```javascript
const domainName = "company.sol";
const metadataUrl = "https://arweave.net/company-metadata.json";

// Register domain with metadata
await snsClient.createDomainWithMetadata(domainName, metadataUrl);
```

### **Update Domain Metadata**
```javascript
const domainName = "company.sol";
const newMetadataUrl = "https://arweave.net/updated-company-metadata.json";

// Update metadata URL
await snsClient.updateMetadataUrl(domainName, newMetadataUrl);
```

### **Send Tokens to Domain**
```javascript
const domainName = "company.sol";
const amount = 0.1; // SOL

// Send tokens to domain (resolves to wallet address)
await snsClient.sendTokensToDomain(domainName, amount);
```

## 📁 **Project Structure**

```
sns-registrar/
├── src/
│   ├── lib.rs                 # Main program entry point
│   ├── state.rs               # Data structures (includes metadata_url)
│   ├── instruction_auto.rs    # Instruction definitions
│   ├── processor.rs           # Instruction router
│   ├── processor/
│   │   ├── create.rs          # Domain creation
│   │   ├── update_metadata.rs # NEW: Metadata updates
│   │   └── ...
│   ├── cpi.rs                 # Cross-program invocations
│   └── utils.rs               # Utility functions
├── tests/
├── scripts/
│   ├── deploy-gorbchain-manual.js
│   ├── test-metadata-functionality.js
│   ├── detailed-metadata-test.js
│   ├── real-contract-test.js
│   ├── transaction-history.js
│   └── domain-operations.js
└── docs/
```

## 🔗 **Transaction History**

### **Deployment Transaction**
- **Hash**: `63Y6KQxcLGU1H7ZTm624y6DHFRbJjTjuxo7mQsiY6BqdpN5PxRE2wceSBU7mMYaNzKjZoD6WyQFDAx9xVvHZJ2zP`
- **Date**: July 31, 2025
- **Status**: ✅ Success

### **Domain Operations**
- **Company.sol Registration**: Domain registered with metadata URL
- **Token Transfer**: 0.1 SOL sent to company.sol
- **Transaction**: `3ECd6Z6CGyUBdUp7tjedrEVJn8cYS6UeMKNDCWw2WVrJxYp3Gp6KpfKDnGYLgmbucux7PoNCSKYy1bygjpZYA8JQ`

## 📊 **Data Structures**

### **ReverseLookup with Metadata**
```rust
#[derive(BorshDeserialize, BorshSerialize)]
pub struct ReverseLookup {
    pub name: String,
    pub metadata_url: Option<String>, // NEW FIELD
}
```

### **Metadata URL Examples**
```json
{
  "domain": "company.sol",
  "metadata_url": "https://arweave.net/company-metadata.json",
  "description": "Business domain with company info"
}
```

## 🌐 **Supported Networks**

- ✅ **Gorbchain** (Primary deployment)
- 🔄 **Devnet** (Testing)
- 🔄 **Mainnet** (Future deployment)

## 🔒 **Security Features**

- ✅ Account ownership validation
- ✅ Signer verification
- ✅ Instruction parameter validation
- ✅ Cross-program invocation security
- ✅ Rent exemption handling

## 📈 **Performance**

- **Program Size**: 309,568 bytes
- **Rent Exemption**: 2.15548416 SOL
- **Transaction Fee**: ~0.00001 SOL
- **Response Time**: < 1 second

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

- **Issues**: Create an issue on GitHub
- **Documentation**: Check the docs/ folder
- **Testing**: Run the test scripts for verification

## 🎉 **Acknowledgments**

- Solana Labs for the SNS foundation
- Gorbchain for network support
- Community contributors

---

**Deployment Date**: July 31, 2025  
**Version**: 1.0.0 with Metadata URL Support  
**Status**: ✅ **LIVE ON GORBCHAIN** 