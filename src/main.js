import { GoLabBlockchainSystem } from './integration/GoLabBlockchainSystem.js';

/**
 * Main application entry point
 */
class GoLabApp {
  constructor() {
    this.system = null;
    this.ui = {
      container: null,
      stats: null,
      controls: null,
      info: null
    };
    
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Starting GoLab Blockchain Application...');
      
      // Setup UI
      this.setupUI();
      
      // Initialize blockchain system
      const visualizationContainer = document.getElementById('visualization');
      this.system = new GoLabBlockchainSystem(visualizationContainer);
      
      // Setup event handlers
      this.setupEventHandlers();
      
      // Start UI updates
      this.startUIUpdates();
      
      console.log('GoLab Blockchain Application started successfully!');
      
    } catch (error) {
      console.error('Error starting application:', error);
      this.showError('Failed to start application: ' + error.message);
    }
  }

  /**
   * Setup user interface
   */
  setupUI() {
    // Update title
    document.title = 'GoLab - Quantum-Resistant Blockchain System';
    
    // Get UI elements
    this.ui.container = document.getElementById('app-container');
    this.ui.stats = document.getElementById('stats-panel');
    this.ui.controls = document.getElementById('controls-panel');
    this.ui.info = document.getElementById('info-panel');
    
    // Setup control buttons
    this.setupControls();
    
    // Show initial loading state
    this.updateStatsPanel({
      status: 'Initializing...',
      blockchain: { chainLength: 0, totalTransactions: 0 },
      validators: { totalValidators: 0, activeValidators: 0 },
      botEcosystem: { totalBots: 0, totalRevenue: 0 },
      incomeDistribution: { totalParticipants: 0, totalDistributed: 0 }
    });
  }

  /**
   * Setup control buttons and inputs
   */
  setupControls() {
    const controlsHTML = `
      <div class="control-section">
        <h3>System Controls</h3>
        <button id="btn-start-simulation" class="btn btn-primary">Start Simulation</button>
        <button id="btn-stop-simulation" class="btn btn-secondary">Stop Simulation</button>
        <button id="btn-mine-block" class="btn btn-success">Mine Block</button>
      </div>
      
      <div class="control-section">
        <h3>Create Transaction</h3>
        <input type="text" id="tx-from" placeholder="From Address" class="input">
        <input type="text" id="tx-to" placeholder="To Address" class="input">
        <input type="number" id="tx-amount" placeholder="Amount" class="input">
        <button id="btn-create-tx" class="btn btn-primary">Create Transaction</button>
      </div>
      
      <div class="control-section">
        <h3>Bot Management</h3>
        <select id="bot-type" class="input">
          <option value="arbitrage">Arbitrage Bot</option>
          <option value="nft_market_maker">NFT Market Maker</option>
        </select>
        <input type="number" id="bot-capital" placeholder="Initial Capital" value="1000" class="input">
        <button id="btn-create-bot" class="btn btn-primary">Create Bot</button>
      </div>
      
      <div class="control-section">
        <h3>Validator Management</h3>
        <select id="validator-specialization" class="input">
          <option value="security">Security</option>
          <option value="smart_contract">Smart Contract</option>
          <option value="high_frequency">High Frequency</option>
          <option value="defi">DeFi</option>
          <option value="nft">NFT</option>
        </select>
        <input type="number" id="validator-stake" placeholder="Stake Amount" value="1000" class="input">
        <button id="btn-create-validator" class="btn btn-primary">Create Validator</button>
      </div>
      
      <div class="control-section">
        <h3>Income Distribution</h3>
        <input type="text" id="participant-address" placeholder="Participant Address" class="input">
        <input type="number" id="participant-stake" placeholder="Stake" value="100" class="input">
        <button id="btn-register-participant" class="btn btn-primary">Register Participant</button>
        <button id="btn-force-distribution" class="btn btn-warning">Force Distribution</button>
      </div>
    `;
    
    if (this.ui.controls) {
      this.ui.controls.innerHTML = controlsHTML;
    }
  }

  /**
   * Setup event handlers for UI controls
   */
  setupEventHandlers() {
    // System control buttons
    this.addEventListener('btn-start-simulation', 'click', () => {
      this.system.startSimulation();
      this.updateControlsState(true);
    });
    
    this.addEventListener('btn-stop-simulation', 'click', () => {
      this.system.stopSimulation();
      this.updateControlsState(false);
    });
    
    this.addEventListener('btn-mine-block', 'click', async () => {
      try {
        await this.system.mineBlock();
        this.showSuccess('Block mined successfully!');
      } catch (error) {
        this.showError('Error mining block: ' + error.message);
      }
    });

    // Transaction creation
    this.addEventListener('btn-create-tx', 'click', async () => {
      try {
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const amount = parseFloat(document.getElementById('tx-amount').value);
        
        if (!from || !to || !amount) {
          this.showError('Please fill in all transaction fields');
          return;
        }
        
        const result = await this.system.createTransaction(from, to, amount);
        this.showSuccess(`Transaction created! Gas reduced by ${result.gasReduction}`);
        
        // Clear form
        document.getElementById('tx-from').value = '';
        document.getElementById('tx-to').value = '';
        document.getElementById('tx-amount').value = '';
        
      } catch (error) {
        this.showError('Error creating transaction: ' + error.message);
      }
    });

    // Bot creation
    this.addEventListener('btn-create-bot', 'click', () => {
      try {
        const type = document.getElementById('bot-type').value;
        const capital = parseFloat(document.getElementById('bot-capital').value);
        
        const bot = this.system.botEcosystem.createBot(type, 'user', capital);
        this.showSuccess(`Bot created: ${bot.id} (${type})`);
        
      } catch (error) {
        this.showError('Error creating bot: ' + error.message);
      }
    });

    // Validator creation
    this.addEventListener('btn-create-validator', 'click', () => {
      try {
        const specialization = document.getElementById('validator-specialization').value;
        const stake = parseFloat(document.getElementById('validator-stake').value);
        
        const validator = this.system.validatorNetwork.registerValidator('user', stake, specialization);
        this.showSuccess(`Validator created: ${validator.id} (${specialization})`);
        
      } catch (error) {
        this.showError('Error creating validator: ' + error.message);
      }
    });

    // Participant registration
    this.addEventListener('btn-register-participant', 'click', () => {
      try {
        const address = document.getElementById('participant-address').value;
        const stake = parseFloat(document.getElementById('participant-stake').value);
        
        if (!address || !stake) {
          this.showError('Please fill in all participant fields');
          return;
        }
        
        this.system.incomeDistribution.registerParticipant(address, { stake });
        this.showSuccess(`Participant registered: ${address}`);
        
        // Clear form
        document.getElementById('participant-address').value = '';
        document.getElementById('participant-stake').value = '100';
        
      } catch (error) {
        this.showError('Error registering participant: ' + error.message);
      }
    });

    // Force distribution
    this.addEventListener('btn-force-distribution', 'click', () => {
      try {
        const result = this.system.incomeDistribution.forceDistribution();
        if (result) {
          this.showSuccess(`Distribution completed: $${result.totalAmount.toFixed(2)} to ${result.participantCount} participants`);
        } else {
          this.showError('No funds available for distribution');
        }
      } catch (error) {
        this.showError('Error forcing distribution: ' + error.message);
      }
    });
  }

  /**
   * Helper method to add event listeners
   */
  addEventListener(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(event, handler);
    }
  }

  /**
   * Update controls state based on simulation status
   */
  updateControlsState(isRunning) {
    const startBtn = document.getElementById('btn-start-simulation');
    const stopBtn = document.getElementById('btn-stop-simulation');
    
    if (startBtn) startBtn.disabled = isRunning;
    if (stopBtn) stopBtn.disabled = !isRunning;
  }

  /**
   * Start periodic UI updates
   */
  startUIUpdates() {
    setInterval(() => {
      if (this.system) {
        const stats = this.system.getSystemStats();
        this.updateStatsPanel(stats);
      }
    }, 1000); // Update every second
  }

  /**
   * Update statistics panel
   */
  updateStatsPanel(stats) {
    if (!this.ui.stats) return;

    const statsHTML = `
      <div class="stats-section">
        <h3>System Status</h3>
        <div class="stat-item">Status: <span class="status ${this.system?.isRunning ? 'running' : 'stopped'}">${this.system?.isRunning ? 'Running' : 'Stopped'}</span></div>
        <div class="stat-item">Uptime: <span>${this.formatUptime(stats.uptime || 0)}</span></div>
      </div>
      
      <div class="stats-section">
        <h3>Blockchain</h3>
        <div class="stat-item">Blocks: <span>${stats.blockchain?.chainLength || 0}</span></div>
        <div class="stat-item">Transactions: <span>${stats.blockchain?.totalTransactions || 0}</span></div>
        <div class="stat-item">Pending: <span>${stats.blockchain?.pendingTransactions || 0}</span></div>
        <div class="stat-item">Gas Used: <span>${stats.blockchain?.totalGasUsed || 0}</span></div>
      </div>
      
      <div class="stats-section">
        <h3>AI Validators</h3>
        <div class="stat-item">Total: <span>${stats.validators?.totalValidators || 0}</span></div>
        <div class="stat-item">Active: <span>${stats.validators?.activeValidators || 0}</span></div>
        <div class="stat-item">Avg Efficiency: <span>${((stats.validators?.averageEfficiency || 1) * 100).toFixed(1)}%</span></div>
        <div class="stat-item">Gas Reduced: <span>${stats.validators?.totalGasReduced || 0}</span></div>
      </div>
      
      <div class="stats-section">
        <h3>Bot Ecosystem</h3>
        <div class="stat-item">Total Bots: <span>${stats.botEcosystem?.totalBots || 0}</span></div>
        <div class="stat-item">Active: <span>${stats.botEcosystem?.activeBots || 0}</span></div>
        <div class="stat-item">Revenue: <span>$${(stats.botEcosystem?.totalRevenue || 0).toFixed(2)}</span></div>
        <div class="stat-item">Profit: <span>$${(stats.botEcosystem?.totalProfit || 0).toFixed(2)}</span></div>
      </div>
      
      <div class="stats-section">
        <h3>Universal Income</h3>
        <div class="stat-item">Participants: <span>${stats.incomeDistribution?.totalParticipants || 0}</span></div>
        <div class="stat-item">Distributed: <span>$${(stats.incomeDistribution?.totalDistributed || 0).toFixed(2)}</span></div>
        <div class="stat-item">Available: <span>$${(stats.incomeDistribution?.pools?.universalIncome || 0).toFixed(2)}</span></div>
        <div class="stat-item">Next: <span>${this.formatTime(stats.incomeDistribution?.nextDistributionEstimate?.timeToNext || 0)}</span></div>
      </div>
    `;
    
    this.ui.stats.innerHTML = statsHTML;
  }

  /**
   * Format uptime duration
   */
  formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format time remaining
   */
  formatTime(ms) {
    if (ms <= 0) return 'Ready';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showMessage(message, 'error');
  }

  /**
   * Show message with type
   */
  showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 5000);
    
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  /**
   * Handle application errors
   */
  handleError(error) {
    console.error('Application error:', error);
    this.showError('Application error: ' + error.message);
  }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.goLabApp = new GoLabApp();
});

// Handle unhandled errors
window.addEventListener('error', (event) => {
  if (window.goLabApp) {
    window.goLabApp.handleError(event.error);
  }
});

// Export for module usage
export { GoLabApp };