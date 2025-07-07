import { Block } from './Block.js';
import { Transaction } from './Transaction.js';

/**
 * Main Blockchain class with quantum-resistant features
 */
export class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 4;
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.wallets = new Map();
    this.validators = new Set();
    this.stats = {
      totalBlocks: 1,
      totalTransactions: 0,
      totalGasUsed: 0,
      totalRewards: 0
    };
  }

  /**
   * Create the genesis block
   */
  createGenesisBlock() {
    const genesisBlock = new Block(0, [], '0', 'genesis');
    genesisBlock.hash = genesisBlock.calculateHash();
    return genesisBlock;
  }

  /**
   * Get the latest block
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a new transaction to pending pool
   */
  createTransaction(transaction) {
    if (!(transaction instanceof Transaction)) {
      throw new Error('Invalid transaction object');
    }

    // Validate transaction
    if (!this.validateTransaction(transaction)) {
      throw new Error('Invalid transaction');
    }

    this.pendingTransactions.push(transaction);
    return transaction.id;
  }

  /**
   * Mine pending transactions into a new block
   */
  minePendingTransactions(miningRewardAddress, validator = null) {
    // Create reward transaction
    const rewardTransaction = new Transaction(
      null, 
      miningRewardAddress, 
      this.miningReward,
      { type: 'mining_reward' }
    );

    // Add pending transactions to block
    const transactions = [rewardTransaction, ...this.pendingTransactions];
    
    const block = new Block(
      this.chain.length,
      transactions,
      this.getLatestBlock().hash,
      validator
    );

    // Mine the block
    block.mine();

    // Validate and add to chain
    const validation = block.validate();
    if (!validation.valid) {
      throw new Error(`Block validation failed: ${validation.error}`);
    }

    this.chain.push(block);
    
    // Update statistics
    this.updateStats(block);
    
    // Clear pending transactions
    this.pendingTransactions = [];

    console.log(`Block ${block.index} mined successfully!`);
    return block;
  }

  /**
   * Validate a transaction
   */
  validateTransaction(transaction) {
    // Check if transaction is properly signed
    if (!transaction.quantumSignature) {
      return false;
    }

    // Check if sender has sufficient balance (if not a genesis transaction)
    if (transaction.from !== null) {
      const balance = this.getBalance(transaction.from);
      if (balance < transaction.amount) {
        return false;
      }
    }

    // Additional validation rules can be added here
    return true;
  }

  /**
   * Get balance for an address
   */
  getBalance(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.from === address) {
          balance -= transaction.amount;
        }
        if (transaction.to === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  /**
   * Validate the entire blockchain
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Validate current block
      const validation = currentBlock.validate();
      if (!validation.valid) {
        return { valid: false, error: `Block ${i}: ${validation.error}` };
      }

      // Check if previous hash matches
      if (currentBlock.previousHash !== previousBlock.hash) {
        return { 
          valid: false, 
          error: `Block ${i}: Previous hash mismatch` 
        };
      }
    }

    return { valid: true };
  }

  /**
   * Get transaction by ID
   */
  getTransaction(transactionId) {
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.id === transactionId) {
          return {
            transaction,
            block: block.getSummary(),
            confirmations: this.chain.length - block.index
          };
        }
      }
    }
    return null;
  }

  /**
   * Get all transactions for an address
   */
  getTransactionHistory(address) {
    const history = [];

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.from === address || transaction.to === address) {
          history.push({
            transaction: transaction.getSummary ? transaction.getSummary() : transaction,
            block: block.getSummary(),
            confirmations: this.chain.length - block.index
          });
        }
      }
    }

    return history.sort((a, b) => b.transaction.timestamp - a.transaction.timestamp);
  }

  /**
   * Register a new validator
   */
  registerValidator(validatorId) {
    this.validators.add(validatorId);
    return true;
  }

  /**
   * Remove a validator
   */
  removeValidator(validatorId) {
    return this.validators.delete(validatorId);
  }

  /**
   * Get all validators
   */
  getValidators() {
    return Array.from(this.validators);
  }

  /**
   * Update blockchain statistics
   */
  updateStats(block) {
    this.stats.totalBlocks++;
    this.stats.totalTransactions += block.transactions.length;
    this.stats.totalGasUsed += block.gasUsed;
    this.stats.totalRewards += block.reward;
  }

  /**
   * Get blockchain statistics
   */
  getStats() {
    return {
      ...this.stats,
      chainLength: this.chain.length,
      difficulty: this.difficulty,
      pendingTransactions: this.pendingTransactions.length,
      validators: this.validators.size,
      lastBlockTime: this.getLatestBlock().timestamp
    };
  }

  /**
   * Get recent blocks
   */
  getRecentBlocks(count = 10) {
    const startIndex = Math.max(0, this.chain.length - count);
    return this.chain.slice(startIndex).map(block => block.getSummary());
  }

  /**
   * Get pending transactions
   */
  getPendingTransactions() {
    return this.pendingTransactions.map(tx => tx.getSummary());
  }

  /**
   * Create a new wallet
   */
  createWallet(address) {
    if (this.wallets.has(address)) {
      throw new Error('Wallet already exists');
    }

    const wallet = {
      address,
      balance: 0,
      created: Date.now(),
      transactions: []
    };

    this.wallets.set(address, wallet);
    return wallet;
  }

  /**
   * Get wallet information
   */
  getWallet(address) {
    const balance = this.getBalance(address);
    const history = this.getTransactionHistory(address);
    
    return {
      address,
      balance,
      transactionCount: history.length,
      history: history.slice(0, 10) // Last 10 transactions
    };
  }

  /**
   * Export blockchain data
   */
  export() {
    return {
      chain: this.chain.map(block => block.toJSON()),
      difficulty: this.difficulty,
      pendingTransactions: this.pendingTransactions.map(tx => tx.toJSON()),
      miningReward: this.miningReward,
      validators: Array.from(this.validators),
      stats: this.stats
    };
  }

  /**
   * Import blockchain data
   */
  import(data) {
    this.chain = data.chain.map(blockData => Block.fromJSON(blockData));
    this.difficulty = data.difficulty;
    this.pendingTransactions = data.pendingTransactions.map(txData => 
      Transaction.fromJSON(txData)
    );
    this.miningReward = data.miningReward;
    this.validators = new Set(data.validators);
    this.stats = data.stats;
  }
}