const { Connection, PublicKey } = require('@solana/web3.js');

// Gorbchain Configuration
const RPC_ENDPOINT = 'https://rpc.gorbchain.xyz';
const WS_ENDPOINT = 'wss://rpc.gorbchain.xyz/ws/';
const PROGRAM_ID = 'CySCGJK9kNNqM2eQSW9hGQ1FCZ51ZHetRfGsTLY1TTe9';

const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
  wsEndpoint: WS_ENDPOINT,
  disableRetryOnRateLimit: false,
});

class TransactionHistory {
    constructor(connection, programId) {
        this.connection = connection;
        this.programId = new PublicKey(programId);
    }

    // Get all transactions for the program
    async getAllTransactions() {
        console.log('🔍 Fetching all transactions for SNS Program...');
        console.log('🎯 Program ID:', this.programId.toString());
        
        try {
            // Get all signatures for the program
            const signatures = await this.connection.getSignaturesForAddress(
                this.programId,
                { limit: 20 } // Get more transactions
            );
            
            console.log(`📊 Found ${signatures.length} transactions`);
            console.log('='.repeat(80));
            
            const transactions = [];
            
            for (let i = 0; i < signatures.length; i++) {
                const sig = signatures[i];
                console.log(`\n🔗 Transaction ${i + 1}:`);
                console.log(`   📝 Hash: ${sig.signature}`);
                console.log(`   📅 Date: ${new Date(sig.blockTime * 1000).toISOString()}`);
                console.log(`   ✅ Status: ${sig.err ? '❌ Failed' : '✅ Success'}`);
                console.log(`   💰 Fee: ${sig.fee ? sig.fee / 1e9 + ' SOL' : 'Unknown'}`);
                
                // Get detailed transaction info
                try {
                    const tx = await this.connection.getTransaction(sig.signature, {
                        commitment: 'confirmed',
                        maxSupportedTransactionVersion: 0
                    });
                    
                    if (tx && tx.meta) {
                        console.log(`   📋 Log Messages: ${tx.meta.logMessages ? tx.meta.logMessages.length : 0}`);
                        
                        // Show first few log messages
                        if (tx.meta.logMessages && tx.meta.logMessages.length > 0) {
                            console.log('   📝 Logs:');
                            tx.meta.logMessages.slice(0, 5).forEach((log, idx) => {
                                console.log(`      ${idx + 1}. ${log}`);
                            });
                        }
                        
                        // Show account changes
                        if (tx.meta.postTokenBalances && tx.meta.postTokenBalances.length > 0) {
                            console.log(`   💰 Token Changes: ${tx.meta.postTokenBalances.length} accounts`);
                        }
                    }
                } catch (err) {
                    console.log(`   ⚠️  Could not fetch details: ${err.message}`);
                }
                
                transactions.push({
                    signature: sig.signature,
                    blockTime: sig.blockTime,
                    status: sig.err ? 'Failed' : 'Success',
                    fee: sig.fee
                });
                
                console.log('   ' + '-'.repeat(60));
            }
            
            return transactions;
        } catch (error) {
            console.error('❌ Failed to get transactions:', error.message);
            throw error;
        }
    }

    // Get specific transaction details
    async getTransactionDetails(signature) {
        console.log(`\n🔍 Getting details for transaction: ${signature}`);
        
        try {
            const tx = await this.connection.getTransaction(signature, {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0
            });
            
            if (!tx) {
                console.log('❌ Transaction not found');
                return null;
            }
            
            console.log('📊 Transaction Details:');
            console.log(`   📝 Signature: ${signature}`);
            console.log(`   📅 Block Time: ${new Date(tx.blockTime * 1000).toISOString()}`);
            console.log(`   ✅ Status: ${tx.meta.err ? '❌ Failed' : '✅ Success'}`);
            console.log(`   💰 Fee: ${tx.meta.fee / 1e9} SOL`);
            console.log(`   📋 Instructions: ${tx.transaction.message.instructions.length}`);
            
            // Show all log messages
            if (tx.meta.logMessages && tx.meta.logMessages.length > 0) {
                console.log('\n📝 All Log Messages:');
                tx.meta.logMessages.forEach((log, idx) => {
                    console.log(`   ${idx + 1}. ${log}`);
                });
            }
            
            // Show account changes
            if (tx.meta.preBalances && tx.meta.postBalances) {
                console.log('\n💰 Account Balance Changes:');
                tx.transaction.message.accountKeys.forEach((key, idx) => {
                    const preBalance = tx.meta.preBalances[idx] / 1e9;
                    const postBalance = tx.meta.postBalances[idx] / 1e9;
                    const change = postBalance - preBalance;
                    
                    if (change !== 0) {
                        console.log(`   ${key.toString()}: ${preBalance} → ${postBalance} (${change > 0 ? '+' : ''}${change.toFixed(9)} SOL)`);
                    }
                });
            }
            
            return tx;
        } catch (error) {
            console.error('❌ Failed to get transaction details:', error.message);
            throw error;
        }
    }

