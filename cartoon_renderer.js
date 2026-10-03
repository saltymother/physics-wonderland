// Cartoon Character Meshes & 3D Helpers
// Creates expressive, procedural 3D cartoon characters using Three.js

const CartoonRenderer = {
  // Vibrant cartoon colors
  palette: {
    skin: 0xffdfc4,
    wig: 0xf8fafc,
    coatBlue: 0x2563eb,
    gold: 0xf59e0b,
    pants: 0x1e293b,
    appleRed: 0xef4444,
    leafGreen: 0x22c55e,
    wood: 0x92400e,
    waterBlue: 0x06b6d4,
    jetBlue: 0x38bdf8,
    penguinBlack: 0x1e293b,
    penguinWhite: 0xffffff,
    penguinBeak: 0xf97316,
    pilotLeather: 0x78350f,
    airplaneRed: 0xe11d48,
    metalSilver: 0x94a3b8
  },

  // Helper to create toon-like material
  createToonMaterial(color, roughness = 0.4) {
    if (!window.THREE) return null;
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: roughness,
      metalness: 0.1
    });
  },

  // Build Sir Isaac Newton character
  buildNewton() {
    const group = new THREE.Group();

    // Body / Coat
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.45, 0.9, 16);
    const bodyMat = this.createToonMaterial(this.palette.coatBlue);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    group.add(body);

    // Gold Coat Buttons
    for (let i = 0; i < 3; i++) {
      const btnGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const btnMat = this.createToonMaterial(this.palette.gold);
      const btn = new THREE.Mesh(btnGeo, btnMat);
      btn.position.set(0, 0.85 - i * 0.15, 0.38 - i * 0.03);
      group.add(btn);
    }

    // White Cravat / Neck Tie
    const cravatGeo = new THREE.BoxGeometry(0.18, 0.22, 0.08);
    const cravatMat = this.createToonMaterial(0xffffff);
    const cravat = new THREE.Mesh(cravatGeo, cravatMat);
    cravat.position.set(0, 1.05, 0.33);
    cravat.rotation.x = 0.2;
    group.add(cravat);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.35, 0);

    const headGeo = new THREE.SphereGeometry(0.32, 20, 20);
    const headMat = this.createToonMaterial(this.palette.skin);
    const head = new THREE.Mesh(headGeo, headMat);
    headGroup.add(head);

    // Powdered Wig (Curled 17th century style)
    const wigMat = this.createToonMaterial(this.palette.wig);
    const wigTopGeo = new THREE.SphereGeometry(0.34, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const wigTop = new THREE.Mesh(wigTopGeo, wigMat);
    wigTop.position.set(0, 0.05, -0.02);
    headGroup.add(wigTop);

    // Wig side curls
    [-0.26, 0.26].forEach(x => {
      const curlGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 12);
      const curl = new THREE.Mesh(curlGeo, wigMat);
      curl.position.set(x, -0.1, -0.05);
      curl.rotation.z = x > 0 ? -0.2 : 0.2;
      headGroup.add(curl);
    });

    // Big Cartoon Eyes
    const eyeWhiteGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilGeo = new THREE.SphereGeometry(0.04, 10, 10);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

    const leftEyeGroup = new THREE.Group();
    const rightEyeGroup = new THREE.Group();

    const leftWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0, 0, 0.055);
    leftEyeGroup.add(leftWhite, leftPupil);
    leftEyeGroup.position.set(-0.11, 0.04, 0.26);

    const rightWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0, 0, 0.055);
    rightEyeGroup.add(rightWhite, rightPupil);
    rightEyeGroup.position.set(0.11, 0.04, 0.26);

    headGroup.add(leftEyeGroup, rightEyeGroup);

    // Smiling Cartoon Mouth
    const mouthGeo = new THREE.TorusGeometry(0.06, 0.018, 8, 16, Math.PI);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.12, 0.29);
    mouth.rotation.x = Math.PI * 0.9;
    headGroup.add(mouth);

    // Rosy Cheeks
    [-0.18, 0.18].forEach(x => {
      const cheekGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const cheekMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
      const cheek = new THREE.Mesh(cheekGeo, cheekMat);
      cheek.position.set(x, -0.06, 0.26);
      headGroup.add(cheek);
    });

    group.add(headGroup);

    // Left Arm holding Apple
    const armMat = this.createToonMaterial(this.palette.coatBlue);
    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.45, 10);

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.38, 1.05, 0.05);

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(0, -0.18, 0.1);
    leftArm.rotation.x = 0.8;
    leftArm.rotation.z = 0.2;
    leftArmGroup.add(leftArm);

    // Apple in hand
    const appleGroup = new THREE.Group();
    appleGroup.position.set(-0.06, -0.32, 0.28);

    const appleGeo = new THREE.SphereGeometry(0.1, 14, 14);
    const appleMat = this.createToonMaterial(this.palette.appleRed);
    const apple = new THREE.Mesh(appleGeo, appleMat);

    const stemGeo = new THREE.CylinderGeometry(0.01, 0.015, 0.06, 6);
    const stemMat = this.createToonMaterial(this.palette.wood);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.09;

    const leafGeo = new THREE.ConeGeometry(0.03, 0.06, 5);
    const leafMat = this.createToonMaterial(this.palette.leafGreen);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0.02, 0.09, 0);
    leaf.rotation.z = -1;

    appleGroup.add(apple, stem, leaf);
    leftArmGroup.add(appleGroup);
    group.add(leftArmGroup);

    // Right Arm pointing or gesturing
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.38, 1.05, 0.05);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0, -0.18, 0.1);
    rightArm.rotation.x = 0.6;
    rightArm.rotation.z = -0.3;
    rightArmGroup.add(rightArm);

    // Hand
    const handGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const handMat = this.createToonMaterial(this.palette.skin);
    const rightHand = new THREE.Mesh(handGeo, handMat);
    rightHand.position.set(0, -0.36, 0.22);
    rightArmGroup.add(rightHand);

    group.add(rightArmGroup);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.45, 10);
    const legMat = this.createToonMaterial(this.palette.pants);
    const shoeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.22);
    const shoeMat = this.createToonMaterial(0x09090b);

    [-0.15, 0.15].forEach(x => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, 0.22, 0);
      const shoe = new THREE.Mesh(shoeGeo, shoeMat);
      shoe.position.set(x, 0.05, 0.04);
      group.add(leg, shoe);
    });

    // Store references for animation
    group.userData = {
      head: headGroup,
      leftArm: leftArmGroup,
      rightArm: rightArmGroup,
      apple: appleGroup,
      pupils: [leftPupil, rightPupil],
      originalY: 0,
      blinkTimer: 0,
      waveTimer: 0
    };

    return group;
  },

  // Build Captain Bernoulli & Cartoon Airplane
  buildBernoulliAirplane() {
    const plane = new THREE.Group();

    // Fuselage (Chubby cartoon airplane body)
    const bodyGeo = new THREE.SphereGeometry(0.5, 20, 20);
    bodyGeo.scale(1, 0.9, 1.8);
    const bodyMat = this.createToonMaterial(this.palette.airplaneRed);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    plane.add(body);

    // Yellow stripe
    const stripeGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.2, 20);
    stripeGeo.scale(1, 1, 1.4);
    const stripeMat = this.createToonMaterial(this.palette.gold);
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.rotation.x = Math.PI / 2;
    stripe.position.z = 0.1;
    plane.add(stripe);

    // Main Wings (Aerodynamic Cambered Profile)
    const wingGeo = new THREE.BoxGeometry(3.6, 0.08, 0.7);
    const wingMat = this.createToonMaterial(0xffffff);
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 0.12, 0);
    plane.add(wing);

    // Tail Fin / Rudder
    const tailGeo = new THREE.BoxGeometry(0.08, 0.55, 0.4);
    const tail = new THREE.Mesh(tailGeo, this.createToonMaterial(this.palette.airplaneRed));
    tail.position.set(0, 0.45, -0.85);
    plane.add(tail);

    // Tail Stabilizer
    const stabGeo = new THREE.BoxGeometry(1.2, 0.05, 0.3);
    const stab = new THREE.Mesh(stabGeo, this.createToonMaterial(0xffffff));
    stab.position.set(0, 0.3, -0.85);
    plane.add(stab);

    // Propeller Nose Cone & Blades
    const noseGeo = new THREE.ConeGeometry(0.18, 0.35, 16);
    const noseMat = this.createToonMaterial(this.palette.metalSilver);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.z = 0.95;
    plane.add(nose);

    const propGroup = new THREE.Group();
    propGroup.position.set(0, 0, 1.05);

    const bladeMat = this.createToonMaterial(0x1e293b);
    [-0.35, 0.35].forEach(y => {
      const bladeGeo = new THREE.BoxGeometry(0.08, 0.4, 0.02);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = y;
      propGroup.add(blade);
    });
    plane.add(propGroup);

    // Cockpit Cutout & Glass
    const glassGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1
    });
    const windshield = new THREE.Mesh(glassGeo, glassMat);
    windshield.position.set(0, 0.35, 0.3);
    windshield.rotation.x = -0.3;
    plane.add(windshield);

    // Captain Bernoulli Pilot
    const pilot = new THREE.Group();
    pilot.position.set(0, 0.28, 0);

    // Helmet & Head
    const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const helmetMat = this.createToonMaterial(this.palette.pilotLeather);
    const head = new THREE.Mesh(headGeo, helmetMat);

    // Face cutout
    const faceGeo = new THREE.SphereGeometry(0.18, 14, 14);
    const faceMat = this.createToonMaterial(this.palette.skin);
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.set(0, -0.02, 0.08);

    // Aviator Goggles
    const goggleMat = this.createToonMaterial(this.palette.gold);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    [-0.08, 0.08].forEach(x => {
      const ringGeo = new THREE.TorusGeometry(0.06, 0.02, 8, 16);
      const ring = new THREE.Mesh(ringGeo, goggleMat);
      ring.position.set(x, 0.06, 0.22);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.05, 12), lensMat);
      lens.position.set(x, 0.06, 0.22);
      face.add(ring, lens);
    });

    // Mustache / Smile
    const smileGeo = new THREE.TorusGeometry(0.05, 0.015, 6, 12, Math.PI);
    const smile = new THREE.Mesh(smileGeo, new THREE.MeshBasicMaterial({ color: 0x451a03 }));
    smile.position.set(0, -0.07, 0.18);
    smile.rotation.x = Math.PI;
    face.add(smile);

    // Fluttering Scarf
    const scarfMat = this.createToonMaterial(0xffffff);
    const scarfTailGeo = new THREE.BoxGeometry(0.1, 0.04, 0.4);
    const scarf = new THREE.Mesh(scarfTailGeo, scarfMat);
    scarf.position.set(0.18, -0.1, -0.22);
    scarf.rotation.y = 0.3;

    pilot.add(head, face, scarf);
    plane.add(pilot);

    // Store references
    plane.userData = {
      propeller: propGroup,
      pilot: pilot,
      scarf: scarf,
      propSpeed: 0.3,
      liftY: 0
    };

    return plane;
  },

  // Build Pippy the Penguin (Torricelli's Water Splash Assistant)
  buildPippyPenguin() {
    const penguin = new THREE.Group();

    // Body (Round, cuddly cartoon penguin)
    const bodyGeo = new THREE.SphereGeometry(0.35, 18, 18);
    bodyGeo.scale(1, 1.25, 0.9);
    const bodyMat = this.createToonMaterial(this.palette.penguinBlack);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.42;
    penguin.add(body);

    // White Belly
    const bellyGeo = new THREE.SphereGeometry(0.3, 16, 16);
    bellyGeo.scale(0.85, 1.15, 0.5);
    const bellyMat = this.createToonMaterial(this.palette.penguinWhite);
    const belly = new THREE.Mesh(bellyGeo, bellyMat);
    belly.position.set(0, 0.38, 0.22);
    penguin.add(belly);

    // Cute Beak
    const beakGeo = new THREE.ConeGeometry(0.09, 0.18, 10);
    const beakMat = this.createToonMaterial(this.palette.penguinBeak);
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.55, 0.35);
    penguin.add(beak);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.1, 0.1].forEach(x => {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), whiteMat);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeMat);
      pupil.position.set(0, 0, 0.05);
      eyeWhite.add(pupil);
      eyeWhite.position.set(x, 0.65, 0.28);
      penguin.add(eyeWhite);
    });

    // Yellow Engineer Hard Hat (Torricelli Safety First!)
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 0.8, 0.02);

    const hatDomeGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const hatMat = this.createToonMaterial(this.palette.gold);
    const hatDome = new THREE.Mesh(hatDomeGeo, hatMat);

    const hatBrimGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.04, 16);
    const hatBrim = new THREE.Mesh(hatBrimGeo, hatMat);
    hatBrim.position.y = 0.02;

    hatGroup.add(hatDome, hatBrim);
    hatGroup.rotation.x = 0.1;
    penguin.add(hatGroup);

    // Flipper Wings
    const flipperGeo = new THREE.BoxGeometry(0.06, 0.35, 0.16);
    const leftFlipper = new THREE.Mesh(flipperGeo, bodyMat);
    leftFlipper.position.set(-0.36, 0.45, 0.05);
    leftFlipper.rotation.z = 0.25;

    const rightFlipper = new THREE.Mesh(flipperGeo, bodyMat);
    rightFlipper.position.set(0.36, 0.45, 0.05);
    rightFlipper.rotation.z = -0.25;

    penguin.add(leftFlipper, rightFlipper);

    // Wooden Bucket to Catch Water Jet
    const bucketGroup = new THREE.Group();
    bucketGroup.position.set(0, 0.28, 0.45);

    const bucketGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.32, 16, 1, true);
    const bucketMat = this.createToonMaterial(this.palette.wood);
    const bucket = new THREE.Mesh(bucketGeo, bucketMat);

    const bucketBottom = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), bucketMat);
    bucketBottom.rotation.x = Math.PI / 2;
    bucketBottom.position.y = -0.16;

    // Sloshing Water inside bucket
    const bucketWaterGeo = new THREE.CircleGeometry(0.2, 16);
    const bucketWaterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.2
    });
    const bucketWater = new THREE.Mesh(bucketWaterGeo, bucketWaterMat);
    bucketWater.rotation.x = -Math.PI / 2;
    bucketWater.position.y = 0.05;

    bucketGroup.add(bucket, bucketBottom, bucketWater);
    penguin.add(bucketGroup);

    // Yellow Feet
    const footGeo = new THREE.BoxGeometry(0.14, 0.06, 0.24);
    const footMat = this.createToonMaterial(this.palette.penguinBeak);
    [-0.14, 0.14].forEach(x => {
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(x, 0.03, 0.06);
      penguin.add(foot);
    });

    // Store references
    penguin.userData = {
      bucket: bucketGroup,
      bucketWater: bucketWater,
      leftFlipper: leftFlipper,
      rightFlipper: rightFlipper,
      hat: hatGroup,
      waterFill: 0.1,
      waddlePhase: 0,
      targetX: 0
    };

    return penguin;
  },

  // Update UI Speech Bubble
  showSpeechBubble(speaker, text, avatarEmoji = "🍎") {
    const bubbleEl = document.getElementById("speech-bubble-box");
    const speakerEl = document.getElementById("bubble-speaker-name");
    const textEl = document.getElementById("bubble-message");
    const avatarEl = document.getElementById("cartoon-avatar-icon");

    if (speakerEl) speakerEl.textContent = speaker;
    if (textEl) textEl.textContent = text;
    if (avatarEl) avatarEl.textContent = avatarEmoji;

    if (bubbleEl) {
      bubbleEl.style.transform = "scale(0.95)";
      setTimeout(() => {
        bubbleEl.style.transform = "scale(1)";
      }, 100);
    }
  }
};

window.CartoonRenderer = CartoonRenderer;
