/**
 * Blockchain UI Controls
 * Provides user interface for blockchain interaction
 */

class BlockchainUI {
    /**
     * Initialize blockchain UI
     * @param {BlockchainVisualization} blockchainViz - Blockchain visualization instance
     */
    constructor(blockchainViz) {
        this.blockchainViz = blockchainViz;
        this.isVisible = true;
        this.selectedBlock = null;
        
        this.createUI();
        this.bindEvents();
    }

    /**
     * Create the blockchain UI elements
     */
    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'blockchain-ui';
        this.container.innerHTML = `
            <div class="blockchain-panel">
                <div class="panel-header">
                    <h3>Quantum Blockchain</h3>
                    <button id="toggle-blockchain" class="toggle-btn">Hide</button>
                </div>
                
                <div class="blockchain-stats">
                    <div class="stat-item">
                        <span class="stat-label">Blocks:</span>
                        <span id="block-count" class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Difficulty:</span>
                        <span id="difficulty-value" class="stat-value">2</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Status:</span>
                        <span id="chain-status" class="stat-value valid">Valid</span>
                    </div>
                </div>

                <div class="blockchain-controls">
                    <div class="control-group">
                        <label for="block-data">Block Data:</label>
                        <input type="text" id="block-data" placeholder="Enter transaction data..." />
                        <button id="add-block" class="action-btn">Mine Block</button>
                    </div>
                    
                    <div class="control-group">
                        <label for="difficulty-slider">Difficulty:</label>
                        <input type="range" id="difficulty-slider" min="1" max="6" value="2" />
                        <span id="difficulty-display">2</span>
                    </div>
                    
                    <div class="control-group">
                        <button id="validate-chain" class="action-btn">Validate Chain</button>
                        <button id="demo-transactions" class="action-btn">Demo Transactions</button>
                    </div>
                </div>

                <div class="block-info" id="block-info" style="display: none;">
                    <h4>Block Details</h4>
                    <div id="block-details"></div>
                </div>
            </div>
        `;

        // Add styles
        this.addStyles();
        
