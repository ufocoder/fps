import Canvas from "src/lib/Canvas/DefaultCanvas";
import System from "src/lib/ecs/System";
import Entity from "src/lib/ecs/Entity";
import BoxComponent from "src/lib/ecs/components/BoxComponent";
import ColorComponent from "src/lib/ecs/components/MinimapComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import QuerySystem from "../lib/QuerySystem";
import MinimapComponent from "../components/MinimapComponent";
import CircleComponent from "../components/CircleComponent";
import CameraComponent from "../components/CameraComponent";

export default class MinimapSystem extends System {
  requiredComponents = [PositionComponent, MinimapComponent];

  readonly scale: number = 20;
  readonly canvas: Canvas;

  protected readonly container: HTMLElement;

  constructor(querySystem: QuerySystem, container: HTMLElement, level: Level) {
    super(querySystem);

    const cols = level.map[0].length;
    const rows = level.map.length;

    this.container = container;

    this.canvas = new Canvas({
      height: rows * this.scale,
      width: cols * this.scale,
    });
  }

  start() {
    this.container.appendChild(this.canvas.element);
  }

  update(_: number, entities: Entity[]) {
    this.canvas.clear();

    entities.forEach((entity) => {
      const { x, y } = entity.getComponent(PositionComponent);
      const { color } = entity.getComponent(ColorComponent);

      if (entity.hasComponent(CameraComponent)) {
        // @TODO: render rays
      }

      if (entity.hasComponent(BoxComponent)) {
        const { size } = entity.getComponent(BoxComponent);

        this.drawSquare(x, y, size, color);
        return;
      }

      if (entity.hasComponent(CircleComponent)) {
        const { radius } = entity.getComponent(CircleComponent);

        this.drawCircle(x, y, radius, color);
        return;
      }
    });
  }

  destroy(): void {
    this.canvas.element.remove();
  }

  drawSquare(x: number, y: number, size: number, color: string) {
    this.canvas.drawRect({
      x: x * this.scale,
      y: y * this.scale,
      width: size * this.scale,
      height: size * this.scale,
      color,
    });
  }

  drawCircle(x: number, y: number, radius: number, color: string) {
    this.canvas.drawCircle({
      x: x * this.scale,
      y: y * this.scale,
      radius: radius * this.scale,
      color,
    });
  }

}
