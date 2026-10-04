// Main Application Controller: Physics Wonderland
// Coordinates Three.js render loop, camera controls, module switching, and student UI

class App {
  constructor() {
    this.container = document.getElementById("canvas-container");
    this.activeModule = "gravity"; // 'gravity', 'bernoulli', 'torricelli'
    this.currentSim = null;

    this.simSpeed = 1.0;
    this.isPaused = false;
    this.lastTime = performance.now();

    this.initThree();
    this.initUI();
    this.switchModule("gravity");
    this.animate();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090d16);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 7, 16);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting (Studio + Vibrant Cartoon Light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
    dirLight.position.set(15, 25, 12);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-15, -10, -10);
    this.scene.add(rimLight);

    // 5. Controls (OrbitControls if available, or simple pointer orbit fallback)
    if (window.THREE && window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 50;
      this.controls.minDistance = 2;
    } else {
      this.setupFallbackControls();
    }

    // Resize listener
    window.addEventListener("resize", () => this.onWindowResize());
  }

  setupFallbackControls() {
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    const el = this.renderer.domElement;

    el.addEventListener("mousedown", e => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    window.addEventListener("mousemove", e => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };

      const spherical = new THREE.Spherical().setFromVector3(this.camera.position);
      spherical.theta -= dx * 0.005;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.005));
      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(0, 0, 0);
    });

    el.addEventListener("wheel", e => {
      e.preventDefault();
      const dist = this.camera.position.length();
      const newDist = Math.max(3, Math.min(45, dist + e.deltaY * 0.02));
      this.camera.position.setLength(newDist);
    }, { passive: false });

    // Touch Orbit fallback
    el.addEventListener("touchstart", e => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener("touchend", () => {
      isDragging = false;
    });

    window.addEventListener("touchmove", e => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouse.x;
      const dy = e.touches[0].clientY - prevMouse.y;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      const spherical = new THREE.Spherical().setFromVector3(this.camera.position);
      spherical.theta -= dx * 0.007;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.007));
      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(0, 0, 0);
    }, { passive: true });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Global Mobile Drawer Panel Switcher
