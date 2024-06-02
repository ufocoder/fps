import { degreeToRadians } from "src/lib/utils";
import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import CollisionComponent from "src/lib/ecs/components/CollisionComponent";
import MapTextureSystem from "./MapTextureSystem";

export default class MoveSystem extends System {
  public readonly componentsRequired = new Set([PositionComponent, AngleComponent, MoveComponent, CollisionComponent]);

  start(): void {}

  destroy(): void {}

  update(dt: number, entities: Set<Entity>) {
    entities.forEach(entity => {
      this.move(dt, entity);
    });
  }

  protected move(dt: number, entity: Entity) {
    const components = this.ecs.getComponents(entity)
    const angleComponent = components.get(AngleComponent);
    const positionComponent = components.get(PositionComponent);
    const collisionComponent = components.get(CollisionComponent);
    const { mainDirection, sideDirection, moveSpeed } = components.get(MoveComponent);

    const m = Number(mainDirection);
    const s = Number(sideDirection) * (-1);

    if (m || s) {

      const textureMap = this.ecs.getSystem(MapTextureSystem)!.textureMap;

      const mainAngle = degreeToRadians(angleComponent.angle - 360);
      const mainCos = Math.cos(mainAngle);
      const mainSin = Math.sin(mainAngle);
      const sideAngle = degreeToRadians(angleComponent.angle - 90);
      const sideCos = Math.cos(sideAngle);
      const sideSin = Math.sin(sideAngle);

      const newX = positionComponent.x + (m * mainCos + s * sideCos) * moveSpeed * dt;
      const newY = positionComponent.y + (m * mainSin + s * sideSin) * moveSpeed * dt;

      if (newX <= 0 || newX > textureMap.cols) {
        return
      }

      if (newY <= 0 || newY > textureMap.rows) {
        return
      }

      if (!textureMap.has(Math.floor(newX), Math.floor(newY))) {
        positionComponent.y = newY;
        positionComponent.x = newX;
      } else {
        collisionComponent.collidedWith = 'texture';
        collisionComponent.isCollided = true;
      }
    }
  }
}
