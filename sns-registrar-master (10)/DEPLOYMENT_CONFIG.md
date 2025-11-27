# SNS Registrar Deployment Configuration

## Deployment Details
- **Program ID**: `CHgtmD84n8CA2kvJaBMk3UZwvkMGGfptysJSd3AwVoE`
- **Network**: Solana Devnet
- **Deploy Slot**: 391827244
- **Program Size**: 297,000 bytes (290 KB)
- **Deployment Cost**: ~2.07 SOL

## Account Configuration
- **Authority/Owner**: `5Cnypn1cuYEL4GAWh3eAMe2Pn9YDQdEJdrr94sJVum5p`
- **Public Address**: `5Cnypn1cuYEL4GAWh3eAMe2Pn9YDQdEJdrr94sJVum5p`
- **Private Key**: `4LB6tHoyB7zHM1eix4KiwMYF9NA8zmiCm8NRtguTfQzTBYzLSmy7dk1JmYUEMWvryG2QiX48mTQkLDSq7J8YDiCN`
- **Keypair File**: `~/.config/solana/my-keypair.json`

## Network Configuration
- **RPC URL**: `https://api.devnet.solana.com`
- **WebSocket URL**: `wss://api.devnet.solana.com/`
- **Cluster**: devnet
- **Commitment**: confirmed

## Program Details
- **Program Data Address**: `BkdJmhqs1UwPSBCgTA5ZywCMGnQA8Cy6fQmfYqshvt1x`
- **Owner**: `BPFLoaderUpgradeab1e11111111111111111111111`
- **Features**: devnet (enabled)
- **Build**: Docker-based build with devnet features

## File Locations
- **Program Binary**: `target/deploy/sns_registrar.so`
- **Program Keypair**: `target/deploy/sns_registrar-keypair.json`
- **Anchor Config**: `Anchor.toml`
- **Source Code**: `src/lib.rs`

## Usage Instructions

### Connect to the Program
```javascript
const programId = new PublicKey("CHgtmD84n8CA2kvJaBMk3UZwvkMGGfptysJSd3AwVoE");
```

### CLI Commands
```bash
# Check program info
solana program show CHgtmD84n8CA2kvJaBMk3UZwvkMGGfptysJSd3AwVoE

# Set keypair
solana config set --keypair ~/.config/solana/my-keypair.json

# Check balance
solana balance 5Cnypn1cuYEL4GAWh3eAMe2Pn9YDQdEJdrr94sJVum5p
```

### Build Commands
```bash
# Build with Docker (recommended)
docker run -v "$(pwd):/workdir" sns_registrar cargo build-sbf --features devnet

# Deploy program
solana program deploy target/deploy/sns_registrar.so --program-id target/deploy/sns_registrar-keypair.json
```

## Environment Variables (for frontend/client)
```
REACT_APP_PROGRAM_ID=CHgtmD84n8CA2kvJaBMk3UZwvkMGGfptysJSd3AwVoE
REACT_APP_NETWORK=devnet
REACT_APP_RPC_URL=https://api.devnet.solana.com
```

## Next Steps
1. Test program functionality
2. Build frontend interface
3. Create domain registration interface
4. Test domain transfers and subdomain creation
5. Monitor program usage and performance

---
**Deployed on**: $(date)
**Status**: ✅ Successfully Deployed and Configured 