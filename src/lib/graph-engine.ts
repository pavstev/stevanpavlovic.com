/**
 * Force-directed graph engine for RelationalDataGraph
 */

export interface GraphData {
  links: GraphLink[];
  nodes: GraphNode[];
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphNode {
  [key: string]: unknown;
  bg?: string;
  border?: string;
  data?: GraphNodeData;
  id: string;
  label: string;
  radius?: number;
  type: string;
  vx?: number;
  vy?: number;
  x?: number;
  y?: number;
}

export interface GraphNodeData {
  [key: string]: unknown;
}

export interface ProcessedLink {
  source: ProcessedNode;
  target: ProcessedNode;
}

export interface ProcessedNode extends GraphNode {
  bg: string;
  border: string;
  radius: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

export interface ThemeConfig {
  color: string;
  colorToken?: string;
  icon?: string;
  radius: number;
}

export type ThemeMap = Record<string, ThemeConfig>;

interface Camera {
  targetX: number;
  targetY: number;
  targetZoom: number;
  x: number;
  y: number;
  zoom: number;
}

interface WorldPosition {
  x: number;
  y: number;
}

export class GraphEngine {
  // Camera state
  private cam: Camera = {
    targetX: 0,
    targetY: 0,
    targetZoom: 0.8,
    x: 0,
    y: 0,
    zoom: 0.8,
  };

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: GraphData;
  private dragNode: null | ProcessedNode = null;
  private height: number = 0;
  private hoverNode: null | ProcessedNode = null;
  private isDragging = false;
  private links: ProcessedLink[] = [];

  // Physics state
  private nodes!: ProcessedNode[];
  private themeMap: ThemeMap;
  private width: number = 0;

  constructor(canvas: HTMLCanvasElement, data: GraphData, themeMap: ThemeMap) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Could not get canvas context");
    this.ctx = context;
    this.data = data;
    this.themeMap = themeMap;

    this.init();
  }

  public resetView(): void {
    this.cam.targetX = this.width / 2;
    this.cam.targetY = this.height / 2;
    this.cam.targetZoom = 0.8;
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.save();

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this.cam.zoom, this.cam.zoom);
    this.ctx.translate(-this.width / 2 + this.cam.x, -this.height / 2 + this.cam.y);

    // Links
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = this.getThemeColor("--color-border");
    this.ctx.beginPath();
    for (const link of this.links) {
      this.ctx.moveTo(link.source.x, link.source.y);
      this.ctx.lineTo(link.target.x, link.target.y);
    }
    this.ctx.stroke();

    // Nodes
    for (const node of this.nodes) {
      const isHover = node === this.hoverNode;
      const r = node.radius + (isHover ? 4 : 0);

      if (isHover) {
        this.ctx.shadowColor = node.bg;
        this.ctx.shadowBlur = 15;
      }

      this.ctx.fillStyle = node.bg;
      this.ctx.strokeStyle = isHover ? this.getThemeColor("--color-primary") : node.border;
      this.ctx.lineWidth = isHover ? 2 : 1;

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      if (r > 8 || isHover) {
        this.ctx.font = isHover ? "600 12px Inter, sans-serif" : "500 10px Inter, sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = this.getThemeColor("--color-foreground");
        this.ctx.fillText(node.label, node.x, node.y + r + 15);
      }
    }

    this.ctx.restore();
  }

  private getThemeColor(varName: string): string {
    if (varName.startsWith("#") || varName.startsWith("hsl") || varName.startsWith("rgb")) {
      return varName;
    }
    const root = getComputedStyle(document.documentElement);
    const hsl = root.getPropertyValue(varName).trim();
    if (!hsl) return "#888";
    return `hsl(${hsl})`;
  }

  private getWorldPos(clientX: number, clientY: number): WorldPosition {
    const rect = this.canvas.getBoundingClientRect();
    const cx = this.width / 2;
    const cy = this.height / 2;
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    return {
      x: (mx - cx) / this.cam.zoom - (this.cam.x - cx) + cx,
      y: (my - cy) / this.cam.zoom - (this.cam.y - cy) + cy,
    };
  }

