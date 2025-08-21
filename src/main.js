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
        
        this.floorWidth = 800; // Much wider floor
        this.floorDepth = 800; // Much deeper floor
        
        // Character movement
        this.keys = {};
        this.characterSpeed = 9.6; // 4x more faster movement
        this.characterRotationSpeed = 0.05;
        this.cameraFollowMode = true; // Camera follows avatar by default
        
        // Cyberpunk effects
        this.neonLights = [];
        this.time = 0;
        
        // Planet system
        this.planets = [];
        this.planetRings = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.glbLoader = new GLTFLoader();
        
        // UI state
        this.isInitialized = false;
        this.isLoading = false;
        
        this.setupWelcomeScreen();
    }
    
    setupWelcomeScreen() {
        const enterBtn = document.getElementById('enter-world-btn');
        const loadingIndicator = document.getElementById('loading-indicator');
        
        if (enterBtn) {
            enterBtn.addEventListener('click', () => {
                this.startLoading();
            });
        }
    }
    
    startLoading() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const enterBtn = document.getElementById('enter-world-btn');
        const loadingIndicator = document.getElementById('loading-indicator');
        
        // Hide button and show loading
        if (enterBtn) enterBtn.style.display = 'none';
        if (loadingIndicator) loadingIndicator.classList.add('show');
        
        // Simulate loading progress
        setTimeout(() => {
            this.init3DWorld();
        }, 3000);
    }
    
    init3DWorld() {
        // Hide welcome screen
        const welcomeScreen = document.getElementById('welcome-screen');
        const canvasContainer = document.getElementById('canvas-container');
        
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (canvasContainer) canvasContainer.classList.remove('hidden');
        
        // Initialize 3D world
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupPhysics();
        this.createCyberpunkFloor();
        this.setupCyberpunkLighting();

        this.createPlanetSystem();
        this.createInfoText();
        this.loadAvatar();
        this.loadWalkAnimation();
        this.setupEventListeners();
        this.animate();
        
        // Mark as initialized and hide loading screen
        this.isInitialized = true;
        const loadingElement = document.getElementById('loading');
        if (loadingElement) loadingElement.style.display = 'none';
    }
    
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); // Pure black space
        
        // Create starfield background
        this.createStarfield();
        this.createSpaceBackground();
        this.createNebulaBackground();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            70, // Better FOV for third person view
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(2.73, 23.68, 298.93); // Fixed camera position
        
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
        this.controls.minDistance = 20;
        this.controls.maxDistance = 200;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.enableKeys = true;
        this.controls.target.set(0, 10, 180); // Look at avatar center position
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
        
        // Create space floor material
        const floorMaterial = new THREE.MeshLambertMaterial({
            color: 0x000000, // Pure black space
            transparent: true,
            opacity: 0.2
        });
        
        const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
        floorMesh.position.y = -10; // Floor much lower
        floorMesh.receiveShadow = true;
        floorMesh.castShadow = true;
        
        this.scene.add(floorMesh);
        

        
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
        
        floorBody.position.set(0, -10, 0); // Floor much lower
        this.world.addBody(floorBody);
        
        this.floor = {
            mesh: floorMesh,
            body: floorBody,
            name: 'CYBERPUNK CV PORTFOLIO - ZEYNEP BALCI'
        };
    }
    

    

    
    createStarfield() {
        // Create thousands of stars
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 15000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            // Random positions in a much larger sphere
            const radius = 800 + Math.random() * 1200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random star colors (white, light blue, dark blue, blue)
            const starColors = [0xffffff, 0x88ccff, 0x224466, 0x4466aa];
            const color = starColors[Math.floor(Math.random() * starColors.length)];
            
            colors[i * 3] = (color >> 16) / 255;
            colors[i * 3 + 1] = ((color >> 8) & 255) / 255;
            colors[i * 3 + 2] = (color & 255) / 255;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.starfield = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starfield);
    }
    
    createSpaceBackground() {
        // Load galaxy.glb as background
        this.glbLoader.load(
            '/galaxy.glb',
            (gltf) => {
                const spaceBackground = gltf.scene;
                spaceBackground.scale.setScalar(1000); // Very large to cover entire sky
                spaceBackground.position.set(0, 150, 0); // Higher in the sky
                
                // Apply subtle color variations
                spaceBackground.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = false;
                        child.receiveShadow = false;
                        
                        // Add subtle color variations
                        if (child.material) {
                            // Create more visible color variations
                            const baseColor = new THREE.Color(0x000022);
                            const variation = Math.random() * 0.3;
                            child.material.color = new THREE.Color(
                                baseColor.r + variation,
                                baseColor.g + variation,
                                baseColor.b + variation
                            );
                            child.material.transparent = true;
                            child.material.opacity = 0.8;
                            child.material.needsUpdate = true;
                        }
                    }
                });
                
                this.scene.add(spaceBackground);
                this.spaceBackground = spaceBackground;
                
                console.log('Space background loaded successfully');
            },
            (progress) => {
                console.log('Loading space background...', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Space background yüklenemedi:', error);
            }
        );
    }
    
    createNebulaBackground() {
        // Create multiple nebula layers for space atmosphere
        const nebulaColors = [0x110022, 0x002211, 0x221100, 0x110011];
        
        for (let i = 0; i < 4; i++) {
            const nebulaGeometry = new THREE.SphereGeometry(8000 + i * 2000, 32, 32);
            const nebulaMaterial = new THREE.MeshBasicMaterial({
                color: nebulaColors[i],
                transparent: true,
                opacity: 0.007, // 3x less opacity (0.02 / 3)
                side: THREE.BackSide
            });
            
            const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
            nebula.position.set(0, 500, 0);
            this.scene.add(nebula);
            
            // Store for animation
            if (!this.nebulas) this.nebulas = [];
            this.nebulas.push(nebula);
        }
    }
    
    createPlanetSystem() {
        // Create 4 concentric rings behind avatar
        const ringRadii = [40, 60, 80, 100]; // Smaller radii
        const ringColors = [0x00ffff, 0xff00ff, 0xffff00, 0xff8800]; // Cyan, Magenta, Yellow, Orange
        
        ringRadii.forEach((radius, index) => {
            const ringGeometry = new THREE.RingGeometry(radius - 1, radius + 1, 64); // Thinner rings
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: ringColors[index],
                transparent: true,
                opacity: 0.4, // More visible
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(0, 100, 80); // Much higher position
            ring.rotation.x = -Math.PI / 2; // Lay flat
            ring.scale.set(2, 2, 2); // 2x larger rings
            this.scene.add(ring);
            this.planetRings.push(ring);
        });
        
        // Define planets with their properties
        const planetData = [
            {
                name: 'Projelerim',
                glbFile: '/sun.glb',
                ringIndex: 0,
                angle: -Math.PI / 4, // Sol üst
                scale: 20, // 2x larger (10 * 2)
                color: 0x224466, // Dark blue instead of yellow
                description: 'Yaptığım projeler ve çalışmalar',
                details: {
                    projects: [
                        { name: 'E-Ticaret Platformu', tech: 'React, Node.js, MongoDB', year: '2023' },
                        { name: 'AI Chatbot', tech: 'Python, TensorFlow, Flask', year: '2023' },
                        { name: 'Mobil Uygulama', tech: 'React Native, Firebase', year: '2022' },
                        { name: 'Web Sitesi', tech: 'HTML, CSS, JavaScript', year: '2022' }
                    ]
                }
            },
            {
                name: 'Deneyimlerim',
                glbFile: '/saturn2.glb',
                ringIndex: 1,
                angle: Math.PI / 4, // Sağ üst
                scale: 30, // 2x larger (15 * 2)
                color: 0x446688, // Darker blue instead of yellow
                description: 'İş deneyimlerim ve kariyer yolculuğum',
                details: {
                    experience: [
                        { company: 'TechCorp', position: 'Senior Developer', duration: '2022-2023' },
                        { company: 'StartUp Inc', position: 'Full Stack Developer', duration: '2021-2022' },
                        { company: 'Digital Agency', position: 'Frontend Developer', duration: '2020-2021' }
                    ]
                }
            },
            {
                name: 'Yeteneklerim',
                glbFile: '/neptune2.glb',
                ringIndex: 2,
                angle: -3 * Math.PI / 4, // Sol alt
                scale: 20, // 2x larger (10 * 2)
                color: 0x0088ff, // Neptune blue
                description: 'Teknik yeteneklerim ve uzmanlık alanlarım',
                details: {
                    skills: [
                        { category: 'Frontend', skills: ['React', 'Vue.js', 'Angular', 'HTML/CSS'] },
                        { category: 'Backend', skills: ['Node.js', 'Python', 'Java', 'PHP'] },
                        { category: 'Database', skills: ['MongoDB', 'MySQL', 'PostgreSQL'] },
                        { category: 'Tools', skills: ['Git', 'Docker', 'AWS', 'Figma'] }
                    ]
                }
            },
            {
                name: 'İletişim',
                glbFile: '/planet4.glb',
                ringIndex: 3,
                angle: 3 * Math.PI / 4, // Sağ alt
                scale: 3, // 2x larger (1.5 * 2)
                color: 0xff6688, // Planet4 color
                description: 'İletişim bilgilerim ve sosyal medya',
                details: {
                    contact: [
                        { type: 'Email', value: 'zeynep@example.com', icon: '📧' },
                        { type: 'LinkedIn', value: 'linkedin.com/in/zeynep', icon: '💼' },
                        { type: 'GitHub', value: 'github.com/zeynep', icon: '🐙' },
                        { type: 'Twitter', value: '@zeynep_dev', icon: '🐦' }
                    ]
                }
            }
        ];
        
        // Load and place planets
        planetData.forEach((planetInfo, index) => {
            this.loadPlanet(planetInfo, index);
        });
    }
    
    loadPlanet(planetInfo, index) {
        this.glbLoader.load(
            planetInfo.glbFile,
            (gltf) => {
                const planet = gltf.scene;
                const ringRadius = [40, 60, 80, 100][planetInfo.ringIndex]; // Updated radii
                
                // Position planet on its ring
                const x = Math.cos(planetInfo.angle) * ringRadius;
                const z = Math.sin(planetInfo.angle) * ringRadius;
                planet.position.set(x, 100, z + 80); // Much higher position
                planet.scale.setScalar(planetInfo.scale);
                
                // Keep original colors - no effects
                planet.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        
                        // Keep original material colors without any modifications
                        if (child.material) {
                            // Reset any emissive effects to show original colors
                            child.material.emissive = new THREE.Color(0x000000);
                            child.material.emissiveIntensity = 0;
                            child.material.needsUpdate = true;
                        }
                    }
                });
                
                // Store planet data
                planet.userData = {
                    name: planetInfo.name,
                    description: planetInfo.description,
                    color: planetInfo.color,
                    index: index
                };
                
                // Also store data in all child objects for raycasting
                planet.traverse((child) => {
                    if (child.isMesh) {
                        child.userData = {
                            name: planetInfo.name,
                            description: planetInfo.description,
                            color: planetInfo.color,
                            index: index
                        };
                    }
                });
                
                this.scene.add(planet);
                this.planets.push(planet);
                

            },
            (progress) => {
                console.log(`Loading ${planetInfo.name}...`, (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error(`${planetInfo.name} yüklenemedi:`, error);
            }
        );
    }
    

    
    createInfoText() {
        // Create info panel using the same style as planet black overlay
        const infoPanel = document.createElement('div');
        infoPanel.id = 'info-panel';
        infoPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 240px;
            height: 90px;
            background: #000000;
            border: 2px solid #00ffff;
            border-radius: 15px;
            color: #00ffff;
            z-index: 1000;
            font-family: 'Orbitron', monospace;
            font-size: 18px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
            animation: infoPanelGlow 2s ease-in-out infinite alternate;
        `;
        
        infoPanel.innerHTML = `
            <div style="font-weight: bold; text-shadow: 0 0 15px #00ffff; line-height: 1.2;">
                Bilgi edinmek için gezegenlere dokunun
            </div>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes infoPanelGlow {
                0% { 
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
                    border-color: #00ffff;
                }
                100% { 
                    box-shadow: 0 0 40px rgba(0, 255, 255, 0.8);
                    border-color: #00aaff;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(infoPanel);
        
        console.log('Info panel created with black overlay style');
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
    }
    
    loadAvatar() {
        const loader = new GLTFLoader();
        
        // Try to load avatar.glb from desktop
        loader.load(
            '/avatar.glb', // We'll need to copy this file to public folder
            (gltf) => {
                this.avatar = gltf.scene;
                this.avatar.scale.set(60, 60, 60); // 2x larger avatar (30 * 2)
                this.avatar.position.set(0, -50, 180); // Avatar 2x further away (90 * 2)
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
                const avatarShape = new CANNON.Sphere(22.5); // 2x larger physics body (11.25 * 2)
                this.avatarBody = new CANNON.Body({
                    mass: 1, // Now has mass for movement
                    shape: avatarShape
                });
                this.avatarBody.position.set(0, -50, 180); // Avatar 2x further away (90 * 2)
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
        const bodyGeometry = new THREE.SphereGeometry(30, 32, 32); // 5x larger (6 * 5)
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4169E1 // Original blue color
        });
        this.avatarBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.avatarBody.position.y = 18; // 5x larger (3.6 * 5)
        this.avatar.add(this.avatarBody);
        
        // Left leg - original darker blue
        const legGeometry = new THREE.CylinderGeometry(7.5, 7.5, 45, 8); // 5x larger (1.5 * 5, 9 * 5)
        const legMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2E5A88 // Original darker blue
        });
        this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.leftLeg.position.set(-12.5, -7.5, 0); // 5x larger positions
        this.avatar.add(this.leftLeg);
        
        // Right leg - original darker blue
        this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.rightLeg.position.set(12.5, -7.5, 0); // 5x larger positions
        this.avatar.add(this.rightLeg);
        
        this.avatar.position.set(0, -8, 45); // Center of the rings
        this.avatar.castShadow = true;
        this.scene.add(this.avatar);
        
        // Avatar physics body - now movable
        const avatarShape = new CANNON.Sphere(4.5);
        this.avatarBody = new CANNON.Body({
            mass: 1, // Now has mass for movement
            shape: avatarShape
        });
        this.avatarBody.position.set(0, -8, 45); // Center of the rings
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
        
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Planet click detection
        document.addEventListener('click', (event) => {
            this.handlePlanetClick(event);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    handlePlanetClick(event) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        

        
        // Raycast to find intersection with planets
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.planets, true);
        

        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;

            
            // Check if the clicked object has planet data
            if (clickedObject.userData && clickedObject.userData.name) {

                this.showPlanetInfo(clickedObject.userData);
            } else {
                // Find the parent planet object
                let planet = clickedObject;
                while (planet.parent && !planet.userData.name) {
                    planet = planet.parent;
                }
                

                
                if (planet.userData.name) {

                    this.showPlanetInfo(planet.userData);
                }
            }
        }
    }
    
    showPlanetInfo(planetData) {
        // Open the transition page first
        const transitionUrl = `/planet-transition.html?planet=${encodeURIComponent(planetData.name)}`;
        window.open(transitionUrl, '_blank', 'width=1200,height=800,scrollbars=no,resizable=yes');
    }
    
    animatePlanetEntry(planet, currentCameraPos, currentTarget, planetData) {
        const duration = 4000; // 4 seconds for smoother animation
        const startTime = Date.now();
        
        // Create black overlay for planet focus
        const blackOverlay = document.createElement('div');
        blackOverlay.id = 'planet-black-overlay';
        blackOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000000;
            z-index: 1500;
            opacity: 0;
            transition: opacity 1s ease-out;
        `;
        document.body.appendChild(blackOverlay);
        
        // Hide all other planets and elements except the clicked one
        this.planets.forEach(p => {
            if (p !== planet) {
                p.visible = false;
            }
        });
        
        // Hide rings and other elements
        this.planetRings.forEach(ring => ring.visible = false);
        if (this.avatar) this.avatar.visible = false;
        if (this.starfield) this.starfield.visible = false;
        if (this.spaceBackground) this.spaceBackground.visible = false;
        if (this.nebulas) this.nebulas.forEach(nebula => nebula.visible = false);
        
        // Animation loop
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const easedProgress = easeInOutCubic(progress);
            
            // Calculate camera position (fly towards planet)
            const planetPos = planet.position.clone();
            const direction = planetPos.clone().sub(currentCameraPos).normalize();
            const distance = currentCameraPos.distanceTo(planetPos);
            const currentDistance = distance * (1 - easedProgress);
            
            this.camera.position.copy(currentCameraPos).add(direction.multiplyScalar(distance - currentDistance));
            
            // Update target to look at planet
            this.controls.target.copy(planetPos);
            this.controls.update();
            
            // Make planet rotate faster as we get closer
            planet.rotation.y += 0.02 + (easedProgress * 0.03);
            
            // Gradually fade to black overlay
            if (progress > 0.3) {
                const overlayOpacity = (progress - 0.3) / 0.7; // Start fading at 30% progress
                blackOverlay.style.opacity = overlayOpacity;
            }
            
            // Add camera shake effect near the end
            if (progress > 0.8) {
                const shake = (Math.random() - 0.5) * 0.05;
                this.camera.position.x += shake;
                this.camera.position.y += shake;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete - show planet interior with pure black background
                blackOverlay.remove();
                this.showPlanetInterior(planetData, currentCameraPos, currentTarget);
            }
        };
        
        animate();
    }
    
    showPlanetInterior(planetData, originalCameraPos, originalTarget) {
        // Create immersive planet interior view with soft entrance
        let planetInterior = document.getElementById('planet-interior');
        if (!planetInterior) {
            planetInterior = document.createElement('div');
            planetInterior.id = 'planet-interior';
            planetInterior.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #000000;
                color: #00ffff;
                z-index: 2000;
                font-family: 'Orbitron', monospace;
                overflow-y: auto;
                animation: planetEnterSoft 2s ease-out;
            `;
            document.body.appendChild(planetInterior);
            
            // Add 3D planet viewer in the center
            const planetViewer = document.createElement('div');
            planetViewer.id = 'planet-viewer';
            planetViewer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                z-index: 2001;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: planetViewerAppear 1s ease-out 0.5s both;
                opacity: 0;
            `;
            planetInterior.appendChild(planetViewer);
            
            // Add planet rotation animation
            const planetRotation = document.createElement('div');
            planetRotation.id = 'planet-rotation';
            planetRotation.style.cssText = `
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, ${this.getPlanetColor(planetData.name)}, #000000);
                box-shadow: 
                    0 0 10px ${this.getPlanetColor(planetData.name)},
                    inset 0 0 10px rgba(0,0,0,0.5);
                animation: planetSpin 4s linear infinite;
                position: relative;
            `;
            planetViewer.appendChild(planetRotation);
            
            // Add planet glow effect
            const planetGlow = document.createElement('div');
            planetGlow.style.cssText = `
                position: absolute;
                top: -4px;
                left: -4px;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: radial-gradient(circle, ${this.getPlanetColor(planetData.name)}20, transparent 70%);
                animation: planetGlow 3s ease-in-out infinite alternate;
            `;
            planetRotation.appendChild(planetGlow);
            
            
            // Add CSS animation for soft entrance
            const style = document.createElement('style');
            style.textContent = `
                @keyframes planetEnterSoft {
                    0% { 
                        opacity: 0; 
                        transform: scale(0.3) rotateY(90deg) rotateX(20deg); 
                        filter: blur(10px);
                    }
                    50% { 
                        opacity: 0.7; 
                        transform: scale(0.8) rotateY(45deg) rotateX(10deg); 
                        filter: blur(5px);
                    }
                    100% { 
                        opacity: 1; 
                        transform: scale(1) rotateY(0deg) rotateX(0deg); 
                        filter: blur(0px);
                    }
                }
                .planet-content { 
                    padding: 50px; 
                    animation: contentSlideInSoft 2.5s ease-out 1s both; 
                    opacity: 0;
                }
                @keyframes contentSlideInSoft {
                    0% { 
                        opacity: 0; 
                        transform: translateY(100px) scale(0.9); 
                        filter: blur(5px);
                    }
                    50% { 
                        opacity: 0.5; 
                        transform: translateY(50px) scale(0.95); 
                        filter: blur(2px);
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                        filter: blur(0px);
                    }
                }
                .planet-header { text-align: center; margin-bottom: 40px; }
                .planet-title { 
                    font-size: 3em; 
                    color: #00ffff; 
                    text-shadow: 0 0 20px #00ffff; 
                    margin-bottom: 10px; 
                    animation: titleGlowSoft 3s ease-in-out infinite alternate; 
                }
                @keyframes titleGlowSoft {
                    from { 
                        text-shadow: 0 0 20px #00ffff; 
                        transform: scale(1);
                    }
                    to { 
                        text-shadow: 0 0 30px #00ffff, 0 0 40px #00ffff; 
                        transform: scale(1.02);
                    }
                }
                .planet-subtitle { 
                    font-size: 1.2em; 
                    color: #ffffff; 
                    opacity: 0.8; 
                    animation: subtitleFadeIn 2s ease-out 2s both;
                }
                @keyframes subtitleFadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 0.8; transform: translateY(0); }
                }
                .planet-section { 
                    margin: 30px 0; 
                    padding: 20px; 
                    background: rgba(0, 255, 255, 0.1); 
                    border-radius: 15px; 
                    border: 1px solid rgba(0, 255, 255, 0.3); 
                    animation: sectionFadeInSoft 1.5s ease-out both; 
                    opacity: 0;
                }
                .planet-section:nth-child(1) { animation-delay: 2.5s; }
                .planet-section:nth-child(2) { animation-delay: 2.7s; }
                .planet-section:nth-child(3) { animation-delay: 2.9s; }
                .planet-section:nth-child(4) { animation-delay: 3.1s; }
                @keyframes sectionFadeInSoft {
                    0% { 
                        opacity: 0; 
                        transform: translateX(-100px) scale(0.8); 
                        filter: blur(3px);
                    }
                    50% { 
                        opacity: 0.5; 
                        transform: translateX(-50px) scale(0.9); 
                        filter: blur(1px);
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateX(0) scale(1); 
                        filter: blur(0px);
                    }
                }
                .section-title { font-size: 1.5em; color: #ff00ff; margin-bottom: 15px; text-shadow: 0 0 10px #ff00ff; }
                .item-card { 
                    background: rgba(255, 255, 255, 0.05); 
                    padding: 15px; 
                    margin: 10px 0; 
                    border-radius: 10px; 
                    border-left: 3px solid #00ffff; 
                    transition: all 0.4s ease; 
                    transform: translateX(0);
                }
                .item-card:hover { 
                    background: rgba(0, 255, 255, 0.15); 
                    transform: translateX(15px) scale(1.02); 
                    box-shadow: 0 5px 20px rgba(0, 255, 255, 0.3);
                }
                .item-title { font-weight: bold; color: #ffffff; margin-bottom: 5px; }
                .item-detail { color: #cccccc; font-size: 0.9em; }
                .close-btn { 
                    position: fixed; 
                    top: 20px; 
                    right: 20px; 
                    background: rgba(255, 0, 0, 0.2); 
                    border: 2px solid #ff0000; 
                    color: #ff0000; 
                    padding: 15px; 
                    cursor: pointer; 
                    border-radius: 50%; 
                    font-family: 'Orbitron', monospace; 
                    transition: all 0.4s ease; 
                    width: 50px; 
                    height: 50px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 1.5em; 
                    font-weight: bold; 
                    animation: closeBtnAppear 1s ease-out 3.5s both;
                    opacity: 0;
                }
                .close-btn:hover { 
                    background: #ff0000; 
                    color: #fff; 
                    transform: scale(1.2) rotate(180deg); 
                    box-shadow: 0 0 30px rgba(255, 0, 0, 0.6); 
                }
                @keyframes closeBtnAppear {
                    from { 
                        opacity: 0; 
                        transform: scale(0) rotate(-180deg); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1) rotate(0deg); 
                    }
                }
                @keyframes planetViewerAppear {
                    from { 
                        opacity: 0; 
                        transform: translate(-50%, -50%) scale(0.5) rotateY(90deg); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translate(-50%, -50%) scale(1) rotateY(0deg); 
                    }
                }
                @keyframes planetSpin {
                    from { transform: rotateY(0deg) rotateX(15deg); }
                    to { transform: rotateY(360deg) rotateX(15deg); }
                }
                @keyframes planetGlow {
                    from { 
                        opacity: 0.3; 
                        transform: scale(1); 
                    }
                    to { 
                        opacity: 0.7; 
                        transform: scale(1.1); 
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Generate content based on planet type - positioned below the planet
        let content = `
            <div class="planet-content" style="margin-top: 150px;">
                <div class="planet-header">
                    <h1 class="planet-title">${planetData.name}</h1>
                    <p class="planet-subtitle">${planetData.description}</p>
                </div>
                <button class="close-btn" onclick="window.exitPlanet()" title="Dünyaya Geri Dön">✕</button>
        `;
        
        if (planetData.details && planetData.details.projects) {
            content += `
                <div class="planet-section">
                    <h2 class="section-title">🌟 Projelerim</h2>
                    ${planetData.details.projects.map(project => `
                        <div class="item-card">
                            <div class="item-title">${project.name}</div>
                            <div class="item-detail">🛠️ ${project.tech}</div>
                            <div class="item-detail">📅 ${project.year}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        if (planetData.details && planetData.details.experience) {
            content += `
                <div class="planet-section">
                    <h2 class="section-title">💼 Deneyimlerim</h2>
                    ${planetData.details.experience.map(exp => `
                        <div class="item-card">
                            <div class="item-title">${exp.position}</div>
                            <div class="item-detail">🏢 ${exp.company}</div>
                            <div class="item-detail">⏰ ${exp.duration}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        if (planetData.details && planetData.details.skills) {
            content += `
                <div class="planet-section">
                    <h2 class="section-title">⚡ Yeteneklerim</h2>
                    ${planetData.details.skills.map(skillGroup => `
                        <div class="item-card">
                            <div class="item-title">${skillGroup.category}</div>
                            <div class="item-detail">${skillGroup.skills.join(' • ')}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        if (planetData.details && planetData.details.contact) {
            content += `
                <div class="planet-section">
                    <h2 class="section-title">📞 İletişim</h2>
                    ${planetData.details.contact.map(contact => `
                        <div class="item-card">
                            <div class="item-title">${contact.icon} ${contact.type}</div>
                            <div class="item-detail">${contact.value}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        content += `</div>`;
        planetInterior.innerHTML = content;
        
        // Store original positions for exit animation
        planetInterior.originalCameraPos = originalCameraPos;
        planetInterior.originalTarget = originalTarget;
        
        // Add exit function to window
        window.exitPlanet = () => {
            this.exitPlanet(planetInterior);
        };
    }
    
    exitPlanet(planetInterior) {
        // Create exit animation
        const exitScreen = document.createElement('div');
        exitScreen.id = 'planet-exit';
        exitScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, #000000 0%, #1a1a2e 100%);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #00ffff;
            font-family: 'Orbitron', monospace;
            font-size: 2em;
            text-shadow: 0 0 20px #00ffff;
            animation: exitFadeIn 0.5s ease-out;
        `;
        exitScreen.innerHTML = `
            <div style="margin-bottom: 30px;">🚀</div>
            <div>Gezegenden ayrılıyor...</div>
            <div style="font-size: 0.5em; margin-top: 20px; opacity: 0.7;">Uzay boşluğuna geri dönülüyor</div>
        `;
        document.body.appendChild(exitScreen);
        
        // Add exit animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes exitFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Animate camera back to original position
        const duration = 2000; // 2 seconds
        const startTime = Date.now();
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const easedProgress = easeInOutCubic(progress);
            
            // Interpolate camera position
            this.camera.position.lerpVectors(startPos, planetInterior.originalCameraPos, easedProgress);
            this.controls.target.lerpVectors(startTarget, planetInterior.originalTarget, easedProgress);
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Animation complete - restore all elements
                this.restoreSceneElements();
                exitScreen.remove();
                planetInterior.remove();
                this.controls.enabled = true;
                delete window.exitPlanet;
            }
        };
        
        animate();
    }
    
    getPlanetColor(planetName) {
        const colors = {
            'Projelerim': '#224466',
            'Deneyimlerim': '#446688', 
            'Yeteneklerim': '#0088ff',
            'İletişim': '#ff6688'
        };
        return colors[planetName] || '#00ffff';
    }
    
    restoreSceneElements() {
        // Show all planets again
        this.planets.forEach(planet => {
            planet.visible = true;
        });
        
        // Show rings
        this.planetRings.forEach(ring => ring.visible = true);
        
        // Show avatar
        if (this.avatar) this.avatar.visible = true;
        
        // Show background elements
        if (this.starfield) this.starfield.visible = true;
        if (this.spaceBackground) this.spaceBackground.visible = true;
        if (this.nebulas) this.nebulas.forEach(nebula => nebula.visible = true);
    }
    
    updateCharacterMovement() {
        if (!this.avatarBody) {
    
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
                if (this.avatarBody.velocity.length() > 1.0) {
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
        // Animate starfield
        if (this.starfield) {
            this.starfield.rotation.y += 0.0001; // Very slowly rotate stars
        }
        
        // Animate space background
        if (this.spaceBackground) {
            this.spaceBackground.rotation.y += 0.0001; // Very slow rotation
            this.spaceBackground.position.y = 150 + Math.sin(this.time * 0.1) * 2; // Very gentle floating
        }
        
        // Animate nebulas
        if (this.nebulas) {
            this.nebulas.forEach((nebula, index) => {
                nebula.rotation.y += 0.0002 * (index + 1);
                nebula.material.opacity = 0.007 + Math.sin(this.time * 0.2 + index) * 0.007;
            });
        }
        
        // Animate planet rings
        this.planetRings.forEach((ring, index) => {
            ring.rotation.z += 0.005 * (index + 1); // Different rotation speeds
            ring.material.opacity = 0.2 + Math.sin(this.time * 1.5 + index) * 0.1;
        });
        
        // Animate planets
        this.planets.forEach((planet, index) => {
            // Planets stay in fixed positions on their rings - no movement
            // Only rotate around their own axis
            planet.rotation.y += 0.01;
            
            // No glow effects - keep original colors
        });
    }
}

// Initialize the application
new CVPortfolio();
