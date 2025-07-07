# Golab

## 3D Coca-Cola Can Visualization

A web-based 3D visualization of a Coca-Cola can using Three.js with interactive controls and realistic rendering.

## Ethereum Automation Script 🚀

**NEW:** This repository now includes an advanced Ethereum automation script that automatically transfers funds and monitors earnings.

### Quick Start - Ethereum Automation

```bash
# Install dependencies
npm install

# Setup the automation script
npm run setup

# Test without real transactions
npm run test-dry

# Check your wallet balance
npm run balance

# Run the full automation
npm run run
```

**Target Address:** `0x904d5E231C3d002CAaaD6a96Ad96F91dbdC0fc5E`

### Features

- ✅ **Automatic Half-Balance Transfer**: Transfers 50% of current balance immediately
- ✅ **Earnings Monitoring**: Continuously monitors for new incoming funds  
- ✅ **Auto-Transfer**: Automatically sends new earnings to target address
- ✅ **Gas Optimization**: Smart gas estimation and cost calculation
- ✅ **Security Validations**: Address validation and transaction verification
- ✅ **Comprehensive Logging**: Detailed operation logs with timestamps
- ✅ **CLI Interface**: Easy-to-use command-line tools
- ✅ **Testnet Support**: Test safely before mainnet use
- ✅ **Dry Run Mode**: Simulate operations without real transactions

### Documentation

See [ETHEREUM_AUTOMATION.md](./ETHEREUM_AUTOMATION.md) for complete documentation, setup instructions, and security guidelines.

---

## 3D Visualization

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Coca-Cola Can</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; overflow: hidden; font-family: 'Inter', sans-serif; background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        #canContainer {
            width: 100%;
            height: 100vh;
            position: relative; /* Make sure the container is a positioning context */
        }
        canvas { display: block; width: 100%; height: 100%; }
        #overlay {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            font-size: 16px;
            z-index: 1;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div id="canContainer">
        <canvas id="cocaColaCan"></canvas>
        <div id="overlay">
            <p>Loading...</p>
        </div>
    </div>

    <script>
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('cocaColaCan'), antialias: true });
        const canvas = renderer.domElement;

        function resizeCanvas() {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }

        resizeCanvas();

        renderer.setClearColor(0xf0f0f0); // Light grey background

        // Lighting
        const ambientLight = new THREE.HemisphereLight(0xffffff, 0x404040, 0.7); // Sky color, ground color, intensity
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2); // Dim directional light
        directionalLight.position.set(1, 1, 2);
        scene.add(directionalLight);


        // Orbit Controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Add damping for smoother interaction
        controls.dampingFactor = 0.1;
        controls.rotateSpeed = 0.5;

        camera.position.z = 5;

        // Function to create the Coca-Cola can geometry with more subdivisions
        function createCokeCanGeometry(radius = 1, height = 3, radialSegments = 64, heightSegments = 32) {
            const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments, heightSegments, true); // More segments
            geometry.translate(0, height / 2, 0); // Center the can
            return geometry;
        }

        // Improved Coca-Cola can material with custom shader for a coated look
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
                void main() {
                    // Normalize the normal vector
                    vec3 normal = normalize(vNormal);
                    // Calculate the dot product of the normal and the light direction
                    vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0)); // More defined light direction
                    float diffuse = max(dot(normal, lightDir), 0.0);
                    // Calculate the reflection vector
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    vec3 reflectDir = reflect(-lightDir, normal);
                    float specular = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);
                    // Base color with diffuse lighting
                    vec3 baseColor = uBaseColor * diffuse;
                    // Add a highlight
                    vec3 highlight = uHighlightColor * specular * 0.5; // Reduced highlight intensity
                    // Rim effect
                    float rimDot = 1.0 - max(dot(viewDir, normal), 0.0);
                    float rimEffect = pow(rimDot, uRimThickness);
                    vec3 rimColor = uRimColor * rimEffect * 0.8; // Reduced rim intensity
                    // Combine the colors
                    vec3 finalColor = baseColor + highlight + rimColor;
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            uniforms: {
                uBaseColor: { value: new THREE.Color(0xff0000) }, // Red base color
                uHighlightColor: { value: new THREE.Color(0xffffff) }, // White highlight
                uRimColor: { value: new THREE.Color(0x222222) }, // Darker rim color
                uShininess: { value: 50.0 }, // Increased shininess
                uRimThickness: { value: 3.0 }, // Slightly thicker rim
            },
            side: THREE.DoubleSide,
            transparent: false,
        });

        const canGeometry = createCokeCanGeometry();
        const can = new THREE.Mesh(canGeometry, canMaterial);
        scene.add(can);

        // Add a subtle rotation animation
        function animate() {
            requestAnimationFrame(animate);
            can.rotation.y += 0.005; // Slow rotation
            can.rotation.x += 0.002;
            controls.update();
            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', resizeCanvas);

        // --- Texture Loading (for the logo) ---
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('https://www.coca-colacompany.com/content/dam/journey/us/en/private/fileasset/image/cocacola-logo-shareable.jpg',
            function (texture) {
                // Texture loaded successfully, now apply it to a separate plane
                const logoGeometry = new THREE.PlaneGeometry(2, 1); // Adjust size as needed
                const logoMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true, // Enable transparency
                    side: THREE.DoubleSide,
                });
                const logo = new THREE.Mesh(logoGeometry, logoMaterial);
                logo.position.set(0, 0, 1.05); // Position in front of the can
                can.add(logo); // Add the logo as a child of the can

                // Ensure the logo is correctly oriented
                logo.rotation.y = Math.PI;

                document.getElementById('overlay').innerHTML = '<p>Model loaded. Interact with the can!</p>';
                setTimeout(() => {
                    document.getElementById('overlay').style.display = 'none';
                }, 3000);

            },
            function (xhr) {
                // Progress callback
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                document.getElementById('overlay').innerHTML = `<p>${Math.round(xhr.loaded / xhr.total * 100)}% loaded</p>`;
            },
            function (err) {
                // Error callback
                console.error('An error happened loading the texture.');
                document.getElementById('overlay').innerHTML = '<p>Error loading model.</p>';
            }
        );

    </script>
</body>
</html>