  private init(): void {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    // Set initial camera to center
    this.cam.x = this.width / 2;
    this.cam.y = this.height / 2;
    this.cam.targetX = this.cam.x;
    this.cam.targetY = this.cam.y;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.nodes = this.data.nodes.map((n): ProcessedNode => {
      const config = this.themeMap[n.type] || { color: "var(--color-primary)", radius: 10 };
      const color = this.getThemeColor(config.color);

      return {
        ...n,
        bg: color,
        border: this.getThemeColor("--color-border"),
        radius: config.radius,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
      };
    });

    const nodeMap = new Map<ProcessedNode["id"], ProcessedNode>(this.nodes.map((n) => [n.id, n]));
    this.links = this.data.links
      .map((l): ProcessedLink | undefined => {
        const source = nodeMap.get(l.source);
        const target = nodeMap.get(l.target);
        if (source && target) {
          return { source, target };
        }
        return undefined;
      })
      .filter((l): l is ProcessedLink => l !== undefined);

    this.setupListeners();
    this.render();
  }

  private render(): void {
    this.update();
    this.draw();
    requestAnimationFrame(() => {
      this.render();
    });
  }

  private setupListeners(): void {
    this.canvas.addEventListener("mousedown", () => {
      if (this.hoverNode) {
        this.isDragging = true;
        this.dragNode = this.hoverNode;
      }
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      this.dragNode = null;
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const pos = this.getWorldPos(e.clientX, e.clientY);

      let found: null | ProcessedNode = null;
      let minDist = Infinity;

      for (const node of this.nodes) {
        const dx = node.x - pos.x;
        const dy = node.y - pos.y;
        const dist = dx * dx + dy * dy;
        const hitRadius = (node.radius + 10) ** 2;

        if (dist < hitRadius && dist < minDist) {
          minDist = dist;
          found = node;
        }
      }

      this.hoverNode = found;
      this.canvas.style.cursor = this.hoverNode ? "pointer" : this.isDragging ? "grabbing" : "grab";

      if (this.isDragging && this.dragNode) {
        this.dragNode.x = pos.x;
        this.dragNode.y = pos.y;
        this.dragNode.vx = 0;
        this.dragNode.vy = 0;
      }

      // Dispatch event for tooltip
      const event = new CustomEvent("graph-hover", {
        detail: { node: this.hoverNode, x: e.clientX, y: e.clientY },
      });
      this.canvas.dispatchEvent(event);
    });

    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.cam.targetZoom += e.deltaY * -0.001;
        this.cam.targetZoom = Math.min(Math.max(0.1, this.cam.targetZoom), 4);
      },
      { passive: false },
    );
  }

  private update(): void {
    this.cam.x += (this.cam.targetX - this.cam.x) * 0.1;
    this.cam.y += (this.cam.targetY - this.cam.y) * 0.1;
    this.cam.zoom += (this.cam.targetZoom - this.cam.zoom) * 0.1;

    const gravity = 0.03;
    const friction = 0.88;
    const repulsion = 400;
    const spring = 0.02;
    const linkDistance = 120;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      node.vx -= (node.x - this.width / 2) * gravity * 0.05;
      node.vy -= (node.y - this.height / 2) * gravity * 0.05;

      for (let j = i + 1; j < this.nodes.length; j++) {
        const other = this.nodes[j];
        const dx = other.x - node.x;
        const dy = other.y - node.y;
        const distSq = dx * dx + dy * dy || 1;

        if (distSq < 100000) {
          const force = (repulsion * 50) / distSq;
          const angle = Math.atan2(dy, dx);
          const fx = Math.cos(angle) * force;
          const fy = Math.sin(angle) * force;

          node.vx -= fx;
          node.vy -= fy;
          other.vx += fx;
          other.vy += fy;
        }
      }
    }

    for (const link of this.links) {
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - linkDistance) * spring;
      const angle = Math.atan2(dy, dx);
      const fx = Math.cos(angle) * force;
      const fy = Math.sin(angle) * force;

      link.source.vx += fx;
      link.source.vy += fy;
      link.target.vx -= fx;
      link.target.vy -= fy;
    }

    for (const node of this.nodes) {
      if (node === this.dragNode) continue;
      node.vx *= friction;
      node.vy *= friction;
      node.x += node.vx;
      node.y += node.vy;
    }
  }
}
