import { Bot } from './Bot.js';
import { ArbitrageBot } from './ArbitrageBot.js';
import { NFTMarketMakerBot } from './NFTMarketMakerBot.js';

/**
 * Bot Business Ecosystem Manager
 */
export class BotEcosystem {
  constructor() {
    this.bots = new Map();
    this.activeBots = new Set();
    this.botTypes = {
      'arbitrage': ArbitrageBot,
      'nft_market_maker': NFTMarketMakerBot
    };
    this.ecosystem = {
      totalBots: 0,
      activeBots: 0,
      totalCapital: 0,
      totalRevenue: 0,
      totalProfit: 0,
      averageROI: 0,
      creditApplications: [],
      dailyStats: []
    };
    this.creditPool = 100000; // Total credit available
    this.creditUsed = 0;
    this.interestRate = 0.05; // 5% annual interest
  }

  /**
   * Create and register a new bot
   */
  createBot(type, owner, initialCapital = 1000, config = {}) {
    if (!this.botTypes[type]) {
      throw new Error(`Unsupported bot type: ${type}`);
    }

    const botId = this.generateBotId(type);
    const BotClass = this.botTypes[type];
    const bot = new BotClass(botId, owner, initialCapital);

    // Apply custom configuration
    if (config.specialization) {
      bot.specialization = config.specialization;
    }

    this.bots.set(botId, bot);
    this.activeBots.add(botId);
    
    this.updateEcosystemStats();
    
    console.log(`Bot ${botId} created with type ${type} and capital ${initialCapital}`);
    return bot;
  }

  /**
   * Remove bot from ecosystem
   */
  removeBot(botId) {
    const bot = this.bots.get(botId);
    if (!bot) return false;

    // Liquidate bot assets
    this.liquidateBot(bot);
    
    this.bots.delete(botId);
    this.activeBots.delete(botId);
    
    this.updateEcosystemStats();
    return true;
  }

  /**
   * Process credit application
   */
  processCreditApplication(botId, requestedAmount) {
    const bot = this.bots.get(botId);
    if (!bot) {
      throw new Error('Bot not found');
    }

    // Check ecosystem credit availability
    const availableCredit = this.creditPool - this.creditUsed;
    const maxApprovalAmount = Math.min(requestedAmount, availableCredit);

    if (maxApprovalAmount <= 0) {
      return {
        approved: false,
        reason: 'Ecosystem credit pool depleted',
        availableCredit: 0
      };
    }

    // Let bot evaluate its own application
    const application = bot.applyCreditIncrease(maxApprovalAmount);

    if (application.approved) {
      // Update ecosystem credit usage
      this.creditUsed += application.approvedAmount;
      
      // Track application
      this.ecosystem.creditApplications.push({
        botId,
        requestedAmount,
        approvedAmount: application.approvedAmount,
        timestamp: Date.now(),
        status: 'approved'
      });
    } else {
      this.ecosystem.creditApplications.push({
        botId,
        requestedAmount,
        approvedAmount: 0,
        timestamp: Date.now(),
        status: 'rejected',
        reason: application.reason
      });
    }

    return application;
  }

  /**
   * Simulate one day for entire ecosystem
   */
  async simulateEcosystemDay() {
    const dayStart = Date.now();
    const results = {
      date: new Date().toISOString().split('T')[0],
      botResults: new Map(),
      ecosystemSummary: {
        totalOperations: 0,
        successfulOperations: 0,
        totalRevenue: 0,
        totalProfit: 0,
        creditApplications: 0,
        creditApprovals: 0
      }
    };

    // Process credit applications first
    await this.processDailyCreditApplications();

    // Simulate each active bot
    for (const botId of this.activeBots) {
      const bot = this.bots.get(botId);
      if (bot && bot.active) {
        try {
          const botDayResult = await bot.simulateDay();
          results.botResults.set(botId, botDayResult);
          
          // Update ecosystem summary
          if (botDayResult) {
            results.ecosystemSummary.totalOperations += botDayResult.summary.operationsExecuted;
            results.ecosystemSummary.successfulOperations += botDayResult.summary.successfulOperations;
            results.ecosystemSummary.totalRevenue += botDayResult.summary.totalRevenue;
            results.ecosystemSummary.totalProfit += botDayResult.summary.totalProfit;
          }
        } catch (error) {
          console.error(`Error simulating bot ${botId}:`, error);
          results.botResults.set(botId, {
            error: error.message,
            summary: { operationsExecuted: 0, successfulOperations: 0, totalRevenue: 0, totalProfit: 0 }
          });
        }
      }
    }

    // Process daily interest on credit
    this.processDailyInterest();

    // Update ecosystem statistics
    this.updateEcosystemStats();
    
    // Store daily stats
    this.ecosystem.dailyStats.push({
      date: results.date,
      summary: results.ecosystemSummary,
      timestamp: dayStart
    });

    // Keep only last 30 days of stats
    if (this.ecosystem.dailyStats.length > 30) {
      this.ecosystem.dailyStats = this.ecosystem.dailyStats.slice(-30);
    }

    return results;
  }

