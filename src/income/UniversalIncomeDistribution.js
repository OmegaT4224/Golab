/**
 * Universal Income Distribution System
 * Distributes profits: 60% to universal income, 25% to development, 15% to reserves
 */
export class UniversalIncomeDistribution {
  constructor() {
    this.participants = new Map();
    this.distributionHistory = [];
    this.distributionRules = {
      universalIncome: 0.6,      // 60% to universal income
      development: 0.25,         // 25% to development
      reserves: 0.15             // 15% to reserves
    };
    this.pools = {
      universalIncome: 0,
      development: 0,
      reserves: 0,
      total: 0
    };
    this.distributionSchedule = {
      frequency: 'daily',        // daily, weekly, monthly
      lastDistribution: 0,
      nextDistribution: 0,
      minimumThreshold: 100      // Minimum amount to trigger distribution
    };
    this.participantRequirements = {
      minimumStake: 10,          // Minimum stake to participate
      minimumReputation: 30,     // Minimum reputation score
      kyc: false                 // KYC requirement (simplified)
    };
    this.metrics = {
      totalDistributed: 0,
      totalParticipants: 0,
      averagePayment: 0,
      distributionCount: 0,
      participationRate: 0
    };
  }

  /**
   * Register a new participant for universal income
   */
  registerParticipant(address, profile = {}) {
    if (this.participants.has(address)) {
      throw new Error('Participant already registered');
    }

    const participant = {
      address,
      registered: Date.now(),
      active: true,
      stake: profile.stake || 0,
      reputation: profile.reputation || 50,
      kycCompleted: profile.kyc || false,
      totalReceived: 0,
      distributionsReceived: 0,
      lastPayment: 0,
      paymentHistory: [],
      profile: {
        name: profile.name || '',
        email: profile.email || '',
        location: profile.location || '',
        preferences: profile.preferences || {}
      },
      eligibility: this.checkEligibility(profile)
    };

    this.participants.set(address, participant);
    this.updateMetrics();

    console.log(`Participant ${address} registered for universal income`);
    return participant;
  }

  /**
   * Remove participant from the system
   */
  removeParticipant(address) {
    const participant = this.participants.get(address);
    if (!participant) return false;

    this.participants.delete(address);
    this.updateMetrics();
    return true;
  }

  /**
   * Check if participant meets eligibility requirements
   */
  checkEligibility(profile) {
    const checks = {
      minimumStake: (profile.stake || 0) >= this.participantRequirements.minimumStake,
      minimumReputation: (profile.reputation || 0) >= this.participantRequirements.minimumReputation,
      kycCompleted: !this.participantRequirements.kyc || (profile.kyc || false)
    };

    const eligible = Object.values(checks).every(check => check);

    return {
      eligible,
      checks,
      reason: eligible ? 'meets_all_requirements' : this.getIneligibilityReason(checks)
    };
  }

  /**
   * Get reason for ineligibility
   */
  getIneligibilityReason(checks) {
    if (!checks.minimumStake) return 'insufficient_stake';
    if (!checks.minimumReputation) return 'insufficient_reputation';
    if (!checks.kycCompleted) return 'kyc_not_completed';
    return 'unknown';
  }

  /**
   * Add profits to distribution pools
   */
  addProfits(amount, source = 'general') {
    if (amount <= 0) return;

    const distribution = {
      universalIncome: amount * this.distributionRules.universalIncome,
      development: amount * this.distributionRules.development,
      reserves: amount * this.distributionRules.reserves
    };

    // Add to pools
    this.pools.universalIncome += distribution.universalIncome;
    this.pools.development += distribution.development;
    this.pools.reserves += distribution.reserves;
    this.pools.total += amount;

    // Log the addition
    console.log(`Added ${amount} to pools from ${source}:`, distribution);

    // Check if we should trigger distribution
    this.checkDistributionTrigger();

    return distribution;
  }

  /**
   * Check if distribution should be triggered
   */
  checkDistributionTrigger() {
    const now = Date.now();
    const timeSinceLastDistribution = now - this.distributionSchedule.lastDistribution;
    const frequencyMs = this.getFrequencyInMs();

    const shouldDistribute = (
      this.pools.universalIncome >= this.distributionSchedule.minimumThreshold &&
      timeSinceLastDistribution >= frequencyMs
    );

    if (shouldDistribute) {
      this.distributeUniversalIncome();
    }
  }

