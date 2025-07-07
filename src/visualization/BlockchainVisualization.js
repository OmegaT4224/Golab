import * as THREE from 'three';

/**
 * 3D Blockchain Visualization using Three.js
 */
export class BlockchainVisualization {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.controls = null;
    this.animationId = null;
    
    // Visualization objects
    this.blockchainGroup = new THREE.Group();
    this.validatorGroup = new THREE.Group();
    this.botGroup = new THREE.Group();
    this.connectionGroup = new THREE.Group();
    
    // Data objects
    this.blocks = [];
    this.validators = [];
    this.bots = [];
    this.connections = [];
    
    // Animation states
    this.animationTime = 0;
    this.rotationSpeed = 0.005;
    
    this.init();
  }

  /**
   * Initialize the 3D scene
   */
  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x0a0a0a, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Setup camera
    this.camera.position.set(50, 50, 50);
    this.camera.lookAt(0, 0, 0);

    // Add orbit controls
    this.setupControls();
    
    // Setup lighting
    this.setupLighting();
    
    // Add groups to scene
    this.scene.add(this.blockchainGroup);
    this.scene.add(this.validatorGroup);
    this.scene.add(this.botGroup);
    this.scene.add(this.connectionGroup);
    
    // Add background
    this.createBackground();
    
    // Start animation
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Setup orbit controls
   */
  async setupControls() {
    try {
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.rotateSpeed = 0.5;
      this.controls.zoomSpeed = 1.2;
      this.controls.panSpeed = 0.8;
      this.controls.maxDistance = 200;
      this.controls.minDistance = 10;
    } catch (error) {
      console.warn('Could not load OrbitControls:', error);
    }
  }

  /**
   * Setup lighting for the scene
   */
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);

    // Add some colored accent lights
    const light1 = new THREE.PointLight(0x00ff88, 0.5, 100);
    light1.position.set(20, 20, 20);
    this.scene.add(light1);

    const light2 = new THREE.PointLight(0xff4444, 0.5, 100);
    light2.position.set(-20, 20, -20);
    this.scene.add(light2);

    const light3 = new THREE.PointLight(0x4488ff, 0.5, 100);
    light3.position.set(0, -20, 20);
    this.scene.add(light3);
  }

  /**
   * Create animated background
   */
  createBackground() {
    // Create particle system for background
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 400;     // x
      positions[i + 1] = (Math.random() - 0.5) * 400; // y
      positions[i + 2] = (Math.random() - 0.5) * 400; // z
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 2,
      transparent: true,
      opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    this.scene.add(particleSystem);
  }

  /**
   * Visualize blockchain blocks
   */
  visualizeBlockchain(blockchain) {
    // Clear existing blocks
    this.clearGroup(this.blockchainGroup);
    this.blocks = [];

    const blocks = blockchain.getRecentBlocks(20); // Show last 20 blocks
    
    blocks.forEach((block, index) => {
      const blockMesh = this.createBlockMesh(block, index);
      this.blockchainGroup.add(blockMesh);
      this.blocks.push({
        mesh: blockMesh,
        data: block,
        index
      });
    });

    // Create connections between blocks
    this.createBlockConnections();
  }

  /**
   * Create 3D mesh for a blockchain block
   */
  createBlockMesh(block, index) {
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    
    // Color based on block properties
    let color = 0x00ff88; // Default green
    if (block.hasQuantumProof) color = 0x8800ff; // Purple for quantum
    if (block.validator) color = 0xff8800; // Orange for AI validated
    
    const material = new THREE.MeshPhongMaterial({ 
      color,
      transparent: true,
      opacity: 0.8
    });
    
    const blockMesh = new THREE.Mesh(geometry, material);
    
    // Position blocks in a chain
    blockMesh.position.x = index * 6;
    blockMesh.position.y = Math.sin(index * 0.5) * 2; // Slight wave
    blockMesh.position.z = 0;
    
    // Add glow effect
    const glowGeometry = new THREE.BoxGeometry(3.2, 3.2, 3.2);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    blockMesh.add(glow);
    
    // Add block info
    blockMesh.userData = {
      blockData: block,
      type: 'block',
      index
    };
    
    blockMesh.castShadow = true;
    blockMesh.receiveShadow = true;
    
    return blockMesh;
  }

  /**
   * Create connections between blockchain blocks
   */
  createBlockConnections() {
    for (let i = 0; i < this.blocks.length - 1; i++) {
      const start = this.blocks[i].mesh.position;
      const end = this.blocks[i + 1].mesh.position;
      
      const connection = this.createConnection(start, end, 0x00ffff, 0.2);
      this.connectionGroup.add(connection);
    }
  }

  /**
   * Visualize AI validator network
   */
  visualizeValidators(validatorNetwork) {
    // Clear existing validators
    this.clearGroup(this.validatorGroup);
    this.validators = [];

    const validators = validatorNetwork.getAllValidators().slice(0, 15); // Show up to 15 validators
    
    validators.forEach((validator, index) => {
      const validatorMesh = this.createValidatorMesh(validator, index);
      this.validatorGroup.add(validatorMesh);
      this.validators.push({
        mesh: validatorMesh,
        data: validator,
        index
      });
    });

    // Create connections between validators
    this.createValidatorConnections();
  }

  /**
   * Create 3D mesh for an AI validator
   */
  createValidatorMesh(validator, index) {
    // Different geometries based on specialization
    let geometry;
    switch (validator.specialization) {
      case 'smart_contract':
        geometry = new THREE.OctahedronGeometry(2);
        break;
      case 'high_frequency':
        geometry = new THREE.TetrahedronGeometry(2);
        break;
      case 'security':
        geometry = new THREE.IcosahedronGeometry(2);
        break;
      case 'defi':
        geometry = new THREE.DodecahedronGeometry(2);
        break;
      default:
        geometry = new THREE.SphereGeometry(2, 16, 16);
    }

    // Color based on performance
    const efficiency = validator.efficiency;
    const hue = Math.min(0.33, efficiency * 0.33); // Green to yellow based on efficiency
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6);

    const material = new THREE.MeshPhongMaterial({ 
      color,
      transparent: true,
      opacity: validator.active ? 0.9 : 0.5
    });
    
    const validatorMesh = new THREE.Mesh(geometry, material);
    
    // Position validators in a circle around the blockchain
    const radius = 25;
    const angle = (index / 15) * Math.PI * 2;
    validatorMesh.position.x = Math.cos(angle) * radius;
    validatorMesh.position.y = Math.sin(angle) * radius;
    validatorMesh.position.z = 10 + Math.sin(index) * 5;
    
    // Add floating animation
    validatorMesh.userData = {
      validatorData: validator,
      type: 'validator',
      index,
      originalY: validatorMesh.position.y,
      floatOffset: index * 0.5
    };
    
    // Add reputation indicator
    if (validator.reputation > 80) {
      const ringGeometry = new THREE.RingGeometry(2.5, 3, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00, 
        transparent: true, 
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      validatorMesh.add(ring);
    }
    
    validatorMesh.castShadow = true;
    validatorMesh.receiveShadow = true;
    
    return validatorMesh;
  }

  /**
   * Create connections between validators
   */
  createValidatorConnections() {
    // Connect validators based on their relationships
    for (let i = 0; i < this.validators.length; i++) {
      for (let j = i + 1; j < this.validators.length; j++) {
        const validator1 = this.validators[i];
        const validator2 = this.validators[j];
        
        // Connect if they have similar specializations or parent-child relationships
        if (this.shouldConnectValidators(validator1.data, validator2.data)) {
          const connection = this.createConnection(
            validator1.mesh.position,
            validator2.mesh.position,
            0xff00ff,
            0.1
          );
          this.connectionGroup.add(connection);
        }
      }
    }
  }

  /**
   * Check if two validators should be connected
   */
  shouldConnectValidators(validator1, validator2) {
    // Connect if same specialization
    if (validator1.specialization === validator2.specialization) return true;
    
    // Connect if parent-child relationship
    if (validator1.parent === validator2.id || validator2.parent === validator1.id) return true;
    
    // Connect high-reputation validators
    if (validator1.reputation > 90 && validator2.reputation > 90) return true;
    
    return false;
  }

  /**
   * Visualize bot business ecosystem
   */
  visualizeBots(botEcosystem) {
    // Clear existing bots
    this.clearGroup(this.botGroup);
    this.bots = [];

    const bots = botEcosystem.getAllBots().slice(0, 20); // Show up to 20 bots
    
    bots.forEach((bot, index) => {
      const botMesh = this.createBotMesh(bot, index);
      this.botGroup.add(botMesh);
      this.bots.push({
        mesh: botMesh,
        data: bot,
        index
      });
    });

    // Create bot activity connections
    this.createBotConnections();
  }

  /**
   * Create 3D mesh for a bot
   */
  createBotMesh(bot, index) {
    let geometry;
    let color;
    
    // Different shapes and colors based on bot type
    switch (bot.type) {
      case 'arbitrage':
        geometry = new THREE.ConeGeometry(1.5, 4, 6);
        color = 0x00ff00; // Green for arbitrage
        break;
      case 'nft_market_maker':
        geometry = new THREE.CylinderGeometry(1, 2, 3, 8);
        color = 0xff0088; // Pink for NFT
        break;
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2);
        color = 0x0088ff; // Blue for generic
    }

    // Adjust opacity based on activity and profit
    const profitRatio = Math.max(0.2, Math.min(1, bot.totalProfit / 1000));
    const material = new THREE.MeshPhongMaterial({ 
      color,
      transparent: true,
      opacity: bot.active ? profitRatio : 0.3
    });
    
    const botMesh = new THREE.Mesh(geometry, material);
    
    // Position bots in a different layer
    const radius = 35;
    const angle = (index / 20) * Math.PI * 2;
    botMesh.position.x = Math.cos(angle) * radius;
    botMesh.position.y = Math.sin(angle) * radius;
    botMesh.position.z = -15 + Math.cos(index) * 3;
    
    // Add rotation based on activity
    botMesh.userData = {
      botData: bot,
      type: 'bot',
      index,
      rotationSpeed: bot.active ? 0.02 : 0.005
    };
    
    // Add profit indicator
    if (bot.totalProfit > 500) {
      const particles = this.createProfitParticles();
      botMesh.add(particles);
    }
    
    // Add credit indicator if using credit
    if (bot.creditUsed > 0) {
      const creditIndicator = new THREE.Mesh(
        new THREE.TorusGeometry(2.5, 0.2, 8, 16),
        new THREE.MeshBasicMaterial({ 
          color: 0xffaa00, 
          transparent: true, 
          opacity: 0.7 
        })
      );
      creditIndicator.rotation.x = Math.PI / 2;
      botMesh.add(creditIndicator);
    }
    
    botMesh.castShadow = true;
    botMesh.receiveShadow = true;
    
    return botMesh;
  }

  /**
   * Create profit particles effect
   */
  createProfitParticles() {
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 6;     // x
      positions[i + 1] = (Math.random() - 0.5) * 6; // y
      positions[i + 2] = (Math.random() - 0.5) * 6; // z
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffff00,
      size: 3,
      transparent: true,
      opacity: 0.8
    });
    
    return new THREE.Points(particles, particleMaterial);
  }

  /**
   * Create connections between bots and validators/blockchain
   */
  createBotConnections() {
    // Connect bots to nearby validators (representing validation services)
    this.bots.forEach(bot => {
      const nearestValidator = this.findNearestValidator(bot.mesh.position);
      if (nearestValidator) {
        const connection = this.createConnection(
          bot.mesh.position,
          nearestValidator.mesh.position,
          0xffff00,
          0.1
        );
        this.connectionGroup.add(connection);
      }
    });
  }

  /**
   * Find nearest validator to a position
   */
  findNearestValidator(position) {
    if (this.validators.length === 0) return null;
    
    let nearest = this.validators[0];
    let minDistance = position.distanceTo(nearest.mesh.position);
    
    for (let i = 1; i < this.validators.length; i++) {
      const distance = position.distanceTo(this.validators[i].mesh.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = this.validators[i];
      }
    }
    
    return nearest;
  }

  /**
   * Create a connection line between two points
   */
  createConnection(start, end, color = 0xffffff, opacity = 0.5) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      start.x, start.y, start.z,
      end.x, end.y, end.z
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity
    });
    
    return new THREE.Line(geometry, material);
  }

  /**
   * Add interactive income distribution visualization
   */
  visualizeIncomeDistribution(distributionData) {
    // Create central hub for income distribution
    const hubGeometry = new THREE.SphereGeometry(5, 32, 32);
    const hubMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.position.set(0, 0, 25);
    
    // Add pulsing animation
    hub.userData = {
      type: 'income_hub',
      originalScale: hub.scale.clone(),
      pulseSpeed: 0.02
    };
    
    this.scene.add(hub);
    
    // Create distribution streams
    if (distributionData && distributionData.recentDistributions) {
      distributionData.recentDistributions.slice(0, 5).forEach((dist, index) => {
        const streamGeometry = new THREE.ConeGeometry(0.5, 8, 8);
        const streamMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x88ff88,
          transparent: true,
          opacity: 0.6
        });
        const stream = new THREE.Mesh(streamGeometry, streamMaterial);
        
        const angle = (index / 5) * Math.PI * 2;
        stream.position.x = Math.cos(angle) * 15;
        stream.position.y = Math.sin(angle) * 15;
        stream.position.z = 25;
        stream.lookAt(hub.position);
        
        this.scene.add(stream);
      });
    }
  }

  /**
   * Clear all objects from a group
   */
  clearGroup(group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  }

  /**
   * Main animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    this.animationTime += 0.016; // ~60fps
    
    // Update controls
    if (this.controls) {
      this.controls.update();
    }
    
    // Animate blockchain blocks
    this.blocks.forEach((block, index) => {
      block.mesh.rotation.y += this.rotationSpeed;
      block.mesh.position.y += Math.sin(this.animationTime + index * 0.5) * 0.01;
    });
    
    // Animate validators
    this.validators.forEach(validator => {
      validator.mesh.rotation.y += validator.data.active ? 0.01 : 0.003;
      validator.mesh.position.y = validator.userData.originalY + 
        Math.sin(this.animationTime + validator.userData.floatOffset) * 2;
    });
    
    // Animate bots
    this.bots.forEach(bot => {
      bot.mesh.rotation.y += bot.userData.rotationSpeed;
      if (bot.data.active) {
        bot.mesh.rotation.x += 0.005;
      }
    });
    
    // Animate income hub if it exists
    this.scene.traverse(child => {
      if (child.userData.type === 'income_hub') {
        const scale = 1 + Math.sin(this.animationTime * child.userData.pulseSpeed) * 0.1;
        child.scale.setScalar(scale);
      }
    });
    
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Add click interaction
   */
  addClickHandler(callback) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    this.renderer.domElement.addEventListener('click', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.scene.children, true);
      
      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData && callback) {
          callback(object.userData);
        }
      }
    });
  }

  /**
   * Update all visualizations
   */
  updateAll(blockchain, validatorNetwork, botEcosystem, incomeDistribution) {
    this.visualizeBlockchain(blockchain);
    this.visualizeValidators(validatorNetwork);
    this.visualizeBots(botEcosystem);
    this.visualizeIncomeDistribution(incomeDistribution.getDistributionStats());
  }

  /**
   * Dispose of the visualization
   */
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Clear all groups
    this.clearGroup(this.blockchainGroup);
    this.clearGroup(this.validatorGroup);
    this.clearGroup(this.botGroup);
    this.clearGroup(this.connectionGroup);
    
    // Dispose of renderer
    this.renderer.dispose();
    
    // Remove from DOM
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}