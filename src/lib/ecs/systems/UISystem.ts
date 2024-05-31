import ECS from "src/lib/ecs/ExtendedECS";
import System from "src/lib/ecs/System";
import Canvas from "src/lib/Canvas/DefaultCanvas";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import WeaponComponent from "src/lib/ecs/components/WeaponComponent";

export default class UISystem extends System {
  public readonly componentsRequired = new Set([HealthComponent]);

  protected readonly width: number = 640;
  protected readonly height: number = 480;

  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;

  constructor(ecs: ECS, container: HTMLElement) {
    super(ecs);

    this.container = container;

    this.canvas = new Canvas({
      id: 'ui',
      height: this.height,
      width: this.width,
    });
  }

  start() {
    this.container.appendChild(this.canvas.element);
    this.canvas.element.requestPointerLock();
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
          color: 'red',
          font: '24px serif',
      });
    }

    if (weapon) {
      this.canvas.drawText({
        x: 20,
        y: 60,
        text: weapon.bullets.toString(),
        color: 'red',
        font: '24px serif',
     });
    }
  }

  destroy(): void {
    this.canvas.element.remove();
  }
}
