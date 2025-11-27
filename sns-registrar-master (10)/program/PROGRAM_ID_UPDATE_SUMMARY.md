# Program ID Update Summary

## New Program ID
**`7zUm8JKLHBUDNqD1f8W2upkybDdNTv43vPksKhY9bsFh`**

## Updated Files

### 1. `src/lib.rs`
- **Line 17**: Updated devnet program ID in `declare_id_with_central_state!` macro
- **Old ID**: `ELKRGJ7YFLMRS6WwAp9L4Ng9FFEtqASmFuvJVBFmhFB5`
- **New ID**: `7zUm8JKLHBUDNqD1f8W2upkybDdNTv43vPksKhY9bsFh`

### 2. `Anchor.toml`
- **Line 13**: Updated program ID in `[programs.devnet]` section
- **Old ID**: `ELKRGJ7YFLMRS6WwAp9L4Ng9FFEtqASmFuvJVBFmhFB5`
- **New ID**: `7zUm8JKLHBUDNqD1f8W2upkybDdNTv43vPksKhY9bsFh`

### 3. `target/deploy/sns_registrar-keypair-new.json`
- **New file**: Contains the secret key for the newly deployed program

## Deployment Details
- **Network**: Gorbchain
- **RPC Endpoint**: `https://rpc.gorbchain.xyz`
- **WS Endpoint**: `wss://rpc.gorbchain.xyz/ws/`
- **Transaction Signature**: `3Bfnzas3u3Ms2nSaWYWghqSyn5LxeaDj4yzxyL4x75TcohHGnMnYrzfyDNuVZGzKjYDx2pvZ9U17GjtuCai67yaC`
- **Deployment Date**: July 31, 2025

## Next Steps
1. ✅ Program deployed successfully
2. ✅ Program ID updated in configuration files
3. 🔄 Rebuild program with new ID (if needed)
4. 🔄 Test domain registration functionality
5. 🔄 Configure domain pricing for Gorbchain
6. 🔄 Build frontend interface

## Configuration
- **Cluster**: `https://rpc.gorbchain.xyz`
- **Wallet**: `~/.config/solana/my-keypair.json`
- **Features**: `devnet` 