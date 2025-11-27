const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const { Program, AnchorProvider, web3 } = require('@project-serum/anchor');

// Gorbchain Configuration
const GORBCHAIN_CONFIG = {
    RPC_ENDPOINT: 'https://rpc.gorbchain.xyz',
    WS_ENDPOINT: 'wss://rpc.gorbchain.xyz/ws/',
    PROGRAM_ID: 'CHgtmD84n8CA2kvJaBMk3UZwvkMGGfptysJSd3AwVoE',
    COMMITMENT: 'confirmed'
};

// Initialize connection to Gorbchain
const connection = new Connection(GORBCHAIN_CONFIG.RPC_ENDPOINT, {
    commitment: GORBCHAIN_CONFIG.COMMITMENT,
    wsEndpoint: GORBCHAIN_CONFIG.WS_ENDPOINT
});

// Program ID
const PROGRAM_ID = new PublicKey(GORBCHAIN_CONFIG.PROGRAM_ID);

// SNS Registrar Client Class
class SNSRegistrarClient {
    constructor(wallet) {
        this.connection = connection;
        this.programId = PROGRAM_ID;
        this.wallet = wallet;
        
        // Initialize provider
        this.provider = new AnchorProvider(
            this.connection,
            this.wallet,
            { commitment: GORBCHAIN_CONFIG.COMMITMENT }
        );
    }

    // Get program info
    async getProgramInfo() {
        try {
            const programInfo = await this.connection.getAccountInfo(this.programId);
            return {
                programId: this.programId.toString(),
                executable: programInfo?.executable || false,
                lamports: programInfo?.lamports || 0,
                owner: programInfo?.owner?.toString(),
                dataLength: programInfo?.data?.length || 0
            };
        } catch (error) {
            console.error('Error getting program info:', error);
            throw error;
        }
    }

    // Check if program is deployed
    async isProgramDeployed() {
        try {
            const programInfo = await this.connection.getAccountInfo(this.programId);
            return programInfo?.executable || false;
        } catch (error) {
            return false;
        }
    }

    // Get wallet balance
    async getBalance(publicKey) {
        try {
            const balance = await this.connection.getBalance(publicKey);
            return balance / web3.LAMPORTS_PER_SOL;
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    // Create domain instruction
    async createDomain(domainName, owner, feePayer, tokenMint, amount) {
        try {
            // This would contain the actual instruction creation logic
            // For now, returning a placeholder
            console.log(`Creating domain: ${domainName} for owner: ${owner.toString()}`);
            
            return {
                success: true,
                domainName,
                owner: owner.toString(),
                amount
            };
        } catch (error) {
            console.error('Error creating domain:', error);
            throw error;
        }
    }

    // Get domain info
    async getDomainInfo(domainName) {
        try {
            // This would query the domain account
            console.log(`Getting info for domain: ${domainName}`);
            
            return {
                domainName,
                exists: false, // Placeholder
                owner: null,
                creationTime: null
            };
        } catch (error) {
            console.error('Error getting domain info:', error);
            throw error;
        }
    }
}

// Export configuration and client
module.exports = {
    GORBCHAIN_CONFIG,
    SNSRegistrarClient,
    connection,
    PROGRAM_ID
};

// Example usage (if running directly)
if (require.main === module) {
    console.log('🚀 SNS Registrar Gorbchain Client');
    console.log('📡 RPC Endpoint:', GORBCHAIN_CONFIG.RPC_ENDPOINT);
    console.log('🔗 Program ID:', GORBCHAIN_CONFIG.PROGRAM_ID);
    console.log('');
    console.log('To use this client:');
    console.log('1. Import the SNSRegistrarClient class');
    console.log('2. Initialize with your wallet');
    console.log('3. Call methods to interact with the program');
} 