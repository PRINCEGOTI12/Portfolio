/* ============================================================
   Hero 3D Background — Electric Ocean Crystal (CENTER)
   Physics: Spring / Hooke's Law  F = -k·x  with damping
   ─────────────────────────────────────────────────────────────
   Crystal sits in the CENTER of the hero.
   Mouse movement drives a spring-physics system:
     · Stiffness  k  → restoring force
     · Damping    c  → friction (prevents infinite oscillation)
     · Mass       m  → inertia (overshoot + settle)
   Result: buttery, physical, overshoot-then-settle motion.
   ============================================================ */

(function () {
  'use strict';

  if (!document.getElementById('hero')) return;

  /* ── Canvas ─────────────────────────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const heroSection = document.getElementById('hero');
  heroSection.style.position = 'relative';
  heroSection.insertBefore(canvas, heroSection.firstChild);

  /* ── Wait for Three.js ───────────────────────────────── */
  function waitForThree(cb, n) {
    n = n || 0;
    if (typeof THREE !== 'undefined') { cb(); return; }
    if (n > 80) return;
    setTimeout(function () { waitForThree(cb, n + 1); }, 50);
  }
  waitForThree(initScene);

  /* ══════════════════════════════════════════════════════
     SPRING PHYSICS HELPER
     Each axis tracked independently:
       a  = F / m = (-k · displacement  -  c · velocity) / m
       v += a · dt
       x += v · dt
  ══════════════════════════════════════════════════════ */
  function SpringAxis(k, c, m) {
    this.k    = k;   // stiffness   (Hooke constant)
    this.c    = c;   // damping     (friction coeff)
    this.m    = m;   // mass        (inertia)
    this.pos  = 0;   // current displacement
    this.vel  = 0;   // current velocity
    this.target = 0; // desired position
  }
  SpringAxis.prototype.update = function (dt) {
    const disp  = this.pos - this.target;        // x from rest
    const force = -this.k * disp - this.c * this.vel; // Hooke + damping
    const accel = force / this.m;
    this.vel   += accel * dt;
    this.pos   += this.vel  * dt;
  };

  /* ══════════════════════════════════════════════════════
     SCENE INITIALISATION
  ══════════════════════════════════════════════════════ */
  function initScene() {
    const isLight = document.documentElement.classList.contains('light-theme');

    let W = heroSection.offsetWidth;
    let H = heroSection.offsetHeight || window.innerHeight;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    /* ── Scene & Camera ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0, 6);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.20));

    const keyLight = new THREE.DirectionalLight(0x06b6d4, 2.2);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x10b981, 1.4);
    fillLight.position.set(4, -2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x22d3ee, 3.0, 18);
    rimLight.position.set(-4, 3, -2);
    scene.add(rimLight);

    /* ── Crystal geometry ── */
    // Outer wireframe shell
    const wireGeo = new THREE.IcosahedronGeometry(1.42, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: isLight ? 0x0891b2 : 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.30,   // fixed at 0.30 — both themes
    });

    // Solid semi-transparent body
    const solidGeo = new THREE.IcosahedronGeometry(1.36, 1);
    const solidMat = new THREE.MeshPhongMaterial({
      color:            isLight ? 0xd0f4f0 : 0x031820,
      emissive:         0x06b6d4,
      emissiveIntensity: isLight ? 0.04 : 0.10,
      shininess:        120,
      specular:         new THREE.Color(0x34d399),
      transparent:      true,
      opacity:          0.12,   // very subtle fill — text stays readable
      side:             THREE.DoubleSide,
    });

    // Glowing inner core
    const coreGeo = new THREE.IcosahedronGeometry(0.52, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color:       0x06b6d4,
      transparent: true,
      opacity:     0.12,   // subtle core glow
    });

    // Secondary tiny orbiting crystal
    const miniGeo = new THREE.OctahedronGeometry(0.30, 0);
    const miniMat = new THREE.MeshBasicMaterial({
      color:       isLight ? 0x0ea5e9 : 0x34d399,
      wireframe:   true,
      transparent: true,
      opacity:     0.28,   // small accent, kept light
    });

    const wire  = new THREE.Mesh(wireGeo,  wireMat);
    const solid = new THREE.Mesh(solidGeo, solidMat);
    const core  = new THREE.Mesh(coreGeo,  coreMat);
    const mini  = new THREE.Mesh(miniGeo,  miniMat);

    /* Crystal group — positioned in the CENTER */
    const crystal = new THREE.Group();
    crystal.add(solid, wire, core);
    crystal.position.set(0, 0.0, 0); // ← CENTER
    scene.add(crystal);

    /* Mini crystal orbits the main one in world space */
    mini.position.set(1.5, 1.1, 0.4);
    scene.add(mini);

    /* ── Accent orbs (center cluster) ── */
    const orbData = [
      { r: 0.14, base: [1.4,  1.6, -0.8], color: 0x10b981, opacity: 0.40 },
      { r: 0.09, base: [-1.4,  2.0, -0.4], color: 0x06b6d4, opacity: 0.50 },
      { r: 0.11, base: [1.6, -1.2,  0.3], color: 0x0ea5e9, opacity: 0.35 },
    ];
    const orbs = orbData.map(function (d) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(d.r, 12, 12),
        new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: d.opacity })
      );
      mesh.position.set(...d.base);
      scene.add(mesh);
      return mesh;
    });

    /* ═══════════════════════════════════════════════════
       SPRING PHYSICS SETUP
       Two independent spring axes for X and Y rotation tilt.
       Camera parallax also uses springs.
       ─────────────────────────────────────────────────
       Tuning guide:
         k  ↑  → snappier response
         c  ↑  → more damping (less bounce)
         m  ↑  → heavier / more overshoot
    ═══════════════════════════════════════════════════ */
    const SPRING_K = 4.5;    // stiffness
    const SPRING_C = 3.2;    // damping
    const SPRING_M = 1.0;    // mass

    const springRotX  = new SpringAxis(SPRING_K, SPRING_C, SPRING_M);
    const springRotY  = new SpringAxis(SPRING_K, SPRING_C, SPRING_M);
    const springCamX  = new SpringAxis(2.5, 2.8, 1.0);
    const springCamY  = new SpringAxis(2.5, 2.8, 1.0);

    /* ── Raw mouse normalised [-1,+1] ── */
    const mouse = { x: 0, y: 0 };
    document.addEventListener('mousemove', function (e) {
      mouse.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2; // invert Y
    });

    /* ── Resize ── */
    window.addEventListener('resize', function () {
      W = heroSection.offsetWidth;
      H = heroSection.offsetHeight || window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    });

    /* ═══════════════════════════════════════════════════
       ANIMATION LOOP
    ═══════════════════════════════════════════════════ */
    const MAX_TILT_RAD = 0.38;   // max rotation from mouse (radians)
    const CAM_PX       = 0.30;   // max camera X shift
    const CAM_PY       = 0.18;   // max camera Y shift
    const FLOAT_AMP    = 0.14;   // sinusoidal bob amplitude
    const FLOAT_FREQ   = 0.45;   // bob frequency (rad/s)
    const SPIN_Y       = 0.0025; // base auto-spin
    const SPIN_X       = 0.0008;

    let baseRotY = 0;
    let baseRotX = 0;
    let t = 0;
    let last = performance.now();

    function animate(now) {
      requestAnimationFrame(animate);

      /* ── Delta time (capped at 50ms to avoid spiral of death) ── */
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t   += dt;

      /* ── Set spring targets from mouse ── */
      springRotX.target = mouse.y * MAX_TILT_RAD;  // tilt up/down
      springRotY.target = mouse.x * MAX_TILT_RAD;  // tilt left/right
      springCamX.target = mouse.x * CAM_PX;
      springCamY.target = mouse.y * CAM_PY;

      /* ── Integrate spring physics ── */
      springRotX.update(dt);
      springRotY.update(dt);
      springCamX.update(dt);
      springCamY.update(dt);

      /* ── Auto base spin accumulation ── */
      baseRotY += SPIN_Y;
      baseRotX += SPIN_X;

      /* ── Apply to crystal ── */
      //  Base spin  +  spring-driven mouse tilt
      crystal.rotation.y = baseRotY + springRotY.pos;
      crystal.rotation.x = baseRotX + springRotX.pos;

      /* ── Sinusoidal float ── */
      crystal.position.y = Math.sin(t * FLOAT_FREQ) * FLOAT_AMP;

      /* ── Mini crystal orbit ── */
      const orbitR = 1.65;
      mini.position.x = crystal.position.x + Math.cos(t * 0.55) * orbitR;
      mini.position.y = crystal.position.y + Math.sin(t * 0.55) * orbitR * 0.6;
      mini.rotation.y += 0.025;
      mini.rotation.z += 0.015;

      /* ── Accent orbs gentle wander ── */
      orbs.forEach(function (orb, i) {
        const s = t * (0.28 + i * 0.12) + i * 2.09;
        orb.position.x = orbData[i].base[0] + Math.sin(s)        * 0.20;
        orb.position.y = orbData[i].base[1] + Math.cos(s * 0.65) * 0.16;
      });

      /* ── Camera parallax (spring-driven, smooth) ── */
      camera.position.x = springCamX.pos;
      camera.position.y = springCamY.pos;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
  }
})();
