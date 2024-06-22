import Canvas from "src/lib/Canvas/DefaultCanvas";
import { lerp, minmax } from "src/lib/utils.ts";
import { PlayerState } from "src/scenes/LevelScene";

export default class LevelPlayerView { // Component not
  protected readonly width: number = 640;
  protected readonly height: number = 480;

  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;

  private readonly icons = ['health', 'bullets', 'timer'];
  private iconsImages: Record<string, HTMLImageElement> = {};

  constructor(
      container: HTMLElement,
  ) {
    this.container = container;

    this.canvas = new Canvas({
      id: "ui",
      height: this.height,
      width: this.width,
    });


    this.container.appendChild(this.canvas.element);
    this.loadIcons();
  }

  private loadIcons() {
    for (const icon of this.icons) {
      const img = new Image();
      img.src = `/fps/assets/icons/${icon}.png`;
      this.iconsImages[icon] = img;
    }
  }


  render(state: PlayerState) {

    this.canvas.clear();

    this.canvas.drawText({
      x: this.width - 10,
      y: 30,
      text: state.soundMuted ? 'Music off' : 'Music on',
      color: 'grey',
      align: 'right',
      font: '18px serif',
    });

    
    if (state.health) {
      this.drawHealth(state.health, { x: 10, y: 10 });
    }

    if (state.ammo) {
      this.drawAmmo(state.ammo, { x: 10, y: 40 });
    }

    if (state.timeLeft !== undefined) {
      this.drawTimer(state.timeLeft, { x: this.canvas.width / 2 - 50, y: 10 });
    }
  }

  drawHealth(healthValue: number, position: Vector2D) {
    const pulseSpeed = lerp(15,2, minmax(healthValue / 100, 0, 1));
    const angle = Date.now() / 1500 * pulseSpeed;
    const scale  =  0.6 + 0.4 * (.1 * Math.cos(angle) - 0.3 * Math.cos(4 * angle) + Math.abs(Math.cos(angle)))

    this.drawIcon('health', { x: position.x, y: position.y, width: 24, height: 24, scale });
    this.canvas.drawText({
      x: position.x + 30,
      y: position.y + 20,
      text: healthValue.toString(),
      align: 'left',
      color: "red",
      font: "24px serif",
    });
  }

  drawAmmo(bulletTotal: number, position: Vector2D) {
    this.drawIcon('bullets', { x: position.x, y: position.y, width: 24, height: 24 });
    this.canvas.drawText({
      x: position.x +30,
      y: position.y + 20,
      text: bulletTotal.toString(),
      align: 'left',
      color: 'white',
      font: '24px serif',
    });
  }

  drawTimer(time: number, position: Vector2D) {
    this.drawIcon('timer', { x: position.x, y: position.y, width: 24, height: 24 });
    this.canvas.drawText({
      x: position.x + 30,
      y: position.y + 20,
      text: time.toFixed(2),
      align: 'left',
      color: 'white',
      font: '24px serif',
    });
  }

  drawIcon(iconName: string, config: { x: number, y: number,  width: number, height: number, scale?: number }) {
    const scale = config.scale ?? 1;
    this.canvas.context.drawImage(
      this.iconsImages[iconName],
      config.x + (config.width / 2 * (1 - scale)),
      config.y + (config.height / 2 * (1 - scale)),
      config.width * scale,
      config.height * scale
    );
  }

  destroy(): void {
    this.canvas.element.remove();
  }
}
