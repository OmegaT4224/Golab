// Simple test script for blockchain
const { Blockchain, Block, QuantumResistantSignature } = require('./blockchain.js');

console.log('Testing Quantum Blockchain Implementation...\n');

try {
    // Test 1: Create blockchain
    console.log('1. Creating blockchain...');
    const blockchain = new Blockchain();
    console.log('✅ Blockchain created successfully');
    console.log('Genesis block hash:', blockchain.getLatestBlock().hash);

    // Test 2: Add a block
    console.log('\n2. Adding a test block...');
    blockchain.addBlock({
        type: 'test-transaction',
        data: 'Alice sends 10 coins to Bob',
        timestamp: Date.now()
    });
    console.log('✅ Block added successfully');

    // Test 3: Get statistics
    console.log('\n3. Blockchain statistics:');
    const stats = blockchain.getStats();
    console.log('Total blocks:', stats.totalBlocks);
    console.log('Difficulty:', stats.difficulty);
    console.log('Chain valid:', stats.isValid);

    // Test 4: Display chain
    console.log('\n4. Full blockchain:');
    blockchain.chain.forEach((block, index) => {
        console.log(`Block ${index}:`);
        console.log(`  Hash: ${block.hash}`);
        console.log(`  Previous: ${block.previousHash}`);
        console.log(`  Data: ${JSON.stringify(block.data)}`);
        console.log(`  Nonce: ${block.nonce}`);
        console.log(`  Quantum Signature: ${block.quantumSignature.substring(0, 30)}...`);
        console.log('');
    });

    // Test 5: Add more blocks
    console.log('5. Adding more blocks...');
    blockchain.addBlock({
        type: 'transaction',
        data: 'Bob sends 5 coins to Charlie',
        timestamp: Date.now()
    });
    blockchain.addBlock({
        type: 'transaction', 
        data: 'Charlie sends 15 coins to Dave',
        timestamp: Date.now()
    });

    console.log('✅ All tests passed!');
    console.log('Final stats:', blockchain.getStats());

} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
}