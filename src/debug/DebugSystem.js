/**
 * Debug System Implementation
 * Comprehensive debug functionality with logging, transaction tracking, 
 * quantum circuit debugging, and reporting capabilities
 */

class DebugSystem {
    constructor() {
        this.logs = [];
        this.maxLogEntries = 1000;
        this.logLevels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3,
            TRACE: 4
        };
        this.currentLogLevel = this.logLevels.INFO;
        this.modules = new Map();
        this.metrics = new Map();
        this.startTime = Date.now();
        this.reportingEnabled = true;
        this.autoReportInterval = 30000; // 30 seconds
        this.setupAutoReporting();
    }

    /**
     * Log a message with specified level and module
     */
    log(module, message, level = 'INFO', data = null) {
        const logLevel = this.logLevels[level] || this.logLevels.INFO;
        
        if (logLevel > this.currentLogLevel) {
            return; // Skip logging if level is too verbose
        }

        const logEntry = {
            timestamp: Date.now(),
            module: module,
            level: level,
            message: message,
            data: data,
            id: this.generateLogId()
        };

        this.logs.push(logEntry);
        
        // Maintain log size limit
        if (this.logs.length > this.maxLogEntries) {
            this.logs.shift();
        }

        // Update module statistics
        this.updateModuleStats(module, level);
        
        // Display in UI if available
        this.displayLog(logEntry);
        
        // Console output with color coding
        this.consoleLog(logEntry);
        
        return logEntry.id;
    }

    /**
     * Log error messages
     */
    error(module, message, data = null) {
        return this.log(module, message, 'ERROR', data);
    }

    /**
     * Log warning messages
     */
    warn(module, message, data = null) {
        return this.log(module, message, 'WARN', data);
    }

    /**
     * Log info messages
     */
    info(module, message, data = null) {
        return this.log(module, message, 'INFO', data);
    }

    /**
     * Log debug messages
     */
    debug(module, message, data = null) {
        return this.log(module, message, 'DEBUG', data);
    }

    /**
     * Log trace messages
     */
    trace(module, message, data = null) {
        return this.log(module, message, 'TRACE', data);
    }

    /**
     * Track quantum circuit operations
     */
    trackQuantumOperation(operation, qubit, result = null) {
        const operationData = {
            operation: operation,
            qubit: qubit,
            result: result,
            circuitState: result ? result.amplitudes : null,
            entangled: result ? result.entangled : false
        };

        this.log('QuantumTracker', `Quantum operation: ${operation} on qubit ${qubit}`, 'DEBUG', operationData);
        
        // Update quantum metrics
        this.updateMetric('quantum_operations_total', 1);
        this.updateMetric(`quantum_${operation.toLowerCase()}_operations`, 1);
        
        if (operationData.entangled) {
            this.updateMetric('quantum_entanglement_events', 1);
        }
    }

    /**
     * Track blockchain transactions
     */
    trackTransaction(transaction, blockIndex = null, status = 'pending') {
        const transactionData = {
            id: transaction.id,
            from: transaction.fromAddress,
            to: transaction.toAddress,
            amount: transaction.amount,
            assetType: transaction.assetType || 'currency',
            blockIndex: blockIndex,
            status: status,
            quantumSigned: !!transaction.quantumSignature
        };

        this.log('TransactionTracker', `Transaction ${status}: ${transaction.id}`, 'INFO', transactionData);
        
        // Update transaction metrics
        this.updateMetric('transactions_total', 1);
        this.updateMetric(`transactions_${status}`, 1);
        
        if (transactionData.quantumSigned) {
            this.updateMetric('quantum_signed_transactions', 1);
        }
    }

    /**
     * Track block mining
     */
    trackBlockMining(block, miningTime, hashRate) {
        const blockData = {
            index: block.index,
            hash: block.hash,
            previousHash: block.previousHash,
            transactions: Array.isArray(block.data) ? block.data.length : 0,
            miningTime: miningTime,
            hashRate: hashRate,
            nonce: block.nonce,
            quantumSigned: !!block.quantumSignature
        };

        this.log('BlockMiningTracker', `Block mined: ${block.index} (${miningTime}ms)`, 'INFO', blockData);
        
        // Update mining metrics
        this.updateMetric('blocks_mined', 1);
        this.updateMetric('total_mining_time', miningTime);
        this.setMetric('last_hash_rate', hashRate);
        this.setMetric('current_difficulty', block.difficulty || 2);
    }

    /**
     * Track asset operations
     */
    trackAssetOperation(operation, asset, details = {}) {
        const assetData = {
            operation: operation,
            assetId: asset.id,
            assetType: asset.type,
            assetName: asset.name,
            owner: asset.owner,
            value: asset.value,
            ...details
        };

        this.log('AssetTracker', `Asset ${operation}: ${asset.name} (${asset.type})`, 'INFO', assetData);
        
        // Update asset metrics
        this.updateMetric('asset_operations_total', 1);
        this.updateMetric(`asset_${operation.toLowerCase()}_operations`, 1);
        this.updateMetric(`${asset.type.toLowerCase()}_assets_active`, 1);
    }

    /**
     * Update or increment a metric
     */
    updateMetric(key, value) {
        const current = this.metrics.get(key) || 0;
        this.metrics.set(key, current + value);
    }

    /**
     * Set a metric to a specific value
     */
    setMetric(key, value) {
        this.metrics.set(key, value);
    }

    /**
     * Get a metric value
     */
    getMetric(key) {
        return this.metrics.get(key) || 0;
    }

    /**
     * Get all metrics
     */
    getAllMetrics() {
        return Object.fromEntries(this.metrics);
    }

    /**
     * Get system performance report
     */
    getPerformanceReport() {
        const uptime = Date.now() - this.startTime;
        const totalLogs = this.logs.length;
        const errorLogs = this.logs.filter(log => log.level === 'ERROR').length;
        const warningLogs = this.logs.filter(log => log.level === 'WARN').length;
        
        return {
            uptime: uptime,
            totalLogs: totalLogs,
            errorLogs: errorLogs,
            warningLogs: warningLogs,
            errorRate: totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0,
            memoryUsage: this.estimateMemoryUsage(),
            metrics: this.getAllMetrics(),
            moduleStats: Object.fromEntries(this.modules)
        };
    }

    /**
     * Generate diagnostic report
     */
    generateDiagnosticReport() {
        const performance = this.getPerformanceReport();
        const recentErrors = this.getRecentLogs('ERROR', 10);
        const systemHealth = this.assessSystemHealth();
        
        const report = {
            timestamp: Date.now(),
            systemHealth: systemHealth,
            performance: performance,
            recentErrors: recentErrors,
            recommendations: this.generateRecommendations(systemHealth, performance)
        };
        
        this.log('DiagnosticSystem', 'Diagnostic report generated', 'INFO', report);
        return report;
    }

    /**
     * Assess overall system health
     */
    assessSystemHealth() {
        const performance = this.getPerformanceReport();
        const health = {
            status: 'HEALTHY',
            score: 100,
            issues: []
        };

        // Check error rate
        if (performance.errorRate > 10) {
            health.issues.push('High error rate detected');
            health.score -= 30;
        }

        // Check quantum operations
        const quantumOps = this.getMetric('quantum_operations_total');
        if (quantumOps === 0) {
            health.issues.push('No quantum operations detected');
            health.score -= 20;
        }

        // Check blockchain activity
        const blocks = this.getMetric('blocks_mined');
        if (blocks === 0) {
            health.issues.push('No blocks mined');
            health.score -= 15;
        }

        // Determine overall status
        if (health.score < 50) {
            health.status = 'CRITICAL';
        } else if (health.score < 75) {
            health.status = 'WARNING';
        }

        return health;
    }

    /**
     * Generate system recommendations
     */
    generateRecommendations(health, performance) {
        const recommendations = [];

        if (health.score < 75) {
            recommendations.push('System health is below optimal. Review recent errors.');
        }

        if (performance.errorRate > 5) {
            recommendations.push('High error rate detected. Check system configuration.');
        }

        const hashRate = this.getMetric('last_hash_rate');
        if (hashRate < 100) {
            recommendations.push('Low hash rate detected. Consider optimizing mining operations.');
        }

        const quantumEntanglement = this.getMetric('quantum_entanglement_events');
        if (quantumEntanglement === 0) {
            recommendations.push('No quantum entanglement detected. Verify quantum circuit configuration.');
        }

        return recommendations;
    }

    /**
     * Get recent logs filtered by level
     */
    getRecentLogs(level = null, limit = 50) {
        let filteredLogs = this.logs;
        
        if (level) {
            filteredLogs = this.logs.filter(log => log.level === level);
        }
        
        return filteredLogs
            .slice(-limit)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Search logs by keyword
     */
    searchLogs(keyword, limit = 100) {
        const results = this.logs.filter(log => 
            log.message.toLowerCase().includes(keyword.toLowerCase()) ||
            log.module.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return results.slice(-limit);
    }

    /**
     * Export logs to JSON
     */
    exportLogs() {
        return JSON.stringify({
            exportTime: Date.now(),
            totalLogs: this.logs.length,
            logs: this.logs,
            metrics: this.getAllMetrics(),
            performance: this.getPerformanceReport()
        }, null, 2);
    }

    /**
     * Clear all logs
     */
    clearLogs() {
        const clearedCount = this.logs.length;
        this.logs = [];
        this.log('DebugSystem', `Cleared ${clearedCount} log entries`, 'INFO');
    }

    /**
     * Set logging level
     */
    setLogLevel(level) {
        if (this.logLevels.hasOwnProperty(level)) {
            this.currentLogLevel = this.logLevels[level];
            this.log('DebugSystem', `Log level set to ${level}`, 'INFO');
        }
    }

    /**
     * Helper methods
     */
    generateLogId() {
        return Math.random().toString(36).substr(2, 9);
    }

    updateModuleStats(module, level) {
        if (!this.modules.has(module)) {
            this.modules.set(module, {
                totalLogs: 0,
                errors: 0,
                warnings: 0,
                lastActivity: Date.now()
            });
        }

        const stats = this.modules.get(module);
        stats.totalLogs++;
        stats.lastActivity = Date.now();
        
        if (level === 'ERROR') stats.errors++;
        if (level === 'WARN') stats.warnings++;
    }

    displayLog(logEntry) {
        const debugElement = document.getElementById('debug-log');
        if (debugElement) {
            const logDiv = document.createElement('div');
            logDiv.className = `debug-entry debug-${logEntry.level.toLowerCase()}`;
            logDiv.innerHTML = `
                <span class="debug-time">${new Date(logEntry.timestamp).toLocaleTimeString()}</span>
                <span class="debug-module">[${logEntry.module}]</span>
                <span class="debug-message">${logEntry.message}</span>
            `;
            
            debugElement.appendChild(logDiv);
            
            // Keep only recent entries in UI
            while (debugElement.children.length > 50) {
                debugElement.removeChild(debugElement.firstChild);
            }
            
            // Auto-scroll to bottom
            debugElement.scrollTop = debugElement.scrollHeight;
        }
    }

    consoleLog(logEntry) {
        const colors = {
            ERROR: '\x1b[31m', // Red
            WARN: '\x1b[33m',  // Yellow
            INFO: '\x1b[36m',  // Cyan
            DEBUG: '\x1b[37m', // White
            TRACE: '\x1b[90m'  // Gray
        };
        
        const color = colors[logEntry.level] || colors.INFO;
        const reset = '\x1b[0m';
        
        console.log(
            `${color}[${new Date(logEntry.timestamp).toLocaleTimeString()}] [${logEntry.module}] ${logEntry.message}${reset}`
        );
    }

    estimateMemoryUsage() {
        // Rough estimation of memory usage
        const logSize = this.logs.length * 200; // ~200 bytes per log entry
        const metricSize = this.metrics.size * 50; // ~50 bytes per metric
        return {
            logs: logSize,
            metrics: metricSize,
            total: logSize + metricSize
        };
    }

    setupAutoReporting() {
        if (this.reportingEnabled) {
            setInterval(() => {
                const report = this.generateDiagnosticReport();
                this.log('AutoReporting', 'Automatic diagnostic report generated', 'DEBUG', {
                    reportSize: JSON.stringify(report).length
                });
            }, this.autoReportInterval);
        }
    }
}

// Export for use in other modules
window.DebugSystem = DebugSystem;