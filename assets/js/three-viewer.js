/* ============================================================
   Prince Goti - Portfolio 3D Three.js Viewer
   Loads and renders avatar.glb with high fidelity
   ============================================================ */

class ThreeGLBViewer {
  constructor(containerId, modelPath) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.modelPath = modelPath;
    this.init();
  }
  
  init() {
    // 1. Get container dimensions
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 320;

    // 2. Scene
    this.scene = new THREE.Scene();

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    
    // 4. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Tone mapping and colors for premium visual fidelity
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    
    // Add canvas to container
    const canvas = this.renderer.domElement;
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 0.8s ease';
    this.container.appendChild(canvas);

    // 5. Controls
    this.controls = new THREE.OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = false; // Disable zoom so it doesn't hijack scroll
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.minPolarAngle = Math.PI / 3; // Prevent looking completely from top/bottom
    this.controls.maxPolarAngle = Math.PI / 1.7;

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Fill Light (Soft cool light)
    const fillLight = new THREE.DirectionalLight(0xe5dbff, 0.7);
    fillLight.position.set(-6, 5, -3);
    this.scene.add(fillLight);

    // Rim Light (Highlight silhouette from back-right)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(2, 6, -8);
    this.scene.add(rimLight);

    // 7. Load GLB Model
    const loader = new THREE.GLTFLoader();
    
    // Setup Meshopt Decoder
    if (typeof MeshoptDecoder !== 'undefined') {
      loader.setMeshoptDecoder(MeshoptDecoder);
    } else {
      console.warn("MeshoptDecoder is not available. GLB model might fail to load.");
    }

    loader.load(
      this.modelPath,
      (gltf) => {
        const model = gltf.scene;
        
        // Traverse model to configure shadows and material properties
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              // Enhance shading properties
              child.material.roughness = Math.max(child.material.roughness, 0.35);
              child.material.metalness = Math.min(child.material.metalness, 0.7);
            }
          }
        });

        // Rotate model to face front by default
        model.rotation.y = Math.PI;

        this.scene.add(model);

        // Center and frame model perfectly
        this.fitCameraToModel(model);

        // Hide loader overlay and reveal canvas
        const loaderEl = this.container.querySelector('.viewer-loader');
        if (loaderEl) {
          loaderEl.style.opacity = '0';
          setTimeout(() => loaderEl.remove(), 800);
        }
        canvas.style.opacity = '1';
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          const loaderProgress = this.container.querySelector('.loader-progress');
          if (loaderProgress) {
            loaderProgress.textContent = `${percent}%`;
          }
        }
      },
      (error) => {
        console.error('Three.js: Error loading GLB avatar model:', error);
        const loaderEl = this.container.querySelector('.viewer-loader');
        if (loaderEl) {
          loaderEl.innerHTML = '<span class="loader-error">⚠️ Failed to load 3D scene</span>';
        }
      }
    );

    // 8. Handle Resizing with ResizeObserver
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    // 9. Start Rendering Loop
    this.animate();
  }

  fitCameraToModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Center model's center-of-gravity at the scene's origin (0, 0, 0)
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);

    // Make OrbitControls target center of rotation
    this.controls.target.set(0, 0, 0);

    // Calculate camera distance based on bounding box dimension
    const maxDim = Math.max(size.x, size.y, size.z);
    const cameraDistance = maxDim * 1.3;
    
    // Position camera slightly elevated
    this.camera.position.set(0, 0.1, cameraDistance);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  handleResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 320;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  new ThreeGLBViewer('hero-3d-container', 'assets/images/avatar.glb');
  new ThreeGLBViewer('about-3d-container', 'assets/images/avatar.glb');
});
