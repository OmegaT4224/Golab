/**
 * Basic structure test for the Ethereum automation script
 * Tests class instantiation and configuration validation
 */

const EthereumAutomation = require('./ethereum-automation');

console.log('🧪 Testing Ethereum Automation Script Structure...\n');

// Test 1: Class instantiation
console.log('Test 1: Class instantiation');
try {
    const config = {
        privateKey: '0x1234567890123456789012345678901234567890123456789012345678901234',
        rpcUrl: 'https://sepolia.infura.io/v3/test',
        minTransferAmount: 0.001,
        monitoringInterval: 60000
    };
    
    const automation = new EthereumAutomation(config);
    console.log('✅ Class instantiation successful');
    console.log(`✅ Target address: ${automation.targetAddress}`);
    console.log(`✅ Logger initialized: ${typeof automation.logger}`);
} catch (error) {
    console.log('❌ Class instantiation failed:', error.message);
}

// Test 2: Configuration validation
console.log('\nTest 2: Configuration validation');
try {
    const badConfig = {
        privateKey: 'invalid_key',
        rpcUrl: null
    };
    
    const automation = new EthereumAutomation(badConfig);
    automation.validateConfig();
    console.log('❌ Should have failed validation');
} catch (error) {
    console.log('✅ Configuration validation working:', error.message);
}

// Test 3: Valid configuration
console.log('\nTest 3: Valid configuration validation');
try {
    const goodConfig = {
        privateKey: '0x1234567890123456789012345678901234567890123456789012345678901234',
        rpcUrl: 'https://sepolia.infura.io/v3/test',
        minTransferAmount: 0.001
    };
    
    const automation = new EthereumAutomation(goodConfig);
    automation.validateConfig();
    console.log('✅ Valid configuration passed validation');
} catch (error) {
    console.log('❌ Valid configuration failed:', error.message);
}

// Test 4: Method availability
console.log('\nTest 4: Method availability check');
const config = {
    privateKey: '0x1234567890123456789012345678901234567890123456789012345678901234',
    rpcUrl: 'https://sepolia.infura.io/v3/test'
};

const automation = new EthereumAutomation(config);
const requiredMethods = [
    'initialize',
    'getCurrentBalance',
    'transferETH',
    'transferHalfBalance',
    'startEarningsMonitoring',
    'stopEarningsMonitoring',
    'getWalletInfo',
    'run'
];

requiredMethods.forEach(method => {
    if (typeof automation[method] === 'function') {
        console.log(`✅ Method ${method} available`);
    } else {
        console.log(`❌ Method ${method} missing`);
    }
});

// Test 5: Target address validation
console.log('\nTest 5: Target address validation');
const { ethers } = require('ethers');
const targetAddress = '0x904d5E231C3d002CAaaD6a96Ad96F91dbdC0fc5E';
if (ethers.isAddress(targetAddress)) {
    console.log(`✅ Target address is valid: ${targetAddress}`);
} else {
    console.log(`❌ Target address is invalid: ${targetAddress}`);
}

console.log('\n🎉 Basic structure tests completed!');
console.log('\nTo test with real functionality:');
console.log('1. Configure .env with real credentials');
console.log('2. Run: npm run test-dry');
console.log('3. Run: npm run balance');
console.log('4. Run: npm run run --testnet (for testnet testing)');