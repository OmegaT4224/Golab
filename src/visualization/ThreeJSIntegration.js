/**
 * Three.js Integration Module
 * Connects blockchain and quantum circuit functionality to the existing Three.js visualization
 */

class ThreeJSIntegration {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.can = null;
        this.quantumProcessor = null;
        this.blockchainCore = null;
        this.assetManager = null;
        this.debugSystem = null;
        
        // Visualization elements
        this.quantumVisualizations = [];
        this.blockchainVisualizations = [];
        this.assetVisualizations = [];
        
        // Animation state
        this.animationState = {
            quantumRotation: 0,
            blockchainPulse: 0,
            assetOrbit: 0
        };
    }

    /**
     * Initialize Three.js scene and integrate with quantum/blockchain systems
     */
    initialize(quantumProcessor, blockchainCore, assetManager, debugSystem) {
        this.quantumProcessor = quantumProcessor;
        this.blockchainCore = blockchainCore;
        this.assetManager = assetManager;
        this.debugSystem = debugSystem;
        
        this.setupScene();
        this.createOriginalCanVisualization();
        this.addQuantumVisualization();
        this.addBlockchainVisualization();
        this.addAssetVisualization();
        this.setupEventListeners();
        this.startAnimation();
        
        this.log('Three.js integration initialized successfully');
    }

    /**
     * Setup Three.js scene (extracted from original code)
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
        
        const canvas = this.renderer.domElement;

        const resizeCanvas = () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        };

        resizeCanvas();
        this.renderer.setClearColor(0xf0f0f0);

        // Lighting
        const ambientLight = new THREE.HemisphereLight(0xffffff, 0x404040, 0.7);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
        directionalLight.position.set(1, 1, 2);
        this.scene.add(directionalLight);

        // Orbit Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.rotateSpeed = 0.5;

        this.camera.position.z = 5;

        window.addEventListener('resize', resizeCanvas);
    }

    /**
     * Create the original Coca-Cola can visualization
     */
    createOriginalCanVisualization() {
        // Function to create the Coca-Cola can geometry
        const createCokeCanGeometry = (radius = 1, height = 3, radialSegments = 64, heightSegments = 32) => {
            const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments, heightSegments, true);
            geometry.translate(0, height / 2, 0);
            return geometry;
        };

        // Enhanced material with quantum-influenced colors
        const canMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normal;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform vec3 uBaseColor;
                uniform vec3 uHighlightColor;
                uniform vec3 uRimColor;
                uniform float uShininess;
                uniform float uRimThickness;
                uniform float uQuantumInfluence;
                uniform float uBlockchainPulse;
                
                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
                    float diffuse = max(dot(normal, lightDir), 0.0);
                    
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    vec3 reflectDir = reflect(-lightDir, normal);
                    float specular = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
                    
                    // Quantum influence on base color
                    vec3 quantumColor = mix(uBaseColor, vec3(0.0, 1.0, 1.0), uQuantumInfluence * 0.3);
                    
                    // Blockchain pulse effect
                    vec3 blockchainColor = mix(quantumColor, vec3(1.0, 1.0, 0.0), uBlockchainPulse * 0.2);
                    
                    vec3 baseColor = blockchainColor * diffuse;
                    vec3 highlight = uHighlightColor * specular * 0.5;
                    
                    float rimDot = 1.0 - max(dot(viewDir, normal), 0.0);
                    float rimEffect = pow(rimDot, uRimThickness);
                    vec3 rimColor = uRimColor * rimEffect * 0.8;
                    
                    vec3 finalColor = baseColor + highlight + rimColor;
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            uniforms: {
                uBaseColor: { value: new THREE.Color(0xff0000) },
                uHighlightColor: { value: new THREE.Color(0xffffff) },
                uRimColor: { value: new THREE.Color(0x222222) },
                uShininess: { value: 50.0 },
                uRimThickness: { value: 3.0 },
                uQuantumInfluence: { value: 0.0 },
                uBlockchainPulse: { value: 0.0 }
            },
            side: THREE.DoubleSide,
            transparent: false,
        });

        const canGeometry = createCokeCanGeometry();
        this.can = new THREE.Mesh(canGeometry, canMaterial);
        this.scene.add(this.can);

        // Load logo texture
        this.loadCanLogo();
    }

    /**
     * Load and apply the Coca-Cola logo
     */
    loadCanLogo() {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            'https://www.coca-colacompany.com/content/dam/journey/us/en/private/fileasset/image/cocacola-logo-shareable.jpg',
            (texture) => {
                const logoGeometry = new THREE.PlaneGeometry(2, 1);
                const logoMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: THREE.DoubleSide,
                });
                const logo = new THREE.Mesh(logoGeometry, logoMaterial);
                logo.position.set(0, 0, 1.05);
                this.can.add(logo);
                logo.rotation.y = Math.PI;

                this.updateOverlay('<p>Model loaded. Quantum Blockchain System Active!</p>');
                setTimeout(() => {
                    document.getElementById('overlay').style.display = 'none';
                }, 3000);
            },
            (xhr) => {
                const percentage = Math.round(xhr.loaded / xhr.total * 100);
                this.updateOverlay(`<p>${percentage}% loaded</p>`);
            },
            (err) => {
                console.error('Error loading texture:', err);
                this.updateOverlay('<p>Error loading model.</p>');
            }
        );
    }

    /**
     * Add quantum circuit visualization elements
     */
    addQuantumVisualization() {
        // Create quantum particles representing qubits
        const quantumGroup = new THREE.Group();
        
        for (let i = 0; i < 3; i++) {
            // Qubit sphere
            const qubitGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const qubitMaterial = new THREE.MeshPhongMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.8
            });
            const qubit = new THREE.Mesh(qubitGeometry, qubitMaterial);
            
            // Position qubits in a triangle around the can
            const angle = (i / 3) * Math.PI * 2;
            qubit.position.set(
                Math.cos(angle) * 2.5,
                i * 0.5 - 0.5,
                Math.sin(angle) * 2.5
            );
            
            quantumGroup.add(qubit);
            
            // Add entanglement lines
            if (i > 0) {
                const lineGeometry = new THREE.BufferGeometry();
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: 0xff00ff,
                    transparent: true,
                    opacity: 0.3
                });
                
                const points = [
                    quantumGroup.children[0].position.clone(),
                    qubit.position.clone()
                ];
                
                lineGeometry.setFromPoints(points);
                const line = new THREE.Line(lineGeometry, lineMaterial);
                quantumGroup.add(line);
            }
        }
        
        quantumGroup.position.set(0, 0, 0);
        this.scene.add(quantumGroup);
        this.quantumVisualizations.push(quantumGroup);
        
        this.log('Quantum visualization elements added');
    }

    /**
     * Add blockchain visualization elements
     */
    addBlockchainVisualization() {
        const blockchainGroup = new THREE.Group();
        
        // Create initial blocks
        for (let i = 0; i < 3; i++) {
            this.addBlockVisualization(blockchainGroup, i);
        }
        
        blockchainGroup.position.set(-4, 0, 0);
        this.scene.add(blockchainGroup);
        this.blockchainVisualizations.push(blockchainGroup);
        
        this.log('Blockchain visualization elements added');
    }

    /**
     * Add a single block visualization
     */
    addBlockVisualization(group, index) {
        const blockGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const blockMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.7
        });
        const block = new THREE.Mesh(blockGeometry, blockMaterial);
        
        block.position.set(0, index * 0.7 - 1, 0);
        group.add(block);
        
        // Add connection line to previous block
        if (index > 0) {
            const lineGeometry = new THREE.BufferGeometry();
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            
            const points = [
                new THREE.Vector3(0, (index - 1) * 0.7 - 1, 0),
                new THREE.Vector3(0, index * 0.7 - 1, 0)
            ];
            
            lineGeometry.setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            group.add(line);
        }
    }

    /**
     * Add asset visualization elements
     */
    addAssetVisualization() {
        const assetGroup = new THREE.Group();
        
        // Create asset orbs representing different asset types
        const assetTypes = [
            { name: 'ERC20', color: 0x00ff00, position: [4, 1, 0] },
            { name: 'NFT', color: 0xff0000, position: [4, 0, 0] },
            { name: 'Contract', color: 0x0000ff, position: [4, -1, 0] }
        ];
        
        assetTypes.forEach((assetType) => {
            const assetGeometry = new THREE.OctahedronGeometry(0.2);
            const assetMaterial = new THREE.MeshPhongMaterial({
                color: assetType.color,
                transparent: true,
                opacity: 0.8
            });
            const asset = new THREE.Mesh(assetGeometry, assetMaterial);
            asset.position.set(...assetType.position);
            asset.userData = { type: assetType.name };
            
            assetGroup.add(asset);
        });
        
        this.scene.add(assetGroup);
        this.assetVisualizations.push(assetGroup);
        
        this.log('Asset visualization elements added');
    }

    /**
     * Update visualizations based on system state
     */
    updateVisualizations() {
        this.updateQuantumVisualization();
        this.updateBlockchainVisualization();
        this.updateAssetVisualization();
        this.updateCanMaterial();
    }

    /**
     * Update quantum visualization based on quantum processor state
     */
    updateQuantumVisualization() {
        if (this.quantumProcessor && this.quantumVisualizations.length > 0) {
            const quantumGroup = this.quantumVisualizations[0];
            const stateInfo = this.quantumProcessor.getStateInfo();
            
            // Update qubit visualizations based on quantum state
            quantumGroup.children.forEach((child, index) => {
                if (child.geometry && child.geometry.type === 'SphereGeometry') {
                    const qubitIndex = Math.floor(index / 2); // Account for lines
                    if (stateInfo.probabilities[qubitIndex]) {
                        const probability = stateInfo.probabilities[qubitIndex];
                        child.material.opacity = 0.3 + probability * 0.7;
                        child.scale.setScalar(0.5 + probability * 0.5);
                    }
                }
            });
            
            // Rotate quantum group based on entanglement
            if (stateInfo.entangled) {
                this.animationState.quantumRotation += 0.02;
                quantumGroup.rotation.y = this.animationState.quantumRotation;
            }
        }
    }

    /**
     * Update blockchain visualization
     */
    updateBlockchainVisualization() {
        if (this.blockchainCore && this.blockchainVisualizations.length > 0) {
            const blockchainGroup = this.blockchainVisualizations[0];
            const chainLength = this.blockchainCore.chain.length;
            
            // Add new block visualizations if chain has grown
            const currentBlocks = blockchainGroup.children.filter(child => 
                child.geometry && child.geometry.type === 'BoxGeometry'
            ).length;
            
            if (chainLength > currentBlocks) {
                for (let i = currentBlocks; i < chainLength; i++) {
                    this.addBlockVisualization(blockchainGroup, i);
                }
                this.log(`Added visualization for block ${chainLength - 1}`);
            }
            
            // Pulse effect for active mining
            this.animationState.blockchainPulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
        }
    }

    /**
     * Update asset visualization
     */
    updateAssetVisualization() {
        if (this.assetManager && this.assetVisualizations.length > 0) {
            const assetGroup = this.assetVisualizations[0];
            const assetStats = this.assetManager.getAssetStats();
            
            // Update asset orb sizes based on number of assets
            assetGroup.children.forEach((asset) => {
                if (asset.userData && asset.userData.type) {
                    const count = assetStats.assetTypes[asset.userData.type.toUpperCase()] || 0;
                    const scale = 0.5 + Math.min(count * 0.1, 1.0);
                    asset.scale.setScalar(scale);
                }
            });
            
            // Orbit assets around their positions
            this.animationState.assetOrbit += 0.01;
            assetGroup.rotation.y = this.animationState.assetOrbit;
        }
    }

    /**
     * Update can material with quantum and blockchain influences
     */
    updateCanMaterial() {
        if (this.can && this.quantumProcessor && this.blockchainCore) {
            const material = this.can.material;
            
            // Quantum influence based on entanglement
            const stateInfo = this.quantumProcessor.getStateInfo();
            const quantumInfluence = stateInfo.entangled ? 1.0 : 0.0;
            
            // Blockchain pulse based on mining activity
            const blockchainPulse = this.animationState.blockchainPulse;
            
            material.uniforms.uQuantumInfluence.value = quantumInfluence;
            material.uniforms.uBlockchainPulse.value = blockchainPulse;
        }
    }

    /**
     * Setup event listeners for interactions
     */
    setupEventListeners() {
        // Add click handling for interactive elements
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        const handleClick = (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            
            // Check for intersections with interactive objects
            const intersects = raycaster.intersectObjects(this.scene.children, true);
            
            if (intersects.length > 0) {
                this.handleObjectClick(intersects[0].object);
            }
        };
        
        this.renderer.domElement.addEventListener('click', handleClick);
    }

    /**
     * Handle clicks on 3D objects
     */
    handleObjectClick(object) {
        if (object.userData && object.userData.type) {
            this.log(`Clicked on ${object.userData.type} asset`);
            
            // Trigger asset-specific actions
            switch (object.userData.type) {
                case 'ERC20':
                    this.demonstrateERC20Transfer();
                    break;
                case 'NFT':
                    this.demonstrateNFTCreation();
                    break;
                case 'Contract':
                    this.demonstrateContractExecution();
                    break;
            }
        }
    }

    /**
     * Animation loop
     */
    startAnimation() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Original can rotation
            if (this.can) {
                this.can.rotation.y += 0.005;
                this.can.rotation.x += 0.002;
            }
            
            // Update system visualizations
            this.updateVisualizations();
            
            // Update controls and render
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }

    /**
     * Demonstration methods
     */
    demonstrateERC20Transfer() {
        if (this.assetManager) {
            // Create sample ERC20 if none exists
            let asset = this.assetManager.getAssetBySymbol('TEST');
            if (!asset) {
                asset = this.assetManager.createERC20Asset('Test Token', 'TEST', 'alice', 1000000);
            }
            
            // Perform transfer
            try {
                this.assetManager.transferAsset(asset.id, 'alice', 'bob', 100);
                this.log('ERC20 transfer demonstration completed');
            } catch (error) {
                this.log(`ERC20 transfer failed: ${error.message}`);
            }
        }
    }

    demonstrateNFTCreation() {
        if (this.assetManager) {
            const nft = this.assetManager.createNFTAsset(
                'Demo NFT',
                'DEMO',
                'alice',
                'https://example.com/nft.json',
                { rarity: 'rare', power: 95 }
            );
            this.log(`NFT created: ${nft.name}`);
        }
    }

    demonstrateContractExecution() {
        this.log('Contract execution demonstration triggered');
        
        if (this.quantumProcessor) {
            // Execute quantum circuit as contract simulation
            this.quantumProcessor.createSignatureCircuit();
            this.log('Quantum contract circuit executed');
        }
    }

    /**
     * Update UI overlay
     */
    updateOverlay(content) {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.innerHTML = content;
        }
    }

    /**
     * Update status displays
     */
    updateQuantumStatus(info) {
        const element = document.getElementById('quantum-info');
        if (element) {
            element.innerHTML = `
                <div>Qubits: 3</div>
                <div>Entangled: ${info.entangled ? 'Yes' : 'No'}</div>
                <div>Operations: ${info.circuit.length}</div>
            `;
        }
    }

    updateBlockchainStatus(stats) {
        const element = document.getElementById('blockchain-info');
        if (element) {
            element.innerHTML = `
                <div>Blocks: ${stats.chainLength}</div>
                <div>Pending: ${stats.pendingTransactions}</div>
                <div>Hash Rate: ${stats.hashRate}/s</div>
            `;
        }
    }

    /**
     * Utility methods
     */
    log(message) {
        if (this.debugSystem) {
            this.debugSystem.log('ThreeJSIntegration', message);
        }
        console.log(`[ThreeJSIntegration] ${message}`);
    }
}

// Export for use in other modules
window.ThreeJSIntegration = ThreeJSIntegration;