/**
 * Base Bot class for automated business operations
 */
export class Bot {
  constructor(id, type, owner, initialCapital = 1000) {
    this.id = id;
    this.type = type;
    this.owner = owner;
    this.capital = initialCapital;
    this.created = Date.now();
    this.active = true;
    this.totalRevenue = 0;
    this.totalProfit = 0;
    this.operationsCount = 0;
    this.reputation = 50; // Start neutral
    this.creditScore = 600; // Start with fair credit
    this.creditLimit = this.calculateCreditLimit();
    this.account = this.createAccount();
    this.businessPlan = this.generateBusinessPlan();
    this.performance = this.initializePerformance();
  }

  /**
   * Create bot business account
   */
  createAccount() {
    return {
      accountNumber: this.generateAccountNumber(),
      balance: this.capital,
      creditUsed: 0,
      lastActivity: Date.now(),
      transactions: [],
      status: 'active'
    };
  }

  /**
   * Generate business plan based on bot type
   */
  generateBusinessPlan() {
    return {
      strategy: this.getStrategy(),
      targetMarket: this.getTargetMarket(),
      riskLevel: this.getRiskLevel(),
      expectedROI: this.getExpectedROI(),
      operatingHours: this.getOperatingHours(),
      scalingPlan: this.getScalingPlan()
    };
  }

  /**
   * Initialize performance metrics
   */
  initializePerformance() {
    return {
      successRate: 0.5,
      averageProfit: 0,
      riskAdjustedReturn: 0,
      volatility: 0.1,
      maxDrawdown: 0,
      profitFactor: 1.0,
      sharpeRatio: 0
    };
  }

  /**
   * Apply for credit increase
   */
  applyCreditIncrease(requestedAmount) {
    const application = {
      id: this.generateApplicationId(),
      botId: this.id,
      requestedAmount,
      currentCreditLimit: this.creditLimit,
      currentCreditUsed: this.account.creditUsed,
      creditScore: this.creditScore,
      revenue: this.totalRevenue,
      profit: this.totalProfit,
      reputation: this.reputation,
      operationsCount: this.operationsCount,
      timestamp: Date.now()
    };

    const approval = this.evaluateCreditApplication(application);
    
    if (approval.approved) {
      this.creditLimit += approval.approvedAmount;
      this.creditScore += 5; // Small boost for approved credit
    }

    return {
      ...approval,
      application
    };
  }

  /**
   * Evaluate credit application
   */
  evaluateCreditApplication(application) {
    let score = 0;
    
    // Credit score weight (40%)
    score += (application.creditScore / 850) * 40;
    
    // Revenue history weight (25%)
    const revenueScore = Math.min(application.revenue / 10000, 1) * 25;
    score += revenueScore;
    
    // Profit margin weight (20%)
    const profitMargin = application.revenue > 0 ? application.profit / application.revenue : 0;
    score += Math.min(profitMargin * 100, 20);
    
    // Reputation weight (10%)
    score += (application.reputation / 100) * 10;
    
    // Utilization rate weight (5%)
    const utilizationRate = application.creditLimit > 0 
      ? application.currentCreditUsed / application.creditLimit 
      : 0;
    score += (1 - utilizationRate) * 5; // Lower utilization is better
    
    const approvalThreshold = 60;
    const approved = score >= approvalThreshold;
    
    let approvedAmount = 0;
    if (approved) {
      const baseIncrease = application.requestedAmount;
      const multiplier = Math.min(score / 100, 1.5);
      approvedAmount = Math.floor(baseIncrease * multiplier);
    }

    return {
      approved,
      approvedAmount,
      score: Math.round(score),
      reason: this.getCreditDecisionReason(score, approved)
    };
  }

  /**
   * Get credit decision reason
   */
  getCreditDecisionReason(score, approved) {
    if (!approved) {
      if (score < 40) return 'Poor credit history and performance';
      if (score < 50) return 'Insufficient revenue history';
      return 'Below minimum credit threshold';
    }
    
    if (score > 90) return 'Excellent credit profile';
    if (score > 80) return 'Strong financial performance';
    if (score > 70) return 'Good credit standing';
    return 'Meets minimum requirements';
  }

  /**
   * Execute business operation (to be overridden by subclasses)
   */
  async executeOperation() {
    throw new Error('executeOperation must be implemented by subclass');
  }

  /**
   * Update performance metrics
   */
  updatePerformance(revenue, profit, success) {
    this.operationsCount++;
    this.totalRevenue += revenue;
    this.totalProfit += profit;
    
    // Update success rate (exponential moving average)
    const alpha = 0.1;
    this.performance.successRate = this.performance.successRate * (1 - alpha) + 
                                   (success ? 1 : 0) * alpha;
    
    // Update average profit
    this.performance.averageProfit = this.totalProfit / this.operationsCount;
    
    // Update reputation based on performance
    if (success && profit > 0) {
      this.reputation = Math.min(100, this.reputation + 0.5);
    } else if (!success) {
      this.reputation = Math.max(0, this.reputation - 1);
    }
    
    // Update credit score based on performance
    this.updateCreditScore(success, profit);
    
    // Recalculate credit limit
    this.creditLimit = this.calculateCreditLimit();
  }

  /**
   * Update credit score based on performance
   */
  updateCreditScore(success, profit) {
    if (success && profit > 0) {
      this.creditScore = Math.min(850, this.creditScore + 1);
    } else if (!success && profit < -100) {
      this.creditScore = Math.max(300, this.creditScore - 2);
    }
  }

