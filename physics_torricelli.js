// Physics Simulation: Torricelli's Law & Liquid Efflux
// v = sqrt(2gh), Jet Trajectory R = 2*sqrt(y*(H-y)), and Pippy the Penguin Jet Catcher

class TorricelliSimulation {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Physics parameters
    this.tankHeight = 5.0; // Total tank capacity (m)
    this.waterHeight = 4.2; // Current liquid surface height H (m)
    this.holeHeight = 2.1; // Orifice height y above base (m)
    this.gravity = 9.8; // g (m/s^2)
    this.liquidType = 'water';
    this.isOpen = true; // Orifice open / closed
    this.autoRefill = true;

    // 3D Objects
    this.tankGroup = null;
    this.waterMesh = null;
    this.waterTopCap = null;
    this.holeMesh = null;
    this.jetTube = null;
    this.splashParticles = [];
    this.rulerGroup = null;

    // Pippy Penguin character
    this.pippy = null;
    this.pippyX = 4.0;
    this.bucketSplashActive = false;

    this.initScene();
  }

  initScene() {
    // 1. Laboratory Floor & Ground Grid
    this.createFloorAndRuler();

    // 2. Water Tank & Orifice
    this.createTank();

    // 3. Pippy Penguin Character
    this.pippy = CartoonRenderer.buildPippyPenguin();
    this.pippy.position.set(4.0, 0, 0);
    this.group.add(this.pippy);

    // 4. Parabolic Water Jet Mesh
    this.createJetMesh();

    // 5. Splash Particles System
    this.createSplashParticles();
  }

  createFloorAndRuler() {
    // Ground Tile
    const floorGeo = new THREE.PlaneGeometry(24, 12);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(4, 0, 0);
    this.group.add(floor);

    // Grid helper
    const grid = new THREE.GridHelper(24, 24, 0x38bdf8, 0x1e293b);
    grid.position.set(4, 0.01, 0);
    this.group.add(grid);

    // Laboratory Measurement Ruler on Ground
    this.rulerGroup = new THREE.Group();
    this.rulerGroup.position.set(0, 0.02, 1.2);

    const rulerBarGeo = new THREE.BoxGeometry(10, 0.02, 0.3);
    const rulerBarMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const rulerBar = new THREE.Mesh(rulerBarGeo, rulerBarMat);
    rulerBar.position.x = 5.0;
    this.rulerGroup.add(rulerBar);

    // Meter tick marks
    for (let m = 0; m <= 10; m++) {
      const tickGeo = new THREE.BoxGeometry(0.04, 0.03, 0.4);
      const tickMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(m, 0.01, 0);
      this.rulerGroup.add(tick);
    }

    this.group.add(this.rulerGroup);
  }

  createTank() {
    this.tankGroup = new THREE.Group();
    const tankR = 1.3;
    const h = this.tankHeight;

    // Transparent Glass Cylinder
    const glassGeo = new THREE.CylinderGeometry(tankR, tankR, h, 32, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      transmission: 0.7,
      ior: 1.33
    });
    const tankGlass = new THREE.Mesh(glassGeo, glassMat);
    tankGlass.position.y = h / 2;
    this.tankGroup.add(tankGlass);

    // Tank Base
    const baseGeo = new THREE.CylinderGeometry(tankR + 0.1, tankR + 0.1, 0.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.1;
    this.tankGroup.add(base);

    // Graduated Height Markers on Tank
    for (let y = 1; y <= 5; y++) {
      const ringGeo = new THREE.TorusGeometry(tankR + 0.01, 0.02, 6, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      this.tankGroup.add(ring);
    }

    // Water Column Mesh inside
    const waterGeo = new THREE.CylinderGeometry(tankR - 0.02, tankR - 0.02, 1.0, 32);
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.68,
      roughness: 0.1,
      metalness: 0.1
    });
    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMat);
    this.waterMesh.position.y = 0.5;
    this.tankGroup.add(this.waterMesh);

    // Top surface disk with caustics
    const capGeo = new THREE.CircleGeometry(tankR - 0.02, 32);
    this.waterTopCap = new THREE.Mesh(capGeo, this.waterMat);
    this.waterTopCap.rotation.x = -Math.PI / 2;
    this.tankGroup.add(this.waterTopCap);

    // Puncture Hole / Orifice Valve
    const holeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 16);
    const holeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7 });
    this.holeMesh = new THREE.Mesh(holeGeo, holeMat);
    this.holeMesh.rotation.z = Math.PI / 2;
    this.holeMesh.position.set(tankR + 0.1, this.holeHeight, 0);
    this.tankGroup.add(this.holeMesh);

    this.group.add(this.tankGroup);
    this.updateWaterLevelMesh();
  }

  createJetMesh() {
    this.jetCurvePoints = [];
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.4, this.holeHeight, 0),
      new THREE.Vector3(2.5, this.holeHeight * 0.8, 0),
      new THREE.Vector3(4.0, 0, 0)
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.07, 10, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.1
    });
    this.jetTube = new THREE.Mesh(tubeGeo, tubeMat);
    this.group.add(this.jetTube);
  }

  createSplashParticles() {
    const pCount = 60;
    const pGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });

    for (let i = 0; i < pCount; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      p.visible = false;
      p.userData = {
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0
      };
      this.group.add(p);
      this.splashParticles.push(p);
    }
  }

  updateWaterLevelMesh() {
    if (!this.waterMesh || !this.waterTopCap) return;
    const h = Math.max(0.05, this.waterHeight);
    this.waterMesh.scale.y = h;
    this.waterMesh.position.y = h / 2;
    this.waterTopCap.position.y = h;

    if (this.holeMesh) {
      const tankR = 1.3;
      this.holeMesh.position.set(tankR + 0.1, this.holeHeight, 0);
    }
  }

  setLiquid(type) {
    this.liquidType = type;
    if (type === 'water') {
      this.waterMat.color.setHex(0x0284c7);
      CartoonRenderer.showSpeechBubble("Professor Torricelli", "Pure Water! Density = 1000 kg/m³. Clean and fast efflux!", "💧");
    } else if (type === 'honey') {
      this.waterMat.color.setHex(0xd97706);
      CartoonRenderer.showSpeechBubble("Professor Torricelli", "Golden Honey! Torricelli's speed is independent of density in ideal fluids!", "🍯");
    } else if (type === 'mercury') {
      this.waterMat.color.setHex(0x94a3b8);
      CartoonRenderer.showSpeechBubble("Professor Torricelli", "Liquid Mercury! Torricelli invented the mercury barometer in 1643!", "⚗️");
    }
  }

  catchJetWithPenguin() {
    // Range formula: R = 2 * sqrt(y * (H - y))
    const H = this.waterHeight;
    const y = this.holeHeight;
    if (y >= H || !this.isOpen) {
      CartoonRenderer.showSpeechBubble("Pippy Penguin", "There is no water coming out right now! Make sure the hole is below the water level!", "🐧");
      return;
    }

    const range = 2 * Math.sqrt(y * (H - y));
    const landingX = 1.4 + range;
    this.pippy.userData.targetX = landingX - 0.45; // Place bucket right at jet landing

    window.soundSynth.playPop();
    CartoonRenderer.showSpeechBubble(
      "Pippy Penguin",
      `Waddling over to X = ${(landingX).toFixed(2)}m to catch the water in my bucket! Go Torricelli!`,
      "🐧"
    );
  }

  update(dt) {
    dt = Math.min(dt, 0.05);

    const H = this.waterHeight;
    const y = this.holeHeight;
    const tankR = 1.4;

    // Check if water is draining
    const depthAboveHole = H - y;
    const hasJet = this.isOpen && depthAboveHole > 0;

    if (hasJet) {
      // Torricelli Velocity: v = sqrt(2 * g * h)
      const v = Math.sqrt(2 * this.gravity * depthAboveHole);
      // Time of flight: t_land = sqrt(2 * y / g)
      const tLand = Math.sqrt((2 * y) / this.gravity);
      // Horizontal Range: R = v * t_land = 2 * sqrt(y * (H - y))
      const range = v * tLand;
      const landingX = tankR + range;

      // Update 3D Jet Tube Mesh
      const points = [];
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * tLand;
        const px = tankR + v * t;
        const py = Math.max(0.02, y - 0.5 * this.gravity * t * t);
        points.push(new THREE.Vector3(px, py, 0));
      }

      if (this.jetTube) {
        this.jetTube.geometry.dispose();
        const curve = new THREE.CatmullRomCurve3(points);
        this.jetTube.geometry = new THREE.TubeGeometry(curve, 32, 0.065, 8, false);
        this.jetTube.visible = true;
      }

      // Splash droplets at landing point
      const bucketX = this.pippy ? this.pippy.position.x + 0.45 : 999;
      const isHittingBucket = Math.abs(landingX - bucketX) < 0.35;

      const splashOriginY = isHittingBucket ? 0.35 : 0.05;
      const splashOriginX = isHittingBucket ? bucketX : landingX;

      // Emit splash particles
      for (let i = 0; i < 2; i++) {
        const p = this.splashParticles.find(sp => !sp.visible);
        if (p) {
          p.visible = true;
          p.position.set(
            splashOriginX + (Math.random() - 0.5) * 0.1,
            splashOriginY,
            (Math.random() - 0.5) * 0.1
          );
          p.userData.vx = (Math.random() - 0.5) * 2.5;
          p.userData.vy = 2.0 + Math.random() * 2.5;
          p.userData.vz = (Math.random() - 0.5) * 2.5;
          p.userData.life = 0.5;
        }
      }

      // Sound and penguin reaction
      if (isHittingBucket && !this.bucketSplashActive) {
        this.bucketSplashActive = true;
        window.soundSynth.playSplash();
        if (this.pippy) {
          this.pippy.userData.waterFill = Math.min(1.0, this.pippy.userData.waterFill + 0.05);
          CartoonRenderer.showSpeechBubble(
            "Pippy Penguin",
            "SPLASH! Bullseye! Torricelli's range equation $R = 2\\sqrt{y(H-y)}$ predicted the exact landing spot!",
            "🎉"
          );
        }
      } else if (!isHittingBucket) {
        this.bucketSplashActive = false;
      }

      // Slowly drain if auto-refill is disabled
      if (!this.autoRefill && this.waterHeight > y) {
        // Continuity discharge: dH/dt = - (A_hole / A_tank) * v
        const aRatio = 0.0008;
        this.waterHeight -= aRatio * v * dt;
        this.updateWaterLevelMesh();
      }

    } else {
      if (this.jetTube) this.jetTube.visible = false;
      this.bucketSplashActive = false;
    }

    // Update Splash Particles
    this.splashParticles.forEach(p => {
      if (p.visible) {
        p.userData.life -= dt;
        p.userData.vy -= 9.8 * dt;
        p.position.x += p.userData.vx * dt;
        p.position.y += p.userData.vy * dt;
        p.position.z += p.userData.vz * dt;

        if (p.position.y < 0.02 || p.userData.life <= 0) {
          p.visible = false;
        }
      }
    });

    // Animate Pippy Penguin Waddling
    if (this.pippy) {
      const u = this.pippy.userData;
      if (Math.abs(this.pippy.position.x - u.targetX) > 0.05) {
        const dir = Math.sign(u.targetX - this.pippy.position.x);
        this.pippy.position.x += dir * dt * 2.5;

        // Waddling rotation & flipper flap
        u.waddlePhase += dt * 10;
        this.pippy.rotation.z = Math.sin(u.waddlePhase) * 0.15;
        u.leftFlipper.rotation.z = 0.25 + Math.sin(u.waddlePhase) * 0.3;
        u.rightFlipper.rotation.z = -0.25 - Math.sin(u.waddlePhase) * 0.3;
      } else {
        this.pippy.rotation.z = 0;
      }

      // Sloshing water inside bucket
      if (u.bucketWater) {
        u.bucketWater.position.y = -0.1 + u.waterFill * 0.2;
        u.bucketWater.scale.set(u.waterFill * 0.8 + 0.2, u.waterFill * 0.8 + 0.2, 1);
      }
    }
  }

  getCalculations() {
    const H = this.waterHeight;
    const y = this.holeHeight;
    const depthAbove = Math.max(0, H - y);
    const v = depthAbove > 0 ? Math.sqrt(2 * this.gravity * depthAbove) : 0;
    const tLand = Math.sqrt((2 * y) / this.gravity);
    const range = 2 * Math.sqrt(y * depthAbove);
    const maxRange = H; // Max range always equals H when y = H/2

    const isMax = Math.abs(y - H / 2) < 0.15;
    const rangeLabel = isMax ? `<span style="color:#10b981;font-weight:700">${range.toFixed(2)} m (MAX!)</span>` : `${range.toFixed(2)} m`;

    return {
      formula: `v = \\sqrt{2gh}, \\quad R = 2\\sqrt{y(H - y)}`,
      values: [
        { label: "Water Level (H)", val: `${H.toFixed(2)} m` },
        { label: "Orifice Height (y)", val: `${y.toFixed(2)} m` },
        { label: "Water Head (h = H-y)", val: `${depthAbove.toFixed(2)} m` },
        { label: "Efflux Velocity (v)", val: `<span style="color:#38bdf8;font-weight:700">${v.toFixed(2)} m/s</span>` },
        { label: "Horizontal Range (R)", val: rangeLabel },
        { label: "Max Possible Range", val: `${maxRange.toFixed(2)} m (at y=${(H / 2).toFixed(2)}m)` }
      ]
    };
  }

  destroy() {
    this.scene.remove(this.group);
  }
}

window.TorricelliSimulation = TorricelliSimulation;
