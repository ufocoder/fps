import ECS from "src/lib/ecs";
import System from "src/lib/ecs/System";
import { ComponentContainer } from "src/lib/ecs/Component";
import PositionMap from "src/lib/ecs/lib/PositionMap";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import TextureComponent from "src/lib/ecs/components/TextureComponent";

export default class MapTextureSystem extends System {
  public readonly componentsRequired = new Set([
    PositionComponent,
    TextureComponent,
  ]);
  public readonly textureMap: PositionMap<ComponentContainer>;

  constructor(ecs: ECS, level: Level) {
    super(ecs);

    this.textureMap = new PositionMap<ComponentContainer>(level.map);
  }

  start(): void {
    this.ecs.query([PositionComponent, TextureComponent]).forEach((entity) => {
      const container = this.ecs.getComponents(entity);
      const position = container.get(PositionComponent);

      this.textureMap.set(
        Math.floor(position.x),
        Math.floor(position.y),
        container
      );
    });

    this.ecs.onComponentAdd(PositionComponent, (entity) => {
      const container = this.ecs.getComponents(entity);
      const position = container.get(PositionComponent);

      if (!container.has(TextureComponent)) {
        return;
      }

      this.textureMap.set(
        Math.floor(position.x),
        Math.floor(position.y),
        container
      );
    });

    this.ecs.onComponentRemove(PositionComponent, (entity) => {
      const container = this.ecs.getComponents(entity);
      const position = container.get(PositionComponent);

      if (!container.has(TextureComponent)) {
        return;
      }

      this.textureMap.reset(Math.floor(position.x), Math.floor(position.y));
    });
  }

  update() {}
  destroy(): void {}
}
