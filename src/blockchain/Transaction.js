import { QuantumCircuit } from '../quantum/QuantumCircuit.js';

/**
 * Quantum-resistant Transaction class
 */
export class Transaction {
  constructor(from, to, amount, data = null) {
    this.id = this.generateId();
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.data = data;
    this.timestamp = Date.now();
    this.quantumSignature = null;
    this.gasUsed = 0;
    this.status = 'pending';
  }

  /**
   * Generate unique transaction ID
   */
  generateId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `tx_${timestamp}_${random}`;
  }

  /**
   * Sign transaction with quantum-resistant signature
   */
  sign(privateKey) {
    const quantum = new QuantumCircuit();
    const message = this.getTransactionData();
    
    this.quantumSignature = quantum.generateQuantumSignature(message + privateKey);
    this.status = 'signed';
    
    return this;
  }

  /**
   * Verify quantum signature
   */
  verify(publicKey) {
    if (!this.quantumSignature) return false;
    
    const quantum = new QuantumCircuit();
    const message = this.getTransactionData();
    
    return quantum.verifyQuantumSignature(message + publicKey, this.quantumSignature);
  }

  /**
   * Get transaction data for hashing/signing
   */
  getTransactionData() {
    return `${this.from}${this.to}${this.amount}${this.timestamp}${JSON.stringify(this.data)}`;
  }

  /**
   * Calculate transaction hash
   */
  getHash() {
    const data = this.getTransactionData() + JSON.stringify(this.quantumSignature);
    return this.hash(data);
  }

  /**
   * Simple hash function (in production, use quantum-resistant hash)
   */
  hash(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Execute transaction (used by validators)
   */
  execute(validator) {
    if (this.status !== 'signed') {
      throw new Error('Transaction must be signed before execution');
    }

    this.gasUsed = this.calculateGasUsage();
    this.validator = validator;
    this.status = 'executed';
    
    return this;
  }

  /**
   * Calculate gas usage for this transaction
   */
  calculateGasUsage() {
    let baseGas = 21000; // Base transaction cost
    
    if (this.data) {
      baseGas += JSON.stringify(this.data).length * 68; // Data cost
    }
    
    if (this.amount > 1000000) {
      baseGas += 5000; // High value transaction
    }
    
    return baseGas;
  }

  /**
   * Get transaction summary
   */
  getSummary() {
    return {
      id: this.id,
      from: this.from,
      to: this.to,
      amount: this.amount,
      timestamp: this.timestamp,
      status: this.status,
      gasUsed: this.gasUsed,
      hash: this.getHash(),
      hasQuantumSignature: !!this.quantumSignature
    };
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      from: this.from,
      to: this.to,
      amount: this.amount,
      data: this.data,
      timestamp: this.timestamp,
      quantumSignature: this.quantumSignature,
      gasUsed: this.gasUsed,
      status: this.status,
      validator: this.validator
    };
  }

  /**
   * Create transaction from JSON
   */
  static fromJSON(json) {
    const tx = new Transaction(json.from, json.to, json.amount, json.data);
    tx.id = json.id;
    tx.timestamp = json.timestamp;
    tx.quantumSignature = json.quantumSignature;
    tx.gasUsed = json.gasUsed;
    tx.status = json.status;
    tx.validator = json.validator;
    return tx;
  }
}