// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-restricted-syntax */
export type PhotoTool = "draw" | "erase" | "move";

export interface PhotoViewerOptions {
  canvas?: HTMLCanvasElement;
  container: HTMLElement;
  image: HTMLImageElement;
  maxZoom?: number;
  minZoom?: number;
  zoomStep?: number;
}

export class PhotoViewer {
  // Interaction State
  private activeTool: PhotoTool = "move";
  // Brush Settings
  private brushColor: string = "#ff2d55";
  private brushOpacity: number = 1;
  private brushSize: number = 4;
  private brushSoftness: number = 0;
  private canvas?: HTMLCanvasElement;
  private container: HTMLElement;
  private ctx?: CanvasRenderingContext2D;

  // Filters
  private currentFilter: string = "none";
  // History
  private history: ImageData[] = [];
  private historyIndex: number = -1;
  private image: HTMLImageElement;
  private isDragging: boolean = false;
  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;
  private maxHistory: number = 20;

  private maxZoom: number;
  private minZoom: number;
  private posX: number = 0;
  private posY: number = 0;

  private startX: number = 0;
  private startY: number = 0;
  private zoom: number = 1;

  private zoomStep: number;

  constructor(options: PhotoViewerOptions) {
    this.container = options.container;
    this.image = options.image;
    this.canvas = options.canvas;
    this.minZoom = options.minZoom || 1;
    this.maxZoom = options.maxZoom || 10;
    this.zoomStep = options.zoomStep || 0.25;

    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d", { willReadFrequently: true }) || undefined;
      this.initCanvas();
    }

