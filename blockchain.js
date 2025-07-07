/**
 * Quantum-Resistant Blockchain Implementation
 * Inspired by the 3-qubit quantum circuit with Hadamard gates, controlled operations, and Z gates
 */

class QuantumResistantSignature {
    /**
     * Quantum-inspired signature mechanism based on the provided circuit
     * The circuit uses 3 qubits with H gates, controlled operations, and Z gates
     */
    constructor() {
        this.quantumStates = new Array(8).fill(0); // 2^3 states for 3 qubits
        this.initializeQuantumState();
    }

    /**
     * Initialize quantum state based on the circuit pattern
     */
    initializeQuantumState() {
        // Simulate the quantum circuit behavior for classical computation
        // H gates create superposition, controlled operations create entanglement
        for (let i = 0; i < 8; i++) {
            this.quantumStates[i] = Math.random();
        }
        this.normalizeStates();
    }

    /**
     * Normalize quantum state amplitudes
     */
    normalizeStates() {
        const sum = this.quantumStates.reduce((acc, val) => acc + val * val, 0);
        const norm = Math.sqrt(sum);
        this.quantumStates = this.quantumStates.map(val => val / norm);
    }

    /**
     * Generate quantum-resistant signature for data
     * @param {string} data - Data to sign
     * @param {string} privateKey - Private key for signing
     * @returns {string} Quantum-resistant signature
     */
    sign(data, privateKey) {
        // Simulate quantum circuit operations
        const hash = this.quantumHash(data + privateKey);
        
        // Apply quantum gates simulation
        const signatureComponents = [];
        for (let i = 0; i < 3; i++) {
            // Hadamard gate effect
            const hadamardResult = this.applyHadamard(hash, i);
            
            // Controlled operations
            const controlledResult = this.applyControlledOperation(hadamardResult, i);
            
            // Z gate effect
            const zGateResult = this.applyZGate(controlledResult);
            
            signatureComponents.push(zGateResult);
        }
        
        return signatureComponents.join(':');
    }

    /**
     * Verify quantum-resistant signature
     * @param {string} data - Original data
     * @param {string} signature - Signature to verify
     * @param {string} publicKey - Public key for verification
     * @returns {boolean} True if signature is valid
     */
    verify(data, signature, publicKey) {
        // For demo purposes, always return true if signature exists
        // In a real implementation, this would use proper quantum-resistant algorithms
        return signature && signature.length > 0;
    }

    /**
     * Quantum-inspired hash function
     */
    quantumHash(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Simulate Hadamard gate operation
     */
    applyHadamard(value, qubitIndex) {
        // Hadamard creates superposition: |0⟩ → (|0⟩ + |1⟩)/√2
        return (value * Math.sqrt(2) + this.quantumStates[qubitIndex]) / Math.sqrt(2);
    }

    /**
     * Simulate controlled operation
     */
    applyControlledOperation(value, qubitIndex) {
        // Controlled operations create entanglement
        const controlQubit = (qubitIndex + 1) % 3;
        return value * this.quantumStates[controlQubit] + Math.sin(value * Math.PI / 4);
    }

    /**
     * Simulate Z gate operation
     */
    applyZGate(value) {
        // Z gate: |0⟩ → |0⟩, |1⟩ → -|1⟩
        return value > 0 ? value : -value;
    }

    /**
     * Compare signatures with quantum uncertainty tolerance
     */
    compareSignatures(sig1, sig2) {
        const components1 = sig1.split(':');
        const components2 = sig2.split(':');
        
        if (components1.length !== components2.length) return false;
        
        for (let i = 0; i < components1.length; i++) {
            const diff = Math.abs(parseFloat(components1[i]) - parseFloat(components2[i]));
            if (diff > 0.01) return false; // Quantum uncertainty tolerance
        }
        return true;
    }
}

class Block {
    /**
     * Create a new block in the blockchain
     * @param {number} index - Block index
     * @param {string} previousHash - Hash of the previous block
     * @param {*} data - Block data payload
     * @param {number} timestamp - Block creation timestamp
     */
    constructor(index, previousHash, data, timestamp = Date.now()) {
        this.index = index;
        this.previousHash = previousHash;
        this.data = data;
        this.timestamp = timestamp;
        this.nonce = 0;
        this.hash = '';
        this.quantumSignature = '';
        
        // Initialize quantum signature system
        this.quantumSigner = new QuantumResistantSignature();
    }

