#!/usr/bin/env node

/**
 * Ethereum Automation CLI
 * Command-line interface for the Ethereum automation script
 */

const EthereumAutomation = require('./ethereum-automation');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// CLI colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
    console.log(colorize('\n=== Ethereum Automation Script ===', 'cyan'));
    console.log(colorize('Target Address: 0x904d5E231C3d002CAaaD6a96Ad96F91dbdC0fc5E', 'blue'));
    console.log(colorize('====================================\n', 'cyan'));
}

function printHelp() {
    console.log(colorize('Usage:', 'bright'));
    console.log('  node cli.js <command> [options]\n');
    
    console.log(colorize('Commands:', 'bright'));
    console.log('  run              Run full automation (half-balance transfer + monitoring)');
    console.log('  balance          Check current wallet balance');
    console.log('  transfer-half    Transfer half of current balance only');
    console.log('  monitor          Start earnings monitoring only');
    console.log('  info             Display wallet and configuration info');
    console.log('  setup            Guide through initial setup');
    console.log('  help             Show this help message\n');
    
    console.log(colorize('Options:', 'bright'));
    console.log('  --dry-run        Simulate actions without executing transactions');
    console.log('  --testnet        Use testnet configuration');
    console.log('  --config <file>  Use custom configuration file\n');
    
    console.log(colorize('Examples:', 'bright'));
    console.log('  node cli.js setup');
    console.log('  node cli.js balance');
    console.log('  node cli.js run --dry-run');
    console.log('  node cli.js transfer-half --testnet\n');
}

function checkSetup() {
    const envFile = path.join(__dirname, '.env');
    if (!fs.existsSync(envFile)) {
        console.log(colorize('⚠️  Setup required!', 'yellow'));
        console.log('No .env file found. Run: node cli.js setup\n');
        return false;
    }
    
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
    
    if (!privateKey || !rpcUrl) {
        console.log(colorize('⚠️  Configuration incomplete!', 'yellow'));
        console.log('Please complete your .env file configuration.\n');
        return false;
    }
    
    return true;
}

