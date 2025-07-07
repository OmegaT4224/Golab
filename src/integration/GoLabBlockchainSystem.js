import { Blockchain } from '../blockchain/Blockchain.js';
import { Transaction } from '../blockchain/Transaction.js';
import { ValidatorNetwork } from '../validators/ValidatorNetwork.js';
import { BotEcosystem } from '../bots/BotEcosystem.js';
import { UniversalIncomeDistribution } from '../income/UniversalIncomeDistribution.js';
import { BlockchainVisualization } from '../visualization/BlockchainVisualization.js';

/**
 * Main integration class that coordinates all blockchain system components
 */
export class GoLabBlockchainSystem {
  constructor(visualizationContainer = null) {
    // Initialize core systems
    this.blockchain = new Blockchain();
    this.validatorNetwork = new ValidatorNetwork();
    this.botEcosystem = new BotEcosystem();
    this.incomeDistribution = new UniversalIncomeDistribution();
    
    // Initialize visualization if container provided
    this.visualization = visualizationContainer 
      ? new BlockchainVisualization(visualizationContainer)
      : null;
    
    // System state
    this.isRunning = false;
    this.simulationInterval = null;
    this.stats = {
      systemUptime: 0,
      totalTransactions: 0,
      totalBlocks: 0,
      totalValidators: 0,
      totalBots: 0,
      totalParticipants: 0,
      systemRevenue: 0,
      lastUpdate: Date.now()
    };
    
    // Oracle AI and Tezos integration hooks
    this.oracleAI = null;
    this.tezosIntegration = null;
    
    this.initializeSystem();
  }

  /**
   * Initialize the blockchain system with default components
   */
  async initializeSystem() {
    try {
      console.log('Initializing GoLab Blockchain System...');
      
      // Create genesis validators
      await this.createGenesisValidators();
      
      // Create initial bots
      await this.createInitialBots();
      
      // Register initial income participants
      await this.registerInitialParticipants();
      
      // Mine genesis block with validators
      await this.mineGenesisBlock();
      
      // Setup visualization if available
      if (this.visualization) {
        this.setupVisualization();
      }
      
      console.log('GoLab Blockchain System initialized successfully!');
      this.updateStats();
      
    } catch (error) {
      console.error('Error initializing system:', error);
      throw error;
    }
  }

  /**
   * Create initial AI validators
   */
  async createGenesisValidators() {
    const validatorConfigs = [
      { owner: 'system', stake: 10000, specialization: 'security' },
      { owner: 'system', stake: 8000, specialization: 'smart_contract' },
      { owner: 'system', stake: 6000, specialization: 'high_frequency' },
      { owner: 'system', stake: 7000, specialization: 'defi' },
      { owner: 'system', stake: 5000, specialization: 'nft' }
    ];

    for (const config of validatorConfigs) {
      const validator = this.validatorNetwork.registerValidator(
        config.owner, 
        config.stake, 
        config.specialization
      );
      console.log(`Created genesis validator: ${validator.id} (${config.specialization})`);
    }
  }

  /**
   * Create initial bot businesses
   */
  async createInitialBots() {
    const botConfigs = [
      { type: 'arbitrage', owner: 'system', capital: 5000 },
      { type: 'arbitrage', owner: 'system', capital: 3000 },
      { type: 'nft_market_maker', owner: 'system', capital: 4000 },
      { type: 'nft_market_maker', owner: 'system', capital: 2000 }
    ];

    for (const config of botConfigs) {
      const bot = this.botEcosystem.createBot(
        config.type,
        config.owner,
        config.capital
      );
      console.log(`Created initial bot: ${bot.id} (${config.type})`);
    }
  }

