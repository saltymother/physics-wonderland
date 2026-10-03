// Physics Simulation: Bernoulli's Principle & Venturi Effect
// Continuity equation, Pressure vs Velocity relationship, Manometers, and Airfoil Lift

class BernoulliSimulation {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Sub-mode: 'pipe' (Venturi constriction) or 'airfoil' (Airplane lift)
    this.subMode = 'pipe';

    // Physics parameters
    this.inletSpeed = 3.0; // v1 (m/s)
    this.constrictionRatio = 0.5; // r2 / r1
    this.fluidDensity = 1.0; // rho (kg/m^3 scaled)
    this.basePressure = 100.0; // P1 (kPa)

    // Airfoil parameters
    this.airspeed = 4.0;
    this.angleAttack = 6.0; // degrees
    this.planeAltitude = 0;
    this.isFlying = false;

    // Particle swarms
    this.pipeParticles = [];
    this.airfoilParticles = [];

    // 3D Objects
    this.pipeMeshGroup = null;
    this.manometerColumns = [];
    this.airplane = null;
    this.airfoilWing = null;
    this.liftVectorArrow = null;

    this.initScene();
  }

  initScene() {
    // 1. Create Venturi Tube Setup
    this.createVenturiPipe();

    // 2. Create Airfoil & Cartoon Airplane Setup
    this.createAirfoilSetup();

    // 3. Set initial sub-mode visibility
    this.setSubMode('pipe');
  }

  createVenturiPipe() {
    this.pipeMeshGroup = new THREE.Group();

    // Transparent Glass Pipe Shell
    const pipeLength = 12;
    const rWide = 1.2;
    const rNarrow = rWide * this.constrictionRatio;

    // Construct curved profile using LatheGeometry or segmented cylinders
    const points = [];
    const segments = 40;
    for (let i = 0; i <= segments; i++) {
      const x = -pipeLength / 2 + (i / segments) * pipeLength;
      // Smooth constriction bell curve
      const factor = Math.exp(- (x * x) / 3.0);
      const r = rWide - (rWide - rNarrow) * factor;
      points.push(new THREE.Vector2(r, x));
    }

    const latheGeo = new THREE.LatheGeometry(points, 32);
    latheGeo.rotateZ(Math.PI / 2);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.6,
      ior: 1.4
    });

    this.pipeShell = new THREE.Mesh(latheGeo, glassMat);
    this.pipeMeshGroup.add(this.pipeShell);

    // Decorative Pipe Flanges / Clamps
    [-pipeLength / 2, pipeLength / 2].forEach(x => {
      const ringGeo = new THREE.TorusGeometry(rWide + 0.05, 0.08, 12, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.x = x;
      this.pipeMeshGroup.add(ring);
    });

    // Vertical Manometer Pressure Tubes (P1 at inlet, P2 at constriction, P3 at outlet)
    this.manometerColumns = [];
    const manometerPositions = [-3.8, 0, 3.8];

    manometerPositions.forEach((x, idx) => {
      const tubeGroup = new THREE.Group();
      tubeGroup.position.set(x, 1.2, 0);

      // Glass vertical tube
      const glassTubeGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.0, 16);
      const glassTube = new THREE.Mesh(glassTubeGeo, glassMat);
      glassTube.position.y = 2.0;

      // Colored liquid column inside
      const liquidGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.0, 16);
      const liquidMat = new THREE.MeshStandardMaterial({
        color: idx === 1 ? 0xf59e0b : 0x06b6d4,
        roughness: 0.2
      });
      const liquidCol = new THREE.Mesh(liquidGeo, liquidMat);
      liquidCol.position.y = 0.5;

      tubeGroup.add(glassTube, liquidCol);
      this.pipeMeshGroup.add(tubeGroup);
      this.manometerColumns.push(liquidCol);
    });

    // Fluid Streamline Particles inside Venturi
    const particleCount = 280;
    const particleGeo = new THREE.SphereGeometry(0.09, 8, 8);
    for (let i = 0; i < particleCount; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const p = new THREE.Mesh(particleGeo, mat);
      const x = (Math.random() - 0.5) * pipeLength;
      const angle = Math.random() * Math.PI * 2;
      const radiusFactor = Math.random() * 0.75;

      p.userData = {
        origX: x,
        x: x,
        angle: angle,
        radiusFactor: radiusFactor,
        baseSpeed: 1.0
      };
      this.pipeMeshGroup.add(p);
      this.pipeParticles.push(p);
    }

    this.group.add(this.pipeMeshGroup);
  }

  createAirfoilSetup() {
    this.airfoilGroup = new THREE.Group();

    // 1. Aerodynamic Cambered Wing Profile
    const wingShape = new THREE.Shape();
    // Curved top, flatter bottom
    wingShape.moveTo(-2.0, 0);
    wingShape.bezierCurveTo(-1.5, 0.9, 0.5, 0.7, 2.0, 0);
    wingShape.bezierCurveTo(0.5, -0.15, -1.5, -0.1, -2.0, 0);

    const extrudeSettings = { depth: 4.5, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.08, bevelThickness: 0.08 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.center();
    wingGeo.rotateY(Math.PI / 2);

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.3,
      roughness: 0.4
    });
    this.airfoilWing = new THREE.Mesh(wingGeo, wingMat);
    this.airfoilWing.position.set(0, 0, 0);
    this.airfoilGroup.add(this.airfoilWing);

    // 2. Cartoon Airplane with Captain Bernoulli
    this.airplane = CartoonRenderer.buildBernoulliAirplane();
    this.airplane.position.set(0, -1.8, 0);
    this.airplane.scale.set(0.9, 0.9, 0.9);
    this.airfoilGroup.add(this.airplane);

    // 3. Dynamic Lift Force Vector Arrow (glowing green arrow pointing up)
    const arrowGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 12);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const arrowShaft = new THREE.Mesh(arrowGeo, arrowMat);
    arrowShaft.position.y = 0.9;

    const headGeo = new THREE.ConeGeometry(0.24, 0.5, 16);
    const headMesh = new THREE.Mesh(headGeo, arrowMat);
    headMesh.position.y = 1.8 + 0.25;

    this.liftVectorArrow = new THREE.Group();
    this.liftVectorArrow.add(arrowShaft, headMesh);
    this.liftVectorArrow.position.set(0, 0.6, 0);
    this.airfoilGroup.add(this.liftVectorArrow);

    // 4. Wind Tunnel Smoke Streamline Particles
    const airParticleCount = 200;
    const airGeo = new THREE.SphereGeometry(0.08, 6, 6);
    for (let i = 0; i < airParticleCount; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.7 });
      const p = new THREE.Mesh(airGeo, mat);
      p.userData = {
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
        isOverTop: false
      };
      p.userData.isOverTop = p.userData.y > 0;
      this.airfoilGroup.add(p);
      this.airfoilParticles.push(p);
    }

    this.group.add(this.airfoilGroup);
  }

  setSubMode(mode) {
    this.subMode = mode;
    if (mode === 'pipe') {
      this.pipeMeshGroup.visible = true;
      this.airfoilGroup.visible = false;
      CartoonRenderer.showSpeechBubble(
        "Professor Bernoulli",
        "Look at the constriction! Fluid MUST speed up to fit through ($A_1 v_1 = A_2 v_2$). Faster fluid drops in pressure!",
        "💨"
      );
    } else {
      this.pipeMeshGroup.visible = false;
      this.airfoilGroup.visible = true;
      CartoonRenderer.showSpeechBubble(
        "Captain Bernoulli",
        "Air speeds up over the curved top of the wing! Lower pressure on top creates upward LIFT! Ready for takeoff!",
        "✈️"
      );
    }
  }

  update(dt) {
    dt = Math.min(dt, 0.05);

    if (this.subMode === 'pipe') {
      // 1. Animate Venturi Pipe Particles
      const pipeLength = 12;
      const rWide = 1.2;
      const rNarrow = rWide * this.constrictionRatio;
      const v1 = this.inletSpeed;
      // Area ratio: A1/A2 = (r1/r2)^2
      const areaRatio = 1.0 / (this.constrictionRatio * this.constrictionRatio);
      const v2 = v1 * areaRatio;

      this.pipeParticles.forEach(p => {
        const u = p.userData;
        // Local pipe radius at current x
        const factor = Math.exp(- (u.x * u.x) / 3.0);
        const rCurrent = rWide - (rWide - rNarrow) * factor;
        const currentSpeed = v1 + (v2 - v1) * factor;

        u.x += currentSpeed * dt * 1.8;
        if (u.x > pipeLength / 2) {
          u.x = -pipeLength / 2;
        }

        // Keep inside narrowing tube
        const r = rCurrent * u.radiusFactor;
        p.position.x = u.x;
        p.position.y = Math.cos(u.angle) * r;
        p.position.z = Math.sin(u.angle) * r;

        // Dynamic Color: Deep blue when slow (high pressure) -> Warm orange/red when fast (low pressure)
        const speedRatio = Math.min(1.0, (currentSpeed - v1) / Math.max(1, v2 - v1));
        p.material.color.setRGB(
          0.2 + speedRatio * 0.8,
          0.7 - speedRatio * 0.4,
          1.0 - speedRatio * 0.9
        );
      });

      // 2. Animate Manometer Liquid Columns
      // h1 ~ P1, h2 ~ P2 = P1 - 0.5 * rho * (v2^2 - v1^2)
      const deltaP = 0.5 * this.fluidDensity * (v2 * v2 - v1 * v1);
      const hScale = 0.05;
      const h1 = Math.min(3.8, Math.max(0.4, 2.8));
      const h2 = Math.min(3.8, Math.max(0.2, 2.8 - deltaP * hScale));
      const h3 = h1 * 0.96; // slight loss

      const targetHeights = [h1, h2, h3];
      this.manometerColumns.forEach((col, i) => {
        const target = targetHeights[i];
        col.scale.y += (target - col.scale.y) * 0.1;
        col.position.y = col.scale.y / 2;
      });

    } else {
      // 2. Animate Airfoil & Airplane Lift
      const v = this.airspeed;
      const cl = 0.15 * this.angleAttack; // Lift coefficient
      const lift = 0.5 * cl * this.fluidDensity * (v * v);
      const weight = 6.0;

      // Rotate propeller
      if (this.airplane && this.airplane.userData.propeller) {
        this.airplane.userData.propeller.rotation.z += v * 4.0 * dt;
        // Scarf flutter
        this.airplane.userData.scarf.rotation.z = Math.sin(Date.now() * 0.015) * 0.3;
      }

      // Lift Vector Arrow Scaling
      if (this.liftVectorArrow) {
        const arrowScale = Math.min(3.5, Math.max(0.2, lift * 0.35));
        this.liftVectorArrow.scale.set(1, arrowScale, 1);
        this.liftVectorArrow.rotation.z = - (this.angleAttack * Math.PI / 180) * 0.4;
      }

      // Airfoil Wing angle of attack tilt
      if (this.airfoilWing) {
        this.airfoilWing.rotation.z = - (this.angleAttack * Math.PI / 180);
      }

      // Airplane takeoff dynamics
      if (this.airplane) {
        const targetAlt = lift > weight ? Math.min(2.5, (lift - weight) * 0.4) : -1.8;
        this.planeAltitude += (targetAlt - this.planeAltitude) * 0.08;
        this.airplane.position.y = this.planeAltitude;

        if (lift > weight && !this.isFlying) {
          this.isFlying = true;
          window.soundSynth.playWhoosh();
          CartoonRenderer.showSpeechBubble(
            "Captain Bernoulli",
            "WE HAVE LIFTOFF! Upward lift generated by Bernoulli pressure difference exceeded aircraft weight!",
            "✈️"
          );
        } else if (lift <= weight && this.isFlying) {
          this.isFlying = false;
        }

        // Slight flight bobbing
        if (this.isFlying) {
          this.airplane.position.y += Math.sin(Date.now() * 0.005) * 0.08;
          this.airplane.rotation.z = Math.sin(Date.now() * 0.004) * 0.05;
        } else {
          this.airplane.rotation.z = 0;
        }
      }

      // Animate Airflow Smoke Streamlines
      this.airfoilParticles.forEach(p => {
        const u = p.userData;
        // Air over top travels ~1.5x faster than below
        const speed = u.isOverTop ? v * 1.55 : v * 0.95;
        u.x += speed * dt * 2.5;
        if (u.x > 8.0) {
          u.x = -8.0;
        }

        // Deflect streamlines around wing
        p.position.x = u.x;
        let yOffset = 0;
        if (Math.abs(u.x) < 2.5) {
          const bump = Math.cos((u.x / 2.5) * (Math.PI / 2));
          yOffset = u.isOverTop ? bump * 0.7 : -bump * 0.2;
        }
        p.position.y = u.y + yOffset;
        p.position.z = u.z;
      });
    }
  }

  getCalculations() {
    if (this.subMode === 'pipe') {
      const v1 = this.inletSpeed;
      const areaRatio = 1.0 / (this.constrictionRatio * this.constrictionRatio);
      const v2 = v1 * areaRatio;
      const P1 = this.basePressure;
      // P2 = P1 - 0.5 * rho * (v2^2 - v1^2)
      const dynamicDelta = 0.5 * this.fluidDensity * (v2 * v2 - v1 * v1);
      const P2 = Math.max(5.0, P1 - dynamicDelta);

      return {
        formula: `P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2`,
        values: [
          { label: "Inlet Speed (v_1)", val: `${v1.toFixed(1)} m/s` },
          { label: "Constriction Speed (v_2)", val: `<span style="color:#f59e0b;font-weight:700">${v2.toFixed(1)} m/s</span>` },
          { label: "Inlet Pressure (P_1)", val: `${P1.toFixed(1)} kPa` },
          { label: "Throat Pressure (P_2)", val: `<span style="color:#ef4444;font-weight:700">${P2.toFixed(1)} kPa</span>` },
          { label: "Pressure Drop (ΔP)", val: `${dynamicDelta.toFixed(1)} kPa` },
          { label: "Area Ratio (A1/A2)", val: `${areaRatio.toFixed(2)}x` }
        ]
      };
    } else {
      const v = this.airspeed;
      const cl = 0.15 * this.angleAttack;
      const lift = 0.5 * cl * this.fluidDensity * (v * v);
      const weight = 6.0;
      const status = lift > weight ? "Flying in Air! ✈️" : "On Ground (Stalled)";
      const statusColor = lift > weight ? "#10b981" : "#ef4444";

      return {
        formula: `L = \\frac{1}{2} C_L \\rho v^2 S`,
        values: [
          { label: "Airspeed (v)", val: `${v.toFixed(1)} m/s` },
          { label: "Angle of Attack (α)", val: `${this.angleAttack.toFixed(1)}°` },
          { label: "Lift Coefficient (C_L)", val: `${cl.toFixed(2)}` },
          { label: "Lift Force", val: `<span style="color:#38bdf8;font-weight:700">${lift.toFixed(1)} N</span>` },
          { label: "Aircraft Weight", val: `${weight.toFixed(1)} N` },
          { label: "Flight Status", val: `<span style="color:${statusColor};font-weight:700">${status}</span>` }
        ]
      };
    }
  }

  destroy() {
    this.scene.remove(this.group);
  }
}

window.BernoulliSimulation = BernoulliSimulation;
