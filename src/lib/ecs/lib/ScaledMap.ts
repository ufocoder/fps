export class ScaledMap {
  public width: number;
  public height: number;
  public scale: number;
  public scaledWidth: number;
  public scaledHeight: number;

  private readonly data: Float64Array;

  constructor(width: number, height: number, scale = 1) {
    this.width = width;
    this.height = height;

    this.scale = scale;
    this.scaledWidth = Math.round(width * scale);
    this.scaledHeight = Math.round(height * scale);

    this.data = new Float64Array(this.scaledWidth * this.scaledHeight);
  }

  clean() {
    this.data.fill(0);
  }

  set(x: number, y: number, val: number) {
    const startY = Math.floor(y * this.scale);
    const endY = Math.ceil((y + 1) * this.scale);
    const startX = Math.floor(x * this.scale);
    const endX = Math.ceil((x + 1) * this.scale);

    for (let sy = startY; sy < endY; sy++) {
      for (let sx = startX; sx < endX; sx++) {
        this.data[sy * this.scaledWidth + sx] = Math.min(1, Math.max(0, val));
      }
    }
  }

  get(x: number, y: number) {
    const sx = Math.floor(x * this.scale);
    const sy = Math.floor(y * this.scale);
    const idx = sy * this.scaledWidth + sx;
    return idx >= 0 && idx < this.data.length ? this.data[idx] : 0;
  }

  setScaled(x: number, y: number, val: number) {
    const idx = Math.floor(y * this.scaledWidth + x);
    if (idx >= 0 && idx < this.data.length) {
      this.data[idx] = Math.min(1, Math.max(0, val));
    }
  }

  getScaled(x: number, y: number) {
    const idx = Math.floor(y * this.scaledWidth + x);
    return idx >= 0 && idx < this.data.length ? this.data[idx] : 0;
  }

  getInPercents(px: number, py: number) {
    const x = (px * this.scaledWidth) | 0;
    const y = (py * this.scaledHeight) | 0;
    const idx = y * this.scaledWidth + x;
    if (idx >= 0 && idx < this.data.length) return this.data[idx];
    return 0;
  }
}