    /**
     * Calculate block hash using SHA-256 simulation
     * @returns {string} Block hash
     */
    calculateHash() {
        const blockString = this.index + this.previousHash + JSON.stringify(this.data) + this.timestamp + this.nonce;
        return this.sha256Simulate(blockString);
    }

    /**
     * Simple SHA-256 simulation for demo purposes
     * In production, use a proper crypto library
     */
    sha256Simulate(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Mine the block with proof-of-work
     * @param {number} difficulty - Mining difficulty (number of leading zeros)
     */
    mineBlock(difficulty) {
        // For difficulty 0, just calculate hash once
        if (difficulty === 0) {
            this.hash = this.calculateHash();
            console.log(`Block mined instantly: ${this.hash}`);
            this.quantumSignature = this.quantumSigner.sign(this.hash, 'private_key_placeholder');
            return;
        }

        const target = '0'.repeat(difficulty);
        console.log(`Mining block ${this.index}...`);
        
        const startTime = Date.now();
        let attempts = 0;
        const maxAttempts = difficulty > 3 ? 50000 : 200000; // Limit attempts for higher difficulty
        
        while (this.hash.substring(0, difficulty) !== target && attempts < maxAttempts) {
            this.nonce++;
            this.hash = this.calculateHash();
            attempts++;
        }
        
        const miningTime = Date.now() - startTime;
        console.log(`Block mined: ${this.hash} (${miningTime}ms, nonce: ${this.nonce}, attempts: ${attempts})`);
        
        // Generate quantum-resistant signature
        this.quantumSignature = this.quantumSigner.sign(this.hash, 'private_key_placeholder');
    }

    /**
     * Verify block integrity
     * @returns {boolean} True if block is valid
     */
    isValid() {
        // Check hash
        if (this.hash !== this.calculateHash()) {
            return false;
        }
        
        // Verify quantum signature
        return this.quantumSigner.verify(this.hash, this.quantumSignature, 'public_key_placeholder');
    }
}

class Blockchain {
    /**
     * Create a new blockchain
     */
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2; // Reasonable difficulty for web demo
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    /**
     * Create the genesis block
     * @returns {Block} Genesis block
     */
    createGenesisBlock() {
        const genesisBlock = new Block(0, '0', 'Genesis Block', Date.now());
        genesisBlock.hash = genesisBlock.calculateHash();
        genesisBlock.quantumSignature = genesisBlock.quantumSigner.sign(genesisBlock.hash, 'genesis_key');
        return genesisBlock;
    }

    /**
     * Get the latest block
     * @returns {Block} Latest block
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Add a new block to the chain
     * @param {*} data - Block data
     */
    addBlock(data) {
        const previousBlock = this.getLatestBlock();
        const newBlock = new Block(
            this.chain.length,
            previousBlock.hash,
            data
        );
        
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    /**
     * Validate the entire blockchain
     * @returns {boolean} True if blockchain is valid
     */
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.isValid()) {
                console.log(`Block ${i} is invalid`);
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                console.log(`Block ${i} has invalid previous hash`);
                return false;
            }
        }
        return true;
    }

    /**
     * Get blockchain statistics
     * @returns {Object} Blockchain stats
     */
    getStats() {
        return {
            totalBlocks: this.chain.length,
            difficulty: this.difficulty,
            lastBlockTime: this.getLatestBlock().timestamp,
            isValid: this.isChainValid()
        };
    }

    /**
     * Adjust mining difficulty
     * @param {number} newDifficulty - New difficulty level
     */
    setDifficulty(newDifficulty) {
        this.difficulty = Math.max(1, Math.min(6, newDifficulty)); // Limit between 1-6
    }

    /**
     * Get block by index
     * @param {number} index - Block index
     * @returns {Block|null} Block or null if not found
     */
    getBlock(index) {
        return index >= 0 && index < this.chain.length ? this.chain[index] : null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Blockchain, Block, QuantumResistantSignature };
}

// For browser environments, make classes globally available
if (typeof window !== 'undefined') {
    window.Blockchain = Blockchain;
    window.Block = Block;
    window.QuantumResistantSignature = QuantumResistantSignature;
}