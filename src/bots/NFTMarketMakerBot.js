import { Bot } from './Bot.js';

/**
 * NFT Market Maker Bot - provides liquidity and facilitates NFT trading
 */
export class NFTMarketMakerBot extends Bot {
  constructor(id, owner, initialCapital = 3000) {
    super(id, 'nft_market_maker', owner, initialCapital);
    this.nftCollections = this.initializeCollections();
    this.inventory = new Map(); // NFTs owned by the bot
    this.orderBook = { bids: [], asks: [] };
    this.spreadPercentage = 0.05; // 5% spread
    this.maxInventoryValue = this.capital * 0.7; // 70% of capital in inventory
    this.floorPriceBuffer = 0.1; // 10% above floor price for bids
    this.marketData = this.initializeMarketData();
  }

  getStrategy() {
    return 'nft_liquidity_provision';
  }

  getTargetMarket() {
    return 'nft_secondary_markets';
  }

  getRiskLevel() {
    return 'medium_to_high';
  }

  getExpectedROI() {
    return 0.25; // 25% annual ROI
  }

  getOperatingHours() {
    return 24; // 24/7 operation
  }

  getScalingPlan() {
    return 'collection_diversification';
  }

  getOperationsPerDay() {
    return Math.floor(15 + (this.reputation / 5)); // 15-35 operations per day
  }

  /**
   * Initialize NFT collections to trade
   */
  initializeCollections() {
    return [
      {
        id: 'crypto_punks',
        name: 'CryptoPunks',
        floorPrice: 50000,
        volume24h: 500000,
        volatility: 0.15,
        liquidity: 'high',
        trend: 'stable'
      },
      {
        id: 'bored_apes',
        name: 'Bored Ape Yacht Club',
        floorPrice: 80000,
        volume24h: 800000,
        volatility: 0.2,
        liquidity: 'high', 
        trend: 'bullish'
      },
      {
        id: 'art_blocks',
        name: 'Art Blocks Curated',
        floorPrice: 5000,
        volume24h: 100000,
        volatility: 0.3,
        liquidity: 'medium',
        trend: 'bearish'
      },
      {
        id: 'azuki',
        name: 'Azuki',
        floorPrice: 12000,
        volume24h: 200000,
        volatility: 0.25,
        liquidity: 'medium',
        trend: 'stable'
      },
      {
        id: 'doodles',
        name: 'Doodles',
        floorPrice: 3000,
        volume24h: 75000,
        volatility: 0.35,
        liquidity: 'low',
        trend: 'bullish'
      }
    ];
  }

  /**
   * Initialize market data tracking
   */
  initializeMarketData() {
    const data = {};
    for (const collection of this.nftCollections) {
      data[collection.id] = {
        recentSales: [],
        priceHistory: [],
        bidDepth: 0,
        askDepth: 0,
        lastUpdate: Date.now()
      };
    }
    return data;
  }

  /**
   * Execute NFT market making operation
   */
  async executeOperation() {
    const operationType = this.selectOperationType();
    
    switch (operationType) {
      case 'place_bid':
        return await this.placeBid();
      case 'place_ask':
        return await this.placeAsk();
      case 'update_orders':
        return await this.updateOrders();
      case 'arbitrage':
        return await this.executeNFTArbitrage();
      case 'inventory_management':
        return await this.manageInventory();
      default:
        return this.scanMarket();
    }
  }

  /**
   * Select operation type based on current state
   */
  selectOperationType() {
    const inventoryRatio = this.getInventoryValue() / this.maxInventoryValue;
    const random = Math.random();

    if (inventoryRatio > 0.8) {
      return random < 0.6 ? 'place_ask' : 'inventory_management';
    } else if (inventoryRatio < 0.3) {
      return random < 0.6 ? 'place_bid' : 'scan_market';
    } else {
      if (random < 0.3) return 'place_bid';
      if (random < 0.6) return 'place_ask';
      if (random < 0.8) return 'update_orders';
      if (random < 0.9) return 'arbitrage';
      return 'inventory_management';
    }
  }

