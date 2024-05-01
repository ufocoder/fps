import Canvas from "src/lib/Canvas/DefaultCanvas";
import System from "src/lib/ecs/System";
import Entity from "src/lib/ecs/Entity";
import BoxComponent from "src/lib/ecs/components/BoxComponent";
import ColorComponent from "src/lib/ecs/components/ColorComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import QuerySystem from "../lib/QuerySystem";

export default class MinimapSystem extends System {
  requiredComponents = [BoxComponent, PositionComponent, ColorComponent];

  readonly scale: number = 20;
  readonly canvas: Canvas;

  constructor(querySystem: QuerySystem, container: HTMLElement, level: Level) {
    super(querySystem);

    const cols = level.map[0].length;
    const rows = level.map.length;

    this.canvas = new Canvas({
      height: rows * this.scale,
      width: cols * this.scale,
    });

    container.appendChild(this.canvas.element);
  }

  update(_: number, entities: Entity[]) {
    this.canvas.clear();

    entities.forEach(entity => {
      const { x, y } = entity.getComponent(PositionComponent);
      const { color } = entity.getComponent(ColorComponent);
      const { size } = entity.getComponent(BoxComponent);
      
      this.drawSquare(x, y, size, color);
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
}
