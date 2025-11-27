#!/bin/bash

# Gorbchain Deployment Script for SNS Registrar
echo "🚀 Starting SNS Registrar deployment to Gorbchain..."

# Set Gorbchain RPC endpoints
export RPC_ENDPOINT="https://rpc.gorbchain.xyz"
export WS_ENDPOINT="wss://rpc.gorbchain.xyz/ws/"

# Configure Solana CLI for Gorbchain
echo "📡 Configuring Solana CLI for Gorbchain..."
solana config set --url $RPC_ENDPOINT

# Check if keypair exists
if [ ! -f ~/.config/solana/my-keypair.json ]; then
    echo "❌ Keypair not found at ~/.config/solana/my-keypair.json"
    echo "Please create a keypair first:"
    echo "solana-keygen new --outfile ~/.config/solana/my-keypair.json"
    exit 1
fi

# Set the keypair
solana config set --keypair ~/.config/solana/my-keypair.json

# Check balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance)
echo "Current balance: $BALANCE"

# Build the program with Gorbchain features
echo "🔨 Building program for Gorbchain..."
cd program

# Build with devnet features (we'll adapt for Gorbchain)
cargo build-sbf --features devnet --release

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy the program
echo "🚀 Deploying program to Gorbchain..."
PROGRAM_PATH="target/deploy/sns_registrar.so"
KEYPAIR_PATH="target/deploy/sns_registrar-keypair.json"

# Deploy using the program
solana program deploy $PROGRAM_PATH --program-id $KEYPAIR_PATH

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    
    # Get the program ID
    PROGRAM_ID=$(solana address -k $KEYPAIR_PATH)
    echo "🎯 Program ID: $PROGRAM_ID"
    
    # Verify deployment
    echo "🔍 Verifying deployment..."
    solana program show $PROGRAM_ID
    
    echo ""
    echo "🎉 SNS Registrar successfully deployed to Gorbchain!"
    echo "📡 RPC Endpoint: $RPC_ENDPOINT"
    echo "🔗 Program ID: $PROGRAM_ID"
    echo ""
    echo "Next steps:"
    echo "1. Update your frontend to use the new Program ID"
    echo "2. Test domain registration functionality"
    echo "3. Configure domain pricing for Gorbchain"
    
else
    echo "❌ Deployment failed!"
    exit 1
fi 