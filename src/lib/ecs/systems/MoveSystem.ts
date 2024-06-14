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
    const moveCmp = components.get(MoveComponent);

    const m = Number(moveCmp.mainDirection);
    const s = Number(moveCmp.sideDirection) * (-1);

    if (m || s) {
      const mainAngle = degreeToRadians(angleComponent.angle - 360);
      const mainCos = Math.cos(mainAngle);
      const mainSin = Math.sin(mainAngle);

      const sideAngle = degreeToRadians(angleComponent.angle - 90);
      const sideCos = Math.cos(sideAngle);
      const sideSin = Math.sin(sideAngle);

      let newX = positionComponent.x + (m * mainCos + s * sideCos) * moveCmp.moveSpeed * dt;
      let newY = positionComponent.y + (m * mainSin + s * sideSin) * moveCmp.moveSpeed * dt;

      const { collidedX, collidedY, collidedWith} = this.getCollision(positionComponent, new PositionComponent(newX, newY));


      const hasCollision = collidedX || collidedY;

      if (!hasCollision) {
        positionComponent.x = newX;
        positionComponent.y = newY;
        return;
      }

      if (collidedWith) {
         collisionComponent.collidedWith = collidedWith;
         collisionComponent.isCollided = true;
      }

      if (moveCmp.canSlide) {
        if (!collidedX) {
          positionComponent.x = newX;
        } else {
          newX = positionComponent.x;
        }

        if (!collidedY) {
          positionComponent.y = newY;
        } else {
          newY = positionComponent.y;
        }

        positionComponent.x = newX;
        positionComponent.y = newY;
      }
    }
  }

  private getCollision(currentPos: PositionComponent, nexPos: PositionComponent) {
    const textureMap = this.ecs.getSystem(MapTextureSystem)!.textureMap;

    let collidedWith = '';
    let collidedX = false;
    let collidedY = false;

    if (nexPos.x <= 0 || nexPos.x > textureMap.cols) {
      collidedX = true;
    }
    const collideWithTextureByX = textureMap.has(Math.floor(nexPos.x), Math.floor(currentPos.y));
    if (collideWithTextureByX) {
      collidedX = true;
      collidedWith = 'texture';
    }

    if (nexPos.y <= 0 || nexPos.y > textureMap.rows) {
      collidedY = true;
    }
    const collideWithTextureByY = textureMap.has(Math.floor(currentPos.x), Math.floor(nexPos.y));
    if (collideWithTextureByY) {
      collidedY = true;
      collidedWith = 'texture';
    }

    return { collidedX, collidedY, collidedWith };
  }
}
