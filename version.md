# Physics Wonderland - Version Ledger

> **IMMUTABLE POLICY:** This ledger is strictly **APPEND-ONLY**.
> Existing entries must **NEVER** be deleted, edited, truncated, or modified under any circumstances.
> All new releases, features, patches, or architectural adjustments must be added solely by appending to the end of this document.

---

## [v1.0.0] - 2026-10-03
- **Commit:** Initial Release (Signed)
- **Author:** saltymother <saltymother@users.noreply.github.com>
- **Type:** Initial Release / 3D Interactive Simulation
- **Status:** Deployed & Verified
- **GitHub Pages:** https://saltymother.github.io/physics-wonderland/
- **Repository:** https://github.com/saltymother/physics-wonderland
- **Summary:**
  - Designed and built interactive 3D physics laboratory using Three.js and custom cartoon shaders.
  - Implemented Bernoulli's principle simulation with real-time pressure differential and airflow velocity visualization.
  - Implemented Torricelli's Law fluid dynamics efflux experiment.
  - Implemented 3D projectile kinematics simulation with gravity vector adjustment and trajectory trails.
  - Packaged macOS desktop application bundle (`PhysicsWonderland.app`).
  - Added `.nojekyll` and GitHub Actions automated deployment workflow (`.github/workflows/deploy.yml`).

## [v1.1.0] - 2026-10-04
- **Commit:** Pending Signed Commit
- **Author:** saltymother <saltymother@users.noreply.github.com>
- **Type:** Feature | Mobile Responsiveness & Touch Architecture
- **Status:** Deployed & Verified
- **GitHub Pages:** https://saltymother.github.io/physics-wonderland/
- **Summary:**
  - Designed responsive mobile layout preventing overlapping and crowded controls across small screens.
  - Implemented slide-up bottom drawer sheets for interactive controls and live physics equations with close handles.
  - Added mobile quick-access bottom toolbar for switching between simulation controls, formulas, and student lessons.
  - Added touch gesture support for OrbitControls and fallback controls with `touch-action: none`.
  - Added responsive header with horizontally scrollable physics module navigation.
