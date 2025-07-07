import { Bot } from './Bot.js';

/**
 * Arbitrage Trading Bot - finds price differences across markets
 */
export class ArbitrageBot extends Bot {
  constructor(id, owner, initialCapital = 5000) {
    super(id, 'arbitrage', owner, initialCapital);
    this.markets = this.initializeMarkets();
    this.tradingPairs = this.initializeTradingPairs();
    this.minProfitThreshold = 0.005; // 0.5% minimum profit
    this.maxPositionSize = this.capital * 0.1; // 10% of capital per trade
    this.lastTradeTime = 0;
    this.cooldownPeriod = 60000; // 1 minute cooldown between trades
  }

  getStrategy() {
    return 'cross_market_arbitrage';
  }

  getTargetMarket() {
    return 'cryptocurrency_defi';
  }

  getRiskLevel() {
    return 'low_to_medium';
  }

  getExpectedROI() {
    return 0.15; // 15% annual ROI
  }

  getOperatingHours() {
    return 24; // 24/7 operation
  }

  getScalingPlan() {
    return 'exponential_with_risk_management';
  }

  getOperationsPerDay() {
    return Math.floor(20 + (this.reputation / 10)); // 20-30 operations per day
  }

  /**
   * Initialize simulated markets
   */
  initializeMarkets() {
    return {
      'exchange_a': {
        name: 'Exchange A',
        fees: 0.001, // 0.1% trading fee
        liquidity: 1000000,
        priceVariance: 0.02 // 2% price variance
      },
      'exchange_b': {
        name: 'Exchange B', 
        fees: 0.0015, // 0.15% trading fee
        liquidity: 800000,
        priceVariance: 0.025 // 2.5% price variance
      },
      'exchange_c': {
        name: 'Exchange C',
        fees: 0.0008, // 0.08% trading fee
        liquidity: 1200000,
        priceVariance: 0.015 // 1.5% price variance
      }
    };
  }

  /**
   * Initialize trading pairs
   */
  initializeTradingPairs() {
    return [
      { symbol: 'BTC/USD', basePrice: 45000, volatility: 0.03 },
      { symbol: 'ETH/USD', basePrice: 3000, volatility: 0.04 },
      { symbol: 'SOL/USD', basePrice: 100, volatility: 0.06 },
      { symbol: 'ADA/USD', basePrice: 0.5, volatility: 0.05 },
      { symbol: 'DOT/USD', basePrice: 8, volatility: 0.05 }
    ];
  }

  /**
   * Execute arbitrage operation
   */
  async executeOperation() {
    const currentTime = Date.now();
    
    // Check cooldown
    if (currentTime - this.lastTradeTime < this.cooldownPeriod) {
      return {
        success: false,
        operation: 'arbitrage_scan',
        reason: 'cooldown_period',
        revenue: 0,
        profit: 0
      };
    }

    // Scan for arbitrage opportunities
    const opportunity = this.scanArbitrageOpportunities();
    
    if (!opportunity) {
      return {
        success: false,
        operation: 'arbitrage_scan',
        reason: 'no_opportunity_found',
        revenue: 0,
        profit: 0
      };
    }

    // Execute the arbitrage trade
    const tradeResult = this.executeArbitrageTrade(opportunity);
    
    this.lastTradeTime = currentTime;
    
    // Update performance
    this.updatePerformance(tradeResult.revenue, tradeResult.profit, tradeResult.success);
    
    return tradeResult;
  }

  /**
   * Scan for arbitrage opportunities across markets
   */
  scanArbitrageOpportunities() {
    const opportunities = [];
    
    for (const pair of this.tradingPairs) {
      const prices = this.generateMarketPrices(pair);
      const bestBuy = this.findBestBuyMarket(prices);
      const bestSell = this.findBestSellMarket(prices);
      
      if (bestBuy && bestSell && bestBuy.exchange !== bestSell.exchange) {
        const profit = this.calculateArbitrageProfit(bestBuy, bestSell, pair);
        
        if (profit.profitPercentage > this.minProfitThreshold) {
          opportunities.push({
            pair: pair.symbol,
            buyMarket: bestBuy,
            sellMarket: bestSell,
            profit,
            timestamp: Date.now()
          });
        }
      }
    }
    
    // Return best opportunity
    return opportunities.length > 0 
      ? opportunities.sort((a, b) => b.profit.profitPercentage - a.profit.profitPercentage)[0]
      : null;
  }

  /**
   * Generate current market prices for a trading pair
   */
  generateMarketPrices(pair) {
    const prices = {};
    
    for (const [exchangeId, exchange] of Object.entries(this.markets)) {
      // Simulate price with variance
      const variance = (Math.random() - 0.5) * exchange.priceVariance;
      const price = pair.basePrice * (1 + variance);
      
      prices[exchangeId] = {
        exchange: exchangeId,
        price: price,
        spread: exchange.fees,
        liquidity: exchange.liquidity
      };
    }
    
    return prices;
  }

  /**
   * Find best market to buy from (lowest price)
   */
  findBestBuyMarket(prices) {
    let bestMarket = null;
    let lowestPrice = Infinity;
    
    for (const marketData of Object.values(prices)) {
      const effectivePrice = marketData.price * (1 + marketData.spread);
      if (effectivePrice < lowestPrice) {
        lowestPrice = effectivePrice;
        bestMarket = { ...marketData, effectivePrice };
      }
    }
    
    return bestMarket;
  }

