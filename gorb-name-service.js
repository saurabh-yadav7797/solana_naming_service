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

// In-memory registry for demonstration (replace with on-chain queries in production)
let domainRegistry = {};

function saveRegistry() {
    fs.writeFileSync(path.join(__dirname, 'gorb-domain-registry.json'), JSON.stringify(domainRegistry, null, 2));
}

function loadRegistry() {
    try {
        domainRegistry = JSON.parse(fs.readFileSync(path.join(__dirname, 'gorb-domain-registry.json')));
    } catch (e) {
        domainRegistry = {};
    }
}

function registerDomain(username, keypair, metadataUrl) {
    const domain = `${username}.gorb`;
    domainRegistry[domain] = {
        username,
        domain,
        address: keypair.publicKey.toString(),
        metadataUrl,
        metadata: {
            name: username,
            description: `${username}'s .gorb domain`,
            image: `https://arweave.net/${username}-avatar.png`,
            attributes: [
                { trait_type: "Role", value: "User" },
                { trait_type: "Registered", value: new Date().toISOString() }
            ]
        }
    };
    saveRegistry();
    return domainRegistry[domain];
}

function resolveName(domain) {
    loadRegistry();
    return domainRegistry[domain];
}

function printAllDomains() {
    loadRegistry();
    console.log("\nRegistered .gorb Domains:");
    for (const domain in domainRegistry) {
        const info = domainRegistry[domain];
        console.log(`- Username: ${info.username}`);
        console.log(`  Domain: ${info.domain}`);
        console.log(`  Address: ${info.address}`);
        console.log(`  Metadata URL: ${info.metadataUrl}`);
        console.log(`  Metadata: ${JSON.stringify(info.metadata, null, 2)}`);
        console.log('');
    }
}

async function sendTokensByName(senderKeypair, fromDomain, toDomain, amountSol) {
    loadRegistry();
    const fromInfo = domainRegistry[fromDomain];
    const toInfo = domainRegistry[toDomain];
    if (!fromInfo || !toInfo) {
        throw new Error('Domain not found in registry');
    }
    const toPubkey = new PublicKey(toInfo.address);
    const transferAmount = amountSol * LAMPORTS_PER_SOL;
    const tx = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey,
            lamports: transferAmount,
        })
    );
    const signature = await connection.sendTransaction(tx, [senderKeypair], { commitment: 'confirmed' });
    await connection.confirmTransaction(signature, 'confirmed');
    console.log(`\n✅ Sent ${amountSol} SOL from ${fromDomain} to ${toDomain}`);
    console.log(`   TX Signature: ${signature}`);
    return signature;
}

async function main() {
    console.log('🚀 Starting .gorb Name Service Demo...\n');
    
    // 1. Register Anurag.gorb
    console.log('📝 Registering Anurag.gorb...');
    const anuragKeypair = Keypair.generate();
    const anuragMetadataUrl = `https://arweave.net/Anurag-profile.json`;
    const anurag = registerDomain('Anurag', anuragKeypair, anuragMetadataUrl);
    console.log(`✅ Registered: ${anurag.domain} -> ${anurag.address}`);

    // 2. Register Rachit.gorb
    console.log('📝 Registering Rachit.gorb...');
    const rachitKeypair = Keypair.generate();
    const rachitMetadataUrl = `https://arweave.net/Rachit-profile.json`;
    const rachit = registerDomain('Rachit', rachitKeypair, rachitMetadataUrl);
    console.log(`✅ Registered: ${rachit.domain} -> ${rachit.address}`);

    // 3. Print both .gorb account details
    printAllDomains();

    // 4. Fund Anurag.gorb from your company account for demonstration
    console.log('💰 Funding Anurag.gorb from company account...');
    const companyKeypairPath = path.join(os.homedir(), '.config/solana/id.json');
    const companyKeypairData = JSON.parse(fs.readFileSync(companyKeypairPath, 'utf8'));
    const companyKeypair = Keypair.fromSecretKey(new Uint8Array(companyKeypairData));
    const fundTx = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: companyKeypair.publicKey,
            toPubkey: anuragKeypair.publicKey,
            lamports: 0.2 * LAMPORTS_PER_SOL,
        })
    );
    const fundSig = await connection.sendTransaction(fundTx, [companyKeypair], { commitment: 'confirmed' });
    await connection.confirmTransaction(fundSig, 'confirmed');
    console.log(`✅ Funded Anurag.gorb with 0.2 SOL from company.sol (TX: ${fundSig})`);

    // 5. Send tokens from Anurag.gorb to Rachit.gorb by name
    console.log('\n💸 Sending tokens from Anurag.gorb to Rachit.gorb by name...');
    await sendTokensByName(anuragKeypair, 'Anurag.gorb', 'Rachit.gorb', 0.05);

    // 6. Print both .gorb account details again
    printAllDomains();
    
    console.log('\n🎉 .gorb Name Service Demo completed successfully!');
    console.log('📄 Registry saved to: gorb-domain-registry.json');
}

if (require.main === module) {
    main().catch(console.error);
} 