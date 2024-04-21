import { degreeToRadians } from "src/lib/utils";
import Entity from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import CollisionComponent from "src/lib/ecs/components/CollisionComponent";

export default class MoveSystem implements System {
  components = [PositionComponent, MoveComponent, AngleComponent, RotateComponent];

  destroy(): void {}

  update(dt: number, entities: Entity[]) {
    entities.forEach(entity => {
      
      this.rotate(dt, entity);
      this.move(dt, entity);
    });
  }

  protected rotate(dt: number, entity: Entity) {
    const angleComponent = entity.getComponent(AngleComponent);
    const rotateComponent = entity.getComponent(RotateComponent);

    let k = 0;

    if (rotateComponent.direction.right) {
      k = 1;
    }

    if (rotateComponent.direction.left) {
      k = -1;
    }

    if (k) {
      angleComponent.angle = angleComponent.angle + k * rotateComponent.rotationSpeed * dt;
      angleComponent.angle %= 360;
    }
  }

  protected move(dt: number, entity: Entity) {
    const collisionComponent = entity.getComponent(CollisionComponent);

    if (collisionComponent?.isCollided) {
      return;
    }

    const angleComponent = entity.getComponent(AngleComponent);
    const positionComponent = entity.getComponent(PositionComponent);
    const moveComponent = entity.getComponent(MoveComponent);

    let k = 0;

    if (moveComponent.direction.forward) {
      k = 1;
    }

    if (moveComponent.direction.back) {
      k = -1;
    }

    if (k) {
      const playerCos = Math.cos(degreeToRadians(angleComponent.angle));
      const playerSin = Math.sin(degreeToRadians(angleComponent.angle));
      const newX = positionComponent.x + k * playerCos * moveComponent.moveSpeed * dt;
      const newY = positionComponent.y + k * playerSin * moveComponent.moveSpeed * dt;

      positionComponent.y = newY;
      positionComponent.x = newX;
    }
  }
}