  /**
   * Get frequency in milliseconds
   */
  getFrequencyInMs() {
    switch (this.distributionSchedule.frequency) {
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      case 'monthly': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Distribute universal income to eligible participants
   */
  distributeUniversalIncome() {
    const eligibleParticipants = this.getEligibleParticipants();
    
    if (eligibleParticipants.length === 0) {
      console.log('No eligible participants for distribution');
      return null;
    }

    const totalAmount = this.pools.universalIncome;
    if (totalAmount < this.distributionSchedule.minimumThreshold) {
      console.log('Insufficient funds for distribution');
      return null;
    }

    // Calculate individual payments based on stake weighting
    const distribution = this.calculateDistribution(eligibleParticipants, totalAmount);
    
    // Execute distribution
    const distributionRecord = this.executeDistribution(distribution);

    // Update pools
    this.pools.universalIncome = 0; // Reset after distribution

    // Update schedule
    this.distributionSchedule.lastDistribution = Date.now();
    this.distributionSchedule.nextDistribution = 
      this.distributionSchedule.lastDistribution + this.getFrequencyInMs();

    // Update metrics
    this.updateMetrics();

    console.log(`Universal income distributed to ${eligibleParticipants.length} participants`);
    return distributionRecord;
  }

  /**
   * Get eligible participants for distribution
   */
  getEligibleParticipants() {
    return Array.from(this.participants.values()).filter(participant => {
      return participant.active && 
             participant.eligibility.eligible &&
             this.checkCurrentEligibility(participant);
    });
  }

  /**
   * Check current eligibility (may have changed since registration)
   */
  checkCurrentEligibility(participant) {
    return participant.stake >= this.participantRequirements.minimumStake &&
           participant.reputation >= this.participantRequirements.minimumReputation &&
           (!this.participantRequirements.kyc || participant.kycCompleted);
  }

  /**
   * Calculate distribution amounts for participants
   */
  calculateDistribution(participants, totalAmount) {
    // Calculate weights based on stake and reputation
    const participantWeights = participants.map(participant => {
      const stakeWeight = Math.sqrt(participant.stake); // Square root to reduce inequality
      const reputationWeight = participant.reputation / 100;
      const participationWeight = Math.min(participant.distributionsReceived / 10, 1); // Reward consistent participation
      
      return {
        participant,
        weight: stakeWeight * (1 + reputationWeight * 0.2 + participationWeight * 0.1)
      };
    });

    const totalWeight = participantWeights.reduce((sum, pw) => sum + pw.weight, 0);

    // Ensure minimum payment per participant
    const basePayment = Math.min(totalAmount * 0.3 / participants.length, 10); // 30% split equally, max $10 base
    const remainingAmount = totalAmount - (basePayment * participants.length);

    return participantWeights.map(({ participant, weight }) => {
      const weightedPayment = remainingAmount * (weight / totalWeight);
      const totalPayment = basePayment + weightedPayment;

      return {
        participant,
        amount: totalPayment,
        breakdown: {
          basePayment,
          weightedPayment,
          weight
        }
      };
    });
  }

  /**
   * Execute the distribution
   */
  executeDistribution(distribution) {
    const distributionId = this.generateDistributionId();
    const timestamp = Date.now();
    
    const distributionRecord = {
      id: distributionId,
      timestamp,
      totalAmount: distribution.reduce((sum, d) => sum + d.amount, 0),
      participantCount: distribution.length,
      payments: [],
      status: 'completed'
    };

    // Process each payment
    for (const { participant, amount, breakdown } of distribution) {
      const payment = {
        participantAddress: participant.address,
        amount,
        breakdown,
        timestamp,
        transactionId: this.generateTransactionId()
      };

      // Update participant record
      participant.totalReceived += amount;
      participant.distributionsReceived++;
      participant.lastPayment = timestamp;
      participant.paymentHistory.push(payment);

      // Keep only last 100 payments in history
      if (participant.paymentHistory.length > 100) {
        participant.paymentHistory = participant.paymentHistory.slice(-100);
      }

      distributionRecord.payments.push(payment);
    }

    // Add to distribution history
    this.distributionHistory.push(distributionRecord);

    // Keep only last 50 distributions in history
    if (this.distributionHistory.length > 50) {
      this.distributionHistory = this.distributionHistory.slice(-50);
    }

    // Update metrics
    this.metrics.totalDistributed += distributionRecord.totalAmount;
    this.metrics.distributionCount++;
    this.metrics.averagePayment = this.metrics.totalDistributed / 
      (this.metrics.distributionCount * this.metrics.totalParticipants || 1);

    return distributionRecord;
  }

  /**
   * Get participant information
   */
  getParticipant(address) {
    const participant = this.participants.get(address);
    if (!participant) return null;

    return {
      ...participant,
      currentEligibility: this.checkCurrentEligibility(participant),
      nextDistribution: this.distributionSchedule.nextDistribution,
      estimatedNextPayment: this.estimateNextPayment(participant)
    };
  }

  /**
   * Estimate next payment for participant
   */
  estimateNextPayment(participant) {
    if (!this.checkCurrentEligibility(participant)) return 0;

    const eligibleCount = this.getEligibleParticipants().length || 1;
    const currentPool = this.pools.universalIncome;
    const estimatedPoolAtDistribution = currentPool + (currentPool * 0.1); // Estimate 10% growth

    const stakeWeight = Math.sqrt(participant.stake);
    const reputationWeight = participant.reputation / 100;
    const weight = stakeWeight * (1 + reputationWeight * 0.2);
    
    const totalEstimatedWeight = eligibleCount * weight; // Simplified
    const basePayment = Math.min(estimatedPoolAtDistribution * 0.3 / eligibleCount, 10);
    const weightedPayment = estimatedPoolAtDistribution * 0.7 * (weight / totalEstimatedWeight);

    return basePayment + weightedPayment;
  }

  /**
   * Update participant stake (affects future distributions)
   */
  updateParticipantStake(address, newStake) {
    const participant = this.participants.get(address);
    if (!participant) {
      throw new Error('Participant not found');
    }

    const oldStake = participant.stake;
    participant.stake = newStake;
    participant.eligibility = this.checkEligibility({
      stake: newStake,
      reputation: participant.reputation,
      kyc: participant.kycCompleted
    });

    console.log(`Updated stake for ${address}: ${oldStake} -> ${newStake}`);
    return participant;
  }

  /**
   * Update participant reputation
   */
  updateParticipantReputation(address, newReputation) {
    const participant = this.participants.get(address);
    if (!participant) {
      throw new Error('Participant not found');
    }

    const oldReputation = participant.reputation;
    participant.reputation = Math.max(0, Math.min(100, newReputation));
    participant.eligibility = this.checkEligibility({
      stake: participant.stake,
      reputation: participant.reputation,
      kyc: participant.kycCompleted
    });

    console.log(`Updated reputation for ${address}: ${oldReputation} -> ${participant.reputation}`);
    return participant;
  }

  /**
   * Get distribution statistics
   */
  getDistributionStats() {
    const recentDistributions = this.distributionHistory.slice(-10);
    const totalParticipants = this.participants.size;
    const eligibleParticipants = this.getEligibleParticipants().length;
    
    return {
      ...this.metrics,
      totalParticipants,
      eligibleParticipants,
      participationRate: totalParticipants > 0 ? eligibleParticipants / totalParticipants : 0,
      pools: { ...this.pools },
      distributionSchedule: { ...this.distributionSchedule },
      recentDistributions: recentDistributions.map(d => ({
        id: d.id,
        timestamp: d.timestamp,
        totalAmount: d.totalAmount,
        participantCount: d.participantCount
      })),
      nextDistributionEstimate: {
        timeToNext: Math.max(0, this.distributionSchedule.nextDistribution - Date.now()),
        estimatedAmount: this.pools.universalIncome,
        estimatedParticipants: eligibleParticipants
      }
    };
  }

  /**
   * Get top recipients
   */
  getTopRecipients(limit = 10) {
    return Array.from(this.participants.values())
      .sort((a, b) => b.totalReceived - a.totalReceived)
      .slice(0, limit)
      .map(participant => ({
        address: participant.address,
        totalReceived: participant.totalReceived,
        distributionsReceived: participant.distributionsReceived,
        averagePayment: participant.distributionsReceived > 0 
          ? participant.totalReceived / participant.distributionsReceived 
          : 0,
        stake: participant.stake,
        reputation: participant.reputation
      }));
  }

  /**
   * Get distribution history
   */
  getDistributionHistory(limit = 20) {
    return this.distributionHistory.slice(-limit);
  }

  /**
   * Force distribution (admin function)
   */
  forceDistribution() {
    if (this.pools.universalIncome <= 0) {
      throw new Error('No funds available for distribution');
    }

    return this.distributeUniversalIncome();
  }

  /**
   * Update distribution rules
   */
  updateDistributionRules(newRules) {
    const totalPercentage = Object.values(newRules).reduce((sum, val) => sum + val, 0);
    
    if (Math.abs(totalPercentage - 1.0) > 0.001) {
      throw new Error('Distribution rules must sum to 100%');
    }

    this.distributionRules = { ...newRules };
    console.log('Distribution rules updated:', this.distributionRules);
  }

  /**
   * Update participant requirements
   */
  updateParticipantRequirements(newRequirements) {
    this.participantRequirements = { ...this.participantRequirements, ...newRequirements };
    
    // Re-evaluate all participants
    for (const participant of this.participants.values()) {
      participant.eligibility = this.checkEligibility({
        stake: participant.stake,
        reputation: participant.reputation,
        kyc: participant.kycCompleted
      });
    }

    console.log('Participant requirements updated:', this.participantRequirements);
  }

  /**
   * Update metrics
   */
  updateMetrics() {
    this.metrics.totalParticipants = this.participants.size;
    this.metrics.participationRate = this.participants.size > 0 
      ? this.getEligibleParticipants().length / this.participants.size 
      : 0;
  }

  /**
   * Helper methods
   */
  generateDistributionId() {
    return `dist_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  generateTransactionId() {
    return `tx_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Export system data
   */
  export() {
    return {
      participants: Array.from(this.participants.entries()),
      distributionHistory: this.distributionHistory,
      distributionRules: this.distributionRules,
      pools: this.pools,
      distributionSchedule: this.distributionSchedule,
      participantRequirements: this.participantRequirements,
      metrics: this.metrics
    };
  }

  /**
   * Import system data
   */
  import(data) {
    this.participants = new Map(data.participants);
    this.distributionHistory = data.distributionHistory;
    this.distributionRules = data.distributionRules;
    this.pools = data.pools;
    this.distributionSchedule = data.distributionSchedule;
    this.participantRequirements = data.participantRequirements;
    this.metrics = data.metrics;
  }
}