  /**
   * Place bid on NFT collection
   */
  async placeBid() {
    const collection = this.selectCollection('bid');
    if (!collection) {
      return {
        success: false,
        operation: 'place_bid',
        reason: 'no_suitable_collection',
        revenue: 0,
        profit: 0
      };
    }

    const bidPrice = this.calculateBidPrice(collection);
    const quantity = this.calculateBidQuantity(bidPrice);

    if (bidPrice * quantity > this.account.balance) {
      // Try to use credit
      const creditNeeded = (bidPrice * quantity) - this.account.balance;
      if (creditNeeded <= this.creditLimit - this.account.creditUsed) {
        this.useCredit(creditNeeded);
      } else {
        return {
          success: false,
          operation: 'place_bid',
          reason: 'insufficient_capital',
          collection: collection.id,
          revenue: 0,
          profit: 0
        };
      }
    }

    // Simulate bid placement and potential fill
    const fillResult = this.simulateBidFill(collection, bidPrice, quantity);
    
    if (fillResult.filled) {
      // Add NFT to inventory
      const nftId = this.generateNFTId(collection.id);
      this.inventory.set(nftId, {
        collectionId: collection.id,
        purchasePrice: bidPrice,
        acquiredAt: Date.now(),
        tokenId: Math.floor(Math.random() * 10000)
      });

      // Update market data
      this.updateMarketData(collection.id, 'purchase', bidPrice);

      const revenue = 0; // No immediate revenue from buying
      const cost = bidPrice;

      return {
        success: true,
        operation: 'place_bid',
        collection: collection.id,
        price: bidPrice,
        quantity: 1,
        nftId,
        revenue: 0,
        profit: -cost, // Cost as negative profit initially
        filled: true
      };
    } else {
      // Bid placed but not filled
      this.orderBook.bids.push({
        id: this.generateOrderId(),
        collection: collection.id,
        price: bidPrice,
        quantity,
        timestamp: Date.now(),
        status: 'open'
      });

      return {
        success: true,
        operation: 'place_bid',
        collection: collection.id,
        price: bidPrice,
        quantity,
        revenue: 0,
        profit: 0,
        filled: false
      };
    }
  }

  /**
   * Place ask (sell order) for owned NFT
   */
  async placeAsk() {
    if (this.inventory.size === 0) {
      return {
        success: false,
        operation: 'place_ask',
        reason: 'no_inventory',
        revenue: 0,
        profit: 0
      };
    }

    const nftToSell = this.selectNFTToSell();
    if (!nftToSell) {
      return {
        success: false,
        operation: 'place_ask', 
        reason: 'no_suitable_nft',
        revenue: 0,
        profit: 0
      };
    }

    const collection = this.nftCollections.find(c => c.id === nftToSell.collectionId);
    const askPrice = this.calculateAskPrice(collection, nftToSell);

    // Simulate ask placement and potential fill
    const fillResult = this.simulateAskFill(collection, askPrice);

    if (fillResult.filled) {
      // Remove NFT from inventory
      this.inventory.delete(nftToSell.id);

      // Calculate profit
      const profit = askPrice - nftToSell.purchasePrice;
      const profitMargin = profit / nftToSell.purchasePrice;

      // Update market data
      this.updateMarketData(collection.id, 'sale', askPrice);

      return {
        success: true,
        operation: 'place_ask',
        collection: collection.id,
        nftId: nftToSell.id,
        purchasePrice: nftToSell.purchasePrice,
        salePrice: askPrice,
        revenue: askPrice,
        profit: profit,
        profitMargin: profitMargin,
        holdingPeriod: Date.now() - nftToSell.acquiredAt,
        filled: true
      };
    } else {
      // Ask placed but not filled
      this.orderBook.asks.push({
        id: this.generateOrderId(),
        nftId: nftToSell.id,
        collection: collection.id,
        price: askPrice,
        timestamp: Date.now(),
        status: 'open'
      });

      return {
        success: true,
        operation: 'place_ask',
        collection: collection.id,
        nftId: nftToSell.id,
        price: askPrice,
        revenue: 0,
        profit: 0,
        filled: false
      };
    }
  }

  /**
   * Calculate bid price based on collection floor price and spread
   */
  calculateBidPrice(collection) {
    const currentFloor = this.getCurrentFloorPrice(collection);
    const bidPrice = currentFloor * (1 - this.spreadPercentage - this.floorPriceBuffer);
    return Math.max(bidPrice, currentFloor * 0.7); // Never bid below 70% of floor
  }

