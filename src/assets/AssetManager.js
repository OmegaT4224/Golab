/**
 * Asset Management System
 * Tracks and manages digital assets including ERC20, NFT, contracts, and quantum systems
 * Includes asset valuation capabilities
 */

class Asset {
    constructor(id, type, name, symbol, owner, metadata = {}) {
        this.id = id;
        this.type = type; // 'ERC20', 'NFT', 'CONTRACT', 'QUANTUM'
        this.name = name;
        this.symbol = symbol;
        this.owner = owner;
        this.metadata = {
            ...metadata,
            createdAt: Date.now(),
            lastUpdated: Date.now()
        };
        this.value = 0;
        this.supply = 0;
        this.transferHistory = [];
    }

    updateValue(newValue) {
        this.value = newValue;
        this.metadata.lastUpdated = Date.now();
    }

    addTransfer(from, to, amount, timestamp = Date.now()) {
        this.transferHistory.push({
            from,
            to,
            amount,
            timestamp,
            transactionId: this.generateTransferId()
        });
        this.metadata.lastUpdated = timestamp;
    }

    generateTransferId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

class ERC20Asset extends Asset {
    constructor(id, name, symbol, owner, totalSupply, decimals = 18) {
        super(id, 'ERC20', name, symbol, owner, { decimals, totalSupply });
        this.supply = totalSupply;
        this.decimals = decimals;
        this.balances = new Map();
        this.balances.set(owner, totalSupply);
    }

    transfer(from, to, amount) {
        if (!this.balances.has(from) || this.balances.get(from) < amount) {
            throw new Error('Insufficient balance');
        }

        const fromBalance = this.balances.get(from);
        const toBalance = this.balances.get(to) || 0;

        this.balances.set(from, fromBalance - amount);
        this.balances.set(to, toBalance + amount);

        this.addTransfer(from, to, amount);
        return true;
    }

    balanceOf(address) {
        return this.balances.get(address) || 0;
    }

    mint(to, amount) {
        const currentBalance = this.balances.get(to) || 0;
        this.balances.set(to, currentBalance + amount);
        this.supply += amount;
        this.addTransfer('MINT', to, amount);
    }

    burn(from, amount) {
        if (!this.balances.has(from) || this.balances.get(from) < amount) {
            throw new Error('Insufficient balance to burn');
        }

        const currentBalance = this.balances.get(from);
        this.balances.set(from, currentBalance - amount);
        this.supply -= amount;
        this.addTransfer(from, 'BURN', amount);
    }
}

class NFTAsset extends Asset {
    constructor(id, name, symbol, owner, tokenURI, attributes = {}) {
        super(id, 'NFT', name, symbol, owner, { tokenURI, attributes });
        this.tokenURI = tokenURI;
        this.attributes = attributes;
        this.supply = 1; // NFTs are unique
    }

    transfer(from, to) {
        if (this.owner !== from) {
            throw new Error('Only owner can transfer NFT');
        }

        this.owner = to;
        this.addTransfer(from, to, 1);
        return true;
    }

    updateMetadata(newAttributes) {
        this.attributes = { ...this.attributes, ...newAttributes };
        this.metadata.lastUpdated = Date.now();
    }
}

class ContractAsset extends Asset {
    constructor(id, name, owner, code, abi = []) {
        super(id, 'CONTRACT', name, name, owner, { code, abi });
        this.code = code;
        this.abi = abi;
        this.state = new Map();
        this.functions = new Map();
        this.events = [];
    }

    executeFunction(functionName, params, caller) {
        if (!this.functions.has(functionName)) {
            throw new Error(`Function ${functionName} not found`);
        }

        const func = this.functions.get(functionName);
        try {
            const result = func.call(this, params, caller);
            this.events.push({
                type: 'FunctionCall',
                function: functionName,
                caller,
                params,
                result,
                timestamp: Date.now()
            });
            return result;
        } catch (error) {
            throw new Error(`Function execution failed: ${error.message}`);
        }
    }

    setState(key, value) {
        this.state.set(key, value);
        this.metadata.lastUpdated = Date.now();
    }

    getState(key) {
        return this.state.get(key);
    }
}

class QuantumAsset extends Asset {
    constructor(id, name, owner, quantumProcessor, circuitConfig) {
        super(id, 'QUANTUM', name, name, owner, { circuitConfig });
        this.quantumProcessor = quantumProcessor;
        this.circuitConfig = circuitConfig;
        this.quantumState = null;
        this.entanglementPartners = new Set();
    }

