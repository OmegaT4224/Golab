/**
 * Ethereum Automation Script
 * 
 * This script automatically transfers half of the current balance and 
 * monitors for new earnings to transfer to the target Ethereum wallet.
 * 
 * Target Address: 0x904d5E231C3d002CAaaD6a96Ad96F91dbdC0fc5E
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class EthereumAutomation {
    constructor(config) {
        this.config = config;
        this.provider = null;
        this.wallet = null;
        this.targetAddress = '0x904d5E231C3d002CAaaD6a96Ad96F91dbdC0fc5E';
        this.lastKnownBalance = null;
        this.isMonitoring = false;
        this.logger = this.initLogger();
    }

    /**
     * Initialize logging system
     */
    initLogger() {
        const logFile = path.join(__dirname, 'automation.log');
        return {
            log: (level, message) => {
                const timestamp = new Date().toISOString();
                const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
                console.log(logEntry.trim());
                fs.appendFileSync(logFile, logEntry);
            },
            info: (message) => this.logger.log('info', message),
            warn: (message) => this.logger.log('warn', message),
            error: (message) => this.logger.log('error', message),
            success: (message) => this.logger.log('success', message)
        };
    }

    /**
     * Initialize connection to Ethereum network
     */
    async initialize() {
        try {
            this.logger.info('Initializing Ethereum connection...');
            
            // Validate configuration
            this.validateConfig();
            
            // Connect to provider
            this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
            
            // Initialize wallet
            this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);
            
            // Test connection
            const network = await this.provider.getNetwork();
            this.logger.info(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
            
            // Validate target address
            if (!ethers.isAddress(this.targetAddress)) {
                throw new Error('Invalid target address');
            }
            
            this.logger.success('Initialization completed successfully');
            return true;
        } catch (error) {
            this.logger.error(`Initialization failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate configuration parameters
     */
    validateConfig() {
        const required = ['privateKey', 'rpcUrl'];
        for (const field of required) {
            if (!this.config[field]) {
                throw new Error(`Missing required configuration: ${field}`);
            }
        }

        if (!this.config.privateKey.startsWith('0x')) {
            throw new Error('Private key must start with 0x');
        }

        if (this.config.minTransferAmount && this.config.minTransferAmount < 0) {
            throw new Error('Minimum transfer amount cannot be negative');
        }
    }

    /**
     * Get current balance of the source wallet
     */
    async getCurrentBalance() {
        try {
            const balance = await this.provider.getBalance(this.wallet.address);
            return balance;
        } catch (error) {
            this.logger.error(`Failed to get balance: ${error.message}`);
            throw error;
        }
    }

    /**
     * Estimate gas for a transaction
     */
    async estimateGas(toAddress, amount) {
        try {
            const gasEstimate = await this.provider.estimateGas({
                from: this.wallet.address,
                to: toAddress,
                value: amount
            });
            
            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
            
            return {
                gasLimit: gasEstimate,
                gasPrice: gasPrice,
                totalGasCost: gasEstimate * gasPrice
            };
        } catch (error) {
            this.logger.error(`Gas estimation failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Transfer ETH to target address with gas optimization
     */
    async transferETH(amount, description = 'Transfer') {
        try {
            this.logger.info(`${description}: Attempting to transfer ${ethers.formatEther(amount)} ETH`);
            
            // Validate amount
            if (amount <= 0) {
                throw new Error('Transfer amount must be positive');
            }

            // Check minimum transfer threshold
            if (this.config.minTransferAmount && amount < ethers.parseEther(this.config.minTransferAmount.toString())) {
                this.logger.warn(`Transfer amount below minimum threshold of ${this.config.minTransferAmount} ETH`);
                return null;
            }

            // Estimate gas costs
            const gasInfo = await this.estimateGas(this.targetAddress, amount);
            this.logger.info(`Estimated gas cost: ${ethers.formatEther(gasInfo.totalGasCost)} ETH`);

            // Ensure we have enough balance for transfer + gas
            const currentBalance = await this.getCurrentBalance();
            const totalRequired = amount + gasInfo.totalGasCost;
            
            if (currentBalance < totalRequired) {
                throw new Error(`Insufficient balance. Required: ${ethers.formatEther(totalRequired)} ETH, Available: ${ethers.formatEther(currentBalance)} ETH`);
            }

            // Create and send transaction
            const transaction = {
                to: this.targetAddress,
                value: amount,
                gasLimit: gasInfo.gasLimit,
                gasPrice: gasInfo.gasPrice
            };

            const tx = await this.wallet.sendTransaction(transaction);
            this.logger.info(`Transaction sent: ${tx.hash}`);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                this.logger.success(`${description} completed successfully. TX: ${tx.hash}`);
                this.logger.info(`Gas used: ${receipt.gasUsed} (${ethers.formatEther(receipt.gasUsed * gasInfo.gasPrice)} ETH)`);
                return receipt;
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            this.logger.error(`${description} failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Transfer half of current balance to target address
     */
    async transferHalfBalance() {
        try {
            this.logger.info('Starting half-balance transfer...');
            
            const currentBalance = await this.getCurrentBalance();
            this.logger.info(`Current balance: ${ethers.formatEther(currentBalance)} ETH`);
            
            if (currentBalance === 0n) {
                this.logger.warn('No balance available for transfer');
                return null;
            }

            // Calculate half balance
            const halfBalance = currentBalance / 2n;
            
            // Estimate gas for the transaction
            const gasInfo = await this.estimateGas(this.targetAddress, halfBalance);
            
            // Adjust transfer amount to account for gas costs
            const adjustedAmount = halfBalance - gasInfo.totalGasCost;
            
            if (adjustedAmount <= 0) {
                this.logger.warn('Insufficient balance to cover gas costs for half-balance transfer');
                return null;
            }

            return await this.transferETH(adjustedAmount, 'Half-balance transfer');
        } catch (error) {
            this.logger.error(`Half-balance transfer failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Monitor for new earnings and transfer them automatically
     */
    async startEarningsMonitoring() {
        if (this.isMonitoring) {
            this.logger.warn('Monitoring is already running');
            return;
        }

        this.isMonitoring = true;
        this.logger.info('Starting earnings monitoring...');
        
        // Store initial balance
        this.lastKnownBalance = await this.getCurrentBalance();
        this.logger.info(`Initial balance recorded: ${ethers.formatEther(this.lastKnownBalance)} ETH`);

        const monitoringInterval = setInterval(async () => {
            try {
                if (!this.isMonitoring) {
                    clearInterval(monitoringInterval);
                    return;
                }

                await this.checkForNewEarnings();
            } catch (error) {
                this.logger.error(`Monitoring error: ${error.message}`);
            }
        }, this.config.monitoringInterval || 60000); // Default: 1 minute

        this.logger.info(`Monitoring started with ${(this.config.monitoringInterval || 60000) / 1000}s interval`);
    }

    /**
     * Check for new earnings and transfer them
     */
    async checkForNewEarnings() {
        try {
            const currentBalance = await this.getCurrentBalance();
            
            if (currentBalance > this.lastKnownBalance) {
                const newEarnings = currentBalance - this.lastKnownBalance;
                this.logger.info(`New earnings detected: ${ethers.formatEther(newEarnings)} ETH`);
                
                // Transfer new earnings minus gas costs
                const gasInfo = await this.estimateGas(this.targetAddress, newEarnings);
                const transferAmount = newEarnings - gasInfo.totalGasCost;
                
                if (transferAmount > 0) {
                    const receipt = await this.transferETH(transferAmount, 'Earnings transfer');
                    if (receipt) {
                        // Update last known balance after successful transfer
                        this.lastKnownBalance = await this.getCurrentBalance();
                    }
                } else {
                    this.logger.warn('New earnings insufficient to cover gas costs');
                }
            }
        } catch (error) {
            this.logger.error(`Error checking for new earnings: ${error.message}`);
        }
    }

    /**
     * Stop earnings monitoring
     */
    stopEarningsMonitoring() {
        this.isMonitoring = false;
        this.logger.info('Earnings monitoring stopped');
    }

    /**
     * Get wallet information
     */
    async getWalletInfo() {
        try {
            const balance = await this.getCurrentBalance();
            const nonce = await this.provider.getTransactionCount(this.wallet.address);
            
            return {
                address: this.wallet.address,
                balance: ethers.formatEther(balance),
                balanceWei: balance.toString(),
                nonce: nonce,
                targetAddress: this.targetAddress
            };
        } catch (error) {
            this.logger.error(`Failed to get wallet info: ${error.message}`);
            throw error;
        }
    }

    /**
     * Run the complete automation sequence
     */
    async run() {
        try {
            this.logger.info('Starting Ethereum automation...');
            
            // Initialize connection
            await this.initialize();
            
            // Display wallet information
            const walletInfo = await this.getWalletInfo();
            this.logger.info(`Source wallet: ${walletInfo.address}`);
            this.logger.info(`Current balance: ${walletInfo.balance} ETH`);
            this.logger.info(`Target wallet: ${walletInfo.targetAddress}`);
            
            // Perform initial half-balance transfer
            if (this.config.performInitialTransfer !== false) {
                await this.transferHalfBalance();
            }
            
            // Start earnings monitoring
            if (this.config.enableMonitoring !== false) {
                await this.startEarningsMonitoring();
            }
            
            this.logger.success('Automation setup completed successfully');
            
        } catch (error) {
            this.logger.error(`Automation failed: ${error.message}`);
            throw error;
        }
    }
}

module.exports = EthereumAutomation;

// If run directly, execute with default configuration
if (require.main === module) {
    const defaultConfig = {
        privateKey: process.env.PRIVATE_KEY,
        rpcUrl: process.env.RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY',
        minTransferAmount: parseFloat(process.env.MIN_TRANSFER_AMOUNT) || 0.001, // 0.001 ETH minimum
        monitoringInterval: parseInt(process.env.MONITORING_INTERVAL) || 60000, // 1 minute
        performInitialTransfer: process.env.PERFORM_INITIAL_TRANSFER !== 'false',
        enableMonitoring: process.env.ENABLE_MONITORING !== 'false'
    };

    const automation = new EthereumAutomation(defaultConfig);
    automation.run().catch(error => {
        console.error('Fatal error:', error.message);
        process.exit(1);
    });
}