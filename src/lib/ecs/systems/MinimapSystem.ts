import ECS from "src/lib/ecs";
import Canvas from "src/lib/Canvas/DefaultCanvas";
import System from "src/lib/ecs/System";
import { Entity } from "src/lib/ecs/Entity";
import BoxComponent from "src/lib/ecs/components/BoxComponent";
import CircleComponent from "src/lib/ecs/components/CircleComponent";
import MinimapComponent from "src/lib/ecs/components/MinimapComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
// import LightComponent from "src/lib/ecs/components/LightComponent.ts";
// import LightSystem from "src/lib/ecs/systems/LightSystem.ts";
import RenderSystem from "src/lib/ecs/systems/RenderSystem";

export default class MinimapSystem extends System {
  public readonly componentsRequired = new Set([MinimapComponent, PositionComponent]);

  protected readonly scale: number = 20;
  protected readonly canvas: Canvas;
  protected readonly offset: { top?: number, left?: number, bottom?: number, right?: number } = {top: 0, left: 0, bottom: 10, right: 20}
  protected readonly container: HTMLElement;

  constructor(ecs: ECS, container: HTMLElement, level: Level) {
    super(ecs);

    const cols = level.map[0].length;
    const rows = level.map.length;

    this.container = container;


    let style = 'z-index: 3;position: absolute;';
    if (this.offset.right) style += `right: ${this.offset.right}px;`;
    if (this.offset.top) style += `top: ${this.offset.top}px;`;
    if (this.offset.left) style += `left: ${this.offset.left}px;`;
    if (this.offset.bottom) style += `bottom: ${this.offset.bottom}px;`;
    this.canvas = new Canvas({
      id: 'minimap',
      height: rows * this.scale,
      width: cols * this.scale,
      style,
    });
  }

  start() {
    this.container.appendChild(this.canvas.element);
  }

  update(_: number, entities: Set<Entity>) {
    this.canvas.clear();
    this.canvas.drawBackground('green');

    const renderSystem = this.ecs.getSystem(RenderSystem)!;

    for (const entity of entities) {
      const components = this.ecs.getComponents(entity);
      const { color } = components.get(MinimapComponent);

      const renderer = renderSystem.mapEntityRenders.find(render => render.canRender(components!));
      if (renderer) {
        const edges = renderer.getArmature(components);
        this.drawPolygon(edges, color);
        continue;
      }

      const { x, y } = components.get(PositionComponent);
      if (components.has(BoxComponent)) {
        const { size } = components.get(BoxComponent);
        this.drawSquare(x, y, size, color);
      }

      if (components.has(CircleComponent)) {
        const { radius } = components.get(CircleComponent);
        this.drawCircle(x, y, radius, color);
      }
    }
  }

  destroy(): void {
    this.canvas.element.remove();
  }

  drawPolygon(paths: number[], color: string) {
    this.canvas.drawPolygon({
      paths: paths.map(point => point * this.scale),
      color,
    });
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