    executeQuantumCircuit() {
        this.quantumProcessor.reset();
        
        // Apply circuit configuration
        this.circuitConfig.gates.forEach(gate => {
            switch (gate.type) {
                case 'H':
                    this.quantumProcessor.applyHadamard(gate.qubit);
                    break;
                case 'Z':
                    this.quantumProcessor.applyZ(gate.qubit);
                    break;
                case 'CNOT':
                    this.quantumProcessor.applyCNOT(gate.control, gate.target);
                    break;
            }
        });

        this.quantumState = this.quantumProcessor.getStateInfo();
        this.metadata.lastUpdated = Date.now();
        return this.quantumState;
    }

    entangleWith(otherQuantumAsset) {
        this.entanglementPartners.add(otherQuantumAsset.id);
        otherQuantumAsset.entanglementPartners.add(this.id);
    }
}

class AssetManager {
    constructor(blockchainCore, quantumProcessor) {
        this.assets = new Map();
        this.blockchainCore = blockchainCore;
        this.quantumProcessor = quantumProcessor;
        this.debugSystem = null;
        this.valuationEngine = new AssetValuationEngine();
        this.assetRegistry = new Map();
        this.portfolios = new Map();
    }

    createERC20Asset(name, symbol, owner, totalSupply, decimals = 18) {
        const id = this.generateAssetId();
        const asset = new ERC20Asset(id, name, symbol, owner, totalSupply, decimals);
        this.assets.set(id, asset);
        this.assetRegistry.set(symbol, id);
        
        this.log(`ERC20 asset created: ${name} (${symbol})`);
        return asset;
    }

    createNFTAsset(name, symbol, owner, tokenURI, attributes = {}) {
        const id = this.generateAssetId();
        const asset = new NFTAsset(id, name, symbol, owner, tokenURI, attributes);
        this.assets.set(id, asset);
        
        this.log(`NFT asset created: ${name}`);
        return asset;
    }

    createContractAsset(name, owner, code, abi = []) {
        const id = this.generateAssetId();
        const asset = new ContractAsset(id, name, owner, code, abi);
        this.assets.set(id, asset);
        
        this.log(`Contract asset created: ${name}`);
        return asset;
    }

    createQuantumAsset(name, owner, circuitConfig) {
        const id = this.generateAssetId();
        const asset = new QuantumAsset(id, name, owner, this.quantumProcessor, circuitConfig);
        this.assets.set(id, asset);
        
        this.log(`Quantum asset created: ${name}`);
        return asset;
    }

    getAsset(id) {
        return this.assets.get(id);
    }

    getAssetBySymbol(symbol) {
        const id = this.assetRegistry.get(symbol);
        return id ? this.assets.get(id) : null;
    }

    transferAsset(assetId, from, to, amount = 1) {
        const asset = this.assets.get(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }

        let success = false;
        
        switch (asset.type) {
            case 'ERC20':
                success = asset.transfer(from, to, amount);
                break;
            case 'NFT':
                success = asset.transfer(from, to);
                break;
            default:
                throw new Error('Asset type not transferable');
        }

        if (success && this.blockchainCore) {
            const transaction = this.blockchainCore.createAssetTransaction(
                from, to, assetId, amount, asset.type
            );
            transaction.signTransaction(this.quantumProcessor);
            this.blockchainCore.addTransaction(transaction);
        }

        this.log(`Asset transferred: ${assetId} from ${from} to ${to}`);
        return success;
    }

    getPortfolio(address) {
        if (!this.portfolios.has(address)) {
            this.portfolios.set(address, new Portfolio(address));
        }

        const portfolio = this.portfolios.get(address);
        portfolio.updateAssets(this.getAssetsOwnedBy(address));
        portfolio.updateValue(this.valuationEngine);

        return portfolio;
    }

    getAssetsOwnedBy(address) {
        const ownedAssets = [];
        
        for (const [id, asset] of this.assets) {
            if (asset.owner === address) {
                ownedAssets.push(asset);
            } else if (asset.type === 'ERC20' && asset.balanceOf(address) > 0) {
                ownedAssets.push({
                    ...asset,
                    balance: asset.balanceOf(address)
                });
            }
        }

        return ownedAssets;
    }