  /**
   * Calculate credit limit based on current metrics
   */
  calculateCreditLimit() {
    const baseCredit = 1000;
    const reputationMultiplier = this.reputation / 100;
    const creditMultiplier = this.creditScore / 600;
    const revenueMultiplier = Math.min(this.totalRevenue / 5000, 2);
    
    return Math.floor(baseCredit * reputationMultiplier * creditMultiplier * revenueMultiplier);
  }

  /**
   * Use credit for operations
   */
  useCredit(amount) {
    const availableCredit = this.creditLimit - this.account.creditUsed;
    
    if (amount > availableCredit) {
      throw new Error(`Insufficient credit. Available: ${availableCredit}, Requested: ${amount}`);
    }
    
    this.account.creditUsed += amount;
    this.account.balance += amount;
    
    this.account.transactions.push({
      type: 'credit_used',
      amount,
      timestamp: Date.now(),
      balance: this.account.balance
    });
    
    return true;
  }

  /**
   * Repay credit
   */
  repayCredit(amount) {
    const repayAmount = Math.min(amount, this.account.creditUsed);
    
    if (this.account.balance < repayAmount) {
      throw new Error('Insufficient balance for credit repayment');
    }
    
    this.account.balance -= repayAmount;
    this.account.creditUsed -= repayAmount;
    
    this.account.transactions.push({
      type: 'credit_repaid',
      amount: repayAmount,
      timestamp: Date.now(),
      balance: this.account.balance
    });
    
    // Small credit score boost for repayment
    this.creditScore = Math.min(850, this.creditScore + 0.5);
    
    return repayAmount;
  }

  /**
   * Simulate daily business activity
   */
  async simulateDay() {
    if (!this.active) return null;

    const operations = this.getOperationsPerDay();
    const results = [];

    for (let i = 0; i < operations; i++) {
      try {
        const result = await this.executeOperation();
        results.push(result);
        
        if (result.revenue) {
          this.account.balance += result.revenue;
          this.account.transactions.push({
            type: 'revenue',
            amount: result.revenue,
            timestamp: Date.now(),
            balance: this.account.balance,
            operation: result.operation
          });
        }
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          operation: 'failed_operation'
        });
      }
    }

    // Auto-repay credit if profitable
    if (this.account.creditUsed > 0 && this.account.balance > this.account.creditUsed * 1.2) {
      const repayAmount = Math.min(this.account.creditUsed, this.account.balance * 0.1);
      this.repayCredit(repayAmount);
    }

    return {
      date: new Date().toISOString().split('T')[0],
      operations: results,
      summary: this.getDailySummary(results)
    };
  }

  /**
   * Get daily summary
   */
  getDailySummary(results) {
    const successful = results.filter(r => r.success);
    const totalRevenue = successful.reduce((sum, r) => sum + (r.revenue || 0), 0);
    const totalProfit = successful.reduce((sum, r) => sum + (r.profit || 0), 0);

    return {
      operationsExecuted: results.length,
      successfulOperations: successful.length,
      successRate: results.length > 0 ? successful.length / results.length : 0,
      totalRevenue,
      totalProfit,
      endingBalance: this.account.balance
    };
  }

  /**
   * Get business metrics
   */
  getMetrics() {
    return {
      id: this.id,
      type: this.type,
      owner: this.owner,
      active: this.active,
      capital: this.capital,
      currentBalance: this.account.balance,
      totalRevenue: this.totalRevenue,
      totalProfit: this.totalProfit,
      operationsCount: this.operationsCount,
      reputation: this.reputation,
      creditScore: this.creditScore,
      creditLimit: this.creditLimit,
      creditUsed: this.account.creditUsed,
      availableCredit: this.creditLimit - this.account.creditUsed,
      performance: this.performance,
      businessPlan: this.businessPlan,
      uptime: this.calculateUptime()
    };
  }

  /**
   * Calculate uptime percentage
   */
  calculateUptime() {
    const totalTime = Date.now() - this.created;
    const activeTime = this.active ? totalTime : totalTime * 0.8;
    return Math.min(100, (activeTime / totalTime) * 100);
  }

  // Abstract methods to be implemented by subclasses
  getStrategy() { return 'generic'; }
  getTargetMarket() { return 'general'; }
  getRiskLevel() { return 'medium'; }
  getExpectedROI() { return 0.1; }
  getOperatingHours() { return 24; }
  getScalingPlan() { return 'linear'; }
  getOperationsPerDay() { return 10; }

  /**
   * Helper methods
   */
  generateAccountNumber() {
    return `BOT${this.type.toUpperCase()}${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  generateApplicationId() {
    return `APP_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Activate/Deactivate bot
   */
  activate() {
    this.active = true;
    this.account.status = 'active';
  }

  deactivate() {
    this.active = false;
    this.account.status = 'inactive';
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      owner: this.owner,
      capital: this.capital,
      created: this.created,
      active: this.active,
      totalRevenue: this.totalRevenue,
      totalProfit: this.totalProfit,
      operationsCount: this.operationsCount,
      reputation: this.reputation,
      creditScore: this.creditScore,
      creditLimit: this.creditLimit,
      account: this.account,
      businessPlan: this.businessPlan,
      performance: this.performance
    };
  }

  /**
   * Create bot from JSON
   */
  static fromJSON(json) {
    const bot = new this(json.id, json.type, json.owner, json.capital);
    bot.created = json.created;
    bot.active = json.active;
    bot.totalRevenue = json.totalRevenue;
    bot.totalProfit = json.totalProfit;
    bot.operationsCount = json.operationsCount;
    bot.reputation = json.reputation;
    bot.creditScore = json.creditScore;
    bot.creditLimit = json.creditLimit;
    bot.account = json.account;
    bot.businessPlan = json.businessPlan;
    bot.performance = json.performance;
    return bot;
  }
}