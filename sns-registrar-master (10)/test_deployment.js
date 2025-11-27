const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');

// Configuration
const PROGRAM_ID = 'CHgtmD84n8CA2kvJaBMk3UZwvkMGGfptysJSd3AwVoE';
const NETWORK = 'devnet';

async function testDeployment() {
    console.log('Testing SNS Registrar Deployment...');
    
    try {
        // Connect to devnet
        const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');
        console.log('Connected to', NETWORK);
        
        // Test program ID
        const programId = new PublicKey(PROGRAM_ID);
        console.log('Program ID:', programId.toString());
        
        // Get program account info
        const programInfo = await connection.getAccountInfo(programId);
        
        if (programInfo) {
            console.log('Program found!');
            console.log('Program owner:', programInfo.owner.toString());
            console.log('Data length:', programInfo.data.length, 'bytes');
            console.log('Lamports:', programInfo.lamports / 1e9, 'SOL');
            console.log('Executable:', programInfo.executable);
        } else {
            console.log('Program not found!');
            return;
        }
        
        // Test wallet address
        const walletAddress = new PublicKey('5Cnypn1cuYEL4GAWh3eAMe2Pn9YDQdEJdrr94sJVum5p');
        const walletBalance = await connection.getBalance(walletAddress);
        console.log('Wallet:', walletAddress.toString());
        console.log('Balance:', walletBalance / 1e9, 'SOL');
        
        console.log('Deployment test completed successfully!');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run the test
testDeployment(); 