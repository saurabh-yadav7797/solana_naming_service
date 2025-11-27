const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

async function createNewAccountWithDomain() {
    console.log('🚀 Starting advanced account creation with domain registration...\n');

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
        
        // Save the new keypair to a file
        const employeeKeypairPath = path.join(__dirname, 'employee-keypair.json');
        fs.writeFileSync(employeeKeypairPath, JSON.stringify(Array.from(newEmployeeKeypair.secretKey)));
        console.log(`   Saved to: ${employeeKeypairPath}\n`);

        // 3. Define domain name for the employee
        const domainName = 'employee.sol';
        console.log(`🌐 Domain to register: ${domainName}`);

        // 4. Transfer initial SOL from company to employee
        const transferAmount = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL for initial balance
        
        console.log(`💰 Transferring ${transferAmount / LAMPORTS_PER_SOL} SOL from company to employee...`);
        
        const transferTransaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: companyKeypair.publicKey,
                toPubkey: newEmployeeKeypair.publicKey,
                lamports: transferAmount,
            })
        );

        // 5. Send the transfer transaction
        const transferSignature = await connection.sendTransaction(
            transferTransaction,
            [companyKeypair],
            { commitment: 'confirmed' }
        );

        console.log(`✅ Transfer successful!`);
        console.log(`🔗 Transfer signature: ${transferSignature}`);
        
        // 6. Wait for confirmation
        await connection.confirmTransaction(transferSignature, 'confirmed');
        
        // 7. Check balances after transfer
        const newCompanyBalance = await connection.getBalance(companyKeypair.publicKey);
        const employeeBalance = await connection.getBalance(newEmployeeKeypair.publicKey);
        
        console.log('\n📊 Balances after transfer:');
        console.log(`   Company: ${(newCompanyBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        console.log(`   Employee: ${(employeeBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

        // 8. Create domain registration data (simulated)
        const domainRegistrationData = {
            domainName: domainName,
            owner: newEmployeeKeypair.publicKey.toString(),
            metadataUrl: `https://arweave.net/employee-${newEmployeeKeypair.publicKey.toString().slice(0, 8)}.json`,
            registrationDate: new Date().toISOString(),
            programId: GORBCHAIN_CONFIG.PROGRAM_ID
        };

        // 9. Save domain registration data
        const domainDataPath = path.join(__dirname, 'domain-registration-data.json');
        fs.writeFileSync(domainDataPath, JSON.stringify(domainRegistrationData, null, 2));
        console.log(`\n📄 Domain registration data saved to: ${domainDataPath}`);

        // 10. Create comprehensive summary
        const summary = {
            timestamp: new Date().toISOString(),
            network: 'Gorbchain',
            programId: GORBCHAIN_CONFIG.PROGRAM_ID,
            company: {
                address: companyKeypair.publicKey.toString(),
                balance: newCompanyBalance / LAMPORTS_PER_SOL,
                domain: 'company.sol'
            },
            employee: {
                address: newEmployeeKeypair.publicKey.toString(),
                keypairFile: employeeKeypairPath,
                balance: employeeBalance / LAMPORTS_PER_SOL,
                domain: domainName,
                metadataUrl: domainRegistrationData.metadataUrl
            },
            transactions: {
                transfer: {
                    signature: transferSignature,
                    amount: transferAmount / LAMPORTS_PER_SOL,
                    from: companyKeypair.publicKey.toString(),
                    to: newEmployeeKeypair.publicKey.toString()
                }
            },
            nextSteps: [
                'Register domain using SNS program',
                'Set up metadata URL for employee profile',
                'Configure domain permissions',
                'Test domain resolution'
            ]
        };

        const summaryPath = path.join(__dirname, 'advanced-account-creation-summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
        
        console.log(`📄 Complete summary saved to: ${summaryPath}`);
        
        console.log('\n🎉 Advanced account creation completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   👤 Employee Account: ${newEmployeeKeypair.publicKey.toString()}`);
        console.log(`   🌐 Domain: ${domainName}`);
        console.log(`   💰 Initial Balance: ${(employeeBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        console.log(`   🔗 Transfer TX: ${transferSignature}`);
        
        console.log('\n📋 Next Steps:');
        console.log('   1. Use employee keypair for domain registration');
        console.log('   2. Register domain using SNS program');
        console.log('   3. Set up metadata URL for employee profile');
        console.log('   4. Test domain resolution and transfers');
        
        return summary;

    } catch (error) {
        console.error('❌ Error during advanced account creation:', error);
        throw error;
    }
}

if (require.main === module) {
    createNewAccountWithDomain()
        .then(summary => {
            console.log('\n✅ Advanced account creation completed!');
            console.log('🚀 Ready for domain registration and metadata setup!');
        })
        .catch(error => {
            console.error('💥 Failed to create account:', error);
            process.exit(1);
        });
}

module.exports = { createNewAccountWithDomain };
