import ECS from "src/lib/ecs/ExtendedECS";
import System from "src/lib/ecs/System";
import Canvas from "src/lib/Canvas/DefaultCanvas";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import WeaponComponent from "src/lib/ecs/components/WeaponComponent";
import SoundManager from "src/managers/SoundManager";


const pauseControlKey = "KeyM";

export default class UISystem extends System {
  public readonly componentsRequired = new Set([HealthComponent]);

  protected readonly width: number = 640;
  protected readonly height: number = 480;

  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;
  protected readonly soundManager: SoundManager;

  constructor(ecs: ECS, container: HTMLElement, soundManager: SoundManager) {
    super(ecs);

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

    if (!playerContainer) {
      return;
    }

    const health = playerContainer.get(HealthComponent);
    const weapon = playerContainer.get(WeaponComponent);

    this.canvas.clear();

    this.canvas.drawText({
      x: this.width - 10,
      y: 30,
      text: this.soundManager.checkMuted() ? 'Music off' : 'Music on',
      color: 'grey',
      align: 'right',
      font: '18px serif',
    });

    if (health) {
      this.canvas.drawText({
        x: 20,
        y: 30,
        text: health.current.toString(),
        align: 'left',
        color: "red",
        font: "24px serif",
      });
    }

    if (weapon) {
      this.canvas.drawText({
        x: 20,
        y: 60,
        text: weapon.bulletTotal.toString(),
        align: 'left',
        color: 'red',
        font: '24px serif',
     });
    }
  }

  destroy(): void {
    this.canvas.element.remove();
    this.destroyListeners();
  }
}
