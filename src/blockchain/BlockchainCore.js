/**
 * Blockchain Core Implementation
 * Blockchain system that uses quantum signatures for security
 * Includes block mining and transaction validation logic
 */

class Block {
    constructor(index, timestamp, data, previousHash, quantumSignature) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.quantumSignature = quantumSignature;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        const dataString = this.index + 
                          this.timestamp + 
                          JSON.stringify(this.data) + 
                          this.previousHash + 
                          this.quantumSignature + 
                          this.nonce;
        
        return this.sha256(dataString);
    }

    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join("0");
        
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        
        return this.hash;
    }

    sha256(message) {
        // Simplified SHA-256 implementation for demonstration
        let hash = 0;
        for (let i = 0; i < message.length; i++) {
            const char = message.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
}

class Transaction {
    constructor(fromAddress, toAddress, amount, assetType = 'currency') {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.assetType = assetType;
        this.timestamp = Date.now();
        this.id = this.generateTransactionId();
        this.quantumSignature = null;
        this.isValid = false;
    }

    generateTransactionId() {
        const data = this.fromAddress + this.toAddress + this.amount + this.timestamp;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    signTransaction(quantumProcessor) {
        if (this.fromAddress === null) return; // Mining reward transaction
        
        this.quantumSignature = quantumProcessor.generateQuantumSignature({
            fromAddress: this.fromAddress,
            toAddress: this.toAddress,
            amount: this.amount,
            timestamp: this.timestamp
        });
        
        this.isValid = true;
    }

    isValidTransaction() {
        if (this.fromAddress === null) return true; // Mining reward
        
        if (!this.quantumSignature || this.quantumSignature.length === 0) {
            return false;
        }
        
        return this.isValid;
    }
}

class BlockchainCore {
    constructor(quantumProcessor) {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
        this.quantumProcessor = quantumProcessor;
        this.debugSystem = null;
        this.validatorNodes = new Set();
        this.networkStats = {
            totalBlocks: 1,
            totalTransactions: 0,
            totalValue: 0,
            hashRate: 0
        };
    }

    createGenesisBlock() {
        const genesisBlock = new Block(0, Date.now(), "Genesis Block", "0", "genesis_quantum_sig");
        this.log('Genesis block created');
        return genesisBlock;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValidTransaction()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
        this.networkStats.totalTransactions++;
        this.log(`Transaction added: ${transaction.id}`);
    }

    getBalance(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.data) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    minePendingTransactions(miningRewardAddress) {
        const startTime = Date.now();
        
        // Add mining reward transaction
        const rewardTransaction = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTransaction);

        // Generate quantum signature for the block
        const blockData = {
            transactions: this.pendingTransactions,
            previousHash: this.getLatestBlock().hash,
            timestamp: Date.now()
        };
        
        const quantumSignature = this.quantumProcessor.generateQuantumSignature(blockData);

        const block = new Block(
            this.chain.length,
            Date.now(),
            this.pendingTransactions,
            this.getLatestBlock().hash,
            quantumSignature
        );

        this.log(`Mining block ${block.index}...`);
        block.mineBlock(this.difficulty);
        
        const miningTime = Date.now() - startTime;
        this.networkStats.hashRate = Math.round(block.nonce / (miningTime / 1000));
        
        this.log(`Block mined: ${block.hash} (${miningTime}ms, ${block.nonce} nonces)`);
        this.chain.push(block);
        
        this.networkStats.totalBlocks++;
        this.pendingTransactions = [];
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                this.log(`Invalid hash at block ${i}`);
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                this.log(`Invalid previous hash at block ${i}`);
                return false;
            }

            // Validate quantum signatures
            if (!this.validateQuantumSignature(currentBlock)) {
                this.log(`Invalid quantum signature at block ${i}`);
                return false;
            }
        }

        this.log('Blockchain validation successful');
        return true;
    }

    validateQuantumSignature(block) {
        // Simplified quantum signature validation
        // In a real implementation, this would verify the quantum signature
        return block.quantumSignature && block.quantumSignature.length > 0;
    }

    addValidatorNode(nodeId) {
        this.validatorNodes.add(nodeId);
        this.log(`Validator node added: ${nodeId}`);
    }

    removeValidatorNode(nodeId) {
        this.validatorNodes.delete(nodeId);
        this.log(`Validator node removed: ${nodeId}`);
    }

    getNetworkStats() {
        return {
            ...this.networkStats,
            chainLength: this.chain.length,
            pendingTransactions: this.pendingTransactions.length,
            validators: this.validatorNodes.size,
            lastBlockHash: this.getLatestBlock().hash,
            difficulty: this.difficulty
        };
    }

    exportChain() {
        return JSON.stringify(this.chain, null, 2);
    }

    importChain(chainData) {
        try {
            const importedChain = JSON.parse(chainData);
            
            // Validate imported chain
            const tempChain = this.chain;
            this.chain = importedChain;
            
            if (this.isChainValid()) {
                this.log('Chain imported successfully');
                this.recalculateStats();
                return true;
            } else {
                this.chain = tempChain;
                this.log('Invalid chain data - import failed');
                return false;
            }
        } catch (error) {
            this.log(`Chain import failed: ${error.message}`);
            return false;
        }
    }

    recalculateStats() {
        this.networkStats.totalBlocks = this.chain.length;
        this.networkStats.totalTransactions = 0;
        this.networkStats.totalValue = 0;

        for (const block of this.chain) {
            if (Array.isArray(block.data)) {
                this.networkStats.totalTransactions += block.data.length;
                this.networkStats.totalValue += block.data.reduce((sum, tx) => sum + tx.amount, 0);
            }
        }
    }

    // Advanced features for asset management integration
    createAssetTransaction(fromAddress, toAddress, assetId, amount, assetType) {
        const transaction = new Transaction(fromAddress, toAddress, amount, assetType);
        transaction.assetId = assetId;
        transaction.metadata = {
            assetType: assetType,
            createdAt: Date.now(),
            blockchain: 'Golab'
        };
        
        return transaction;
    }

    getAssetHistory(assetId) {
        const history = [];
        
        for (const block of this.chain) {
            if (Array.isArray(block.data)) {
                for (const transaction of block.data) {
                    if (transaction.assetId === assetId) {
                        history.push({
                            blockIndex: block.index,
                            timestamp: block.timestamp,
                            transaction: transaction
                        });
                    }
                }
            }
        }
        
        return history;
    }

    setDebugSystem(debugSystem) {
        this.debugSystem = debugSystem;
    }

    log(message) {
        if (this.debugSystem) {
            this.debugSystem.log('BlockchainCore', message);
        }
        console.log(`[BlockchainCore] ${message}`);
    }
}

// Export classes for use in other modules
window.BlockchainCore = BlockchainCore;
window.Transaction = Transaction;
window.Block = Block;