        // Append to body
        document.body.appendChild(this.container);
    }

    /**
     * Add CSS styles for the blockchain UI
     */
    addStyles() {
        const styles = `
            #blockchain-ui {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 1000;
                font-family: 'Inter', sans-serif;
                max-width: 350px;
                transition: all 0.3s ease;
            }

            .blockchain-panel {
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                padding: 20px;
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }

            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 10px;
            }

            .panel-header h3 {
                margin: 0;
                color: #4fc3f7;
                font-size: 18px;
                font-weight: 600;
            }

            .toggle-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }

            .toggle-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .blockchain-stats {
                margin-bottom: 15px;
            }

            .stat-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
            }

            .stat-label {
                color: #b0bec5;
            }

            .stat-value {
                font-weight: 500;
                color: #4fc3f7;
            }

            .stat-value.valid {
                color: #4caf50;
            }

            .stat-value.invalid {
                color: #f44336;
            }

            .blockchain-controls {
                margin-bottom: 15px;
            }

            .control-group {
                margin-bottom: 15px;
            }

            .control-group label {
                display: block;
                margin-bottom: 5px;
                font-size: 14px;
                color: #b0bec5;
            }

            .control-group input[type="text"] {
                width: 100%;
                padding: 8px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 14px;
                margin-bottom: 8px;
            }

            .control-group input[type="text"]:focus {
                outline: none;
                border-color: #4fc3f7;
                box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.2);
            }

            .control-group input[type="range"] {
                width: calc(100% - 40px);
                margin-right: 10px;
            }

            .action-btn {
                background: linear-gradient(135deg, #4fc3f7, #29b6f6);
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                margin-right: 8px;
                margin-bottom: 8px;
            }

            .action-btn:hover {
                background: linear-gradient(135deg, #29b6f6, #0288d1);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(79, 195, 247, 0.3);
            }

            .action-btn:active {
                transform: translateY(0);
            }

            .block-info {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 15px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .block-info h4 {
                margin: 0 0 10px 0;
                color: #4fc3f7;
                font-size: 16px;
            }

            #block-details {
                font-size: 12px;
                line-height: 1.4;
            }

            #block-details div {
                margin-bottom: 5px;
                word-break: break-all;
            }

            .hidden {
                transform: translateX(100%);
                opacity: 0;
            }

            @media (max-width: 768px) {
                #blockchain-ui {
                    right: 5px;
                    left: 5px;
                    max-width: none;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Toggle visibility
        document.getElementById('toggle-blockchain').addEventListener('click', () => {
            this.toggleVisibility();
        });

        // Add block
        document.getElementById('add-block').addEventListener('click', () => {
            this.addBlock();
        });

        // Difficulty slider
        const difficultySlider = document.getElementById('difficulty-slider');
        difficultySlider.addEventListener('input', (e) => {
            const difficulty = parseInt(e.target.value);
            this.blockchainViz.setDifficulty(difficulty);
            document.getElementById('difficulty-display').textContent = difficulty;
            this.updateStats();
        });

        // Validate chain
        document.getElementById('validate-chain').addEventListener('click', () => {
            this.validateChain();
        });

        // Demo transactions
        document.getElementById('demo-transactions').addEventListener('click', () => {
            this.runDemoTransactions();
        });

        // Block data input - Enter key
        document.getElementById('block-data').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addBlock();
            }
        });

        // Update stats periodically
        setInterval(() => {
            this.updateStats();
        }, 1000);
    }

    /**
     * Toggle UI visibility
     */
    toggleVisibility() {
        const toggleBtn = document.getElementById('toggle-blockchain');
        const panel = this.container.querySelector('.blockchain-panel');
        
        if (this.isVisible) {
            panel.style.transform = 'translateX(calc(100% - 60px))';
            toggleBtn.textContent = 'Show';
        } else {
            panel.style.transform = 'translateX(0)';
            toggleBtn.textContent = 'Hide';
        }
        
        this.isVisible = !this.isVisible;
    }

    /**
     * Add a new block to the blockchain
     */
    addBlock() {
        const dataInput = document.getElementById('block-data');
        const data = dataInput.value.trim();
        
        if (!data) {
            alert('Please enter block data');
            return;
        }

        // Show mining indicator
        const addButton = document.getElementById('add-block');
        const originalText = addButton.textContent;
        addButton.textContent = 'Mining...';
        addButton.disabled = true;

        // Add block (async to prevent UI blocking)
        setTimeout(() => {
            try {
                this.blockchainViz.addBlock({
                    type: 'transaction',
                    data: data,
                    timestamp: Date.now()
                });
                
                dataInput.value = '';
                this.updateStats();
                
                // Show success message
                this.showMessage('Block mined successfully!', 'success');
            } catch (error) {
                this.showMessage('Error mining block: ' + error.message, 'error');
            }
            
            addButton.textContent = originalText;
            addButton.disabled = false;
        }, 100);
    }

    /**
     * Validate the blockchain
     */
    validateChain() {
        const stats = this.blockchainViz.getStats();
        const message = stats.isValid ? 'Blockchain is valid!' : 'Blockchain is invalid!';
        const type = stats.isValid ? 'success' : 'error';
        
        this.showMessage(message, type);
        this.updateStats();
    }

    /**
     * Run demo transactions
     */
    runDemoTransactions() {
        const demoData = [
            'Alice sends 10 QTC to Bob',
            'Bob sends 5 QTC to Charlie',
            'Charlie sends 15 QTC to Dave',
            'Dave sends 8 QTC to Alice'
        ];

        const addButton = document.getElementById('demo-transactions');
        addButton.disabled = true;
        addButton.textContent = 'Running Demo...';

        let index = 0;
        const addDemoBlock = () => {
            if (index < demoData.length) {
                this.blockchainViz.addBlock({
                    type: 'demo-transaction',
                    data: demoData[index],
                    timestamp: Date.now()
                });
                
                index++;
                setTimeout(addDemoBlock, 1000); // Add one block per second
            } else {
                addButton.disabled = false;
                addButton.textContent = 'Demo Transactions';
                this.showMessage('Demo transactions completed!', 'success');
            }
        };

        addDemoBlock();
    }

    /**
     * Update blockchain statistics display
     */
    updateStats() {
        const stats = this.blockchainViz.getStats();
        
        document.getElementById('block-count').textContent = stats.totalBlocks;
        document.getElementById('difficulty-value').textContent = stats.difficulty;
        
        const statusElement = document.getElementById('chain-status');
        statusElement.textContent = stats.isValid ? 'Valid' : 'Invalid';
        statusElement.className = `stat-value ${stats.isValid ? 'valid' : 'invalid'}`;
    }

    /**
     * Show a temporary message
     * @param {string} message - Message to show
     * @param {string} type - Message type ('success', 'error', 'info')
     */
    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: fadeInOut 3s ease;
        `;

        // Add fade animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(messageEl);
        
        // Remove after animation
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 3000);
    }

    /**
     * Show block details
     * @param {Object} blockData - Block data to display
     */
    showBlockDetails(blockData) {
        const blockInfo = document.getElementById('block-info');
        const blockDetails = document.getElementById('block-details');
        
        blockDetails.innerHTML = `
            <div><strong>Index:</strong> ${blockData.index}</div>
            <div><strong>Hash:</strong> ${blockData.hash}</div>
            <div><strong>Previous Hash:</strong> ${blockData.previousHash}</div>
            <div><strong>Timestamp:</strong> ${new Date(blockData.timestamp).toLocaleString()}</div>
            <div><strong>Nonce:</strong> ${blockData.nonce}</div>
            <div><strong>Data:</strong> ${JSON.stringify(blockData.data, null, 2)}</div>
            <div><strong>Quantum Signature:</strong> ${blockData.quantumSignature.substring(0, 50)}...</div>
        `;
        
        blockInfo.style.display = 'block';
        this.selectedBlock = blockData;
    }

    /**
     * Hide block details
     */
    hideBlockDetails() {
        document.getElementById('block-info').style.display = 'none';
        this.selectedBlock = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlockchainUI;
}