  /**
   * Calculate ask price based on collection floor and spread
   */
  calculateAskPrice(collection, nft) {
    const currentFloor = this.getCurrentFloorPrice(collection);
    const marketPremium = this.calculateMarketPremium(collection, nft);
    return currentFloor * (1 + this.spreadPercentage + marketPremium);
  }

  /**
   * Get current floor price with simulated fluctuations
   */
  getCurrentFloorPrice(collection) {
    const basePrice = collection.floorPrice;
    const volatility = collection.volatility;
    const trendMultiplier = this.getTrendMultiplier(collection.trend);
    
    // Simulate price movement
    const randomChange = (Math.random() - 0.5) * volatility;
    const currentPrice = basePrice * trendMultiplier * (1 + randomChange);
    
    return Math.max(currentPrice, basePrice * 0.5); // Floor can't drop below 50% of base
  }

  /**
   * Get trend multiplier
   */
  getTrendMultiplier(trend) {
    switch (trend) {
      case 'bullish': return 1.05;
      case 'bearish': return 0.95;
      case 'stable': return 1.0;
      default: return 1.0;
    }
  }

  /**
   * Calculate market premium for rare traits
   */
  calculateMarketPremium(collection, nft) {
    // Simulate rarity-based premium
    const rarityScore = Math.random();
    if (rarityScore > 0.95) return 0.5; // 50% premium for top 5%
    if (rarityScore > 0.85) return 0.3; // 30% premium for top 15%
    if (rarityScore > 0.7) return 0.15; // 15% premium for top 30%
    return 0; // No premium for common traits
  }

  /**
   * Select collection for bidding
   */
  selectCollection(operation) {
    // Filter collections based on liquidity and volatility
    const suitableCollections = this.nftCollections.filter(collection => {
      if (operation === 'bid') {
        return collection.liquidity !== 'low' && collection.volatility < 0.4;
      }
      return true;
    });

    if (suitableCollections.length === 0) return null;

    // Weight by volume and liquidity
    const weights = suitableCollections.map(c => c.volume24h * (c.liquidity === 'high' ? 2 : 1));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    let random = Math.random() * totalWeight;
    for (let i = 0; i < suitableCollections.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return suitableCollections[i];
      }
    }

