/**
 * Main Application Entry Point
 * Initializes and coordinates all system components
 */

class GolabApplication {
    constructor() {
        this.debugSystem = null;
        this.quantumProcessor = null;
        this.blockchainCore = null;
        this.assetManager = null;
        this.threeJSIntegration = null;
        this.isInitialized = false;
        this.updateInterval = null;
    }

    /**
     * Initialize the complete Golab system
     */
    async initialize() {
        try {
            this.updateOverlay('Initializing Debug System...');
            this.initializeDebugSystem();

            this.updateOverlay('Initializing Quantum Processor...');
            this.initializeQuantumProcessor();

            this.updateOverlay('Initializing Blockchain Core...');
            this.initializeBlockchainCore();

            this.updateOverlay('Initializing Asset Manager...');
            this.initializeAssetManager();

            this.updateOverlay('Initializing Three.js Integration...');
            this.initializeThreeJSIntegration();

            this.updateOverlay('Creating Demo Assets...');
            this.createDemoAssets();

            this.updateOverlay('Starting System Monitoring...');
            this.startSystemMonitoring();

            this.updateOverlay('System Ready!');
            this.isInitialized = true;

            // Auto-hide overlay after successful initialization
            setTimeout(() => {
                const overlay = document.getElementById('overlay');
                if (overlay) overlay.style.display = 'none';
            }, 2000);

            this.debugSystem.info('GolabApplication', 'System initialization completed successfully');
            
            // Run initial demonstrations
            this.runInitialDemonstrations();

        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize the debug system
     */
    initializeDebugSystem() {
        this.debugSystem = new DebugSystem();
        this.debugSystem.setLogLevel('INFO');
        this.debugSystem.info('GolabApplication', 'Debug system initialized');
    }

    /**
     * Initialize the quantum processor
     */
    initializeQuantumProcessor() {
        this.quantumProcessor = new QuantumProcessor();
        this.quantumProcessor.setDebugSystem(this.debugSystem);
        
        // Test quantum circuit
        this.quantumProcessor.createSignatureCircuit();
        
        this.debugSystem.info('GolabApplication', 'Quantum processor initialized with 3-qubit circuit');
    }

    /**
     * Initialize the blockchain core
     */
    initializeBlockchainCore() {
        this.blockchainCore = new BlockchainCore(this.quantumProcessor);
        this.blockchainCore.setDebugSystem(this.debugSystem);
        
        // Add validator nodes
        this.blockchainCore.addValidatorNode('node_1');
        this.blockchainCore.addValidatorNode('node_2');
        
        this.debugSystem.info('GolabApplication', 'Blockchain core initialized with quantum signatures');
    }

    /**
     * Initialize the asset manager
     */
    initializeAssetManager() {
        this.assetManager = new AssetManager(this.blockchainCore, this.quantumProcessor);
        this.assetManager.setDebugSystem(this.debugSystem);
        
        this.debugSystem.info('GolabApplication', 'Asset manager initialized');
    }

    /**
     * Initialize Three.js integration
     */
    initializeThreeJSIntegration() {
        this.threeJSIntegration = new ThreeJSIntegration();
        this.threeJSIntegration.initialize(
            this.quantumProcessor,
            this.blockchainCore,
            this.assetManager,
            this.debugSystem
        );
        
        this.debugSystem.info('GolabApplication', 'Three.js integration initialized');
    }

    /**
     * Create demonstration assets
     */
    createDemoAssets() {
        // Create ERC20 tokens
        const golabToken = this.assetManager.createERC20Asset(
            'Golab Token',
            'GLAB',
            'genesis_wallet',
            1000000,
            18
        );

        const quantumCoin = this.assetManager.createERC20Asset(
            'Quantum Coin',
            'QCOIN',
            'quantum_wallet',
            500000,
            8
        );

        // Create NFTs
        const quantumArt = this.assetManager.createNFTAsset(
            'Quantum Entanglement Art #1',
            'QEA',
            'artist_wallet',
            'https://example.com/quantum-art.json',
            {
                rarity: 'legendary',
                entanglement_level: 100,
                qubits_used: 3,
                artist: 'Quantum Artist'
            }
        );

        const blockchainBadge = this.assetManager.createNFTAsset(
            'Blockchain Pioneer Badge',
            'BPB',
            'pioneer_wallet',
            'https://example.com/badge.json',
            {
                rarity: 'rare',
                achievement: 'first_quantum_signature',
                blocks_mined: 10
            }
        );

        // Create smart contract
        const votingContract = this.assetManager.createContractAsset(
            'Quantum Voting Contract',
            'dao_wallet',
            `
                // Quantum-secured voting contract
                contract QuantumVoting {
                    mapping(address => bool) public hasVoted;
                    mapping(string => uint256) public votes;
                    address public owner;
                    
                    constructor() {
                        owner = msg.sender;
                    }
                    
                    function vote(string memory candidate) public {
                        require(!hasVoted[msg.sender], "Already voted");
                        hasVoted[msg.sender] = true;
                        votes[candidate]++;
                    }
                }
            `,
            [
                { name: 'vote', inputs: ['string'], outputs: [] },
                { name: 'hasVoted', inputs: ['address'], outputs: ['bool'] },
                { name: 'votes', inputs: ['string'], outputs: ['uint256'] }
            ]
        );

        // Create quantum asset
        const quantumCircuit = this.assetManager.createQuantumAsset(
            'Entangled Signature Circuit',
            'quantum_lab',
            {
                gates: [
                    { type: 'H', qubit: 0 },
                    { type: 'H', qubit: 1 },
                    { type: 'H', qubit: 2 },
                    { type: 'CNOT', control: 0, target: 1 },
                    { type: 'CNOT', control: 1, target: 2 },
                    { type: 'Z', qubit: 0 },
                    { type: 'Z', qubit: 2 },
                    { type: 'CNOT', control: 0, target: 2 }
                ]
            }
        );

        this.debugSystem.info('GolabApplication', 'Demo assets created successfully');
        
        // Store references for easy access
        this.demoAssets = {
            golabToken,
            quantumCoin,
            quantumArt,
            blockchainBadge,
            votingContract,
            quantumCircuit
        };
    }

    /**
     * Run initial system demonstrations
     */
    runInitialDemonstrations() {
        setTimeout(() => {
            this.demonstrateTokenTransfer();
        }, 3000);

        setTimeout(() => {
            this.demonstrateQuantumSignature();
        }, 6000);

        setTimeout(() => {
            this.demonstrateBlockMining();
        }, 9000);

        setTimeout(() => {
            this.demonstrateAssetValuation();
        }, 12000);
    }

    /**
     * Demonstrate token transfer
     */
    demonstrateTokenTransfer() {
        try {
            const { golabToken } = this.demoAssets;
            
            // Transfer tokens between wallets
            this.assetManager.transferAsset(
                golabToken.id,
                'genesis_wallet',
                'user_wallet_1',
                1000
            );

            this.assetManager.transferAsset(
                golabToken.id,
                'genesis_wallet',
                'user_wallet_2',
                500
            );

            this.debugSystem.info('GolabApplication', 'Token transfer demonstration completed');
        } catch (error) {
            this.debugSystem.error('GolabApplication', `Token transfer demonstration failed: ${error.message}`);
        }
    }

    /**
     * Demonstrate quantum signature generation
     */
    demonstrateQuantumSignature() {
        try {
            const signature = this.quantumProcessor.generateQuantumSignature({
                message: 'Golab quantum blockchain demonstration',
                timestamp: Date.now(),
                sender: 'demo_user'
            });

            this.debugSystem.info('GolabApplication', `Quantum signature generated: ${signature.substring(0, 20)}...`);
        } catch (error) {
            this.debugSystem.error('GolabApplication', `Quantum signature demonstration failed: ${error.message}`);
        }
    }

    /**
     * Demonstrate block mining
     */
    demonstrateBlockMining() {
        try {
            // Create some transactions first
            const transaction1 = new Transaction('user_wallet_1', 'user_wallet_2', 50);
            transaction1.signTransaction(this.quantumProcessor);
            this.blockchainCore.addTransaction(transaction1);

            const transaction2 = new Transaction('user_wallet_2', 'user_wallet_3', 25);
            transaction2.signTransaction(this.quantumProcessor);
            this.blockchainCore.addTransaction(transaction2);

            // Mine the block
            this.blockchainCore.minePendingTransactions('miner_wallet');

            this.debugSystem.info('GolabApplication', 'Block mining demonstration completed');
        } catch (error) {
            this.debugSystem.error('GolabApplication', `Block mining demonstration failed: ${error.message}`);
        }
    }

    /**
     * Demonstrate asset valuation
     */
    demonstrateAssetValuation() {
        try {
            const { quantumArt, golabToken } = this.demoAssets;
            
            const nftValuation = this.assetManager.valuateAsset(quantumArt.id);
            const tokenValuation = this.assetManager.valuateAsset(golabToken.id);

            this.debugSystem.info('GolabApplication', 
                `Asset valuations - NFT: $${nftValuation.totalValue.toFixed(2)}, Token: $${tokenValuation.totalValue.toFixed(2)}`
            );
        } catch (error) {
            this.debugSystem.error('GolabApplication', `Asset valuation demonstration failed: ${error.message}`);
        }
    }

    /**
     * Start system monitoring and periodic updates
     */
    startSystemMonitoring() {
        this.updateInterval = setInterval(() => {
            this.updateSystemStatus();
        }, 5000); // Update every 5 seconds

        this.debugSystem.info('GolabApplication', 'System monitoring started');
    }

    /**
     * Update system status displays
     */
    updateSystemStatus() {
        if (!this.isInitialized) return;

        try {
            // Update quantum status
            const quantumInfo = this.quantumProcessor.getStateInfo();
            this.threeJSIntegration.updateQuantumStatus(quantumInfo);

            // Update blockchain status
            const blockchainStats = this.blockchainCore.getNetworkStats();
            this.threeJSIntegration.updateBlockchainStatus(blockchainStats);

            // Update debug metrics
            this.updateDebugMetrics();

        } catch (error) {
            this.debugSystem.error('GolabApplication', `Status update failed: ${error.message}`);
        }
    }

    /**
     * Update debug metrics
     */
    updateDebugMetrics() {
        const assetStats = this.assetManager.getAssetStats();
        const quantumInfo = this.quantumProcessor.getStateInfo();
        const blockchainStats = this.blockchainCore.getNetworkStats();

        // Update metrics in debug system
        this.debugSystem.setMetric('total_assets', assetStats.totalAssets);
        this.debugSystem.setMetric('total_asset_value', assetStats.totalValue);
        this.debugSystem.setMetric('quantum_entangled', quantumInfo.entangled ? 1 : 0);
        this.debugSystem.setMetric('blockchain_length', blockchainStats.chainLength);
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('Initialization failed:', error);
        
        this.updateOverlay(`<p style="color: red;">Initialization failed: ${error.message}</p>`);
        
        if (this.debugSystem) {
            this.debugSystem.error('GolabApplication', `Initialization failed: ${error.message}`, error);
        }
    }

    /**
     * Update the loading overlay
     */
    updateOverlay(content) {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.innerHTML = content;
        }
    }

    /**
     * Public API methods for external interaction
     */
    getSystemStatus() {
        if (!this.isInitialized) {
            return { status: 'not_initialized' };
        }

        return {
            status: 'running',
            quantum: this.quantumProcessor.getStateInfo(),
            blockchain: this.blockchainCore.getNetworkStats(),
            assets: this.assetManager.getAssetStats(),
            debug: this.debugSystem.getPerformanceReport()
        };
    }

    createAsset(type, params) {
        if (!this.isInitialized) {
            throw new Error('System not initialized');
        }

        switch (type) {
            case 'ERC20':
                return this.assetManager.createERC20Asset(
                    params.name,
                    params.symbol,
                    params.owner,
                    params.totalSupply,
                    params.decimals
                );
            case 'NFT':
                return this.assetManager.createNFTAsset(
                    params.name,
                    params.symbol,
                    params.owner,
                    params.tokenURI,
                    params.attributes
                );
            default:
                throw new Error(`Unsupported asset type: ${type}`);
        }
    }

    transferAsset(assetId, from, to, amount) {
        if (!this.isInitialized) {
            throw new Error('System not initialized');
        }

        return this.assetManager.transferAsset(assetId, from, to, amount);
    }

    mineBlock(minerAddress) {
        if (!this.isInitialized) {
            throw new Error('System not initialized');
        }

        return this.blockchainCore.minePendingTransactions(minerAddress);
    }

    generateQuantumSignature(data) {
        if (!this.isInitialized) {
            throw new Error('System not initialized');
        }

        return this.quantumProcessor.generateQuantumSignature(data);
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        if (this.debugSystem) {
            this.debugSystem.info('GolabApplication', 'System shutdown initiated');
        }

        this.isInitialized = false;
    }
}

// Global application instance
let golabApp = null;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    golabApp = new GolabApplication();
    golabApp.initialize();
});

// Expose API globally for external access
window.GolabAPI = {
    getStatus: () => golabApp ? golabApp.getSystemStatus() : { status: 'not_ready' },
    createAsset: (type, params) => golabApp ? golabApp.createAsset(type, params) : null,
    transferAsset: (assetId, from, to, amount) => golabApp ? golabApp.transferAsset(assetId, from, to, amount) : null,
    mineBlock: (minerAddress) => golabApp ? golabApp.mineBlock(minerAddress) : null,
    generateSignature: (data) => golabApp ? golabApp.generateQuantumSignature(data) : null
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GolabApplication;
}