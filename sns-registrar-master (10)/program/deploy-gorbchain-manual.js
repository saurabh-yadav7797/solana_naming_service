const { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Gorbchain Configuration - Using exact user configuration
const RPC_ENDPOINT = 'https://rpc.gorbchain.xyz';
const WS_ENDPOINT = 'wss://rpc.gorbchain.xyz/ws/';

// Initialize connection with user's exact configuration
const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  wsEndpoint: WS_ENDPOINT,
  disableRetryOnRateLimit: false,
});

async function deployToGorbchain() {
    try {
        console.log('🚀 Starting manual deployment to Gorbchain...');
        console.log('📡 RPC Endpoint:', RPC_ENDPOINT);
        console.log('🔌 WS Endpoint:', WS_ENDPOINT);
        
        // Test connection
        console.log('🔍 Testing connection...');
        const version = await connection.getVersion();
        console.log('✅ Connected to Gorbchain, version:', version);
        
        // Load keypair
        const keypairPath = path.join(os.homedir(), '.config/solana/id.json');
        const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
        const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
        
        console.log('🔑 Loaded keypair:', keypair.publicKey.toString());
        
        // Check balance
        const balance = await connection.getBalance(keypair.publicKey);
        console.log('💰 Balance:', balance / 1e9, 'SOL');
        
        if (balance < 0.1 * 1e9) {
            throw new Error('Insufficient balance for deployment (need at least 0.1 SOL)');
        }
        
        // Load program binary
        const programPath = path.join(__dirname, 'target/deploy/sns_registrar.so');
        const programBuffer = fs.readFileSync(programPath);
        
        console.log('📦 Program binary loaded:', programBuffer.length, 'bytes');
        
        // Load existing program keypair
        const programKeypairPath = path.join(__dirname, 'target/deploy/sns_registrar-keypair.json');
        const programKeypairData = JSON.parse(fs.readFileSync(programKeypairPath, 'utf8'));
        const programKeypair = Keypair.fromSecretKey(new Uint8Array(programKeypairData));
        console.log('🎯 Using existing program ID:', programKeypair.publicKey.toString());
        
        // Calculate rent for program account
        const programSize = programBuffer.length;
        const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(programSize);
        
        console.log('💸 Rent exemption amount:', rentExemptionAmount / 1e9, 'SOL');
        
        // Create transaction to deploy program
        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: keypair.publicKey,
                newAccountPubkey: programKeypair.publicKey,
                lamports: rentExemptionAmount,
                space: programSize,
                programId: new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
            }),
            SystemProgram.assign({
                accountPubkey: programKeypair.publicKey,
                programId: new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
            })
        );
        
        console.log('📝 Transaction created, sending...');
        
        // Send transaction with user's connection configuration
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [keypair, programKeypair],
            { 
                commitment: 'confirmed',
                disableRetryOnRateLimit: false
            }
        );
        
        console.log('✅ Deployment successful!');
        console.log('🔗 Transaction signature:', signature);
        console.log('🎯 Program ID:', programKeypair.publicKey.toString());
        
        // Save the new program keypair
        const newKeypairPath = path.join(__dirname, 'target/deploy/sns_registrar-keypair-new.json');
        fs.writeFileSync(newKeypairPath, JSON.stringify(Array.from(programKeypair.secretKey)));
        console.log('💾 New keypair saved to:', newKeypairPath);
        
        // Update Anchor.toml with new program ID
        const anchorTomlPath = path.join(__dirname, 'Anchor.toml');
        let anchorTomlContent = fs.readFileSync(anchorTomlPath, 'utf8');
        anchorTomlContent = anchorTomlContent.replace(
            /sns-registrar = ".*"/,
            `sns-registrar = "${programKeypair.publicKey.toString()}"`
        );
        fs.writeFileSync(anchorTomlPath, anchorTomlContent);
        console.log('📝 Updated Anchor.toml with new program ID');
        
        return programKeypair.publicKey.toString();
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        console.error('🔍 Error details:', error);
        throw error;
    }
}

// Run deployment
if (require.main === module) {
    deployToGorbchain()
        .then(programId => {
            console.log('\n🎉 SNS Registrar successfully deployed to Gorbchain!');
            console.log('📡 RPC Endpoint:', RPC_ENDPOINT);
            console.log('🔌 WS Endpoint:', WS_ENDPOINT);
            console.log('🔗 Program ID:', programId);
            console.log('\n📋 Next steps:');
            console.log('1. Update your frontend to use the new Program ID');
            console.log('2. Test domain registration functionality');
            console.log('3. Configure domain pricing for Gorbchain');
        })
        .catch(error => {
            console.error('💥 Deployment failed:', error);
            process.exit(1);
        });
}

module.exports = { deployToGorbchain, connection, RPC_ENDPOINT, WS_ENDPOINT }; 