  /**
   * Process daily credit applications
   */
  async processDailyCreditApplications() {
    const applicationChance = 0.1; // 10% chance per bot per day
    
    for (const botId of this.activeBots) {
      const bot = this.bots.get(botId);
      if (bot && bot.active && Math.random() < applicationChance) {
        // Bot applies for credit increase
        const currentCredit = bot.creditLimit;
        const requestedIncrease = Math.floor(currentCredit * (0.2 + Math.random() * 0.3)); // 20-50% increase
        
        if (requestedIncrease > 100) { // Minimum $100 application
          try {
            this.processCreditApplication(botId, requestedIncrease);
          } catch (error) {
            console.error(`Credit application error for bot ${botId}:`, error);
          }
        }
      }
    }
  }

  /**
   * Process daily interest on outstanding credit
   */
  processDailyInterest() {
    const dailyRate = this.interestRate / 365;
    
    for (const botId of this.activeBots) {
      const bot = this.bots.get(botId);
      if (bot && bot.account.creditUsed > 0) {
        const dailyInterest = bot.account.creditUsed * dailyRate;
        
        // Deduct interest from bot balance
        if (bot.account.balance >= dailyInterest) {
          bot.account.balance -= dailyInterest;
          bot.account.transactions.push({
            type: 'interest_charge',
            amount: -dailyInterest,
            timestamp: Date.now(),
            balance: bot.account.balance
          });
        } else {
          // Add to credit used if can't pay interest
          bot.account.creditUsed += dailyInterest;
          bot.creditScore = Math.max(300, bot.creditScore - 1);
        }
      }
    }
  }

  /**
   * Get bot performance rankings
   */
  getBotRankings(metric = 'profit', limit = 10) {
    const bots = Array.from(this.bots.values());
    
    let sortFunction;
    switch (metric) {
      case 'profit':
        sortFunction = (a, b) => b.totalProfit - a.totalProfit;
        break;
      case 'revenue':
        sortFunction = (a, b) => b.totalRevenue - a.totalRevenue;
        break;
      case 'roi':
        sortFunction = (a, b) => {
          const roiA = a.totalProfit / a.capital;
          const roiB = b.totalProfit / b.capital;
          return roiB - roiA;
        };
        break;
      case 'reputation':
        sortFunction = (a, b) => b.reputation - a.reputation;
        break;
      case 'credit_score':
        sortFunction = (a, b) => b.creditScore - a.creditScore;
        break;
      default:
        sortFunction = (a, b) => b.totalProfit - a.totalProfit;
    }

    return bots
      .sort(sortFunction)
      .slice(0, limit)
      .map((bot, index) => ({
        rank: index + 1,
        botId: bot.id,
        type: bot.type,
        owner: bot.owner,
        metric: this.getBotMetricValue(bot, metric),
        totalProfit: bot.totalProfit,
        totalRevenue: bot.totalRevenue,
        reputation: bot.reputation,
        creditScore: bot.creditScore
      }));
  }

  /**
   * Get metric value for a bot
   */
  getBotMetricValue(bot, metric) {
    switch (metric) {
      case 'profit': return bot.totalProfit;
      case 'revenue': return bot.totalRevenue;
      case 'roi': return bot.totalProfit / bot.capital;
      case 'reputation': return bot.reputation;
      case 'credit_score': return bot.creditScore;
      default: return bot.totalProfit;
    }
  }

  /**
   * Get ecosystem performance metrics
   */
  getEcosystemMetrics() {
    const bots = Array.from(this.bots.values());
    const activeBots = bots.filter(bot => bot.active);
    
    const totalCapital = bots.reduce((sum, bot) => sum + bot.capital, 0);
    const totalRevenue = bots.reduce((sum, bot) => sum + bot.totalRevenue, 0);
    const totalProfit = bots.reduce((sum, bot) => sum + bot.totalProfit, 0);
    const totalOperations = bots.reduce((sum, bot) => sum + bot.operationsCount, 0);

    const avgROI = totalCapital > 0 ? totalProfit / totalCapital : 0;
    const avgSuccessRate = activeBots.length > 0 
      ? activeBots.reduce((sum, bot) => sum + bot.performance.successRate, 0) / activeBots.length 
      : 0;

    const typeDistribution = {};
    bots.forEach(bot => {
      typeDistribution[bot.type] = (typeDistribution[bot.type] || 0) + 1;
    });

    const creditUtilization = this.creditPool > 0 ? this.creditUsed / this.creditPool : 0;

    return {
      totalBots: this.bots.size,
      activeBots: this.activeBots.size,
      totalCapital,
      totalRevenue,
      totalProfit,
      totalOperations,
      averageROI: avgROI,
      averageSuccessRate: avgSuccessRate,
      typeDistribution,
      creditPool: this.creditPool,
      creditUsed: this.creditUsed,
      creditUtilization,
      availableCredit: this.creditPool - this.creditUsed,
      topPerformers: this.getBotRankings('profit', 5),
      recentApplications: this.ecosystem.creditApplications.slice(-10)
    };
  }

