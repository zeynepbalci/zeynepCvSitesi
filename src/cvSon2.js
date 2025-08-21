import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class CVPortfolio {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.avatar = null;
        this.floor = null;
        
        this.floorWidth = 500; // Much wider floor
        this.floorDepth = 500; // Much deeper floor
        
        // Character movement
        this.keys = {};
        this.characterSpeed = 9.6; // 4x more faster movement
        this.characterRotationSpeed = 0.05;
        this.cameraFollowMode = true; // Camera follows avatar by default
        
        // Cyberpunk effects
        this.neonLights = [];
        this.fogParticles = [];
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupPhysics();
        this.createCyberpunkFloor();
        this.setupCyberpunkLighting();
        this.createNeonStructures();
        this.createFogEffect();
        this.createNeonCircle();
        this.loadAvatar();
        this.loadWalkAnimation();
        this.setupEventListeners();
        this.animate();
        
        // Hide loading screen
        document.getElementById('loading').style.display = 'none';
    }
    
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a); // Dark cyberpunk background
        
        // Add fog for atmosphere
        this.scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            70, // Better FOV for third person view
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 40, 20); // Much higher and closer to see full avatar
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x0a0a0a);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.5; // Increased exposure for better avatar visibility
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.enableKeys = true;
        this.controls.target.set(0, 4, -10); // Look at avatar starting position
    }
    
    setupPhysics() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0)
        });
    }
    
    createCyberpunkFloor() {
        const floorGeometry = new THREE.BoxGeometry(
            this.floorWidth,
            2,
            this.floorDepth
        );
        
        // Create cyberpunk floor material with neon grid
        const floorMaterial = new THREE.MeshLambertMaterial({
            color: 0x1a1a2e, // Dark blue-gray
            transparent: true,
            opacity: 0.9
        });
        
        const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
        floorMesh.position.y = 1.5; // Floor at avatar's feet level
        floorMesh.receiveShadow = true;
        floorMesh.castShadow = true;
        
        this.scene.add(floorMesh);
        
        // Add neon grid lines on the floor
        this.createNeonGrid();
        
        // Physics body for floor
        const floorShape = new CANNON.Box(new CANNON.Vec3(
            this.floorWidth / 2,
            1,
            this.floorDepth / 2
        ));
        
        const floorBody = new CANNON.Body({
            mass: 0,
            shape: floorShape
        });
        
        floorBody.position.set(0, 1.5, 0); // Floor at avatar's feet level
        this.world.addBody(floorBody);
        
        this.floor = {
            mesh: floorMesh,
            body: floorBody,
            name: 'CYBERPUNK CV PORTFOLIO - ZEYNEP BALCI'
        };
    }
    
    createNeonGrid() {
        const gridSize = 20;
        const gridSpacing = 10;
        
        for (let i = -gridSize; i <= gridSize; i++) {
            // Vertical lines
            const verticalGeometry = new THREE.BoxGeometry(0.1, 0.1, this.floorDepth);
            const verticalMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3
            });
            const verticalLine = new THREE.Mesh(verticalGeometry, verticalMaterial);
            verticalLine.position.set(i * gridSpacing, 2.5, 0);
            this.scene.add(verticalLine);
            
            // Horizontal lines
            const horizontalGeometry = new THREE.BoxGeometry(this.floorWidth, 0.1, 0.1);
            const horizontalMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.3
            });
            const horizontalLine = new THREE.Mesh(horizontalGeometry, horizontalMaterial);
            horizontalLine.position.set(0, 2.5, i * gridSpacing);
            this.scene.add(horizontalLine);
        }
    }
    
    createNeonStructures() {
        // Create cyberpunk buildings/structures
        for (let i = 0; i < 8; i++) {
            const buildingHeight = Math.random() * 30 + 10;
            const buildingWidth = Math.random() * 8 + 4;
            const buildingDepth = Math.random() * 8 + 4;
            
            const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
            const buildingMaterial = new THREE.MeshLambertMaterial({
                color: 0x2a2a2a,
                transparent: true,
                opacity: 0.8
            });
            
            const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
            building.position.set(
                (Math.random() - 0.5) * 200,
                buildingHeight / 2 + 2,
                (Math.random() - 0.5) * 200
            );
            building.castShadow = true;
            building.receiveShadow = true;
            this.scene.add(building);
            
            // Add neon lights to buildings
            this.addNeonLightsToBuilding(building, buildingHeight);
        }
    }
    
    addNeonLightsToBuilding(building, height) {
        const neonColors = [0xff00ff, 0x00ffff, 0x00ff00, 0xff0080];
        
        for (let i = 0; i < 3; i++) {
            const lightGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const lightMaterial = new THREE.MeshBasicMaterial({
                color: neonColors[Math.floor(Math.random() * neonColors.length)],
                transparent: true,
                opacity: 0.8
            });
            
            const neonLight = new THREE.Mesh(lightGeometry, lightMaterial);
            neonLight.position.set(
                building.position.x + (Math.random() - 0.5) * 4,
                building.position.y - height / 2 + (i + 1) * (height / 4),
                building.position.z + (Math.random() - 0.5) * 4
            );
            
            this.scene.add(neonLight);
            this.neonLights.push(neonLight);
        }
    }
    
    createNeonCircle() {
        // Create a beautiful neon green circle directly on the floor
        const circleGeometry = new THREE.CylinderGeometry(8, 8, 0.1, 32);
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00, // Neon green
            transparent: true,
            opacity: 0.7,
            emissive: 0x00ff00,
            emissiveIntensity: 0.6
        });
        
        this.neonCircle = new THREE.Mesh(circleGeometry, circleMaterial);
        this.neonCircle.position.set(0, 2.6, -10); // Position directly on floor surface
        this.neonCircle.castShadow = true;
        this.neonCircle.receiveShadow = true;
        this.scene.add(this.neonCircle);
        
        // Add physics body for the circle
        const circleShape = new CANNON.Cylinder(8, 8, 0.1, 8);
        this.circleBody = new CANNON.Body({
            mass: 0, // Static body
            shape: circleShape
        });
        this.circleBody.position.set(0, 2.6, -10);
        this.world.addBody(this.circleBody);
        
        // Add outer glow ring
        const outerRingGeometry = new THREE.RingGeometry(8.5, 9, 32);
        const outerRingMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        
        this.outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
        this.outerRing.position.set(0, 2.65, -10);
        this.outerRing.rotation.x = -Math.PI / 2; // Lay flat
        this.scene.add(this.outerRing);
    }
    
    createFogEffect() {
        // Create atmospheric fog particles
        const fogGeometry = new THREE.BufferGeometry();
        const fogCount = 1000;
        const positions = new Float32Array(fogCount * 3);
        
        for (let i = 0; i < fogCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 400;
            positions[i + 1] = Math.random() * 50;
            positions[i + 2] = (Math.random() - 0.5) * 400;
        }
        
        fogGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const fogMaterial = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 2,
            transparent: true,
            opacity: 0.3
        });
        
        const fogParticles = new THREE.Points(fogGeometry, fogMaterial);
        this.scene.add(fogParticles);
        this.fogParticles.push(fogParticles);
    }
    
    setupCyberpunkLighting() {
        // Ambient light - neutral white for avatar
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light - white light for avatar
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Avatar-specific white light
        const avatarLight = new THREE.PointLight(0xffffff, 0.8, 80);
        avatarLight.position.set(0, 30, 0);
        this.scene.add(avatarLight);
        
        // Neon point lights - positioned away from avatar area
        const neonColors = [0xff00ff, 0x00ffff, 0x00ff00, 0xff0080];
        
        for (let i = 0; i < 6; i++) {
            const neonLight = new THREE.PointLight(
                neonColors[Math.floor(Math.random() * neonColors.length)],
                0.8,
                100
            );
            // Position lights away from avatar starting area
            let x, z;
            do {
                x = (Math.random() - 0.5) * 400;
                z = (Math.random() - 0.5) * 400;
            } while (Math.sqrt(x*x + z*z) < 50); // Keep lights at least 50 units away from avatar
            
            neonLight.position.set(x, Math.random() * 30 + 10, z);
            neonLight.castShadow = true;
            this.scene.add(neonLight);
            this.neonLights.push(neonLight);
        }
        
        // Ground level neon lights - also away from avatar
        for (let i = 0; i < 4; i++) {
            const groundLight = new THREE.PointLight(0x00ffff, 0.6, 50);
            let x, z;
            do {
                x = (Math.random() - 0.5) * 200;
                z = (Math.random() - 0.5) * 200;
            } while (Math.sqrt(x*x + z*z) < 30); // Keep ground lights at least 30 units away
            
            groundLight.position.set(x, 5, z);
            this.scene.add(groundLight);
            this.neonLights.push(groundLight);
        }
    }
    
    loadAvatar() {
        const loader = new GLTFLoader();
        
        // Try to load avatar.glb from desktop
        loader.load(
            '/avatar.glb', // We'll need to copy this file to public folder
            (gltf) => {
                this.avatar = gltf.scene;
                this.avatar.scale.set(12, 12, 12); // Much bigger avatar
                this.avatar.position.set(0, 3.6, -10); // Much lower position
                this.avatar.castShadow = true;
                
                // Keep avatar materials original - no cyberpunk effects
                this.avatar.traverse((child) => {
                    if (child.isMesh) {
                        if (child.material) {
                            // Keep original color without any modifications
                            child.material.needsUpdate = true;
                            
                            // Ensure material can receive light properly
                            if (child.material.type === 'MeshStandardMaterial' || child.material.type === 'MeshLambertMaterial') {
                                child.material.receiveShadow = true;
                                child.material.castShadow = true;
                            }
                        }
                    }
                });
                
                this.scene.add(this.avatar);
                
                // Avatar physics body - now movable
                const avatarShape = new CANNON.Sphere(4.5);
                this.avatarBody = new CANNON.Body({
                    mass: 1, // Now has mass for movement
                    shape: avatarShape
                });
                this.avatarBody.position.set(0, 3.6, -10); // Much lower position
                this.world.addBody(this.avatarBody);
                
                // Apply walk animation if available
                if (this.walkClip) {
                    this.applyWalkAnimation();
                }
            },
            (progress) => {
                console.log('Loading avatar...', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Avatar yüklenemedi:', error);
                this.createDefaultAvatar();
            }
        );
    }
    
    createDefaultAvatar() {
        // Create avatar with legs - keeping original colors
        this.avatar = new THREE.Group();
        
        // Body - original blue color
        const bodyGeometry = new THREE.SphereGeometry(6, 32, 32);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4169E1 // Original blue color
        });
        this.avatarBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.avatarBody.position.y = 3.6;
        this.avatar.add(this.avatarBody);
        
        // Left leg - original darker blue
        const legGeometry = new THREE.CylinderGeometry(1.5, 1.5, 9, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2E5A88 // Original darker blue
        });
        this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.leftLeg.position.set(-2.5, -1.5, 0);
        this.avatar.add(this.leftLeg);
        
        // Right leg - original darker blue
        this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.rightLeg.position.set(2.5, -1.5, 0);
        this.avatar.add(this.rightLeg);
        
        this.avatar.position.set(0, 3.6, -10); // Much lower position
        this.avatar.castShadow = true;
        this.scene.add(this.avatar);
        
        // Avatar physics body - now movable
        const avatarShape = new CANNON.Sphere(4.5);
        this.avatarBody = new CANNON.Body({
            mass: 1, // Now has mass for movement
            shape: avatarShape
        });
        this.avatarBody.position.set(0, 3.6, -10); // Much lower position
        this.world.addBody(this.avatarBody);
    }
    
    loadWalkAnimation() {
        const fbxLoader = new FBXLoader();
        
        fbxLoader.load(
            '/walk2.fbx',
            (fbx) => {
                this.walkAnimation = fbx;
                console.log('Walk animation loaded successfully');
                
                if (fbx.animations.length > 0) {
                    this.walkClip = fbx.animations[0];
                    console.log('Walk clip stored');
                    
                    // If avatar is already loaded, apply animation
                    if (this.avatar) {
                        this.applyWalkAnimation();
                    }
                }
            },
            (progress) => {
                console.log('Loading walk animation...', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Walk animation yüklenemedi:', error);
            }
        );
    }
    
    applyWalkAnimation() {
        if (this.avatar && this.walkClip) {
            this.avatarMixer = new THREE.AnimationMixer(this.avatar);
            
            // Fix bone name mapping - remove "mixamorig" prefix
            const fixedClip = this.walkClip.clone();
            console.log('Original animation tracks:', fixedClip.tracks.map(t => t.name));
            
            fixedClip.tracks.forEach(track => {
                const originalName = track.name;
                if (originalName.startsWith('mixamorig')) {
                    const newName = originalName.replace('mixamorig', '');
                    track.name = newName;
                    console.log('Fixed bone name:', originalName, '->', newName);
                }
            });
            
            console.log('Fixed animation tracks:', fixedClip.tracks.map(t => t.name));
            
            this.walkAction = this.avatarMixer.clipAction(fixedClip);
            this.walkAction.setLoop(THREE.LoopRepeat);
            this.walkAction.clampWhenFinished = false;
            this.walkAction.timeScale = 1.0;
            
            // Disable root motion - only use animation for walking motion
            this.walkAction.zeroSlopeAtEnd = true;
            this.walkAction.zeroSlopeAtStart = true;
            
            console.log('Walk animation applied to avatar with fixed bone names');
        }
    }
    
    updateCamera() {
        if (!this.avatarBody) return;
        
        // Camera position is controlled by mouse, only target follows avatar
        const avatarPos = this.avatarBody.position;
        const currentTarget = this.controls.target;
        
        // Don't update camera position - let mouse control it completely
        // Only update target to look at avatar
        currentTarget.x = avatarPos.x;
        currentTarget.y = 10;
        currentTarget.z = avatarPos.z;
    }
    
    setupEventListeners() {
        // Keyboard controls for character movement
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Toggle camera mode with C key
            if (event.code === 'KeyC') {
                this.cameraFollowMode = !this.cameraFollowMode;
                console.log('Camera follow mode:', this.cameraFollowMode);
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    updateCharacterMovement() {
        if (!this.avatarBody) {
            console.log('Avatar body not found!');
            return;
        }
        
        const velocity = new CANNON.Vec3();
        
        // Forward/Backward movement
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            velocity.z = -this.characterSpeed;
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            velocity.z = this.characterSpeed;
        }
        
        // Left/Right movement
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            velocity.x = -this.characterSpeed;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            velocity.x = this.characterSpeed;
        }
        
        // Apply velocity to physics body - prevent jumping by keeping Y velocity at 0
        this.avatarBody.velocity.set(velocity.x, 0, velocity.z);
        
        // Debug: log movement
        if (velocity.length() > 0) {
            console.log('Moving avatar:', velocity);
        }
        
        // Character rotation based on movement direction
        if (velocity.length() > 0) {
            const angle = Math.atan2(velocity.x, velocity.z);
            this.avatarBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update time for cyberpunk effects
        this.time += 0.016;
        
        // Update character movement
        this.updateCharacterMovement();
        
        // Update physics
        this.world.step(1/60);
        
        // Update avatar position if it exists
        if (this.avatar && this.avatarBody) {
            this.avatar.position.copy(this.avatarBody.position);
            this.avatar.quaternion.copy(this.avatarBody.quaternion);
            
            // Walk animation using FBX - smooth continuous loop
            if (this.walkAction) {
                if (this.avatarBody.velocity.length() > 0.1) {
                    if (!this.walkAction.isRunning()) {
                        this.walkAction.play();
                    }
                } else {
                    if (this.walkAction.isRunning()) {
                        this.walkAction.stop();
                    }
                }
            }
        }
        
        // Update animation mixer (only once)
        if (this.avatarMixer) {
            this.avatarMixer.update(1/60);
        }
        
        // Update cyberpunk effects
        this.updateCyberpunkEffects();
        
        // Update camera and controls
        this.updateCamera();
        this.controls.update();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    updateCyberpunkEffects() {
        // Animate neon lights
        this.neonLights.forEach((light, index) => {
            if (light.intensity !== undefined) {
                // Pulse effect for point lights
                light.intensity = 0.6 + Math.sin(this.time * 2 + index) * 0.2;
            } else {
                // Rotate neon light meshes
                light.rotation.y += 0.02;
                light.material.opacity = 0.5 + Math.sin(this.time * 3 + index) * 0.3;
            }
        });
        
        // Animate fog particles
        this.fogParticles.forEach(particles => {
            particles.rotation.y += 0.001;
            particles.position.y = Math.sin(this.time * 0.5) * 5;
        });
        
        // Animate neon circle effect
        if (this.neonCircle && this.neonCircle.material) {
            this.neonCircle.material.emissiveIntensity = 0.4 + Math.sin(this.time * 2) * 0.3;
            this.neonCircle.material.opacity = 0.5 + Math.sin(this.time * 1.5) * 0.2;
        }
        
        if (this.outerRing && this.outerRing.material) {
            this.outerRing.material.opacity = 0.3 + Math.sin(this.time * 3) * 0.2;
            this.outerRing.rotation.z += 0.01; // Rotate the outer ring
        }
        
        // Avatar is completely excluded from cyberpunk effects - keeps original appearance
    }
}

// Initialize the application
new CVPortfolio();
