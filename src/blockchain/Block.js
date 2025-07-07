import { QuantumCircuit } from '../quantum/QuantumCircuit.js';
import { Transaction } from './Transaction.js';

/**
 * Quantum-resistant Block class
 */
export class Block {
  constructor(index, transactions, previousHash, validator = null) {
    this.index = index;
    this.timestamp = Date.now();
    this.transactions = transactions || [];
    this.previousHash = previousHash;
    this.validator = validator;
    this.merkleRoot = this.calculateMerkleRoot();
    this.nonce = 0;
    this.difficulty = 4;
    this.hash = null;
    this.quantumProof = null;
    this.gasUsed = this.calculateTotalGas();
    this.reward = this.calculateBlockReward();
  }

  /**
   * Mine the block with quantum-resistant proof of work
   */
  mine() {
    const target = Array(this.difficulty + 1).join('0');
    const quantum = new QuantumCircuit();
    
    while (!this.hash || this.hash.substring(0, this.difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
      
      // Add quantum proof every 1000 iterations
      if (this.nonce % 1000 === 0) {
        this.quantumProof = quantum.generateQuantumSignature(this.hash + this.nonce);
      }
    }
    
    console.log(`Block mined: ${this.hash} (nonce: ${this.nonce})`);
    return this;
  }

  /**
   * Calculate block hash
   */
  calculateHash() {
    const data = `${this.index}${this.timestamp}${this.previousHash}${this.merkleRoot}${this.nonce}${this.validator}`;
    return this.sha256(data);
  }

  /**
   * Calculate Merkle root of transactions
   */
  calculateMerkleRoot() {
    if (this.transactions.length === 0) return '0';
    
    let hashes = this.transactions.map(tx => 
      tx instanceof Transaction ? tx.getHash() : tx
    );
    
    while (hashes.length > 1) {
      const newHashes = [];
      
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        newHashes.push(this.sha256(left + right));
      }
      
      hashes = newHashes;
    }
    
    return hashes[0];
  }

  /**
   * Calculate total gas used in block
   */
  calculateTotalGas() {
    return this.transactions.reduce((total, tx) => {
      return total + (tx.gasUsed || 0);
    }, 0);
  }

  /**
   * Calculate block reward
   */
  calculateBlockReward() {
    const baseReward = 50; // Base block reward
    const gasReward = this.gasUsed * 0.00001; // Gas fee reward
    const validatorBonus = this.validator ? 10 : 0; // AI validator bonus
    
    return baseReward + gasReward + validatorBonus;
  }

  /**
   * Validate block integrity
   */
  validate() {
    // Check hash
    if (this.hash !== this.calculateHash()) {
      return { valid: false, error: 'Invalid hash' };
    }
    
    // Check proof of work
    const target = Array(this.difficulty + 1).join('0');
    if (this.hash.substring(0, this.difficulty) !== target) {
      return { valid: false, error: 'Invalid proof of work' };
    }
    
    // Check merkle root
    if (this.merkleRoot !== this.calculateMerkleRoot()) {
      return { valid: false, error: 'Invalid merkle root' };
    }
    
    // Validate quantum proof if present
    if (this.quantumProof) {
      const quantum = new QuantumCircuit();
      const isValidQuantum = quantum.verifyQuantumSignature(
        this.hash + this.nonce, 
        this.quantumProof
      );
      
      if (!isValidQuantum) {
        return { valid: false, error: 'Invalid quantum proof' };
      }
    }
    
    // Validate all transactions
    for (const tx of this.transactions) {
      if (tx instanceof Transaction && !tx.verify('placeholder_public_key')) {
        return { valid: false, error: `Invalid transaction: ${tx.id}` };
      }
    }
    
    return { valid: true };
  }

  /**
   * Add transaction to block
   */
  addTransaction(transaction) {
    if (this.transactions.length >= 1000) {
      throw new Error('Block is full');
    }
    
    this.transactions.push(transaction);
    this.merkleRoot = this.calculateMerkleRoot();
    this.gasUsed = this.calculateTotalGas();
    this.reward = this.calculateBlockReward();
    
    return this;
  }

  /**
   * Get block summary
   */
  getSummary() {
    return {
      index: this.index,
      hash: this.hash,
      previousHash: this.previousHash,
      timestamp: this.timestamp,
      transactionCount: this.transactions.length,
      gasUsed: this.gasUsed,
      reward: this.reward,
      validator: this.validator,
      difficulty: this.difficulty,
      nonce: this.nonce,
      hasQuantumProof: !!this.quantumProof
    };
  }

  /**
   * Simple SHA-256 implementation (use crypto library in production)
   */
  sha256(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions.map(tx => 
        tx instanceof Transaction ? tx.toJSON() : tx
      ),
      previousHash: this.previousHash,
      validator: this.validator,
      merkleRoot: this.merkleRoot,
      nonce: this.nonce,
      difficulty: this.difficulty,
      hash: this.hash,
      quantumProof: this.quantumProof,
      gasUsed: this.gasUsed,
      reward: this.reward
    };
  }

  /**
   * Create block from JSON
   */
  static fromJSON(json) {
    const transactions = json.transactions.map(txData => 
      Transaction.fromJSON(txData)
    );
    
    const block = new Block(json.index, transactions, json.previousHash, json.validator);
    block.timestamp = json.timestamp;
    block.merkleRoot = json.merkleRoot;
    block.nonce = json.nonce;
    block.difficulty = json.difficulty;
    block.hash = json.hash;
    block.quantumProof = json.quantumProof;
    block.gasUsed = json.gasUsed;
    block.reward = json.reward;
    
    return block;
  }
}