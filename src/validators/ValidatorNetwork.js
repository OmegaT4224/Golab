import { AIValidator } from './AIValidator.js';

/**
 * AI Validator Network that manages validators and reduces gas fees
 */
export class ValidatorNetwork {
  constructor() {
    this.validators = new Map();
    this.activeValidators = new Set();
    this.validatorPool = [];
    this.networkStats = {
      totalValidators: 0,
      totalStake: 0,
      totalValidations: 0,
      totalGasReduced: 0,
      totalFeesCollected: 0,
      averageEfficiency: 1.0
    };
    this.feeStructure = {
      systemRetention: 0.5,    // 50% system retention
      userSavings: 0.4,        // 40% user savings
      processingFee: 0.0005    // 0.05% processing fee
    };
    this.consensusThreshold = 0.67; // 67% consensus required
    this.maxValidatorsPerTransaction = 3;
  }

  /**
   * Register a new AI validator
   */
  registerValidator(owner, stake = 1000, specialization = null) {
    const validatorId = this.generateValidatorId();
    const validator = new AIValidator(validatorId, owner, stake);
    
    if (specialization) {
      validator.specialization = specialization;
      validator.nftProperties = validator.generateNFTProperties();
    }

    this.validators.set(validatorId, validator);
    this.activeValidators.add(validatorId);
    this.validatorPool.push(validatorId);
    
    this.updateNetworkStats();
    
    console.log(`Validator ${validatorId} registered with stake: ${stake}`);
    return validator;
  }

  /**
   * Remove validator from network
   */
  removeValidator(validatorId) {
    const validator = this.validators.get(validatorId);
    if (!validator) return false;

    this.validators.delete(validatorId);
    this.activeValidators.delete(validatorId);
    this.validatorPool = this.validatorPool.filter(id => id !== validatorId);
    
    this.updateNetworkStats();
    return true;
  }

  /**
   * Validate transaction using AI validator consensus
   */
  async validateTransaction(transaction) {
    if (this.activeValidators.size === 0) {
      throw new Error('No active validators available');
    }

    // Select validators for this transaction
    const selectedValidators = this.selectValidators(transaction);
    const validationResults = [];

    // Get validation from each selected validator
    for (const validatorId of selectedValidators) {
      const validator = this.validators.get(validatorId);
      if (validator && validator.active) {
        const result = validator.validateTransaction(transaction);
        validationResults.push({
          validatorId,
          result,
          weight: this.calculateValidatorWeight(validator)
        });
      }
    }

    // Compute consensus
    const consensus = this.computeConsensus(validationResults);
    
    if (consensus.valid) {
      // Apply gas optimizations
      transaction.gasUsed = consensus.optimizedGas;
      transaction.processingFee = consensus.processingFee;
      transaction.gasReduction = consensus.gasReduction;
      transaction.validators = selectedValidators;
      
      // Update network statistics
      this.updateValidationStats(consensus);
      
      // Distribute rewards to validators
      this.distributeRewards(selectedValidators, consensus.processingFee);
    }

    return consensus;
  }

  /**
   * Select best validators for a transaction
   */
  selectValidators(transaction) {
    const availableValidators = Array.from(this.activeValidators);
    
    if (availableValidators.length <= this.maxValidatorsPerTransaction) {
      return availableValidators;
    }

    // Score validators based on specialization, reputation, and efficiency
    const scoredValidators = availableValidators.map(id => {
      const validator = this.validators.get(id);
      const score = this.calculateValidatorScore(validator, transaction);
      return { id, score };
    });

    // Sort by score and select top validators
    scoredValidators.sort((a, b) => b.score - a.score);
    return scoredValidators
      .slice(0, this.maxValidatorsPerTransaction)
      .map(v => v.id);
  }

  /**
   * Calculate validator score for transaction selection
   */
  calculateValidatorScore(validator, transaction) {
    let score = validator.reputation * 0.4;
    score += validator.efficiency * 100 * 0.3;
    score += (validator.stake / 10000) * 0.2;
    
    // Specialization bonus
    const optimizationFactor = validator.getOptimizationFactor(transaction);
    score += optimizationFactor * 100 * 0.1;
    
    return score;
  }

  /**
   * Calculate validator weight for consensus
   */
  calculateValidatorWeight(validator) {
    const stakeWeight = Math.sqrt(validator.stake) / 100;
    const reputationWeight = validator.reputation / 100;
    const efficiencyWeight = Math.min(validator.efficiency, 2.0) / 2;
    
    return (stakeWeight + reputationWeight + efficiencyWeight) / 3;
  }

  /**
   * Compute consensus from validation results
   */
  computeConsensus(validationResults) {
    if (validationResults.length === 0) {
      return { valid: false, error: 'No validation results' };
    }

    // Calculate weighted consensus
    let totalWeight = 0;
    let validWeight = 0;
    let totalGasReduction = 0;
    let totalProcessingFee = 0;
    let totalConfidence = 0;

    for (const { result, weight } of validationResults) {
      totalWeight += weight;
      
      if (result.valid) {
        validWeight += weight;
        totalGasReduction += result.gasReduction * weight;
        totalProcessingFee += result.processingFee * weight;
        totalConfidence += result.confidence * weight;
      }
    }

    const consensusRatio = validWeight / totalWeight;
    
    if (consensusRatio < this.consensusThreshold) {
      return { 
        valid: false, 
        error: `Consensus not reached (${(consensusRatio * 100).toFixed(1)}%)` 
      };
    }

    const avgGasReduction = totalGasReduction / totalWeight;
    const avgProcessingFee = totalProcessingFee / totalWeight;
    const avgConfidence = totalConfidence / validWeight;

    return {
      valid: true,
      consensusRatio,
      gasReduction: Math.floor(avgGasReduction),
      processingFee: avgProcessingFee,
      optimizedGas: validationResults[0].result.optimizedGas,
      confidence: avgConfidence,
      validators: validationResults.length
    };
  }