    this.init();
  }

  // --- Settings ---
  public clearDoodle(): void {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveHistory();
  }

  public download(filename: string): void {
    const containerRect = this.container.getBoundingClientRect();
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = containerRect.width;
    finalCanvas.height = containerRect.height;
    const fctx = finalCanvas.getContext("2d");
    if (!fctx) return;

    if (this.currentFilter !== "none") {
      fctx.filter = this.currentFilter;
    }

    const imgRect = this.image.getBoundingClientRect();
    const offsetX = imgRect.left - containerRect.left;
    const offsetY = imgRect.top - containerRect.top;

    fctx.drawImage(this.image, offsetX, offsetY, imgRect.width, imgRect.height);
    fctx.filter = "none";
    if (this.canvas) {
      fctx.drawImage(this.canvas, offsetX, offsetY, imgRect.width, imgRect.height);
    }

    const link = document.createElement("a");
    link.href = finalCanvas.toDataURL("image/png");
    link.download = filename || "advanced-capture.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public getActiveTool(): PhotoTool {
    return this.activeTool;
  }

  public pan(dx: number, dy: number): void {
    if (this.zoom <= 1) return;
    this.posX += dx;
    this.posY += dy;
    this.applyTransform();
  }

  public redo(): void {
    if (this.historyIndex < this.history.length - 1 && this.ctx) {
      this.historyIndex++;
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
    }
  }

  public reset(): void {
    this.zoom = 1;
    this.posX = 0;
    this.posY = 0;
    this.applyTransform();
  }

  public setBrushColor(color: string): void {
    this.brushColor = color;
  }

  public setBrushOpacity(opacity: number): void {
    this.brushOpacity = opacity;
  }

  public setBrushSize(size: number): void {
    this.brushSize = size;
  }

  public setBrushSoftness(softness: number): void {
    this.brushSoftness = softness;
  }

  public setFilter(filter: string): void {
    this.currentFilter = filter;
    this.image.style.filter = filter === "none" ? "" : filter;
  }

  // --- Tools ---
  public setTool(tool: PhotoTool): void {
    this.activeTool = tool;
    this.updateCursor();
  }

  public undo(): void {
    if (this.historyIndex > 0 && this.ctx) {
      this.historyIndex--;
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
    }
  }

  // --- View Manipulation ---
  public zoomIn(): void {
    this.zoomTo(this.zoom + this.zoomStep);
  }

  public zoomOut(): void {
    this.zoomTo(this.zoom - this.zoomStep);
  }

  public zoomTo(newZoom: number): void {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
    if (this.zoom <= 1) {
      this.reset();
      return;
    }
    this.applyTransform();
  }

  public zoomToActualSize(): void {
    const naturalWidth = this.image.naturalWidth;
    const rect = this.image.getBoundingClientRect();
    const currentWidth = rect.width / this.zoom;
    if (currentWidth > 0) {
      this.zoomTo(naturalWidth / currentWidth);
    }
  }

  private applyTransform(): void {
    const transform = `translate(${this.posX}px, ${this.posY}px) scale(${this.zoom})`;
    this.image.style.transform = transform;
    if (this.canvas) {
      this.canvas.style.transform = transform;
    }

    const event = new CustomEvent("viewer-update", {
      detail: {
        posX: Math.round(this.posX),
        posY: Math.round(this.posY),
        tool: this.activeTool,
        zoom: Math.round(this.zoom * 100),
      },
    });
    this.container.dispatchEvent(event);
  }

  private draw(e: MouseEvent): void {
    if (!this.ctx || !this.canvas || !this.isDrawing) return;

    let { x, y } = this.getCanvasCoords(e);

    // Minimal Autosnapping
    const snapThreshold = 15;
    const dx = Math.abs(x - this.lastX);
    const dy = Math.abs(y - this.lastY);
    if (dx < snapThreshold && dy > snapThreshold * 2) x = this.lastX;
    if (dy < snapThreshold && dx > snapThreshold * 2) y = this.lastY;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);

    if (this.activeTool === "erase") {
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.lineWidth = this.brushSize * 2;
    } else {
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.strokeStyle = this.brushColor;
      this.ctx.globalAlpha = this.brushOpacity;
      this.ctx.lineWidth = this.brushSize;

      if (this.brushSoftness > 0) {
        this.ctx.shadowBlur = this.brushSoftness;
        this.ctx.shadowColor = this.brushColor;
      }
    }

    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.stroke();
    this.ctx.restore();

    this.lastX = x;
    this.lastY = y;
  }

  private getCanvasCoords(e: MouseEvent): { x: number; y: number } {
    const rect = this.image.getBoundingClientRect();
    const localX = (e.clientX - rect.left) / rect.width;
    const localY = (e.clientY - rect.top) / rect.height;

    return {
      x: localX * this.image.naturalWidth,
      y: localY * this.image.naturalHeight,
    };
  }

  // --- Input Handlers ---
  private handleMouseDown(e: MouseEvent): void {
    if (this.activeTool === "draw" || this.activeTool === "erase") {
      this.startDrawing(e);
      return;
    }

    if (this.activeTool === "move") {
      this.isDragging = true;
      this.startX = e.clientX - this.posX;
      this.startY = e.clientY - this.posY;
      this.image.style.cursor = "grabbing";
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.isDrawing) {
      this.draw(e);
      return;
    }

    if (this.isDragging) {
      this.posX = e.clientX - this.startX;
      this.posY = e.clientY - this.startY;
      this.applyTransform();
    }
  }

  private handleMouseUp(): void {
    if (this.isDrawing) {
      this.saveHistory();
    }
    this.isDragging = false;
    this.isDrawing = false;
    this.updateCursor();
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
    this.zoomTo(this.zoom + delta);
  }

  private init(): void {
    this.image.style.transformOrigin = "center";
    this.image.draggable = false;

    this.container.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("mousemove", this.handleMouseMove.bind(this));
    window.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.container.addEventListener("wheel", this.handleWheel.bind(this), { passive: false });

    this.setTool("move");
    this.reset();
  }

  private initCanvas(): void {
    if (!this.canvas) return;
    const updateCanvasSize = (): void => {
      if (!this.canvas) return;
      this.canvas.width = this.image.naturalWidth;
      this.canvas.height = this.image.naturalHeight;
      this.saveHistory();
    };

    if (this.image.complete) {
      updateCanvasSize();
    } else {
      this.image.onload = updateCanvasSize;
    }
  }

  // --- History ---
  private saveHistory(): void {
    if (!this.ctx || !this.canvas) return;
    const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(data);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  // --- Drawing Logic ---
  private startDrawing(e: MouseEvent): void {
    if (!this.ctx || !this.canvas) return;
    this.isDrawing = true;
    const { x, y } = this.getCanvasCoords(e);
    this.lastX = x;
    this.lastY = y;
  }

  private updateCursor(): void {
    switch (this.activeTool) {
      case "draw":
        this.image.style.cursor = "crosshair";
        break;
      case "erase":
        this.image.style.cursor = "cell";
        break;
      case "move":
        this.image.style.cursor = this.zoom > 1 ? "grab" : "default";
        break;
    }
  }
}