  /**
   * Register initial participants for universal income
   */
  async registerInitialParticipants() {
    const participants = [
      { address: 'participant_1', stake: 100, reputation: 80 },
      { address: 'participant_2', stake: 200, reputation: 90 },
      { address: 'participant_3', stake: 150, reputation: 75 },
      { address: 'participant_4', stake: 300, reputation: 95 },
      { address: 'participant_5', stake: 50, reputation: 60 }
    ];

    for (const participant of participants) {
      this.incomeDistribution.registerParticipant(
        participant.address,
        participant
      );
      console.log(`Registered income participant: ${participant.address}`);
    }
  }

  /**
   * Mine genesis block with AI validator
   */
  async mineGenesisBlock() {
    const validators = this.validatorNetwork.getAllValidators();
    if (validators.length > 0) {
      const genesisValidator = validators[0].id;
      this.blockchain.minePendingTransactions('system', genesisValidator);
      console.log('Genesis block mined with AI validator');
    }
  }

  /**
   * Setup visualization interactions
   */
  setupVisualization() {
    if (!this.visualization) return;

    // Update visualization with current state
    this.updateVisualization();

    // Add click handler for interactive elements
    this.visualization.addClickHandler((objectData) => {
      this.handleVisualizationClick(objectData);
    });
  }

  /**
   * Handle clicks on visualization objects
   */
  handleVisualizationClick(objectData) {
    console.log('Clicked on:', objectData);
    
    switch (objectData.type) {
      case 'block':
        this.showBlockDetails(objectData.blockData);
        break;
      case 'validator':
        this.showValidatorDetails(objectData.validatorData);
        break;
      case 'bot':
        this.showBotDetails(objectData.botData);
        break;
      case 'income_hub':
        this.showIncomeDistributionDetails();
        break;
    }
  }