    valuateAsset(assetId) {
        const asset = this.assets.get(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }

        const valuation = this.valuationEngine.valuate(asset);
        asset.updateValue(valuation.totalValue);
        
        return valuation;
    }

    getAllAssets() {
        return Array.from(this.assets.values());
    }

    getAssetStats() {
        const stats = {
            totalAssets: this.assets.size,
            assetTypes: {},
            totalValue: 0
        };

        for (const asset of this.assets.values()) {
            stats.assetTypes[asset.type] = (stats.assetTypes[asset.type] || 0) + 1;
            stats.totalValue += asset.value;
        }

        return stats;
    }

    generateAssetId() {
        return 'asset_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    setDebugSystem(debugSystem) {
        this.debugSystem = debugSystem;
    }

    log(message) {
        if (this.debugSystem) {
            this.debugSystem.log('AssetManager', message);
        }
        console.log(`[AssetManager] ${message}`);
    }
}

class Portfolio {
    constructor(address) {
        this.address = address;
        this.assets = [];
        this.totalValue = 0;
        this.lastUpdated = Date.now();
    }

    updateAssets(assets) {
        this.assets = assets;
        this.lastUpdated = Date.now();
    }

    updateValue(valuationEngine) {
        this.totalValue = this.assets.reduce((total, asset) => {
            const valuation = valuationEngine.valuate(asset);
            return total + valuation.totalValue;
        }, 0);
    }

    getAssetsByType(type) {
        return this.assets.filter(asset => asset.type === type);
    }
}

class AssetValuationEngine {
    constructor() {
        this.pricingModels = new Map();
        this.setupDefaultModels();
    }

    setupDefaultModels() {
        // ERC20 valuation model
        this.pricingModels.set('ERC20', (asset) => {
            const baseValue = asset.supply * 0.001; // Simple supply-based pricing
            const demandMultiplier = asset.transferHistory.length * 0.1;
            return Math.max(baseValue + demandMultiplier, 0.001);
        });

        // NFT valuation model
        this.pricingModels.set('NFT', (asset) => {
            const rarityScore = this.calculateRarityScore(asset.attributes);
            const ageBonus = (Date.now() - asset.metadata.createdAt) / (1000 * 60 * 60 * 24) * 0.01;
            return Math.max(rarityScore + ageBonus, 0.1);
        });

        // Contract valuation model
        this.pricingModels.set('CONTRACT', (asset) => {
            const complexityScore = asset.code.length * 0.0001;
            const usageScore = asset.events.length * 0.01;
            return Math.max(complexityScore + usageScore, 0.05);
        });

        // Quantum asset valuation model
        this.pricingModels.set('QUANTUM', (asset) => {
            const entanglementValue = asset.entanglementPartners.size * 10;
            const circuitComplexity = asset.circuitConfig.gates.length * 0.5;
            return Math.max(entanglementValue + circuitComplexity, 1);
        });
    }

    valuate(asset) {
        const model = this.pricingModels.get(asset.type);
        if (!model) {
            return { totalValue: 0, breakdown: {} };
        }

        const baseValue = model(asset);
        const marketMultiplier = this.getMarketMultiplier(asset);
        const totalValue = baseValue * marketMultiplier;

        return {
            totalValue,
            breakdown: {
                baseValue,
                marketMultiplier,
                assetType: asset.type
            }
        };
    }

    getMarketMultiplier(asset) {
        // Simplified market conditions
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const popularityFactor = Math.min(asset.transferHistory.length * 0.01 + 1, 2);
        return randomFactor * popularityFactor;
    }

    calculateRarityScore(attributes) {
        let score = 1;
        for (const [key, value] of Object.entries(attributes)) {
            if (typeof value === 'string' && value.toLowerCase().includes('rare')) {
                score *= 2;
            }
            if (typeof value === 'number' && value > 90) {
                score *= 1.5;
            }
        }
        return score;
    }
}

// Export classes for use in other modules
window.AssetManager = AssetManager;
window.Asset = Asset;
window.ERC20Asset = ERC20Asset;
window.NFTAsset = NFTAsset;
window.ContractAsset = ContractAsset;
window.QuantumAsset = QuantumAsset;
window.Portfolio = Portfolio;
window.AssetValuationEngine = AssetValuationEngine;