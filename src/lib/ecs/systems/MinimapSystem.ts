import Canvas from "src/lib/Canvas/DefaultCanvas";
import System from "src/lib/ecs/System";
import { Entity } from "src/lib/ecs/Entity";
import BoxComponent from "src/lib/ecs/components/BoxComponent";
import CircleComponent from "src/lib/ecs/components/CircleComponent";
import MinimapComponent from "src/lib/ecs/components/MinimapComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import ECS from "src/lib/ecs";

export default class MinimapSystem extends System {
  public readonly componentsRequired = new Set([MinimapComponent, PositionComponent]);

  protected readonly scale: number = 10;
  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;

  constructor(ecs: ECS, container: HTMLElement, level: Level) {
    super(ecs);

    const cols = level.map[0].length;
    const rows = level.map.length;

    this.container = container;

    this.canvas = new Canvas({
      id: 'minimap',
      height: rows * this.scale,
      width: cols * this.scale,
    }); 
  }

  start() {
    this.container.appendChild(this.canvas.element);
  }

  update(_: number, entities: Set<Entity>) {
    this.canvas.clear();
    this.canvas.drawBackground('green');

    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);
      const { x, y } = components.get(PositionComponent);
      const { color } = components.get(MinimapComponent);

      if (components.has(BoxComponent)) {
        const { size } = components.get(BoxComponent);

        this.drawSquare(x, y, size, color);
        return;
      }

      if (components.has(CircleComponent)) {
        const { radius } = components.get(CircleComponent);

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