  /**
   * Create and process a new transaction
   */
  async createTransaction(from, to, amount, data = null) {
    try {
      // Create transaction
      const transaction = new Transaction(from, to, amount, data);
      
      // Sign transaction (simplified - in production use proper key management)
      transaction.sign('private_key_placeholder');
      
      // Validate with AI validators
      const validationResult = await this.validatorNetwork.validateTransaction(transaction);
      
      if (!validationResult.valid) {
        throw new Error(`Transaction validation failed: ${validationResult.error}`);
      }
      
      // Add to blockchain
      const txId = this.blockchain.createTransaction(transaction);
      
      console.log(`Transaction created: ${txId}`);
      console.log(`Gas reduced by: ${validationResult.gasReduction} (${(validationResult.gasReduction/transaction.gasUsed*100).toFixed(1)}%)`);
      
      this.updateStats();
      return {
        transactionId: txId,
        gasReduction: validationResult.gasReduction,
        validationResult
      };
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Mine a new block
   */
  async mineBlock(minerAddress = 'system') {
    try {
      // Select best validator for mining
      const validators = this.validatorNetwork.getAllValidators();
      const activeValidators = validators.filter(v => v.active);
      
      let selectedValidator = null;
      if (activeValidators.length > 0) {
        // Select validator with highest reputation * efficiency
        selectedValidator = activeValidators.reduce((best, current) => {
          const currentScore = current.reputation * current.efficiency;
          const bestScore = best.reputation * best.efficiency;
          return currentScore > bestScore ? current : best;
        });
      }

      // Mine block
      const block = this.blockchain.minePendingTransactions(
        minerAddress, 
        selectedValidator?.id
      );

      // Distribute mining rewards to income system
      if (block.reward > 0) {
        this.incomeDistribution.addProfits(block.reward, 'mining');
      }

      console.log(`Block ${block.index} mined by ${selectedValidator?.id || 'system'}`);
      console.log(`Block reward: ${block.reward} distributed to income pools`);

      this.updateStats();
      this.updateVisualization();

      return block;

    } catch (error) {
      console.error('Error mining block:', error);
      throw error;
    }
  }

  /**
   * Start automated system simulation
   */
  startSimulation(intervalMs = 10000) {
    if (this.isRunning) {
      console.log('Simulation already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting system simulation (interval: ${intervalMs}ms)`);

    this.simulationInterval = setInterval(async () => {
      try {
        await this.simulateSystemActivity();
      } catch (error) {
        console.error('Error in simulation cycle:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop automated system simulation
   */
  stopSimulation() {
    if (!this.isRunning) {
      console.log('Simulation not running');
      return;
    }

    this.isRunning = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    
    console.log('System simulation stopped');
  }

  /**
   * Simulate one cycle of system activity
   */
  async simulateSystemActivity() {
    console.log('--- Simulation Cycle ---');

    // 1. Simulate bot ecosystem activity
    const botResults = await this.botEcosystem.simulateEcosystemDay();
    
    // 2. Add bot profits to income distribution
    if (botResults.ecosystemSummary.totalProfit > 0) {
      this.incomeDistribution.addProfits(
        botResults.ecosystemSummary.totalProfit, 
        'bot_ecosystem'
      );
    }

    // 3. Create some random transactions
    await this.simulateRandomTransactions();

    // 4. Mine a block if there are pending transactions
    if (this.blockchain.pendingTransactions.length > 0) {
      await this.mineBlock();
    }

    // 5. Update visualization
    this.updateVisualization();

    // 6. Log cycle summary
    this.logSimulationSummary(botResults);
  }

  /**
   * Simulate random transactions
   */
  async simulateRandomTransactions() {
    const transactionCount = Math.floor(Math.random() * 5) + 1; // 1-5 transactions
    
    for (let i = 0; i < transactionCount; i++) {
      try {
        await this.createTransaction(
          `user_${Math.floor(Math.random() * 100)}`,
          `user_${Math.floor(Math.random() * 100)}`,
          Math.floor(Math.random() * 1000) + 10,
          { type: 'transfer', simulation: true }
        );
      } catch (error) {
        // Ignore transaction failures in simulation
      }
    }
  }

  /**
   * Log simulation cycle summary
   */
  logSimulationSummary(botResults) {
    const stats = this.getSystemStats();
    
    console.log(`Bots: ${botResults.ecosystemSummary.totalOperations} operations, $${botResults.ecosystemSummary.totalProfit.toFixed(2)} profit`);
    console.log(`Blockchain: ${stats.totalBlocks} blocks, ${stats.totalTransactions} transactions`);
    console.log(`Validators: ${stats.totalValidators} active`);
    console.log(`Income: $${stats.incomeDistribution.pools.universalIncome.toFixed(2)} ready for distribution`);
  }

  /**
   * Update visualization with current system state
   */
  updateVisualization() {
    if (!this.visualization) return;

    this.visualization.updateAll(
      this.blockchain,
      this.validatorNetwork,
      this.botEcosystem,
      this.incomeDistribution
    );
  }

  /**
   * Get comprehensive system statistics
   */
  getSystemStats() {
    const blockchainStats = this.blockchain.getStats();
    const validatorStats = this.validatorNetwork.getNetworkMetrics();
    const botStats = this.botEcosystem.getEcosystemMetrics();
    const incomeStats = this.incomeDistribution.getDistributionStats();

    return {
      uptime: Date.now() - this.stats.lastUpdate,
      blockchain: blockchainStats,
      validators: validatorStats,
      botEcosystem: botStats,
      incomeDistribution: incomeStats,
      totalBlocks: blockchainStats.chainLength,
      totalTransactions: blockchainStats.totalTransactions,
      totalValidators: validatorStats.totalValidators,
      totalBots: botStats.totalBots,
      totalParticipants: incomeStats.totalParticipants,
      systemRevenue: botStats.totalRevenue + blockchainStats.totalRewards
    };
  }

  /**
   * Update internal statistics
   */
  updateStats() {
    const stats = this.getSystemStats();
    
    this.stats = {
      ...this.stats,
      totalTransactions: stats.totalTransactions,
      totalBlocks: stats.totalBlocks,
      totalValidators: stats.totalValidators,
      totalBots: stats.totalBots,
      totalParticipants: stats.totalParticipants,
      systemRevenue: stats.systemRevenue,
      lastUpdate: Date.now()
    };
  }

  /**
   * Show block details (for UI integration)
   */
  showBlockDetails(blockData) {
    console.log('Block Details:', {
      index: blockData.index,
      hash: blockData.hash,
      transactions: blockData.transactionCount,
      gasUsed: blockData.gasUsed,
      reward: blockData.reward,
      validator: blockData.validator,
      timestamp: new Date(blockData.timestamp).toLocaleString()
    });
  }

  /**
   * Show validator details (for UI integration)
   */
  showValidatorDetails(validatorData) {
    console.log('Validator Details:', {
      id: validatorData.id,
      specialization: validatorData.specialization,
      reputation: validatorData.reputation,
      efficiency: validatorData.efficiency,
      stake: validatorData.stake,
      totalRewards: validatorData.totalRewards,
      validatedTransactions: validatorData.validatedTransactions
    });
  }

  /**
   * Show bot details (for UI integration)
   */
  showBotDetails(botData) {
    console.log('Bot Details:', {
      id: botData.id,
      type: botData.type,
      active: botData.active,
      totalProfit: botData.totalProfit,
      totalRevenue: botData.totalRevenue,
      reputation: botData.reputation,
      creditScore: botData.creditScore,
      operations: botData.operationsCount
    });
  }

  /**
   * Show income distribution details (for UI integration)
   */
  showIncomeDistributionDetails() {
    const stats = this.incomeDistribution.getDistributionStats();
    console.log('Income Distribution Details:', {
      totalDistributed: stats.totalDistributed,
      participants: stats.totalParticipants,
      nextDistribution: new Date(stats.distributionSchedule.nextDistribution).toLocaleString(),
      pools: stats.pools
    });
  }

  /**
   * Oracle AI integration hook
   */
  setOracleAIIntegration(oracleAI) {
    this.oracleAI = oracleAI;
    console.log('Oracle AI integration configured');
  }

  /**
   * Tezos blockchain integration hook
   */
  setTezosIntegration(tezosIntegration) {
    this.tezosIntegration = tezosIntegration;
    console.log('Tezos integration configured');
  }

  /**
   * Process Oracle AI requests
   */
  async processOracleAIRequest(request) {
    if (!this.oracleAI) {
      throw new Error('Oracle AI integration not configured');
    }
    
    // Placeholder for Oracle AI integration
    console.log('Processing Oracle AI request:', request);
    return { success: true, result: 'Oracle AI response' };
  }

  /**
   * Process Tezos cross-chain operations
   */
  async processTezosOperation(operation) {
    if (!this.tezosIntegration) {
      throw new Error('Tezos integration not configured');
    }
    
    // Placeholder for Tezos integration
    console.log('Processing Tezos operation:', operation);
    return { success: true, result: 'Tezos operation completed' };
  }

  /**
   * Export entire system state
   */
  export() {
    return {
      blockchain: this.blockchain.export(),
      validatorNetwork: this.validatorNetwork.export(),
      botEcosystem: this.botEcosystem.export(),
      incomeDistribution: this.incomeDistribution.export(),
      stats: this.stats,
      timestamp: Date.now()
    };
  }

  /**
   * Import system state
   */
  import(data) {
    this.blockchain.import(data.blockchain);
    this.validatorNetwork.import(data.validatorNetwork);
    this.botEcosystem.import(data.botEcosystem);
    this.incomeDistribution.import(data.incomeDistribution);
    this.stats = data.stats;
    
    this.updateVisualization();
    console.log('System state imported successfully');
  }

  /**
   * Cleanup and dispose of system
   */
  dispose() {
    this.stopSimulation();
    
    if (this.visualization) {
      this.visualization.dispose();
    }
    
    console.log('GoLab Blockchain System disposed');
  }
}