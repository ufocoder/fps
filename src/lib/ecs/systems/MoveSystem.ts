import { degreeToRadians } from "src/lib/utils/angle";
import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import CollisionComponent from "src/lib/ecs/components/CollisionComponent";
import MapTextureSystem from "./MapTextureSystem";
import { ComponentContainer } from "src/lib/ecs/Component.ts";
import DoorComponent from "src/lib/ecs/components/DoorComponent.ts";

export default class MoveSystem extends System {
  public readonly componentsRequired = new Set([
    PositionComponent,
    AngleComponent,
    MoveComponent,
    CollisionComponent,
  ]);

  start(): void {}

  destroy(): void {}

  update(dt: number, entities: Set<Entity>) {
    entities.forEach((entity) => {
      this.move(dt, entity);
    });
  }

  protected move(dt: number, entity: Entity) {
    const components = this.ecs.getComponents(entity);
    const angleComponent = components.get(AngleComponent);
    const positionComponent = components.get(PositionComponent);
    const collisionComponent = components.get(CollisionComponent);
    const moveComponent = components.get(MoveComponent);

    const m = Number(moveComponent.mainDirection);
    const s = Number(moveComponent.sideDirection) * -1;

    if (m || s) {
      const mainAngle = degreeToRadians(angleComponent.angle - 360);
      const mainCos = Math.cos(mainAngle);
      const mainSin = Math.sin(mainAngle);

      const sideAngle = degreeToRadians(angleComponent.angle - 90);
      const sideCos = Math.cos(sideAngle);
      const sideSin = Math.sin(sideAngle);

      let newX =
        positionComponent.x +
        (m * mainCos + s * sideCos) * moveComponent.moveSpeed * dt;
      let newY =
        positionComponent.y +
        (m * mainSin + s * sideSin) * moveComponent.moveSpeed * dt;

      const { collidedX, collidedY, collidedWith } = this.getCollision(
        positionComponent,
        new PositionComponent(newX, newY),
      );

      const hasCollision = collidedX || collidedY;

      if (!hasCollision) {
        positionComponent.x = newX;
        positionComponent.y = newY;
        return;
      }

      if (collidedWith) {
        collisionComponent.collidedEntity = collidedWith;
        collisionComponent.isCollided = true;
      }

      if (moveComponent.canSlide) {
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

  private getCollision(
    currentPos: PositionComponent,
    nexPos: PositionComponent,
  ) {
    const textureMap = this.ecs.getSystem(MapTextureSystem)!.textureMap;

    let collidedWith: ComponentContainer | undefined = undefined;
    let collidedX = false;
    let collidedY = false;

    if (nexPos.x <= 0 || nexPos.x > textureMap.cols) {
      collidedX = true;
    }

    const collideWithTextureByX = textureMap.get(
      Math.floor(nexPos.x),
      Math.floor(currentPos.y),
    );

    if (collideWithTextureByX && this.isCollidedEntity(collideWithTextureByX)) {
      collidedX = true;
      collidedWith = collideWithTextureByX;
    }

    if (nexPos.y <= 0 || nexPos.y > textureMap.rows) {
      collidedY = true;
    }

    const collideWithTextureByY = textureMap.get(
      Math.floor(currentPos.x),
      Math.floor(nexPos.y),
    );
    if (collideWithTextureByY && this.isCollidedEntity(collideWithTextureByY)) {
      collidedY = true;
      collidedWith = collideWithTextureByY;
    }

    return { collidedX, collidedY, collidedWith };
  }

  private isCollidedEntity(entityContainer: ComponentContainer): boolean {
    const doorCmp = entityContainer.get(DoorComponent);
    if (doorCmp) return !doorCmp.isOpened;
    return true;
  }
}
