import ECS from "src/lib/ecs/ExtendedECS";
import System from "src/lib/ecs/System";
import Canvas from "src/lib/Canvas/DefaultCanvas";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import WeaponComponent from "src/lib/ecs/components/WeaponComponent";
import { lerp, minmax } from "src/lib/utils.ts";
import { LevelState } from "src/scenes/LevelScene";
import SoundManager from "src/managers/SoundManager";

const pauseControlKey = "KeyM";

export default class UISystem extends System {
  public readonly componentsRequired = new Set([HealthComponent]);

  protected readonly width: number = 640;
  protected readonly height: number = 480;

  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;
  protected readonly soundManager: SoundManager;
  protected readonly levelState: LevelState;

  private readonly icons = ['health', 'bullets', 'timer'];
  private iconsImages: Record<string, HTMLImageElement> = {};

  constructor(
      ecs: ECS,
      container: HTMLElement,
      soundManager: SoundManager,
      levelState: LevelState
  ) {
    super(ecs);

    this.levelState = levelState;
    this.container = container;

    this.canvas = new Canvas({
      id: "ui",
      height: this.height,
      width: this.width,
    });

    this.soundManager = soundManager;
  }

  start() {
    this.container.appendChild(this.canvas.element);
    this.canvas.element.requestPointerLock();
    this.createListeners();
    this.loadIcons();
  }

  private loadIcons() {
    for (const icon of this.icons) {
      const img = new Image();
      img.src = `/fps/assets/icons/${icon}.png`;
      this.iconsImages[icon] = img;
    }
  }

  toogleMusicControl() {
    if (this.soundManager.checkMuted()) {
      this.soundManager.unmute();
    } else {
      this.soundManager.mute();
    }
  }

  handleDocumentKeypress = (e: KeyboardEvent) => {
    if (e.code === pauseControlKey) {
      this.toogleMusicControl();
    }
  };

  createListeners() {
    document.addEventListener("keypress", this.handleDocumentKeypress);
  }

  destroyListeners() {
    document.removeEventListener("keypress", this.handleDocumentKeypress);
  }

  update() {
    const [player] = this.ecs.query([PlayerComponent]);
    const playerContainer = this.ecs.getComponents(player);
    if (!playerContainer) return;

    this.canvas.clear();

    this.canvas.drawText({
      x: this.width - 10,
      y: 30,
      text: this.soundManager.checkMuted() ? 'Music off' : 'Music on',
      color: 'grey',
      align: 'right',
      font: '18px serif',
    });

    const health = playerContainer.get(HealthComponent);
    if (health) this.drawHealth(health.current, { x: 10, y: 10 });

    const weapon = playerContainer.get(WeaponComponent);
    if (weapon) this.drawAmmo(weapon.bulletTotal, { x: 10, y: 40 });

    if (this.levelState.timerTimeLeft !== undefined) {
      this.drawTimer(this.levelState.timerTimeLeft, { x: this.canvas.width / 2 - 50, y: 10 });
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
    this.destroyListeners();
  }
}