  /**
   * Find best market to sell to (highest price)
   */
  findBestSellMarket(prices) {
    let bestMarket = null;
    let highestPrice = 0;
    
    for (const marketData of Object.values(prices)) {
      const effectivePrice = marketData.price * (1 - marketData.spread);
      if (effectivePrice > highestPrice) {
        highestPrice = effectivePrice;
        bestMarket = { ...marketData, effectivePrice };
      }
    }
    
    return bestMarket;
  }

  /**
   * Calculate arbitrage profit
   */
  calculateArbitrageProfit(buyMarket, sellMarket, pair) {
    const buyPrice = buyMarket.effectivePrice;
    const sellPrice = sellMarket.effectivePrice;
    const priceDifference = sellPrice - buyPrice;
    const profitPercentage = priceDifference / buyPrice;
    
    // Calculate position size based on available capital and liquidity
    const maxByCapital = Math.min(this.account.balance, this.maxPositionSize);
    const maxByLiquidity = Math.min(buyMarket.liquidity, sellMarket.liquidity) * 0.01; // 1% of liquidity
    const positionSize = Math.min(maxByCapital, maxByLiquidity);
    
    const quantity = positionSize / buyPrice;
    const grossProfit = quantity * priceDifference;
    
    // Account for slippage and additional fees
    const slippageCost = positionSize * 0.001; // 0.1% slippage
    const netProfit = grossProfit - slippageCost;
    
    return {
      buyPrice,
      sellPrice,
      priceDifference,
      profitPercentage,
      positionSize,
      quantity,
      grossProfit,
      slippageCost,
      netProfit
    };
  }

  /**
   * Execute arbitrage trade
   */
  executeArbitrageTrade(opportunity) {
    const { profit, buyMarket, sellMarket, pair } = opportunity;
    
    // Check if we have enough balance
    if (this.account.balance < profit.positionSize) {
      // Try to use credit if available
      const creditNeeded = profit.positionSize - this.account.balance;
      if (creditNeeded <= this.creditLimit - this.account.creditUsed) {
        this.useCredit(creditNeeded);
      } else {
        return {
          success: false,
          operation: 'arbitrage_trade',
          reason: 'insufficient_capital',
          pair,
          revenue: 0,
          profit: 0
        };
      }
    }

    // Simulate trade execution
    const executionSuccess = this.simulateTradeExecution(opportunity);
    
    if (!executionSuccess.success) {
      return {
        success: false,
        operation: 'arbitrage_trade',
        reason: executionSuccess.reason,
        pair,
        revenue: 0,
        profit: 0
      };
    }

    // Calculate actual profit (with some randomness for realism)
    const executionVariance = (Math.random() - 0.5) * 0.1; // ±5% execution variance
    const actualProfit = profit.netProfit * (1 + executionVariance);
    const revenue = profit.positionSize + actualProfit;

    return {
      success: true,
      operation: 'arbitrage_trade',
      pair,
      buyMarket: buyMarket.exchange,
      sellMarket: sellMarket.exchange,
      positionSize: profit.positionSize,
      revenue: actualProfit, // Only profit is revenue for arbitrage
      profit: actualProfit,
      profitPercentage: actualProfit / profit.positionSize,
      executionTime: Date.now()
    };
  }

  /**
   * Simulate trade execution success/failure
   */
  simulateTradeExecution(opportunity) {
    // Various factors that could cause execution failure
    const failureReasons = [
      { reason: 'price_moved', probability: 0.05 },
      { reason: 'insufficient_liquidity', probability: 0.02 },
      { reason: 'network_congestion', probability: 0.03 },
      { reason: 'exchange_error', probability: 0.01 }
    ];

    for (const failure of failureReasons) {
      if (Math.random() < failure.probability) {
        return { success: false, reason: failure.reason };
      }
    }

    return { success: true };
  }

  /**
   * Get specialized metrics for arbitrage bot
   */
  getSpecializedMetrics() {
    const baseMetrics = this.getMetrics();
    
    return {
      ...baseMetrics,
      specialization: 'arbitrage_trading',
      averageTradeSize: this.maxPositionSize,
      minProfitThreshold: this.minProfitThreshold,
      supportedMarkets: Object.keys(this.markets).length,
      tradingPairs: this.tradingPairs.length,
      lastTradeTime: this.lastTradeTime,
      cooldownRemaining: Math.max(0, this.cooldownPeriod - (Date.now() - this.lastTradeTime)),
      averageProfitPerTrade: this.operationsCount > 0 ? this.totalProfit / this.operationsCount : 0,
      marketsActive: Object.keys(this.markets).length
    };
  }

  /**
   * Update trading parameters based on performance
   */
  optimizeParameters() {
    // Adjust minimum profit threshold based on success rate
    if (this.performance.successRate > 0.8) {
      this.minProfitThreshold = Math.max(0.003, this.minProfitThreshold * 0.95);
    } else if (this.performance.successRate < 0.6) {
      this.minProfitThreshold = Math.min(0.01, this.minProfitThreshold * 1.05);
    }

    // Adjust position size based on performance
    if (this.performance.averageProfit > 0 && this.reputation > 70) {
      this.maxPositionSize = Math.min(this.capital * 0.2, this.maxPositionSize * 1.02);
    } else if (this.performance.averageProfit < 0) {
      this.maxPositionSize = Math.max(this.capital * 0.05, this.maxPositionSize * 0.98);
    }
  }

  /**
   * Override simulate day to include parameter optimization
   */
  async simulateDay() {
    const result = await super.simulateDay();
    
    // Optimize parameters daily
    this.optimizeParameters();
    
    return result;
  }
}