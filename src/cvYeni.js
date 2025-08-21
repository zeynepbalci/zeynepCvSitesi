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
        this.characterSpeed = 4.8; // 2x more faster movement
        this.characterRotationSpeed = 0.05;
        this.cameraFollowMode = true; // Camera follows avatar by default
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupPhysics();
        this.createFloor();
        this.setupLighting();
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
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
        
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
        this.renderer.setClearColor(0x87CEEB);
        
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
    
    createFloor() {
        const floorGeometry = new THREE.BoxGeometry(
            this.floorWidth,
            2,
            this.floorDepth
        );
        
        const floorMaterial = new THREE.MeshLambertMaterial({
            color: 0x228B22, // Forest green
            transparent: true,
            opacity: 0.8
        });
        
        const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
        floorMesh.position.y = 2; // Much higher floor
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
        
        floorBody.position.set(0, 2, 0); // Much higher floor physics
        this.world.addBody(floorBody);
        
        this.floor = {
            mesh: floorMesh,
            body: floorBody,
            name: 'CV Portfolio - Zeynep Balci'
        };
    }
    
    createStairs() {
        // Create stairs between floors
        for (let i = 0; i < 5; i++) {
            const stairGeometry = new THREE.BoxGeometry(4, 2, 8);
            const stairMaterial = new THREE.MeshLambertMaterial({
                color: 0x8B4513 // Brown wood color
            });
            
            const stairs = new THREE.Mesh(stairGeometry, stairMaterial);
            stairs.position.set(50, i * this.floorHeight + 10, 0); // Moved to edge of wider floor
            stairs.castShadow = true;
            stairs.receiveShadow = true;
            this.scene.add(stairs);
            
            // Physics for stairs
            const stairShape = new CANNON.Box(new CANNON.Vec3(2, 1, 4));
            const stairBody = new CANNON.Body({
                mass: 0,
                shape: stairShape
            });
            stairBody.position.set(50, i * this.floorHeight + 10, 0);
            this.world.addBody(stairBody);
        }
    }
    
    setupLighting() {
        // Ambient light - brighter for natural theme
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Single point light for the floor
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 80);
        pointLight.position.set(0, 20, 0);
        this.scene.add(pointLight);
    }
    
    loadAvatar() {
        const loader = new GLTFLoader();
        
        // Try to load avatar.glb from desktop
        loader.load(
            '/avatar.glb', // We'll need to copy this file to public folder
            (gltf) => {
                this.avatar = gltf.scene;
                this.avatar.scale.set(8, 8, 8); // Bigger avatar
                this.avatar.position.set(0, 4, -10); // On top of ground
                this.avatar.castShadow = true;
                this.scene.add(this.avatar);
                
                // Avatar physics body - now movable
                const avatarShape = new CANNON.Sphere(3);
                this.avatarBody = new CANNON.Body({
                    mass: 1, // Now has mass for movement
                    shape: avatarShape
                });
                this.avatarBody.position.set(0, 4, -10); // On top of ground
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
        // Create avatar with legs
        this.avatar = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.SphereGeometry(4, 32, 32);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4169E1 // Blue color
        });
        this.avatarBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.avatarBody.position.y = 4;
        this.avatar.add(this.avatarBody);
        
        // Left leg
        const legGeometry = new THREE.CylinderGeometry(1, 1, 6, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x2E5A88 // Darker blue
        });
        this.leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.leftLeg.position.set(-1.5, -1, 0);
        this.avatar.add(this.leftLeg);
        
        // Right leg
        this.rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        this.rightLeg.position.set(1.5, -1, 0);
        this.avatar.add(this.rightLeg);
        
        this.avatar.position.set(0, 4, -10); // On top of ground
        this.avatar.castShadow = true;
        this.scene.add(this.avatar);
        
        // Avatar physics body - now movable
        const avatarShape = new CANNON.Sphere(3);
        this.avatarBody = new CANNON.Body({
            mass: 1, // Now has mass for movement
            shape: avatarShape
        });
        this.avatarBody.position.set(0, 4, -10); // On top of ground
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
        
        // Update camera and controls
        this.updateCamera();
        this.controls.update();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application
new CVPortfolio();
