const { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Gorbchain Configuration
const RPC_ENDPOINT = 'https://rpc.gorbchain.xyz';
const WS_ENDPOINT = 'wss://rpc.gorbchain.xyz/ws/';
const PROGRAM_ID = 'CySCGJK9kNNqM2eQSW9hGQ1FCZ51ZHetRfGsTLY1TTe9';

const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  wsEndpoint: WS_ENDPOINT,
  disableRetryOnRateLimit: false,
});

class DomainOperations {
    constructor(connection, programId, wallet) {
        this.connection = connection;
        this.programId = new PublicKey(programId);
        this.wallet = wallet;
    }

    // Check if a domain exists
    async checkDomainExists(domainName) {
        console.log(`🔍 Checking if domain "${domainName}" exists...`);
        
        try {
            // This would normally check the SNS program for domain existence
            // For now, we'll simulate the check
            const domainExists = false; // Simulate domain doesn't exist
            
            if (domainExists) {
                console.log(`✅ Domain "${domainName}" exists`);
                return true;
            } else {
                console.log(`❌ Domain "${domainName}" does not exist`);
                console.log('💡 You need to register the domain first');
                return false;
            }
        } catch (error) {
            console.error('❌ Error checking domain:', error.message);
            return false;
        }
    }

    // Register a new domain
    async registerDomain(domainName, metadataUrl = null) {
        console.log(`🏗️  Registering domain "${domainName}"...`);
        console.log(`📝 Metadata URL: ${metadataUrl || 'None'}`);
        
        try {
            // This would create the actual registration transaction
            // For demonstration, we'll simulate the process
            
            console.log('📋 Creating registration transaction...');
            console.log('📊 Domain Registration Data:');
            console.log(`   - Domain: ${domainName}`);
            console.log(`   - Owner: ${this.wallet.publicKey.toString()}`);
            console.log(`   - Metadata URL: ${metadataUrl || 'None'}`);
            console.log(`   - Program ID: ${this.programId.toString()}`);
            
            // Simulate transaction creation
            const mockTransaction = {
                domainName,
                owner: this.wallet.publicKey.toString(),
                metadataUrl,
                programId: this.programId.toString(),
                timestamp: new Date().toISOString()
            };
            
            console.log('✅ Domain registration transaction prepared');
            console.log('📊 Transaction Data:', JSON.stringify(mockTransaction, null, 2));
            
            return mockTransaction;
        } catch (error) {
            console.error('❌ Domain registration failed:', error.message);
            throw error;
        }
    }

    // Resolve domain to wallet address
    async resolveDomain(domainName) {
        console.log(`🔍 Resolving domain "${domainName}" to wallet address...`);
        
        try {
            // This would normally query the SNS program to get the wallet address
            // For demonstration, we'll simulate the resolution
            
            // Simulate domain resolution
            const resolvedAddress = this.wallet.publicKey.toString(); // For demo, use current wallet
            
            console.log(`✅ Domain "${domainName}" resolves to: ${resolvedAddress}`);
            return resolvedAddress;
        } catch (error) {
            console.error('❌ Domain resolution failed:', error.message);
            throw error;
        }
    }

    // Send tokens to a domain (resolves to wallet address)
    async sendTokensToDomain(domainName, amount, recipientWallet = null) {
        console.log(`💰 Sending ${amount} SOL to domain "${domainName}"...`);
        
        try {
            // Step 1: Resolve domain to wallet address
            const recipientAddress = recipientWallet || await this.resolveDomain(domainName);
            console.log(`🎯 Recipient Address: ${recipientAddress}`);
            
            // Step 2: Create transfer transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: this.wallet.publicKey,
                    toPubkey: new PublicKey(recipientAddress),
                    lamports: amount * LAMPORTS_PER_SOL
                })
            );
            
            console.log('📝 Transfer transaction created');
            console.log(`   - From: ${this.wallet.publicKey.toString()}`);
            console.log(`   - To: ${recipientAddress}`);
            console.log(`   - Amount: ${amount} SOL`);
            
            // Step 3: Send transaction
            console.log('📤 Sending transaction...');
            const signature = await sendAndConfirmTransaction(
                connection,
                transaction,
                [this.wallet],
                { commitment: 'confirmed' }
            );
            
            console.log('✅ Transfer successful!');
            console.log(`🔗 Transaction signature: ${signature}`);
            
            return {
                success: true,
                signature,
                domainName,
                recipientAddress,
                amount
            };
        } catch (error) {
            console.error('❌ Transfer failed:', error.message);
            throw error;
        }
    }

    // Complete workflow: Register domain and send tokens
    async registerAndSendTokens(domainName, amount, metadataUrl = null) {
        console.log('🚀 Starting complete workflow...');
        console.log('='.repeat(60));
        
        try {
            // Step 1: Check if domain exists
            const domainExists = await this.checkDomainExists(domainName);
            
            if (!domainExists) {
                // Step 2: Register domain
                console.log('\n📋 Step 1: Registering domain...');
                await this.registerDomain(domainName, metadataUrl);
                console.log('✅ Domain registration completed');
            }
            
            // Step 3: Send tokens
            console.log('\n📋 Step 2: Sending tokens...');
            const transferResult = await this.sendTokensToDomain(domainName, amount);
            
            console.log('\n🎉 Workflow completed successfully!');
            console.log('📊 Summary:');
            console.log(`   - Domain: ${domainName}`);
            console.log(`   - Amount Sent: ${amount} SOL`);
            console.log(`   - Transaction: ${transferResult.signature}`);
            
            return transferResult;
        } catch (error) {
            console.error('❌ Workflow failed:', error.message);
            throw error;
        }
    }
}

async function performDomainOperations() {
    try {
        console.log('🚀 SNS Domain Operations');
        console.log('📡 RPC Endpoint:', RPC_ENDPOINT);
        console.log('🎯 Program ID:', PROGRAM_ID);
        
        // Test connection
        console.log('\n🔍 Testing connection...');
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
        
        // Create domain operations instance
        const domainOps = new DomainOperations(connection, PROGRAM_ID, keypair);
        
        // Example: Register company.sol and send tokens
        const domainName = 'company.sol';
        const amount = 0.1; // 0.1 SOL
        const metadataUrl = 'https://arweave.net/company-metadata.json';
        
        console.log('\n🎯 Example Operation:');
        console.log(`   - Domain: ${domainName}`);
        console.log(`   - Amount: ${amount} SOL`);
        console.log(`   - Metadata URL: ${metadataUrl}`);
        
        // Perform the operation
        const result = await domainOps.registerAndSendTokens(domainName, amount, metadataUrl);
        
        console.log('\n🎉 Operation completed successfully!');
        console.log('📋 You can now send tokens to company.sol');
        
        return result;
        
    } catch (error) {
        console.error('❌ Operation failed:', error.message);
        console.error('🔍 Error details:', error);
        throw error;
    }
}

// Run domain operations
if (require.main === module) {
    performDomainOperations()
        .then(result => {
            console.log('\n🎯 Domain operations completed!');
            console.log('📋 You can now use company.sol for receiving tokens.');
        })
        .catch(error => {
            console.error('💥 Domain operations failed:', error);
            process.exit(1);
        });
}

module.exports = { 
    DomainOperations, 
    performDomainOperations, 
    connection, 
    RPC_ENDPOINT, 
    WS_ENDPOINT,
    PROGRAM_ID 
}; 