    return suitableCollections[0];
  }

  /**
   * Select NFT to sell from inventory
   */
  selectNFTToSell() {
    if (this.inventory.size === 0) return null;

    const nfts = Array.from(this.inventory.entries()).map(([id, nft]) => ({
      id,
      ...nft
    }));

    // Prefer to sell NFTs held longer or with good profit potential
    nfts.sort((a, b) => {
      const ageA = Date.now() - a.acquiredAt;
      const ageB = Date.now() - b.acquiredAt;
      return ageB - ageA; // Older first
    });

    return nfts[0];
  }

  /**
   * Simulate bid fill probability
   */
  simulateBidFill(collection, bidPrice, quantity) {
    const floorPrice = this.getCurrentFloorPrice(collection);
    const priceRatio = bidPrice / floorPrice;
    
    // Higher bid relative to floor = higher fill probability
    let fillProbability = Math.min(priceRatio * 0.3, 0.8);
    
    // Adjust for collection liquidity
    if (collection.liquidity === 'high') fillProbability *= 1.2;
    if (collection.liquidity === 'low') fillProbability *= 0.7;

    return {
      filled: Math.random() < fillProbability
    };
  }

  /**
   * Simulate ask fill probability
   */
  simulateAskFill(collection, askPrice) {
    const floorPrice = this.getCurrentFloorPrice(collection);
    const priceRatio = askPrice / floorPrice;
    
    // Lower ask relative to floor = higher fill probability
    let fillProbability = Math.min((2 - priceRatio) * 0.4, 0.9);
    
    // Adjust for collection liquidity and trend
    if (collection.liquidity === 'high') fillProbability *= 1.3;
    if (collection.trend === 'bullish') fillProbability *= 1.2;
    if (collection.trend === 'bearish') fillProbability *= 0.8;

    return {
      filled: Math.random() < fillProbability
    };
  }

  /**
   * Calculate bid quantity (always 1 for NFTs)
   */
  calculateBidQuantity(bidPrice) {
    return 1; // NFTs are indivisible
  }

  /**
   * Get total inventory value
   */
  getInventoryValue() {
    let totalValue = 0;
    for (const [id, nft] of this.inventory) {
      const collection = this.nftCollections.find(c => c.id === nft.collectionId);
      if (collection) {
        totalValue += this.getCurrentFloorPrice(collection);
      }
    }
    return totalValue;
  }

  /**
   * Update market data
   */
  updateMarketData(collectionId, action, price) {
    if (!this.marketData[collectionId]) return;

    const data = this.marketData[collectionId];
    
    if (action === 'purchase' || action === 'sale') {
      data.recentSales.push({
        price,
        timestamp: Date.now(),
        action
      });

      // Keep only recent sales (last 24 hours simulated)
      const cutoff = Date.now() - (24 * 60 * 60 * 1000);
      data.recentSales = data.recentSales.filter(sale => sale.timestamp > cutoff);
    }

    data.lastUpdate = Date.now();
  }

  /**
   * Execute NFT arbitrage between different marketplaces
   */
  async executeNFTArbitrage() {
    // Simulate finding arbitrage opportunity
    const opportunity = this.findArbitrageOpportunity();
    
    if (!opportunity) {
      return {
        success: false,
        operation: 'nft_arbitrage',
        reason: 'no_opportunity',
        revenue: 0,
        profit: 0
      };
    }

    // Execute arbitrage
    const result = this.executeArbitrageOpportunity(opportunity);
    
    return {
      success: result.success,
      operation: 'nft_arbitrage',
      collection: opportunity.collection,
      buyPrice: opportunity.buyPrice,
      sellPrice: opportunity.sellPrice,
      revenue: result.revenue,
      profit: result.profit,
      profitMargin: result.profit / opportunity.buyPrice
    };
  }

  /**
   * Find arbitrage opportunity (simplified)
   */
  findArbitrageOpportunity() {
    const collection = this.selectCollection('arbitrage');
    if (!collection) return null;

    const floorPrice = this.getCurrentFloorPrice(collection);
    
    // Simulate price differences between marketplaces
    const marketplace1Price = floorPrice * (1 + (Math.random() - 0.5) * 0.1);
    const marketplace2Price = floorPrice * (1 + (Math.random() - 0.5) * 0.1);

    const priceDiff = Math.abs(marketplace2Price - marketplace1Price);
    const minProfitThreshold = floorPrice * 0.05; // 5% minimum profit

    if (priceDiff > minProfitThreshold) {
      return {
        collection: collection.id,
        buyPrice: Math.min(marketplace1Price, marketplace2Price),
        sellPrice: Math.max(marketplace1Price, marketplace2Price),
        profit: priceDiff
      };
    }

    return null;
  }

  /**
   * Execute arbitrage opportunity
   */
  executeArbitrageOpportunity(opportunity) {
    // Simulate execution success/failure
    const executionSuccess = Math.random() > 0.2; // 80% success rate

    if (!executionSuccess) {
      return {
        success: false,
        revenue: 0,
        profit: 0
      };
    }

    return {
      success: true,
      revenue: opportunity.profit,
      profit: opportunity.profit * 0.9 // Account for fees
    };
  }

  /**
   * Manage inventory (rebalancing, liquidation)
   */
  async manageInventory() {
    const inventoryValue = this.getInventoryValue();
    const targetRatio = 0.6; // Target 60% of max inventory value

    if (inventoryValue > this.maxInventoryValue * 0.9) {
      // Liquidate some NFTs
      return await this.liquidateInventory();
    } else if (inventoryValue < this.maxInventoryValue * 0.3) {
      // Acquire more NFTs
      return await this.acquireInventory();
    }

    return {
      success: true,
      operation: 'inventory_management',
      action: 'no_action_needed',
      inventoryValue,
      revenue: 0,
      profit: 0
    };
  }

  /**
   * Liquidate inventory when overloaded
   */
  async liquidateInventory() {
    if (this.inventory.size === 0) {
      return {
        success: false,
        operation: 'liquidate_inventory',
        reason: 'no_inventory',
        revenue: 0,
        profit: 0
      };
    }

    // Find least profitable NFT to liquidate
    const nfts = Array.from(this.inventory.entries()).map(([id, nft]) => {
      const collection = this.nftCollections.find(c => c.id === nft.collectionId);
      const currentValue = this.getCurrentFloorPrice(collection);
      const unrealizedProfit = currentValue - nft.purchasePrice;
      
      return {
        id,
        ...nft,
        currentValue,
        unrealizedProfit,
        profitMargin: unrealizedProfit / nft.purchasePrice
      };
    });

    // Sort by profit margin (liquidate worst performing first)
    nfts.sort((a, b) => a.profitMargin - b.profitMargin);
    const nftToLiquidate = nfts[0];

    // Remove from inventory and simulate sale
    this.inventory.delete(nftToLiquidate.id);
    const salePrice = nftToLiquidate.currentValue * 0.95; // 5% discount for quick sale

    return {
      success: true,
      operation: 'liquidate_inventory',
      nftId: nftToLiquidate.id,
      collection: nftToLiquidate.collectionId,
      purchasePrice: nftToLiquidate.purchasePrice,
      salePrice,
      revenue: salePrice,
      profit: salePrice - nftToLiquidate.purchasePrice,
      profitMargin: (salePrice - nftToLiquidate.purchasePrice) / nftToLiquidate.purchasePrice
    };
  }

  /**
   * Acquire inventory when underweight
   */
  async acquireInventory() {
    return await this.placeBid();
  }

  /**
   * Update orders in the order book
   */
  async updateOrders() {
    let updatedOrders = 0;

    // Update bid orders
    this.orderBook.bids = this.orderBook.bids.filter(bid => {
      const age = Date.now() - bid.timestamp;
      if (age > 24 * 60 * 60 * 1000) { // Cancel orders older than 24 hours
        updatedOrders++;
        return false;
      }
      return true;
    });

    // Update ask orders
    this.orderBook.asks = this.orderBook.asks.filter(ask => {
      const age = Date.now() - ask.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        updatedOrders++;
        return false;
      }
      return true;
    });

    return {
      success: true,
      operation: 'update_orders',
      ordersUpdated: updatedOrders,
      activeBids: this.orderBook.bids.length,
      activeAsks: this.orderBook.asks.length,
      revenue: 0,
      profit: 0
    };
  }

  /**
   * Scan market for opportunities
   */
  scanMarket() {
    // Update collection data
    for (const collection of this.nftCollections) {
      // Simulate market data updates
      const priceChange = (Math.random() - 0.5) * collection.volatility * 0.1;
      collection.floorPrice *= (1 + priceChange);
    }

    return {
      success: true,
      operation: 'scan_market',
      collectionsScanned: this.nftCollections.length,
      revenue: 0,
      profit: 0
    };
  }

  /**
   * Get specialized metrics for NFT market maker
   */
  getSpecializedMetrics() {
    const baseMetrics = this.getMetrics();
    const inventoryValue = this.getInventoryValue();

    return {
      ...baseMetrics,
      specialization: 'nft_market_making',
      inventorySize: this.inventory.size,
      inventoryValue,
      inventoryRatio: inventoryValue / this.maxInventoryValue,
      activeBids: this.orderBook.bids.length,
      activeAsks: this.orderBook.asks.length,
      spreadPercentage: this.spreadPercentage,
      collectionsTraded: this.nftCollections.length,
      averageHoldingPeriod: this.calculateAverageHoldingPeriod(),
      bestPerformingCollection: this.getBestPerformingCollection(),
      inventoryTurnover: this.calculateInventoryTurnover()
    };
  }

  /**
   * Calculate average holding period for sold NFTs
   */
  calculateAverageHoldingPeriod() {
    // This would be calculated from historical data
    return Math.floor(Math.random() * 30) + 1; // 1-30 days average
  }

  /**
   * Get best performing collection
   */
  getBestPerformingCollection() {
    return this.nftCollections.reduce((best, current) => {
      return current.volume24h > best.volume24h ? current : best;
    }).name;
  }

  /**
   * Calculate inventory turnover rate
   */
  calculateInventoryTurnover() {
    // Revenue / Average Inventory Value
    const avgInventoryValue = this.getInventoryValue() || 1;
    return this.totalRevenue / avgInventoryValue;
  }

  /**
   * Helper methods
   */
  generateNFTId(collectionId) {
    return `${collectionId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }

  generateOrderId() {
    return `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
}