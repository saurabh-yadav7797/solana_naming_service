const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const os = require('os'); // Added missing import for os

const GORBCHAIN_CONFIG = {
    RPC_ENDPOINT: 'https://rpc.gorbchain.xyz',
    WS_ENDPOINT: 'wss://rpc.gorbchain.xyz/ws/',
    PROGRAM_ID: 'CySCGJK9kNNqM2eQSW9hGQ1FCZ51ZHetRfGsTLY1TTe9',
    COMMITMENT: 'confirmed'
};

const connection = new Connection(GORBCHAIN_CONFIG.RPC_ENDPOINT, {
    commitment: GORBCHAIN_CONFIG.COMMITMENT,
    wsEndpoint: GORBCHAIN_CONFIG.WS_ENDPOINT,
    disableRetryOnRateLimit: false,
});

async function createNewAccountAndSendSol() {
    console.log('🚀 Starting new account creation and SOL transfer process...\n');

    try {
        // 1. Load the company keypair (owner of company.sol)
        const companyKeypairPath = path.join(os.homedir(), '.config/solana/id.json');
        const companyKeypairData = JSON.parse(fs.readFileSync(companyKeypairPath, 'utf8'));
        const companyKeypair = Keypair.fromSecretKey(new Uint8Array(companyKeypairData));
        
        console.log('🏢 Company Account:');
        console.log(`   Address: ${companyKeypair.publicKey.toString()}`);
        
        const companyBalance = await connection.getBalance(companyKeypair.publicKey);
        console.log(`   Balance: ${(companyBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL\n`);

        // 2. Create a new keypair for the employee
        const newEmployeeKeypair = Keypair.generate();
        console.log('👤 New Employee Account Created:');
        console.log(`   Address: ${newEmployeeKeypair.publicKey.toString()}`);
        console.log(`   Private Key: [${newEmployeeKeypair.secretKey.toString()}]`);
        
        // Save the new keypair to a file
        const employeeKeypairPath = path.join(__dirname, 'employee-keypair.json');
        fs.writeFileSync(employeeKeypairPath, JSON.stringify(Array.from(newEmployeeKeypair.secretKey)));
        console.log(`   Saved to: ${employeeKeypairPath}\n`);

        // 3. Register a domain for the new employee (e.g., "employee.sol")
        const domainName = 'employee.sol';
        console.log(`🌐 Registering domain: ${domainName}`);
        
        // Create domain registration transaction
        const domainRegistrationTx = new Transaction();
        
        // Add domain registration instruction (simplified - in real implementation this would use the SNS program)
        // For now, we'll just create the account and transfer SOL
        
        // 4. Transfer SOL from company to new employee
        const transferAmount = 0.05 * LAMPORTS_PER_SOL; // 0.05 SOL
        
        console.log(`💰 Transferring ${transferAmount / LAMPORTS_PER_SOL} SOL from company to employee...`);
        
        const transferTransaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: companyKeypair.publicKey,
                toPubkey: newEmployeeKeypair.publicKey,
                lamports: transferAmount,
            })
        );

        // 5. Send the transaction
        const signature = await connection.sendTransaction(
            transferTransaction,
            [companyKeypair],
            { commitment: 'confirmed' }
        );

        console.log(`✅ Transfer successful!`);
        console.log(`🔗 Transaction signature: ${signature}`);
        
        // 6. Wait for confirmation and check balances
        await connection.confirmTransaction(signature, 'confirmed');
        
        const newCompanyBalance = await connection.getBalance(companyKeypair.publicKey);
        const employeeBalance = await connection.getBalance(newEmployeeKeypair.publicKey);
        
        console.log('\n📊 Final Balances:');
        console.log(`   Company: ${(newCompanyBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        console.log(`   Employee: ${(employeeBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

        // 7. Create a summary file
        const summary = {
            timestamp: new Date().toISOString(),
            company: {
                address: companyKeypair.publicKey.toString(),
                balance: newCompanyBalance / LAMPORTS_PER_SOL
            },
            employee: {
                address: newEmployeeKeypair.publicKey.toString(),
                keypairFile: employeeKeypairPath,
                balance: employeeBalance / LAMPORTS_PER_SOL,
                domain: domainName
            },
            transaction: {
                signature: signature,
                amount: transferAmount / LAMPORTS_PER_SOL
            },
            network: 'Gorbchain',
            programId: GORBCHAIN_CONFIG.PROGRAM_ID
        };

        const summaryPath = path.join(__dirname, 'account-creation-summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        
        console.log(`\n📄 Summary saved to: ${summaryPath}`);
        
        console.log('\n🎉 Process completed successfully!');
        console.log('📋 Next steps:');
        console.log('   1. Use the employee keypair file for future transactions');
        console.log('   2. Register the domain using the SNS program');
        console.log('   3. Set up metadata URL for the employee domain');
        
        return summary;

    } catch (error) {
        console.error('❌ Error during account creation and transfer:', error);
        throw error;
    }
}

// Helper function to check if domain exists
async function checkDomainExists(domainName) {
    try {
        // This would check against the SNS program
        // For now, we'll return false as a placeholder
        return false;
    } catch (error) {
        console.error('Error checking domain existence:', error);
        return false;
    }
}

// Helper function to register domain (placeholder for SNS integration)
async function registerDomain(domainName, ownerKeypair, payerKeypair) {
    console.log(`📝 Domain registration for ${domainName} would be implemented here`);
    console.log(`   Owner: ${ownerKeypair.publicKey.toString()}`);
    console.log(`   Payer: ${payerKeypair.publicKey.toString()}`);
    
    // In a real implementation, this would:
    // 1. Create the domain account
    // 2. Set up reverse lookup
    // 3. Store metadata URL
    // 4. Pay registration fees
}

if (require.main === module) {
    createNewAccountAndSendSol()
        .then(summary => {
            console.log('\n✅ Account creation and SOL transfer completed!');
        })
        .catch(error => {
            console.error('💥 Failed to create account and transfer SOL:', error);
            process.exit(1);
        });
}

module.exports = { createNewAccountAndSendSol }; 