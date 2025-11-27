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

// SNS Program constants
const SPL_NAME_SERVICE_PROGRAM_ID = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx');
const ROOT_DOMAIN_ACCOUNT = new PublicKey('5eoDkP6vCQBXqDV9YN2NdUs3nmML3dMRNmEYpiyVNBm2');

// Retry function for network operations
async function retryOperation(operation, maxRetries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            console.log(`⚠️  Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            console.log(`⏳ Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Helper function to get hashed name for domain
function getHashedName(name) {
    const encoder = new TextEncoder();
    const nameBytes = encoder.encode(name);
    const hash = require('crypto').createHash('sha256');
    hash.update(nameBytes);
    return hash.digest();
}

// Helper function to derive domain account address
function getDomainAccountAddress(name, parent = null) {
    const hashedName = getHashedName(name);
    const seeds = [hashedName];
    
    if (parent) {
        seeds.push(parent.toBuffer());
    }
    
    const [address] = PublicKey.findProgramAddressSync(
        seeds,
        SPL_NAME_SERVICE_PROGRAM_ID
    );
    
    return address;
}

// Helper function to derive reverse lookup account address
function getReverseLookupAddress(domainKey, parentKey = null) {
    const seeds = [Buffer.from('reverse'), domainKey.toBuffer()];
    
    if (parentKey) {
        seeds.push(parentKey.toBuffer());
    }
    
    const [address] = PublicKey.findProgramAddressSync(
        seeds,
        new PublicKey(GORBCHAIN_CONFIG.PROGRAM_ID)
    );
    
    return address;
}

async function createNewAccountWithDomain() {
    console.log('🚀 Starting advanced account creation with domain registration...\n');

    try {
        // 1. Load the company keypair (owner of company.sol)
        const companyKeypairPath = path.join(os.homedir(), '.config/solana/id.json');
        const companyKeypairData = JSON.parse(fs.readFileSync(companyKeypairPath, 'utf8'));
        const companyKeypair = Keypair.fromSecretKey(new Uint8Array(companyKeypairData));
        
        console.log('🏢 Company Account:');
        console.log(`   Address: ${companyKeypair.publicKey.toString()}`);
        
        const companyBalance = await retryOperation(async () => {
            return await connection.getBalance(companyKeypair.publicKey);
        });
        
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

        // 5. Send the transfer transaction with retry logic
        const transferSignature = await retryOperation(async () => {
            return await connection.sendTransaction(
                transferTransaction,
                [companyKeypair],
                { commitment: 'confirmed' }
            );
        });

        console.log(`✅ Transfer successful!`);
        console.log(`🔗 Transfer signature: ${transferSignature}`);
        
        // 6. Wait for confirmation with retry logic
        await retryOperation(async () => {
            return await connection.confirmTransaction(transferSignature, 'confirmed');
        });
        
        // 7. Check balances after transfer with retry logic
        const newCompanyBalance = await retryOperation(async () => {
            return await connection.getBalance(companyKeypair.publicKey);
        });
        
        const employeeBalance = await retryOperation(async () => {
            return await connection.getBalance(newEmployeeKeypair.publicKey);
        });
        
        console.log('\n📊 Balances after transfer:');
        console.log(`   Company: ${(newCompanyBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        console.log(`   Employee: ${(employeeBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

        // 8. Create domain registration data with metadata
        const metadataUrl = `https://arweave.net/employee-${newEmployeeKeypair.publicKey.toString().slice(0, 8)}.json`;
        
        const domainRegistrationData = {
            domainName: domainName,
            owner: newEmployeeKeypair.publicKey.toString(),
            metadataUrl: metadataUrl,
            registrationDate: new Date().toISOString(),
            programId: GORBCHAIN_CONFIG.PROGRAM_ID,
            metadata: {
                name: "Employee Profile",
                description: "Employee domain registration with metadata",
                image: "https://arweave.net/employee-avatar.png",
                attributes: [
                    { trait_type: "Role", value: "Employee" },
                    { trait_type: "Department", value: "Engineering" },
                    { trait_type: "Start Date", value: new Date().toISOString().split('T')[0] }
                ]
            }
        };

        // 9. Save domain registration data
        const domainDataPath = path.join(__dirname, 'domain-registration-data.json');
        fs.writeFileSync(domainDataPath, JSON.stringify(domainRegistrationData, null, 2));
        console.log(`\n📄 Domain registration data saved to: ${domainDataPath}`);

        // 10. Create metadata file for Arweave (simulated)
        const metadataFilePath = path.join(__dirname, 'employee-metadata.json');
        fs.writeFileSync(metadataFilePath, JSON.stringify(domainRegistrationData.metadata, null, 2));
        console.log(`📄 Employee metadata saved to: ${metadataFilePath}`);

        // 11. Simulate domain registration with SNS program
        console.log('\n🔧 Simulating domain registration with SNS program...');
        
        // Calculate account addresses
        const domainAccountAddress = getDomainAccountAddress(domainName.replace('.sol', ''));
        const reverseLookupAddress = getReverseLookupAddress(domainAccountAddress);
        
        console.log(`   Domain Account: ${domainAccountAddress.toString()}`);
        console.log(`   Reverse Lookup: ${reverseLookupAddress.toString()}`);
        console.log(`   Metadata URL: ${metadataUrl}`);
        
        // Create domain registration simulation data
        const domainRegistrationSimulation = {
            domainName: domainName,
            domainAccount: domainAccountAddress.toString(),
            reverseLookupAccount: reverseLookupAddress.toString(),
            owner: newEmployeeKeypair.publicKey.toString(),
            metadataUrl: metadataUrl,
            registrationFee: 0.01, // Estimated registration fee
            instructions: [
                "Create domain account using SPL Name Service",
                "Set up reverse lookup with metadata URL",
                "Transfer domain ownership to employee",
                "Store metadata on Arweave"
            ]
        };

        // 12. Save domain registration simulation
        const simulationPath = path.join(__dirname, 'domain-registration-simulation.json');
        fs.writeFileSync(simulationPath, JSON.stringify(domainRegistrationSimulation, null, 2));
        console.log(`📄 Domain registration simulation saved to: ${simulationPath}`);

        // 13. Create comprehensive summary
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
                metadataUrl: metadataUrl,
                domainAccount: domainAccountAddress.toString(),
                reverseLookupAccount: reverseLookupAddress.toString()
            },
            transactions: {
                transfer: {
                    signature: transferSignature,
                    amount: transferAmount / LAMPORTS_PER_SOL,
                    from: companyKeypair.publicKey.toString(),
                    to: newEmployeeKeypair.publicKey.toString()
                }
            },
            metadata: domainRegistrationData.metadata,
            nextSteps: [
                'Execute domain registration transaction',
                'Upload metadata to Arweave',
                'Verify domain resolution',
                'Test metadata retrieval'
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
        console.log(`   📄 Metadata URL: ${metadataUrl}`);
        
        console.log('\n📋 Next Steps:');
        console.log('   1. Execute domain registration using SNS program');
        console.log('   2. Upload metadata to Arweave');
        console.log('   3. Verify domain resolution works');
        console.log('   4. Test metadata retrieval and updates');
        
        return summary;

    } catch (error) {
        console.error('❌ Error during advanced account creation:', error);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('   1. Check internet connection');
        console.log('   2. Verify Gorbchain RPC endpoint is accessible');
        console.log('   3. Try again in a few minutes');
        console.log('   4. Check if Gorbchain network is operational');
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