import ECS from "src/lib/ecs/ExtendedECS";
import System from "src/lib/ecs/System";
import Canvas from "src/lib/Canvas/DefaultCanvas";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import WeaponComponent from "src/lib/ecs/components/WeaponComponent";
import SoundManager from "src/managers/SoundManager";

export default class UISystem extends System {
  public readonly componentsRequired = new Set([HealthComponent]);

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  public isMusicMuted: boolean = true;

  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;
  protected readonly musicControl: HTMLElement;
  protected readonly soundManager: SoundManager;

  constructor(ecs: ECS, container: HTMLElement, soundManager: SoundManager) {
    super(ecs);

    this.container = container;

    this.canvas = new Canvas({
      id: "ui",
      height: this.height,
      width: this.width,
    });

    this.musicControl = document.createElement("div");
    this.soundManager = soundManager;
  }

  start() {
    this.container.appendChild(this.canvas.element);
    this.canvas.element.requestPointerLock();
    this.initMusicControl();
    this.createListeners();
  }

  initMusicControl() {
    this.musicControl.textContent = "Music On";
    this.musicControl.classList.add("music");
    this.container.appendChild(this.musicControl);
  }

  updatemusicControl() {
    if (this.isMusicMuted) {
      this.soundManager.pauseBackground(this.soundManager.currentMusic);
    } else {
      this.soundManager.playBackground(this.soundManager.currentMusic); 
    }
    this.isMusicMuted = !this.isMusicMuted;
    this.musicControl.textContent = this.isMusicMuted
      ? "Music On"
      : "Music Off";
    
  }

  handleDocumentPressM = (e: KeyboardEvent) => {
    if (e.code === "KeyM") {
      this.updatemusicControl();
    }
  };

  createListeners() {
    document.addEventListener("keypress", this.handleDocumentPressM);
  }

  destroyListeners() {
    document.removeEventListener("keypress", this.handleDocumentPressM);
  }

  update() {
    const [player] = this.ecs.query([CameraComponent, HealthComponent]);
    const playerContainer = this.ecs.getComponents(player);

    if (!playerContainer) {
      return;
    }

    const health = playerContainer.get(HealthComponent);
    const weapon = playerContainer.get(WeaponComponent);

    this.canvas.clear();

    if (health) {
      this.canvas.drawText({
        x: 20,
        y: 30,
        text: health.current.toString(),
        color: "red",
        font: "24px serif",
      });
    }

    if (weapon) {
      this.canvas.drawText({
        x: 20,
        y: 60,
        text: weapon.bullets.toString(),
        color: "red",
        font: "24px serif",
      });
    }
  }

  destroy(): void {
    this.canvas.element.remove();
    this.musicControl.remove();
    this.destroyListeners();
  }
}
