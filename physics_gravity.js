// Physics Simulation: Gravitation & Orbital Mechanics
// Newton's Universal Law of Gravitation, Newton's Cannonball, and Spacetime Curvature

class GravitySimulation {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Physics parameters
    this.G = 1.0; // Scaled gravitational constant
    this.planetMass = 100.0;
    this.planetRadius = 3.6;
    this.launchSpeed = 4.5;
    this.mountainHeight = 0.9;
    this.airResistance = 0.0;
    this.currentBody = 'earth';

    // Cannonball state
    this.ball = null;
    this.ballVel = new THREE.Vector3();
    this.ballActive = false;
    this.orbitTrail = [];
    this.trailLine = null;
    this.trailGeom = null;
    this.maxTrailPoints = 350;

    // Apple drop state
    this.apple = null;
    this.appleActive = false;
    this.applePos = new THREE.Vector3();
    this.appleVel = 0;

    // Cartoon Newton reference
    this.newton = null;

    // Spacetime grid
    this.spacetimeGrid = null;
    this.showSpacetime = true;

    this.initScene();
  }

  initScene() {
    // 1. Spacetime Curvature Grid (Einstein/Newton gravity well)
    this.createSpacetimeGrid();

    // 2. Central Planet (Cartoon Earth / Moon / Sun)
    this.createPlanet();

    // 3. Mountain & Cartoon Cannon
    this.createMountainAndCannon();

    // 4. Sir Isaac Newton Cartoon Character
    this.newton = CartoonRenderer.buildNewton();
    // Position Newton on the mountain next to the cannon
    const mountR = this.planetRadius + this.mountainHeight;
    this.newton.position.set(0, mountR - 0.2, 0.4);
    this.newton.scale.set(0.65, 0.65, 0.65);
    this.group.add(this.newton);

    // 5. Cannonball object
    const ballGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2
    });
    this.ball = new THREE.Mesh(ballGeo, ballMat);
    this.ball.visible = false;
    this.group.add(this.ball);

    // 6. Glowing Orbit Trail
    const maxPoints = this.maxTrailPoints;
    const positions = new Float32Array(maxPoints * 3);
    this.trailGeom = new THREE.BufferGeometry();
    this.trailGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      transparent: true,
      opacity: 0.85
    });
    this.trailLine = new THREE.Line(this.trailGeom, trailMat);
    this.group.add(this.trailLine);

    // 7. Apple Drop Object
    const appleGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const appleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    this.apple = new THREE.Mesh(appleGeo, appleMat);
    this.apple.visible = false;
    this.group.add(this.apple);

    // Background Stars / Nebulae
    this.createCosmicBackground();
  }

  createSpacetimeGrid() {
    const size = 30;
    const segments = 50;
    const gridGeo = new THREE.PlaneGeometry(size, size, segments, segments);
    gridGeo.rotateX(-Math.PI / 2);

    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x312e81,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    this.spacetimeGrid = new THREE.Mesh(gridGeo, gridMat);
    this.spacetimeGrid.position.y = -4.5;
    this.group.add(this.spacetimeGrid);
    this.updateSpacetimeDeformation();
  }

  updateSpacetimeDeformation() {
    if (!this.spacetimeGrid) return;
    const pos = this.spacetimeGrid.geometry.attributes.position;
    const G = this.G;
    const M = this.planetMass;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      // Gravitational potential well: V = -GM / (r + eps)
      const depth = - (M * 0.04) / Math.max(dist, 1.8);
      pos.setY(i, depth);
    }
    pos.needsUpdate = true;
    this.spacetimeGrid.visible = this.showSpacetime;
  }

  createPlanet() {
    this.planetGroup = new THREE.Group();

    // Planet sphere (Earth cartoon style)
    const sphereGeo = new THREE.SphereGeometry(this.planetRadius, 32, 32);
    this.planetMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Ocean blue
      roughness: 0.6,
      metalness: 0.1
    });
    this.planetMesh = new THREE.Mesh(sphereGeo, this.planetMat);
    this.planetGroup.add(this.planetMesh);

    // Cartoon Continents / Landmasses (green bumps)
    const landMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
    const continents = [
      { lat: 0.4, lon: 0.5, r: 1.2 },
      { lat: -0.3, lon: 1.8, r: 1.5 },
      { lat: 0.6, lon: -1.2, r: 1.3 },
      { lat: -0.5, lon: -0.8, r: 1.1 },
      { lat: 0.1, lon: 2.7, r: 1.0 }
    ];

    continents.forEach(c => {
      const landGeo = new THREE.SphereGeometry(c.r, 14, 14);
      const land = new THREE.Mesh(landGeo, landMat);
      const x = Math.cos(c.lat) * Math.sin(c.lon) * (this.planetRadius - c.r * 0.65);
      const y = Math.sin(c.lat) * (this.planetRadius - c.r * 0.65);
      const z = Math.cos(c.lat) * Math.cos(c.lon) * (this.planetRadius - c.r * 0.65);
      land.position.set(x, y, z);
      this.planetGroup.add(land);
    });

    // Glowing Cartoon Atmosphere
    const atmoGeo = new THREE.SphereGeometry(this.planetRadius * 1.06, 32, 32);
    const atmoMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      roughness: 0.1
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    this.planetGroup.add(atmo);

    this.group.add(this.planetGroup);
  }

  createMountainAndCannon() {
    const mountGroup = new THREE.Group();
    const r = this.planetRadius;

    // Mountain Cone
    const mountGeo = new THREE.ConeGeometry(0.8, this.mountainHeight, 16);
    const mountMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const mount = new THREE.Mesh(mountGeo, mountMat);
    mount.position.y = r + this.mountainHeight * 0.5 - 0.15;
    mountGroup.add(mount);

    // Snow peak
    const snowGeo = new THREE.ConeGeometry(0.35, 0.35, 12);
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const snow = new THREE.Mesh(snowGeo, snowMat);
    snow.position.y = r + this.mountainHeight - 0.2;
    mountGroup.add(snow);

    // Cartoon Brass Cannon
    const cannonGroup = new THREE.Group();
    cannonGroup.position.set(0.35, r + this.mountainHeight - 0.05, 0);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.7, 16);
    const cannonMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.3
    });
    const barrel = new THREE.Mesh(barrelGeo, cannonMat);
    barrel.rotation.z = -Math.PI / 2 + 0.05; // Points horizontally to the right
    barrel.position.x = 0.25;

    // Cannon Carriage / Wheels
    const carriageGeo = new THREE.BoxGeometry(0.3, 0.2, 0.3);
    const carriageMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const carriage = new THREE.Mesh(carriageGeo, carriageMat);
    carriage.position.y = -0.1;

    cannonGroup.add(barrel, carriage);
    mountGroup.add(cannonGroup);

    this.cannonMuzzle = new THREE.Vector3(0.35 + 0.6, r + this.mountainHeight, 0);
    this.group.add(mountGroup);
  }

  createCosmicBackground() {
    // Starfield particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 80;
      starPos[i + 1] = (Math.random() - 0.5) * 60;
      starPos[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35,
      transparent: true,
      opacity: 0.8
    });
    const starField = new THREE.Points(starGeo, starMat);
    this.group.add(starField);
  }

  fireCannon() {
    window.soundSynth.playCannon();

    // Start position at cannon muzzle
    const rLaunch = this.planetRadius + this.mountainHeight;
    this.ball.position.set(0.65, rLaunch, 0);
    this.ball.visible = true;
    this.ballActive = true;

    // Horizontal launch velocity along +X
    this.ballVel.set(this.launchSpeed, 0, 0);

    // Clear trail
    this.orbitTrail = [];
    this.updateTrailMesh();

    // Newton reacts!
    if (this.newton) {
      this.newton.userData.blinkTimer = 2.0;
      CartoonRenderer.showSpeechBubble(
        "Sir Isaac Newton",
        `Firing cannon at ${this.launchSpeed.toFixed(1)} km/s! Watch how gravity curves the path toward Earth!`,
        "🍎"
      );
    }
  }

  dropApple() {
    window.soundSynth.playPop();
    const rLaunch = this.planetRadius + this.mountainHeight + 0.6;
    this.apple.position.set(-0.25, rLaunch, 0.4);
    this.apple.visible = true;
    this.appleActive = true;
    this.appleVel = 0;

    if (this.newton) {
      CartoonRenderer.showSpeechBubble(
        "Sir Isaac Newton",
        "An apple drops straight down because of Earth's gravity pulling it toward the center! $F = m \\cdot g$",
        "🍎"
      );
    }
  }

  setPlanet(type) {
    this.currentBody = type;
    if (type === 'earth') {
      this.planetMass = 100.0;
      this.planetMat.color.setHex(0x2563eb);
      CartoonRenderer.showSpeechBubble("Sir Isaac Newton", "Welcome to Earth! Mass = 1.0 M⊕. Circular orbit speed is ~4.65 km/s.", "🌍");
    } else if (type === 'moon') {
      this.planetMass = 20.0;
      this.planetMat.color.setHex(0x94a3b8);
      CartoonRenderer.showSpeechBubble("Sir Isaac Newton", "The Moon has 1/5 the gravity of Earth! Orbits require much less speed.", "🌕");
    } else if (type === 'jupiter') {
      this.planetMass = 250.0;
      this.planetMat.color.setHex(0xd97706);
      CartoonRenderer.showSpeechBubble("Sir Isaac Newton", "Mighty Jupiter! Super strong gravitational pull. You need huge speed to orbit!", "🪐");
    }
    this.updateSpacetimeDeformation();
  }

  update(dt) {
    dt = Math.min(dt, 0.05);

    // Slowly rotate planet
    if (this.planetGroup) {
      this.planetGroup.rotation.y += dt * 0.15;
    }

    // Animate Newton
    if (this.newton) {
      const t = Date.now() * 0.003;
      // Gentle breathing & head motion
      this.newton.userData.head.rotation.y = Math.sin(t * 0.8) * 0.15;
      this.newton.userData.head.rotation.x = Math.sin(t * 1.2) * 0.05;

      // Track cannonball with head if active
      if (this.ballActive && this.ball) {
        const dir = this.ball.position.clone().sub(this.newton.position).normalize();
        this.newton.userData.head.rotation.z = -dir.x * 0.4;
      }
    }

    // 1. Update Cannonball Physics
    if (this.ballActive && this.ball) {
      const pos = this.ball.position;
      const r = pos.length();

      // Check collision with planet surface
      if (r <= this.planetRadius) {
        this.ballActive = false;
        window.soundSynth.playThud();
        CartoonRenderer.showSpeechBubble(
          "Sir Isaac Newton",
          "CRASH! The speed was too slow: Earth's curvature couldn't drop fast enough, so it hit the ground!",
          "💥"
        );
      } else if (r > 35.0) {
        // Escaped to deep space!
        this.ballActive = false;
        window.soundSynth.playSuccess();
        CartoonRenderer.showSpeechBubble(
          "Sir Isaac Newton",
          "ESCAPE VELOCITY! The cannonball overcame Earth's gravity well and flew into the galaxy!",
          "🚀"
        );
      } else {
        // Gravitational force: F = -G*M*m/r^2 in direction toward center (0,0,0)
        // a = -G*M / r^2 * (r_hat) = -G*M / r^3 * r_vec
        const r3 = r * r * r;
        const accelX = - (this.G * this.planetMass / r3) * pos.x;
        const accelY = - (this.G * this.planetMass / r3) * pos.y;
        const accelZ = - (this.G * this.planetMass / r3) * pos.z;

        // Air resistance damping (if enabled)
        const drag = this.airResistance * 0.05;
        this.ballVel.x += (accelX - this.ballVel.x * drag) * dt;
        this.ballVel.y += (accelY - this.ballVel.y * drag) * dt;
        this.ballVel.z += (accelZ - this.ballVel.z * drag) * dt;

        pos.x += this.ballVel.x * dt;
        pos.y += this.ballVel.y * dt;
        pos.z += this.ballVel.z * dt;

        // Record trail
        this.orbitTrail.push(pos.clone());
        if (this.orbitTrail.length > this.maxTrailPoints) {
          this.orbitTrail.shift();
        }
        this.updateTrailMesh();

        // Check if full orbit completed!
        if (this.orbitTrail.length > 100) {
          const launchPos = new THREE.Vector3(0.65, this.planetRadius + this.mountainHeight, 0);
          if (pos.distanceTo(launchPos) < 0.6 && this.orbitTrail.length > 150) {
            window.soundSynth.playSuccess();
            CartoonRenderer.showSpeechBubble(
              "Sir Isaac Newton",
              "EUREKA! STABLE ORBIT ACHIEVED! The projectile is falling forever around the curve of the Earth!",
              "🎉"
            );
          }
        }
      }
    }

    // 2. Update Apple Drop Physics
    if (this.appleActive && this.apple) {
      const g = (this.G * this.planetMass) / (this.planetRadius * this.planetRadius);
      this.appleVel += g * dt;
      this.apple.position.y -= this.appleVel * dt;

      // Ground hit
      if (this.apple.position.y <= this.planetRadius + 0.1) {
        this.apple.position.y = this.planetRadius + 0.1;
        this.appleActive = false;
        window.soundSynth.playThud();
        CartoonRenderer.showSpeechBubble(
          "Sir Isaac Newton",
          "BONK! The apple landed! In a vacuum, all objects fall with the exact same acceleration $g = 9.8 m/s^2$!",
          "🍎"
        );
      }
    }
  }

  updateTrailMesh() {
    if (!this.trailGeom) return;
    const positions = this.trailGeom.attributes.position.array;
    for (let i = 0; i < this.maxTrailPoints; i++) {
      if (i < this.orbitTrail.length) {
        positions[i * 3] = this.orbitTrail[i].x;
        positions[i * 3 + 1] = this.orbitTrail[i].y;
        positions[i * 3 + 2] = this.orbitTrail[i].z;
      } else if (this.orbitTrail.length > 0) {
        const last = this.orbitTrail[this.orbitTrail.length - 1];
        positions[i * 3] = last.x;
        positions[i * 3 + 1] = last.y;
        positions[i * 3 + 2] = last.z;
      } else {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
      }
    }
    this.trailGeom.attributes.position.needsUpdate = true;
    this.trailGeom.setDrawRange(0, this.orbitTrail.length);
  }

  getCalculations() {
    const rLaunch = this.planetRadius + this.mountainHeight;
    const vCirc = Math.sqrt((this.G * this.planetMass) / rLaunch);
    const vEsc = Math.sqrt(2) * vCirc;
    const Fg = (this.G * this.planetMass * 1.0) / (rLaunch * rLaunch);

    let orbitStatus = "Crashes into Earth";
    let statusColor = "#ef4444";
    if (Math.abs(this.launchSpeed - vCirc) < 0.25) {
      orbitStatus = "Circular Orbit!";
      statusColor = "#10b981";
    } else if (this.launchSpeed >= vEsc) {
      orbitStatus = "Hyperbolic Escape!";
      statusColor = "#f59e0b";
    } else if (this.launchSpeed > vCirc) {
      orbitStatus = "Elliptical Orbit";
      statusColor = "#38bdf8";
    }

    return {
      formula: `F_g = G \\frac{M \\cdot m}{r^2}`,
      values: [
        { label: "Planet Mass (M)", val: `${this.planetMass.toFixed(0)} units` },
        { label: "Launch Radius (r)", val: `${rLaunch.toFixed(2)} units` },
        { label: "Circular Speed (v_c)", val: `${vCirc.toFixed(2)} km/s` },
        { label: "Escape Speed (v_esc)", val: `${vEsc.toFixed(2)} km/s` },
        { label: "Current Speed", val: `${this.launchSpeed.toFixed(2)} km/s` },
        { label: "Trajectory", val: `<span style="color:${statusColor};font-weight:700">${orbitStatus}</span>` }
      ]
    };
  }

  destroy() {
    this.scene.remove(this.group);
  }
}

window.GravitySimulation = GravitySimulation;
