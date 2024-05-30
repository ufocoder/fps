import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import EnemyComponent from "src/lib/ecs/components/EnemyComponent";
import PolarMap from "src/lib/ecs/lib/PolarMap";

export default class MapPolarSystem extends System {
  public readonly componentsRequired = new Set([PositionComponent, EnemyComponent]);
  public readonly polarMap: PolarMap = new PolarMap();

  start(): void {}

  update(_: number, entities: Set<Entity>) {
    const [player] = this.ecs.query([CameraComponent]);

    const spriteContainers = [];
    for (const entity of entities) {
      spriteContainers.push(this.ecs.getComponents(entity));
    }

    this.polarMap.center = this.ecs.getComponents(player);
    this.polarMap.entities = spriteContainers;
    this.polarMap.calculatePolarEntities();
  }

  destroy(): void {}
}
