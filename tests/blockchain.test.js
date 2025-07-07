import { QuantumCircuit } from '../src/quantum/QuantumCircuit.js';
import { Transaction } from '../src/blockchain/Transaction.js';
import { Block } from '../src/blockchain/Block.js';
import { Blockchain } from '../src/blockchain/Blockchain.js';
import { AIValidator } from '../src/validators/AIValidator.js';
import { ValidatorNetwork } from '../src/validators/ValidatorNetwork.js';

/**
 * Basic test suite for core blockchain functionality
 */
describe('GoLab Blockchain System Tests', () => {
  
  describe('Quantum Circuit', () => {
    test('should initialize with correct number of qubits', () => {
      const circuit = new QuantumCircuit();
      expect(circuit.qubits).toBe(3);
      expect(circuit.state).toHaveLength(8);
    });

    test('should generate quantum signatures', () => {
      const circuit = new QuantumCircuit();
      const message = 'test message';
      const signature = circuit.generateQuantumSignature(message);
      
      expect(signature).toHaveProperty('signature');
      expect(signature).toHaveProperty('timestamp');
      expect(signature).toHaveProperty('circuit_state');
      expect(signature).toHaveProperty('message_hash');
    });

    test('should verify quantum signatures', () => {
      const circuit = new QuantumCircuit();
      const message = 'test message';
      const signature = circuit.generateQuantumSignature(message);
      
      const isValid = circuit.verifyQuantumSignature(message, signature);
      expect(isValid).toBe(true);
    });
  });

  describe('Transaction', () => {
    test('should create transaction with quantum signature', () => {
      const tx = new Transaction('alice', 'bob', 100);
      tx.sign('private_key');
      
      expect(tx.from).toBe('alice');
      expect(tx.to).toBe('bob');
      expect(tx.amount).toBe(100);
      expect(tx.quantumSignature).toBeDefined();
      expect(tx.status).toBe('signed');
    });

    test('should calculate gas usage', () => {
      const tx = new Transaction('alice', 'bob', 100, { type: 'contract' });
      const gasUsed = tx.calculateGasUsage();
      
      expect(gasUsed).toBeGreaterThan(21000); // Base gas
    });

    test('should generate unique transaction IDs', () => {
      const tx1 = new Transaction('alice', 'bob', 100);
      const tx2 = new Transaction('alice', 'bob', 100);
      
      expect(tx1.id).not.toBe(tx2.id);
    });
  });

  describe('Block', () => {
    test('should create block with transactions', () => {
      const tx1 = new Transaction('alice', 'bob', 100);
      const tx2 = new Transaction('bob', 'charlie', 50);
      tx1.sign('key1');
      tx2.sign('key2');
      
      const block = new Block(1, [tx1, tx2], 'previous_hash');
      
      expect(block.index).toBe(1);
      expect(block.transactions).toHaveLength(2);
      expect(block.previousHash).toBe('previous_hash');
      expect(block.merkleRoot).toBeDefined();
    });

    test('should mine block with proof of work', () => {
      const block = new Block(1, [], 'previous_hash');
      block.mine();
      
      expect(block.hash).toBeDefined();
      expect(block.nonce).toBeGreaterThan(0);
      expect(block.hash.substring(0, block.difficulty)).toBe('0'.repeat(block.difficulty));
    });

    test('should validate block integrity', () => {
      const block = new Block(1, [], 'previous_hash');
      block.mine();
      
      const validation = block.validate();
      expect(validation.valid).toBe(true);
    });
  });

  describe('Blockchain', () => {
    test('should create genesis block', () => {
      const blockchain = new Blockchain();
      
      expect(blockchain.chain).toHaveLength(1);
      expect(blockchain.chain[0].index).toBe(0);
      expect(blockchain.chain[0].previousHash).toBe('0');
    });

    test('should add transactions and mine blocks', () => {
      const blockchain = new Blockchain();
      const tx = new Transaction('alice', 'bob', 100);
      tx.sign('key');
      
      blockchain.createTransaction(tx);
      expect(blockchain.pendingTransactions).toHaveLength(1);
      
      blockchain.minePendingTransactions('miner');
      expect(blockchain.chain).toHaveLength(2);
      expect(blockchain.pendingTransactions).toHaveLength(0);
    });

    test('should calculate balances correctly', () => {
      const blockchain = new Blockchain();
      
      // Create transactions
      const tx1 = new Transaction(null, 'alice', 1000); // Genesis/reward
      const tx2 = new Transaction('alice', 'bob', 300);
      tx1.sign('key');
      tx2.sign('key');
      
      blockchain.createTransaction(tx1);
      blockchain.createTransaction(tx2);
      blockchain.minePendingTransactions('miner');
      
      expect(blockchain.getBalance('alice')).toBe(700); // 1000 - 300
      expect(blockchain.getBalance('bob')).toBe(300);
    });

    test('should validate blockchain integrity', () => {
      const blockchain = new Blockchain();
      const tx = new Transaction('alice', 'bob', 100);
      tx.sign('key');
      
      blockchain.createTransaction(tx);
      blockchain.minePendingTransactions('miner');
      
      const validation = blockchain.isChainValid();
      expect(validation.valid).toBe(true);
    });
  });

  describe('AI Validator', () => {
    test('should create validator with correct properties', () => {
      const validator = new AIValidator('val1', 'owner', 1000);
      
      expect(validator.id).toBe('val1');
      expect(validator.owner).toBe('owner');
      expect(validator.stake).toBe(1000);
      expect(validator.active).toBe(true);
      expect(validator.reputation).toBe(100);
      expect(validator.specialization).toBeDefined();
    });

    test('should validate transactions and reduce gas', () => {
      const validator = new AIValidator('val1', 'owner', 1000);
      const tx = new Transaction('alice', 'bob', 100);
      tx.sign('key');
      
      const result = validator.validateTransaction(tx);
      
      expect(result.valid).toBe(true);
      expect(result.gasReduction).toBeGreaterThanOrEqual(0);
      expect(result.processingFee).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should replicate to create child validators', () => {
      const parent = new AIValidator('parent', 'owner1', 5000);
      parent.reputation = 90;
      
      const child = parent.replicate('owner2');
      
      expect(child.parent).toBe('parent');
      expect(child.generation).toBe(1);
      expect(child.specialization).toBe(parent.specialization);
      expect(parent.children).toContain(child.id);
    });

    test('should generate NFT properties', () => {
      const validator = new AIValidator('val1', 'owner', 1000);
      
      expect(validator.nftProperties).toHaveProperty('name');
      expect(validator.nftProperties).toHaveProperty('description');
      expect(validator.nftProperties).toHaveProperty('attributes');
      expect(validator.nftProperties.attributes).toBeInstanceOf(Array);
    });
  });

  describe('Validator Network', () => {
    test('should register validators', () => {
      const network = new ValidatorNetwork();
      const validator = network.registerValidator('owner', 1000, 'security');
      
      expect(network.validators.size).toBe(1);
      expect(network.activeValidators.size).toBe(1);
      expect(validator.specialization).toBe('security');
    });

    test('should validate transactions with consensus', async () => {
      const network = new ValidatorNetwork();
      network.registerValidator('owner1', 1000, 'security');
      network.registerValidator('owner2', 1500, 'defi');
      
      const tx = new Transaction('alice', 'bob', 100);
      tx.sign('key');
      
      const result = await network.validateTransaction(tx);
      
      expect(result.valid).toBe(true);
      expect(result.gasReduction).toBeGreaterThanOrEqual(0);
      expect(result.validators).toBeGreaterThan(0);
    });

    test('should manage validator replication', () => {
      const network = new ValidatorNetwork();
      const parent = network.registerValidator('owner1', 5000, 'security');
      parent.reputation = 85;
      
      const child = network.replicateValidator(parent.id, 'owner2');
      
      expect(network.validators.size).toBe(2);
      expect(child.parent).toBe(parent.id);
      expect(child.generation).toBe(1);
    });
  });

});

// Mock test runner for browser environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    describe,
    test: it,
    expect
  };
}

// Simple test framework for browser
function describe(name, fn) {
  console.group(`Testing: ${name}`);
  try {
    fn();
    console.log('✅ All tests passed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  console.groupEnd();
}

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}:`, error);
    throw error;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toHaveLength: (expected) => {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected}, got ${actual.length}`);
      }
    },
    toHaveProperty: (property) => {
      if (!(property in actual)) {
        throw new Error(`Expected object to have property ${property}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeInstanceOf: (constructor) => {
      if (!(actual instanceof constructor)) {
        throw new Error(`Expected instance of ${constructor.name}`);
      }
    },
    toContain: (item) => {
      if (!actual.includes(item)) {
        throw new Error(`Expected array to contain ${item}`);
      }
    }
  };
}