function setupWizard() {
    console.log(colorize('🚀 Ethereum Automation Setup', 'bright'));
    console.log('\nThis wizard will help you configure the automation script.\n');
    
    const envExample = path.join(__dirname, '.env.example');
    const envFile = path.join(__dirname, '.env');
    
    if (fs.existsSync(envExample)) {
        try {
            fs.copyFileSync(envExample, envFile);
            console.log(colorize('✅ Created .env file from template', 'green'));
        } catch (error) {
            console.log(colorize('❌ Failed to create .env file', 'red'));
            return;
        }
    }
    
    console.log('\n' + colorize('Next steps:', 'bright'));
    console.log('1. Edit the .env file with your configuration:');
    console.log('   - Add your private key (PRIVATE_KEY)');
    console.log('   - Add your RPC URL (RPC_URL)');
    console.log('   - Adjust other settings as needed\n');
    
    console.log('2. For testing, consider using a testnet first:');
    console.log('   - Sepolia testnet RPC: https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
    console.log('   - Get test ETH from: https://sepoliafaucet.com/\n');
    
    console.log('3. Run the automation:');
    console.log('   node cli.js run --dry-run  (for testing)');
    console.log('   node cli.js run            (for real transactions)\n');
    
    console.log(colorize('⚠️  SECURITY WARNING:', 'yellow'));
    console.log('- Never share your private key');
    console.log('- Never commit .env to version control');
    console.log('- Test on testnet first');
    console.log('- Start with small amounts\n');
}

async function runCommand(command, options = {}) {
    if (!checkSetup() && command !== 'setup' && command !== 'help') {
        return;
    }
    
    const config = {
        privateKey: process.env.PRIVATE_KEY,
        rpcUrl: options.testnet ? 
            'https://sepolia.infura.io/v3/YOUR_PROJECT_ID' : 
            process.env.RPC_URL,
        minTransferAmount: parseFloat(process.env.MIN_TRANSFER_AMOUNT) || 0.001,
        monitoringInterval: parseInt(process.env.MONITORING_INTERVAL) || 60000,
        performInitialTransfer: process.env.PERFORM_INITIAL_TRANSFER !== 'false',
        enableMonitoring: process.env.ENABLE_MONITORING !== 'false',
        dryRun: options.dryRun || false
    };
    
    try {
        const automation = new EthereumAutomation(config);
        
        switch (command) {
            case 'setup':
                setupWizard();
                break;
                
            case 'balance':
                await automation.initialize();
                const walletInfo = await automation.getWalletInfo();
                console.log(colorize('💰 Wallet Information:', 'bright'));
                console.log(`Address: ${walletInfo.address}`);
                console.log(`Balance: ${walletInfo.balance} ETH`);
                console.log(`Target: ${walletInfo.targetAddress}\n`);
                break;
                
            case 'transfer-half':
                if (options.dryRun) {
                    console.log(colorize('🧪 DRY RUN MODE - No transactions will be executed', 'yellow'));
                }
                await automation.initialize();
                const currentBalance = await automation.getCurrentBalance();
                console.log(`Current balance: ${require('ethers').formatEther(currentBalance)} ETH`);
                if (!options.dryRun) {
                    await automation.transferHalfBalance();
                } else {
                    console.log('Would transfer approximately half of balance to target address');
                }
                break;
                
            case 'monitor':
                await automation.initialize();
                console.log(colorize('👀 Starting earnings monitoring...', 'blue'));
                console.log('Press Ctrl+C to stop monitoring\n');
                await automation.startEarningsMonitoring();
                
                // Keep process alive
                process.on('SIGINT', () => {
                    console.log(colorize('\n🛑 Stopping monitoring...', 'yellow'));
                    automation.stopEarningsMonitoring();
                    process.exit(0);
                });
                break;
                
            case 'run':
                if (options.dryRun) {
                    console.log(colorize('🧪 DRY RUN MODE - No transactions will be executed', 'yellow'));
                    config.performInitialTransfer = false;
                    config.enableMonitoring = false;
                }
                await automation.run();
                if (!options.dryRun) {
                    console.log(colorize('🚀 Automation is running. Press Ctrl+C to stop.', 'green'));
                    
                    process.on('SIGINT', () => {
                        console.log(colorize('\n🛑 Stopping automation...', 'yellow'));
                        automation.stopEarningsMonitoring();
                        process.exit(0);
                    });
                }
                break;
                
            case 'info':
                await automation.initialize();
                const info = await automation.getWalletInfo();
                console.log(colorize('ℹ️  Configuration Info:', 'bright'));
                console.log(`Source Address: ${info.address}`);
                console.log(`Target Address: ${info.targetAddress}`);
                console.log(`Current Balance: ${info.balance} ETH`);
                console.log(`Min Transfer: ${config.minTransferAmount} ETH`);
                console.log(`Monitor Interval: ${config.monitoringInterval / 1000}s`);
                console.log(`Network: ${options.testnet ? 'Testnet' : 'Mainnet'}\n`);
                break;
                
            case 'help':
            default:
                printHelp();
                break;
        }
    } catch (error) {
        console.log(colorize(`❌ Error: ${error.message}`, 'red'));
        if (error.message.includes('private key') || error.message.includes('configuration')) {
            console.log(colorize('Run "node cli.js setup" to configure the script', 'yellow'));
        }
    }
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const options = {};
    
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--dry-run') {
            options.dryRun = true;
        } else if (arg === '--testnet') {
            options.testnet = true;
        } else if (arg === '--config' && i + 1 < args.length) {
            options.config = args[i + 1];
            i++;
        }
    }
    
    return { command, options };
}

// Main execution
async function main() {
    printHeader();
    
    const { command, options } = parseArgs();
    
    try {
        await runCommand(command, options);
    } catch (error) {
        console.log(colorize(`Fatal error: ${error.message}`, 'red'));
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { runCommand, parseArgs };