window.toggleMobilePanel = function(type) {
  const panel = document.getElementById('floating-panel');
  const math = document.getElementById('hud-math-panel');
  const btnPanel = document.getElementById('btn-toggle-panel');
  const btnMath = document.getElementById('btn-toggle-math');

  if (type === 'controls') {
    const isCurrentlyActive = panel.classList.contains('mobile-active');
    panel.classList.toggle('mobile-active', !isCurrentlyActive);
    math.classList.remove('mobile-active');
    if (btnPanel) btnPanel.classList.toggle('active', !isCurrentlyActive);
    if (btnMath) btnMath.classList.remove('active');
  } else if (type === 'math') {
    const isCurrentlyActive = math.classList.contains('mobile-active');
    math.classList.toggle('mobile-active', !isCurrentlyActive);
    panel.classList.remove('mobile-active');
    if (btnMath) btnMath.classList.toggle('active', !isCurrentlyActive);
    if (btnPanel) btnPanel.classList.remove('active');
  }
};

  switchModule(moduleName) {
    if (this.currentSim) {
      this.currentSim.destroy();
      this.currentSim = null;
    }

    this.activeModule = moduleName;

    // Update active nav button
    document.querySelectorAll(".module-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.module === moduleName);
    });

    // Reset camera position for ideal module perspective
    if (moduleName === "gravity") {
      this.setCameraPreset("cinematic");
      this.currentSim = new GravitySimulation(this.scene, this.camera);
      CartoonRenderer.showSpeechBubble(
        "Sir Isaac Newton",
        "Welcome to Universal Gravitation! Watch how gravity pulls apples down and keeps moons in orbit!",
        "🍎"
      );
    } else if (moduleName === "bernoulli") {
      this.setCameraPreset("front");
      this.currentSim = new BernoulliSimulation(this.scene, this.camera);
      CartoonRenderer.showSpeechBubble(
        "Professor Bernoulli",
        "Welcome to Fluid Dynamics! Constriction speeds up flow and causes pressure to DROP! Let's fly!",
        "💨"
      );
    } else if (moduleName === "torricelli") {
      this.setCameraPreset("front");
      this.currentSim = new TorricelliSimulation(this.scene, this.camera);
      CartoonRenderer.showSpeechBubble(
        "Professor Torricelli",
        "Welcome to Efflux Mechanics! Fluid rushes out at $v = \\sqrt{2gh}$! Pip the Penguin is ready to catch!",
        "💧"
      );
    }

    this.buildControlPanel();
    this.showToast(`Switched to ${moduleName.toUpperCase()} Module`);
  }

  setCameraPreset(type) {
    document.querySelectorAll(".cam-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.cam === type);
    });

    const targetPos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3(0, 0, 0);

    if (this.activeModule === "gravity") {
      if (type === "cinematic") targetPos.set(0, 6, 14);
      else if (type === "front") targetPos.set(0, 0, 16);
      else if (type === "top") targetPos.set(0, 18, 0.1);
    } else if (this.activeModule === "bernoulli") {
      if (type === "cinematic") targetPos.set(4, 5, 12);
      else if (type === "front") targetPos.set(0, 1, 14);
      else if (type === "top") targetPos.set(0, 14, 0.1);
    } else if (this.activeModule === "torricelli") {
      if (type === "cinematic") {
        targetPos.set(5, 5, 12);
        lookTarget.set(4, 2, 0);
      } else if (type === "front") {
        targetPos.set(5, 2.5, 14);
        lookTarget.set(5, 2.5, 0);
      } else if (type === "top") {
        targetPos.set(5, 15, 0.1);
        lookTarget.set(5, 0, 0);
      }
    }

    // Smooth transition
    this.tweenCamera(targetPos, lookTarget);
  }

  tweenCamera(toPos, toTarget, duration = 600) {
    const startPos = this.camera.position.clone();
    const startTime = performance.now();

    const animateCam = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPos, toPos, ease);
      this.camera.lookAt(toTarget);

      if (this.controls) {
        this.controls.target.copy(toTarget);
      }

      if (progress < 1.0) {
        requestAnimationFrame(animateCam);
      }
    };
    requestAnimationFrame(animateCam);
  }

  buildControlPanel() {
    const container = document.getElementById("panel-controls");
    const titleEl = document.getElementById("panel-title-text");
    const badgeEl = document.getElementById("panel-module-badge");

    if (!container) return;
    container.innerHTML = "";

    if (this.activeModule === "gravity") {
      titleEl.innerHTML = `<span style="font-size:18px">🪐</span> Gravitation & Orbit Lab`;
      badgeEl.textContent = "Newtonian Mechanics";

      container.innerHTML = `
        <div class="control-section">
          <div class="section-label">Central Planet</div>
          <div class="toggle-group">
            <button class="toggle-btn active" onclick="app.setGravityPlanet('earth')">Earth</button>
            <button class="toggle-btn" onclick="app.setGravityPlanet('moon')">Moon</button>
            <button class="toggle-btn" onclick="app.setGravityPlanet('jupiter')">Jupiter</button>
          </div>
        </div>

        <div class="control-card">
          <div class="slider-row">
            <div class="slider-label">
              <span>Cannon Launch Speed</span>
              <span class="slider-value" id="val-launch-speed">4.5 km/s</span>
            </div>
            <input type="range" class="custom-range" min="1.0" max="9.0" step="0.1" value="4.5"
                   oninput="app.onSliderChange('launchSpeed', this.value, 'val-launch-speed', 'km/s')">
          </div>

          <div class="slider-row">
            <div class="slider-label">
              <span>Planet Mass (M)</span>
              <span class="slider-value" id="val-planet-mass">100</span>
            </div>
            <input type="range" class="custom-range" min="20" max="250" step="5" value="100"
                   oninput="app.onSliderChange('planetMass', this.value, 'val-planet-mass', '')">
          </div>

          <div class="slider-row">
            <div class="slider-label">
              <span>Air Drag / Atmosphere</span>
              <span class="slider-value" id="val-air-drag">0% (Vacuum)</span>
            </div>
            <input type="range" class="custom-range" min="0" max="1" step="0.05" value="0"
                   oninput="app.onSliderChange('airResistance', this.value, 'val-air-drag', '%', val => (val*100).toFixed(0) + '%')">
          </div>
        </div>

        <div class="action-btn-row">
          <button class="primary-action-btn" onclick="app.currentSim.fireCannon()">
            <span>💥</span> Fire Cannon!
          </button>
          <button class="secondary-action-btn" onclick="app.currentSim.dropApple()">
            <span>🍎</span> Drop Apple
          </button>
        </div>

        <div class="control-section">
          <div class="section-label">Visual Aids</div>
          <div class="toggle-group">
            <button class="toggle-btn active" id="btn-toggle-spacetime" onclick="app.toggleSpacetime()">Spacetime Well</button>
          </div>
        </div>
      `;
    } else if (this.activeModule === "bernoulli") {
      titleEl.innerHTML = `<span style="font-size:18px">💨</span> Bernoulli's Fluid Lab`;
      badgeEl.textContent = "Fluid Dynamics";

      container.innerHTML = `
        <div class="control-section">
          <div class="section-label">Experiment Rig</div>
          <div class="toggle-group">
            <button class="toggle-btn active" id="btn-sub-pipe" onclick="app.setBernoulliMode('pipe')">Venturi Pipe</button>
            <button class="toggle-btn" id="btn-sub-airfoil" onclick="app.setBernoulliMode('airfoil')">Airplane Wing Lift</button>
          </div>
        </div>

        <div id="bernoulli-dynamic-controls">
          <div class="control-card">
            <div class="slider-row">
              <div class="slider-label">
                <span>Inlet Fluid Speed (v₁)</span>
                <span class="slider-value" id="val-inlet-speed">3.0 m/s</span>
              </div>
              <input type="range" class="custom-range" min="1.0" max="6.0" step="0.2" value="3.0"
                     oninput="app.onSliderChange('inletSpeed', this.value, 'val-inlet-speed', 'm/s')">
            </div>

            <div class="slider-row">
              <div class="slider-label">
                <span>Constriction Throat Ratio</span>
                <span class="slider-value" id="val-constriction">0.50x</span>
              </div>
              <input type="range" class="custom-range" min="0.30" max="0.85" step="0.05" value="0.50"
                     oninput="app.onSliderChange('constrictionRatio', this.value, 'val-constriction', 'x')">
            </div>

            <div class="slider-row">
              <div class="slider-label">
                <span>Fluid Density (ρ)</span>
                <span class="slider-value" id="val-fluid-density">1.0</span>
              </div>
              <input type="range" class="custom-range" min="0.5" max="2.5" step="0.1" value="1.0"
                     oninput="app.onSliderChange('fluidDensity', this.value, 'val-fluid-density', '')">
            </div>
          </div>
        </div>
      `;
    } else if (this.activeModule === "torricelli") {
      titleEl.innerHTML = `<span style="font-size:18px">💧</span> Torricelli's Water Lab`;
      badgeEl.textContent = "Efflux Mechanics";

      container.innerHTML = `
        <div class="control-section">
          <div class="section-label">Liquid Reservoir</div>
          <div class="toggle-group">
            <button class="toggle-btn active" onclick="app.setTorricelliLiquid('water')">Water</button>
            <button class="toggle-btn" onclick="app.setTorricelliLiquid('honey')">Honey</button>
            <button class="toggle-btn" onclick="app.setTorricelliLiquid('mercury')">Mercury</button>
          </div>
        </div>

        <div class="control-card">
          <div class="slider-row">
            <div class="slider-label">
              <span>Water Depth (H)</span>
              <span class="slider-value" id="val-water-height">4.20 m</span>
            </div>
            <input type="range" class="custom-range" min="2.0" max="4.8" step="0.1" value="4.2"
                   oninput="app.onTorricelliSlider('waterHeight', this.value, 'val-water-height', 'm')">
          </div>

          <div class="slider-row">
            <div class="slider-label">
              <span>Orifice Hole Height (y)</span>
              <span class="slider-value" id="val-hole-height">2.10 m</span>
            </div>
            <input type="range" class="custom-range" min="0.4" max="4.0" step="0.1" value="2.1"
                   oninput="app.onTorricelliSlider('holeHeight', this.value, 'val-hole-height', 'm')">
          </div>

          <div class="slider-row">
            <div class="slider-label">
              <span>Gravity (g)</span>
              <span class="slider-value" id="val-gravity">9.8 m/s²</span>
            </div>
            <input type="range" class="custom-range" min="1.6" max="24.8" step="0.2" value="9.8"
                   oninput="app.onSliderChange('gravity', this.value, 'val-gravity', 'm/s²')">
          </div>
        </div>

        <div class="action-btn-row">
          <button class="primary-action-btn" onclick="app.currentSim.catchJetWithPenguin()">
            <span>🐧</span> Pip Catch Jet!
          </button>
          <button class="secondary-action-btn" id="btn-toggle-drain" onclick="app.toggleTorricelliDrain()">
            <span>🚰</span> Stopper: Open
          </button>
        </div>
      `;
    }
  }

  onSliderChange(prop, val, elId, unit, formatter) {
    const num = parseFloat(val);
    if (this.currentSim) {
      this.currentSim[prop] = num;
      if (prop === "planetMass") this.currentSim.updateSpacetimeDeformation();
    }
    const label = document.getElementById(elId);
    if (label) {
      label.textContent = formatter ? formatter(num) : `${num.toFixed(1)} ${unit}`;
    }
    window.soundSynth.playPop();
  }

  onTorricelliSlider(prop, val, elId, unit) {
    const num = parseFloat(val);
    if (this.currentSim) {
      this.currentSim[prop] = num;
      this.currentSim.updateWaterLevelMesh();
    }
    const label = document.getElementById(elId);
    if (label) label.textContent = `${num.toFixed(2)} ${unit}`;
    window.soundSynth.playPop();
  }

  setGravityPlanet(type) {
    document.querySelectorAll(".toggle-btn").forEach(b => {
      if (b.textContent.toLowerCase() === type) b.classList.add("active");
      else if (['earth', 'moon', 'jupiter'].includes(b.textContent.toLowerCase())) b.classList.remove("active");
    });
    if (this.currentSim && this.currentSim.setPlanet) {
      this.currentSim.setPlanet(type);
      document.getElementById("val-planet-mass").textContent = this.currentSim.planetMass.toFixed(0);
    }
    window.soundSynth.playPop();
  }

  toggleSpacetime() {
    if (this.currentSim && this.currentSim.spacetimeGrid) {
      this.currentSim.showSpacetime = !this.currentSim.showSpacetime;
      this.currentSim.spacetimeGrid.visible = this.currentSim.showSpacetime;
      document.getElementById("btn-toggle-spacetime").classList.toggle("active", this.currentSim.showSpacetime);
      window.soundSynth.playPop();
    }
  }

  setBernoulliMode(mode) {
    document.getElementById("btn-sub-pipe").classList.toggle("active", mode === "pipe");
    document.getElementById("btn-sub-airfoil").classList.toggle("active", mode === "airfoil");
    if (this.currentSim && this.currentSim.setSubMode) {
      this.currentSim.setSubMode(mode);
    }

    const dynControls = document.getElementById("bernoulli-dynamic-controls");
    if (mode === "pipe") {
      dynControls.innerHTML = `
        <div class="control-card">
          <div class="slider-row">
            <div class="slider-label">
              <span>Inlet Fluid Speed (v₁)</span>
              <span class="slider-value" id="val-inlet-speed">3.0 m/s</span>
            </div>
            <input type="range" class="custom-range" min="1.0" max="6.0" step="0.2" value="3.0"
                   oninput="app.onSliderChange('inletSpeed', this.value, 'val-inlet-speed', 'm/s')">
          </div>

          <div class="slider-row">
            <div class="slider-label">
              <span>Constriction Throat Ratio</span>
              <span class="slider-value" id="val-constriction">0.50x</span>
            </div>
            <input type="range" class="custom-range" min="0.30" max="0.85" step="0.05" value="0.50"
                   oninput="app.onSliderChange('constrictionRatio', this.value, 'val-constriction', 'x')">
            </div>

          <div class="slider-row">
            <div class="slider-label">
              <span>Fluid Density (ρ)</span>
              <span class="slider-value" id="val-fluid-density">1.0</span>
            </div>
            <input type="range" class="custom-range" min="0.5" max="2.5" step="0.1" value="1.0"
                   oninput="app.onSliderChange('fluidDensity', this.value, 'val-fluid-density', '')">
          </div>
        </div>
      `;
    } else {
      dynControls.innerHTML = `
        <div class="control-card">
          <div class="slider-row">
            <div class="slider-label">
              <span>Wind Tunnel Speed (v)</span>
              <span class="slider-value" id="val-airspeed">4.0 m/s</span>
            </div>
            <input type="range" class="custom-range" min="1.0" max="8.0" step="0.2" value="4.0"
                   oninput="app.onSliderChange('airspeed', this.value, 'val-airspeed', 'm/s')">
          </div>

          <div class="slider-row">
            <div class="slider-label">
              <span>Wing Angle of Attack (α)</span>
              <span class="slider-value" id="val-angle-attack">6.0°</span>
            </div>
            <input type="range" class="custom-range" min="0.0" max="18.0" step="1.0" value="6.0"
                   oninput="app.onSliderChange('angleAttack', this.value, 'val-angle-attack', '°')">
          </div>
        </div>
      `;
    }
    window.soundSynth.playPop();
  }

  setTorricelliLiquid(type) {
    if (this.currentSim && this.currentSim.setLiquid) {
      this.currentSim.setLiquid(type);
    }
    window.soundSynth.playPop();
  }

  toggleTorricelliDrain() {
    if (this.currentSim) {
      this.currentSim.isOpen = !this.currentSim.isOpen;
      const btn = document.getElementById("btn-toggle-drain");
      if (btn) {
        btn.innerHTML = this.currentSim.isOpen ? `<span>🚰</span> Stopper: Open` : `<span>🛑</span> Stopper: Closed`;
      }
      window.soundSynth.playPop();
    }
  }

  updateHUDMath() {
    if (!this.currentSim || !this.currentSim.getCalculations) return;
    const data = this.currentSim.getCalculations();

    const eqBox = document.getElementById("hud-equation");
    const gridBox = document.getElementById("hud-values");

    if (eqBox) eqBox.textContent = data.formula;
    if (gridBox) {
      gridBox.innerHTML = data.values
        .map(v => `<div class="math-val-item"><span>${v.label}</span><strong>${v.val}</strong></div>`)
        .join("");
    }
  }

  initUI() {
    // Sound toggle
    const soundBtn = document.getElementById("btn-sound");
    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        const isMuted = window.soundSynth.toggleMute();
        soundBtn.textContent = isMuted ? "🔇" : "🔊";
        this.showToast(isMuted ? "Sound Muted" : "Sound Enabled");
      });
    }

    // Play / Pause toggle
    const pauseBtn = document.getElementById("btn-pause");
    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        this.isPaused = !this.isPaused;
        pauseBtn.textContent = this.isPaused ? "▶️" : "⏸";
        this.showToast(this.isPaused ? "Simulation Paused" : "Simulation Resumed");
      });
    }

    // Modal open / close (Lesson & Challenges)
    const guideBtn = document.getElementById("btn-guide");
    const modalOverlay = document.getElementById("modal-overlay");
    const modalClose = document.getElementById("modal-close");

    if (guideBtn && modalOverlay) {
      guideBtn.addEventListener("click", () => {
        this.populateStudentGuide();
        modalOverlay.classList.add("active");
        window.soundSynth.playEureka();
      });
    }

    if (modalClose && modalOverlay) {
      modalClose.addEventListener("click", () => {
        modalOverlay.classList.remove("active");
        window.soundSynth.playPop();
      });
    }
  }

  populateStudentGuide() {
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body-content");

    if (this.activeModule === "gravity") {
      modalTitle.innerHTML = "🎓 Sir Isaac Newton's Gravity & Orbit Masterclass";
      modalBody.innerHTML = `
        <div class="lesson-step-card">
          <div class="lesson-step-num">1</div>
          <div class="lesson-step-content">
            <h4>The Great Apple Mystery</h4>
            <p>Why do apples fall down toward the center of the Earth, but the Moon never hits the ground? Newton realized that <strong>both are governed by the exact same law: Universal Gravitation!</strong></p>
          </div>
        </div>

        <div class="lesson-step-card">
          <div class="lesson-step-num">2</div>
          <div class="lesson-step-content">
            <h4>Newton's Cannonball Thought Experiment</h4>
            <p>Imagine placing a powerful cannon atop a high mountain. Shoot a cannonball horizontally:
            <br>• <strong>Too slow:</strong> Gravity curves it down and it hits Earth.
            <br>• <strong>Orbital Speed (v_circ = √(GM/r)):</strong> The cannonball falls around the curvature of Earth at the exact same rate Earth curves away! It is in <em>perpetual freefall</em>.
            <br>• <strong>Escape Speed (v_esc = √(2GM/r)):</strong> Overcomes Earth's gravity well entirely!</p>
          </div>
        </div>

        <h3>🎯 Student Challenges</h3>
        <div class="challenge-item">
          <div class="challenge-info">
            <h4>Challenge: Achieve Circular Orbit</h4>
            <p>Adjust the cannon speed slider so the cannonball circles Earth without crashing!</p>
          </div>
          <button class="challenge-btn" onclick="app.launchChallenge('gravity_orbit')">Start Challenge</button>
        </div>
      `;
    } else if (this.activeModule === "bernoulli") {
      modalTitle.innerHTML = "🎓 Daniel Bernoulli's Fluid Dynamics Masterclass";
      modalBody.innerHTML = `
        <div class="lesson-step-card">
          <div class="lesson-step-num">1</div>
          <div class="lesson-step-content">
            <h4>Continuity Equation (Conservation of Mass)</h4>
            <p>When fluid flows through a pipe that narrows, all the fluid entering must exit. Therefore, to squeeze through the narrow constriction, <strong>the fluid MUST speed up: A₁·v₁ = A₂·v₂</strong>!</p>
          </div>
        </div>

        <div class="lesson-step-card">
          <div class="lesson-step-num">2</div>
          <div class="lesson-step-content">
            <h4>Bernoulli's Principle: Speed vs. Pressure</h4>
            <p>Energy is conserved! As fluid particles speed up, their kinetic energy increases, which causes their static internal pressure to <strong>DROP</strong>!
            <br>Notice how the middle manometer liquid column drops in the constriction!</p>
          </div>
        </div>

        <div class="lesson-step-card">
          <div class="lesson-step-num">3</div>
          <div class="lesson-step-content">
            <h4>How Wings Create Flight</h4>
            <p>Air moves faster over the curved top of an airplane wing than under the flat bottom. Faster air means lower pressure on top, creating a net upward force: <strong>LIFT</strong>!</p>
          </div>
        </div>

        <h3>🎯 Student Challenges</h3>
        <div class="challenge-item">
          <div class="challenge-info">
            <h4>Challenge: Airplane Liftoff</h4>
            <p>Switch to Airplane mode and adjust airspeed and angle of attack to achieve flight!</p>
          </div>
          <button class="challenge-btn" onclick="app.launchChallenge('bernoulli_lift')">Start Challenge</button>
        </div>
      `;
    } else if (this.activeModule === "torricelli") {
      modalTitle.innerHTML = "🎓 Evangelista Torricelli's Efflux Masterclass";
      modalBody.innerHTML = `
        <div class="lesson-step-card">
          <div class="lesson-step-num">1</div>
          <div class="lesson-step-content">
            <h4>Torricelli's Law: v = √(2gh)</h4>
            <p>Torricelli discovered that liquid shooting out from a hole at depth <em>h</em> below the surface emerges at the <strong>exact same speed</strong> as an object dropped in freefall from the same height: <strong>v = √(2gh)</strong>!</p>
          </div>
        </div>

        <div class="lesson-step-card">
          <div class="lesson-step-num">2</div>
          <div class="lesson-step-content">
            <h4>The Golden Maximum Range Theorem</h4>
            <p>The horizontal range of the water jet is <strong>R = 2√(y·(H - y))</strong>.
            <br>• The farthest possible water jet range is achieved when the hole is drilled exactly at <strong>the halfway mark: y = H / 2</strong>!
            <br>• At this halfway height, the maximum horizontal range equals the total water height: <strong>R_max = H</strong>!</p>
          </div>
        </div>

        <h3>🎯 Student Challenges</h3>
        <div class="challenge-item">
          <div class="challenge-info">
            <h4>Challenge: Max Range Bullseye</h4>
            <p>Place the orifice hole at the optimal height to maximize the jet distance and hit Pip's bucket!</p>
          </div>
          <button class="challenge-btn" onclick="app.launchChallenge('torricelli_catch')">Start Challenge</button>
        </div>
      `;
    }
  }

  launchChallenge(type) {
    document.getElementById("modal-overlay").classList.remove("active");
    if (type === "gravity_orbit") {
      this.switchModule("gravity");
      if (this.currentSim) {
        this.currentSim.launchSpeed = 4.65;
        this.currentSim.fireCannon();
      }
    } else if (type === "bernoulli_lift") {
      this.switchModule("bernoulli");
      this.setBernoulliMode("airfoil");
      if (this.currentSim) {
        this.currentSim.airspeed = 6.0;
        this.currentSim.angleAttack = 10.0;
      }
    } else if (type === "torricelli_catch") {
      this.switchModule("torricelli");
      if (this.currentSim) {
        this.currentSim.holeHeight = this.currentSim.waterHeight / 2;
        this.currentSim.updateWaterLevelMesh();
        this.currentSim.catchJetWithPenguin();
      }
    }
  }

  showToast(msg) {
    const toast = document.getElementById("toast-msg");
    if (toast) {
      toast.textContent = msg;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2400);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const dt = (now - this.lastTime) * 0.001 * (this.isPaused ? 0 : this.simSpeed);
    this.lastTime = now;

    if (this.controls) {
      this.controls.update();
    }

    if (this.currentSim && this.currentSim.update) {
      this.currentSim.update(dt);
    }

    this.updateHUDMath();
    this.renderer.render(this.scene, this.camera);
  }
}

// Global hook
window.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