  /**
   * Distribute rewards to validators
   */
  distributeRewards(validatorIds, totalFee) {
    const rewardPerValidator = totalFee / validatorIds.length;
    
    for (const validatorId of validatorIds) {
      const validator = this.validators.get(validatorId);
      if (validator) {
        validator.totalRewards += rewardPerValidator;
      }
    }
  }

  /**
   * Create validator child (NFT minting)
   */
  replicateValidator(parentId, newOwner, inheritanceRatio = 0.8) {
    const parent = this.validators.get(parentId);
    if (!parent) {
      throw new Error('Parent validator not found');
    }

    const child = parent.replicate(newOwner, inheritanceRatio);
    
    this.validators.set(child.id, child);
    this.activeValidators.add(child.id);
    this.validatorPool.push(child.id);
    
    this.updateNetworkStats();
    
    return child;
  }

  /**
   * Get validator family tree
   */
  getValidatorFamily(validatorId) {
    const validator = this.validators.get(validatorId);
    if (!validator) return null;

    const family = {
      validator: validator.getMetrics(),
      parent: null,
      children: []
    };

    // Get parent
    if (validator.parent) {
      const parent = this.validators.get(validator.parent);
      if (parent) {
        family.parent = parent.getMetrics();
      }
    }

    // Get children
    for (const childId of validator.children) {
      const child = this.validators.get(childId);
      if (child) {
        family.children.push(child.getMetrics());
      }
    }

    return family;
  }

  /**
   * Update network statistics
   */
  updateNetworkStats() {
    this.networkStats.totalValidators = this.validators.size;
    this.networkStats.totalStake = Array.from(this.validators.values())
      .reduce((sum, v) => sum + v.stake, 0);
    
    const efficiencies = Array.from(this.validators.values()).map(v => v.efficiency);
    this.networkStats.averageEfficiency = efficiencies.length > 0
      ? efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length
      : 1.0;
  }

  /**
   * Update validation statistics
   */
  updateValidationStats(consensus) {
    this.networkStats.totalValidations++;
    this.networkStats.totalGasReduced += consensus.gasReduction;
    this.networkStats.totalFeesCollected += consensus.processingFee;
  }

  /**
   * Get network performance metrics
   */
  getNetworkMetrics() {
    const activeValidatorsList = Array.from(this.activeValidators)
      .map(id => this.validators.get(id))
      .filter(v => v);

    return {
      ...this.networkStats,
      activeValidators: this.activeValidators.size,
      averageReputation: activeValidatorsList.length > 0
        ? activeValidatorsList.reduce((sum, v) => sum + v.reputation, 0) / activeValidatorsList.length
        : 0,
      specializations: this.getSpecializationDistribution(),
      generations: this.getGenerationDistribution(),
      topValidators: this.getTopValidators(5)
    };
  }

  /**
   * Get specialization distribution
   */
  getSpecializationDistribution() {
    const distribution = {};
    
    for (const validator of this.validators.values()) {
      distribution[validator.specialization] = 
        (distribution[validator.specialization] || 0) + 1;
    }
    
    return distribution;
  }

  /**
   * Get generation distribution
   */
  getGenerationDistribution() {
    const distribution = {};
    
    for (const validator of this.validators.values()) {
      distribution[validator.generation] = 
        (distribution[validator.generation] || 0) + 1;
    }
    
    return distribution;
  }

  /**
   * Get top performing validators
   */
  getTopValidators(count = 10) {
    return Array.from(this.validators.values())
      .sort((a, b) => {
        const scoreA = a.reputation * a.efficiency * Math.sqrt(a.stake);
        const scoreB = b.reputation * b.efficiency * Math.sqrt(b.stake);
        return scoreB - scoreA;
      })
      .slice(0, count)
      .map(v => v.getMetrics());
  }

  /**
   * Generate unique validator ID
   */
  generateValidatorId() {
    return `validator_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Get all validators
   */
  getAllValidators() {
    return Array.from(this.validators.values()).map(v => v.getMetrics());
  }

  /**
   * Get validator by ID
   */
  getValidator(validatorId) {
    const validator = this.validators.get(validatorId);
    return validator ? validator.getMetrics() : null;
  }

  /**
   * Activate validator
   */
  activateValidator(validatorId) {
    const validator = this.validators.get(validatorId);
    if (validator) {
      validator.reactivate();
      this.activeValidators.add(validatorId);
      return true;
    }
    return false;
  }

  /**
   * Deactivate validator
   */
  deactivateValidator(validatorId) {
    const validator = this.validators.get(validatorId);
    if (validator) {
      validator.deactivate();
      this.activeValidators.delete(validatorId);
      return true;
    }
    return false;
  }

  /**
   * Export network data
   */
  export() {
    return {
      validators: Array.from(this.validators.entries()).map(([id, validator]) => 
        [id, validator.toJSON()]
      ),
      activeValidators: Array.from(this.activeValidators),
      validatorPool: this.validatorPool,
      networkStats: this.networkStats,
      feeStructure: this.feeStructure
    };
  }

  /**
   * Import network data
   */
  import(data) {
    this.validators = new Map(
      data.validators.map(([id, validatorData]) => 
        [id, AIValidator.fromJSON(validatorData)]
      )
    );
    this.activeValidators = new Set(data.activeValidators);
    this.validatorPool = data.validatorPool;
    this.networkStats = data.networkStats;
    this.feeStructure = data.feeStructure;
  }
}