  /**
   * Get bot by ID
   */
  getBot(botId) {
    const bot = this.bots.get(botId);
    return bot ? bot.getMetrics() : null;
  }

  /**
   * Get all bots
   */
  getAllBots() {
    return Array.from(this.bots.values()).map(bot => bot.getMetrics());
  }

  /**
   * Get bots by type
   */
  getBotsByType(type) {
    return Array.from(this.bots.values())
      .filter(bot => bot.type === type)
      .map(bot => bot.getMetrics());
  }

  /**
   * Get bots by owner
   */
  getBotsByOwner(owner) {
    return Array.from(this.bots.values())
      .filter(bot => bot.owner === owner)
      .map(bot => bot.getMetrics());
  }

  /**
   * Activate bot
   */
  activateBot(botId) {
    const bot = this.bots.get(botId);
    if (bot) {
      bot.activate();
      this.activeBots.add(botId);
      this.updateEcosystemStats();
      return true;
    }
    return false;
  }

  /**
   * Deactivate bot
   */
  deactivateBot(botId) {
    const bot = this.bots.get(botId);
    if (bot) {
      bot.deactivate();
      this.activeBots.delete(botId);
      this.updateEcosystemStats();
      return true;
    }
    return false;
  }

  /**
   * Liquidate bot assets
   */
  liquidateBot(bot) {
    // Repay any outstanding credit
    if (bot.account.creditUsed > 0) {
      const repayAmount = Math.min(bot.account.balance, bot.account.creditUsed);
      if (repayAmount > 0) {
        bot.repayCredit(repayAmount);
        this.creditUsed -= repayAmount;
      }
    }

    // Liquidate inventory for NFT bots
    if (bot.type === 'nft_market_maker' && bot.inventory) {
      for (const [nftId, nft] of bot.inventory) {
        const collection = bot.nftCollections.find(c => c.id === nft.collectionId);
        if (collection) {
          const liquidationPrice = bot.getCurrentFloorPrice(collection) * 0.9; // 10% discount
          bot.account.balance += liquidationPrice;
        }
      }
      bot.inventory.clear();
    }
  }

  /**
   * Update ecosystem statistics
   */
  updateEcosystemStats() {
    const bots = Array.from(this.bots.values());
    
    this.ecosystem.totalBots = this.bots.size;
    this.ecosystem.activeBots = this.activeBots.size;
    this.ecosystem.totalCapital = bots.reduce((sum, bot) => sum + bot.capital, 0);
    this.ecosystem.totalRevenue = bots.reduce((sum, bot) => sum + bot.totalRevenue, 0);
    this.ecosystem.totalProfit = bots.reduce((sum, bot) => sum + bot.totalProfit, 0);
    this.ecosystem.averageROI = this.ecosystem.totalCapital > 0 
      ? this.ecosystem.totalProfit / this.ecosystem.totalCapital 
      : 0;
  }

  /**
   * Generate unique bot ID
   */
  generateBotId(type) {
    return `${type}_bot_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Add credit to ecosystem pool
   */
  addCreditToPool(amount) {
    this.creditPool += amount;
  }

  /**
   * Get daily statistics
   */
  getDailyStats(days = 7) {
    return this.ecosystem.dailyStats.slice(-days);
  }

  /**
   * Get credit applications history
   */
  getCreditApplications(limit = 20) {
    return this.ecosystem.creditApplications.slice(-limit);
  }

  /**
   * Export ecosystem data
   */
  export() {
    return {
      bots: Array.from(this.bots.entries()).map(([id, bot]) => [id, bot.toJSON()]),
      activeBots: Array.from(this.activeBots),
      ecosystem: this.ecosystem,
      creditPool: this.creditPool,
      creditUsed: this.creditUsed,
      interestRate: this.interestRate
    };
  }

  /**
   * Import ecosystem data
   */
  import(data) {
    // Reconstruct bots
    this.bots = new Map();
    for (const [id, botData] of data.bots) {
      const BotClass = this.botTypes[botData.type];
      if (BotClass) {
        const bot = BotClass.fromJSON(botData);
        this.bots.set(id, bot);
      }
    }

    this.activeBots = new Set(data.activeBots);
    this.ecosystem = data.ecosystem;
    this.creditPool = data.creditPool;
    this.creditUsed = data.creditUsed;
    this.interestRate = data.interestRate;

    this.updateEcosystemStats();
  }
}