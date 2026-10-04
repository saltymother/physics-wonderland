# ⚛️ Physics Wonderland 3D

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://saltymother.github.io/physics-wonderland/)
[![Status](https://img.shields.io/badge/Status-Deployed%20%26%20Verified-success?style=for-the-badge)](https://saltymother.github.io/physics-wonderland/)

> 🌐 **Live Web Application**: [https://saltymother.github.io/physics-wonderland/](https://saltymother.github.io/physics-wonderland/)  
> 📱 *Fully responsive for desktop workstations, iPads, and mobile smartphones with touch orbit controls and collapsible slide-up parameter drawers!*

An interactive, animated 3D physics laboratory application designed for modern web browsers and macOS to teach students fundamental physical laws using vibrant motion, procedural 3D cartoon characters, and live mathematical calculations.

---

## 🚀 Quick Launch

### 1. In Google Chrome (Already Active)
The app is currently served and running live in Google Chrome at:
```
http://localhost:8765/index.html
```

### 2. Double-Click macOS Native App
You can also launch it directly from macOS Finder:
```
/Users/vaibhav/Antigravity/physics_wonderland/PhysicsWonderland.app
```
Or run from Terminal:
```bash
/Users/vaibhav/Antigravity/physics_wonderland/launch.sh
```

---

## 🌟 Interactive Physics Modules

### 🪐 1. Universal Gravitation & Orbital Mechanics
* **Key Concept**: Newton's Law of Universal Gravitation and Newton's Cannonball thought experiment.
* **Master Formula**:
  $$F_g = G \frac{M \cdot m}{r^2}$$
* **Orbital & Escape Velocity**:
  $$v_{circ} = \sqrt{\frac{G \cdot M}{r}}, \quad v_{esc} = \sqrt{\frac{2 \cdot G \cdot M}{r}}$$
* **Features & Cartoons**:
  - **Sir Isaac Newton 3D Character**: Animated 17th-century scholar with powdered wig, gold-buttoned jacket, and blinking cartoon eyes that track projectile flight.
  - **Spacetime Curvature Grid**: Dynamic 3D rubber-sheet spacetime well warping under the planet's mass.
  - **Newton's Cannon**: Fire cannonballs at varying speeds. Watch them fall to Earth, enter stable elliptical/circular orbit, or escape to deep space!
  - **Apple Drop Experiment**: Drop apples to observe constant gravitational acceleration ($g$) with optional air drag.
  - **Celestial Bodies**: Switch between Earth ($1.0 M_\oplus$), Moon ($0.2 M_\oplus$), and Jupiter ($2.5 M_\oplus$).

---

### 💨 2. Bernoulli's Theorem & Fluid Mechanics
* **Key Concept**: Conservation of energy in flowing fluids and the relationship between velocity and static pressure.
* **Master Formula**:
  $$P_1 + \frac{1}{2}\rho v_1^2 + \rho g y_1 = P_2 + \frac{1}{2}\rho v_2^2 + \rho g y_2 = \text{constant}$$
* **Continuity Equation**:
  $$A_1 v_1 = A_2 v_2 \implies v_2 = v_1 \left(\frac{A_1}{A_2}\right)$$
* **Venturi Tube Simulation**:
  - Transparent glass constriction pipe with color-coded fluid particles:
    - **Deep Blue**: Slow velocity, high internal pressure.
    - **Amber / Red**: High velocity in the narrow constriction throat, low internal pressure!
  - Three vertical **Manometer tubes** where liquid column heights visually reflect the pressure drop ($\Delta P$).
* **Dynamic Airplane Wing Lift Demonstration**:
  - Airfoil section with smoke streamlines curving over the cambered top surface.
  - **Captain Bernoulli 3D Airplane**: Cartoon monoplane with spinning propeller and fluttering pilot scarf that generates upward lift ($L = \frac{1}{2} C_L \rho v^2 S$) and takes off into the sky!

---

### 💧 3. Torricelli's Law & Liquid Efflux
* **Key Concept**: The speed of efflux of liquid from an open container under gravity.
* **Master Formula**:
  $$v = \sqrt{2gh} \quad (\text{where } h = H - y)$$
* **Horizontal Jet Range & The Halfway Theorem**:
  $$R = 2\sqrt{y(H - y)}$$
  - **Maximum Range Theorem**: Farthest water jet distance occurs when the hole is drilled at exactly the halfway point:
    $$y = \frac{H}{2} \implies R_{max} = H$$
* **Features & Cartoons**:
  - **Graduated 3D Water Tank**: Real-time water surface rendering, movable orifice valve, and selectable fluids (Water, Honey, Mercury).
  - **Dynamic Parabolic Jet**: Real-time calculated 3D jet curve with splashing droplet particle emitter.
  - **Pippy the Penguin Mascot**: 3D cartoon penguin with an engineer hard hat and wooden bucket that waddles along the ground ruler to catch the water stream with celebration fanfare!

---

## 🎓 Student Learning Features

* **Live Mathematical HUD**: Real-time arithmetic display showing variables plugged into formulas at 60 FPS.
* **Student Masterclass Modal**: Step-by-step cartoon lessons explaining the "Why?" behind each law.
* **Interactive Challenges**:
  1. *Achieve Stable Orbit*: Find the precise velocity to circle the globe without crashing.
  2. *Takeoff Lift*: Generate sufficient aerodynamic lift to achieve airborne flight.
  3. *Max Range Bullseye*: Position the orifice to maximize the horizontal trajectory and fill Pippy's bucket.
* **Procedural Sound Synthesizer**: Zero-dependency Web Audio API audio (cannon booms, water splashes, flight whooshes, and celebratory fanfares).
* **Multi-Angle Camera Presets**:
  - 🎥 3D Cinematic Angle (Free Orbit / Pan / Zoom)
  - 📐 Front Profile / Cross-Section
  - 🛸 Top-Down View
