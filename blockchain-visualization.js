/**
 * Blockchain 3D Visualization Component
 * Integrates blockchain data with the existing Three.js scene
 */

class BlockchainVisualization {
    /**
     * Initialize blockchain visualization
     * @param {THREE.Scene} scene - Three.js scene
     * @param {Blockchain} blockchain - Blockchain instance
     */
    constructor(scene, blockchain) {
        this.scene = scene;
        this.blockchain = blockchain;
        this.blockMeshes = [];
        this.connections = [];
        this.blockSize = 0.3;
        this.spacing = 1.2;
        this.maxVisibleBlocks = 10;
        this.animationSpeed = 0.02;
        
        this.initializeMaterials();
        this.createInitialVisualization();
    }

    /**
     * Initialize materials for blockchain visualization
     */
    initializeMaterials() {
        // Block material with quantum-inspired effects
        this.blockMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                uniform float uTime;
                
                void main() {
                    vPosition = position;
                    vNormal = normal;
                    
                    // Add subtle quantum fluctuation
                    vec3 pos = position;
                    pos += normal * sin(uTime * 2.0 + position.x * 10.0) * 0.02;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                uniform float uTime;
                uniform vec3 uBlockColor;
                uniform float uQuantumState;
                
                void main() {
                    vec3 normal = normalize(vNormal);
                    
                    // Quantum-inspired color shifting
                    float quantumEffect = sin(uTime * 3.0 + uQuantumState * 10.0) * 0.3 + 0.7;
                    vec3 color = uBlockColor * quantumEffect;
                    
                    // Add holographic rim effect
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
                    rim = pow(rim, 2.0);
                    
                    color += vec3(0.0, 0.5, 1.0) * rim * 0.5;
                    
                    gl_FragColor = vec4(color, 0.8);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                uBlockColor: { value: new THREE.Color(0x4fc3f7) },
                uQuantumState: { value: 0 }
            },
            transparent: true,
            side: THREE.DoubleSide
        });

        // Connection material
        this.connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.6
        });

        // Genesis block material (special)
        this.genesisMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.9,
            emissive: 0x332200
        });
    }

    /**
     * Create initial blockchain visualization
     */
    createInitialVisualization() {
        this.updateVisualization();
    }

    /**
     * Update the blockchain visualization
     */
    updateVisualization() {
        // Clear existing visualization
        this.clearVisualization();

        const blocks = this.blockchain.chain;
        const startIndex = Math.max(0, blocks.length - this.maxVisibleBlocks);
        
        // Create block meshes
        for (let i = startIndex; i < blocks.length; i++) {
            this.createBlockMesh(blocks[i], i - startIndex);
        }

        // Create connections between blocks
        this.createConnections();
    }

    /**
     * Create a 3D mesh for a blockchain block
     * @param {Block} block - Blockchain block
     * @param {number} visualIndex - Visual position index
     */
    createBlockMesh(block, visualIndex) {
        // Create cube geometry for the block
        const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        
        // Choose material based on block type
        let material;
        if (block.index === 0) {
            material = this.genesisMaterial;
        } else {
            material = this.blockMaterial.clone();
            material.uniforms.uQuantumState.value = Math.random();
            material.uniforms.uBlockColor.value = new THREE.Color().setHSL(
                (block.index * 0.1) % 1, 
                0.7, 
                0.6
            );
        }

        const blockMesh = new THREE.Mesh(geometry, material);
        
        // Position blocks in a chain formation around the can
        const angle = (visualIndex * Math.PI * 2) / this.maxVisibleBlocks;
        const radius = 3;
        blockMesh.position.set(
            Math.cos(angle) * radius,
            visualIndex * 0.3 - 1,
            Math.sin(angle) * radius
        );

        // Add block info as userData
        blockMesh.userData = {
            block: block,
            visualIndex: visualIndex,
            originalPosition: blockMesh.position.clone()
        };

        this.scene.add(blockMesh);
        this.blockMeshes.push(blockMesh);

        // Add text label for block info
        this.createBlockLabel(blockMesh, block);
    }

    /**
     * Create text label for block information
     * @param {THREE.Mesh} blockMesh - Block mesh
     * @param {Block} block - Block data
     */
    createBlockLabel(blockMesh, block) {
        // Create a canvas for text rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;

        // Draw text on canvas
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = 'white';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText(`Block #${block.index}`, canvas.width / 2, 30);
        context.fillText(`Hash: ${block.hash.substring(0, 8)}...`, canvas.width / 2, 50);
        context.fillText(`Nonce: ${block.nonce}`, canvas.width / 2, 70);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        const labelGeometry = new THREE.PlaneGeometry(0.8, 0.4);
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        
        // Position label above block
        label.position.copy(blockMesh.position);
        label.position.y += 0.5;
        label.lookAt(0, label.position.y, 0); // Face the center

        this.scene.add(label);
        blockMesh.userData.label = label;
    }

    /**
     * Create connections between consecutive blocks
     */
    createConnections() {
        for (let i = 0; i < this.blockMeshes.length - 1; i++) {
            const currentBlock = this.blockMeshes[i];
            const nextBlock = this.blockMeshes[i + 1];

            const points = [
                currentBlock.position,
                nextBlock.position
            ];

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, this.connectionMaterial);

            this.scene.add(line);
            this.connections.push(line);
        }
    }

    /**
     * Clear existing visualization
     */
    clearVisualization() {
        // Remove block meshes and labels
        this.blockMeshes.forEach(mesh => {
            if (mesh.userData.label) {
                this.scene.remove(mesh.userData.label);
            }
            this.scene.remove(mesh);
        });
        this.blockMeshes = [];

        // Remove connections
        this.connections.forEach(connection => {
            this.scene.remove(connection);
        });
        this.connections = [];
    }

    /**
     * Animate blockchain visualization
     * @param {number} time - Current time
     */
    animate(time) {
        // Update shader uniforms
        this.blockMeshes.forEach(mesh => {
            if (mesh.material.uniforms && mesh.material.uniforms.uTime) {
                mesh.material.uniforms.uTime.value = time * 0.001;
            }
            
            // Add gentle floating animation
            const userData = mesh.userData;
            if (userData.originalPosition) {
                mesh.position.y = userData.originalPosition.y + Math.sin(time * 0.001 + userData.visualIndex) * 0.05;
            }

            // Rotate blocks slowly
            mesh.rotation.y += 0.005;
        });

        // Animate connection opacity
        const pulseOpacity = (Math.sin(time * 0.002) + 1) * 0.3 + 0.3;
        this.connections.forEach(connection => {
            connection.material.opacity = pulseOpacity;
        });
    }

    /**
     * Add a new block and update visualization
     * @param {*} data - Block data
     */
    addBlock(data) {
        this.blockchain.addBlock(data);
        this.updateVisualization();
    }

    /**
     * Get blockchain statistics for display
     * @returns {Object} Blockchain statistics
     */
    getStats() {
        return this.blockchain.getStats();
    }

    /**
     * Set blockchain difficulty
     * @param {number} difficulty - New difficulty level
     */
    setDifficulty(difficulty) {
        this.blockchain.setDifficulty(difficulty);
    }

    /**
     * Handle block selection/interaction
     * @param {THREE.Vector2} mouse - Mouse coordinates
     * @param {THREE.Camera} camera - Camera instance
     * @returns {Object|null} Selected block info or null
     */
    handleBlockSelection(mouse, camera) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(this.blockMeshes);
        
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            const blockData = selectedMesh.userData.block;
            
            return {
                block: blockData,
                mesh: selectedMesh,
                position: selectedMesh.position
            };
        }
        
        return null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlockchainVisualization;
}