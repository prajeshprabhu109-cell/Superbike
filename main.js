import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, currentBike, dealer, controls;
const loader = new GLTFLoader();

// Bike database for switching logic
const bikeList = [
    { id: 'kawazx', name: 'Kawasaki Ninja H2R', brand: 'KAWASAKI', rank: '1827' },
    { id: 'duc', name: 'Ducati Panigale V4', brand: 'DUCATI', rank: '1750' },
    { id: 'ninku', name: 'Ninku Shadow', brand: 'AEVITH', rank: '1600' },
    { id: 'kawani', name: 'Kawasaki ZX-10R', brand: 'KAWASAKI', rank: '1800' }
];
let currentIndex = 0;

function init() {
    scene = new THREE.Scene();

    // 1. ENVIRONMENT (Using your local bg.jpg)
    new THREE.TextureLoader().load('bg.jpg', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
    });

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(6, 2.5, 9);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // 2. CONTROLS (Anchored to the bike platform)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.8, 0); // Focus strictly on the center

    // 3. LIGHTING
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const topLight = new THREE.SpotLight(0xffffff, 80);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    // 4. NEON RING
    const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.4, 2.6, 128),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05;
    scene.add(ring);

    // 5. STATIC DEALER (Loaded once, never moved)
    loader.load('dealer.glb', (gltf) => {
        dealer = gltf.scene;
        // Positioned back and to the left
        dealer.position.set(-4.5, 0, -2.5);
        dealer.rotation.y = Math.PI / 3.5;
        dealer.scale.set(1.5, 1.5, 1.5);
        scene.add(dealer);
    });

    loadBike(currentIndex);
    animate();
    document.getElementById('loading-overlay').style.display = 'none';
}

// 6. SWAP BIKE LOGIC (Only touches the bike, not the dealer)
window.loadBike = function(index) {
    currentIndex = index;
    const data = bikeList[currentIndex];

    // UI Updates
    document.getElementById('bike-name').innerText = data.name;
    document.querySelector('.brand').innerText = data.brand;
    document.getElementById('rank-val').innerText = data.rank;

    if (currentBike) scene.remove(currentBike);

    loader.load(`${data.id}.glb`, (gltf) => {
        currentBike = gltf.scene;
        const box = new THREE.Box3().setFromObject(currentBike);
        const size = box.getSize(new THREE.Vector3()).length();
        const scale = 6 / size;

        currentBike.scale.set(scale, scale, scale);
        currentBike.position.set(0, -box.min.y * scale, 0);

        currentBike.traverse((n) => {
            if (n.isMesh) {
                n.material.metalness = 0.9;
                n.material.roughness = 0.1;
            }
        });
        scene.add(currentBike);
    });
};

// Global Nav Handlers
window.nextBike = () => { currentIndex = (currentIndex + 1) % bikeList.length; loadBike(currentIndex); };
window.prevBike = () => { currentIndex = (currentIndex - 1 + bikeList.length) % bikeList.length; loadBike(currentIndex); };
window.loadBikeByID = (id) => {
    const idx = bikeList.findIndex(b => b.id === id);
    if(idx !== -1) loadBike(idx);
};

// Sound Logic
window.playEngineSound = function() {
    const audio = document.getElementById('engine-audio');
    if(audio) {
        audio.currentTime = 0;
        audio.play();
    }
};

function animate() {
    requestAnimationFrame(animate);
    if(controls) controls.update();
    renderer.render(scene, camera);
}

init();