class ParticleSphere {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.particles = [];
    this.particleCount = 180;
    this.radius = 220;

    this.angleX = 0.002;
    this.angleY = 0.003;
    this.rotSpeedX = 0.002;
    this.rotSpeedY = 0.003;
    this.targetRotSpeed = 0.003;

    this.isSpinning = false;
    this.isCollapsing = false;
    this.isExploding = false;
    this.explosionProgress = 0;

    this.candidateNames = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = this.canvas.parentElement.clientWidth;
    this.height = this.canvas.parentElement.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = Math.min(this.width, this.height) * 0.28;
  }

  setCandidates(namesList) {
    this.candidateNames = namesList.length > 0 ? namesList : ['Smart Factory', 'IoT Node', 'Cyber Event'];
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    const total = Math.max(this.particleCount, this.candidateNames.length);

    // Golden spiral distribution on 3D Sphere surface
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < total; i++) {
      const y = 1 - (i / (total - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const nameObj = this.candidateNames[i % this.candidateNames.length];
      const displayName = typeof nameObj === 'string' ? nameObj : (nameObj.name || nameObj.id);

      this.particles.push({
        origX: x * this.radius,
        origY: y * this.radius,
        origZ: z * this.radius,
        x: x * this.radius,
        y: y * this.radius,
        z: z * this.radius,
        vx: 0,
        vy: 0,
        vz: 0,
        name: displayName,
        color: i % 4 === 0 ? '#00f3ff' : i % 4 === 1 ? '#ff9e00' : i % 4 === 2 ? '#00ff88' : '#ffffff',
        size: Math.random() * 2 + 2.5
      });
    }
  }

  startSpin() {
    this.isSpinning = true;
    this.isCollapsing = false;
    this.isExploding = false;
    this.targetRotSpeed = 0.08; // High speed swirl
  }

  stopSpinAndExplode(callback) {
    this.isSpinning = false;
    this.isCollapsing = true;

    // Fast particle collapse towards core
    let duration = 800; // ms
    let startTime = performance.now();

    const animateCollapse = (now) => {
      let elapsed = now - startTime;
      let p = Math.min(elapsed / duration, 1);

      this.particles.forEach(pt => {
        pt.x = pt.origX * (1 - p * 0.9);
        pt.y = pt.origY * (1 - p * 0.9);
        pt.z = pt.origZ * (1 - p * 0.9);
      });

      if (p < 1) {
        requestAnimationFrame(animateCollapse);
      } else {
        // Shockwave burst!
        this.isCollapsing = false;
        this.isExploding = true;
        this.explosionProgress = 0;
        this.targetRotSpeed = 0.003;
        if (callback) callback();
      }
    };

    requestAnimationFrame(animateCollapse);
  }

  update() {
    // Smooth speed interpolation
    this.rotSpeedX += (this.targetRotSpeed - this.rotSpeedX) * 0.05;
    this.rotSpeedY += (this.targetRotSpeed - this.rotSpeedY) * 0.05;

    this.angleX += this.rotSpeedX;
    this.angleY += this.rotSpeedY;

    const cosX = Math.cos(this.rotSpeedX);
    const sinX = Math.sin(this.rotSpeedX);
    const cosY = Math.cos(this.rotSpeedY);
    const sinY = Math.sin(this.rotSpeedY);

    if (this.isExploding) {
      this.explosionProgress += 0.04;
      if (this.explosionProgress >= 1) {
        this.isExploding = false;
      }
    }

    this.particles.forEach(p => {
      if (!this.isCollapsing) {
        // 3D rotation matrix
        let y1 = p.origY * cosX - p.origZ * sinX;
        let z1 = p.origZ * cosX + p.origY * sinX;
        let x2 = p.origX * cosY + z1 * sinY;
        let z2 = z1 * cosY - p.origX * sinY;

        p.origX = x2;
        p.origY = y1;
        p.origZ = z2;

        if (this.isExploding) {
          const factor = 1 + Math.sin(this.explosionProgress * Math.PI) * 1.5;
          p.x = p.origX * factor;
          p.y = p.origY * factor;
          p.z = p.origZ * factor;
        } else {
          p.x = p.origX;
          p.y = p.origY;
          p.z = p.origZ;
        }
      }
    });

    // Sort by depth Z for correct perspective layering
    this.particles.sort((a, b) => a.z - b.z);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const fov = 350;

    // Draw central glowing energy core
    const coreGlow = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 10,
      this.centerX, this.centerY, this.radius * 0.9
    );
    coreGlow.addColorStop(0, 'rgba(0, 243, 255, 0.25)');
    coreGlow.addColorStop(0.6, 'rgba(0, 243, 255, 0.05)');
    coreGlow.addColorStop(1, 'transparent');
    this.ctx.fillStyle = coreGlow;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius * 0.9, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw connecting neon web lines for nearest particles
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i < this.particles.length; i += 3) {
      const p1 = this.particles[i];
      const scale1 = fov / (fov + p1.z);
      const projX1 = this.centerX + p1.x * scale1;
      const projY1 = this.centerY + p1.y * scale1;

      for (let j = i + 1; j < this.particles.length; j += 6) {
        const p2 = this.particles[j];
        const distSq = (p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2;

        if (distSq < (this.radius * 0.45)**2) {
          const scale2 = fov / (fov + p2.z);
          const projX2 = this.centerX + p2.x * scale2;
          const projY2 = this.centerY + p2.y * scale2;

          const alpha = (1 - Math.sqrt(distSq) / (this.radius * 0.45)) * 0.25 * ((p1.z + this.radius) / (2 * this.radius));
          this.ctx.strokeStyle = `rgba(0, 243, 255, ${alpha.toFixed(3)})`;
          this.ctx.beginPath();
          this.ctx.moveTo(projX1, projY1);
          this.ctx.lineTo(projX2, projY2);
          this.ctx.stroke();
        }
      }
    }

    // Draw Particles & Floating Names
    this.particles.forEach((p, idx) => {
      const scale = fov / (fov + p.z);
      const projX = this.centerX + p.x * scale;
      const projY = this.centerY + p.y * scale;

      const alpha = Math.max(0.15, (p.z + this.radius) / (2 * this.radius));

      // Draw particle glowing dot
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      this.ctx.arc(projX, projY, Math.max(1, p.size * scale), 0, Math.PI * 2);
      this.ctx.fill();

      // Show name label for prominent front facing nodes
      if (alpha > 0.65 && idx % 2 === 0) {
        this.ctx.font = `${Math.round(11 * scale)}px Orbitron, sans-serif`;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(p.name, projX + 8 * scale, projY + 4 * scale);
      }
    });

    this.ctx.globalAlpha = 1.0;
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

window.ParticleSphere = ParticleSphere;
