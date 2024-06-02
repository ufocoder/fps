import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AnimatedSpriteComponent from "src/lib/ecs/components/AnimatedSpriteComponent";
import CircleComponent from "src/lib/ecs/components/CircleComponent";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import PolarMap from "src/lib/ecs/lib/PolarMap";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import SpriteComponent from "src/lib/ecs/components/SpriteComponent";

export default class MapPolarSystem extends System {
  public readonly componentsRequired = new Set([PositionComponent]);
  public readonly polarMap: PolarMap = new PolarMap();

  start(): void {}

  update(_: number, entities: Set<Entity>) {
    const [player] = this.ecs.query([PlayerComponent, CircleComponent, PositionComponent]);

    const spriteContainers = [];

    for (const entity of entities) {
      if (
        this.ecs.getComponents(entity).has(AnimatedSpriteComponent) ||
        this.ecs.getComponents(entity).has(SpriteComponent)
      ) {
        spriteContainers.push(this.ecs.getComponents(entity));
      }
    }

    this.polarMap.center = this.ecs.getComponents(player);
    this.polarMap.entities = spriteContainers;
    this.polarMap.calculatePolarEntities();
  }

  destroy(): void {}
}
