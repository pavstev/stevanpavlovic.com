// Global intensity state
let intensityFactor = 1.0;

// Shades of Emerald/Teal for a unified, sharp look
const COLORS = [
  "#064e3b", // Emerald-900
  "#065f46", // Emerald-800
  "#047857", // Emerald-700
  "#059669", // Emerald-600
  "#10b981", // Emerald-500
  "#34d399", // Emerald-400
  "#6ee7b7", // Emerald-300
];

class Particle {
  color: string;
  isExtra: boolean;
  life: number;
  maxLife: number;
  size: number;
  vx: number;
  vy: number;
  x: number;
  y: number;

  constructor(w: number, h: number, isInitial = false, isExtra = false) {
    this.isExtra = isExtra;
    this.maxLife = Math.random() * 100 + 50;
    this.life = isInitial ? Math.random() * this.maxLife : this.maxLife;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.size = Math.random() * 1.5 + 0.5;

    // Position and velocity initialized in reset
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.reset(w, h, isInitial);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    let opacity = Math.max(0, this.life / this.maxLife);

    if (this.isExtra) {
      const extraFade = Math.max(0, Math.min(1, (intensityFactor - 1) * 4));
      opacity *= extraFade;
    }

    if (opacity <= 0) {
      return;
    }

    // Length scales with intensity and vertical speed
    const lengthFactor = 1 + (intensityFactor - 1) * 6;
    const length = Math.abs(this.vy) * 8 * lengthFactor;

    // Tapered look: pointy at the top (head), thicker at the bottom (tail)
    const headX = this.x;
    const headY = this.y;
    const tailX = this.x - this.vx * length * 0.2;
    const tailY = this.y - this.vy * length * 0.2;

    ctx.strokeStyle = this.hexToRgba(this.color, opacity);
    ctx.lineWidth = this.size * (1 + (intensityFactor - 1) * 2.5);
    ctx.lineCap = "butt"; // Sharp ends

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(headX, headY);
    ctx.stroke();
  }

  reset(w: number, h: number, isInitial = false): void {
    this.life = this.maxLife;
    this.size = Math.random() * 1.5 + 0.5;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Spawn at the bottom area, concentrated towards the center
    const spawnWidth = w * 0.4;
    this.x = (w / 2 - spawnWidth / 2) + Math.random() * spawnWidth;
    this.y = isInitial ? Math.random() * h : h + Math.random() * 100;

    // Upward velocity (negative Y)
    const baseSpeed = Math.random() * 2 + 1;
    this.vy = -baseSpeed;

    // Horizontal spread based on distance from center to create cone shape
    const centerX = w / 2;
    const spreadFactor = (this.x - centerX) / (w / 2);
    this.vx = spreadFactor * baseSpeed * 0.8;
  }

  update(w: number, h: number): void {
    // Apply intensity to speed
    const speedMult = 1 + (intensityFactor - 1) * 0.5;
    this.x += this.vx * speedMult;
    this.y += this.vy * speedMult;
    this.life--;

    // Reset if out of bounds (top or sides) or dead
    if (this.life <= 0 || this.y < -100 || this.x < -100 || this.x > w + 100) {
      this.reset(w, h);
    }
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(alpha)})`;
  }
}

export const initHeroAnimation = (): void => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const canvas = document.querySelector<HTMLCanvasElement>("#hero-canvas");
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  const ctx = context;

  let width = 0;
  let height = 0;
  let particles: Particle[] = [];

  const PARTICLE_COUNT = 400;

  const initParticles = (): void => {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isExtra = i >= PARTICLE_COUNT / 2;
      particles.push(new Particle(width, height, true, isExtra));
    }
  };

  const resize = (): void => {
    const parent = canvas.parentElement;
    if (parent) {
      width = parent.offsetWidth;
      height = parent.offsetHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${String(width)}px`;
      canvas.style.height = `${String(height)}px`;

      ctx.scale(dpr, dpr);
    }
    initParticles();
  };

  const animate = (): void => {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    for (const p of particles) {
      p.update(width, height);
      p.draw(ctx);
    }

    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(animate);
  };

  window.addEventListener("resize", resize);

  window.addEventListener("hero:intensity", ((e: CustomEvent<number>) => {
    intensityFactor = e.detail;
  }) as EventListener);

  resize();
  animate();
};