    // Show deployment transaction specifically
    async showDeploymentTransaction() {
        console.log('\n🚀 DEPLOYMENT TRANSACTION DETAILS');
        console.log('='.repeat(60));
        
        // The deployment transaction hash from our deployment
        const deploymentSignature = '63Y6KQxcLGU1H7ZTm624y6DHFRbJjTjuxo7mQsiY6BqdpN5PxRE2wceSBU7mMYaNzKjZoD6WyQFDAx9xVvHZJ2zP';
        
        console.log('📝 Deployment Transaction Hash:');
        console.log(`🔗 ${deploymentSignature}`);
        console.log('\n📊 Deployment Details:');
        console.log('   - Network: Gorbchain');
        console.log('   - Program ID: CySCGJK9kNNqM2eQSW9hGQ1FCZ51ZHetRfGsTLY1TTe9');
        console.log('   - Date: July 31, 2025');
        console.log('   - Status: ✅ Success');
        
        // Get detailed deployment transaction info
        await this.getTransactionDetails(deploymentSignature);
    }

    // Show transaction summary
    async showTransactionSummary() {
        console.log('\n📊 TRANSACTION SUMMARY');
        console.log('='.repeat(60));
        
        const transactions = await this.getAllTransactions();
        
        console.log('\n🎯 Summary:');
        console.log(`   📊 Total Transactions: ${transactions.length}`);
        console.log(`   ✅ Successful: ${transactions.filter(tx => tx.status === 'Success').length}`);
        console.log(`   ❌ Failed: ${transactions.filter(tx => tx.status === 'Failed').length}`);
        
        if (transactions.length > 0) {
            const latestTx = transactions[0];
            console.log(`   🔗 Latest Transaction: ${latestTx.signature}`);
            console.log(`   📅 Latest Date: ${new Date(latestTx.blockTime * 1000).toISOString()}`);
        }
        
        return transactions;
    }
}

async function showTransactionHistory() {
    try {
        console.log('🚀 SNS Program Transaction History');
        console.log('📡 RPC Endpoint:', RPC_ENDPOINT);
        console.log('🎯 Program ID:', PROGRAM_ID);
        
        // Test connection
        console.log('\n🔍 Testing connection...');
        const version = await connection.getVersion();
        console.log('✅ Connected to Gorbchain, version:', version);
        
        // Create transaction history viewer
        const history = new TransactionHistory(connection, PROGRAM_ID);
        
        // Show deployment transaction
        await history.showDeploymentTransaction();
        
        // Show all transactions
        await history.showTransactionSummary();
        
        console.log('\n🎉 Transaction history retrieved successfully!');
        console.log('📋 All transaction hashes are displayed above.');
        
    } catch (error) {
        console.error('❌ Failed to get transaction history:', error.message);
        console.error('🔍 Error details:', error);
        throw error;
    }
}

// Run transaction history
if (require.main === module) {
    showTransactionHistory()
        .then(() => {
            console.log('\n🎯 Transaction history completed!');
            console.log('📋 You can use these transaction hashes to verify the deployment on blockchain explorers.');
        })
        .catch(error => {
            console.error('💥 Transaction history failed:', error);
            process.exit(1);
        });
}

module.exports = { 
    TransactionHistory, 
    showTransactionHistory, 
    connection, 
    RPC_ENDPOINT, 
    WS_ENDPOINT,
    PROGRAM_ID 
}; 